import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../Ui/SidebarDash.jsx';
import { User, Car, TriangleAlert } from 'lucide-react';
import Overview from './Attendee/Overview.jsx';
import Profile from './Attendee/Profile.jsx';
import SupportForm from './Attendee/SupportForm.jsx';
import ParkingZone from './Organizer/Parking/ParkingZone.jsx';


const AttendeeDashbord = () => {
  // Define links for the sidebar with absolute paths
  const attendeeLinks = [
    { name: 'Overview', icon: <User size={20} />, to: '/attendee/overview' },
    
    { name: 'Submit Incident', icon: <TriangleAlert />, to: '/attendee/incidentReport' },
  ];

  return (
    <div className="flex bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 h-auto min-h-screen">
      {/* Sidebar */}
      <Sidebar 
        title={"Attendee Dashboard"}
        subtitle={"Your event experience hub"}
        links={attendeeLinks} // Pass the sidebar links
      />

      {/* Main content area */}
      <div className="Right flex flex-9/12">
        {/* Define the nested routes for Attendee Dashboard */}
        <Routes>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="profile" element={<Profile />} />
          <Route path="parking" element={<ParkingZone />} />
          <Route path="incidentReport" element={<SupportForm />} />
          <Route path="*" element={<Navigate to="overview" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default AttendeeDashbord;
