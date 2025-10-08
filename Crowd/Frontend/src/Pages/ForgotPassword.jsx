import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('✅ Password reset link sent successfully!', {
          position: 'top-center',
          autoClose: 3000,
        });

        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        toast.error(data.message || '❌ Failed to send reset link', {
          position: 'top-center',
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error('⚠️ Something went wrong. Try again later.', {
        position: 'top-center',
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      <div className="bg-white/12 shadow-md rounded-lg p-8 w-full max-w-md">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <span className="text-orange-500 text-3xl">⚡</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Forgot Password?
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-11px font-medium text-white mb-1"
            >
              Email Address
            </label>
            <div className="flex items-center border rounded-md px-3 py-2 mt-4">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full outline-none text-gray-100 bg-transparent"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition"
          >
            Reset Password
          </button>
        </form>

        {/* Back to login */}
        <div className="text-center mt-5">
          <Link to="/login" className="text-black font-semibold hover:underline text-sm">
            Back to Login
          </Link>
        </div>
      </div>

      {/* Toast container */}
      <ToastContainer />
    </div>
  );
};

export default ForgotPassword;
