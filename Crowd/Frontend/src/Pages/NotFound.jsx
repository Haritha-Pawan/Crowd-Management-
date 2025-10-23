import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="relative min-h-[100svh] w-full">
      {/* Background image */}
      <img
        src="https://sridaladamaligawa.lk/wp-content/uploads/2020/09/Octagan-Thumbnail-2-768x432.jpg"
        alt="Sri Dalada Maligawa"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Centered content */}
      <div className="relative z-10 h-[100svh] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          <div className="text-white/90 tracking-widest text-sm mb-2">ERROR</div>
          <h1 className="text-white text-8xl md:text-9xl font-extrabold leading-none">
            404
          </h1>
          <p className="mt-3 text-white/80 text-base md:text-lg">
            Sorry, the page you’re looking for doesn’t exist.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              to="/"
              className="px-5 py-2.5 rounded-lg bg-white text-black font-medium hover:opacity-90"
            >
              Go Home
            </Link>
            <Link
              to="/contact"
              className="px-5 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20"
            >
              Contact
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
