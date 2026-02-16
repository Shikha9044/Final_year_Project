import React, { useState, useEffect } from 'react';
import Login from './pages/Login/Login';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import { Route, Routes } from 'react-router-dom';
import List from './pages/List/List';
import Add from './pages/Add/Add';
import Orders from './pages/Orders/Orders';
import OrderDetail from './pages/Orders/OrderDetail';
import Analysis from "./pages/Analysis/Analysis";
import AdminProfile from "./pages/AdminProfile/AdminProfile";
import TodaysMenu from './pages/TodaysMenu/TodaysMenu';
import Dashboard from './pages/Dashboard/Dashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './app-content.css';
import OrderDetails from './pages/Orders/OrderDetails';
import FeedbackAdmin from './pages/FeedbackAdmin';
import UserFeedbacks from './pages/UserFeedbacks';

const App = () => {
  const url = "http://localhost:4000";
  const [loggedIn, setLoggedIn] = useState(() => {
    // Stay logged in if profile exists in localStorage
    return !!localStorage.getItem('adminProfile');
  });
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('adminProfile');
    return saved ? JSON.parse(saved) : { name: 'Rishabh', email: 'kashyaprishabh8957@gmail.com', profilePic: 'C:\Users\hp\Desktop\alleneatry\alleneatry\college_eatery\Frontend\src\assets\profile_icon.png' };
  });

  useEffect(() => {
    // On mount, load user from localStorage if available
    const saved = localStorage.getItem('adminProfile');
    if (saved) setUser(JSON.parse(saved));
    if (saved) setLoggedIn(true);
  }, []);

  const handleLogin = () => {
    setLoggedIn(true);
    // After login, load user profile from localStorage
    const saved = localStorage.getItem('adminProfile');
    if (saved) setUser(JSON.parse(saved));
  };

  if (!loggedIn) {
    return <Login onLogin={handleLogin} />;
  }
  return (
    <div>
      <ToastContainer/>
      <Navbar user={user} />
      <div className="app-content modern-bg">
        <Sidebar />
        <div className="main-content-card">
          <Routes>
            <Route path="/" element={<Dashboard url={url} />} />
            <Route path="/add" element={<Add url={url}/>} />
            <Route path="/list" element={<List url={url} />} />
            <Route path="/orders" element={<Orders url={url}/>} />
            <Route path="/orders/:orderId" element={<OrderDetail url={url}/>} />
            <Route path="/todays-menu" element={<TodaysMenu url={url}/>} />
            <Route path="/feedback" element={<FeedbackAdmin />} />
            <Route path="/user-feedbacks" element={<UserFeedbacks />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/profile" element={<AdminProfile user={user} setUser={setUser} />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}


export default App