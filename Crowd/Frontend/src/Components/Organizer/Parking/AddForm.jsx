import React from 'react'

const AddForm = ({isOpen,onClose}) => {



    if(!isOpen) return null;

  return (
    <div className='fixed z-50 inset-0 flex justify-center items-center'>
        <div className="box w-1/2 bg-[#0f172a] p-5 rounded-md border border-white/10">
        <h2 className='text-white font-bold text-xl '>Add New Parking Slots</h2>
        <h6 className='text-gray-300 font-bold text-xs '>Create a new parking zone for the event</h6>
        

                <div className="form-section ">
                    <form>

                        <div className='flex gap-5 mt-4'>

                             <div>
                                 <label className='text-white flex mb-1 font-bold'>Zone Name</label>
                                 <input type='text' placeholder="Zone A - Main Parking" className='text-white bg-[#272f40] border border-white/20 rounded-md p-2 w-[300px]  placeholder:text-gray-500 '/>
                             </div>

                             <div>
                                 <label className='text-white flex mb-1 font-bold'>Capacity</label>
                                 <input type='text' placeholder="Capacity" className='text-white bg-[#272f40] border border-white/20 rounded-md p-2 w-[300px] placeholder:text-gray-500'/>
                             </div>

                        </div>

                          <div className='mt-3'>
                                 <label className='text-white flex mb-1 font-bold'>Capacity</label>
                                 <input type='text' placeholder="Capacity" className='text-white w-full  bg-[#272f40] border border-white/20 rounded-md p-2  placeholder:text-gray-500'/>
                         </div>

                         

                         <div className="grid grid-cols-3 gap-2 mt-3">
                             <div className=''>
                                <label className='text-white flex mb-1 font-bold'>Type</label>
                                 <input type='text' placeholder="Capacity" className='text-white   bg-[#272f40] border border-white/20 rounded-md p-2  placeholder:text-gray-500'/>
                             </div>

                            <div className=''>
                                <label className='text-white flex mb-1 font-bold'>Type</label>
                                 <input type='text' placeholder="Capacity" className='text-white   bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500'/>
                             </div>

                            <div className=''>
                                <label className='text-white flex mb-1 font-bold'>Type</label>
                                 <input type='text' placeholder="Capacity" className='text-white   bg-[#272f40] border border-white/20 rounded-md p-2  placeholder:text-gray-500'/>
                             </div>

                             
                              <div className='mt-3'>
                                 <label className='text-white flex mb-1 font-bold'>Description</label>
                                 <textarea  placeholder="Description" className='text-white  w-[630px] bg-[#272f40] border border-white/20 rounded-md p-2  placeholder:text-gray-500'></textarea>
                               </div>

                             
                         </div>


                         <div className="btn flex gap-3 justify-end mt-5">
                            <button className='w-30 bg-white/5 rounded-md  border border-white/10 p-1 text-white font-medium cursor-pointer'>Close</button>
                            <button className='w-30  bg-gradient-to-r from-blue-500 to-purple-600 rounded-md  p-1 text-white font-medium cursor-pointer'>Create Zone</button> 
                         </div>
                        

                            

                             
                      
                             

                            
                        
                         

                        

                    </form>
                </div>
        </div>
    
    </div>
  )
}

export default AddForm
