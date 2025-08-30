import React from 'react'

const AddTask = ({isOpen,onClose}) => {



    if(!isOpen) return null;

  return (
    <div className='fixed z-50 inset-0 flex justify-center items-center'>
        <div className="w-[90%] max-w-2xl bg-[#0f172a] p-5 rounded-md border border-white/10">
        <h2 className='text-white font-bold text-xl '>Add New Task</h2>
        <h6 className='text-gray-300 font-bold text-xs '>Assign a new task for the event</h6>
        

                <div className="form-section ">
                    <form>

                        <div className='flex gap-5 mt-4'>
                                <label className='text-white flex mb-1 font-bold'>Task Title *</label>
                                <input type='text' placeholder="Task title" className='text-white bg-[#272f40] border border-white/20 rounded-md p-2 w-[300px]  placeholder:text-gray-500 '/>
                        </div>
                
                        
                        <div className='flex gap-5 mt-4'>
                            <label className='text-white flex mb-1 font-bold'>Description</label>
                                 <input type='text' placeholder="Description" className='text-white bg-[#272f40] border border-white/20 rounded-md p-2 w-[300px]  placeholder:text-gray-500 '/>
                        </div>

                        <div className='flex gap-5 mt-4'>
                            <label className='text-white flex mb-1 font-bold'>coordinator</label>
                                 <input type='text' placeholder="coordinator" className='text-white bg-[#272f40] border border-white/20 rounded-md p-2 w-[300px]  placeholder:text-gray-500 '/>
                        </div>

                        <div className='mt-4'>
                            <label className='text-white flex mb-1 font-bold'>Other Staffs</label>
                            <textarea
                                placeholder="Enter names of other staff involved"
                                className='text-white bg-[#272f40] border border-white/20 rounded-md p-2 w-[300px] placeholder:text-gray-500'
                                rows={3}
                            ></textarea>
                        </div>

                        {/* Priority + Status + Due Date (aligned) */}
                        <div className='flex gap-5 mt-4'>
                        <div>
                            <label className='text-white flex mb-1 font-bold'>Priority</label>
                            <select className='text-white bg-[#272f40] border border-white/20 rounded-md p-2 w-[300px]'>
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                            </select>
                        </div>

                        <div>
                            <label className='text-white flex mb-1 font-bold'>Status</label>
                            <select className='text-white bg-[#272f40] border border-white/20 rounded-md p-2 w-[300px]'>
                            <option>Todo</option>
                            <option>In Progress</option>
                            <option>Done</option>
                            <option>Blocked</option>
                            </select>
                        </div>
                        </div>

                        <div className='mt-4'>
                            <label className='text-white flex mb-1 font-bold'>Due Date</label>
                            <input
                            type="date"
                            className='text-white bg-[#272f40] border border-white/20 rounded-md p-2 w-[300px] placeholder:text-gray-500'
                            />
                        </div>
                        


                        <div className="btn flex gap-3 justify-end mt-5">
                            <button className='w-30 bg-white/5 rounded-md  border border-white/10 p-1 text-white font-medium cursor-pointer'>Close</button>
                            <button className='w-30  bg-gradient-to-r from-blue-500 to-purple-600 rounded-md  p-1 text-white font-medium cursor-pointer'>Create Task</button> 
                         </div>
                    </form>

                </div>
        </div>
    
    </div>
  )
}

export default AddTask
