import React from 'react';

const SpecialMenuIcon = ({ width = 24, height = 24, color = "#ff6b6b" }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Plate/Circle */}
      <circle cx="12" cy="12" r="8" fill={color} opacity="0.2"/>
      <circle cx="12" cy="12" r="6" fill={color} opacity="0.4"/>
      
      {/* Fork */}
      <path 
        d="M8 4L8 8M8 8L6 8M8 8L8 10M8 10L6 10M8 10L8 12" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />
      
      {/* Knife */}
      <path 
        d="M16 4L16 8M16 8L18 8M16 8L16 10M16 10L18 10M16 10L16 12" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />
      
      {/* Food items on plate */}
      <circle cx="10" cy="11" r="1" fill={color}/>
      <circle cx="14" cy="11" r="1" fill={color}/>
      <circle cx="12" cy="13" r="1" fill={color}/>
      
      {/* Special star */}
      <path 
        d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" 
        fill="#ffa500"
      />
    </svg>
  );
};

export default SpecialMenuIcon;
