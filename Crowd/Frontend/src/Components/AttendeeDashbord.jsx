import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom'; // Import Routes and Route for nested routing
import Sidebar from '../Ui/SidebarDash.jsx';
import { User, Car, TriangleAlert } from 'lucide-react';
import Overview from './Attendee/Overview.jsx';
import Profile from './Attendee/Profile.jsx';
import SupportForm from './Attendee/SupportForm.jsx';


const AttendeeDashbord = () => {
  // Define links for the sidebar with absolute paths
  const attendeeLinks = [
    { name: 'Overview', icon: <User size={20} />, to: '/attendee/overview' },
    { name: 'My Profile', icon: <User />, to: '/attendee/profile' },
    { name: 'Parking Status', icon: <Car />, to: '/attendee/parking' },
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
          <Route path="overview" element={<Overview />} />
          <Route path="profile" element={<Profile />} />
  
          <Route path="incidentReport" element={<SupportForm />} />
        </Routes>
      </div>
    </div>
  );
};

export default AttendeeDashbord;
