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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

  const API = "https://crowd-management-api.onrender.com/api";


const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const normalizeCounter = (counter) => {
  if (!counter) return counter;

  const assignedLoad = toNumber(counter.assignedLoad ?? counter.load ?? 0);
  const scanLoad = toNumber(
    counter.loadFromScanLogs ??
      counter.scanStats?.totalAttendees ??
      counter.load ??
      0
  );
  const totalScans = toNumber(counter.scanStats?.totalScans ?? 0);

  return {
    ...counter,
    assignedLoad,
    loadFromScanLogs: scanLoad,
    scanStats: {
      totalAttendees: scanLoad,
      totalScans,
      lastScanAt: counter.scanStats?.lastScanAt ?? null,
    },
  };
};

const getLiveLoad = (counter) =>
  toNumber(
    counter?.loadFromScanLogs ??
      counter?.scanStats?.totalAttendees ??
      counter?.assignedLoad ??
      counter?.load ??
      0
  );

const getAssignedLoad = (counter) =>
  toNumber(counter?.assignedLoad ?? counter?.load ?? 0);

const CounterManagement = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [counters, setCounters] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // ---- summary cards from live data ----
  const total = counters.length;
  const active = counters.filter((c) => c.isActive !== false).length; // default true
  const totalCapacity = counters.reduce((sum, c) => sum + toNumber(c.capacity), 0);
  const loadSum = counters.reduce((sum, c) => sum + getLiveLoad(c), 0);
  const loadPct = totalCapacity ? Math.round((loadSum / totalCapacity) * 100) : 0;

  const cards = useMemo(
    () => [
      { title: "Total Counters", icon: <LocationEditIcon color="#2f80ed" size={30} />, count: String(total) },
      { title: "Active Counters", icon: <LocateIcon color="#4ade80" size={30} />, count: String(active) },
      { title: "Total Capacity", icon: <Users color="#facc15" size={30} />, count: String(totalCapacity) },
      { title: "Current Load", icon: <TrendingUp color="#c084fc" size={30} />, count: `${loadPct}%` },
    ],
    [total, active, totalCapacity, loadPct]
  );

  // ---- load data ----
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API}/counter?includeScanLoad=true`);
        setCounters(Array.isArray(data) ? data.map(normalizeCounter) : []);
      } catch (err) {
        console.error("GET /api/counter failed:", err);
      }
    })();
  }, []);

  // ---- create / delete / (edit hook placeholder) ----
  const handleCreated = (newCounter) => {
    if (!newCounter) return;
    setCounters((prev) => [normalizeCounter(newCounter), ...prev]);
  };

  const removeCounter = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this counter?");
    if (!ok) return;
    await axios.delete(`${API}/counter/${id}`);
    setCounters((prev) => prev.filter((c) => c._id !== id));
  };

  const downloadReport = () => {
    if (!counters.length) {
      window.alert("No counter data available to export.");
      return;
    }

    const doc = new jsPDF({ orientation: "landscape" });
    const generatedAt = new Date();

    doc.setFontSize(16);
    doc.text("Counter Management Report", 14, 16);

    doc.setFontSize(10);
    doc.text(`Generated: ${generatedAt.toLocaleString()}`, 14, 24);
    doc.text(
      `Total Counters: ${counters.length} | Active: ${active} | Total Capacity: ${totalCapacity} | Current Load: ${loadSum}`,
      14,
      30
    );

    const body = counters.map((c, index) => {
      const liveLoad = getLiveLoad(c);
      const assignedLoad = getAssignedLoad(c);
      const capacity = toNumber(c.capacity);
      const pct = capacity ? Math.min(100, Math.round((liveLoad / capacity) * 100)) : 0;
      const lastScan =
        c.scanStats?.lastScanAt && !Number.isNaN(new Date(c.scanStats.lastScanAt).getTime())
          ? new Date(c.scanStats.lastScanAt).toLocaleString()
          : "-";

      return [
        index + 1,
        c.name || "-",
        c.status || "-",
        c.entrance || "-",
        capacity || 0,
        liveLoad,
        assignedLoad,
        `${pct}%`,
        c.staff || "-",
        lastScan,
      ];
    });

    autoTable(doc, {
      startY: 36,
      head: [
        [
          "#",
          "Counter",
          "Status",
          "Entrance",
          "Capacity",
          "Live Load",
          "Assigned Load",
          "Occupancy",
          "Staff",
          "Last Scan",
        ],
      ],
      body,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    const fileStamp = generatedAt.toISOString().split("T")[0];
    doc.save(`counter-management-${fileStamp}.pdf`);
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

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mt-5">
        <button
          onClick={() => setIsPopupOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 px-10 cursor-pointer font-medium rounded-md hover:opacity-70 text-white"
        >
          + Add Counter
        </button>
        <button
          onClick={downloadReport}
          className="border border-white/20 bg-white/5 p-2 px-6 cursor-pointer font-medium rounded-md text-white hover:bg-white/10"
        >
          Download PDF
        </button>
      </div>

      {/* Modal (uses the AddCounter from earlier) */}
      {isPopupOpen && (
        <AddCounter
          onClose={() => setIsPopupOpen(false)}
          onCreate={handleCreated}
        />
      )}

      {/* Counter list */}
      <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {counters.map((c) => {
          const liveLoad = getLiveLoad(c);
          const assignedLoad = getAssignedLoad(c);
          const capacity = toNumber(c.capacity);
          const pct = capacity ? Math.min(100, Math.round((liveLoad / capacity) * 100)) : 0;
          const lastScanDate = c.scanStats?.lastScanAt ? new Date(c.scanStats.lastScanAt) : null;
          const lastScanAt =
            lastScanDate && !Number.isNaN(lastScanDate.getTime())
              ? lastScanDate.toLocaleString()
              : null;

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

              {/* Occupancy */}
              <div className="text-[14px] mt-6 text-gray-300 flex justify-between">
                <span>Occupancy</span>
                <span>{liveLoad} / {capacity} ({pct}%)</span>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-black/40">
                <div className="h-full rounded-full bg-blue-600" style={{ width: `${pct}%` }} />
              </div>

              {/* Details */}
              <div className="mt-3 text-sm text-gray-300 space-y-1">
                <div>Capacity: <span className="text-white font-medium">{capacity}</span></div>
                <div>Current Load (scans): <span className="text-white font-medium">{liveLoad}</span></div>
                {assignedLoad !== liveLoad && (
                  <div>Assigned Load: <span className="text-white font-medium">{assignedLoad}</span></div>
                )}
                <div>Total Scans: <span className="text-white font-medium">{c.scanStats?.totalScans ?? 0}</span></div>
                {lastScanAt && (
                  <div>Last Scan: <span className="text-white/90">{lastScanAt}</span></div>
                )}
                <div>Assigned Staff: <span className="text-white/90">{c.staff || "-"}</span></div>
              </div>

              {/* Actions */}
              <div className="btn mt-4 flex gap-3">
                <button
                  onClick={() => {
                    setSelected(c);
                    setEditOpen(true);
                  }}
                  className="border border-white/10 px-4 py-1 bg-white/5 rounded-md text-[16px] cursor-pointer text-white"
                >
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
          onUpdated={(updated) => {
            if (!updated) return;
            setCounters((prev) =>
              prev.map((x) => (x._id === updated._id ? normalizeCounter(updated) : x))
            );
          }}
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
