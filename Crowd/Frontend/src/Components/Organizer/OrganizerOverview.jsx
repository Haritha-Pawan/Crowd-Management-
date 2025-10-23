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
  Legend
} from "recharts";
import { io } from "socket.io-client";
import { Bell, X } from "lucide-react";
import NotificationBell from "../../Components/NotificationBell";

// ✅ Base API endpoint (use your backend URL)
const API = "http://localhost:5000/api";
const api = axios.create({ baseURL: API, withCredentials: true });
const LIVE_REFRESH_MS = 8000; // optional: refresh metrics/zones every 8s

const OrganizerOverview = () => {
  const currentUser = {
    role: "Organizer",
    name: "Organizer Jane",
    email: "jane@example.com"
  };

  const [tasks, setTasks] = useState([]);
  const [zones, setZones] = useState([]);
  const [metrics, setMetrics] = useState(null); // ← parking metrics { totals, byZone }
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [sent, setSent] = useState([]);
  const [form, setForm] = useState({
    title: "",
    message: "",
    recipientRoles: ["Coordinator", "Attendee"]
  });

  const [socket, setSocket] = useState(null);
  const audioRef = useRef(null);

  // ✅ Load sound once
  useEffect(() => {
    audioRef.current = new Audio("/new-notification-021-370045.mp3");
  }, []);

  // ✅ Connect socket
  useEffect(() => {
    const s = io("http://localhost:5000", { withCredentials: true });
    setSocket(s);

    s.emit("join", { role: currentUser.role });
    s.on("notification:new", () => audioRef.current?.play().catch(() => {}));

    return () => s.disconnect();
  }, [currentUser.role]);

  // ✅ Fetch tasks, zones, and parking metrics
  const loadAll = async () => {
    try {
      setLoading(true);
      const [taskRes, zoneRes, metricsRes] = await Promise.all([
        api.get("/tasks"),
        api.get("/zone"),
        api.get("/spots/metrics"),
      ]);

      // tasks
      setTasks(
        Array.isArray(taskRes.data)
          ? taskRes.data
          : taskRes.data?.tasks || []
      );

      // zones
      const z =
        (Array.isArray(zoneRes.data) && zoneRes.data) ||
        zoneRes.data?.zones ||
        zoneRes.data?.data ||
        [];
      setZones(Array.isArray(z) ? z : []);

      // metrics
      setMetrics(metricsRes.data || null);
    } catch (err) {
      console.error("Overview load failed:", err);
      setTasks([]);
      setZones([]);
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Optional: live refresh to keep parking up to date
  

  // === Task metrics ===
  const totalTasks = tasks.length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const completed = tasks.filter((t) => t.status === "done").length;
  const overdue = tasks.filter((t) => {
    if (!t.dueDate || t.status === "done") return false;
    return new Date(t.dueDate) < new Date();
  }).length;

  // === Parking metrics (from /spots/metrics) ===
  const totals = metrics?.totals || { capacity: 0, occupied: 0, available: 0, occupancyRate: 0 };

  // Build a map zoneId -> {capacity, occupied, available}
  const byZoneMap = useMemo(() => {
    const m = new Map();
    if (metrics?.byZone) {
      for (const z of metrics.byZone) m.set(String(z.zoneId), z);
    }
    return m;
  }, [metrics]);

  // If you have a reservations API, you can compute reserved per zone here.
  // For now, ‘reserved’ defaults to 0 and can be integrated later.
  const parkingBarData = useMemo(() => {
    return zones.map((z) => {
      const zid = String(z._id || z.id || "");
      const m = byZoneMap.get(zid);
      const capacity = m?.capacity ?? Number(z.capacity) ?? 0;
      const occupied = m?.occupied ?? Number(z.load) ?? 0;
      const available = m?.available ?? Math.max(capacity - occupied, 0);
      const reserved = 0; // TODO: replace with real reserved count if available
      return {
        name: z.name || "Zone",
        Available: available,
        Reserved: Math.min(reserved, Math.max(capacity - occupied, 0)),
        Occupied: Math.min(occupied, capacity),
      };
    });
  }, [zones, byZoneMap]);

  // === Team snapshot ===
  const team = useMemo(() => {
    const map = new Map();
    tasks.forEach((t) => {
      const key = (t.coordinator || "Unassigned").trim();
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map, ([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [tasks]);

  const today = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit"
  });

  // === Toggle roles in form ===
  const toggleRole = (role) => {
    setForm((f) => ({
      ...f,
      recipientRoles: f.recipientRoles.includes(role)
        ? f.recipientRoles.filter((r) => r !== role)
        : [...f.recipientRoles, role]
    }));
  };

  // === Submit notification ===
  const submit = async (e) => {
    e.preventDefault();
    if (!form.recipientRoles.length)
      return alert("Select at least one recipient role.");
    try {
      const { data } = await api.post("/notifications", form);
      setSent((prev) => [data, ...prev]);
      setForm({
        title: "",
        message: "",
        recipientRoles: ["Coordinator", "Attendee"]
      });
      setShowComposer(false);
    } catch (err) {
      console.error("Notification send failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="w-full px-8 pt-8 pb-16">
        <div className="text-white/80">Loading overview…</div>
      </div>
    );
  }

  return (
    <div className="w-full px-8 pt-8 pb-16">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-white text-3xl font-bold">Overview Dashboard</h1>
          <p className="text-white/70">
            Quick insights into your event operations
          </p>
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

      {/* KPI Sections */}
      <Section
        title="Tasks"
        data={[
          { title: "Total Tasks", value: totalTasks },
          { title: "In Progress", value: inProgress },
          { title: "Completed", value: completed },
          { title: "Overdue", value: overdue }
        ]}
      />

      {/* ✅ Parking KPIs driven by /spots/metrics */}
      <Section
        title="Parking"
        data={[
          { title: "Total Slots", value: totals.capacity },
          { title: "Available", value: totals.available },
          { title: "Reserved", value: 0 }, // replace later when you wire real reserved counts
          { title: "Occupied", value: totals.occupied }
        ]}
      />

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <ChartCard title="Task Status">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={[
                  { name: "Done", value: completed },
                  { name: "In Progress", value: inProgress },
                  {
                    name: "Other",
                    value: Math.max(totalTasks - completed - inProgress, 0)
                  }
                ]}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
              >
                {["#22c55e", "#f59e0b", "#64748b"].map((c, i) => (
                  <Cell key={i} fill={c} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ✅ Parking Utilization by Zone using metrics.byZone + zone names */}
        <ChartCard title="Parking Utilization by Zone">
          <ResponsiveContainer>
            <BarChart data={parkingBarData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Available" stackId="a" fill="#22c55e" />
              <Bar dataKey="Reserved" stackId="a" fill="#f59e0b" />
              <Bar dataKey="Occupied" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Team snapshot */}
      <ChartCard title="Team / Coordinator Snapshot" className="mt-8">
        {team.length ? (
          <ul className="divide-y divide-white/10">
            {team.map((m) => (
              <li key={m.name} className="py-3 flex justify-between">
                <span className="text-white">{m.name}</span>
                <span className="text-white/80 text-sm">
                  {m.count} task{m.count > 1 ? "s" : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-white/60 text-sm">No assignments yet.</div>
        )}
      </ChartCard>

      {/* Sent notifications */}
      <ChartCard title="Sent Notifications" className="mt-8">
        {sent.length ? (
          <ul className="divide-y divide-white/10">
            {sent.map((n) => (
              <li key={n._id} className="py-3 flex justify-between">
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
        ) : (
          <div className="text-white/60 text-sm">No notifications yet.</div>
        )}
      </ChartCard>

      {/* Notification composer modal */}
      {showComposer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#0f172a] p-6 rounded-md w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                Create Notification
              </h3>
              <X
                onClick={() => setShowComposer(false)}
                className="cursor-pointer text-white/80"
              />
            </div>
            <form onSubmit={submit} className="flex flex-col gap-4">
              <input
                className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                placeholder="Title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                required
              />
              <textarea
                className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                rows={4}
                placeholder="Message"
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
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
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 rounded text-white"
                >
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

// --- Reusable Components ---
const KPI = ({ title, value }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <div className="text-white/70 text-sm">{title}</div>
    <div className="text-white text-3xl font-bold mt-1">{value}</div>
  </div>
);

const Section = ({ title, data }) => (
  <>
    <h2 className="text-white text-xl font-semibold mb-4 mt-6">{title}</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {data.map((k, i) => (
        <KPI key={i} {...k} />
      ))}
    </div>
  </>
);

const ChartCard = ({ title, children, className = "" }) => (
  <div
    className={`rounded-2xl border border-white/10 bg-white/5 p-5 ${className}`}
  >
    <div className="text-white font-semibold mb-3">{title}</div>
    <div className="h-64">{children}</div>
  </div>
);

export default OrganizerOverview;
