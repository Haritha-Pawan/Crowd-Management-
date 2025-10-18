import React from 'react'
import assets from '../assets/assets'
import time from '../assets/time.png'
import counter from '../assets/bar-counter.png'
import phone from '../assets/smartphone.png'

const Features = () => {
  return (
    <div className=' w-full 2xl:-mt-60 xl:mt-30 sm:mt-20  max-sm:mt-30'>


       <div className="feature-headline mb-5 text-center text-white text-4xl font-bold">
        Powerful Features
       </div>
       <div className="sub-heading   text-center text-xl  text-(--color-secondary) font-light">
        Everything you need for successful event management
       </div>


        <div className="grid xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2 p-10 gap-10">

                <div className="1 bg-white/10 h-[250px] border-2 border-white/10 rounded-md p-5">
                   <div className="image w-14 mb-8">
                       <img src={assets.QR}/>
                   </div>

                   <div className="feature-card-title text-white text-2xl font-bold mb-2 ">
                    Smart QR Registration
                   </div>
                   <div className="feature-card-description text-(--color-secondary) font-semibold">
                    Generate unique QR codes for seamless event entry and tracking
                   </div>
                </div>

                   <div className="1 bg-white/10 h-[250px] border-2 border-white/10 rounded-md p-5">
                   <div className="image w-18 mb-8">
                       <img src={phone}/>
                   </div>

                   <div className="feature-card-title text-white text-2xl font-bold mb-2 ">
                    Booking Parking Slots
                   </div>
                   <div className="feature-card-description text-(--color-secondary) font-semibold">
                    Generate unique QR codes for seamless event entry and tracking
                   </div>
                </div>


                   <div className="1 bg-white/10 h-[250px] border-2 border-white/10 rounded-md p-5">
                   <div className="image w-18 mb-8">
                       <img src={time}/>
                   </div>

                   <div className="feature-card-title text-white text-2xl font-bold mb-2 ">
                    Real time notifications
                   </div>
                   <div className="feature-card-description text-(--color-secondary) font-semibold">
                    Generate unique QR codes for seamless event entry and tracking
                   </div>
                </div>


                   <div className="1 bg-white/10 h-[250px] border-2 border-white/10 rounded-md p-5">
                   <div className="image w-18 mb-8">
                       <img src={counter}/>
                   </div>

                   <div className="feature-card-title text-white text-2xl font-bold mb-2 ">
                   Counter Management
                   </div>
                   <div className="feature-card-description text-(--color-secondary) font-semibold">
                    Generate unique QR codes for seamless event entry and tracking
                   </div>
                </div>


                   <div className="1 bg-white/10 h-[250px] border-2 border-white/10 rounded-md p-5">
                   <div className="image w-14 mb-8">
                       <img src={assets.protect}/>
                   </div>

                   <div className="feature-card-title text-white text-2xl font-bold mb-2 ">
                    Lost and Found
                   </div>
                   <div className="feature-card-description text-(--color-secondary) font-semibold">
                    Generate unique QR codes for seamless event entry and tracking
                   </div>
                </div>

                   <div className="1 bg-white/10 h-[250px] border-2 border-white/10 rounded-md p-5">
                   <div className="image w-18 mb-8">
                       <img src={assets.card1}/>
                   </div>

                   <div className="feature-card-title text-white text-2xl font-bold mb-2 ">
                   Task Automation
                   </div>
                   <div className="feature-card-description text-(--color-secondary) font-semibold">
                    Generate unique QR codes for seamless event entry and tracking
                   </div>
                </div>

           
              

                
               
        
              
                
        </div>


    </div>
  )
}

export default Features
