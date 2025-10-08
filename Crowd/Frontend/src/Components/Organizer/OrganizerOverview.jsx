// OrganizerOverview.jsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { io } from "socket.io-client";
import { Bell, X } from "lucide-react";
import NotificationBell from "../../Components/NotificationBell";

const API = "http://localhost:5000/api";
const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

// POST /api/notifications
const postNotification = (payload) => api.post("/notifications", payload);

const OrganizerOverview = () => {
  // ====== current user (Organizer) ======
  const currentUser = {
    role: "Organizer",
    name: "Organizer Jane",
    email: "jane@example.com",
  };

  // ====== states ======
  const [tasks, setTasks] = useState([]);
  const [zones, setZones] = useState([]);
  const [showComposer, setShowComposer] = useState(false);
  const [sent, setSent] = useState([]);
  const [form, setForm] = useState({
    title: "",
    message: "",
    recipientRoles: ["Coordinator", "Attendee"],
  });

  // ====== notification socket setup ======
  const [socket, setSocket] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio("/new-notification-021-370045.mp3");
  }, []);

  useEffect(() => {
    const s = io("http://localhost:5000", { withCredentials: true });
    setSocket(s);

    s.emit("join", { role: currentUser.role });

    const onIncoming = () => audioRef.current?.play().catch(() => {});
    s.on("notification:new", onIncoming);

    return () => {
      s.off("notification:new", onIncoming);
      s.disconnect();
    };
  }, [currentUser.role]);

  // ====== load tasks + zones ======
  useEffect(() => {
    (async () => {
      try {
        const t = await axios.get(`${API}/tasks`);
        setTasks(t.data || []);
      } catch (e) {
        console.error("tasks load", e);
      }

      try {
        let z;
        try {
          z = await axios.get(`${API}/zone`);
          console.log("test");
        } catch {
          z = await axios.get(`${API}/zone`);
        }
        setZones(z.data || []);
      } catch (e) {
        console.error("zones load", e);
      }
    })();
  }, []);

  // ===== TASK KPIs =====
  const totalTasks = tasks.length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const completed = tasks.filter((t) => t.status === "done").length;
  const overdue = tasks.filter((t) => {
    if (!t.dueDate || t.status === "done") return false;
    const due = new Date(t.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  }).length;

  // ===== PARKING KPIs =====
  const totalSlots = zones.reduce((s, z) => s + (Number(z.capacity) || 0), 0);
  const occupied = zones.reduce((s, z) => s + (Number(z.load) || 0), 0);
  const reserved = zones.reduce((s, z) => s + (Number(z.reserved) || 0), 0);
  const available = Math.max(totalSlots - occupied - reserved, 0);

  // ===== CHART DATA =====
  const taskPieData = [
    { name: "Done", value: completed },
    { name: "In Progress", value: inProgress },
    {
      name: "Todo/Blocked/Other",
      value: Math.max(totalTasks - completed - inProgress, 0),
    },
  ];
  const taskPieColors = ["#22c55e", "#f59e0b", "#64748b"];

  const parkingBarData = zones.map((z) => {
    const cap = Number(z.capacity) || 0;
    const occ = Number(z.load) || 0;
    const res = Number(z.reserved) || 0;
    return {
      name: z.name || "Zone",
      Occupied: Math.min(occ, cap),
      Reserved: Math.min(res, Math.max(cap - occ, 0)),
      Available: Math.max(cap - occ - res, 0),
    };
  });

  // ===== TEAM SNAPSHOT =====
  const team = useMemo(() => {
    const map = new Map();
    tasks.forEach((t) => {
      const key = (t.coordinator || "Unassigned").trim();
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [tasks]);

  const today = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  // ===== notifications composer =====
  const toggleRole = (role) =>
    setForm((f) => ({
      ...f,
      recipientRoles: f.recipientRoles.includes(role)
        ? f.recipientRoles.filter((r) => r !== role)
        : [...f.recipientRoles, role],
    }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.recipientRoles.length) {
      alert("Select at least one recipient role.");
      return;
    }
    const payload = {
      title: form.title,
      message: form.message,
      recipientRoles: form.recipientRoles,
    };
    const saved = await postNotification(payload);
    setSent((prev) => [saved.data, ...prev]);
    setForm({ title: "", message: "", recipientRoles: ["Coordinator", "Attendee"] });
    setShowComposer(false);
  };

  // ===== RENDER =====
  return (
    <div className="w-full px-8 pt-8 pb-16">
      {/* HEADER */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-white text-3xl font-bold">Overview Dashboard</h1>
          <p className="text-white/70">Quick insights into your event operations</p>
          <div className="text-white/60 text-sm mt-1">Today: {today}</div>
          <div className="text-white/60 text-sm mt-1">
            {currentUser.name} • {currentUser.email}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowComposer(true)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded flex items-center gap-2 text-white"
          >
            <Bell size={18} /> Create Notification
          </button>
          <NotificationBell currentUser={currentUser} socket={socket} />
        </div>
      </div>

      {/* KPI CARDS — Tasks */}
      <h2 className="text-white text-xl font-semibold mb-4">Tasks</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        <KPI title="Total Tasks" value={totalTasks} />
        <KPI title="In Progress" value={inProgress} />
        <KPI title="Completed" value={completed} />
        <KPI title="Overdue" value={overdue} />
      </div>

      {/* KPI CARDS — Parking */}
      <h2 className="text-white text-xl font-semibold mb-4 mt-6">Parking</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        <KPI title="Total Slots" value={totalSlots} />
        <KPI title="Available" value={available} />
        <KPI title="Reserved" value={reserved} />
        <KPI title="Occupied" value={occupied} />
      </div>

      {/* CHARTS */}
      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-white font-semibold mb-3">Task Status</div>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={taskPieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {taskPieData.map((_, i) => (
                    <Cell key={i} fill={taskPieColors[i % taskPieColors.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-white font-semibold mb-3">Parking Utilization by Zone</div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={parkingBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Available" stackId="a" />
                <Bar dataKey="Reserved" stackId="a" />
                <Bar dataKey="Occupied" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TEAM SNAPSHOT */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 mt-8">
        <div className="text-white font-semibold mb-3">Team / Coordinator Snapshot</div>
        {team.length === 0 ? (
          <div className="text-white/60 text-sm">No assignments yet.</div>
        ) : (
          <ul className="divide-y divide-white/10">
            {team.map((m) => (
              <li key={m.name} className="py-3 flex items-center justify-between">
                <span className="text-white">{m.name}</span>
                <span className="text-white/80 text-sm">
                  {m.count} task{m.count === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* SENT NOTIFICATIONS */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 mt-8">
        <div className="text-white font-semibold mb-3">Sent Notifications</div>
        {sent.length === 0 ? (
          <div className="text-white/60 text-sm">No notifications yet.</div>
        ) : (
          <ul className="divide-y divide-white/10">
            {sent.map((n) => (
              <li key={n._id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">{n.title}</div>
                  <div className="text-white/80 text-sm">{n.message}</div>
                  <div className="text-white/60 text-xs mt-1">
                    Roles: {n.recipientRoles?.join(", ") || "—"}
                  </div>
                </div>
                <span className="text-white/50 text-xs">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* COMPOSER MODAL */}
      {showComposer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#0f172a] p-6 rounded-md w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Create Notification</h3>
              <X
                className="cursor-pointer text-white/80"
                onClick={() => setShowComposer(false)}
              />
            </div>
            <form onSubmit={submit} className="flex flex-col gap-4">
              <input
                className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
              <textarea
                className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                rows={4}
                placeholder="Message"
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                required
              />
              <div className="text-sm text-gray-300">Send to roles:</div>
              <div className="flex gap-4 flex-wrap text-white">
                {["Coordinator", "Attendee"].map((r) => (
                  <label key={r} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="accent-blue-500"
                      checked={form.recipientRoles.includes(r)}
                      onChange={() => toggleRole(r)}
                    />
                    {r}
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowComposer(false)}
                  className="px-4 py-2 bg-gray-600 rounded text-white"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-green-600 rounded text-white">
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// KPI helper component
function KPI({ title, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-white/70 text-sm">{title}</div>
      <div className="text-white text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}

export default OrganizerOverview;
