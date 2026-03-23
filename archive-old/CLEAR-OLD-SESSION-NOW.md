# 🔧 Clear Old Session - GAWIN MO TO NGAYON

## Problem
Nakikita mo yung old staff login page, tapos pag hard refresh auto-redirect sa Shopee dashboard kahit hindi ka nag-login.

## Root Cause
May naka-save na old Shopee team leader session sa localStorage ng browser mo.

---

## ✅ SOLUTION 1: Clear localStorage (FASTEST)

### Step 1: Open DevTools
```
Press F12 or Right-click → Inspect
```

### Step 2: Go to Console Tab
```
Click "Console" tab sa DevTools
```

### Step 3: Clear localStorage
```javascript
localStorage.clear()
```
Type yan sa console tapos press Enter

### Step 4: Hard Refresh
```
Press Ctrl + Shift + R
```

### Step 5: Verify
```
Dapat nakikita mo na yung clean login page
Hindi na dapat mag-auto redirect
```

---

## ✅ SOLUTION 2: Clear Browser Cache (THOROUGH)

### Step 1: Clear Cache
```
Press Ctrl + Shift + Delete
```

### Step 2: Select Options
```
✅ Cookies and other site data
✅ Cached images and files
Time range: All time
```

### Step 3: Clear Data
```
Click "Clear data" button
```

### Step 4: Close Browser
```
Close ALL browser windows
```

### Step 5: Reopen Browser
```
Open browser again
Go to your app URL
```

---

## ✅ SOLUTION 3: Manual Session Clear (IF SOLUTIONS 1 & 2 DON'T WORK)

### Open DevTools Console and run:
```javascript
// Clear all session data
localStorage.removeItem('teamLeaderSession')
localStorage.removeItem('x-team-leader-user-id')
localStorage.removeItem('x-team-leader-channel')
localStorage.removeItem('x-team-leader-role')
localStorage.removeItem('isLoggedIn')
localStorage.removeItem('username')
localStorage.removeItem('userRole')
localStorage.removeItem('displayName')
localStorage.removeItem('currentUser')

// Verify it's cleared
console.log('Team Leader Session:', localStorage.getItem('teamLeaderSession'))
console.log('Admin Session:', localStorage.getItem('isLoggedIn'))
```

---

## What I Fixed in the Code

### 1. Enhanced Session Validation
```typescript
// Now checks ALL required fields before redirecting
if (session.userId && session.assignedChannel && session.username && session.timestamp) {
  // Check 24-hour expiry
  if (now - session.timestamp > twentyFourHours) {
    // Clear expired session
  } else {
    // Valid session, redirect
  }
}
```

### 2. Aggressive Orphaned Session Cleanup
```typescript
// Clear any orphaned session data
if (!hasValidSession) {
  // Clear team leader fragments
  localStorage.removeItem('teamLeaderSession')
  localStorage.removeItem('x-team-leader-user-id')
  localStorage.removeItem('x-team-leader-channel')
  localStorage.removeItem('x-team-leader-role')
  
  // Clear admin fragments
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('username')
  localStorage.removeItem('userRole')
  localStorage.removeItem('displayName')
  localStorage.removeItem('currentUser')
}
```

### 3. Session Expiry (24 hours)
```typescript
const now = Date.now()
const twentyFourHours = 24 * 60 * 60 * 1000

if (now - session.timestamp > twentyFourHours) {
  console.log('Session expired, clearing...')
  // Clear session
}
```

---

## After Clearing Session

### Test Login Flow:
1. ✅ Login page should show clean (no auto-redirect)
2. ✅ Login as admin → redirect to /dashboard
3. ✅ Hard refresh → stay on dashboard (no 404)
4. ✅ Logout → return to login page
5. ✅ Close browser → reopen → should show login page

### Test Team Leader Flow:
1. ✅ Login as team leader → redirect to dashboard
2. ✅ Hard refresh → stay on dashboard
3. ✅ Logout → return to login page
4. ✅ Close browser → reopen → should show login page (if > 24 hours)

---

## Verify Session is Cleared

### Run in Console:
```javascript
// Check if any session exists
console.log('Sessions:', {
  admin: localStorage.getItem('isLoggedIn'),
  teamLeader: localStorage.getItem('teamLeaderSession'),
  role: localStorage.getItem('x-team-leader-role')
})

// Should show: { admin: null, teamLeader: null, role: null }
```

---

## If Problem Persists

### Try Incognito/Private Mode:
```
1. Open incognito window (Ctrl + Shift + N)
2. Go to your app URL
3. Should show clean login page
4. If it works in incognito, the issue is browser cache
```

### Nuclear Option (Last Resort):
```javascript
// In DevTools Console
localStorage.clear()
sessionStorage.clear()
location.reload(true)
```

---

## Expected Behavior After Fix

### ✅ CORRECT:
- Login page shows when you open browser
- No auto-redirect without login
- Hard refresh works (no 404)
- Logout properly clears session
- Session expires after 24 hours (team leader)

### ❌ WRONG (Report if you see this):
- Still auto-redirecting to Shopee dashboard
- Still seeing old staff login page
- 404 error after hard refresh
- Session not clearing after logout

---

## Quick Commands Reference

### Clear localStorage:
```javascript
localStorage.clear()
```

### Check current session:
```javascript
console.log('Admin:', localStorage.getItem('isLoggedIn'))
console.log('Team Leader:', localStorage.getItem('teamLeaderSession'))
```

### Hard refresh:
```
Ctrl + Shift + R
```

### Clear cache:
```
Ctrl + Shift + Delete
```

---

**GAWIN MO TO NGAYON:**
1. Press F12
2. Type: `localStorage.clear()`
3. Press Enter
4. Press Ctrl + Shift + R
5. Verify login page shows clean

**Then test login flow to confirm fix is working!** 🚀
