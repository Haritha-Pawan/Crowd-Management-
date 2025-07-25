
import React from 'react'
import Sidebar from '../Ui/Sidebar.jsx';
import{User,UserPlus,Car,TriangleAlert,Settings} from 'lucide-react';

const Admin = () => {

       const AdminLinks = [
        { name: 'overview', icon: <User size={20} />, to: './Attendeeoverview' },
        { name: 'User Management', icon: <UserPlus />, to: './userManagement' },
        { name: 'Counter Management', icon: <Car />, to: './counter' },
        { name: 'Parking Management', icon: <TriangleAlert />, to: './parking' },
        {name:'Service Management',icon:<Settings />,to:'./service'}
      ];

  return (
        <div className='h-auto flex bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 '>
          
          <Sidebar
          
          title={"Admin Dashboard"}
          subtitle={"Your event experience hub"}
          links={AdminLinks}

          />
    
            <div className="Right flex flex-10/12">
              
           </div>
          
        </div>
  )
}

export default Admin
