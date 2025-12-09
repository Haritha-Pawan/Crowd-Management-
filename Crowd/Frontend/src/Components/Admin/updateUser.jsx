import React, { useState, useEffect } from "react";
import axios from "axios";

const EditUser = ({ isOpen, onClose, user, onUserUpdated }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    status: "",
  });

  // Prefill form when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: user.password || "",
        role: user.role || "",
        status: user.status || "",
      });
    }
  }, [user]);
//open modal
  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `http://${API_BASE_URL}/users/${user._id}`,
        formData
      );
      onUserUpdated(res.data); // update parent state
      onClose();
    } catch (err) {
      console.error("Error updating user:", err.response?.data || err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/20 backdrop-blur-sm">
      <div className="w-[90%] max-w-2xl bg-[#0f172a] p-5 rounded-md border border-white/10">
        <h2 className="text-white font-bold text-xl">Edit User</h2>
        <h6 className="text-gray-300 font-bold text-xs">Update user details</h6>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Name */}
          <div className="flex gap-5">
            <label className="text-white font-bold w-[120px]">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="text-white bg-[#272f40] border border-white/20 rounded-md p-2 w-full"
            />
          </div>

          {/* Email */}
          <div className="flex gap-5">
            <label className="text-white font-bold w-[120px]">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="text-white bg-[#272f40] border border-white/20 rounded-md p-2 w-full"
            />
          </div>

          {/* Password */}
          <div className="flex gap-5">
            <label className="text-white font-bold w-[120px]">Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="text-white bg-[#272f40] border border-white/20 rounded-md p-2 w-full"
            />
          </div>

          {/* Role */}
          <div className="flex gap-5">
            <label className="text-white font-bold w-[120px]">Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="text-white bg-[#272f40] border border-white/20 rounded-md p-2 w-full"
            >
              <option value="">Select role</option>
              <option>Admin</option>
              <option>Organizer</option>
              <option>Attendee</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex gap-5">
            <label className="text-white font-bold w-[120px]">Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="text-white bg-[#272f40] border border-white/20 rounded-md p-2 w-full"
            >
              <option value="">Select status</option>
              <option>Pending</option>
              <option>active</option>
              <option>suspend</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-30 bg-white/5 rounded-md border border-white/10 p-2 text-white"
            >
              Close
            </button>
            <button
              type="submit"
              className="w-30 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md p-2 text-white"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
