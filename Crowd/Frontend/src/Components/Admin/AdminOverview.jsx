import { User, Users, LocateIcon, Car,LoaderPinwheel } from 'lucide-react';
import React from 'react'
import Barchart from './Barchart';

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
             <button
          onClick={() => setIsPopupOpen(true)}
          className="absolute top-12 right-12 p-3 px-8 rounded-md cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg hover:opacity-80 focus:outline-none transition-all"
        >
          + generate report
        </button>

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

        <div className="card mt-8 xl:grid grid-cols-2 xl:grid-cols-2 gap-16 mx-auto h-80 " >
                
          <div className='chart1 bg-white/5 rounded-md p-4 h-full'>
                <Barchart/>
          </div>
          
          <div className=' bg-white/5 w-130 rounded-md'>lahiru</div>    
  
        </div>
     
    </div>
  )
}

export default AdminOverview
