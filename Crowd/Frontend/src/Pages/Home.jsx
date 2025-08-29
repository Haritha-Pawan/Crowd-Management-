import React from "react";
import Role from "./Role";
import assets from '../assets/assets.js';
import { Link } from "react-router-dom";
import Features from "./Features.jsx";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 ">
      <div className="navbar w-full h-20 bg-white/5 backdrop-blur-md border-b border-white/10 text-white shadow-md fixed top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-full flex items-center justify-between">
    
          <div className="text-3xl font-bold tracking-wide ">
            
            crowdFlow</div>

     
          <div className="hidden lg:flex space-x-6 text-sm font-medium items-center">
            <Link to='/parking'>
            <button className="hover:bg-white/10 hover:text-white transition px-4 py-2 rounded-md  cursor-pointer">
              Parking Slot
            </button>
            </Link>

           
            <button className="hover:bg-white/10 hover:text-white transition px-4 py-2 rounded-md  cursor-pointer">
              Lost Person
            </button>
            <button className="hover:bg-white/10 hover:text-white transition px-4 py-2 rounded-md  cursor-pointer">
              Map
            </button>

     <Link to='/register'>
         <button className="ml-4 py-2 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md font-semibold shadow hover:opacity-90 transition cursor-pointer">
              Register Now
            </button>
       </Link>
            
          </div>
         

    
          <div className="lg:hidden">
            <button className="text-white text-2xl focus:outline-none">
              ☰
            </button>
          </div>
        </div>
      </div>

      <div className="Hero-section h-screen pt-24 flex flex-col items-center relative 2xl:top-30 lg:top-20 md:top-25 sm:top-20 max-sm:top-40 ">
        <div className="next-Gen text-white bg-white/10 px-2 rounded-2xl border border-white/10 text-xs mb-4 font-semibold sm:top-8">
          Next-Gen crowed Managemnet
        </div>
        <div className="main-text 2xl:text-7xl lg:text-7xl font-extrabold  sm:text-4xl md:text-6xl text-white max-sm:text-4xl max-sm:w-80 max-sm:text-center ">
          Smart Crowd{" "}
          <span className=" bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent max-sm:tracking-wider">
            Management
          </span>
        </div>
        <div className="sub-text 2xl:w-[1000px] lg:w-[790px] sm:w-[450px] md:w-[680px] mt-7 2xl:text-xl lg:text-xl  md:text-xl text-center text-(--color-secondary) font-medium max-sm:text-md">
          Revolutionary crowd management platform with QR registration, live
          parking updates, lost person reporting,and comprehensive admin
          controls for seamless event experiences
        </div>

        <div className="button-section mt-10 flex gap-6">
          <Link to='/Login'>
          <button className="p-2  px-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md font-bold text-white cursor-pointer max-sm:px-5">
            Get Started
          </button>
          </Link>
          <button className="p-2 px-10 bg-white/5 border border-white/10 rounded-md font-bold text-white cursor-pointer  max-sm:px-5">
            watch demo
          </button>
        </div>
      </div>

    {/* End the Hero Section  */}

    {/* start the role section */}

    <Role />
     <Features />







    </div>
  );
};

export default Home;
