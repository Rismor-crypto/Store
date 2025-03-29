// LoginPage.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { sendMagicLink, isAuthenticated, authError } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setMessage('Please enter a valid email address');
      return;
    }
    
    setMessage('Sending magic link...');
    
    const { success, error } = await sendMagicLink(email);
    
    if (success) {
      setMessage(`Magic link sent to ${email}. Please check your email.`);
    } else {
      setMessage(`Error: ${error}`);
    }
  };
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
        
        {authError && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {authError}
          </div>
        )}
        
        {message && (
          <div className={`${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'} p-3 rounded mb-4`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@example.com"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
          >
            Send Magic Link
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
