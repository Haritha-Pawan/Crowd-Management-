import React from 'react'
import SidebarDash from '../../Ui/SidebarDash'
import { User } from 'lucide-react';

const Incident = () => {
      const AdminLinks = [
        { name: 'overview', icon: <User size={20} />, to: '/Admin/AdminOverview' },
       
      ];
  return (

            <div className='flex bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 h-auto'>

        <SidebarDash 
          
          title={"Incident Dashboard"}
          subtitle={"Your event experience hub"}
          links={AdminLinks}

          />
fvfdg
          </div>
  )
}

export default Incident
