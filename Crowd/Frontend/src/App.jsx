import React from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'

import Home from './Pages/Home.jsx'
import Register from './Pages/Register.jsx'
import Attendee from './Components/AttendeeDashbord.jsx'
import Admin from './Components/Admin/Admin.jsx'
import Overview from './Components/Attendee/Overview.jsx'
import Parking from './Components/Organizer/Parking/Parking.jsx'

import Profile from './Components/Attendee/Profile.jsx'
import Organizer from './Components/Organizer/Organizer.jsx'
import Reserve from './Components/Organizer/Parking/ReserveForm.jsx'
import Login from './Pages/Login.jsx'
import ParkingZone from './Components/Organizer/Parking/parkingZone.jsx'


const App = () => {
  return (

     <>


            
   

             <Routes>

              <Route path='/' element={<Home/>}/>
              <Route path='/register' element={<Register />}/>
               <Route path='/Login' element={<Login />}/>

              <Route path='/parking' element={<ParkingZone />}/>
              <Route path='/zone' element={<Parking />}/>
              
              <Route path='/attendee/*' element={<Attendee/>}/>
               <Route path='/overview' element={<Overview/>}/>
              <Route path='/profile' element={<Profile/>}/>
             

              <Route path='/admin/*' element={<Admin/>}/>



              <Route path='/Organizer/*' element={<Organizer/>} />
              <Route path="/reserve" element={<Reserve/>}/>
              
             
               
         
             
             
             

             </Routes>

           

     </>
      
      
   
  )
}

export default App
