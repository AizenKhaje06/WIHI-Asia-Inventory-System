# Debug: Packing Queue Department Filtering

## Problem
Orders dispatched by Juan (Facebook) are visible in other departments' packing queues.

## Expected Behavior
- Juan (Facebook) should only see Facebook orders
- Carlo (Lazada) should only see Lazada orders
- Admin should see all orders

## Debugging Steps

### Step 1: Check localStorage After Login

After logging in as Juan (Facebook-Juan), open browser console (F12) and run:

```javascript
// Check if assignedChannel is saved
localStorage.getItem('assignedChannel')  // Should return: "Facebook"

// Check all auth data
console.log({
  username: localStorage.getItem('username'),
  userRole: localStorage.getItem('userRole'),
  displayName: localStorage.getItem('displayName'),
  assignedChannel: localStorage.getItem('assignedChannel')
})
```

**Expected Output:**
```javascript
{
  username: "Facebook-Juan",
  userRole: "operations",
  displayName: "Juan (Facebook)",
  assignedChannel: "Facebook"
}
```

### Step 2: Check API Client Headers

When you navigate to Packing Queue, check the console for `[API Client]` logs:

```
[API Client] Reading from localStorage: {
  username: "Facebook-Juan",
  role: "operations",
  displayName: "Juan (Facebook)",
  assignedChannel: "Facebook"
}

[API Client] Final headers: {
  x-user-username: "Facebook-Juan",
  x-user-role: "operations",
  x-user-display-name: "Juan (Facebook)",
  x-assigned-channel: "Facebook"
}

[API Client] Making request to: /api/orders?status=Pending
```

### Step 3: Check Orders API Filtering

Look for `[Orders API]` logs in the **terminal** (not browser console):

```
[Orders API] Request headers: {
  userRole: 'operations',
  assignedChannel: 'Facebook',
  allHeaders: { ... }
}

[Orders API] Filtering by channel: Facebook
```

### Step 4: Check Packing Queue Page Logs

In browser console, look for `[Packing Queue]` logs:

```
[Packing Queue] Total orders fetched from API: 5
[Packing Queue] User info: { role: 'operations', assignedChannel: 'Facebook' }
[Packing Queue] Orders to display: [
  { id: 'abc123', channel: 'Facebook' },
  { id: 'def456', channel: 'Facebook' },
  ...
]
```

## Common Issues & Solutions

### Issue 1: assignedChannel is null or empty

**Symptom:**
```javascript
localStorage.getItem('assignedChannel')  // Returns: null or ""
```

**Solution:**
1. Logout completely
2. Clear browser cache and localStorage
3. Login again as Juan (Facebook-Juan) with password `juan123`
4. Check localStorage again

**Clear localStorage:**
```javascript
localStorage.clear()
// Then refresh page and login again
```

### Issue 2: API not receiving headers

**Symptom:**
Terminal shows:
```
[Orders API] Request headers: {
  userRole: null,
  assignedChannel: null
}
```

**Solution:**
Check if middleware is stripping headers. The headers should be passed through from the API client.

### Issue 3: Wrong username format

**Symptom:**
```javascript
localStorage.getItem('username')  // Returns: "Facebook" instead of "Facebook-Juan"
```

**Solution:**
You're logging in with the wrong account. Make sure to select **"Juan (Facebook)"** from the dropdown, not just "Facebook".

### Issue 4: Orders have wrong sales_channel value

**Symptom:**
Orders in database have `sales_channel = null` or wrong value.

**Solution:**
Check the orders table in Supabase:
```sql
SELECT id, sales_channel, store, product, dispatched_by 
FROM orders 
WHERE status = 'Pending'
ORDER BY created_at DESC
LIMIT 10;
```

If `sales_channel` is wrong, the issue is in the dispatch form (POS page).

## Testing Checklist

### Test Juan's Account (Facebook)
- [ ] Login as "Juan (Facebook)" with password `juan123`
- [ ] Check localStorage: `assignedChannel` = "Facebook"
- [ ] Navigate to Packing Queue
- [ ] Check console logs for API headers
- [ ] Verify only Facebook orders are displayed
- [ ] Dispatch a new order
- [ ] Verify it appears in packing queue
- [ ] Logout and login as Carlo (Lazada)
- [ ] Verify Juan's order does NOT appear in Carlo's packing queue

### Test Carlo's Account (Lazada)
- [ ] Login as "Carlo (Lazada)" with password `carlo123`
- [ ] Check localStorage: `assignedChannel` = "Lazada"
- [ ] Navigate to Packing Queue
- [ ] Verify only Lazada orders are displayed
- [ ] Verify Facebook orders do NOT appear

### Test Admin Account
- [ ] Login as admin
- [ ] Navigate to Packing Queue
- [ ] Verify ALL orders from all departments are displayed

## Quick Fix Commands

### Clear all localStorage and start fresh:
```javascript
// In browser console
localStorage.clear()
sessionStorage.clear()
location.reload()
```

### Check what orders exist in database:
```sql
-- In Supabase SQL Editor
SELECT 
  id,
  sales_channel,
  store,
  product,
  dispatched_by,
  status,
  created_at
FROM orders
WHERE status = 'Pending'
ORDER BY created_at DESC;
```

### Manually set assignedChannel (for testing):
```javascript
// In browser console (after login)
localStorage.setItem('assignedChannel', 'Facebook')
location.reload()
```

## Files Involved

1. **Login Page** (`app/page.tsx`)
   - Saves `assignedChannel` to localStorage

2. **API Client** (`lib/api-client.ts`)
   - Reads `assignedChannel` from localStorage
   - Sends as `x-assigned-channel` header

3. **Orders API** (`app/api/orders/route.ts`)
   - Reads `x-assigned-channel` header
   - Filters orders by `sales_channel`

4. **Packing Queue Page** (`app/dashboard/packing-queue/page.tsx`)
   - Calls `/api/orders?status=Pending`
   - Displays filtered orders

## Status

🔍 **DEBUGGING IN PROGRESS**

Next step: Check browser console and terminal logs to identify where the filtering is failing.

---

**Date**: May 17, 2026
**Issue**: Orders visible across departments
**Expected**: Department-specific filtering
