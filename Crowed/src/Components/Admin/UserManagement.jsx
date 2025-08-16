import { Circle, Filter, Search, User } from 'lucide-react'
import React from 'react'
import { Eye, Edit, Trash } from "lucide-react";

const UserManagement = () => {

  const data = [

   
    
    {title:"Total Users",count:"4",icon:<User/>},
    {title:"Active Users",count:"4",icon:<Circle color='#facc15'/>},
    {title:"Pending",count:"4",icon:""},
    {title:"Organizers",count:"4",icon:""},


  ];
   const users = [
    {
      name: "Naveen",
      email: "Navee@gmail.com",
      role: "Attendee",
      counter: "A1",
      status: "Active",
    },
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


             <div className="table bg-white/5 border-white/10  p-5 mt-5 rounded-md w-full text-white ">
               
                  <h2 className="text-xl font-semibold mb-4">Users</h2>
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-500">
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Email</th>
                        <th className="pb-3">Role</th>
                        <th className="pb-3">Counter</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, idx) => (
                        <tr key={idx} className="border-b border-gray-600">
                          <td className="py-3">{user.name}</td>
                          <td className="py-3">
                            <span className="font-bold">
                              {user.email.split("@")[0]}
                            </span>
                            @{user.email.split("@")[1]}
                          </td>
                          <td className="py-3">{user.role}</td>
                          <td className="py-3">{user.counter}</td>
                          <td className="py-3">
                            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                              {user.status}
                            </span>
                          </td>
                          <td className="py-3 flex gap-2">
                            <button className="bg-blue-700 p-2 rounded hover:bg-blue-600">
                              <Eye size={16} />
                            </button>
                            <button className="bg-blue-700 p-2 rounded hover:bg-blue-600">
                              <Edit size={16} />
                            </button>
                            <button className="bg-red-700 p-2 rounded hover:bg-gray-600">
                              <Trash size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              
                  
          </div>


    </div>

     

  )
}

export default UserManagement
