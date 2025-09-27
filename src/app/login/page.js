'use client';

import { useState } from 'react';
import Link from 'next/link';
import { auth } from '@/firebase'; // Apni firebase file se auth ko import karein
import { signInWithEmailAndPassword } from "firebase/auth"; // Is function ko import karein

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Firebase mein user ko sign in karein
      await signInWithEmailAndPassword(auth, email, password);
      alert('Logged in successfully!');
      // Login ke baad user ko dashboard par bhej sakte hain
      // window.location.href = '/dashboard';
    } catch (error) {
      // Agar koi error aaye to alert dikhayein
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login to GuildAcademy</h2>
        <form onSubmit={handleLogin}>
          {/* Form ka baaki hissa waisa hi rahega */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200">
            Login
          </button>
        </form>
        <p className="text-center mt-4">
          Don't have an account? <Link href="/signup" className="text-blue-500 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}