import React, { useState, useEffect } from 'react';
import './Header.css';
import SpecialMenuPopup from '../SpecialMenuPopup/SpecialMenuPopup';

const Header = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSpecialMenu, setShowSpecialMenu] = useState(false);
  
  // Array of slider images
  const sliderImages = [
    '/3X5A4477-scaled.webp',
    '/3X5A4487-scaled.webp'
  ];

  // Auto-advance slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => 
        prevSlide === sliderImages.length - 1 ? 0 : prevSlide + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [sliderImages.length]);

  // Manual navigation
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => 
      prevSlide === sliderImages.length - 1 ? 0 : prevSlide + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) => 
      prevSlide === 0 ? sliderImages.length - 1 : prevSlide - 1
    );
  };

  const openSpecialMenu = () => {
    setShowSpecialMenu(true);
  };

  const closeSpecialMenu = () => {
    setShowSpecialMenu(false);
  };

  return (
    <div className="header">
      {/* Special Menu Icon */}
      <div className="special-menu-icon" onClick={openSpecialMenu}>
        <span className="special-menu-text">🍽️</span>
        <span className="special-menu-label">Today's Special</span>
      </div>

      <div className="slider-container">
        {sliderImages.map((image, index) => (
          <div
            key={index}
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            style={{
              backgroundImage: `url(${image})`,
              transform: `translateX(${(index - currentSlide) * 100}%)`
            }}
          />
        ))}
        
        {/* Navigation arrows */}
        <button className="slider-nav prev" onClick={prevSlide}>
          &#10094;
        </button>
        <button className="slider-nav next" onClick={nextSlide}>
          &#10095;
        </button>

        {/* Dots indicator */}
        <div className="slider-dots">
          {sliderImages.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>

      <div className="header-contents">
        <h2>Order Your favourite food here</h2>
        <p>Choose from a diverse menu featuring a delectable array of dishes crafted with the finest ingredients and culinary expertise</p>
        
      </div>

      {/* Special Menu Popup */}
      {showSpecialMenu && (
        <SpecialMenuPopup onClose={closeSpecialMenu} />
      )}
    </div>
  );
};

export default Header;