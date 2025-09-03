import { Circle, Filter, Search, User as UserIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Eye, Edit, Trash } from "lucide-react";
import AddUserForm from "../Admin/addUser";
import axios from "axios";
import EditUser from "../Admin/updateUser";

const API_URL = "http://localhost:5000/users";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(API_URL);
      // Handle both cases where data might be directly in response.data or in response.data.users
      const userData = response.data.users || response.data || [];
      setUsers(userData);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]); // Set empty array on error
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  // update user
  const openEdit = (user) => {
    setEditUser(user);
    setIsEditOpen(true);
  };

  const handleUserUpdated = (updatedUser) => {
    setUsers(users.map((u) => (u._id === updatedUser._id ? updatedUser : u)));
  };
  //delete user
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`http://localhost:5000/users/${id}`);
        setUsers(users.filter((u) => u._id !== id));
      } catch (err) {
        console.error(
          "Error deleting user:",
          err.response?.data || err.message
        );
      }
    }
  };

  // 🔹 Fix: define handleCreate
  const handleCreate = (userData) => {
    console.log("New User Created:", userData);
    setIsPopupOpen(false);
  };

  const coordinators = ["Naveen", "Lahiru", "Kasun"];
  const data = [
    { title: "Total Users", count: "4", icon: <UserIcon /> },
    { title: "Active Users", count: "4", icon: <Circle color="#facc15" /> },
    { title: "Pending", count: "4", icon: "" },
    { title: "Organizers", count: "4", icon: "" },
  ];

  return (
    <div className="p-10 mx-auto h-screen">
      <div className="header text-3xl text-white font-bold">
        User Management
      </div>
      <div className="gap-5">
        {/* Add user button */}
        <button className="absolute top-12 right-50 p-3 px-8 mx-4  rounded-md cursor-pointer bg-green-500 text-white font-medium shadow-lg hover:opacity-80 focus:outline-none transition-all">
          + View Attende
        </button>
        {/* view attende */}
        <button
          onClick={() => setIsPopupOpen(true)}
          className="absolute top-12 right-12 p-3 px-8 rounded-md cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg hover:opacity-80 focus:outline-none transition-all"
        >
          + Add User
        </button>
      </div>
      <div className="sub-heading text-gray-300 mb-5">
        Manage system users and their permissions
      </div>

      {/* Add user Form (popup) */}
      <AddUserForm
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onCreate={handleCreate}
        coordinators={coordinators}
      />

      {/* card section total users .... */}

      <div className="card grid md:grid-cols-4 gap-10 ">
        {data.map((item, index) => (
          <div
            key={index}
            className="p-5 bg-white/5 border border-white/10 w-58 rounded-md shadow-md"
          >
            <div className="text-gray-300">{item.title}</div>
            <div className="text-2xl text-white font-bold flex justify-between ">
              {item.count}

              <div className="icon flex">
                <div className="circle w-7 h-7 rounded-full ">{data.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/*start serch section*/}
      <div className="search-section bg-white/5 border border-white/10 p-5 mt-5 rounded-md ">
        <div className="flex gap-4">
          <Filter color="#ffffff" size={30} />
          <div className="text-white text-2xl font-bold">Filter & Search</div>
        </div>

        <div className="flex gap-10 mt-3">
          <div className="flex flex-col">
            <label className="text-white ">Search User</label>
            <input
              type="text"
              placeholder="Serach by Name, Email or Nic"
              className="bg-white/5  p-2 px-8 rounded-md border border-white/5  shadow-md text-white"
            />
            <Search
              className=" relative bottom-7 ml-2  color='#fffff "
              size={20}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white">Status Filter</label>
            <select className="bg-white/5 p-2 w-[250px] rounded-md border border-white/10 text-gray-100 shadow-md">
              <option className="text-gray/5 ">All Status</option>
              <option>sd</option>
              <option>All Status</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-white">Role Filter</label>
            <select className="bg-white/5 p-2 w-[250px] rounded-md border border-white/10 text-gray-100 shadow-md">
              <option className="text-gray/5 ">All Role</option>
              <option>sd</option>
              <option>All Status</option>
            </select>
          </div>

          <div className="flex flex-col">
            <button className="bg-white/5 p-2 text-white relative top-6 rounded-md px-4 cursor-pointer border border-white/10 shadow-md">
              Clear Filter
            </button>
          </div>
        </div>
      </div>

      {/* End of Serac */}

      <div className="users-table-container bg-white/5 border-white/10  p-5 mt-5 rounded-md w-full text-white ">
        <h2 className="text-xl font-semibold mb-4">Users</h2>
        <table className="w-full text-left ">
          <thead>
            <tr className="border-b border-gray-500">
              <th className="pb-3">Name</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Password</th>
              <th className="pb-3">Role</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={user._id} className="border-b border-gray-600">
                <td className="py-3">{user.name}</td>
                <td className="py-3">
                  <span className="font-bold">{user.email.split("@")[0]}</span>@
                  {user.email.split("@")[1]}
                </td>
                <td className="py-3">{user.password}</td>
                <td className="py-3">{user.role}</td>
                <td className="py-3">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                    {user.status}
                  </span>
                </td>
                <td className="py-3 flex gap-2">
                  <button className="bg-blue-700 p-2 rounded hover:bg-blue-600">
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => openEdit(user)}
                    className="bg-blue-700 p-2 rounded hover:bg-blue-600"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="bg-red-700 p-2 rounded hover:bg-gray-600"
                  >
                    <Trash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <EditUser
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          user={editUser}
          onUserUpdated={handleUserUpdated}
        />
      </div>
    </div>
  );
};

export default UserManagement;
