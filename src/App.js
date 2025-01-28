import React, { useState, useEffect } from 'react';
import { auth, getUserDocument } from './firebase.js';
import { onAuthStateChanged, signOut } from "firebase/auth";

import { AskBar } from './components/features/AskBar/AskBar';
import { ShortcutChange } from './components/features/ShortcutChange/ShortcutChange';
import { Subscribe } from './components/auth/Subscribe/Subscribe';
import { Login } from './components/auth/Login/Login';

function App() {
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  const fetchUserDetails = async (uid) => {
    const userDetails = await getUserDocument(uid);
    setUserDetails(userDetails);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserDetails(user.uid);
        setUser(user);
      } else {
        setUser(null);
        setUserDetails(null);
      }
    });

    // Set an interval to re-fetch user details every 12 hours
    const interval = setInterval(() => {
      if (user) {
        fetchUserDetails(user.uid);
      }
    }, 1000 * 60 * 60 * 12); // 12 hours in milliseconds

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [user]);




  const renderComponentsBasedOnUserStatus = () => {
    if (!userDetails) return null; // Or loading indicator

    const { paid, signUpDate } = userDetails;
    const currentDate = new Date();
    const signUpDateConverted = signUpDate.toDate();
    const allowedTrialEndDate = new Date(signUpDateConverted.getTime());
    allowedTrialEndDate.setDate(allowedTrialEndDate.getDate() + 7);

    if (paid === true || currentDate <= allowedTrialEndDate) {
      return (
        <>
          <ShortcutChange />
          <AskBar />
        </>
      );
    } else {
      return (
        <Subscribe setUser={setUser} />
      );
    }
  };

  return (
    <div>
      {!user ? (
        <Login />
      ) : (
        renderComponentsBasedOnUserStatus()
      )}
    </div>
  );
}

export default App;
