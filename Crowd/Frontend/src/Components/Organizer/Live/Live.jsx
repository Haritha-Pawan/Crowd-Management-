import { Video } from 'lucide-react'
import React from 'react'

const live = () => {
  return (
    <div className='p-12 h-screen'>

        <div className="header text-white text-3xl font-bold">Live Preview Dashboard</div>
        <div className="sub-heading text-xl text-gray-300">Monitor live video streams from your events</div>

           <div className='grid grid-cols-3 gap-10 mt-10'>

                    <div className='bg-white/5 border border-white/10 w-90 p-5'>
                        <div className='flex gap-3'>
                            <Video color='#F74F47'/>
                         <div className='text-white'>Youtube Live</div>
                        </div>

                        <div className='text-gray-300'>Stream to YouTube platform</div>

                        <div>
                        <iframe
                        width="100%"
                        height="100%"
                        title="Youtube Live Stream"
                  
            
                        ></iframe>
                                

                        </div>
                        
                    </div>

                    

                  
           </div>


    </div>
  )
}

export default live
