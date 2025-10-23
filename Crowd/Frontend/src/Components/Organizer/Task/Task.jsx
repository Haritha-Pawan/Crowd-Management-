// Task.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Pencil, RefreshCcw, Trash2, Search } from "lucide-react";
import axios from "axios";
import { ClipboardList, CheckCircle2, AlertTriangle, TimerReset } from "lucide-react";
import AddTask from "../Task/AddTask";

// ✅ NEW: PDF deps
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
// Adjust the path if needed (e.g., "../../utils/pdfHeader")
import { addBusinessHeader, BUSINESS_INFO } from "../../../assets/pdfHeader";

const API = "http://localhost:5000/api";

const Task = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Load tasks once
  useEffect(() => {
    (async () => {
      const { data } = await axios.get(`${API}/tasks`);
      setTasks(data);
    })();
  }, []);

  // Derived lists
  const baseCompletedTasks = useMemo(
    () => tasks.filter((t) => t.status === "done"),
    [tasks]
  );

  const filteredTasks = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return tasks;

    return tasks.filter((t) => {
      const fields = [
        t.title,
        t.coordinator,
        t.status,
        t.priority,
        t.description,
        t.dueDate ? t.dueDate.split("T")[0] : "",
        parseOtherStaffs(t.otherStaffs || []).join(" "),
      ];

      return fields.some((field) =>
        String(field || "").toLowerCase().includes(term)
      );
    });
  }, [tasks, searchTerm]);

  const pendingTasks = useMemo(
    () => filteredTasks.filter((t) => t.status !== "done"),
    [filteredTasks]
  );
  const completedTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === "done"),
    [filteredTasks]
  );

  // Cards
  const total = tasks.length;
  const inProgress = tasks.filter(t => t.status === "in_progress").length;
  const completed = baseCompletedTasks.length;
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

  // ---------- NEW: Export PDF ----------
  const generatePdf = () => {
    const doc = new jsPDF();

    // Repeat header on each page
    const headerInfo = {
      ...BUSINESS_INFO,
      // You can override per-report here if needed:
      // name: "Your Org Name",
      // logo: "data:image/png;base64,...."
    };

    // Will be called for each page (including first)
    const didDrawPage = (data) => {
      addBusinessHeader(doc, headerInfo);
      // footer with page numbers
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(9).setTextColor(120);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        doc.internal.pageSize.getWidth() - 20,
        doc.internal.pageSize.getHeight() - 10,
        { align: "right" }
      );
    };

    // Title
    const reportTitle = "Task Report";
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const fileName = `Task_Report_${yyyy}-${mm}-${dd}.pdf`;

    // Build table rows
    const toRow = (t) => ({
      title: t.title || "—",
      coordinator: t.coordinator || "—",
      priority: priorityLabel(t.priority || "medium"),
      status: statusLabel(t.status || "todo"),
      due: t.dueDate ? String(t.dueDate).split("T")[0] : "—",
      others: parseOtherStaffs(t.otherStaffs || []).join(", ") || "—",
    });

    const pendingRows = pendingTasks.map(toRow);
    const completedRows = completedTasks.map(toRow);

    // common columns
    const columns = [
      { header: "Title", dataKey: "title" },
      { header: "Coordinator", dataKey: "coordinator" },
      { header: "Priority", dataKey: "priority" },
      { header: "Status", dataKey: "status" },
      { header: "Due", dataKey: "due" },
      { header: "Other Staffs", dataKey: "others" },
    ];

    // First page header draw
    didDrawPage({ pageNumber: 1 });

    // Report title + meta under header
    doc.setFont("helvetica", "bold").setFontSize(14);
    doc.text(reportTitle, 14, 40);
    doc.setFont("helvetica", "normal").setFontSize(10);
    doc.text(`Generated: ${yyyy}-${mm}-${dd}`, 14, 46);
    doc.text(`Totals: ${total} | In Progress: ${inProgress} | Completed: ${completed} | Overdue: ${overdue}`, 14, 52);

    // Pending section
    doc.setFont("helvetica", "bold").setFontSize(12);
    doc.text(`Pending Tasks (${pendingRows.length})`, 14, 62);

    autoTable(doc, {
      startY: 66,
      head: [columns.map(c => c.header)],
      body: pendingRows.map(r => columns.map(c => r[c.dataKey])),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [40, 44, 52], textColor: 255 },
      didDrawPage,
      margin: { left: 14, right: 14 },
      tableWidth: "auto",
    });

    // Completed section (continue where last table ended)
    const nextY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 66;
    doc.setFont("helvetica", "bold").setFontSize(12);
    doc.text(`Completed Tasks (${completedRows.length})`, 14, nextY);

    autoTable(doc, {
      startY: nextY + 4,
      head: [columns.map(c => c.header)],
      body: completedRows.map(r => columns.map(c => r[c.dataKey])),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [40, 44, 52], textColor: 255 },
      didDrawPage,
      margin: { left: 14, right: 14 },
      tableWidth: "auto",
    });

    doc.save(fileName);
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

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search
            size={16}
            className="pointer-events-none absolute mt-3 left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks by title, coordinator, status, or due date"
            className="w-full rounded-lg border border-white/10 bg-white/5 mt-5 py-2 pl-9 pr-8 text-sm text-white placeholder:text-white/50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          ) : null}
        </div>

        <button
          onClick={() => setIsPopupOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 px-10 cursor-pointer font-medium mt-5 rounded-md hover:opacity-70 text-white"
        >
          + Add Task
        </button>

        {/* ✅ NEW: Export PDF */}
        <button
          onClick={generatePdf}
          className="mt-5 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
          title="Export PDF"
        >
          <ClipboardList size={16} />
          Export PDF
        </button>
      </div>

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
            <div className="text-gray-400 text-sm">
              {searchTerm.trim()
                ? "No tasks match your search."
                : "No pending tasks."}
            </div>
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
            <div className="text-gray-400 text-sm">
              {searchTerm.trim()
                ? "No tasks match your search."
                : "No completed tasks yet."}
            </div>
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

/* helper to render otherStaffs line-by-line */
function parseOtherStaffs(val) {
  if (Array.isArray(val)) return val.filter(Boolean);
  return String(val || "")
    .split(/\r?\n|,/)     // split on newlines or commas
    .map(s => s.trim())
    .filter(Boolean);
}

function TaskRow({ t, done = false, onDone, onEdit, onDelete }) {
  const staffList = parseOtherStaffs(t.otherStaffs);

  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-4 text-white shadow-sm">
      {/* Title + badges */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="font-semibold hover:underline truncate">
            {t.title}
          </div>

          {/* Assigned + Details */}
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
            Other Staffs:
            {staffList.length === 0 ? (
              <span className="text-white"> {" "}—</span>
            ) : (
              <div className="text-white flex flex-col mt-1">
                {staffList.map((name, i) => (
                  <div key={i}>{name}</div>
                ))}
              </div>
            )}
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

      {/* Actions */}
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

export default Task;
