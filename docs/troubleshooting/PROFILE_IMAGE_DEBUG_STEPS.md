# Profile Image Debug Steps

## Issue
Profile image hindi nag-uupdate or nag-didisplay sa header.

## Debug Steps

### Step 1: Check Browser Console
1. Open DevTools (F12)
2. Go to **Console** tab
3. Upload a profile image
4. Look for these logs:

**Expected logs:**
```
[ImageUpload] Uploading to: /api/upload-profile
[Upload Profile] Success: https://...supabase.co/storage/v1/object/public/employee-profiles/...
[Settings] Updating localStorage with: { displayName, profileImage }
[Settings] Dispatched profileUpdated event
[Header] Profile update event detected
[Header] Loading user data from localStorage: { storedProfileImage: "https://..." }
```

**If you see errors:**
- Note the exact error message
- Check if it's a network error or API error

### Step 2: Check Network Tab
1. Stay in DevTools
2. Go to **Network** tab
3. Upload a profile image
4. Look for request to `/api/upload-profile`

**Check the request:**
- Status: Should be `200 OK`
- Response: Should have `{ success: true, url: "https://..." }`

**If status is 401:**
- localStorage missing username/userRole
- Check Application → Local Storage

**If status is 500:**
- Server error
- Check response body for error message

### Step 3: Check Local Storage
1. DevTools → **Application** tab
2. Left sidebar → **Local Storage** → `http://localhost:3000`
3. Look for these keys:

**Required keys:**
```
username: "Aizen06" (or your username)
userRole: "admin" (or your role)
displayName: "Your Name"
profileImage: "https://...supabase.co/storage/v1/object/public/employee-profiles/..."
```

**If profileImage is missing or empty:**
- The save didn't work
- Check console for errors

### Step 4: Check Supabase Database
1. Go to Supabase Dashboard
2. **Table Editor** → `users` table
3. Find your account (e.g., Aizen06)
4. Check `profile_image` column

**Expected:**
- Should have a URL like: `https://...supabase.co/storage/v1/object/public/employee-profiles/profile-Aizen06-...webp`

**If NULL or empty:**
- The API didn't save to database
- Run `DEBUG_PROFILE_IMAGES.sql` to investigate

### Step 5: Check Supabase Storage
1. Go to Supabase Dashboard
2. **Storage** → `employee-profiles` bucket
3. Look for your uploaded files

**Expected:**
- Files named like: `profile-Aizen06-1234567890-abc123.webp`
- Files should be viewable (click to preview)

**If bucket doesn't exist:**
- Run `CREATE_EMPLOYEE_PROFILES_BUCKET.sql`

**If files exist but not in database:**
- Upload succeeded but save failed
- Check `/api/accounts` PUT endpoint

### Step 6: Test API Directly

**Test Upload API:**
```javascript
// Run in browser console
const testUpload = async () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload-profile', {
      method: 'POST',
      headers: {
        'x-user-username': localStorage.getItem('username'),
        'x-user-role': localStorage.getItem('userRole')
      },
      body: formData
    });
    
    const data = await response.json();
    console.log('Upload response:', data);
  };
  input.click();
};
testUpload();
```

**Test Save API:**
```javascript
// Run in browser console after getting URL from upload
const testSave = async (imageUrl) => {
  const response = await fetch('/api/accounts', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-user-username': localStorage.getItem('username'),
      'x-user-role': localStorage.getItem('userRole')
    },
    body: JSON.stringify({
      action: 'updateProfile',
      username: localStorage.getItem('username'),
      displayName: localStorage.getItem('displayName'),
      profileImage: imageUrl
    })
  });
  
  const data = await response.json();
  console.log('Save response:', data);
};
// Replace with actual URL from upload
testSave('https://...supabase.co/storage/v1/object/public/employee-profiles/...');
```

## Common Issues & Solutions

### Issue 1: Upload succeeds but image doesn't show
**Symptoms:**
- Console shows "Image uploaded successfully"
- Network shows 200 OK
- But header still shows gradient

**Solution:**
- Check if `profileImage` is in localStorage
- Check if header event listener is working
- Try manual page reload (Ctrl+R)

### Issue 2: Upload fails with 401 Unauthorized
**Symptoms:**
- Network shows 401 status
- Console shows "Unauthorized"

**Solution:**
```javascript
// Check auth in console
console.log({
  username: localStorage.getItem('username'),
  userRole: localStorage.getItem('userRole')
});
// If null, you need to login again
```

### Issue 3: Image uploads but doesn't save to database
**Symptoms:**
- Storage has the file
- Database `profile_image` is NULL

**Solution:**
- Check if "Save Changes" button was clicked
- Check Network tab for `/api/accounts` PUT request
- Check console for save errors

### Issue 4: Header shows old image after update
**Symptoms:**
- New image in localStorage
- Header still shows old image

**Solution:**
```javascript
// Force header refresh in console
window.dispatchEvent(new Event('profileUpdated'));
// Or hard reload
window.location.reload();
```

### Issue 5: Image URL is broken/404
**Symptoms:**
- Header shows broken image icon
- Console shows 404 error for image URL

**Solution:**
- Check if URL is correct format
- Check Supabase storage policies
- Verify bucket is public

## Quick Fix Commands

**Clear everything and start fresh:**
```javascript
// Run in browser console
localStorage.clear();
window.location.href = '/';
```

**Force reload profile data:**
```javascript
// Run in browser console
window.dispatchEvent(new Event('profileUpdated'));
```

**Check current state:**
```javascript
// Run in browser console
console.log('Current user data:', {
  username: localStorage.getItem('username'),
  displayName: localStorage.getItem('displayName'),
  profileImage: localStorage.getItem('profileImage'),
  currentUser: JSON.parse(localStorage.getItem('currentUser') || '{}')
});
```

## Report Format

When reporting the issue, please provide:

1. **Console logs** (copy all red errors)
2. **Network tab** (screenshot of /api/upload-profile request)
3. **Local Storage** (screenshot showing all keys)
4. **Supabase database** (screenshot of users table row)
5. **Exact steps** you took before the issue occurred

This will help identify exactly where the flow is breaking.
