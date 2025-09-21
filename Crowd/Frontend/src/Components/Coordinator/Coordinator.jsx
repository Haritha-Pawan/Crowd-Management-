
import React from 'react'
import Sidebar from '../../Ui/SidebarDash.jsx';
import {Routes ,Route} from 'react-router-dom'
import{User,UserPlus,Car,TriangleAlert,Settings, Loader2Icon} from 'lucide-react';
import Incidents from './Incidents.jsx';
import ViewTasks from './ViewTasks.jsx';
import CoordinatorOverview from './CoordinatorOverview.jsx';


const Coordinator = () => {

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
      
              <Routes>
                <Route path="/" element={<CoordinatorOverview/>}/>
                <Route path="/ViewTasks" element={<ViewTasks/>}/>
                <Route path="/Incidents" element={<Incidents/>} />
                <Route path="/CoordinatorOverview" element={<CoordinatorOverview/>} />
                  
              </Routes>
            
           </div>
          
        </div>
  )
}

export default Coordinator

