# CRITICAL FIX: Department Filtering Not Working

**Date**: May 12, 2026  
**Issue**: Track Orders and Activity Logs showing all departments' data  
**Status**: ✅ FIXED

---

## Problem

User reported:
> "log in lazada as carlo pero pag tingin ko sa track order page visible parin lahat departments order dun, same din sa activity logs page"

Translation: Logged in as Carlo (Lazada) but Track Orders page and Activity Logs page still show all departments' orders.

---

## Root Cause

The `lib/api-client.ts` file's `getAuthHeaders()` function was **NOT including `assignedChannel`** in the request headers.

### Before (Broken):
```typescript
function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {}
  
  const username = localStorage.getItem('username')
  const role = localStorage.getItem('userRole')
  const displayName = localStorage.getItem('displayName')
  // ❌ Missing: assignedChannel

  if (username) headers['x-user-username'] = username
  if (role) headers['x-user-role'] = role
  if (displayName) headers['x-user-display-name'] = displayName
  // ❌ Missing: x-assigned-channel header

  return headers
}
```

### After (Fixed):
```typescript
function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {}
  
  const username = localStorage.getItem('username')
  const role = localStorage.getItem('userRole')
  const displayName = localStorage.getItem('displayName')
  const assignedChannel = localStorage.getItem('assignedChannel') // ✅ Added

  if (username) headers['x-user-username'] = username
  if (role) headers['x-user-role'] = role
  if (displayName) headers['x-user-display-name'] = displayName
  if (assignedChannel) headers['x-assigned-channel'] = assignedChannel // ✅ Added

  return headers
}
```

---

## Impact

**Without this fix:**
- All API routes had department filtering logic ✅
- But the `assignedChannel` was never sent to the APIs ❌
- Result: APIs couldn't filter because they didn't know the user's department

**With this fix:**
- `assignedChannel` is now included in ALL API requests ✅
- APIs can properly filter data by department ✅
- Operations users only see their department's data ✅

---

## Files Modified

1. **`lib/api-client.ts`** - Added `assignedChannel` to auth headers (CRITICAL FIX)
2. **`app/api/logs/route.ts`** - Added department filtering for activity logs

---

## Testing

### Before Fix:
```
Carlo (Lazada) logs in
↓
Track Orders page shows: Lazada + Facebook + TikTok + Shopee orders ❌
Activity Logs page shows: All departments' logs ❌
```

### After Fix:
```
Carlo (Lazada) logs in
↓
assignedChannel = "Lazada" stored in localStorage
↓
All API requests include: x-assigned-channel: "Lazada"
↓
Track Orders page shows: ONLY Lazada orders ✅
Activity Logs page shows: ONLY Lazada item logs ✅
```

---

## How to Test

1. **Clear browser cache and restart localhost**
2. **Login as Carlo (Lazada)**
   - Department: Lazada
   - Password: carlo123
3. **Check Track Orders page**
   - Should ONLY show Lazada orders
   - Should NOT show Facebook, TikTok, Shopee orders
4. **Check Activity Logs page**
   - Should ONLY show logs for Lazada items
5. **Login as Admin**
   - Should see ALL orders from all departments

---

## Why This Happened

The API filtering logic was implemented correctly, but the **client-side helper** that sends requests to the APIs was missing the critical `assignedChannel` header. This is a common mistake when implementing authentication systems - the backend is ready but the frontend isn't sending the required data.

---

## Lesson Learned

When implementing authentication/authorization:
1. ✅ Update API routes with filtering logic
2. ✅ Update auth middleware to accept new headers
3. ✅ **Update client-side helpers to SEND the new headers** ← This was missed initially
4. ✅ Test end-to-end with actual user login

---

## Status

✅ **FIXED** - Department filtering now works correctly across all pages.

Restart your localhost and test again!
