import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AttendeDetails() {
  // state for all attendees (original from backend)
  const [allAttendees, setAllAttendees] = useState([]);
  // state for attendees shown in the table (filtered)
  const [attendees, setAttendees] = useState([]);

  // fetch attendees from backend when component mounts
  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        // 🔹 Replace URL with your real API endpoint
        const res = await axios.get('http://localhost:5000/other/attendance'); 
        // ensure data matches your backend structure
        setAllAttendees(res.data); 
        setAttendees(res.data); // initially show all
      } catch (err) {
        console.error('Error fetching attendees:', err);
      }
    };

    fetchAttendees();
  }, []);

  // search function
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    const filteredAttendees = allAttendees.filter((attendee) =>
      attendee.fullName.toLowerCase().includes(query) ||
      attendee.nic.toLowerCase().includes(query) ||
      attendee.phone.toLowerCase().includes(query) ||
      attendee.email.toLowerCase().includes(query)
    );
    setAttendees(filteredAttendees);
  };

  // delete all attendees
  const handleDeleteAll = async () => {
    if (window.confirm("Are you sure you want to delete all attendees?")) {
      try {
        await axios.delete('http://localhost:5000/other/attendance/delete"'); // adjust route to your backend
        setAllAttendees([]);
        setAttendees([]);
      } catch (err) {
        console.error("Error deleting all attendees:", err);
      }
    }
  };

  return (
    <div className='p-12 h-screen w-full'>
      <div className="header text-white text-3xl font-bold">Attendee Overview</div>
      <div className="sub-heading text-xl text-gray-300">
        Monitor and manage all registered attendees
      </div>

      <button
        onClick={handleDeleteAll}
        className="absolute top-12 right-12 p-3 px-8 rounded-md cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg hover:opacity-80 focus:outline-none transition-all"
      >
        + Remove All
      </button>

      {/* Attendee Table */}
      <div className="users-table-container bg-white/5 border-white/10 p-5 mt-10 rounded-md w-full text-white">
        <div className="mb-4 ">
          Search:
          <input
            type="text"
            onChange={handleSearch}
            className="ml-6 p-1 rounded-md bg-white/5 border border-gray-600 text-white w-2/3"
            placeholder="Search by name, NIC, phone, or email"
          />
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-500">
              <th className="pb-3">Full Name</th>
              <th className="pb-3">NIC</th>
              <th className="pb-3">Phone Number</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">QR Code</th>
            </tr>
          </thead>
          <tbody>
            {attendees.map((attendee, idx) => (
              <tr key={idx} className="border-b border-gray-600">
                <td className="py-3">{attendee.fullName}</td>
                <td className="py-3">{attendee.nic}</td>
                <td className="py-3">{attendee.phone}</td>
                <td className="py-3">
                  <span className="font-bold">{attendee.email?.split("@")[0]}</span>@{attendee.email?.split("@")[1]}
                </td>
                <td className="py-3">
                  {/* If backend already sends QR code URL, use it directly */}
                  <img
                    src={
                      attendee.qrCode ||
                      `http://localhost:5000/qrcode/${attendee._id}` // adjust route to your backend
                    }
                    alt="QR Code"
                    className="w-12 h-12"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AttendeDetails;
