import React, { useState } from 'react';

function AttendeDetails() {
  // Example attendee data — replace with your real data from API
  const initialAttendees = [
    {
      fullName: "Lahiru Lakmal",
      nic: "200012345678",
      phone: "0712345678",
      email: "lahirulakmal893@gmail.com",
      qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=lahiru"
    },
    {
      fullName: "Sadeepa Gayanath",
      nic: "199912345678",
      phone: "0771234567",
      email: "sadeepa123@gmail.com",
      qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=sadeepa"
    }
  ];

  // state for attendees shown in the table
  const [attendees, setAttendees] = useState(initialAttendees);

  // search function
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();

    // filter from original array to avoid cumulative filtering
    const filteredAttendees = initialAttendees.filter(attendee =>
      attendee.fullName.toLowerCase().includes(query) ||
      attendee.nic.toLowerCase().includes(query) ||
      attendee.phone.toLowerCase().includes(query) || 
      attendee.email.toLowerCase().includes(query)
    );

    // update state
    setAttendees(filteredAttendees);
  };

  return (
    <div className='p-12 h-screen w-full'>
      <div className="header text-white text-3xl font-bold">Attendee Overview</div>
      <div className="sub-heading text-xl text-gray-300">
        Monitor and manage all registered attendees
      </div>

      <button
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
            className="ml-6 p-1 rounded-md bg-white/5  border border-gray-600 text-white w-2/3"
            placeholder="Search by name, NIC, phone, or email"
          />
        </div>

        <h2 className="text-xl font-semibold mb-4">Attendees</h2>
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
                  <span className="font-bold">{attendee.email.split("@")[0]}</span>@{attendee.email.split("@")[1]}
                </td>
                <td className="py-3">
                  <img src={attendee.qrCode} alt="QR Code" className="w-12 h-12" />
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
