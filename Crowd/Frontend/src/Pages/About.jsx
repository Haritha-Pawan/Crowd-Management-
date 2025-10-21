import React from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { Play } from "lucide-react";

const AboutUs = () => {
  const stats = [
    { value: 5000, label: "Registered Passengers" },
    { value: 1200, label: "Bus Owners" },
    { value: 300, label: "Active Routes" },
    { value: 50, label: "Cities Covered" },
  ];

  return (
    <div className="min-h-screen  text-white overflow-hidden">
      <section className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
        {/* LEFT SECTION */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="space-y-8"
        >
          {/* Headings */}
          <p className="uppercase text-sm tracking-widest text-blue-700">
            Our Story
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight text-amber-300">
            Empowering <span className=" text-blue-700">Smart Mobility</span>
            <br />
            for a <span className=" text-blue-600">Safer Tomorrow</span>
          </h2>

          {/* Main Large Image */}
          <motion.img
            src="https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=800&q=80"
            alt="CrowdFlow Team"
            className="rounded-2xl shadow-xl w-full h-[350px] object-cover"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>

        {/* RIGHT SECTION */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="flex flex-col gap-8"
        >
          {/* Top two small images */}
          <div className="grid grid-cols-2 gap-4">
            <motion.img
              src="https://images.unsplash.com/photo-1600880292089-90e6a0e7a1c5?auto=format&fit=crop&w=600&q=80"
              alt="Smart Transport"
              className="rounded-2xl shadow-lg h-[160px] w-full object-cover"
              whileHover={{ scale: 1.05 }}
            />
            <motion.img
              src="https://images.unsplash.com/photo-1598257006626-48b0c252070d?auto=format&fit=crop&w=600&q=80"
              alt="Team Collaboration"
              className="rounded-2xl shadow-lg h-[160px] w-full object-cover"
              whileHover={{ scale: 1.05 }}
            />
          </div>

          {/* Description */}
          <p className="text-black leading-relaxed">
            CrowdFlow is transforming Sri Lanka’s public transport and crowd
            management. Passengers can easily track buses, book seats, and view
            real-time movement — while organizers and bus owners gain insights,
            route analytics, and total visibility over operations.
          </p>

          {/* Animated Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center my-6">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center"
              >
                <h3 className="text-3xl font-bold text-blue-700">
                  <CountUp end={s.value} duration={3} />+
                </h3>
                <p className="text-sm text-gray-400 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Watch Intro Section */}
          <div className="flex items-center gap-6 mt-6">
            {/* Team Avatars */}
            <div className="flex -space-x-3">
              {[
                "https://randomuser.me/api/portraits/women/45.jpg",
                "https://randomuser.me/api/portraits/men/46.jpg",
                "https://randomuser.me/api/portraits/women/47.jpg",
              ].map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt="Team member"
                  className="w-10 h-10 rounded-full border-2 border-white"
                />
              ))}
            </div>

            {/* Play Button */}
            <button className="flex items-center gap-3 text-white hover:text-teal-400 transition">
              <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center hover:bg-teal-600 transition">
                <Play className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold tracking-wide">
                Watch Intro
              </span>
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default AboutUs;
