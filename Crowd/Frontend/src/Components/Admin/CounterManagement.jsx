// src/pages/CounterManagement.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  LocationEditIcon,
  LocateIcon,
  TrendingUp,
  Users,
  Edit,
  Trash2Icon,
} from "lucide-react";
import AddCounter from "./AddCounter"; 
import EditCounter from "./EditCounter";
const API = "http://localhost:5000/api";

const CounterManagement = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [counters, setCounters] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // ---- summary cards from live data ----
  const total = counters.length;
  const active = counters.filter((c) => c.isActive !== false).length; // default true
  const totalCapacity = counters.reduce((s, c) => s + (+c.capacity || 0), 0);
  const loadSum = counters.reduce((s, c) => s + (+c.load || 0), 0);
  const loadPct = totalCapacity ? Math.round((loadSum / totalCapacity) * 100) : 0;

  const cards = useMemo(
    () => [
      { title: "Total Counters", icon: <LocationEditIcon color="#2f80ed" size={30} />, count: String(total) },
      { title: "Active Counters", icon: <LocateIcon color="#4ade80" size={30} />, count: String(active) },
      { title: "Total Capacity", icon: <Users color="#facc15" size={30} />, count: String(totalCapacity) },
      
    ],
    [total, active, totalCapacity, loadPct]
  );

  // ---- load data ----
  useEffect(() => {
    (async () => {
      const { data } = await axios.get(`${API}/counter`);
      setCounters(data);
    })();
  }, []);

  // ---- create / delete / (edit hook placeholder) ----
  const handleCreated = (newCounter) => setCounters((prev) => [newCounter, ...prev]);

  const removeCounter = async (id) => {
    await axios.delete(`${API}/counter/${id}`);
    setCounters((prev) => prev.filter((c) => c._id !== id));
  };

  return (
    <div className="p-12 2xl:h-screen">
      <div className="header text-white text-3xl font-bold">Counter Management</div>
      <div className="sub-heading text-gray-300 text-xl">Monitor and manage all system components</div>

      {/* Cards */}
      <div className="card grid 2xl:grid-cols-4 lg:grid-cols-4 mt-8 md:grid-cols-2 gap-3 mx-auto">
        {cards.map((c, i) => (
          <Card key={i} title={c.title} icon={c.icon} count={c.count} />
        ))}
      </div>

      {/* Add Counter */}
      <button
        onClick={() => setIsPopupOpen(true)}
        className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 px-10 cursor-pointer font-medium mt-5 rounded-md hover:opacity-70 text-white"
      >
        + Add Counter
      </button>

      {/* Modal (uses the AddCounter from earlier) */}
      {isPopupOpen && (
        <AddCounter
          onClose={() => setIsPopupOpen(false)}
    onCreate={(newCounter) => setCounters((prev) => [newCounter, ...prev])}
        />
      )}

      {/* Counter list */}
      <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {counters.map((c) => {
          const pct = c.capacity ? Math.min(100, Math.round(((+c.load || 0) / (+c.capacity || 1)) * 100)) : 0;
          return (
            <div key={c._id} className="p-5 bg-white/5 border border-white/10 rounded-md text-white text-2xl font-medium">
              <div className="title flex justify-between items-start">
                <span>{c.name}</span>
                <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-200">{c.status}</span>
              </div>

              <div className="sub-heading flex mt-2 text-gray-300 items-center gap-2 text-sm">
                <LocationEditIcon size={18} />
                <div>{c.entrance}</div>
              </div>

              {/* Details */}
              <div className="mt-3 text-sm text-gray-300 space-y-1">
                <div>Capacity: <span className="text-white font-medium">{c.capacity}</span></div>
                <div>Current Load: <span className="text-white font-medium">{c.load}</span></div>
                <div>Assigned Staff: <span className="text-white/90">{c.staff || "—"}</span></div>
              </div>

              {/* Actions */}
              <div className="btn mt-4 flex gap-3">
               <button
                  onClick={() => { setSelected(c); setEditOpen(true); }}
                  className="border border-white/10 px-4 py-1 bg-white/5 rounded-md text-[16px] cursor-pointer text-white">
                  <Edit size={15} className="inline mr-2 relative top-[1px]" />
                    Edit
                </button>
                <button
                  onClick={() => removeCounter(c._id)}
                  className="border border-white/10 px-4 py-1 bg-white/5 rounded-md text-[16px] cursor-pointer text-red-400"
                >
                  <Trash2Icon size={15} className="inline mr-2 relative top-[1px]" />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {editOpen && (
        <EditCounter
          isOpen={editOpen}
          counter={selected}
          onClose={() => setEditOpen(false)}
          onUpdated={(updated) =>
            setCounters(prev => prev.map(x => (x._id === updated._id ? updated : x)))
          }
  />
)}
    </div>
  );
};

function Card({ title, icon, count }) {
  return (
    <div className="bg-white/5 border border-white/10 text-white rounded-md p-5">
      <div className="flex justify-between">
        <div className="text-[18px]">{title}</div>
        <div className="relative top-5">{icon}</div>
      </div>
      <div className="text-2xl mt-1 font-bold">{count}</div>
    </div>
  );
}

export default CounterManagement;
