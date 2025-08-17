import { Car, Settings, TriangleAlert, User, UserPlus } from 'lucide-react'
import React from 'react'
import SidebarDash from '../../Ui/SidebarDash'

const Organizer = () => {
    const OrganizerLinks = [
        { name: 'overview', icon: <User size={20} />, to: '/Organizer/AdminOverview' },
        { name: 'Task Management', icon: <UserPlus />, to: '/Organizer/OrganizerManagement' },
        { name: ' Management', icon: <Car />, to: '/Admin/OrganizerManagement' },
        { name: ' Management', icon: <TriangleAlert />, to: '/Organizer/parkingManagement' },
        {name:' Management',icon:<Settings />,to:'/Organizer/service'}
      ];

  return (
 <div className='flex bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 h-auto'>
          
          <SidebarDash 
          
          title={"Organizer Dashboard"}
          subtitle={"Your event experience hub"}
          links={OrganizerLinks}

          />

          {/* Right side */}
    
            <div className="Right flex flex-10/12">
      
       
           </div>
          
        </div>
  )
}


export default Organizer
