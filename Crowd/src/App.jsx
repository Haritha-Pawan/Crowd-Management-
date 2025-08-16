import React from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'

import Home from './Pages/Home.jsx'
import Register from './Pages/Register.jsx'
import Attendee from './Components/AttendeeDashbord.jsx'
import Admin from './Components/Admin/Admin.jsx'
import Overview from './Components/Attendee/Overview.jsx'
import Login from './Components/Login/Login.jsx'
import Parking from './Pages/Parking.jsx'
import Profile from './Components/Attendee/Profile.jsx'
import Organizer from './Components/Organizer/Organizer.jsx'



const App = () => {
  return (

     <>

     
             <Routes path='/'>

              <Route path='/' element={<Home/>}/>
              <Route path='/register' element={<Register />}/>
              <Route path='/parking' element={<Parking />}/>
              
              <Route path='/attendee/*' element={<Attendee/>}/>
               <Route path='/overview' element={<Overview/>}/>
              <Route path='/profile' element={<Profile/>}/>
              <Route path='/Login' element={<Login/>}/>

              <Route path='/admin/*' element={<Admin/>}/>


              <Route path='/Organizer' element={<Organizer/>} />
              
             
               
         
             
             
             

             </Routes>

           

     </>
      
      
   
  )
}

export default App
