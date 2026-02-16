
import React, { useState } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "./components/Navbar/Navbar";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import Footer from "./components/Footer/Footer";
import LoginPopup from "./components/LoginPopup/LoginPopup";
import PlaceOrder from "./pages/PlaceOrders/PlaceOrder";
import ResetPassword from "./components/ResetPassword/ResetPassword";
import OrderTracker from "./pages/OrderTracker/OrderTracker";
import UserProfile from "./pages/UserProfile/UserProfile";
import OrderHistory from "./pages/OrderHistory/OrderHistory";
import StudentLogin from "./pages/StudentAuth/StudentLogin";
import StudentRegister from "./pages/StudentAuth/StudentRegister";
import axios from "axios";
import SearchPage from "./pages/Searchpage";
import Feedback from "./components/Feedback/Feedback";

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showTodaysMenu, setShowTodaysMenu] = useState(false);
  
  return (
    <>
      <ToastContainer />
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : <></>}

  <div className="app" style={{ marginTop: 60 }}>
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path="/" element={<Home setShowTodaysMenu={setShowTodaysMenu} />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/register" element={<StudentRegister />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/search" element={<SearchPage/>} />
          <Route path="/track/:orderId" element={<OrderTracker />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/feedback" element={<Feedback />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
};

export default App;
