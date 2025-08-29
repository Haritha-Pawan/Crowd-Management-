import { Car, Eye, Settings, TriangleAlert, User, UserPlus } from 'lucide-react'
import React from 'react'
import SidebarDash from '../../Ui/SidebarDash'
import { Routes,Route } from 'react-router-dom';
import Live from './Live/live';
import Task from './Task/Task';

const Organizer = () => {
    const OrganizerLinks = [
        { name: 'overview', icon: <User size={20} />, to: '/Organizer/OrganizerOverview' },
        { name: 'Task Management', icon: <UserPlus />, to: '/Organizer/task' },
        { name: ' Management', icon: <Car />, to: '/Organizer/OrganizerManagement' },
        { name: ' Management', icon: <TriangleAlert />, to: '/Organizer/parkingManagement' },
        {name:' Live Preview',icon:<Eye />,to:'/Organizer/Live'}
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
                  
                   <Routes>
                      <Route path='/Live' element={<Live/>}/>
                      <Route path='/task' element={<Task/>}/>
                   </Routes>

                 
       
           </div>
          
        </div>
  )
}


export default Organizer
