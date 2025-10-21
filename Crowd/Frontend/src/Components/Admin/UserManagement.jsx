import { Circle, Filter, Search, User as UserIcon } from "lucide-react";
import { FileText, Users, UserPlus, LogOut } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Eye, Edit, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AddUserForm from "../Admin/addUser";
import axios from "axios";
import EditUser from "../Admin/updateUser";
import { Link } from "react-router-dom";
import { BUSINESS_INFO, addBusinessHeader } from "../../assets/pdfHeader";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import useLogout from "../../hooks/useLogout";

const API_URL = "http://localhost:5000/users";

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedField, setSelectedField] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleViewAttendee = (userId) => {
    navigate(`/admin/attendee/${userId}`);
  };
  //logout
  const handleLogout = useLogout();

  // Enhanced filter logic
  const filteredUsers = users.filter((user) => {
    // Search term filtering
    const searchMatch =
      selectedField === "all"
        ? Object.values(user).some((value) =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
          )
        : user[selectedField]
            ?.toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

    // Role filtering
    const roleMatch = roleFilter === "all" || user.role === roleFilter;

    // Status filtering
    const statusMatch = statusFilter === "all" || user.status === statusFilter;

    return searchMatch && roleMatch && statusMatch;
  });

  // Get unique roles and statuses for filter dropdowns
  const uniqueRoles = ["all", ...new Set(users.map((user) => user.role))];
  const uniqueStatuses = ["all", ...new Set(users.map((user) => user.status))];

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedField("all");
    setRoleFilter("all");
    setStatusFilter("all");
  };

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
  // Dynamic counts based on users state
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const pendingUsers = users.filter((u) => u.status === "Pending").length;
  const organizerUsers = users.filter((u) => u.role === "organizer").length;

  const data = [
    { title: "Total Users", count: totalUsers, icon: <UserIcon /> },
    {
      title: "Active Users",
      count: activeUsers,
      icon: <Circle color="#facc15" />,
    },
    { title: "Pending", count: pendingUsers, icon: "" },
    { title: "Organizers", count: organizerUsers, icon: "" },
  ];

  const generateUserReport = () => {
    const doc = new jsPDF();

    // Business header info
    const headerInfo = { ...BUSINESS_INFO };

    // Header + footer callback
    const didDrawPage = (data) => {
      addBusinessHeader(doc, headerInfo);

      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(9).setTextColor(120);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        doc.internal.pageSize.getWidth() - 20,
        doc.internal.pageSize.getHeight() - 10,
        { align: "right" }
      );
    };
  

    // Report meta
    const reportTitle = "User Management Report";
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const fileName = `User_Report_${yyyy}-${mm}-${dd}.pdf`;

    // Draw first page header
    didDrawPage({ pageNumber: 1 });
    const nextY = addBusinessHeader(doc, headerInfo);

    // Calculate stats dynamically
    const stats = {
      total: users.length,
      active: users.filter((u) => u.status === "Active").length,
      pending: users.filter((u) => u.status === "Pending").length,
      organizers: users.filter((u) => u.role === "Organizer").length,
    };

    // Report title
    doc.setFont("helvetica", "bold").setFontSize(14);
    doc.text(reportTitle, 14, nextY + 8);

    // Summary
    doc.setFont("helvetica", "normal").setFontSize(10);
    doc.text(`Generated on: ${yyyy}-${mm}-${dd}`, 14, nextY + 16);
    doc.text(`Total Users: ${stats.total}`, 14, nextY + 22);
    doc.text(`Active Users: ${stats.active}`, 14, nextY + 28);
    doc.text(`Pending Users: ${stats.pending}`, 14, nextY + 34);
    doc.text(`Organizers: ${stats.organizers}`, 14, nextY + 40);

    // Table columns
    const columns = [
      { header: "Full Name", dataKey: "fullName" },
      { header: "Email", dataKey: "email" },
      { header: "Role", dataKey: "role" },
      { header: "Status", dataKey: "status" },
      { header: "Created Date", dataKey: "createdAt" },
    ];

    // Prepare rows
    const rows = users.map((u) => ({
      fullName: u.fullName || "—",
      email: u.email || "—",
      role: u.role || "—",
      status: u.status || "Active",
      createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—",
    }));

    // Table
    autoTable(doc, {
      startY: nextY + 50,
      head: [columns.map((c) => c.header)],
      body: rows.map((r) => columns.map((c) => r[c.dataKey])),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [40, 44, 52], textColor: 255 },
      margin: { left: 14, right: 14 },
      tableWidth: "auto",
      didDrawPage,
    });

    // Save file
    doc.save("user_report.pdf");
  };

  return (
    <div className="p-10 mx-auto h-screen">
      <div className="header text-3xl text-white font-bold">
        User Management
      </div>
      <div className="gap-5">
        {/* Add user button */}
        <Link to='/admin/AttendeDetails'>
        <button className="absolute top-12 right-50 p-3 px-8 mx-4  rounded-md cursor-pointer bg-green-500 text-white font-medium shadow-lg hover:opacity-80 focus:outline-none transition-all">
          + View Attende
          
        </button>

        {/* View Attendee Button */}
        <Link to="/admin/AttendeDetails">
          <button className=" inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10">
            <Users size={16} />
            View Attendee
          </button>
        </Link>

        {/* Add User Button */}
        <button
          onClick={() => setIsPopupOpen(true)}
          className="absolute top-12 right-12 p-3 px-8 rounded-md cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg hover:opacity-80 focus:outline-none transition-all"
        >
          <UserPlus size={16} />
          Add User
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 p-1.5 px-3 rounded-md cursor-pointer bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm font-medium shadow-lg hover:opacity-80 focus:outline-none transition-all"
        >
          <LogOut size={16} />
          Log Out
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
            <label className="text-white">Search User</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="bg-white/5 p-2 px-8 rounded-md border border-white/5 shadow-md text-white w-[250px]"
              />
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="bg-white/5 p-2 rounded-md border border-white/50 text-gray-500 shadow-md "
              >
                <option value="all">All Fields</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="role">Role</option>
                <option value="status">Status</option>
              </select>
            </div>
            <Search className="relative bottom-7 ml-2" size={20} />
          </div>

          <div className="flex flex-col">
            <label className="text-white">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/5 p-2 w-[200px] rounded-md border border-white/10 text-gray-500 shadow-md"
            >
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-white">Role Filter</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-white/5 p-2 w-[200px] rounded-md border border-white/10 text-gray-500 shadow-md"
            >
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <button
              onClick={clearFilters}
              className="bg-white/5 p-2 text-white relative top-6 rounded-md px-4 cursor-pointer border border-white/10 shadow-md hover:bg-white/10 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* End of Serac */}

      <div className="users-table-container bg-white/5 border-white/10  p-5 mt-5 rounded-md w-full text-white h-70 overflow-y-auto scroll-m-0">
        <h2 className="text-xl font-semibold mb-4">Users</h2>
        <table className="w-full text-left ">
          <thead>
            <tr className="border-b border-gray-500">
              <th className="pb-3">Name</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Role</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, idx) => (
              <tr key={user._id} className="border-b border-gray-600">
                <td className="py-3">{user.name}</td>
                <td className="py-3">
                  <span className="font-bold">{user.email.split("@")[0]}</span>@
                  {user.email.split("@")[1]}
                </td>

                <td className="py-3">{user.role}</td>
                <td className="py-3">
                  <span className="border border-white/10 bg-white/5 px-3 py-1 rounded-full text-sm">
                    {user.status}
                  </span>
                </td>
                <td className="py-3 flex gap-2">
                  <button
                    onClick={() => handleViewAttendee(user._id)}
                    className="bg-blue-700 p-2 rounded hover:bg-blue-600"
                  >
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
