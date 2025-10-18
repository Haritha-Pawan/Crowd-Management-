// Task.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Pencil, RefreshCcw, Trash2 } from "lucide-react";
import axios from "axios";
import { ClipboardList, CheckCircle2, AlertTriangle, TimerReset } from "lucide-react";
import AddTask from "../Task/AddTask";

// ✅ PDF deps
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { addBusinessHeader, BUSINESS_INFO } from "../../../assets/pdfHeader";

const API = "http://localhost:5000/api";


const normalizeStatus = (s) => {
  const v = String(s || "todo").toLowerCase().replace(" ", "_");
  const ok = new Set(["todo", "in_progress", "done", "blocked"]);
  return ok.has(v) ? v : "todo";
};
const normalizePriority = (p) => {
  const v = String(p || "medium").toLowerCase();
  return ["low", "medium", "high", "urgent"].includes(v) ? v : "medium";
};
const ymdLocal = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const normalizeTask = (t) => ({
  ...t,
  status: normalizeStatus(t.status),
  priority: normalizePriority(t.priority),
  dueDate: t.dueDate ? ymdLocal(t.dueDate) : "",
  title: (t.title || "").trim(),
  description: (t.description || "").trim(),
  coordinator: (t.coordinator || "").trim(),
});

const todayYmd = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const isOverdue = (task) => {
  if (!task.dueDate || task.status === "done") return false;
  return task.dueDate < todayYmd(); // lexical compare ok for YYYY-MM-DD
};

/* ------------------------ Light payload validation (belt & suspenders) ------------------------ */
const validatePayload = (p) => {
  const e = [];
  const title = (p.title || "").trim();
  if (!title || title.length < 3) e.push("Title too short");
  const pr = String(p.priority || "").toLowerCase();
  if (!["low", "medium", "high", "urgent"].includes(pr)) e.push("Bad priority");
  const st = String(p.status || "").toLowerCase();
  if (!["todo", "in_progress", "done", "blocked"].includes(st)) e.push("Bad status");
  const ymd = p.dueDate ? String(p.dueDate).slice(0, 10) : "";
  const today = todayYmd();
  if (ymd && st !== "done" && ymd < today) e.push("Due date in the past");
  return e;
};

/* ------------------------ Parse staffs helper ------------------------ */
function parseOtherStaffs(val) {
  if (Array.isArray(val)) return val.filter(Boolean);
  return String(val || "")
    .split(/\r?\n|,/) // split on newlines or commas
    .map((s) => s.trim())
    .filter(Boolean);
}

