import { Car, ChartNoAxesCombined, Circle, CircleDotIcon, Delete, DeleteIcon, Edit, Locate, LocationEdit, LocationEditIcon, Trash2Icon } from 'lucide-react';
import React, { useState } from 'react'
import AddForm from './Parking/AddForm';

const ParkingManagement = () => {

   const[isPopupOpen,setIsPopupOpen] = useState(false);

  const card = [
        
             {title:"Total Counters",icon:<Car color='#2f80ed' size={30}/>,count:"630" },
             {title:"Total Occupied",icon:<CircleDotIcon color='#FF3535' size={30}/>,count:"460"},
             {title:"Available",icon:<CircleDotIcon color='#4ade80' size={30}/>,count:"170"},
             {title:"Occupancy Rate",icon:<ChartNoAxesCombined color='#facc15' size={30}/>,count:"73%"},
           
    
        ];

  return (
    <div className='p-12 '>
        <div className="header text-white text-3xl font-bold">Parking Management</div>
        <div className="sub-heding text-gray-300 text-xl">Manage parking zones and reservations</div>

        <div className="card grid lg:grid-cols-4 mt-8 md:grid-cols-2  gap-3 mx-auto">

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


        <button onClick={()=>setIsPopupOpen(true)} className="add-Parking bg-gradient-to-r from-blue-500 to-purple-600 p-2 px-10 cursor-pointer  font-medium mt-5 absolute right-22 rounded-md hover:opacity-70  text-white ">+ Add Prking Zone</button>
           
       <AddForm
       isOpen={isPopupOpen}
       onClose={()=>setIsPopupOpen(false)}
       />

       {/*parking slots*/}
       <div className="parking-slots mt-20 grid grid-cols-2 gap-10">
          <div className="p-5 bg-white/5 rouned-md border border-white/10 rounded-md text-white text-2xl font-medium"> 
               <div className="title flex lg:gap-30  max-sm:gap-1">Zone A - Main Parking
                 <div className="bg-green-500/20 text-xs rounded-full border border-green-300/20 w-10 px-8 flex justify-center items-center  h-5 relative top-3">Active</div>
               </div>
               <div className="sub-heading flex mt-2 text-gray-300">
                     <LocationEdit size={20}/>
                   <div className="text-xs ml-2">Main Entrance Area </div>
               </div>
  
                   <div className="text-[14px] mt-6 text-gray-300 flex gap-70">Occupancy
                      <div className=" ">150 / 200 (75%)</div>
                   </div>

                    <div className=" mt-3 flex-start flex h-2.5 w-full overflow-hidden rounded-full bg-black/40 font-sans text-xs font-medium">
                        <div className="flex h-full w-1/2 items-center justify-center overflow-hidden break-all rounded-full bg-blue-600 text-white"></div>
                     </div>

                     <div className="text-[14px] mt-2 text-gray-300 font-normal">Available Slot : <span className='text-green-400 font-bold'>50 Spots</span></div>

               {/*button*/}

               <div className="btn mt-4 flex gap-6">
                  <button className='flex text-lg border border-white/10 px-4 p-1 bg-white/5 rounded-md text-[17px] cursor-pointer text-white' ><Locate size={15} className=' relative top-[6px] mr-2'/>Details</button>
                  <button className='flex text-lg border border-white/10 px-4 p-1 bg-white/5 rounded-md text-[17px] cursor-pointer text-white' ><Edit size={15} className=' relative top-[6px] mr-2'/>Edit</button>
                  <button className='flex text-lg border border-white/10 px-4 p-1 bg-white/5 rounded-md text-[17px] cursor-pointer text-red-400' ><Trash2Icon size={15} className=' relative top-[6px] mr-2'/>Details</button>
              
               </div>



          </div>





          {/*yellow bar*/}
                  <div className="p-5 bg-white/5 rouned-md border border-white/10 rounded-md text-white text-2xl font-medium"> 
               <div className="title flex lg:gap-30  max-sm:gap-1">Zone B - Main Parking
                 <div className="bg-green-500/20 text-xs rounded-full border border-green-300/20 w-10 px-8 flex justify-center items-center  h-5 relative top-3">Active</div>
               </div>
               <div className="sub-heading flex mt-2 text-gray-300">
                     <LocationEdit size={20}/>
                   <div className="text-xs ml-2">Main Entrance Area </div>
               </div>
  
                   <div className="text-[14px] mt-6 text-gray-300 flex gap-70">Occupancy
                      <div className=" ">100 / 200 (50%)</div>
                   </div>

                    <div className=" mt-3 flex-start flex h-2.5 w-full overflow-hidden rounded-full bg-black/40 font-sans text-xs font-medium">
                        <div className="flex h-full w-3/4 items-center justify-center overflow-hidden break-all rounded-full bg-yellow-400 text-white"></div>
                     </div>

                     <div className="text-[14px] mt-2 text-gray-300 font-normal">Available Slot : <span className='text-green-400 font-bold'>50 Spots</span></div>

               {/*button*/}

               <div className="btn mt-4 flex gap-6">
                  <button className='flex text-lg border border-white/10 px-4 p-1 bg-white/5 rounded-md text-[17px] cursor-pointer text-white' ><Locate size={15} className=' relative top-[6px] mr-2'/>Details</button>
                  <button className='flex text-lg border border-white/10 px-4 p-1 bg-white/5 rounded-md text-[17px] cursor-pointer text-white' ><Edit size={15} className=' relative top-[6px] mr-2'/>Edit</button>
                  <button className='flex text-lg border border-white/10 px-4 p-1 bg-white/5 rounded-md text-[17px] cursor-pointer text-red-400' ><Trash2Icon size={15} className=' relative top-[6px] mr-2'/>Details</button>
              
               </div>



          </div>
       </div>
  
         
    </div>
  )
}

export default ParkingManagement
