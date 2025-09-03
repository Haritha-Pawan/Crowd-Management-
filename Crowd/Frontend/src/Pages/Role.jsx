import React from 'react'

import assets from '../assets/assets.js';
import { Link } from 'react-router-dom';

const Role = () => {
  return (
    <div className="role-section relative lg:-top-2 2xl:-top-100 md:-top-6 max-sm:-mt-40">
      <div className="Title flex justify-center text-4xl font-bold text-white lg:mb-5 ">
         Choose Your Role
      </div>
      <div className="sub-titl flex justify-center text-xl font-light  text-(--color-secondary) mb-11 max-sm:text-x">
        Access tailored features for your specific needs
      </div>

      <div className="role-based grid lg:grid-cols-4 md:grid-cols-2 gap-4 mx-10 ">

          <Link to='/Attendee'>
         
             <div className="role1 bg-white/5 p-5 h-55 rounded-md border-2 border-white/10   cursor-pointer hover:scale-95">
                <div className="icon w-14 mx-auto mb-5 rounded-4xl">
                     <img src={assets.card1}/>
                </div>

               

                    <div className="title text-white text-2xl text-center mb-4 ">
                    Attendee
                    </div>

                
                

                 <div className="description  text-white text-l text-center">
                      Register, get QR codes, find parking, report issues
                 </div>
             </div>

           </Link>

     <Link to='/Admin'>
             <div className="role1 bg-white/5 p-5 h-55 rounded-md border-2 border-white/10   cursor-pointer hover:scale-95">
                <div className="icon w-14 mx-auto mb-5 rounded-4xl">
                     <img src={assets.card2}/>
                </div>
                <div className="title text-white text-2xl text-center mb-4 ">
                    System Admin
                </div>
                 <div className="description  text-white text-l text-center">
                      Manage users, counters, parking, and services
                 </div>

                 

             </div>
     </Link>


     <Link to='/Organizer'>

             <div className="role1 bg-white/5 p-5 h-55 rounded-md border-2 border-white/10 cursor-pointer hover:scale-95">
                <div className="icon w-14 mx-auto mb-5 rounded-4xl ">
                     <img src={assets.card3}/>
                </div>
                <div className="title text-white text-2xl text-center mb-4 ">
                   Event Organizer
                </div>
                 <div className="description  text-white text-l text-center">
                     Create events, manage maps, handle sponsorships
                 </div>

                 

             </div>

     </Link>


          <div className="role1 bg-white/5 p-5 h-55 rounded-md border-2 border-white/10 cursor-pointer hover:scale-95">
                <div className="icon w-14 mx-auto mb-5 rounded-4xl ">
                     <img src={assets.card4}/>
                </div>
                <div className="title text-white text-2xl text-center mb-4 ">
                    Event Coordinator
                </div>
                 <div className="description  text-white text-l text-center">
                      Set rules, regulations, and safety protocols
                 </div>
                 
          </div>

          <div className="role1 bg-white/5 p-5 h-55 rounded-md border-2 border-white/10 cursor-pointer hover:scale-95">
                <div className="icon w-14 mx-auto mb-5 rounded-4xl ">
                     <img src={assets.card4}/>
                </div>
                <div className="title text-white text-2xl text-center mb-4 ">
                    Counter Staff
                </div>
                 <div className="description  text-white text-l text-center">
                      Set rules, regulations, and safety protocols
                 </div>

          </div>  

          <div className="role1 bg-white/5 p-5 h-55 rounded-md border-2 border-white/10 cursor-pointer hover:scale-95">
                <div className="icon w-14 mx-auto mb-5 rounded-4xl ">
                     <img src={assets.card4}/>
                </div>
                <div className="title text-white text-2xl text-center mb-4 ">
                    Parking Staff
                </div>
                 <div className="description  text-white text-l text-center">
                      Set rules, regulations, and safety protocols
                 </div>

          </div>  
            
      </div>


     

    </div>
  )
}

export default Role
