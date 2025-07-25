import React from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'

import Home from './Pages/Home.jsx'
import Register from './Pages/Register.jsx'
import Attendee from './Components/AttendeeDashbord.jsx'
import Admin from './Components/Admin.jsx'
import Overview from './Components/Attendee/Overview.jsx'

import Parking from './Pages/Parking.jsx'
import Profile from './Components/Attendee/Profile.jsx'


const App = () => {
  return (

     <>


            


             <Routes>

              <Route path='/' element={<Home/>}/>
              <Route path='/register' element={<Register />}/>
              <Route path='/parking' element={<Parking />}/>
              
              <Route path='/attendee' element={<Attendee/>}/>
               <Route path='/overview' element={<Overview/>}/>
              <Route path='/profile' element={<Profile/>}/>
               
              <Route path='/admin' element={<Admin/>}/>
             
             
             

             </Routes>

     </>
      
      
   
  )
}

export default App
