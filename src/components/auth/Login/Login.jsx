import React, { useState } from 'react';
import { auth } from '../../../firebase.js';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [showResetStatus, setShowResetStatus] = useState(false);
  const [resetError, setResetError] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(null);

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No user found with this email address.';
      case 'auth/invalid-email':
        return 'Email address is not valid.';
      case 'auth/invalid-credential':
        return 'Incorrect password or email. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/email-already-in-use':
        return 'Email is already in use with another account.';
      // Add more cases as needed
      default:
        return 'Login failed. Please try again.';
    }
  };

  const login = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoginError(null);
    } catch (error) {
      const friendlyMessage = getErrorMessage(error.code);
      setLoginError(friendlyMessage);
    }
  };

  const resetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, forgotPasswordEmail);
      setResetSuccess('Reset password link sent. Please check your email.');
      setShowResetStatus(true);
      setResetError(null);
    } catch (error) {
      setResetSuccess(null);
      const friendlyMessage = getErrorMessage(error.code);
      setResetError(friendlyMessage);
    }
  };


  const openLink = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="p-44 h-screen w-full bg-white rounded-md shadow-md">

    <div className='flex flex-col justify-center items-center'>
    <h2 className="text-3xl  mb-7">Sign in to your account</h2>
      <form onSubmit={login}>
        <input
          type="email"
          className="w-full px-4 py-2 mb-4 border rounded-md"
          placeholder="Name@address.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full px-4 py-2 mb-4 border rounded-md"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full mt-2 px-4 py-2 text-white bg-black rounded-md hover:bg-neutral-600"
        >
          Sign in
        </button>
      </form>

    </div>
      
  
      <div className='mt-5 flex justify-between items-center px-5'>
      <button
        className=" text-blue-600 hover:text-blue-800"
        onClick={() => setResetSuccess((prev) => !prev)}
      >
        Forgot Password?
      </button>
     
        <button
          className=" text-blue-600 hover:text-blue-800"
          onClick={() => openLink('https://airlight.pro/signup')}
        >
          Need to create an account?
        </button>
      </div>

      {resetSuccess && (
        <div className='px-5 mt-2'>
          <input
            type="email"
            className="w-full px-4 py-2 mt-4 border rounded-md"
            placeholder="Enter your email"
            value={forgotPasswordEmail}
            onChange={(e) => setForgotPasswordEmail(e.target.value)}
          />
          <button
            className="px-4 py-2 text-white bg-black rounded-md hover:bg-neutral-700 mt-5"
            onClick={resetPassword}
          >
            Send reset email
          </button>
        </div>
      )}
      {loginError && (
        <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline">{loginError}</span>
        </div>
      )}
      {resetError && (
        <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Reset Error!</strong>
          <span className="block sm:inline">{resetError}</span>
        </div>
      )}
      {resetSuccess && showResetStatus && (
        <div className="mt-4 p-2 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline">{resetSuccess}</span>
        </div>
      )}
    </div>
  );
};
