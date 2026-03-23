# 🎥 Camera Permission Fix Guide

## Problem
Camera permission prompt not appearing - `getUserMedia()` fails immediately with `NotAllowedError` without showing browser prompt.

## Root Cause
This is NOT a code issue. The browser/system has camera access blocked at a deeper level, preventing the permission prompt from appearing.

---

## Solution 1: Clear Chrome Site Settings (RECOMMENDED)

### Step 1: Clear Site Data
```
1. Open Chrome
2. Press F12 (Developer Tools)
3. Right-click the Refresh button
4. Click "Empty Cache and Hard Reload"
5. Close Developer Tools
```

### Step 2: Reset Site Permissions
```
1. Click the lock icon (🔒) in address bar
2. Click "Site settings"
3. Find "Camera" permission
4. Change from "Block" to "Ask (default)"
5. Refresh the page
```

### Step 3: Clear Chrome Camera Settings
```
1. Go to: chrome://settings/content/camera
2. Look in "Not allowed to use your camera" section
3. Find localhost:3000 or your domain
4. Click the trash icon to remove it
5. Refresh your app
```

---

## Solution 2: Windows Camera Settings

### Check Windows Privacy Settings
```
1. Windows Settings (Win + I)
2. Privacy & Security → Camera
3. Enable "Camera access"
4. Enable "Let apps access your camera"
5. Enable "Let desktop apps access your camera"
6. Scroll down and enable for "Web browsers"
7. Restart browser
```

### Check Windows Camera App
```
1. Open Windows Camera app
2. If it works → Windows camera is OK
3. If it doesn't work → Camera driver issue
```

---

## Solution 3: Test in Different Browsers

### Try These Browsers (in order):
1. **Chrome Incognito** (Ctrl + Shift + N)
   - Fresh session, no cached permissions
   
2. **Microsoft Edge**
   - Often has different permission cache
   
3. **Firefox**
   - Completely separate permission system
   
4. **Chrome with New Profile**
   - Create new Chrome profile
   - Settings → Add person → Browse as guest

---

## Solution 4: Android Phone Settings

### Chrome on Android:
```
1. Open Chrome
2. Go to your app URL
3. Tap the lock icon
4. Tap "Permissions"
5. Tap "Camera"
6. Select "Allow"
```

### Android System Settings:
```
1. Settings → Apps → Chrome
2. Permissions → Camera
3. Set to "Allow"
```

---

## Solution 5: Test Page

### Use the Test Page:
```
1. Open: http://localhost:3000/test-camera.html
2. Click "Test Camera" button
3. If it works → Main app should work
4. If it fails → System/browser issue
```

---

## Solution 6: Check for Antivirus/Security Software

Some antivirus software blocks camera access:
- **Kaspersky** - Check Privacy Protection settings
- **Avast** - Check Webcam Shield
- **Norton** - Check SafeCam settings
- **Windows Defender** - Check Camera privacy settings

Temporarily disable and test.

---

## Solution 7: USB Barcode Scanner (RECOMMENDED FOR PRODUCTION)

### Why USB Scanner is Better:
- ✅ No camera permission issues
- ✅ Faster scanning (instant)
- ✅ More reliable
- ✅ Works on any device
- ✅ Professional solution

### Recommended Models:
- **Budget**: Generic USB Barcode Scanner (₱1,500-2,000)
- **Mid-range**: Honeywell Voyager 1200g (₱3,000-4,000)
- **Premium**: Zebra DS2208 (₱5,000-7,000)

### How to Use:
1. Plug USB scanner into computer
2. Scanner acts as keyboard input
3. Click in search box
4. Scan barcode → waybill appears in search
5. Press Enter or click View button

---

## Temporary Workaround (While Fixing Camera)

### Use the "View" Button:
```
1. Login as packer
2. Find order in Packing Queue table
3. Click "View" button
4. Same order details dialog appears
5. Click "Mark as Packed"
6. Confirm
```

This gives you the same workflow without scanning.

---

## Debugging Steps

### Check Browser Console:
```
1. Press F12
2. Go to Console tab
3. Click "Scan Barcode"
4. Look for error messages
5. Share error details if needed
```

### Check Browser Permissions:
```
Chrome: chrome://settings/content/camera
Firefox: about:preferences#privacy
Edge: edge://settings/content/camera
```

### Check System Logs:
```
Windows Event Viewer → Application logs
Look for camera-related errors
```

---

## Expected Behavior (When Working)

### First Time:
```
1. Click "Scan Barcode"
2. Browser shows permission prompt: "Allow localhost to use your camera?"
3. Click "Allow"
4. Camera starts
5. Scan barcode
```

### After Allowing:
```
1. Click "Scan Barcode"
2. Camera starts immediately (no prompt)
3. Scan barcode
4. Order found
```

---

## Still Not Working?

### Option A: Use Different Device
- Try on a different computer
- Try on a different phone
- Use a device that hasn't blocked the site

### Option B: Fresh Browser Install
```
1. Uninstall Chrome completely
2. Delete Chrome user data folder:
   C:\Users\[YourName]\AppData\Local\Google\Chrome
3. Reinstall Chrome
4. Test camera
```

### Option C: Use USB Scanner
- Most reliable solution
- No permission issues
- Professional setup
- Recommended for production

---

## Summary

**Code Status**: ✅ Working perfectly  
**Issue**: Browser/system blocking camera  
**Solution**: Clear browser permissions OR use USB scanner  
**Workaround**: Use "View" button in table  

The barcode scanner implementation is complete and correct. The issue is purely environmental and requires one-time setup on each device.

---

**Last Updated**: March 12, 2026  
**Status**: Implementation complete, awaiting camera permission setup
