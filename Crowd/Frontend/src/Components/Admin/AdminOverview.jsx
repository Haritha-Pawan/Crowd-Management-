import { User, Users, LocateIcon, Car, LoaderPinwheel } from 'lucide-react';
import React from 'react'
import Barchart from './Barchart';
import LineChart from './LineChart';
import { useEffect, useState } from 'react';

const AdminOverview = () => {

  const [attendeeCount, setAttendeeCount] = useState(0);
  const [totalCounters, setTotalCounters] = useState(0);
 


  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("http://localhost:5000/other/attendance/count");
        const data = await res.json();
        setAttendeeCount(data.count);
      } catch (err) {
        console.error("Error fetching attendee count:", err);
      }
    };
    fetchCount();
  }, []);

  useEffect(() => {
    const fetchTotalCounters = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/counter/totalCount");   
        const data = await res.json();
        setTotalCounters(data.count);
      }
      catch (err) {
        console.error("Error fetching total counters:", err);
      }
    };
    fetchTotalCounters();

  }, []);
 

    const card = [
    
         {title:"Total Users",icon:<Users color='#2f80ed'/>,count:attendeeCount ,summary:"+12% from last event"},
         {title:"Active Counters",icon:<LocateIcon color='#4ade80'/>,count:totalCounters ,summary:"3 at capacity"},
         {title:"Parking Usage",icon:<Car color='#facc15'/>,count:attendeeCount ,summary:"415/530 spaces occupied"},
         {title:"Service",icon:<LoaderPinwheel color='#c084fc'/>,count:attendeeCount ,summary:"Food courts & stalls"},

    ];

  return (
    <div className='p-12 h-full max-h-screen overflow-y-auto'>
         
         <div className="header text-white text-3xl font-bold">Admin Overview</div>
            <div className="sub-heading text-xl text-gray-300">Monitor and manage all system components</div>
             <button
          onClick={() => setIsPopupOpen(true)}
          className="absolute top-12 right-12 p-3 px-4 rounded-md cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg hover:opacity-80 focus:outline-none transition-all"
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
          
          <div className='w-130 rounded-md'>
                <LineChart/>
          </div>    
  
        </div>
     
    </div>
  )
}

export default AdminOverview
