
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./Pages/Home.jsx";
import Register from "./Pages/Register.jsx";
import Attendee from "./Components/AttendeeDashbord.jsx";
import Admin from "./Components/Admin/Admin.jsx";
import Overview from "./Components/Attendee/Overview.jsx";
import Parking from "./Components/Organizer/Parking/Parking.jsx";
import Profile from "./Components/Attendee/Profile.jsx";
import Organizer from "./Components/Organizer/Organizer.jsx";
import Reserve from "./Components/Organizer/Parking/ReserveForm.jsx";
import Login from "./Pages/Login.jsx";
import ParkingZone from "./Components/Organizer/Parking/ParkingZone.jsx";
import AttendeDetails from "./Components/Admin/AttendeDetails.jsx";
import Coordinator from "./Components/Coordinator/Coordinator.jsx";
import { Toaster } from "react-hot-toast";
import Payment from "./Components/Organizer/Parking/payment.jsx";
import CounterDashboard from "./Components/Counter/CounterDashboard.jsx";
import ForgotPassword from "./Pages/ForgotPassword.jsx";
import ResetPassword from "./Pages/ResetPassword.jsx";
import QRScanner from "./Components/Counter/QRScanner.jsx";


const App = () => {
  return (
    <>
      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route path="/Organizer/*" element={<Organizer />} />
        <Route path="/reserve" element={<Reserve />} />

        <Route path="/Coordinator/*" element={<Coordinator />} />

        <Route path="/parking" element={<ParkingZone />} />

        <Route path="/zone" element={<Parking />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/counterStaff" element={<CounterDashboard />} />

        <Route path="/attendee/*" element={<Attendee />} />
        <Route path="/CounterDashboard/*" element={<CounterDashboard />} />


          <Route path='/attendee/*' element={<Attendee />} />
          
          <Route path='/overview' element={<Overview />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/admin/*' element={<Admin />} />
          <Route path='/organizer/*' element={<Organizer />} />
          <Route path='/reserve' element={<Reserve />} />

          <Route path="/QRScanner" element={<QRScanner/>}/>
        
      

        <Route path="/overview" element={<Overview />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/organizer/*" element={<Organizer />} />
        <Route path="/reserve" element={<Reserve />} />
        <Route path="/" element={<AttendeDetails />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        </Routes>
      

    </>
  );
};

export default App;
