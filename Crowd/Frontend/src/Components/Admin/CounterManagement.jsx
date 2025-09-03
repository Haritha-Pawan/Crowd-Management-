import { Car, LoaderPinwheel, LocateIcon, LocationEditIcon, TrendingUp, Users,Edit,Trash2Icon } from 'lucide-react';
import React from 'react';

const CounterManagement = () => {

  const card = [
    { title: "Total Counters", icon: <LocationEditIcon color='#2f80ed' />, count: "15", summary: "+12% from last event" },
    { title: "Active Counters", icon: <LocateIcon color='#4ade80' />, count: "8", summary: "3 at capacity" },
    { title: "Total Capacity", icon: <Users color='#facc15' />, count: "225", summary: "415/530 spaces occupied" },
    { title: "Current Load", icon: <TrendingUp color='#c084fc' />, count: "68%", summary: "Food courts & stalls" },
  ];

  const counters = [
    { name: "Counter A1", entrance :"North gate",status: "Entry", capacity: 120, load: 95, staff: "John Smith" },
    { name: "Counter A2",  entrance :"south gate",status: "Exit", capacity: 100, load: 50, staff: "Sarah Johnson" },
  ];

  return (
    <div className="p-12 h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">

      {/* Add Counter Button */}
      <button className="absolute top-14 right-22 p-3 px-10 rounded-md cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg hover:opacity-80 focus:outline-none transition-all">
        + Add Counter
      </button>

      {/* Header */}
      <div className="text-3xl font-bold">Counter Management</div>
      <div className="text-xl text-gray-300 mb-8">Monitor and manage all system components</div>

      {/* Top Stats Cards */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mx-auto">
       {card.map((data,index)=>(

                     <div key={index} className="1 bg-white/5 border border-white/10 lg:w-58 md:w-76 text-white rounded-md p-5">
             
                             <div className="icon flex justify-between ">
                                     <div className="title text-[18px] ">{data.title}</div>
                                     <div className="icon relative top-5 ">{data.icon}</div> 
                             </div>

                               <div className="count text-2xl mt-1 font-bold">{data.count}</div>
                    

                     </div>
                
            ))}
      </div>

      {/* Counter Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {counters.map((counter, index) => (
          <div key={index} className="bg-white/10 border border-white/20 rounded-xl p-6 shadow-xl text-white hover:bg-white/20 transition-all">
            {/* Header Row */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{counter.name}</h3>
              <span className="px-3 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300">{counter.status}</span>
            </div>
          <div className="sub-heading flex mt-1 text-gray-300">
                               <LocationEditIcon size={20}/>
                             <div className="text-xs ml-2">{counter.entrance}</div>
                         </div>
            
             {/* Progress Bar */}
              <div className="text-[14px] mt-6 text-gray-300 flex gap-70">Occupancy
                      <div className=" ">100 / 200 (50%)</div>
                   </div>
              <div className="mt-3 h-2 w-full rounded-full bg-black/40">
                                        <div className="flex h-full w-1/2 items-center justify-center overflow-hidden break-all rounded-full bg-blue-600 text-white"></div>

              </div>
            {/* Details */}
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Capacity</span>
                <span className="font-medium text-white">{counter.capacity}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Load</span>
                <span className="font-medium text-white">{counter.load}</span>
              </div>
              <div className="flex justify-between">
                <span>Assigned Staff</span>
                <span className="font-medium text-white">{counter.staff}</span>
              </div>
            
             
            </div>

            {/* Action Buttons */}
            
               <div className="btn mt-4 flex gap-6">
                  <button className='flex text-lg border border-white/10 px-4 p-1 bg-white/5 rounded-md text-[17px] cursor-pointer text-white' ><LocateIcon size={15} className=' relative top-[6px] mr-2'/>Details</button>
                  <button className='flex text-lg border border-white/10 px-4 p-1 bg-white/5 rounded-md text-[17px] cursor-pointer text-white' ><Edit size={15} className=' relative top-[6px] mr-2'/>Edit</button>
                  <button className='flex text-lg border border-white/10 px-4 p-1 bg-white/5 rounded-md text-[17px] cursor-pointer text-red-400' ><Trash2Icon size={15} className=' relative top-[6px] mr-2'/>Delete</button>
              
               </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CounterManagement;
