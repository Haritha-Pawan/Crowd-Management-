
import React from 'react'
import Sidebar from '../../Ui/SidebarDash.jsx';
import {Routes ,Route} from 'react-router-dom'
import{User,UserPlus,Car,TriangleAlert,Settings, Loader2Icon, ChartArea} from 'lucide-react';
import CounterStaffOverview from './CounterStaffOverview.jsx';
import QRScanner from '../Counter/QRScanner.jsx';






const CounterDashboard = () => {

       const AdminLinks = [
        { name: 'overview', icon: <User size={20} />, to: '/Admin/AdminOverview' },
        { name: 'QR Scanner', icon: <UserPlus />, to: '/QRScanner' },
        { name: 'Report', icon: <ChartArea />, to: '/Admin/CounterManagement' },
       
      ];

  return (
        <div className='flex bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 h-auto min-h-screen'>
          
          <Sidebar 
          
          title={"Counter Staff Dashboard"}
          subtitle={"Your event experience hub"}
          links={AdminLinks}

          />

          {/* Right side */}
    
            <div className="Right flex flex-10/12">
      
              <Routes>

                <Route path="/*" element={<CounterStaffOverview/>}/>
                <Route path="/QRScanner" element={<QRScanner/>}/>
                
                
                
            
               
              </Routes>
            
           </div>
          
        </div>
  )
}

export default CounterDashboard;
