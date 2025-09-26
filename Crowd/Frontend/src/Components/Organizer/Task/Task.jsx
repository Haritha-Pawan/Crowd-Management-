import React, { useEffect, useMemo, useState } from "react";
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
    <div className="p-12 2xl:h-screen">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {pendingTasks.map((t) => (
                <TaskCard
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {completedTasks.map((t) => (
                <TaskCard
                  key={t._id}
                  t={t}
                  done
                  onDelete={() => removeTask(t._id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function TaskCard({ t, done = false, onDone, onEdit, onDelete }) {
  return (
    <div className="p-5 bg-white/5 border border-white/10 rounded-md text-white text-2xl font-medium">
      <div className="title flex gap-3 items-start">
        <span>{t.title}</span>
        <StatusPill value={done ? "done" : t.status} />
      </div>

      <div className="sub-heading flex mt-2 text-gray-300 items-center gap-2 text-sm">
        <UserRound size={18} />
        <div>Coordinator: <span className="text-white">{t.coordinator || "—"}</span></div>
      </div>

      <div className="mt-3 text-sm text-gray-300 space-y-1">
        <div>Priority: <span className="text-white font-medium">{t.priority || "medium"}</span></div>
        <div>Description: <span className="text-white/90">{t.description || "—"}</span></div>
        <div>Due: <span className="text-white">{t.dueDate ? t.dueDate.split("T")[0] : "—"}</span></div>
        {t.otherStaffs ? <div>Other Staffs: <span className="text-white/90">{t.otherStaffs}</span></div> : null}
      </div>

      <div className="progress mt-3 h-2.5 w-full overflow-hidden rounded-full bg-black/40">
        <div
          className={
            "h-full rounded-full " +
            (done
              ? "bg-green-500 w-full"
              : t.status === "in_progress"
              ? "bg-blue-600 w-1/2"
              : t.status === "blocked"
              ? "bg-red-500 w-1/4"
              : "bg-yellow-400 w-0")
          }
        />
      </div>

      <div className="btn mt-4 flex gap-3">
        {!done && (
          <button
            onClick={onDone}
            className="border border-white/10 px-4 py-1 bg-white/5 rounded-md text-[16px] cursor-pointer text-white"
          >
            Mark Done
          </button>
        )}

        {!done && (
          <button
            onClick={onEdit}
            className="border border-white/10 px-4 py-1 bg-white/5 rounded-md text-[16px] cursor-pointer text-blue-400"
          >
            Edit
          </button>
        )}

        <button
          onClick={onDelete}
          className="border border-white/10 px-4 py-1 bg-white/5 rounded-md text-[16px] cursor-pointer text-red-400"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

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
