# 🍽️ Special Menu Feature

## Overview
The Special Menu feature allows users to view today's special menu items. The special menu items are managed exclusively through the admin panel.

## Features

### 🎯 Special Menu Icon
- Located in the top-right corner of the header
- Displays a 🍽️ icon with "Today's Special" label
- Click to open the special menu popup
- Responsive design for all screen sizes

### 📱 Special Menu Popup
- **Header**: Shows "Today's Special Menu" with current date
- **Content**: Grid layout of special menu items
- **Items**: Each item shows:
  - Food image with special badge (⭐ Special)
  - Name, description, price, and category
  - Add to cart functionality
- **Responsive**: Adapts to different screen sizes
- **Close**: Click outside or use the × button

### ⚠️ Important Note
**"Add to Special Menu" functionality has been removed from frontend food items** and is now exclusively available in the admin panel for security and management purposes.

## How to Use

### For Users
1. **View Special Menu**: Click the 🍽️ icon in the header
2. **Order Items**: Use the add to cart buttons in the popup
3. **Browse Special Items**: View today's featured menu items

### For Admins
1. **Manage Special Menu**: Use the admin panel's List page
2. **Toggle Items**: Use the "Add to Menu" / "✓ In Menu" buttons
3. **View Status**: See which items are in today's special menu

## Technical Implementation

### Frontend Components
- `Header.jsx`: Contains the special menu icon
- `SpecialMenuPopup.jsx`: The popup component for viewing special menu
- `FoodItem.jsx`: Individual food items (special menu functionality removed)
- `SpecialMenuPopup.css`: Styling for the popup
- Updated `Header.css`: Styling for the special menu icon

### Backend API Endpoints
- `GET /api/food/todays-menu`: Fetch today's special menu
- `POST /api/food/toggle-todays-menu`: Add/remove items from special menu (admin only)

### Database Schema
- `foodModel.js`: Includes `todaysMenu` boolean field
- Default value: `false`
- Can be toggled on/off through admin panel only

## Styling Features

### Special Menu Icon
- Gradient background (red to orange)
- Hover effects with scale and shadow
- Responsive sizing for different screen sizes
- High z-index to stay above other elements

### Special Menu Popup
- Backdrop blur effect
- Smooth slide-in animation
- Gradient header with close button
- Card-based grid layout
- Hover effects on items
- Special badges on food images

## Responsive Design

### Desktop (>1050px)
- Full-size popup (800px width)
- Two-column grid layout
- Large icons and text

### Tablet (750px - 1050px)
- Reduced padding and font sizes
- Adjusted icon positioning
- Maintained functionality

### Mobile (<750px)
- Single-column layout
- Compact popup design
- Touch-friendly button sizes

## Security & Management

### Frontend Restrictions
- Users cannot add/remove items from special menu
- Special menu is read-only for customers
- Prevents unauthorized menu modifications

### Admin Control
- Full control over special menu items
- Toggle items in/out of special menu
- Manage menu through dedicated admin interface

## Browser Compatibility
- Modern browsers with CSS Grid support
- Fallback layouts for older browsers
- Touch-friendly interactions for mobile devices

## Future Enhancements
- Toast notifications for better user feedback
- Drag and drop reordering in admin panel
- Scheduled special menus
- Special menu categories
- User favorites integration
- Social sharing features
