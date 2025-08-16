import React from 'react'
import { Link } from 'react-router-dom' 
import assets from '../../assets/assets'

function Login() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex justify-center items-start py-20'>

      <div>
        <Link to='/'>
        <button className='text-white relative bottom-15 left-37 p-2 hover:bg-white/10 rounded-md cursor-pointer'>  - Back To Home</button>
        </Link>
      </div>

      <div className="Register-wrapper bg-white/10 border border-white/10 w-full sm:w-[90%] md:w-[500px] lg:w-[600px] xl:w-[650px] p-8 rounded-xl shadow-xl">
        
       
        <div className="icon w-16 mx-auto mb-6">
          <img src={assets.card2} alt="Event" />
        </div>

        
        <div className="Register-headline text-white text-center mb-8">
          <h1 className="text-2xl font-bold">Event Login</h1>
          <h3 className="text-slate-300">Register for the event and get your QR code for seamless entry</h3>
        </div>

        
        <form className='space-y-5'>
         
          <div>

            <label className='text-slate-300 block mb-1 '>Email Address*</label>
            <input type="text" placeholder='Enter your Email' className='w-full bg-white/5 border border-white/10 p-[6px] rounded-md placeholder:text-slate-400 text-white'/>

          </div>

         


          <div>

            <label className='text-slate-300 block mb-1 '>Password *</label>
            <input type="text" placeholder='Enter your Password' className='w-full bg-white/5 border border-white/10 p-[6px] rounded-md placeholder:text-slate-400 text-white'/>

          </div>


          <div>
            <button className='bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold w-full p-3 rounded-md'>Register & Generate QR Code</button>
          </div>

        
          



        </form>

      </div>
    </div>
  )
}

export default Login
