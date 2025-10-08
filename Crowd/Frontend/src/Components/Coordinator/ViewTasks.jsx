import React, { useState, useEffect } from "react";
import { ChevronDown, Calendar, Users, AlertCircle, CheckCircle2, Clock, Zap } from "lucide-react";
import axios from "axios";

const API = "http://localhost:5000/api/tasks";

const ViewTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [expandedTask, setExpandedTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // selected status per task (for the dropdown before submitting)
  const [pendingStatus, setPendingStatus] = useState({});
  // per-task loading for updates
  const [updating, setUpdating] = useState({});

  // Fetch tasks from backend
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(API);
        setTasks(data || []);
        // initialize pendingStatus with current server values
        const init = {};
        (data || []).forEach(t => { init[t._id] = t.status || "todo"; });
        setPendingStatus(init);
      } catch (err) {
        console.error("Error fetching tasks", err);
        setError("Failed to load tasks.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleExpand = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  // --- Helpers ---
  const getPriorityStyle = (priority) => {
    const styles = {
      high: "bg-red-500/20 text-red-300 border-red-500/30",
      medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      low: "bg-green-500/20 text-green-300 border-green-500/30"
    };
    return styles[priority?.toLowerCase()] || styles.medium;
  };

  const getStatusStyle = (status) => {
    const styles = {
      todo: "bg-gray-500/20 text-gray-300 border-gray-500/30",
      in_progress: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      done: "bg-green-500/20 text-green-300 border-green-500/30",
      blocked: "bg-red-500/20 text-red-300 border-red-500/30"
    };
    return styles[status?.toLowerCase()] || styles.todo;
  };

  const getStatusIcon = (status) => {
    const icons = {
      todo: <Clock className="w-3 h-3" />,
      in_progress: <Zap className="w-3 h-3" />,
      done: <CheckCircle2 className="w-3 h-3" />,
      blocked: <AlertCircle className="w-3 h-3" />
    };
    return icons[status?.toLowerCase()] || icons.todo;
  };

  // --- Status update calls ---
  const applyStatus = async (taskId, statusValue) => {
    try {
      setUpdating(prev => ({ ...prev, [taskId]: true }));
      const normalized = String(statusValue).toLowerCase().replace(" ", "_");
      await axios.put(`${API}/${taskId}`, { status: normalized });

      // reflect in UI
      setTasks(prev => prev.map(t => (t._id === taskId ? { ...t, status: normalized } : t)));
      setPendingStatus(prev => ({ ...prev, [taskId]: normalized }));
    } catch (err) {
      console.error("Error updating status", err);
      alert("Failed to update task status.");
    } finally {
      setUpdating(prev => ({ ...prev, [taskId]: false }));
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
          Assigned Tasks
        </h1>
        <p className="text-gray-400 text-lg">Click a task to view details & update status</p>
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
                      <td className="py-4 px-6 text-gray-300">{task.coordinator || "—"}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getPriorityStyle(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(task.status)}`}>
                          {getStatusIcon(task.status)}
                          {String(task.status || "todo").replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
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
                              <h2 className="text-2xl font-bold mb-4 text-white">{task.title}</h2>
                              <p className="text-gray-300 mb-6 leading-relaxed">{task.description || "—"}</p>

                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 shadow-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <span className="font-semibold text-gray-300 text-sm">Coordinator</span>
                                  </div>
                                  <p className="text-white ml-6 font-medium text-sm">{task.coordinator || "—"}</p>
                                </div>

                                <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 shadow-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <span className="font-semibold text-gray-300 text-sm">Other Staff</span>
                                  </div>
                                  <p className="text-white ml-6 font-medium text-sm">{task.otherStaffs || "—"}</p>
                                </div>

                                <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 shadow-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="w-4 h-4 text-gray-400" />
                                    <span className="font-semibold text-gray-300 text-sm">Priority</span>
                                  </div>
                                  <div className="ml-6">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                                      task.priority?.toLowerCase() === 'high' ? 'text-red-400' :
                                      task.priority?.toLowerCase() === 'medium' ? 'text-orange-400' :
                                      'text-green-400'
                                    }`}>
                                      {task.priority}
                                    </span>
                                  </div>
                                </div>

                                <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 shadow-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="font-semibold text-gray-300 text-sm">Due Date</span>
                                  </div>
                                  <p className="text-white ml-6 font-medium text-sm">
                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
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
                                      setPendingStatus(prev => ({ ...prev, [task._id]: e.target.value }))
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
                                    disabled={!!updating[task._id] || (task.status === "done")}
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
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No tasks assigned yet</h3>
                <p className="text-gray-500">Tasks will appear here once they are assigned to you</p>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default ViewTasks;
