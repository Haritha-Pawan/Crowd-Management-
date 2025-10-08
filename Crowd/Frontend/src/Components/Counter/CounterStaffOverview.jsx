import React, { useEffect, useMemo, useState } from 'react';
import { User, Users, LoaderPinwheel, UserCheck, Clock1, ScanLineIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import AttendeeGrid from "../Counter/AttendeeGrid.jsx";

const API = import.meta.env.VITE_LANDING_API || "http://localhost:3001/api/checkout";

function fmt(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x.toLocaleString() : "0";
}

const CounterStaffOverview = () => {
  const [stats, setStats] = useState({ total: 0, checkedIn: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function fetchStats() {
    try {
      setErr("");
      const res = await fetch(`${API}/stats`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || `Error ${res.status}`);
      setStats(json);
    } catch (e) {
      setErr(e.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, 5000); // refresh every 5s
    return () => clearInterval(id);
  }, []);

  const pctPending = useMemo(() => {
    if (!stats.total) return 0;
    return Math.round((stats.pending / stats.total) * 100);
  }, [stats]);

  const cards = [
  { title: "Total Attendees", icon: <Users color="#2f80ed" />, count: fmt(stats.total), summary: "" },
  { title: "Checked In",      icon: <UserCheck color="#4ade80" />, count: fmt(stats.checkedIn), summary: "" },
  { 
    title: "Pending",         
    icon: <Clock1 color="#facc15" />, 
    count: `${fmt(pctPending)}%`,        // show percentage
    summary: `${fmt(stats.pending)} attendees pending` // show raw count in subtitle
  },
  { title: "Checkout",        icon: <LoaderPinwheel color="#c084fc" />, count: "—", summary: "Food courts & stalls" },
];


  return (
    <div className='p-12 h-screen'>
      <div className='w-full bg-white/10 border border-white/5 rounded-md p-6'>
        <div className='flex justify-between'>
          <div className='flex flex-col'>
            <div className="text-white text-3xl font-bold">Counter Staff Dashboard</div>
            <div className="text-white">Manage attendee check-ins with QR scanning</div>
          </div>
          <Link to="/QRScanner">
            <div className='flex'>
              <div className="text-white font-bold w-40 flex justify-center items-center rounded-md gap-4 hover:opacity-70 h-10 bg-gradient-to-r from-blue-500 to-purple-600 cursor-pointer">
                <ScanLineIcon size={20}/>QR Scanner
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Cards */}
      <div className="card mt-8 xl:grid grid-cols-4 xl:grid-cols-4 gap-18 mx-auto ">
        {cards.map((c, i) => (
          <div key={i} className="users bg-white/5 border-white/10 p-5 text-white font-bold rounded-md w-58">
            <div className="icon flex justify-between">
              <div className="title text-[18px] ">{c.title}</div>
              <div className="icon">{c.icon}</div>
            </div>
            <div className="count text-2xl mt-1">
              {loading ? "…" : c.count}
            </div>
            <div className="summary mt-1 text-[14px] font-normal text-gray-300">
              {err ? <span className="text-red-300">{err}</span> : c.summary}
            </div>
          </div>
        ))}
      </div>

      {/* Attendee list section (kept) */}
      <div className='w-full bg-white/10 border border-white/5 rounded-md p-6 mt-10'>
        <AttendeeGrid />
      </div>
    </div>
  );
};

export default CounterStaffOverview;
