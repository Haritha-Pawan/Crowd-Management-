import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// 🔑 Use the environment variable for the deployed backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const naviaget = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Password validation
    if (!password || !confirmPassword) {
      setError("Both password fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      // 🟢 CORRECTED FETCH URL
      const response = await fetch(`${API_BASE_URL}/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('🔐 Password reset successful!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setTimeout(() => {
          naviaget('/login');
        }, 3000);
      } else {
        toast.error(data.message || "Password reset failed");
      }
    } catch (err) {
      toast.error("Failed to reset password. Please try again.");
    }
  };
  return (
    // ... rest of the JSX ...
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      <ToastContainer />
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <link rel="stylesheet" href="/logo.png" />
        </div>

        {/* Title */}
        <h2 className="text-center text-xl font-semibold text-gray-700 mb-6">
          Enter Your New Password
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-500 text-sm">{message}</p>}

          <button
            type="submit"
            className="w-full bg-green-500 text-white font-semibold py-2 rounded-md hover:bg-green-600 transition"
          >
            Reset and Log In
          </button>
        </form>

        {/* Link to Login */}
        <div className="text-center mt-5 text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/Login" className="text-blue-500 hover:underline">
            Log In
          </Link>
        </div>

        {/* Footer links */}
        <div className="text-center mt-5 text-xs text-gray-500">
          <Link to="#" className="hover:underline">
            Security Safeguards
          </Link>{" "}
          |{" "}
          <Link to="#" className="hover:underline">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;