/* ------------------------ Component ------------------------ */
const Task = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);

  // Load tasks once (with normalization + error handling)
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API}/tasks`);
        setTasks(Array.isArray(data) ? data.map(normalizeTask) : []);
      } catch (err) {
        console.error(err);
        alert("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Derived lists (based on normalized status)
  const pendingTasks = useMemo(
    () => tasks.filter((t) => t.status !== "done"),
    [tasks]
  );
  const completedTasks = useMemo(
    () => tasks.filter((t) => t.status === "done"),
    [tasks]
  );

  // Cards
  const total = tasks.length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const completed = completedTasks.length;
  const overdue = tasks.filter(isOverdue).length;

  /* ------------------------ CRUD handlers ------------------------ */
  const createTask = async (payload) => {
    const errs = validatePayload(payload);
    if (errs.length) return alert(errs.join("\n"));
    try {
      const { data } = await axios.post(`${API}/tasks`, payload);
      setTasks((prev) => [normalizeTask(data), ...prev]);
      setIsPopupOpen(false);
    } catch (e) {
      console.error(e);
      alert("Create failed");
    }
  };

  const updateTask = async (id, payload) => {
    const errs = validatePayload(payload);
    if (errs.length) return alert(errs.join("\n"));
    try {
      const { data } = await axios.put(`${API}/tasks/${id}`, payload);
      setTasks((prev) => prev.map((t) => (t._id === id ? normalizeTask(data) : t)));
      setEditingTask(null);
    } catch (e) {
      console.error(e);
      alert("Update failed");
    }
  };

  const markDone = async (id) => {
    const current = tasks.find((t) => t._id === id);
    if (!current) return;
    if (current.status === "done") return; // already done
    try {
      const { data } = await axios.put(`${API}/tasks/${id}`, { status: "done" });
      setTasks((prev) => prev.map((t) => (t._id === id ? normalizeTask(data) : t)));
    } catch (e) {
      console.error(e);
      alert("Failed to mark as done");
    }
  };

  const removeTask = async (id) => {
    const current = tasks.find((t) => t._id === id);
    if (!current) return;
    if (!confirm(`Delete task "${current.title}"? This cannot be undone.`)) return;

    try {
      await axios.delete(`${API}/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (e) {
      console.error(e);
      alert("Delete failed");
    }
  };

  /* ------------------------ Export PDF (guarded) ------------------------ */
  const generatePdf = () => {
    if (!Array.isArray(tasks) || tasks.length === 0) {
      alert("No tasks to export.");
      return;
    }
    try {
      const doc = new jsPDF();

      const headerInfo = { ...(BUSINESS_INFO || {}) };
      const safeAddHeader =
        typeof addBusinessHeader === "function" ? addBusinessHeader : () => {};

      const didDrawPage = (data) => {
        safeAddHeader(doc, headerInfo);
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

      // Title + filename
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
        due: t.dueDate || "—",
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
      doc.text(
        `Totals: ${total} | In Progress: ${inProgress} | Completed: ${completed} | Overdue: ${overdue}`,
        14,
        52
      );

      // Pending section
      doc.setFont("helvetica", "bold").setFontSize(12);
      doc.text(`Pending Tasks (${pendingRows.length})`, 14, 62);

      autoTable(doc, {
        startY: 66,
        head: [columns.map((c) => c.header)],
        body: pendingRows.map((r) => columns.map((c) => r[c.dataKey])),
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
        head: [columns.map((c) => c.header)],
        body: completedRows.map((r) => columns.map((c) => r[c.dataKey])),
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [40, 44, 52], textColor: 255 },
        didDrawPage,
        margin: { left: 14, right: 14 },
        tableWidth: "auto",
      });

      doc.save(fileName);
    } catch (e) {
      console.error(e);
      alert("Failed to generate PDF");
    }
  };

  return (
    <div className="p-12 2xl:h-screen w-full">
      <div className="header text-white text-3xl font-bold">Task Management</div>
      <div className="sub-heading text-gray-300 text-xl">
        Create tasks and assign a coordinator
      </div>

      {/* Cards */}
      <div className="card grid 2xl:grid-cols-4 lg:grid-cols-4 mt-8 md:grid-cols-2 gap-3 mx-auto">
        <Card
          title="Total Tasks"
          icon={<ClipboardList color="#2f80ed" size={30} />}
          count={String(total)}
        />
        <Card
          title="In Progress"
          icon={<TimerReset color="#f59e0b" size={30} />}
          count={String(inProgress)}
        />
        <Card
          title="Completed"
          icon={<CheckCircle2 color="#4ade80" size={30} />}
          count={String(completed)}
        />
        <Card
          title="Overdue"
          icon={<AlertTriangle color="#ef4444" size={30} />}
          count={String(overdue)}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsPopupOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 px-10 cursor-pointer font-medium mt-5 rounded-md hover:opacity-70 text-white"
        >
          + Add Task
        </button>

        {/* Export PDF */}
        <button
          onClick={generatePdf}
          disabled={loading || tasks.length === 0}
          className={`mt-5 inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm text-white
            ${loading || tasks.length === 0
              ? "border-white/10 bg-white/5 opacity-60 cursor-not-allowed"
              : "border-white/10 bg-white/5 hover:bg-white/10"}`}
          title={
            loading ? "Loading tasks..." : tasks.length === 0 ? "No tasks to export" : "Export PDF"
          }
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

/* ------------------------ Row & UI helpers ------------------------ */
function TaskRow({ t, done = false, onDone, onEdit, onDelete }) {
  const staffList = parseOtherStaffs(t.otherStaffs);

  const completeDisabled = t.status === "done" || t.status === "blocked";

  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-4 text-white shadow-sm">
      {/* Title + badges */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="font-semibold hover:underline truncate">{t.title}</div>

          {/* Assigned + Details */}
          <div className="mt-1 text-sm text-slate-300">
            Assigned to:{" "}
            <span className="text-white">
              {t.coordinator ? `${t.coordinator} (Coordinator)` : "—"}
            </span>
            <br />
            Description: <span className="text-white">{t.description || "—"}</span>
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
            <span className="text-white">{t.dueDate || "—"}</span>
          </div>

          <div className="flex items-center gap-2">
            <Pill label={priorityLabel(t.priority)} color={priorityColor(t.priority)} />
            <Pill label={statusLabel(done ? "done" : t.status)} color={statusColor(done ? "done" : t.status)} />
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
            disabled={completeDisabled}
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs
              ${
                completeDisabled
                  ? "border-white/10 bg-white/5 opacity-60 cursor-not-allowed"
                  : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/15"
              }`}
            title={t.status === "blocked" ? "Task is blocked" : "Mark Done"}
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

/* ------------------------ Label & color helpers ------------------------ */
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
