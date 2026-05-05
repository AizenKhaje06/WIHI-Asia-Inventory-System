# Team Leader Logout Auto-Login Fix

## Problem
After logout, team leader accounts were automatically logging back in, while admin accounts worked correctly.

## Root Cause
The logout flag (`isLoggingOut`) was a module-level variable that reset to `false` when the page reloaded after logout. This caused the following sequence:

1. User clicks logout
2. `performLogout()` sets `isLoggingOut = true` and clears localStorage
3. Page redirects to `/?logout=timestamp`
4. **Page reload resets `isLoggingOut` to `false`** ← THE BUG
5. `RouteGuard` calls `getCurrentUser()`
6. `getCurrentUser()` doesn't see logout flag, finds cached session data
7. User is auto-logged back in

## Solution
Changed logout flag from module-level variable to sessionStorage-based flag that persists across page reloads.

### Changes Made

#### 1. `lib/logout.ts`
- Changed from module variable to sessionStorage
- Added `LOGOUT_FLAG_KEY = '__logout_in_progress__'`
- Updated `isLogoutInProgress()` to check sessionStorage
- Added `setLogoutInProgress()` helper function
- Modified `performLogout()` to preserve logout flag when clearing sessionStorage

#### 2. `app/page.tsx`
- Added logout flag clearing in `handleLogin()` when user manually logs in
- Preserved logout flag when cleaning up after logout redirect

## How It Works Now

### Logout Flow
1. User clicks logout
2. `performLogout()` sets logout flag in sessionStorage
3. Clears all localStorage (including team leader session)
4. Clears sessionStorage (except logout flag)
5. Redirects to `/?logout=timestamp`
6. **Logout flag persists across redirect** ✓
7. `getCurrentUser()` checks flag, returns null
8. User stays on login page

### Login Flow
1. User enters credentials
2. `handleLogin()` clears logout flag from sessionStorage
3. Sets new session data
4. Redirects to dashboard

## Testing

### Test Admin Logout
1. Login as admin
2. Click logout
3. Should redirect to login page
4. Should NOT auto-login

### Test Team Leader Logout
1. Login as team leader (any channel)
2. Click logout
3. Should redirect to login page
4. Should NOT auto-login ✓ FIXED

### Test Manual Login After Logout
1. Logout from any account
2. Manually login again
3. Should work normally
4. Logout flag should be cleared

## Files Modified
- `lib/logout.ts` - Changed logout flag to sessionStorage
- `app/page.tsx` - Clear logout flag on manual login

## Technical Details

### Why sessionStorage?
- Persists across page reloads (unlike module variables)
- Clears when browser tab closes (security)
- Survives redirects (unlike state)
- Isolated per tab (unlike localStorage)

### Why Not localStorage?
- We clear localStorage during logout
- Would need special handling to preserve flag
- sessionStorage is more appropriate for temporary flags

## Status
✅ FIXED - Both admin and team leader logout now work correctly
