import React from 'react';
import { auth } from '../../../firebase.js';
import { signOut } from "firebase/auth";

export const Subscribe = ({ setUser }) => { 

    const handleSignOut = () => {
        signOut(auth).then(() => {
          setUser(null);
        }).catch((error) => {
          console.error("Sign out error:", error);
        });
    };

    const openLink = (url) => {
        const user = auth.currentUser;
        if (user) {
            const userId = user.uid;
            const modifiedUrl = url.replace('{userId}', userId);

            console.log(modifiedUrl)
            window.open(modifiedUrl, '_blank');
        } else {
            console.log("No user signed in.");
        }
    };

    return (
        <div className="p-36 h-screen w-full bg-white rounded-md shadow-md flex flex-col items-center justify-center">
            <div className="text-4xl mb-5  text-gray-800">
                Your free trial has ended
            </div>
            <h2 className="mb-10 text-md text-gray-800 text-center">
                To continue using Airlight, click the button below to buy now for lifetime access.
            </h2>
            <div className="flex justify-center flex-col w-full max-w-md">

            <button
                className="px-4 py-2 text-white bg-black rounded-md hover:bg-neutral-600"
                onClick={() => openLink(`https://airlight.pro/upgrade?userId={userId}`)}
                >
                Buy now
                </button>
                <button
                className="text-blue-600 hover:text-blue-800 mt-7 hover:underline "
                onClick={handleSignOut}
                >
                Go to Sign in
                </button>
            </div>
        </div>
    );
};
