import React, { useEffect, useMemo, useState } from "react";
import { Pencil, RefreshCcw, Trash2 } from "lucide-react";
import axios from "axios";
import { ClipboardList, CheckCircle2, AlertTriangle, TimerReset, UserRound } from "lucide-react";
import AddTask from "../Task/AddTask";

const API = "http://localhost:5000/api";

const Task = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [tasks, setTasks] = useState([]);

  // Load tasks once
  useEffect(() => {
    (async () => {
      const { data } = await axios.get(`${API}/tasks`);
      setTasks(data);
    })();
  }, []);

  // Derived lists
  const pendingTasks = useMemo(() => tasks.filter(t => t.status !== "done"), [tasks]);
  const completedTasks = useMemo(() => tasks.filter(t => t.status === "done"), [tasks]);

  // Cards
  const total = tasks.length;
  const inProgress = tasks.filter(t => t.status === "in_progress").length;
  const completed = completedTasks.length;
  const overdue = tasks.filter(t => {
    if (!t.dueDate || t.status === "done") return false;
    const due = new Date(t.dueDate);
    const today = new Date(); today.setHours(0,0,0,0);
    return due < today;
  }).length;

  // CRUD handlers (API lives here)
  const createTask = async (payload) => {
    const { data } = await axios.post(`${API}/tasks`, payload);
    setTasks(prev => [data, ...prev]);
    setIsPopupOpen(false);
  };

  const updateTask = async (id, payload) => {
    const { data } = await axios.put(`${API}/tasks/${id}`, payload);
    setTasks(prev => prev.map(t => (t._id === id ? data : t)));
    setEditingTask(null);
  };

  const markDone = async (id) => {
    const { data } = await axios.put(`${API}/tasks/${id}`, { status: "done" });
    setTasks(prev => prev.map(t => (t._id === id ? data : t)));
  };

  const removeTask = async (id) => {
    await axios.delete(`${API}/tasks/${id}`);
    setTasks(prev => prev.filter(t => t._id !== id));
  };

  return (
    <div className="p-12 2xl:h-screen w-full">
      <div className="header text-white text-3xl font-bold">Task Management</div>
      <div className="sub-heading text-gray-300 text-xl">Create tasks and assign a coordinator</div>

      {/* Cards */}
      <div className="card grid 2xl:grid-cols-4 lg:grid-cols-4 mt-8 md:grid-cols-2 gap-3 mx-auto">
        <Card title="Total Tasks" icon={<ClipboardList color="#2f80ed" size={30} />} count={String(total)} />
        <Card title="In Progress" icon={<TimerReset color="#f59e0b" size={30} />} count={String(inProgress)} />
        <Card title="Completed" icon={<CheckCircle2 color="#4ade80" size={30} />} count={String(completed)} />
        <Card title="Overdue" icon={<AlertTriangle color="#ef4444" size={30} />} count={String(overdue)} />
      </div>

      {/* Add Task */}
      <button
        onClick={() => setIsPopupOpen(true)}
        className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 px-10 cursor-pointer font-medium mt-5 rounded-md hover:opacity-70 text-white"
      >
        + Add Task
      </button>

      {/* Create modal */}
      <AddTask
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onCreate={createTask}
      />

      {/* Edit modal */}
      <AddTask
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        initialData={editingTask}
        onUpdate={(payload) => updateTask(editingTask._id, payload)}
      />

      {/* Lists */}
      <div className="mt-20 space-y-10">
        {/* Pending */}
        <div>
          <div className="text-white text-2xl font-semibold mb-4">
            Pending Tasks ({pendingTasks.length})
          </div>
          {pendingTasks.length === 0 ? (
            <div className="text-gray-400 text-sm">No pending tasks.</div>
          ) : (
            <div className="space-y-4">
              {pendingTasks.map((t) => (
                <TaskRow
                  key={t._id}
                  t={t}
                  onDone={() => markDone(t._id)}
                  onEdit={() => setEditingTask(t)}
                  onDelete={() => removeTask(t._id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Completed */}
        <div>
          <div className="text-white text-2xl font-semibold mb-4">
            Completed Tasks ({completedTasks.length})
          </div>
          {completedTasks.length === 0 ? (
            <div className="text-gray-400 text-sm">No completed tasks yet.</div>
          ) : (
            <div className="space-y-4">
              {completedTasks.map((t) => (
                <TaskRow key={t._id} t={t} done onDelete={() => removeTask(t._id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function TaskRow({ t, done = false, onDone, onEdit, onDelete }) {
  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-4 text-white shadow-sm">
      {/* Title + badges */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="font-semibold hover:underline truncate">
            {t.title}
          </div>

          {/* Assigned + Category */}
          <div className="mt-1 text-sm text-slate-300">
            Assigned to:{" "}
            <span className="text-white">
              {t.coordinator ? `${t.coordinator} (Coordinator)` : "—"}
            </span>
            <br />
            Description:{" "}
            <span className="text-white">
              {t.description || "—"}
            </span>
            <br />
            Other Staffs:{" "}
            <div className="text-white flex-col">
              {t.otherStaffs || "—"}
            </div>
          </div>
        </div>

        {/* Right side: Due + pills */}
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="text-sm text-slate-300">
            <span className="mr-1">Due:</span>
            <span className="text-white">
              {t.dueDate ? t.dueDate.split("T")[0] : "—"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Pill
              label={priorityLabel(t.priority)}
              color={priorityColor(t.priority)}
            />
            <Pill
              label={statusLabel(done ? "done" : t.status)}
              color={statusColor(done ? "done" : t.status)}
            />
          </div>
        </div>
      </div>

      {/* Actions (small icon buttons like the mock) */}
      <div className="mt-3 flex items-center gap-3 text-slate-300">
        {!done && (
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs hover:bg-white/10"
            title="Edit"
          >
            <Pencil size={14} /> Edit
          </button>
        )}
        {!done && (
          <button
            onClick={onDone}
            className="inline-flex items-center gap-1 rounded-md border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-300 hover:bg-emerald-400/15"
            title="Mark Done"
          >
            <RefreshCcw size={14} /> Complete
          </button>
        )}
        <button
          onClick={onDelete}
          className="ml-auto inline-flex items-center gap-1 rounded-md border border-rose-400/20 bg-rose-400/10 px-2 py-1 text-xs text-rose-300 hover:bg-rose-400/15"
          title="Delete"
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </div>
  );
}

function Card({ title, icon, count }) {
  return (
    <div className="flex flex-col justify-between bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 rounded-xl p-6 w-full h-32 shadow-lg">
      <div className="flex justify-between items-center">
        <div className="text-white text-lg font-medium">{title}</div>
        <div>{icon}</div>
      </div>
      <div className="text-3xl font-bold text-white mt-2">{count}</div>
    </div>
  );
}

function Pill({ label, color }) {
  return (
    <span
      className={`inline-flex h-6 items-center rounded-full border px-2 text-xs font-medium
      ${color.bg} ${color.text} ${color.border}`}
    >
      {label}
    </span>
  );
}

function priorityLabel(p = "medium") {
  const v = String(p || "medium").toLowerCase();
  if (v === "high") return "High";
  if (v === "low") return "Low";
  if (v === "urgent") return "Urgent";
  return "Medium";
}
function priorityColor(p = "medium") {
  const v = String(p || "medium").toLowerCase();
  if (v === "urgent")
    return { bg: "bg-rose-500/15", text: "text-rose-300", border: "border-rose-400/25" };
  if (v === "high")
    return { bg: "bg-amber-500/15", text: "text-amber-300", border: "border-amber-400/25" };
  if (v === "low")
    return { bg: "bg-sky-500/15", text: "text-sky-300", border: "border-sky-400/25" };
  return { bg: "bg-indigo-500/15", text: "text-indigo-300", border: "border-indigo-400/25" }; // medium
}

function statusLabel(s = "todo") {
  const v = String(s || "todo").toLowerCase().replace("_", " ");
  if (v === "in progress") return "In Progress";
  if (v === "pending") return "Pending";
  if (v === "done") return "Completed";
  if (v === "blocked") return "Blocked";
  return "Todo";
}
function statusColor(s = "todo") {
  const v = String(s || "todo").toLowerCase().replace("_", " ");
  if (v === "in progress")
    return { bg: "bg-sky-500/15", text: "text-sky-300", border: "border-sky-400/25" };
  if (v === "pending")
    return { bg: "bg-amber-500/15", text: "text-amber-300", border: "border-amber-400/25" };
  if (v === "done")
    return { bg: "bg-emerald-500/15", text: "text-emerald-300", border: "border-emerald-400/25" };
  if (v === "blocked")
    return { bg: "bg-rose-500/15", text: "text-rose-300", border: "border-rose-400/25" };
  return { bg: "bg-slate-500/15", text: "text-slate-300", border: "border-slate-400/25" };
}

function StatusPill({ value }) {
  const map = {
    todo: "bg-gray-500/20 border-gray-300/20",
    in_progress: "bg-yellow-500/20 border-yellow-300/20",
    done: "bg-green-500/20 border-green-300/20",
    blocked: "bg-red-500/20 border-red-300/20",
  };
  const label = String(value || "todo").replace("_", " ");
  return (
    <div className={`text-xs rounded-full border w-auto px-3 h-5 flex items-center ${map[value] || map.todo}`}>
      {label}
    </div>
  );
}

export default Task;
