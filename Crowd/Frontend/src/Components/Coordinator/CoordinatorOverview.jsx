// Coordinator/Overview.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, X } from "lucide-react";
import axios from "axios";
import { io } from "socket.io-client";
import NotificationBell from "../../Components/NotificationBell";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});
const postNotification = (payload) => api.post("/notifications", payload);

export default function CoordinatorOverview() {
  const currentUser = {
    role: "Coordinator",
    name: "John Doe",
    email: "john.doe@example.com",
  };

  const [sent, setSent] = useState([]);
  const [showComposer, setShowComposer] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    recipientRoles: [], // options: Attendee, Organizer, Staff (NO Coordinator)
  });
  const [socket, setSocket] = useState(null);
  const audioRef = useRef(null);

  // ✅ NEW: state for stats + loading/error (Option B)
  const [taskStats, setTaskStats] = useState([]);       // [{status, count}]
  const [incidentStats, setIncidentStats] = useState([]); // [{type, count}]
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => { audioRef.current = new Audio("/new-notification-021-370045.mp3"); }, []);

  useEffect(() => {
    const s = io("http://localhost:5000", { withCredentials: true });
    setSocket(s);
    s.emit("join", { role: currentUser.role });

    const onAny = () => audioRef.current?.play().catch(()=>{});
    s.on("notification:new", onAny);
    
    return () => {
      s.off("notification:new", onAny);
      s.disconnect();
    };
  }, []);

  // ✅ NEW: fetch tasks/incidents and count on client (Option B)
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [tasksRes, incRes] = await Promise.all([
          api.get("/tasks"),
          api.get("/support"), // ⬅️ changed from "/incidents" to "/support"
        ]);

        // group tasks by status
        const tCounts = tasksRes.data.reduce((acc, t) => {
          const key = t.status || "todo";
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
        const orderedTasks = ["todo", "in_progress", "done", "blocked"].map(k => ({
          status: k,
          count: tCounts[k] || 0,
        }));
        setTaskStats(orderedTasks);

        // group incidents by type
        const incCounts = incRes.data.reduce((acc, i) => {
          const key = i.type || "Unknown";
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
        const orderedInc = ["Lost Person", "Emergency", "Lost Item", "Complaints"].map(t => ({
          type: t,
          count: incCounts[t] || 0,
        }));
        setIncidentStats(orderedInc);

        setErr("");
      } catch (e) {
        console.error(e);
        setErr("Failed to load lists");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ✅ UPDATED: derive maxima from fetched stats (safe with fallback 1)
  const maxTask = useMemo(() => Math.max(1, ...taskStats.map(t => t.count)), [taskStats]);
  const maxInc  = useMemo(() => Math.max(1, ...incidentStats.map(i => i.count)), [incidentStats]);

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
    const payload = { title: form.title, message: form.message, recipientRoles: form.recipientRoles };
    const saved = await postNotification(payload);
    setSent((prev) => [
      saved.data,
      ...prev,
    ]);
    setForm({ title: "", message: "", recipientRoles: [] });
    setShowComposer(false);
  };

  return (
    <div className="p-10 text-white w-full space-y-10">
      <div className="flex items-center justify-between bg-[#1e293b] p-6 rounded-md shadow-md">
        <div>
          <h1 className="text-3xl font-bold">Tech Expo 2025</h1>
          <p className="text-gray-300">Main Hall | 2025-09-10</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <h2 className="text-xl font-semibold">{currentUser.name}</h2>
            <p className="text-gray-300">{currentUser.email}</p>
          </div>
          <NotificationBell currentUser={currentUser} socket={socket} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-10">
        <div>
          <h3 className="text-xl font-bold mb-4">Tasks</h3>
          {taskStats.map((t) => (
            <div key={t.status} className="mb-3">
              <div className="flex justify-between mb-1">
                <span>{t.status}</span><span>{t.count}</span>
              </div>
              <div className="w-full bg-white/10 h-4 rounded-full">
                <div className="h-4 rounded-full"
                  style={{
                    width: `${(t.count / maxTask) * 100}%`,
                    background: `linear-gradient(to right, #4ade80, #22d3ee)`,
                    transition: "width 0.3s",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">Incidents</h3>
          {incidentStats.map((i) => (
            <div key={i.type} className="mb-3">
              <div className="flex justify-between mb-1">
                <span>{i.type}</span><span>{i.count}</span>
              </div>
              <div className="w-full bg-white/10 h-4 rounded-full">
                <div className="h-4 rounded-full"
                  style={{
                    width: `${(i.count / maxInc) * 100}%`,
                    background: `linear-gradient(to right, #facc15, #f472b6)`,
                    transition: "width 0.3s",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sent (local visual only) */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Sent Notifications</h3>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
            onClick={() => setShowComposer(true)}
          >
            <Bell size={18} /> Create Notification
          </button>
        </div>
        {sent.length === 0 ? (
          <p className="text-gray-400">No notifications sent yet.</p>
        ) : (
          <ul className="space-y-2">
            {sent.map((n) => (
              <li key={n._id} className="bg-white/10 p-3 rounded-md">
                <div className="flex justify-between">
                  <div>
                    <div className="font-semibold">{n.title}</div>
                    <div className="text-gray-300">{n.message}</div>
                    <div className="text-gray-400 text-sm mt-1">
                      Roles: {n.recipientRoles?.join(", ")}
                    </div>
                  </div>
                  <span className="text-gray-400">{new Date(n.createdAt).toLocaleString()}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Composer */}
      {showComposer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#0f172a] p-6 rounded-md w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Create Notification</h3>
              <X className="cursor-pointer" onClick={() => setShowComposer(false)} />
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
              <div className="flex gap-4 flex-wrap">
                {["Attendee", "Organizer", "Staff"].map((r) => (
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
                <button type="button" onClick={() => setShowComposer(false)} className="px-4 py-2 bg-gray-600 rounded">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-green-600 rounded">
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
