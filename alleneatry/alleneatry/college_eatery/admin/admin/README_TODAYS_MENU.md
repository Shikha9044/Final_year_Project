# Today's Menu Feature

## Overview
The Today's Menu feature has been enhanced to allow administrators to selectively add food items to today's menu, rather than showing all items. This provides better control over what appears on the daily menu.

## What's New

### 1. Sidebar Navigation
- Added "Today's Menu" option in the admin sidebar
- Uses a 🍽️ emoji icon for visual identification
- Positioned between "Orders" and "AnalysisPage" options

### 2. Today's Menu Page
- **Location**: `/todays-menu` route
- **Component**: `src/pages/TodaysMenu/TodaysMenu.jsx`
- **Styling**: `src/pages/TodaysMenu/TodaysMenu.css`

### 3. Enhanced Features
- **Selective Menu Items**: Only shows items marked as "Today's Menu"
- **Smart Empty State**: Provides helpful guidance when no items are in the menu
- **Action Buttons**: Direct links to add new items or manage existing ones
- **Real-time Updates**: Shows current menu status for each item

### 4. Backend API
- **Endpoint**: `GET /api/food/todays-menu` - Returns only today's menu items
- **New Endpoint**: `POST /api/food/toggle-todays-menu` - Toggle items in/out of menu
- **Enhanced Model**: Added `todaysMenu` field to food items

## How to Add Items to Today's Menu

### Method 1: When Adding New Food Items
1. Navigate to **"Add Items"** in the sidebar
2. Fill in the food item details (name, description, price, category, image)
3. **Check the "Add to Today's Menu" checkbox** before submitting
4. Click "ADD" button
5. The item will automatically appear in Today's Menu

### Method 2: Managing Existing Food Items
1. Navigate to **"List Items"** in the sidebar
2. Find the food item you want to add to today's menu
3. Click the **"Add to Menu"** button in the "Today's Menu" column
4. The button will change to **"✓ In Menu"** (green)
5. The item will now appear in Today's Menu

### Method 3: From Today's Menu Page
1. Navigate to **"Today's Menu"** in the sidebar
2. If no items are in the menu, you'll see helpful action buttons
3. Click **"Add New Food Item"** to create and add items directly
4. Click **"Manage Existing Items"** to toggle items in/out of the menu

## Visual Indicators

### In List Items Page:
- **"Add to Menu"** (gray button) = Item is NOT in today's menu
- **"✓ In Menu"** (green button) = Item IS in today's menu

### In Today's Menu Page:
- Only shows items marked as today's menu
- Each item displays "✓ In Today's Menu" status
- Empty state provides clear guidance and action buttons

## Technical Implementation

### Database Schema Update
```javascript
// Added to foodModel.js
todaysMenu: { type: Boolean, default: false }
```

### New API Endpoints
```javascript
// Toggle item in/out of today's menu
POST /api/food/toggle-todays-menu
Body: { id: "food_item_id" }

// Get today's menu items only
GET /api/food/todays-menu
```

### Frontend Components
- **Add.jsx**: Checkbox to add new items to today's menu
- **List.jsx**: Toggle buttons to manage existing items
- **TodaysMenu.jsx**: Display only today's menu items with smart empty state

## Best Practices

### For Daily Operations:
1. **Morning Setup**: Review and update today's menu based on available ingredients
2. **Real-time Updates**: Toggle items in/out as availability changes
3. **Menu Planning**: Use the checkbox when adding new items for planned menus

### For Menu Management:
1. **Regular Review**: Check Today's Menu page to see current offerings
2. **Quick Toggles**: Use List Items page for bulk menu management
3. **Status Tracking**: Green "✓ In Menu" buttons show current menu status

## Troubleshooting

### Common Issues:
- **Item not showing in Today's Menu**: Check if "Add to Today's Menu" checkbox was checked
- **Can't toggle menu status**: Ensure backend server is running
- **Empty menu page**: Use the action buttons to add items or check existing items

### Data Consistency:
- The `todaysMenu` field is automatically managed by the toggle function
- Changes are immediately reflected in the Today's Menu page
- All operations use the same data source for consistency

## Future Enhancements
- **Bulk Operations**: Select multiple items to add/remove from menu
- **Scheduled Menus**: Plan menus for future dates
- **Menu Templates**: Save and reuse popular menu combinations
- **Time-based Availability**: Set specific times for menu items
- **Menu Analytics**: Track which items are most popular in daily menus

## Files Modified
- `src/components/Sidebar/Sidebar.jsx` - Added menu option
- `src/components/Sidebar/Sidebar.css` - Added menu icon styling
- `src/App.jsx` - Added route and import
- `src/assets/assets.js` - Added menu icon
- `src/pages/TodaysMenu/TodaysMenu.jsx` - Enhanced component with smart empty state
- `src/pages/TodaysMenu/TodaysMenu.css` - Enhanced styling with action buttons
- `src/pages/List/List.jsx` - Added today's menu toggle functionality
- `src/pages/List/List.css` - Added toggle button styling
- `src/pages/Add/Add.jsx` - Added checkbox for today's menu
- `src/pages/Add/Add.css` - Added checkbox styling
- `Backend/models/foodModel.js` - Added todaysMenu field
- `Backend/controllers/foodController.js` - Added toggle function and updated getTodaysMenu
- `Backend/routes/foodRoute.js` - Added toggle endpoint
