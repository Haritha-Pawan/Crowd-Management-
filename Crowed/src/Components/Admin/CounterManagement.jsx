import { Car, LoaderPinwheel, LocateIcon, LocationEditIcon, TrendingUp, Users } from 'lucide-react';
import React from 'react'

const CounterManagement = () => {

        const card = [
        
             {title:"Total Counters",icon:<LocationEditIcon color='#2f80ed'/>,count:"1,247" ,summary:"+12% from last event"},
             {title:"Active Counters",icon:<LocateIcon color='#4ade80'/>,count:"8" ,summary:"3 at capacity"},
             {title:"Total Capacity",icon:<Users color='#facc15'/>,count:"78%" ,summary:"415/530 spaces occupied"},
             {title:"Current Load",icon:<TrendingUp color='#c084fc'/>,count:"12" ,summary:"Food courts & stalls"},
    
        ];
 
  return (

    <div className='p-12 h-screen'>

        <button className="add-btn p-2 rounded-md  bottom-8 relative left-[850px] top-14 cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 "> + Add Counter</button>
         
         <div className="header text-white text-3xl font-bold">Admin Overview
            
         </div>
         
            <div className="sub-heading text-xl text-gray-300">Monitor and manage all system components</div>

                       

            <div className="card mt-8 xl:grid grid-cols-4 xl:grid-cols-4   gap-18 mx-auto ">
                 

                 {card.map((data,index)=>(

                    
                  <div key={index} className="users bg-white/5 border border-white/10 p-5 text-white font-bold  rounded-md w-58">
                    
                    <div className="icon flex justify-between ">
                        <div className="title text-[18px] ">{data.title}</div>
                        <div className="icon">{data.icon}</div> 
                    </div>

                    <div className="count text-2xl mt-1">{data.count}</div>
                    <div className="summary mt-1 text-[14px] font-normal text-gray-300">{data.summary}</div>

                    
                  </div>

                 ))}
  
            </div>


            {/* counter managememnt */}


            <div className="grid grid-cols-2 mt-4 gap-10">
                <div className="p-2 bg-white/5 border border-white/10 rounded-md text-white">
                    <div className="flex">
                        <div className="counter-Name ">Counter A1</div>
                        <div className={`counter-status `}>Entry</div>
                    </div>
                </div>
            </div>
     
    </div>
   
  )
}

export default CounterManagement
