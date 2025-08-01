import { Circle, Filter, Search, User } from 'lucide-react'
import React from 'react'

const UserManagement = () => {

  const data = [

   
    
     {title:"Total Users",count:"4",icon:<User/>},
     {title:"Active Users",count:"4",icon:<Circle color='#facc15'/>},
    {title:"Pending",count:"4",icon:""},
    {title:"Organizers",count:"4",icon:""},


  ];


  return (
    <div className='p-10 mx-auto h-screen'>
          <div className="header text-3xl text-white font-bold">User Management</div>
          <div className="sub-heading text-gray-300 mb-5">Manage system users and their permissions</div>

                {/* card section total users .... */}

          <div className="card grid md:grid-cols-4 gap-10 ">

            {data.map((data,index)=>(
                 <div className="p-5 bg-white/5 border border-white/10 w-58 rounded-md shadow-md">
                     <div className="text-gray-300">{data.title}</div>
                     <div className="text-2xl text-white font-bold flex justify-between ">{data.count}
                        
                        <div className="icon flex">
                            <div className="circle w-7 h-7 rounded-full ">
                               {data.icon}
                            </div>
                        </div>
                        </div> 
                     
                </div>

            ))}
             
                
          </div>




        {/*start serch section*/}
             <div className="search-section bg-white/5 border border-white/10 p-5 mt-5 rounded-md ">
                  <div className="flex gap-4">
                    <Filter color='#ffffff' size={30}/>
                      <div className="text-white text-2xl font-bold">Filter & Search</div>
                  </div>


                 <div className="flex gap-10 mt-3">
                      <div className="flex flex-col">
                           
                             <label className='text-white '>Search User</label>
                             <input type="text" placeholder='Serach by Name, Email or Nic' className='bg-white/5  p-2 px-8 rounded-md border border-white/10 shadow-md'/>
                              <Search className=' relative bottom-7 ml-2'  size={20}/>

                          
                     

                      </div>

                     <div className="flex flex-col">
                           
                             <label className='text-white'>Status Filter</label>
                             <select className='bg-white/5 p-2 w-[250px] rounded-md border border-white/10 text-gray-100 shadow-md'>
                               <option className='text-gray/5 '>All Status</option>
                               <option>sd</option>
                                <option>All Status</option>
                            </select>


                      </div>


                        <div className="flex flex-col">
                           
                             <label className='text-white'>Role Filter</label>
                             <select className='bg-white/5 p-2 w-[250px] rounded-md border border-white/10 text-gray-100 shadow-md'>
                               <option className='text-gray/5 '>All Role</option>
                               <option>sd</option>
                               <option>All Status</option>
                            </select>


                      </div>


                      <div className="flex flex-col">    
                          <button className='bg-white/5 p-2 text-white relative top-6 rounded-md px-4 cursor-pointer border border-white/10 shadow-md'>Clear Filter</button>               
                   </div>
                 </div> 
             </div>

             {/* End of Serac */}


             <div className="table bg-white/5 border-white/10  p-5 mt-5 rounded-md w-full ">
                  
             </div>


    </div>

     

  )
}

export default UserManagement
