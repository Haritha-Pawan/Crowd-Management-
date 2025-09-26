
import React from 'react'
import { User, Users, LocateIcon, Car,LoaderPinwheel, UserCheck, Clock1, ScanLineIcon, Search, SearchCheckIcon, SearchIcon } from 'lucide-react';
import { Link } from 'react-router-dom';


const CounterStaffOverview = () => {

    const card = [
    
         {title:"Total Attendees",icon:<Users color='#2f80ed'/>,count:"1,247" ,summary:"+12% from last event"},
         {title:"Checked In",icon:<UserCheck color='#4ade80'/>,count:"8" ,summary:"3 at capacity"},
         {title:"Pending",icon:<Clock1 color='#facc15'/>,count:"78%" ,summary:"415/530 spaces occupied"},
         {title:"Checkout",icon:<LoaderPinwheel color='#c084fc'/>,count:"12" ,summary:"Food courts & stalls"},

    ];

  return (
    <div className='p-12 h-screen'>
         
         <div className='w-full bg-white/10 border border-white/5 rounded-md p-6 '>
               <div className='flex justify-between'>
                <div className='flex flex-col'>
                       <div className="text-white text-3xl font-bold">Counter Staff Dashboard</div>
                       <div className="text-white">Manage attendee check-ins with QR scanning</div>
                </div>
 |         <Link to="/QRScanner">
                 <div className='flex '>
                  
                       <div className="text-white  font-bold w-40 flex justify-center items-center rounded-md gap-4 hover:opacity-70  h-10 bg-gradient-to-r from-blue-500 to-purple-600 cursor-pointer">
                         <ScanLineIcon size={20}/>QR Scanner</div>
                   
                </div>
                 </Link>
                
               </div>

                

              
         </div>

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

            <div className='w-full bg-white/10 border border-white/5 rounded-md p-6  mt-10'>

            <div className='flex justify-between mb-4'>
                <div className="text-xl text-white font-bold">Attendee List</div>
                <div className='flex justify-between'>
                    <SearchIcon className='absolute mt-3 ml-2' color='white'/>
                    <input type="text" placeholder='Search Attendee' className='border rounded-md shadow-md  placeholder:text-gray-300 text-white text-[18px] text-center p-2  bg-white/5 '/>
                </div>
            </div>
               
            </div>
     
    </div>
  )
}

export default CounterStaffOverview
