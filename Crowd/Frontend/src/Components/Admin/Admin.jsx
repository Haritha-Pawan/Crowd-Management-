
import React from 'react'
import Sidebar from '../../Ui/SidebarDash.jsx';
import {Routes ,Route} from 'react-router-dom'
import{User,UserPlus,Car,TriangleAlert,Settings, Loader2Icon} from 'lucide-react';
import AdminOverview from './AdminOverview.jsx';
import UserManagement from './UserManagement.jsx';
import CounterManagement from './CounterManagement.jsx';
import ParkingManagement from '../Organizer/Parking/ParkingManagement.jsx';
import AttendeDetails from './AttendeDetails.jsx';


const Admin = () => {
    

       const AdminLinks = [
        { name: 'overview', icon: <User size={20} />, to: '/Admin/AdminOverview' },
        { name: 'User Management', icon: <UserPlus />, to: '/Admin/UserManagement' },
        { name: 'Counter Management', icon: <Loader2Icon />, to: '/Admin/CounterManagement' },
        { name: ' Management', icon: <Car />, to: '/Admin/parkingManagement' },
        {name:'Service Management',icon:<Settings />,to:'/Admin/service'}
      ];

  return (
        <div className='flex bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 h-auto min-h-screen h-fit overflow-scroll scrol/l-m-0'>
          
          <Sidebar  className=""
          
          title={"Admin Dashboard"}
          subtitle={"Your event experience hub"}
          links={AdminLinks}

          />

          {/* Right side */}
    
            <div className="Right flex flex-10/12">
      
              <Routes>
                <Route path="/" element={<AdminOverview/>}/>
                <Route path="/AdminOverview" element={<AdminOverview/>}/>
                <Route path="/UserManagement" element={<UserManagement/>} />
                <Route path="/CounterManagement" element={<CounterManagement/>} />
                <Route path="/AttendeDetails" element={<AttendeDetails/>} />
              </Routes>
            
           </div>
          
        </div>
  )
}

export default Admin
