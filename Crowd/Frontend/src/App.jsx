
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./Pages/Home.jsx";
import Register from "./Pages/RegisterPersonal.jsx";
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
import Landingpage from "./Pages/landingpage.jsx";
import RegisterPayment from "./Pages/RegisterPayment.jsx";
import ProtectedRoute from "./Components/ProtectedRoute.jsx";
import NotFound from "./Pages/NotFound.jsx";



const App = () => {
  return (
    <>
    
      <Toaster position="top-right" />
     
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landingpage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/register/payment" element={<RegisterPayment />} />

        {/* Protected Routes */}
        <Route
          path="/attendee/*"
          element={
            <ProtectedRoute>
              <Attendee />
            </ProtectedRoute>
          }
        />
        <Route
          path="/overview"
          element={
            <ProtectedRoute>
              <Overview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
           
              <Admin />
            
          }
        />
        <Route
          path="/organizer/*"
          element={
            <ProtectedRoute>
              <Organizer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reserve"
          element={
            <ProtectedRoute>
              <Reserve />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parking"
          element={
            <ProtectedRoute>
              <ParkingZone />
            </ProtectedRoute>
          }
        />
        <Route
          path="/zone"
          element={
            <ProtectedRoute>
              <Parking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/counterStaff"
          element={
            <ProtectedRoute>
              <CounterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/QRScanner"
          element={
            <ProtectedRoute>
              <QRScanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Coordinator/*"
          element={
            <ProtectedRoute>
              <Coordinator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/AttendeDetails"
          element={
            <ProtectedRoute>
              <AttendeDetails />
            </ProtectedRoute>
          }
        />

        {/* Optional 404 page */}
        <Route path="*" element={<NotFound/>} />
      </Routes>
      

    </>
  );
};

export default App;
