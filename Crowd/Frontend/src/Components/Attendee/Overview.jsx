import { Car, QrCode,MapPin ,TriangleAlert ,CalendarCheck2} from 'lucide-react'
import React from 'react'

const Overview = () => {

const details = [

    {title:"Entry Status",sub:"Registered",Counter:"Counter A1",icon:<QrCode size={24} color='#3b82f6' />},
    {title:"parking status ",sub:"Available",Counter:"Zone A-45 spots left",icon:<Car size={24} color='#47cd81'/>},
    {title:"Complaint ",sub:"2",Counter:"1 pending 1 resolved",icon:<TriangleAlert size={24}  color='#f0c51b'/>},

];


const btndetails=[

    {icon:<Car size={24} color='#4CB6DD'/>,text:"Check Parking Availability",to:'./parking'},
    {icon:<MapPin size={24} color='red'/>,text:"View Event Map",to:'./map'},
    {icon:<TriangleAlert size={24} color='#f0c51b'/>,text:"Submit Complaint",to:'./complaint'},
    {icon:<CalendarCheck2 size={24} color='#0EEF7E'/>,text:"Event Schedule",to:'./schedule'},
];


  return (
    <div className='p-5'>
        <div className="title text-white text-3xl font-bold">Welcome, Haritha Pawan</div>

         <div className="sub text-(--color-secondary) mt-2">Your event Dashbord and quick access tools</div>


        

         <div className="2xl:grid-cols-3  grid grid-cols-3 md:grid-cols-3 2xl:gap-24 xl:gap-22 mt-10">

             {details.map((details,index)=>(

                    <div className="bg-white/10 p-4 text-white rounded-md border border-white/5 shadowd-md">
                  <div className="Entry flex justify-between 2xl:w-[390px] xl:w-[270px] text-xl font-bold">{details.title} 
                            <div className="Qr">
                                {details.icon}
                            </div>
                            

                  </div>
                  <div className="tedt-xl font-bold">{details.sub}</div>

                  <div className=" mt-3 text-x text-(--color-secondary)">Counter : {details.Counter}</div>
               </div>
            
         ))}
              
           

               
                
         </div>



           <div className="grid grid-cols-2 md:grid-cols-2 gap-10 mt-10">
                    <div className="QR bg-white/10 p-4 rounded-md border border-white/5 shadow-md">
                       <div className="text-xl font-bold text-white">Your QR Code</div>
                       <div className="text-(--color-secondary)">Use this for event entry and services</div>

                       <div className="QR-Code flex justify-center mt-4">
                              <div className="bg-white rounded-md p-4">
                                <QrCode size={100} color='black' back/>
                              </div>
                            
                       </div>

                       <div className="text-center text-(--color-secondary) mt-2">
                        ID: QR-1701234567-abc123def
                       </div>

                       <div className="bg-[#3b82f6] text-white font-semibold p-2 rounded-md mt-4 text-center cursor-pointer hover:bg-[#2563eb] transition mb-6">
                            Download QR Code
                       </div>

                    </div>



                        <div className="QR bg-white/10 p-4 rounded-md border border-white/5 shadow-md">
                       <div className="text-xl font-bold text-white">Quick Action</div>
                       <div className="text-(--color-secondary)">Use this for event entry and services</div>

                    
      
                         
                         {btndetails.map((btndetails,index)=>(

                             <div className="bg-white/10 border border-white/10 shadow-md text-white font-semibold p-2 rounded-md mt-4 text-center cursor-pointer hover:bg-[#2563eb] transition flex gap-5 ">
                                <div className="icon">
                                 {btndetails.icon}
                                </div>
                                  {btndetails.text}
                             </div>

                         ))}      
                            
                        
                     

                      

                    </div>
                    
           </div>


    </div>
  )
}

export default Overview
