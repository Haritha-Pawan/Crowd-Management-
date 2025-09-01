import React, { useId } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { MapPin, Car, Info, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

/* ---------- Reusable Donut (centered text overlay) ---------- */
const getColorsByValue = (value) => {
  if (value >= 70) return { progress: "#22c55e", trail: "rgba(34,197,94,0.20)" };  // green-500
  if (value >= 40) return { progress: "#f59e0b", trail: "rgba(245,158,11,0.20)" }; // amber-500
  return { progress: "#ef4444", trail: "rgba(239,68,68,0.20)" };                    // red-500
};

const ProgressDonut = ({ value = 70, subtitle = "Available", size = 220 }) => {
  const colors = getColorsByValue(value);
  const gradId = useId(); // unique per instance
  const data = [
    { name: "Progress", value },
    { name: "Remaining", value: Math.max(0, 100 - value) },
  ];

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      {/* Centered overlay text (always inside the circle) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-white font-bold text-3xl leading-none">{value}%</span>
        <span className="text-slate-300 text-xs mt-1">{subtitle}</span>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            <linearGradient id={`progressGradient-${gradId}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={colors.progress} />
              <stop offset="100%" stopColor="#38bdf8" /> {/* sky-400 accent */}
            </linearGradient>
          </defs>

          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="62%"
            outerRadius="80%"
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            isAnimationActive
            animationDuration={900}
            stroke="none"
          >
            <Cell fill={`url(#progressGradient-${gradId})`} />
            <Cell fill={colors.trail} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* soft glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full blur-2xl"
        style={{ boxShadow: "0 0 40px rgba(56,189,248,0.18)" }}
      />
    </div>
  );
};

/* ---------- Zone Card ---------- */
const ZoneCard = ({ name, available, total, updatedAt, onView }) => {
  const percent = Math.max(0, Math.min(100, Math.round((available / total) * 100)));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md
                    p-5 hover:bg-white/10 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-sky-300" />
          <h3 className="text-white text-lg font-semibold">{name}</h3>
        </div>
        <span className="text-[11px] text-gray-300 flex items-center gap-1">
          <Info size={14} /> Updated {updatedAt}
        </span>
      </div>

      <div className="flex justify-center">
        <ProgressDonut value={percent} subtitle="Available" size={220} />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
          <div className="text-2xl font-bold text-white">{available}</div>
          <div className="text-xs text-gray-300">Available</div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
          <div className="text-2xl font-bold text-white">{total - available}</div>
          <div className="text-xs text-gray-300">Reserved</div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
          <div className="text-2xl font-bold text-white">{total}</div>
          <div className="text-xs text-gray-300">Capacity</div>
        </div>
      </div>


<Link to='/zone'>

      <button
        onClick={onView}
        className="group mt-6 w-full inline-flex items-center justify-center gap-2
                   bg-gradient-to-r from-sky-500 to-emerald-500
                   hover:from-sky-400 hover:to-emerald-400
                   text-white py-2.5 rounded-xl font-medium"
      >
        <Car size={18} />
        View Spots
        <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5" />
      </button>

     </Link> 


    </div>
  );
};

/* ---------- Page ---------- */
const ParkingZone = () => {
  const zones = [
    { name: "Kandy",   available: 56, total: 80, updatedAt: "2 min ago" },
    { name: "Bogambara", available: 22, total: 60, updatedAt: "Just now" },
    { name: " Weediya",   available: 44, total: 70, updatedAt: "5 min ago" },
    { name: "zone-2",  available: 12, total: 40, updatedAt: "1 min ago" },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(59,130,246,0.15),transparent),radial-gradient(1200px_600px_at_90%_10%,rgba(16,185,129,0.12),transparent)] 
                    bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <header className="mb-6">
          <h1 className="text-white text-3xl md:text-4xl font-bold">Parking Zones</h1>
          <p className="text-white/70 text-sm md:text-base mt-1">
            Real-time parking availability and reservation system
          </p>
        </header>

        <div className="text-center mt-2 text-white text-2xl font-semibold">
          Choose Your Location
        </div>
        <div className="text-center mt-1 text-gray-300 text-sm md:text-base font-medium">
          Select a parking area to view available spots in real-time
        </div>

        <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {zones.map((z) => (
            <ZoneCard
              key={z.name}
              name={z.name}
              available={z.available}
              total={z.total}
              updatedAt={z.updatedAt}
              onView={() => console.log("View spots →", z.name)}
            />
          ))}
        </section>
      </div>
    </div>
  );
};

export default ParkingZone;
