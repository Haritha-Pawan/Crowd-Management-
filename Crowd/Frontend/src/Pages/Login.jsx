import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import assets from '../assets/assets.js';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const colors = {
    ctaFrom: "from-indigo-600",
    ctaTo: "to-blue-600",
    ring: "focus:ring-2 focus:ring-indigo-500",
    border: "border-white/15",
    fieldBg: "bg-white/8",
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } }
  };

  const validate = () => {
    let tempErrors = {};
    if (!email) tempErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) tempErrors.email = "Email is invalid";
    if (!password) tempErrors.password = "Password is required";
    else if (password.length < 6) tempErrors.password = "Password must be at least 6 characters";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await axios.post("http://localhost:5000/auth", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      

      //sessionStorage.setItem("user", JSON.stringify(res.data.user));n
        sessionStorage.setItem("coodinatorName",res.data.user.username);
        sessionStorage.setItem("coodinatorEmail",res.data.user.email);

      const role = res.data.user.role;
      if (role === "admin") navigate("/admin");
      else if (role === "organizer") navigate("/organizer/Organizer");
      else if (role === "Attendee") navigate("/attendee");
      else if (role === "Coordinator") navigate("/Coordinator");
      else if (role === "Staff") navigate("/counterStaff");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen relative">
      <img
        src="https://sridaladamaligawa.lk/wp-content/uploads/2020/09/Main-entrnce-Thumbnail-1-768x432.jpg"
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/55" />

      <header className="absolute top-0 inset-x-0 z-20">
        <nav className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
          <Link
            to="/"
            className="text-white/90 hover:text-white px-3 py-2 rounded-md hover:bg-white/10 transition"
          >
            ← Back to Home
          </Link>
        </nav>
      </header>

      <main className="relative z-10 min-h-screen flex items-center justify-center px-6 py-16">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="w-full max-w-md bg-white/10 border border-white/15 rounded-2xl p-8 md:p-9 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.35)] text-white"
        >
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/15 grid place-items-center mb-4">
              <img src={assets.card2} alt="Event" className="w-10 h-10 object-contain" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Event Login</h1>
            <p className="text-white/80 text-sm mt-1">
              Sign in to manage your tickets and get your QR code
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-white/90 block mb-1">Email Address *</label>
              <input
                type="email"
                placeholder="you@example.com"
                className={`w-full ${colors.fieldBg} ${colors.border} ${colors.ring} text-white placeholder:text-white/50 border rounded-md px-3 py-2.5 outline-none`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p className="text-rose-300 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-sm text-white/90 block mb-1">Password *</label>
              <input
                type="password"
                placeholder="••••••••"
                className={`w-full ${colors.fieldBg} ${colors.border} ${colors.ring} text-white placeholder:text-white/50 border rounded-md px-3 py-2.5 outline-none`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <p className="text-rose-300 text-xs mt-1">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-white/80 select-none">
                <input
                  type="checkbox"
                  className="appearance-none h-4 w-4 rounded border border-white/30 bg-white/5 checked:bg-white/90 checked:border-white/90 focus:outline-none"
                />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="text-white/80 hover:text-white underline underline-offset-4"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="text-rose-200 text-sm bg-rose-900/30 border border-rose-400/30 px-3 py-2 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              className={`w-full font-semibold text-white px-4 py-2.5 rounded-lg bg-gradient-to-r ${colors.ctaFrom} ${colors.ctaTo} hover:brightness-110 transition`}
            >
              Login
            </button>

            <div className="text-center mt-5">
              <span className="text-sm text-white/80">
                Don’t have an account?{" "}
              </span>
              <Link
                to="/register"
                className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
              >
                Register here
              </Link>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}

export default Login;
