import React, { useState } from 'react'
import '../assets/assets'
import assets from '../assets/assets'
import Sidebar from '../Ui/Sidebar.jsx';
import{User,Car,TriangleAlert} from 'lucide-react';
import Overview from './Attendee/Overview.jsx';
import Profile from './Attendee/Profile.jsx';






const AttendeeDashbord = () => {

  const [activeComponent,setActiveLink]=useState('overview');
  console.log(activeComponent)

   const attendeeLinks = [
    { name: 'overview', icon: <User size={20} />, to: '/overview' },
    { name: 'My Profile', icon: <User />, to: './profile' },
    { name: 'Parking Status', icon: <Car />, to: './parking' },
    { name: 'Submit Complaint', icon: <TriangleAlert />, to: './complaint' },
  ];

  const renderComponent = () =>{
    switch(activeComponent){
      case 'overview':return <Overview />;
      case 'profile' :return <Profile />;
    }
  };


  return (
    <div className='h-screen flex bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 '>
        <Sidebar 
          
          title={"Attendee Dashboard"}
          subtitle={"Your event experience hub"}
          links={attendeeLinks}
          onClick={setActiveLink}
          activeLink={activeComponent}

        
        />

        <div className="Right flex flex-9/12">
            {renderComponent()}
        </div>
      
    </div>
  )
}

export default AttendeeDashbord
