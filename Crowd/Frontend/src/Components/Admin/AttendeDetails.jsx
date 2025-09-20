import React from 'react';

function AttendeDetails() {
  // Example attendee data — replace with your real data from API
  const attendees = [
    {
      fullName: "Lahiru Lakmal",
      nic: "200012345678",
      phone: "0712345678",
      email: "lahirulakmal893@gmail.com",
      password: "22113344",
      qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=lahiru"
    },
    {
      fullName: "Sadeepa Gayanath",
      nic: "199912345678",
      phone: "0771234567",
      email: "sadeepa123@gmail.com",
      password: "1122334",
      qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=sadeepa"
    }
  ];

  return (
    <div className='p-12 h-screen w-full'>
      <div className="header text-white text-3xl font-bold">Attende Overview</div>
      <div className="sub-heading text-xl text-gray-300">
        Monitor and manage all register attende
      </div>

      <button
        
        className="absolute top-12 right-12 p-3 px-8 rounded-md cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg hover:opacity-80 focus:outline-none transition-all"
      >
        + Remove All 
      </button>

      {/* Attendee Table */}
      <div className="users-table-container bg-white/5 border-white/10  p-5 mt-10 rounded-md w-full text-white ">
        <h2 className="text-xl font-semibold mb-4">Attendees</h2>
        <table className="w-full text-left ali ">
          <thead>
            <tr className="border-b border-gray-500">
              <th className="pb-3">Full Name</th>
              <th className="pb-3">NIC</th>
              <th className="pb-3">Phone Number</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Password</th>
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
                 <td className="py-3">{"*".repeat(attendee.password.length)}</td>
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
