# 🖼️ Image Loading Troubleshooting Guide

## Issue: Images Not Showing in Today's Special Menu

### ✅ **What I Fixed:**

1. **Corrected Image Path**: Changed from `/uploads/` to `/images/` in the TodaysMenu component
2. **Added Debug Logging**: Console logs to track image loading
3. **Added Fallback Display**: Shows placeholder when images fail to load
4. **Enhanced Error Handling**: Better error messages and debugging info

### 🔍 **How to Debug:**

#### Step 1: Check Browser Console
1. Open the admin panel in your browser
2. Navigate to "Today's Special" menu
3. Open Developer Tools (F12)
4. Check the Console tab for error messages

#### Step 2: Verify Image URLs
Look for console logs like:
```
Rendering item [ItemName] with image: http://localhost:4000/images/[filename]
```

#### Step 3: Test Image URLs Directly
1. Copy an image URL from the console
2. Paste it in a new browser tab
3. Check if the image loads

### 🚨 **Common Issues & Solutions:**

#### Issue 1: "Failed to fetch today's menu"
**Cause**: Backend server not running
**Solution**: Start the backend server
```bash
cd "Backend folder"
npm run server
```

#### Issue 2: "Failed to load image for [ItemName]"
**Cause**: Image file doesn't exist or wrong path
**Solution**: Check if image files exist in the `uploads` folder

#### Issue 3: Images show as broken links
**Cause**: Incorrect image path in backend
**Solution**: Verify backend static file serving:
```javascript
// In server.js - should be:
app.use("/images", express.static('uploads'));
```

### 🛠️ **Backend Verification:**

#### Check Backend Routes:
```bash
# Test the API endpoint
curl http://localhost:4000/api/food/todays-menu

# Test image serving
curl http://localhost:4000/images/[filename]
```

#### Check Database:
1. Ensure food items have `todaysMenu: true`
2. Verify image filenames are correct
3. Check if images exist in `uploads` folder

### 📁 **File Structure Check:**

```
Backend folder/
├── uploads/           # Image files stored here
│   ├── food_1.png
│   ├── food_2.png
│   └── ...
├── server.js          # Serves /images -> uploads/
└── controllers/
    └── foodController.js
```

### 🔧 **Quick Fixes:**

#### Fix 1: Restart Backend
```bash
# Stop backend (Ctrl+C)
# Start again
npm run server
```

#### Fix 2: Check Image Files
```bash
# List uploads folder
ls uploads/
```

#### Fix 3: Test API Endpoint
```bash
# Test in browser
http://localhost:4000/api/food/todays-menu
```

### 📱 **Frontend Debugging:**

#### Check Network Tab:
1. Open Developer Tools
2. Go to Network tab
3. Refresh the page
4. Look for failed image requests

#### Check Console Logs:
- Image URLs being generated
- API responses
- Error messages

### 🎯 **Expected Behavior:**

1. **Loading State**: Shows "Loading today's menu..."
2. **Success State**: Displays food items with images
3. **Error State**: Shows error message with details
4. **Fallback State**: Shows placeholder for broken images

### 📞 **Still Having Issues?**

If images still don't show:

1. **Check Backend Logs**: Look for errors in the terminal running the backend
2. **Verify Database**: Ensure food items exist and have correct data
3. **Test API**: Use Postman or curl to test endpoints
4. **Check File Permissions**: Ensure uploads folder is readable

### 🔍 **Debug Commands:**

```bash
# Check if backend is running
netstat -an | grep 4000

# Check uploads folder
ls -la "Backend folder/uploads/"

# Test API endpoint
curl -v http://localhost:4000/api/food/todays-menu
```
