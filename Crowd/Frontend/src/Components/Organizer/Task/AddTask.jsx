import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";           // (not used here but kept for parity)
const USERS_API = "http://localhost:5000/users";   // for coordinators

const emptyForm = {
  title: "",
  description: "",
  coordinator: "",
  otherStaffs: "",
  priority: "medium",
  status: "todo",
  dueDate: "",
};

const PRIORITIES = ["low", "medium", "high"];
const STATUSES_DISPLAY = ["todo", "in progress", "done", "blocked"]; // display labels

// --- date helpers (LOCAL, no UTC) ---
const pad = (n) => String(n).padStart(2, "0");
const todayYmdLocal = () => {
  const d = new Date();
  // use local parts to avoid UTC shifting
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  return `${y}-${m}-${day}`;
};
const cmpYmd = (a, b) => {
  // returns -1 if a<b, 0 if a==b, 1 if a>b (lex compare ok for YYYY-MM-DD)
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;
  return a < b ? -1 : a > b ? 1 : 0;
};
const isPastLocal = (yyyyMmDd) => cmpYmd(yyyyMmDd, todayYmdLocal()) === -1;

const nameOk = (s) => /^[A-Za-z .'\-]{2,50}$/.test(String(s || "").trim());

const AddTask = ({ isOpen, onClose, onCreate, onUpdate, initialData }) => {
  const isEdit = !!initialData;
  const [form, setForm] = useState(emptyForm);

  // users state for coordinator dropdown
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");

  // validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // load users when modal opens
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        setUsersLoading(true);
        setUsersError("");
        const { data } = await axios.get(USERS_API);
        setUsers(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("load users", e);
        setUsersError("Failed to load users");
      } finally {
        setUsersLoading(false);
      }
    })();
  }, [isOpen]);

  // only coordinators (case-insensitive)
  const coordinators = useMemo(
    () => users.filter((u) => String(u.role || "").toLowerCase() === "coordinator"),
    [users]
  );

  // hydrate form for edit/create
  useEffect(() => {
    if (initialData) {
      const hydrated = {
        ...emptyForm,
        ...initialData,
        status: String(initialData.status || "todo").replace("_", " "),
        dueDate: initialData.dueDate ? String(initialData.dueDate).split("T")[0] : "",
      };
      setForm(hydrated);
      setErrors(validate(hydrated, coordinators));
      setTouched({});
    } else {
      setForm((prev) => ({
        ...emptyForm,
        dueDate: "", // leave empty until user sets it
      }));
      setErrors({});
      setTouched({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, coordinators.length]);

  if (!isOpen) return null;

  // --- validation core ---
  function validate(f, coordList) {
    const e = {};
    const title = (f.title || "").trim();
    const desc = (f.description || "").trim();
    const coord = (f.coordinator || "").trim();
    const due = f.dueDate || "";

    // Title: required 3–50 chars
    if (title.length < 3 || title.length > 50) {
      e.title = "Title must be 3–50 characters";
    }

    // Description: optional, but if provided then ≥5 chars (and ≤300)
    if (desc && desc.length < 5) e.description = "Description must be at least 5 characters";
    if (desc.length > 300) e.description = "Description cannot exceed 300 characters";

    // Coordinator: required + must be one of coordinators
    if (!coord) e.coordinator = "Coordinator is required";
    else if (!coordList.some((c) => c.name === coord)) e.coordinator = "Pick a valid coordinator";

    // Due date: required; cannot be in past unless status is done
    const statusDisp = String(f.status || "").toLowerCase();
    const isDone = statusDisp === "done";
    if (!due) e.dueDate = "Due date is required";
    else if (!isDone && isPastLocal(due)) e.dueDate = "Due date cannot be in the past";

    // Other staffs: parse & validate
    const staff = String(f.otherStaffs || "")
      .split(/\r?\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (staff.length > 10) e.otherStaffs = "Limit to 10 names";
    if (staff.some((s) => !nameOk(s))) {
      e.otherStaffs = "Names can use letters, spaces, . ' - only (2–50 chars each)";
    }

    // Enums
    const p = String(f.priority || "").toLowerCase();
    const okStatus = STATUSES_DISPLAY.map((x) => x.toLowerCase());
    if (!PRIORITIES.includes(p)) e.priority = "Invalid priority";
    if (!okStatus.includes(statusDisp)) e.status = "Invalid status";

    return e;
  }

  // change handlers with live validation + CLAMPING for dueDate
  const onField = (k) => (e) => {
    let v = e.target.value;

    setForm((f) => {
      let nf = { ...f, [k]: v };

      // If status changed away from "done" and dueDate is in the past, bump to today
      if (k === "status") {
        const newStatus = String(v).toLowerCase();
        if (newStatus !== "done" && nf.dueDate && isPastLocal(nf.dueDate)) {
          nf.dueDate = todayYmdLocal();
        }
      }

      // If dueDate changed and status is not "done", clamp to today if past
      if (k === "dueDate") {
        const statusDisp = String(nf.status || "").toLowerCase();
        const notDone = statusDisp !== "done";
        if (notDone && v && isPastLocal(v)) {
          nf.dueDate = todayYmdLocal(); // CLAMP
        }
      }

      setErrors(validate(nf, coordinators));
      return nf;
    });

    setTouched((t) => ({ ...t, [k]: true }));
  };

  // blur -> mark touched
  const onBlur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));

  // computed flags
  const hasErrors = Object.keys(errors).length > 0;
  const minDate = todayYmdLocal();

  // submit
  const submit = async (e) => {
    e.preventDefault();

    // trim core fields
    const final = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      coordinator: form.coordinator.trim(),
      otherStaffs: form.otherStaffs,
    };

    const eMap = validate(final, coordinators);
    setErrors(eMap);
    setTouched({
      title: true,
      description: true,
      coordinator: true,
      otherStaffs: true,
      priority: true,
      status: true,
      dueDate: true,
    });
    if (Object.keys(eMap).length) return; // block submission

    const payload = {
      title: final.title,
      description: final.description,
      coordinator: final.coordinator,
      otherStaffs: final.otherStaffs,
      priority: final.priority.toLowerCase(),
      status: final.status.toLowerCase().replace(" ", "_"),
      dueDate: final.dueDate || null,
    };

    try {
      setSubmitting(true);
      if (isEdit) onUpdate?.(payload);
      else onCreate?.(payload);
    } finally {
      setSubmitting(false);
    }
  };

  // char counters
  const titleLen = (form.title || "").length;
  const descLen = (form.description || "").length;

  return (
    <div className="fixed z-50 inset-0 flex justify-center items-center bg-black/60">
      <div className="w-[90%] max-w-2xl bg-[#0f172a] p-5 rounded-md border border-white/10">
        <h2 className="text-white font-bold text-xl">
          {isEdit ? "Edit Task" : "Add New Task"}
        </h2>
        <h6 className="text-gray-300 font-bold text-xs">
          {isEdit ? "Update task details" : "Assign a new task for the event"}
        </h6>

        <form onSubmit={submit} className="mt-4">
          {/* Title */}
          <div className="flex gap-5 mt-2 items-start">
            <label className="text-white font-bold w-32">Task Title *</label>
            <div>
              <input
                value={form.title}
                onChange={onField("title")}
                onBlur={onBlur("title")}
                type="text"
                placeholder="Task title"
                maxLength={50}
                className={`text-white bg-[#272f40] border rounded-md p-2 w-[300px] placeholder:text-gray-500
                  ${touched.title && errors.title ? "border-rose-400/70" : "border-white/20"}`}
                aria-invalid={!!(touched.title && errors.title)}
                aria-describedby="title-error"
              />
              <div className="flex justify-between mt-1 text-xs">
                <span className="text-gray-400">Min 3, Max 50</span>
                <span className="text-gray-400">{titleLen}/50</span>
              </div>
              {touched.title && errors.title && (
                <div id="title-error" className="text-rose-400 text-xs mt-1">
                  {errors.title}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="flex gap-5 mt-4 items-start">
            <label className="text-white font-bold w-32">Description</label>
            <div>
              <input
                value={form.description}
                onChange={onField("description")}
                onBlur={onBlur("description")}
                type="text"
                placeholder="Description"
                maxLength={300}
                className={`text-white bg-[#272f40] border rounded-md p-2 w-[300px] placeholder:text-gray-500
                  ${touched.description && errors.description ? "border-rose-400/70" : "border-white/20"}`}
                aria-invalid={!!(touched.description && errors.description)}
                aria-describedby="description-error"
              />
              <div className="flex justify-between mt-1 text-xs">
                <span className="text-gray-400">Optional, ≥ 5 if provided</span>
                <span className="text-gray-400">{descLen}/300</span>
              </div>
              {touched.description && errors.description && (
                <div id="description-error" className="text-rose-400 text-xs mt-1">
                  {errors.description}
                </div>
              )}
            </div>
          </div>

          {/* Coordinator */}
          <div className="flex gap-5 mt-4 items-start">
            <label className="text-white font-bold w-32">Coordinator *</label>
            <div>
              <select
                value={form.coordinator}
                onChange={onField("coordinator")}
                onBlur={onBlur("coordinator")}
                className={`text-white bg-[#272f40] border rounded-md p-2 w-[300px]
                  ${touched.coordinator && errors.coordinator ? "border-rose-400/70" : "border-white/20"}`}
                disabled={usersLoading}
                aria-invalid={!!(touched.coordinator && errors.coordinator)}
                aria-describedby="coordinator-error"
              >
                <option value="">
                  {usersLoading ? "Loading coordinators..." : "Select coordinator"}
                </option>
                {coordinators.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              {usersError ? (
                <div className="text-rose-400 text-xs mt-1">{usersError}</div>
              ) : null}
              {touched.coordinator && errors.coordinator && (
                <div id="coordinator-error" className="text-rose-400 text-xs mt-1">
                  {errors.coordinator}
                </div>
              )}
            </div>
          </div>

          {/* Other Staffs */}
          <div className="flex gap-5 mt-4 items-start">
            <label className="text-white font-bold w-32">Other Staffs</label>
            <div>
              <textarea
                value={form.otherStaffs}
                onChange={onField("otherStaffs")}
                onBlur={onBlur("otherStaffs")}
                placeholder="Enter names (comma or newline separated)"
                className={`text-white bg-[#272f40] border rounded-md p-2 w-[300px] placeholder:text-gray-500
                  ${touched.otherStaffs && errors.otherStaffs ? "border-rose-400/70" : "border-white/20"}`}
                rows={3}
                aria-invalid={!!(touched.otherStaffs && errors.otherStaffs)}
                aria-describedby="otherStaffs-error"
              />
              <div className="text-xs text-gray-400 mt-1">
                Tip: John Doe, Jane P. Smith (max 10 names)
              </div>
              {touched.otherStaffs && errors.otherStaffs && (
                <div id="otherStaffs-error" className="text-rose-400 text-xs mt-1">
                  {errors.otherStaffs}
                </div>
              )}
            </div>
          </div>

          {/* Priority + Status */}
          <div className="flex gap-5 mt-4">
            <div>
              <label className="text-white flex mb-1 font-bold">Priority</label>
              <select
                value={form.priority}
                onChange={onField("priority")}
                onBlur={onBlur("priority")}
                className={`text-white bg-[#272f40] border rounded-md p-2 w-[300px]
                  ${touched.priority && errors.priority ? "border-rose-400/70" : "border-white/20"}`}
                aria-invalid={!!(touched.priority && errors.priority)}
                aria-describedby="priority-error"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              {touched.priority && errors.priority && (
                <div id="priority-error" className="text-rose-400 text-xs mt-1">
                  {errors.priority}
                </div>
              )}
            </div>

            <div>
              <label className="text-white flex mb-1 font-bold">Status</label>
              <select
                value={form.status}
                onChange={onField("status")}
                onBlur={onBlur("status")}
                className={`text-white bg-[#272f40] border rounded-md p-2 w-[300px]
                  ${touched.status && errors.status ? "border-rose-400/70" : "border-white/20"}`}
                aria-invalid={!!(touched.status && errors.status)}
                aria-describedby="status-error"
              >
                {STATUSES_DISPLAY.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {touched.status && errors.status && (
                <div id="status-error" className="text-rose-400 text-xs mt-1">
                  {errors.status}
                </div>
              )}
            </div>
          </div>

          {/* Due Date */}
          <div className="mt-4">
            <label className="text-white flex mb-1 font-bold">Due Date *</label>
            <input
              value={form.dueDate}
              onChange={onField("dueDate")}
              onBlur={onBlur("dueDate")}
              type="date"
              // min only applies when NOT "done"
              min={form.status.toLowerCase() === "done" ? undefined : minDate}
              className={`text-white bg-[#272f40] border rounded-md p-2 w-[300px] placeholder:text-gray-500
                ${touched.dueDate && errors.dueDate ? "border-rose-400/70" : "border-white/20"}`}
              aria-invalid={!!(touched.dueDate && errors.dueDate)}
              aria-describedby="dueDate-error"
            />
            {touched.dueDate && errors.dueDate && (
              <div id="dueDate-error" className="text-rose-400 text-xs mt-1">
                {errors.dueDate}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="btn flex gap-3 justify-end mt-5">
            <button
              type="button"
              onClick={onClose}
              className="w-30 bg-white/5 rounded-md border border-white/10 px-4 py-1 text-white"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={submitting || Object.keys(errors).length > 0}
              className={`w-30 rounded-md px-4 py-1 text-white
                ${submitting || hasErrors
                  ? "bg-gradient-to-r from-slate-500 to-slate-600 cursor-not-allowed opacity-70"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90"}`}
              title={hasErrors ? "Fix validation errors before submitting" : ""}
            >
              {isEdit ? (submitting ? "Updating..." : "Update Task") : (submitting ? "Creating..." : "Create Task")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTask;