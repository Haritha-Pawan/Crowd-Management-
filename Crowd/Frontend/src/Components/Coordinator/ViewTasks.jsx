import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap,
  Bell,
  X
} from "lucide-react";
import axios from "axios";

const TASKS_API = "http://localhost:5000/api/tasks";

// ---- notifications endpoints (adjust if needed) ----
const NOTIF_API_MINE = "http://localhost:5000/api/coord-notifications/inbox";
const NOTIF_API_READ_ONE = (id) => `http://localhost:5000/api/coord-notifications/${id}/read`;
const NOTIF_API_READ_ALL = "http://localhost:5000/api/coord-notifications/read-all";

const ViewTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [expandedTask, setExpandedTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // status UI
  const [pendingStatus, setPendingStatus] = useState({});
  const [updating, setUpdating] = useState({});

  // ---- notifications state ----
  const [notifs, setNotifs] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifErr, setNotifErr] = useState("");

  // coordinator session name (mind your earlier typo key)
  const coordinatorName =
    sessionStorage.getItem("coodinatorName") ||
    sessionStorage.getItem("coordinatorName") ||
    "";
  const coordinatorId =
    sessionStorage.getItem("coordinatorId") ||
    sessionStorage.getItem("coodinatorId") ||
    "";
  const coordinatorEmail =
    sessionStorage.getItem("coordinatorEmail") ||
    sessionStorage.getItem("coodinatorEmail") ||
    "";

  // Fetch tasks for this coordinator
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(TASKS_API);
        const nm = coordinatorName.trim().toLowerCase();

        const mine = (data || []).filter((t) => {
          const tName = String(t.coordinator || "").trim().toLowerCase();
          return nm && tName === nm;
        });

        setTasks(mine);

        const init = {};
        (mine || []).forEach((t) => (init[t._id] = t.status || "todo"));
        setPendingStatus(init);
      } catch (err) {
        console.error("Error fetching tasks", err);
        setError("Failed to load tasks.");
      } finally {
        setLoading(false);
      }
    })();
  }, [coordinatorName]);

  // ---- fetch notifications (on mount + every 30s) ----
  useEffect(() => {
    let timer;
    const load = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setNotifErr("Missing auth token");
        setNotifs([]);
        return;
      }

      try {
        setNotifLoading(true);
        setNotifErr("");
        const headers = { Authorization: `Bearer ${token}` };
        if (coordinatorName) headers["X-User-Name"] = coordinatorName;
        if (coordinatorId) headers["X-User-Id"] = coordinatorId;
        if (coordinatorEmail) headers["X-User-Email"] = coordinatorEmail;
        headers["X-User-Role"] = "Coordinator";

        const { data } = await axios.get(NOTIF_API_MINE, { headers });
        const directOnly = Array.isArray(data)
          ? data.filter((n) => n?.recipientType === "user")
          : [];
        setNotifs(directOnly);
      } catch (e) {
        console.error("notifications load", e);
        setNotifErr("Failed to load notifications");
      } finally {
        setNotifLoading(false);
      }
    };
    load();
    timer = setInterval(load, 30000); // poll every 30s
    return () => clearInterval(timer);
  }, [coordinatorName, coordinatorId, coordinatorEmail]);

  const unreadCount = notifs.filter((n) => !n.isRead).length;

  const markOneRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Missing auth token");
        return;
      }

      const headers = { Authorization: `Bearer ${token}`, "X-User-Role": "Coordinator" };
      if (coordinatorName) headers["X-User-Name"] = coordinatorName;
      if (coordinatorId) headers["X-User-Id"] = coordinatorId;
      if (coordinatorEmail) headers["X-User-Email"] = coordinatorEmail;

      await axios.post(NOTIF_API_READ_ONE(id), {}, { headers });
      setNotifs((prev) => prev.filter((n) => n._id !== id));
    } catch (e) {
      console.error("mark one read", e);
      alert("Failed to mark notification as read");
    }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Missing auth token");
        return;
      }

      const headers = { Authorization: `Bearer ${token}`, "X-User-Role": "Coordinator" };
      if (coordinatorName) headers["X-User-Name"] = coordinatorName;
      if (coordinatorId) headers["X-User-Id"] = coordinatorId;
      if (coordinatorEmail) headers["X-User-Email"] = coordinatorEmail;

      const unreadIds = notifs.filter((n) => !n.isRead).map((n) => n._id);
      await axios.post(NOTIF_API_READ_ALL, { ids: unreadIds }, { headers });
      setNotifs((prev) => prev.filter((n) => n.isRead));
    } catch (e) {
      console.error("mark all read", e);
      alert("Failed to mark all as read");
    }
  };

  const toggleExpand = (taskId) =>
    setExpandedTask(expandedTask === taskId ? null : taskId);

  // --- Helpers ---
  const getPriorityStyle = (priority) => {
    const styles = {
      high: "bg-red-500/20 text-red-300 border-red-500/30",
      medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      low: "bg-green-500/20 text-green-300 border-green-500/30",
    };
    return styles[priority?.toLowerCase()] || styles.medium;
  };

  const getStatusStyle = (status) => {
    const styles = {
      todo: "bg-gray-500/20 text-gray-300 border-gray-500/30",
      in_progress: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      done: "bg-green-500/20 text-green-300 border-green-500/30",
      blocked: "bg-red-500/20 text-red-300 border-red-500/30",
    };
    return styles[status?.toLowerCase()] || styles.todo;
  };

  const getStatusIcon = (status) => {
    const icons = {
      todo: <Clock className="w-3 h-3" />,
      in_progress: <Zap className="w-3 h-3" />,
      done: <CheckCircle2 className="w-3 h-3" />,
      blocked: <AlertCircle className="w-3 h-3" />,
    };
    return icons[status?.toLowerCase()] || icons.todo;
  };

  // --- Status update calls ---
  const applyStatus = async (taskId, statusValue) => {
    try {
      setUpdating((prev) => ({ ...prev, [taskId]: true }));
      const normalized = String(statusValue).toLowerCase().replace(" ", "_");
      await axios.put(`${TASKS_API}/${taskId}`, { status: normalized });

      setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status: normalized } : t)));
      setPendingStatus((prev) => ({ ...prev, [taskId]: normalized }));
    } catch (err) {
      console.error("Error updating status", err);
      alert("Failed to update task status.");
    } finally {
      setUpdating((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  const handleUpdateClick = (taskId) => {
    const chosen = pendingStatus[taskId] ?? "todo";
    applyStatus(taskId, chosen);
  };

  const handleMarkDone = (taskId) => {
    applyStatus(taskId, "done");
  };

  return (
    <div className="p-6 md:p-10 w-full text-white min-h-screen">
      {/* Header Section */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Assigned Tasks
          </h1>
          <p className="text-gray-400 text-lg">
            Click a task to view details & update status
          </p>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((s) => !s)}
            className="relative rounded-full p-2 bg-white/10 border border-white/15 hover:bg-white/15"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-[10px] font-bold grid place-items-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Panel */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl z-20">
              <div className="flex items-center justify-between p-3 border-b border-white/10">
                <div className="font-semibold">Notifications</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={markAllRead}
                    className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/15 border border-white/10"
                    disabled={!unreadCount || notifLoading}
                  >
                    Mark all as read
                  </button>
                  <button
                    onClick={() => setNotifOpen(false)}
                    className="p-1 rounded hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifLoading && (
                  <div className="p-4 text-sm text-gray-400">Loading…</div>
                )}
                {notifErr && (
                  <div className="p-4 text-sm text-rose-400">{notifErr}</div>
                )}
                {!notifLoading && !notifs.length && (
                  <div className="p-4 text-sm text-gray-400">
                    No notifications yet.
                  </div>
                )}

                {notifs.map((n) => (
                  <div
                    key={n._id}
                    className={`p-4 border-b border-white/5 ${
                      n.isRead ? "bg-transparent" : "bg-blue-500/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{n.title}</div>
                        <div className="text-sm text-gray-300 whitespace-pre-wrap mt-1">
                          {n.message}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-1">
                          {n.createdAt
                            ? new Date(n.createdAt).toLocaleString()
                            : ""}
                        </div>
                      </div>
                      {!n.isRead && (
                        <button
                          onClick={() => markOneRead(n._id)}
                          className="text-xs shrink-0 px-2 py-1 rounded bg-white/10 hover:bg-white/15 border border-white/10"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-xl mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Tasks Table Card */}
      {!loading && (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-white text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="py-4 px-6 font-semibold text-gray-300 uppercase tracking-wider text-xs">
                    Title
                  </th>
                  <th className="py-4 px-6 font-semibold text-gray-300 uppercase tracking-wider text-xs">
                    Coordinator
                  </th>
                  <th className="py-4 px-6 font-semibold text-gray-300 uppercase tracking-wider text-xs">
                    Priority
                  </th>
                  <th className="py-4 px-6 font-semibold text-gray-300 uppercase tracking-wider text-xs">
                    Status
                  </th>
                  <th className="py-4 px-6 font-semibold text-gray-300 uppercase tracking-wider text-xs">
                    Due Date
                  </th>
                  <th className="py-4 px-6 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => (
                  <React.Fragment key={task._id}>
                    {/* Main Row */}
                    <tr
                      className={`cursor-pointer transition-all duration-300 border-b border-white/5 ${
                        expandedTask === task._id
                          ? "bg-blue-500/10 border-l-4 border-l-blue-500"
                          : "hover:bg-white/5 hover:border-l-4 hover:border-l-blue-400/50"
                      } ${index % 2 === 0 ? "bg-white/[0.02]" : ""}`}
                      onClick={() => toggleExpand(task._id)}
                    >
                      <td className="py-4 px-6 font-medium text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                          {task.title}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-300">
                        {task.coordinator || "—"}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getPriorityStyle(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(
                            task.status
                          )}`}
                        >
                          {getStatusIcon(task.status)}
                          {String(task.status || "todo").replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString()
                            : "—"}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                            expandedTask === task._id ? "rotate-180" : ""
                          }`}
                        />
                      </td>
                    </tr>

                    {/* Expanded Details */}
                    {expandedTask === task._id && (
                      <tr className="border-b border-white/5">
                        <td colSpan="6" className="p-0">
                          <div className="p-6 bg-gradient-to-br from-blue-500/5 to-purple-500/5 animate-fadeIn">
                            <div className="rounded-xl p-6 bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
                              <h2 className="text-2xl font-bold mb-4 text-white">
                                {task.title}
                              </h2>
                              <p className="text-gray-300 mb-6 leading-relaxed">
                                {task.description || "—"}
                              </p>

                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 shadow-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <span className="font-semibold text-gray-300 text-sm">
                                      Coordinator
                                    </span>
                                  </div>
                                  <p className="text-white ml-6 font-medium text-sm">
                                    {task.coordinator || "—"}
                                  </p>
                                </div>

                                <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 shadow-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <span className="font-semibold text-gray-300 text-sm">
                                      Other Staff
                                    </span>
                                  </div>
                                  <p className="text-white ml-6 font-medium text-sm whitespace-pre-line">
                                    {task.otherStaffs || "—"}
                                  </p>
                                </div>

                                <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 shadow-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="w-4 h-4 text-gray-400" />
                                    <span className="font-semibold text-gray-300 text-sm">
                                      Priority
                                    </span>
                                  </div>
                                  <div className="ml-6">
                                    <span
                                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                                        task.priority?.toLowerCase() === "high"
                                          ? "text-red-400"
                                          : task.priority?.toLowerCase() ===
                                            "medium"
                                          ? "text-orange-400"
                                          : "text-green-400"
                                      }`}
                                    >
                                      {task.priority}
                                    </span>
                                  </div>
                                </div>

                                <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 shadow-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="font-semibold text-gray-300 text-sm">
                                      Due Date
                                    </span>
                                  </div>
                                  <p className="text-white ml-6 font-medium text-sm">
                                    {task.dueDate
                                      ? new Date(task.dueDate).toLocaleDateString()
                                      : "—"}
                                  </p>
                                </div>
                              </div>

                              {/* Status controls */}
                              <div
                                className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 shadow-lg"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <label className="flex items-center gap-2 font-semibold text-gray-300 mb-3">
                                  <CheckCircle2 className="w-4 h-4 text-gray-400" />
                                  Update Status
                                </label>

                                <div className="flex flex-wrap items-center gap-3">
                                  <select
                                    value={pendingStatus[task._id] ?? task.status ?? "todo"}
                                    onChange={(e) =>
                                      setPendingStatus((prev) => ({
                                        ...prev,
                                        [task._id]: e.target.value,
                                      }))
                                    }
                                    className="bg-gray-800 text-white px-4 py-2.5 rounded-lg shadow-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all hover:bg-gray-700"
                                  >
                                    <option value="todo">todo</option>
                                    <option value="in_progress">in_progress</option>
                                    <option value="done">done</option>
                                    <option value="blocked">blocked</option>
                                  </select>

                                  <button
                                    onClick={() => handleUpdateClick(task._id)}
                                    disabled={!!updating[task._id]}
                                    className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60"
                                  >
                                    {updating[task._id] ? "Updating..." : "Update Status"}
                                  </button>

                                  <button
                                    onClick={() => handleMarkDone(task._id)}
                                    disabled={!!updating[task._id] || task.status === "done"}
                                    className="px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-60"
                                  >
                                    {task.status === "done" ? "Completed" : "Mark Done"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            {/* Empty State */}
            {tasks.length === 0 && !loading && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
                  <CheckCircle2 className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  No tasks assigned yet
                </h3>
                <p className="text-gray-500">
                  Tasks will appear here once they are assigned to you
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ViewTasks;
