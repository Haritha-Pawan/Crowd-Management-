import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // for navigation
import Sidebar from '../../Ui/SidebarDash.jsx';
import { Routes, Route } from 'react-router-dom';
import { UserPlus, Bell } from 'lucide-react';
import io from 'socket.io-client'; // Import socket.io client
import Incidents from './Incidents.jsx';
import ViewTasks from './ViewTasks.jsx';
import CoordinatorOverview from './CoordinatorOverview.jsx';

const Coordinator = () => {
  const [notifications, setNotifications] = useState([]);
  const [isNewIncident, setIsNewIncident] = useState(false); // To control notification pop-up state
  const navigate = useNavigate();

  // WebSocket connection (listen for new incidents)
  useEffect(() => {
    const socket = io('http://localhost:5000'); // Change to your backend URL if needed

    // Listen for newIncident event
    socket.on('newIncident', (incident) => {
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        incident, // Add the new incident to the notification list
      ]);
      setIsNewIncident(true); // Show the notification pop-up
    });

    // Cleanup on component unmount
    return () => {
      socket.off('newIncident'); // Remove the listener
    };
  }, []);

  // Handle the notification click (can redirect to Incidents page)
  const handleNotificationClick = () => {
    setIsNewIncident(false); // Close the notification pop-up
    navigate('/Coordinator/Incidents'); // Navigate to the Incidents page
  };

  const CoordinatorLinks = [
    { name: 'View Tasks', icon: <UserPlus />, to: '/Coordinator/ViewTasks' },
    { name: 'Incident Management', icon: <UserPlus />, to: '/Coordinator/Incidents' },
    { name: 'Overview', icon: <UserPlus />, to: '/Coordinator/CoordinatorOverview' },
  ];

  return (
    <div className='flex bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 h-auto'>
      <Sidebar
        title={"Coordinator Dashboard"}
        subtitle={"Your event experience hub"}
        links={CoordinatorLinks}
      />

      {/* Right side */}
      <div className="Right flex flex-10/12">
        {/* Notification Pop-up */}
        {isNewIncident && (
          <div
            className="fixed bottom-4 left-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg flex items-center cursor-pointer"
            onClick={handleNotificationClick}
          >
            <Bell className="mr-2" />
            <span>New Incident Reported!</span>
          </div>
        )}

        {/* Routes for different pages */}
        <Routes>
          <Route path="/" element={<CoordinatorOverview />} />
          <Route path="/ViewTasks" element={<ViewTasks />} />
          <Route path="/Incidents" element={<Incidents />} />
          <Route path="/CoordinatorOverview" element={<CoordinatorOverview />} />
        </Routes>
      </div>
    </div>
  );
};

export default Coordinator;
