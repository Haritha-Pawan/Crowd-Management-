import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://${API_BASE_URL}/api";

const EditCounter = ({ isOpen, onClose, counter, onUpdated }) => {
  const [form, setForm] = useState({
    name: "",
    entrance: "",
    status: "Entry",
    capacity: "",
    staff: "",
    isActive: true,
  });

  // prefill when opening / counter changes
  useEffect(() => {
    if (!isOpen || !counter) return;
    setForm({
      name: counter.name ?? "",
      entrance: counter.entrance ?? "",
      status: counter.status ?? "Entry", // "Entry" | "Exit" (add "Both" if your route allows)
      capacity: String(counter.capacity ?? ""),
      staff: counter.staff ?? "",
      isActive: counter.isActive ?? true,
    });
  }, [isOpen, counter]);

  if (!isOpen || !counter) return null;

  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) return alert("Counter name is required");
    if (!String(form.capacity).trim()) return alert("Capacity is required");

    const capacity = parseInt(form.capacity, 10) || 0;

    if (capacity <= 0) return alert("Capacity must be greater than zero");

    const payload = {
      name: form.name.trim(),
      entrance: form.entrance.trim(),
      status: form.status,
      capacity,
      staff: form.staff.trim() || undefined,
      isActive: !!form.isActive,
    };

    try {
      const { data } = await axios.put(`${API}/counter/${counter._id}`, payload);
      // controller returns the updated document directly
      onUpdated?.(data);
      onClose?.();
    } catch (err) {
      const res = err.response?.data;
      const msg =
        res?.message ||
        (Array.isArray(res?.errors) &&
          res.errors.map((e) => `${e.path}: ${e.msg}`).join("\n")) ||
        err.message ||
        "Failed to update counter";
      console.error("PUT /api/counter/:id failed:", res || err);
      alert(msg);
    }
  };

  return (
    <div className="fixed z-50 inset-0 flex justify-center items-center bg-black/60">
      <div className="w-[90%] max-w-2xl bg-[#0f172a] p-5 rounded-md border border-white/10">
        <h2 className="text-white font-bold text-xl">Edit Counter</h2>
        <h6 className="text-gray-300 font-bold text-xs">Update entry/exit counter details</h6>

        <form onSubmit={submit} className="mt-4">
          <div className="flex gap-5 mt-2">
            <label className="text-white flex mb-1 font-bold w-40">Counter Name *</label>
            <input
              value={form.name} onChange={set("name")}
              type="text" placeholder="e.g., Counter A1"
              className="text-white bg-[#272f40] border border-white/20 rounded-md p-2 w-[300px] placeholder:text-gray-500"
            />
          </div>

          <div className="flex gap-5 mt-4">
            <label className="text-white flex mb-1 font-bold w-40">Entrance *</label>
            <input
              value={form.entrance} onChange={set("entrance")}
              type="text" placeholder="e.g., North gate"
              className="text-white bg-[#272f40] border border-white/20 rounded-md p-2 w-[300px] placeholder:text-gray-500"
            />
          </div>

          <div className="flex gap-5 mt-4">
            <div>
              <label className="text-white flex mb-1 font-bold">Status</label>
              <select
                value={form.status} onChange={set("status")}
                className="text-white bg-[#272f40] border border-white/20 rounded-md p-2 w-[300px]"
              >
                <option value="Entry">Entry</option>
                <option value="Exit">Exit</option>
                {/* <option value="Both">Both</option> */} {/* enable if your validator allows */}
              </select>
            </div>

            <div>
              <label className="text-white flex mb-1 font-bold">Capacity *</label>
              <input
                value={form.capacity} onChange={set("capacity")}
                type="number" min="1" placeholder="e.g., 120"
                className="text-white bg-[#272f40] border border-white/20 rounded-md p-2 w-[300px] placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="flex gap-5 mt-4">
            

            <div>
              <label className="text-white flex mb-1 font-bold">Assigned Staff</label>
              <input
                value={form.staff} onChange={set("staff")}
                type="text" placeholder="e.g., John Smith"
                className="text-white bg-[#272f40] border border-white/20 rounded-md p-2 w-[300px] placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="flex gap-5 mt-4 items-center">
            <label className="text-white flex font-bold w-40">Active</label>
            <input type="checkbox" checked={form.isActive} onChange={set("isActive")} />
          </div>

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
              className="w-30 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md px-4 py-1 text-white"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCounter;
