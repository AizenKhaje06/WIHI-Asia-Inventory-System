# 🧪 Test Session Fix - Quick Guide

## Mga Na-Fix

1. ✅ **Session Persistence** - Hindi na mag-auto redirect pag walang login
2. ✅ **Internal Usage Filter** - Auto-filter na sa assigned sales channel ng team leader
3. ✅ **404 Error** - Fixed na yung 404 after hard refresh

---

## Test 1: Session Persistence (5 minutes)

### Step 1: Test Login Page
```
1. Close lahat ng browser tabs
2. Open new browser window
3. Go to login page
4. ✅ CHECK: Dapat nakikita yung login page (hindi auto-redirect)
```

### Step 2: Test Admin Login
```
1. Login as admin
2. ✅ CHECK: Redirect to /dashboard
3. Hard refresh (Ctrl + Shift + R)
4. ✅ CHECK: Stay sa dashboard (no 404)
5. Close browser
6. Open browser ulit
7. ✅ CHECK: Still logged in, nasa dashboard pa rin
```

### Step 3: Test Team Leader Login
```
1. Logout
2. Login as team leader (Shopee account)
3. ✅ CHECK: Redirect to /team-leader/dashboard or /dashboard
4. Hard refresh (Ctrl + Shift + R)
5. ✅ CHECK: Stay sa dashboard (no 404)
6. Close browser
7. Open browser ulit
8. ✅ CHECK: Still logged in (if less than 24 hours)
```

---

## Test 2: Internal Usage Auto-Filter (3 minutes)

### Step 1: Login as Team Leader
```
1. Login as Shopee team leader
2. Navigate to Internal Usage page
```

### Step 2: Check Auto-Filter
```
1. ✅ CHECK: Overview tab - dapat Shopee data lang
2. ✅ CHECK: Sales Channels tab - dapat Shopee lang
3. ✅ CHECK: Cost Analysis tab - dapat Shopee data lang
4. ✅ CHECK: Transaction History tab - dapat Shopee transactions lang
5. ✅ CHECK: Sales channel dropdown - HIDDEN (hindi dapat makita)
```

### Step 3: Check Admin View
```
1. Logout
2. Login as admin
3. Navigate to Internal Usage page
4. ✅ CHECK: Sales channel dropdown - VISIBLE
5. ✅ CHECK: Can select "All Channels"
6. ✅ CHECK: Can filter by specific channel
```

---

## Test 3: Session Expiry (Optional - 24 hours)

```
1. Login as team leader
2. Wait 24 hours
3. Refresh page
4. ✅ CHECK: Should redirect to login page (session expired)
```

---

## Kung May Problem Pa Rin

### Clear Everything:
```
1. Open DevTools (F12)
2. Go to Console tab
3. Type: localStorage.clear()
4. Press Enter
5. Close browser
6. Open browser ulit
7. Try login again
```

### Check Console Logs:
```
1. Open DevTools (F12)
2. Go to Console tab
3. Look for these logs:
   - [Login Page] Checking existing session...
   - [Login Page] Valid admin session, redirecting...
   - [Auth] Invalid session, clearing...
```

---

## Expected Behavior

### ✅ CORRECT:
- Login page shows when not logged in
- No auto-redirect without login
- Hard refresh works (no 404)
- Team leader sees only their channel data
- Admin sees all data with filter option

### ❌ WRONG (Report if you see this):
- Auto-redirect to dashboard without login
- 404 error after hard refresh
- Team leader sees other channels' data
- Sales channel dropdown visible for team leader
- Session doesn't persist after browser close

---

## Quick Commands

### Clear Cache:
```
Ctrl + Shift + Delete
```

### Hard Refresh:
```
Ctrl + Shift + R
```

### Clear localStorage (DevTools Console):
```javascript
localStorage.clear()
```

### Check Current Session (DevTools Console):
```javascript
console.log('Admin:', localStorage.getItem('isLoggedIn'))
console.log('Team Leader:', localStorage.getItem('teamLeaderSession'))
console.log('Role:', localStorage.getItem('x-team-leader-role'))
```

---

## Report Results

Pag nag-test ka na, report kung:
1. ✅ All tests passed
2. ❌ May specific issue pa rin (sabihin kung ano)
3. 🤔 May ibang behavior na nakita

---

**Ready to test!** 🚀
