# Debug Team Leader Login Issue

## Problem
Team leader logs in but immediately gets redirected back to login page.

## Debug Steps Added

### 1. Added Console Logging
- Login page now logs when session is stored
- Team leader layout logs authentication check

### 2. Check Browser Console
After trying to login, check the console for these messages:

```
[Login] Storing team leader session: {...}
[Login] Session stored, redirecting to /dashboard
[Team Leader Layout] Checking authentication...
[Team Leader Layout] Is authenticated: true/false
[Team Leader Layout] Session: {...}
```

### 3. Check localStorage
Open browser DevTools → Application → Local Storage → Check for:
- `teamLeaderSession` - Should contain session data
- `x-team-leader-user-id` - Should contain user ID
- `x-team-leader-channel` - Should contain channel name
- `x-team-leader-role` - Should be 'team_leader'

## Possible Issues

### Issue 1: Session Not Being Stored
If `teamLeaderSession` is missing from localStorage:
- Check if `setTeamLeaderSession()` is being called
- Check browser console for errors

### Issue 2: Session Being Cleared
If session exists but gets cleared:
- Check if there's a logout call happening
- Check if localStorage is being cleared

### Issue 3: Authentication Check Failing
If session exists but `isTeamLeaderAuthenticated()` returns false:
- Check the session format
- Check if it's valid JSON

## Quick Test

Run this in browser console after login attempt:

```javascript
// Check what's in localStorage
console.log('teamLeaderSession:', localStorage.getItem('teamLeaderSession'))
console.log('x-team-leader-user-id:', localStorage.getItem('x-team-leader-user-id'))
console.log('x-team-leader-channel:', localStorage.getItem('x-team-leader-channel'))
console.log('x-team-leader-role:', localStorage.getItem('x-team-leader-role'))
```

## Next Steps

1. Try logging in as team leader
2. Check browser console for the debug messages
3. Check localStorage for the session data
4. Report what you see

---

**Status:** Debugging in progress
