// AttendeeDashbord.jsx (Option 1: Routing-based)

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../Ui/SidebarDash.jsx';
import { User, Car, TriangleAlert } from 'lucide-react';

import Overview from './Attendee/Overview.jsx';
import Profile from './Attendee/Profile.jsx';
import SupportForm from './Attendee/SupportForm.jsx';
// Add other imports as needed...

const attendeeLinks = [
  { name: 'Overview', icon: <User size={20} />, to: '/attendee' },
  { name: 'My Profile', icon: <User />, to: '/attendee/profile' },
  { name: 'Parking Status', icon: <Car />, to: '/attendee/parking' },
  
  { name: 'Report Incident', icon: <TriangleAlert />, to: '/attendee/support' },
];

const AttendeeDashbord = () => {
  return (
    <div className="flex bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <Sidebar
        title="Attendee Dashboard"
        subtitle="Your event experience hub"
        links={attendeeLinks}
      />

      <div className="Right flex flex-9/12">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/profile" element={<Profile />} />
         
          <Route path="/support" element={<SupportForm />} />
          {/* Add other routes like /parking here */}
        </Routes>
      </div>
    </div>
  );
};

export default AttendeeDashbord;
