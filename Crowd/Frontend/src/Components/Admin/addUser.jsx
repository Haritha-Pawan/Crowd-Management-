import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddUser = ({ isOpen, onClose }) => {
  const [input, setInput] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    status: "",
  });
  const [errors, setErrors] = useState({}); // 👈 new state for errors
  const navigate = useNavigate();

  

  if (!isOpen) return null;

  const handleChange = (e) => {
    setInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(input);
    if (!validate()) return;
    sendRequest().then(() => navigate("/admin/UserManagement.jsx")); 
  };

  const sendRequest = async () => {
    try {
      const res = await axios.post("http://localhost:5000/users", {
        name: String (input.name)   ,
        email:String (input.email),
        password:String (input.password),
        role: String(input.role),
        status:String (input.status),
      });
      return res.data;
    } catch (err) {
      console.error("Error adding user:", err.response?.data || err.message);
    }
  };
   // 🟩 Validation function
  const validate = () => {
    const tempErrors = {};

    // Name
    if (!input.name.trim()) {
      tempErrors.name = "Full name is required";
    } else if (input.name.length < 5) {
      tempErrors.name = "Name must be at least 3 characters";
    }

    // Email
    if (!input.email.trim()) {
      tempErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(input.email)) {
      tempErrors.email = "Invalid email format";
    }

    // Password
    if (!input.password) {
      tempErrors.password = "Password is required";
    } else if (input.password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters";
    }

    // Role
    if (!input.role) {
      tempErrors.role = "Please select a role";
    }

    // Status
    if (!input.status) {
      tempErrors.status = "Please select a status";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0; // true if no errors
  };


  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/20 backdrop-blur-sm">
      <div className="w-[90%] max-w-2xl bg-[#0f172a] p-5 rounded-md border border-white/10">
        <h2 className="text-white font-bold text-xl">Add New User</h2>
        <h6 className="text-gray-300 font-bold text-xs">
          Create a new user account for the system
        </h6>

        <form onSubmit={handleSubmit} className="mt-5">
          {/* Full Name */}
          <div className="flex gap-5 mt-4">
            <label className="text-white flex mb-1 font-bold w-[120px]">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={input.name}
              onChange={handleChange}
              placeholder="Enter full name"
              className="text-white bg-[#272f40] border border-white/20 rounded-md p-2 w-full placeholder:text-gray-500"
            />
            
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          
          </div>

          {/* Email */}
          <div className="flex gap-5 mt-4">
            <label className="text-white flex mb-1 font-bold w-[120px]">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={input.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="text-white bg-[#272f40] border border-white/20 rounded-md p-2 w-full placeholder:text-gray-500"
            />
            <br />
               {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="flex  gap-5 mt-4">
            <label className="text-white flex mb-1 font-bold w-[120px]">
              Password *
            </label>
            <input
              type="password"
              name="password"
                value={input.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="text-white bg-[#272f40] border border-white/20 rounded-md p-2 w-full placeholder:text-gray-500"
            />
          
               {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>

          {/* Role */}
          <div className="flex  gap-5 mt-4">
            <label className="text-white flex mb-1 font-bold w-[120px]">
              Role *
            </label>
            <select
              name="role"
              value={input.role}
              onChange={handleChange}
              className="text-white bg-[#272f40] border border-white/20 rounded-md p-2 w-full"
            >
              <option value="">Select role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="organizer">organizer</option>
              <option value="Coordinator">Coordinator</option>
            </select>
            
             {errors.role && <p className="text-red-500 text-sm ">{errors.role}</p>}
            
          </div>

          {/* Status */}
          <div className="flex gap-5 mt-4">
            <label className="text-white flex mb-1 font-bold w-[120px]">
              Status *
            </label>
            <select
              name="status"
              value={input.status}
              onChange={handleChange}
              className="text-white bg-[#272f40] border border-white/20 rounded-md p-2 w-full"
            >
              <option value="">Select status</option>
              <option value="active">Active</option>
              <option value="pending">pending</option>
              <option value="banned">Banned</option>
            </select>
            
             {errors.status && (
              <p className="text-red-500 text-sm flex flex-col">{errors.status}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="btn flex gap-3 justify-end mt-5">
            <button
              type="button"
              onClick={onClose}
              className="w-30 bg-white/5 rounded-md border border-white/10 p-2 text-white font-medium cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              className="w-30 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md p-2 text-white font-medium cursor-pointer"
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
