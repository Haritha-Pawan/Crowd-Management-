import { User, Users, LocateIcon, Car,LoaderPinwheel } from 'lucide-react';
import React from 'react'

const AdminOverview = () => {

    const card = [
    
         {title:"Total Users",icon:<Users color='#2f80ed'/>,count:"1,247" ,summary:"+12% from last event"},
         {title:"Active Counters",icon:<LocateIcon color='#4ade80'/>,count:"8" ,summary:"3 at capacity"},
         {title:"Parking Usage",icon:<Car color='#facc15'/>,count:"78%" ,summary:"415/530 spaces occupied"},
         {title:"Service",icon:<LoaderPinwheel color='#c084fc'/>,count:"12" ,summary:"Food courts & stalls"},

    ];

  return (
    <div className='p-12 h-screen'>
         
         <div className="header text-white text-3xl font-bold">Admin Overview</div>
            <div className="sub-heading text-xl text-gray-300">Monitor and manage all system components</div>

            <div className="card mt-8 xl:grid grid-cols-4 xl:grid-cols-4   gap-18 mx-auto ">
                 

                 {card.map((data,index)=>(

                    
                  <div key={index} className="users bg-white/5 border-white/10 p-5 text-white font-bold  rounded-md w-58">
                    
                    <div className="icon flex justify-between ">
                        <div className="title text-[18px] ">{data.title}</div>
                        <div className="icon">{data.icon}</div> 
                    </div>

                    <div className="count text-2xl mt-1">{data.count}</div>
                    <div className="summary mt-1 text-[14px] font-normal text-gray-300">{data.summary}</div>

                    
                  </div>

                 ))}
  
            </div>
     
    </div>
  )
}

export default AdminOverview
