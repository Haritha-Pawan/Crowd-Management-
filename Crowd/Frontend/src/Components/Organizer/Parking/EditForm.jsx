// src/components/EditForm.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API = "https://crowd-management-api.onrender.com/api";


const FACILITY_OPTIONS = [
  "EV charging",
  "CCTV",
  "Handicap accessible",
  "Covered",
  "24/7 access",
  "Security personnel",
  "Restrooms",
];

export default function EditForm({ isOpen, onClose, id, refresh }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    capacity: "",
    type: "Standard",
    status: "active",
    description: "",
    facilities: [],
    latitude: "",
    price: "",
    distance: "",
  });

  useEffect(() => {
    const fetchPlace = async () => {
      if (!isOpen || !id) {
        console.log("[EditForm] Skip fetch: { isOpen, id } =>", { isOpen, id });
        return;
      }
      try {
        setLoading(true);
       
        const res = await axios.get(`${API}/zone/${id}`);
        console.log("[EditForm] Raw response:", res);

        // Normalize possible shapes: {data}, {place}, direct obj, or [obj]
        const payload = res?.data;
        let place = payload?.data ?? payload?.place ?? payload ?? {};
        if (Array.isArray(place)) {
          console.log("[EditForm] place was array, using first element");
          place = place[0] ?? {};
        }
        console.log("[EditForm] Normalized place:", place);

        setFormData({
          name: place.name ?? "",
          location: place.location ?? "",
          capacity: place.capacity ?? "",
          type: place.type ?? "Standard",
          status: place.status ?? "active",
          description: place.description ?? "",
          facilities: Array.isArray(place.facilities)
            ? place.facilities
            : typeof place.facilities === "string" && place.facilities.length
              ? place.facilities.split(",").map((s) => s.trim())
              : [],
          latitude: place.latitude ?? "",
          price: place.price ?? "",
          distance: place.distance ?? "",
        });
        console.log("[EditForm] formData set");
      } catch (err) {
        console.error("[EditForm] fetch error:", err);
        toast.error("Failed to load place data.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlace();
  }, [isOpen, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("[EditForm] change:", name, value);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔧 MISSING BEFORE: define toggleFacility so Features don’t crash render
  const toggleFacility = (label) => {
    console.log("[EditForm] toggle facility:", label);
    setFormData((prev) => {
      const exists = prev.facilities.includes(label);
      return {
        ...prev,
        facilities: exists
          ? prev.facilities.filter((f) => f !== label)
          : [...prev.facilities, label],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) {
      toast.error("Missing place id.");
      return;
    }
    try {
      console.log("[EditForm] PUT", `${API}/zone/${id}`, formData);
      await axios.put(`${API}/zone/${id}`, formData);
      toast.success("Place updated successfully");
      refresh?.();
      onClose?.();
    } catch (err) {
      console.error("[EditForm] update error:", err);
      toast.error("Failed to update place");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 overflow-y-auto">
      <div className="flex min-h-full items-start justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-3xl bg-[#0f172a] border border-white/10 rounded-2xl shadow-xl">
          <div className="px-6 pt-6">
            <h2 className="text-white font-bold text-xl">Edit Place</h2>
            <p className="text-gray-300 text-xs mb-4">Update details of the parking place</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 pb-6">
            {loading ? (
              <div className="text-gray-300 text-sm">Loading…</div>
            ) : (
              <>
                {/* Name + Location */}
                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <label className="block text-white text-sm font-semibold">Name</label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      type="text"
                      placeholder="Main Parking"
                      className="mt-1 w-full text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-semibold">Location</label>
                    <input
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      type="text"
                      placeholder="Main Entrance Area"
                      className="mt-1 w-full text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
                    />
                  </div>
                </div>

                {/* Capacity + Type */}
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div>
                    <label className="block text-white text-sm font-semibold">Capacity</label>
                    <input
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      type="number"
                      placeholder="50"
                      className="mt-1 w-full text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-semibold">Type</label>
                    <input
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      type="text"
                      placeholder="Standard / VIP"
                      className="mt-1 w-full text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
                    />
                  </div>
                </div>

                {/* Status + Latitude */}
                <div className="mt-4 grid lg:grid-cols-2 items-end gap-4">
                  <div className="w-full">
                    <label className="block text-white text-sm font-semibold">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="mt-1 w-full text-white bg-[#272f40] border border-white/20 rounded-md p-2"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="flex flex-col w-full">
                    <label className="block text-white text-sm font-semibold">Latitude</label>
                    <input
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      type="text"
                      placeholder="7.2906"
                      className="mt-1 text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
                    />
                  </div>
                </div>

                {/* Price + Distance */}
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div>
                    <label className="block text-white text-sm font-semibold">Price</label>
                    <input
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      type="number"
                      placeholder="300"
                      className="mt-1 w-full text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-semibold">Distance</label>
                    <input
                      name="distance"
                      value={formData.distance}
                      onChange={handleChange}
                      type="text"
                      placeholder="50m"
                      className="mt-1 w-full text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="mt-4">
                  <label className="block text-white text-sm font-semibold">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Provide a detailed description"
                    className="mt-1 w-full text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
                  />
                </div>

                {/* Facilities */}
                <label className="block text-white mt-4 text-sm font-semibold">Features</label>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {FACILITY_OPTIONS.map((opt) => (
                    <label key={opt} className="flex items-center gap-2 text-gray-200 text-sm bg-white/5 border border-white/10 rounded-md p-2">
                      <input
                        type="checkbox"
                        checked={formData.facilities.includes(opt)}
                        onChange={() => toggleFacility(opt)}
                        className="accent-blue-500"
                      />
                      {opt}
                    </label>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-white/5 rounded-md border border-white/10 px-4 py-2 text-white hover:bg-white/10"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-md px-4 py-2 text-white font-semibold hover:opacity-80"
                  >
                    Update
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
