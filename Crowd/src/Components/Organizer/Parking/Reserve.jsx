import { Car, CardSim, CreditCard, MoveLeftIcon, User } from 'lucide-react'
import React from 'react'
import {  useNavigate } from 'react-router-dom'

const Reserve = () => {
   
    const navigate = useNavigate();

  return (
     <div className="h-screen flex bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 ">

        <div 
         onClick={()=>navigate('/parking')}
        className='flex absolute top-12 left-10 bg-white/5 px-4 py-1 rounded-md border border-white/10 cursor-pointer gap-1'>
            <MoveLeftIcon color='#ffff'/>
             <div className='text-white '>Back to Home</div>
        </div>
             
           <div className="box p-10 mt-14 w-full">
                   <div className="text-white text-4xl font-bold">Smart Parking System</div>
                   <div className="text-(--color-secondary) mb-4">
                      Real-time parking availability and reservation system
                   </div>


                       

                       <div className="Booking-details flex  bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">

                                 <div className="slot-details p-6 ">

                                    <div className="w-120 0 h-90 bg-white/5 border border-white/10 ml-40 rounded-md p-8">

                                        <div className='flex gap-3 text-white mt-3 text-xl font-bold mb-5'>
                                                 <Car  color='#ffff'/> 
                                                  Parking Spot Details
                                        </div>

                                        <div className='text-gray-300 flex justify-between'>Spot id
                                            <div className='border border-white/10 rounded-full px-3 font-bold text-[13px] text-white'>A001</div>
                                        </div>
                                       
                                        <div className='text-gray-300 flex justify-between mt-4'>Zone
                                            <div className='font-Regular text-[13px] text-white '>Zone A - Main Entrance</div>
                                        </div>


                                        <div className='text-gray-300 flex justify-between mt-4'>Type
                                            <div className='font-Regular text-[11px] border border-green-500/20 bg-green-500/20 p-1 rounded-full text-xs px-2 text-green-400'>Standard</div>
                                        </div>

                                         <div className='text-gray-300 flex justify-between mt-4'>Rate per Hour
                                            <div className='font-Regular text-[18px] font-semibold text-green-500'>Rs:300.00</div>
                                        </div>

                                           <div className='text-gray-300 flex justify-between mt-4'>Distance
                                            <div className='font-Regular text-[18px] font-semibold text-white'>100m</div>
                                        </div>



                                    </div>
                                 </div>

                                 {/*Right side boking*/}

                                  <div className="slot-details p-6 ">
                                    <div className="w-120 0 h-90 bg-white/5 border border-white/10  rounded-md p-8">
                                       
                                        <div className='flex gap-3 text-white mt-3 text-xl font-bold mb-5'>
                                                 <CreditCard  color='#ffff'/> 
                                                  Parking Spot Details
                                        </div>

                                         <div className='flex gap-3 text-white mt-3 text-[15px] font-bold mb-2 '>
                                                 <Car  color='#ffff' size={20}/> 
                                                 Vehicle Information
                                        </div>

                                        <div className='flex flex-col'>
                                            <label className='text-gray-300 text-[13px]'>Vehicle Information</label>
                                            <input type='text' placeholder='ABC-1234 ' className='border border-white/10 bg-white/5 rounded-md placeholder:ml-2 text-gray-300 text-[13px] outline-none p-2' />
                                        </div>


                                        
                                         <div className='flex gap-3 text-white text-[15px] font-bold mb-2 mt-4'>
                                                 <User  color='#ffff' size={20}/> 
                                                 Driver Information
                                        </div>

                                        <div className='flex flex-col'>
                                            <label className='text-gray-300 text-[13px]'>Full Name</label>
                                            <input type='text' placeholder='Haritha Pawan ' className='border border-white/10 bg-white/5 rounded-md placeholder:ml-2 text-gray-300 text-[13px] outline-none p-2' />
                                        </div>

                                        <div className='flex gap-7 mt-2'>

                                                 <div className='flex flex-col'>
                                                         <label className='text-gray-300 text-[13px]'>Email</label>
                                                        <input type='email' placeholder='harithapawan@gmail.com' className='w-[200px] border border-white/10 bg-white/5 rounded-md placeholder:ml-2 text-gray-300 text-[13px] outline-none p-2' />
                                                 </div>

                                                 <div className='flex flex-col'>
                                                       <label className='text-gray-300 text-[13px]'>Phone</label>
                                                        <input type='text'
                                                           pattern='[0-9]*'
                                                           inputMode='numeric'
                                                        placeholder='0770589643 ' className='w-[200px] border border-white/10 bg-white/5 rounded-md placeholder:ml-2 text-gray-300 text-[13px] outline-none p-2' />
                                                </div>
                                            
                                        </div>

                                    

                                    </div>
                                 </div>
                       </div>

 

           </div>

     </div>
  )
}

export default Reserve
