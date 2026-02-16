import React from 'react'
import './Sidebar.css'
import { assets } from '../../assets/assets'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  const SpecialMenuIcon = assets.special_menu_icon;
  
  return (
    <div className='sidebar'>
      <div className="sidebar-options">
        <NavLink to='/add' className="sidebar-option">
          <img src={assets.add_icon} alt="" />
          <p>Add Items</p>
        </NavLink>
        <NavLink to='/list' className="sidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>List Items</p>
        </NavLink>
        <NavLink to='/orders' className="sidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>Orders</p>
        </NavLink>
        <NavLink to='/todays-menu' className="sidebar-option">
          <div className="icon-container">
            <SpecialMenuIcon width={24} height={24} />
          </div>
          <p>Today's Special</p>
        </NavLink>
        <NavLink to='/analysis' className="sidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>Analysis</p>
        </NavLink>
  {/* Profile link removed as requested */}
      </div>
    </div>
  )
}

export default Sidebar