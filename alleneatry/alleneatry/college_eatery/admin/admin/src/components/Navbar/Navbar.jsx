import React from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="logo">
        <h2>
          <span>A</span>llenhouse
          <span> E</span>atery
        </h2>
      </div>
      <img className="profile" src={assets.profile_image} alt="User Profile" />
    </div>
  );
};

export default Navbar;