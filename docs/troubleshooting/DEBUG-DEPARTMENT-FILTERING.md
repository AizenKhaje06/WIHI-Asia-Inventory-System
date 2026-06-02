# DEBUG: Department Filtering Not Working

## Step 1: Check localStorage

Open browser console (F12) and run:

```javascript
console.log('Username:', localStorage.getItem('username'))
console.log('Role:', localStorage.getItem('userRole'))
console.log('Display Name:', localStorage.getItem('displayName'))
console.log('Assigned Channel:', localStorage.getItem('assignedChannel'))
```

**Expected for Carlo (Lazada):**
- Username: Lazada-Carlo
- Role: operations
- Display Name: Carlo
- Assigned Channel: Lazada

---

## Step 2: Check API Request Headers

In browser console, run this to intercept next API call:

```javascript
// Intercept fetch to see headers
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('🔍 API Request:', args[0]);
  if (args[1] && args[1].headers) {
    console.log('📋 Headers:', args[1].headers);
  }
  return originalFetch.apply(this, args);
};
```

Then refresh the Track Orders page and check console.

**Expected headers:**
- x-user-username: Lazada-Carlo
- x-user-role: operations
- x-user-display-name: Carlo
- x-assigned-channel: Lazada ← THIS IS CRITICAL

---

## Step 3: Check API Response

In browser console on Track Orders page:

```javascript
fetch('/api/orders?status=Packed', {
  headers: {
    'x-user-username': localStorage.getItem('username'),
    'x-user-role': localStorage.getItem('userRole'),
    'x-user-display-name': localStorage.getItem('displayName'),
    'x-assigned-channel': localStorage.getItem('assignedChannel')
  }
})
.then(r => r.json())
.then(data => {
  console.log('Total orders:', data.length)
  const channels = [...new Set(data.map(o => o.sales_channel))]
  console.log('Sales channels in response:', channels)
  
  if (channels.length > 1) {
    console.error('❌ PROBLEM: Multiple channels returned!', channels)
  } else {
    console.log('✅ OK: Only one channel:', channels[0])
  }
})
```

---

## Step 4: Check Server Logs

Look at your terminal where localhost is running. You should see:

```
[Orders API] User role: operations
[Orders API] Assigned channel: Lazada
[Orders API] Filtering orders by channel: Lazada
```

If you DON'T see these logs, the headers are not reaching the server.

---

## Common Issues:

### Issue 1: assignedChannel not in localStorage
**Solution:** Logout and login again

### Issue 2: Browser cache
**Solution:** Hard refresh (Ctrl + Shift + R) or clear cache

### Issue 3: Old code still running
**Solution:** Stop localhost (Ctrl + C) and restart: `npm run dev`

### Issue 4: Headers not being sent
**Solution:** Check if lib/api-client.ts was saved properly

---

## Quick Fix Test:

Run this in browser console on Track Orders page:

```javascript
// Force set assignedChannel
localStorage.setItem('assignedChannel', 'Lazada')

// Reload page
location.reload()
```

If this works, the problem is in the login flow not setting assignedChannel.
