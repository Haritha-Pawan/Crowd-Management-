import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

const emptyForm = {
  title: "",
  description: "",
  coordinator: "",
  otherStaffs: "",
  priority: "medium",
  status: "todo",
  dueDate: "",
};

const AddTask = ({ isOpen, onClose, onCreate, onUpdate, initialData }) => {
  const isEdit = !!initialData;
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (initialData) {
      setForm({
        ...emptyForm,
        ...initialData,
        // normalize for UI
        status: String(initialData.status || "todo").replace("_", " "),
        dueDate: initialData.dueDate ? initialData.dueDate.split("T")[0] : "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return alert("Title is required");

    // normalize to backend format
    const payload = {
      title: form.title,
      description: form.description,
      coordinator: form.coordinator,
      otherStaffs: form.otherStaffs,
      priority: form.priority.toLowerCase(),
      status: form.status.toLowerCase().replace(" ", "_"),
      dueDate: form.dueDate || null,
    };

    if (isEdit) {
      onUpdate?.(payload);
    } else {
      onCreate?.(payload);
    }
  };

  return (
    <div className="fixed z-50 inset-0 flex justify-center items-center bg-black/60">
      <div className="w-[90%] max-w-2xl bg-[#0f172a] p-5 rounded-md border border-white/10">
        <h2 className="text-white font-bold text-xl">{isEdit ? "Edit Task" : "Add New Task"}</h2>
        <h6 className="text-gray-300 font-bold text-xs">{isEdit ? "Update task details" : "Assign a new task for the event"}</h6>

        <form onSubmit={submit} className="mt-4">
          <div className="flex gap-5 mt-2">
            <label className="text-white flex mb-1 font-bold w-32">Task Title *</label>
            <input
              value={form.title} onChange={set("title")}
              type="text" placeholder="Task title"
              className="text-white bg-[#272f40] border border-white/20 rounded-md p-2 w-[300px] placeholder:text-gray-500"
            />
          </div>

          <div className="flex gap-5 mt-4">
            <label className="text-white flex mb-1 font-bold w-32">Description</label>
            <input
              value={form.description} onChange={set("description")}
              type="text" placeholder="Description"
              className="text-white bg-[#272f40] border border-white/20 rounded-md p-2 w-[300px] placeholder:text-gray-500"
            />
          </div>

          <div className="flex gap-5 mt-4">
            <label className="text-white flex mb-1 font-bold w-32">Coordinator</label>
            <input
              value={form.coordinator} onChange={set("coordinator")}
              type="text" placeholder="Coordinator"
              className="text-white bg-[#272f40] border border-white/20 rounded-md p-2 w-[300px] placeholder:text-gray-500"
            />
          </div>

          <div className="flex gap-5 mt-4">
            <label className="text-white flex mb-1 font-bold w-32">Other Staffs</label>
            <textarea
              value={form.otherStaffs} onChange={set("otherStaffs")}
              placeholder="Enter names of other staff involved"
              className="text-white bg-[#272f40] border border-white/20 rounded-md p-2 w-[300px] placeholder:text-gray-500"
              rows={3}
            />
          </div>

          <div className="flex gap-5 mt-4">
            <div>
              <label className="text-white flex mb-1 font-bold">Priority</label>
              <select
                value={form.priority} onChange={set("priority")}
                className="text-white bg-[#272f40] border border-white/20 rounded-md p-2 w-[300px]"
              >
                <option>low</option>
                <option>medium</option>
                <option>high</option>
              </select>
            </div>

            <div>
              <label className="text-white flex mb-1 font-bold">Status</label>
              <select
                value={form.status} onChange={set("status")}
                className="text-white bg-[#272f40] border border-white/20 rounded-md p-2 w-[300px]"
              >
                <option>todo</option>
                <option>in progress</option>
                <option>done</option>
                <option>blocked</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-white flex mb-1 font-bold">Due Date</label>
            <input
              value={form.dueDate} onChange={set("dueDate")}
              type="date"
              className="text-white bg-[#272f40] border border-white/20 rounded-md p-2 w-[300px] placeholder:text-gray-500"
            />
          </div>

          <div className="btn flex gap-3 justify-end mt-5">
            <button type="button" onClick={onClose}
              className="w-30 bg-white/5 rounded-md border border-white/10 px-4 py-1 text-white">
              Close
            </button>
            <button type="submit"
              className="w-30 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md px-4 py-1 text-white">
              {isEdit ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTask;