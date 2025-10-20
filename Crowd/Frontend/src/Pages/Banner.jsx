import React from 'react';
import shieldImage from '../assets/images/temple.jpg'; 

import line1 from '../assets/images/chart2.png';
import line2 from '../assets/images/chart3.png';



function Banner() {
  return (
    <div className='grid grid-cols-2  bg-gradient-to-b from-[#111B44] to-[#1A2250] text-white p-10 rounded-xl mx-10 mt-10'>

      {/* Left Side */}
      <div className='flex flex-col justify-between space-y-8 px-8'>
      
        <div>
          <h2 className="text-4xl font-bold mb-8 ">
            <span className="text-orange-400">CrowdFlow</span> is fully GDPR <br />Compliant
          </h2>
          <p className="text-md text-gray-300 mt-2 opacity-60">Our platform is designed with privacy and security at its core. CrowdFlow ensures that all personal data is collected, processed, and stored in accordance with GDPR regulations, giving users confidence that their information is handled responsibly and transparently.</p>
        </div>

        {/* Cards */}
        <div className=" gap-4 m grid grid-rows-3 mt-8 ">
          <div className="bg-orange-400 text-white p-4 rounded-lg w-60 h-30 ">
            <p className="text-xs">Number of Visitors</p>
            <p className="text-3xl font-bold">150</p>
            <img  src={line1} className='relative left-30 w-20 z-20 -top-10' /> 
            
        
            
          </div>
          <div className="bg-gray-200 text-black p-4 rounded-lg w-60 h-30 mx-40 relative z-20 -top-10 shadow-2xl">
            <p className="text-xs">Number of Visitors</p>
            <p className="text-3xl font-bold">14</p>
            <img  src={line2} className='relative left-30 w-20 z-20 -top-10' /> 
            
          </div>
          <div className="bg-gray-300 text-black p-4 rounded-lg w-60 relative  h-30 z-20 -top-18 shadow-2xl">
            <p className="text-xs">Avg Time in Queue</p>
            <p className="text-3xl font-bold">3min</p>
            <img  src={line1} className='relative left-30  w-20 z-20 -top-10' /> 
             
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className='space-y-6'>
        <div className="rounded-lg overflow-hidden">
          <img
            src={shieldImage}
            alt="Security Shield"
            className="p-4 rounded-2xl  relative  w-120 "
          />
        </div>
        <div className='p-4'>
          <h2 className="text-4xl font-bold">
            <span className="text-orange-400">Real-Time</span> Monitoring &amp; Analysis
          </h2>
          <p className="text-md text-gray-300 mt-6 opacity-60 ">
            This feature allows organizers to track event activities as they happen, including attendee check-ins, ticket scans, parking availability, and crowd movement. The system collects live data and provides visual dashboards with analytics, helping administrators make quick decisions, improve event flow, and ensure a smooth experience for all participants.
          </p>
        </div>
      </div>

    </div>
  );
}

export default Banner;
