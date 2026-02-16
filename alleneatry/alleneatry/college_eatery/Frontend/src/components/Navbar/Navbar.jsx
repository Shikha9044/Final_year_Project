import React, { useState, useContext } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { FaHome, FaUtensils, FaPhoneAlt, FaMobileAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { StoreContext } from "../Context/StoreContext";


import { useNavigate } from "react-router-dom";

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const { token, user, setToken, setUser, cartItems } = useContext(StoreContext);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [trackId, setTrackId] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
  };

  const handleTrackOrder = (e) => {
    e.preventDefault();
    if (trackId.trim()) {
      setShowTrackModal(false);
      navigate(`/track/${trackId.trim()}`);
      setTrackId("");
    }
  };

  return (
    <div className="navbar">
      <Link to="/">
        <div className="logo">
          <h2>
            <span>A</span>llen
            <span> E</span>atery
          </h2>
        </div>
      </Link>
      <ul className="navbar-menu">
        <Link
          to="/"
          onClick={() => setMenu("home")}
          className={menu === "home" ? "active" : ""}
        >
          <span className="nav-icon"><FaHome /></span>
          Home
        </Link>
        <a
          href="#explore-menu"
          onClick={() => setMenu("menu")}
          className={menu === "menu" ? "active" : ""}
        >
          <span className="nav-icon"><FaUtensils /></span>
          Menu
        </a>
        <a
          href="#app-download"
          onClick={() => setMenu("mobile-app")}
          className={menu === "mobile-app" ? "active" : ""}
        >
          <span className="nav-icon"><FaMobileAlt /></span>
          Mobile App
        </a>
        <a
          href="#footer"
          onClick={() => setMenu("contact-us")}
          className={menu === "contact-us" ? "active" : ""}
        >
          <span className="nav-icon"><FaPhoneAlt /></span>
          Contact Us
        </a>
      </ul>
  <div className="navbar-right">
        <Link to="/search" className="search-link">
          <img src={assets.search_icon} alt="Search" />
        </Link>
        <div className="navbar-search-icon" style={{position: 'relative'}}>
          <Link to="/cart">
            <img src={assets.basket_icon} alt="" />
            {/* Show cart value on basket */}
            {cartItems && Object.values(cartItems).reduce((a, b) => a + b, 0) > 0 && (
              <span className="cart-value-badge">
                {Object.values(cartItems).reduce((a, b) => a + b, 0)}
              </span>
            )}
          </Link>
        </div>
        
        {token && user ? (
          <div className="user-profile">
            <div className="user-info">
              <span className="user-name">Hi, {user.name}!</span>
              <span className="user-email">{user.email}</span>
            </div>
            <div className="user-actions">
              <Link to="/profile" className="profile-link">
                Profile
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowLogin(true)} className="signin-btn">
            Sign In
          </button>
        )}
      </div>

    </div>
  );
};

export default Navbar;
