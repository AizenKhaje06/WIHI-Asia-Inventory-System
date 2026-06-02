# Test Guide: Profile Image Header Update

## Quick Test Steps

### Test 1: Admin Account (Aizen06)
1. **Login**
   - Go to login page
   - Select "Admin" role
   - Username: `Aizen06`
   - Password: `Aizen06`
   - Click Login
   - ✅ Check: Header shows profile image (or gradient if none)

2. **Upload Profile Image**
   - Go to Settings → Profile tab
   - Click "Upload Image" in Profile section
   - Select an image file
   - ✅ Check: Image preview appears
   - Click "Save Changes"
   - ✅ Check: Success toast appears
   - ✅ Check: Header profile image updates immediately
   - Wait for page reload
   - ✅ Check: Header still shows new image after reload

3. **Change Display Name**
   - In Profile tab, change "Display Name" field
   - Click "Save Changes"
   - ✅ Check: Header shows new display name immediately
   - ✅ Check: Header still shows new name after reload

4. **Logout and Login Again**
   - Click profile dropdown → Logout
   - Login again with same credentials
   - ✅ Check: Header shows saved profile image
   - ✅ Check: Header shows saved display name

### Test 2: Department Account (Facebook-Juan)
1. **Login**
   - Go to login page
   - Select "Operations Staff" role
   - Select "Facebook" from dropdown
   - Username: `Facebook-Juan`
   - Password: `juan123`
   - Click Login
   - ✅ Check: Header shows Facebook logo + profile image

2. **Upload Profile Image**
   - Go to Settings → Profile tab
   - Click "Upload Image"
   - Select an image file
   - Click "Save Changes"
   - ✅ Check: Header updates immediately
   - ✅ Check: Header still shows image after reload

3. **Verify in Users Tab (Admin Only)**
   - Logout from Facebook-Juan
   - Login as Admin (Aizen06)
   - Go to Settings → Users tab
   - Find "Facebook-Juan" in the list
   - ✅ Check: Profile image shows in user list

### Test 3: Edge Cases

#### No Profile Image
1. Login with account that has no profile image
2. ✅ Check: Header shows gradient with User icon
3. Upload image
4. ✅ Check: Gradient replaced with actual image

#### Delete Profile Image
1. Login with account that has profile image
2. Go to Settings → Users tab (Admin)
3. Edit user → Remove image → Save
4. ✅ Check: Header reverts to gradient fallback

#### Multiple Tabs
1. Open app in Tab A
2. Open app in Tab B (same browser)
3. In Tab A: Update profile image
4. ✅ Check: Tab B header updates automatically (storage event)

## Console Logs to Watch

Open browser DevTools → Console tab. You should see:

### On Login:
```
[Operations Login] Saving to localStorage: { username, displayName, assignedChannel }
[Operations Login] Saved assignedChannel: Facebook
```

### On Profile Update:
```
[Settings] Updating localStorage with: { displayName, profileImage }
[Settings] Dispatched profileUpdated event
[Header] Profile update event detected
[Header] Loading user data from localStorage: { storedUsername, displayName, storedProfileImage }
```

### On Header Load:
```
[Header] Loading user data from localStorage: { storedUsername, displayName, storedProfileImage }
```

## Expected Behavior

### ✅ WORKING:
- Profile image displays in header dropdown
- Profile image updates immediately after save
- Display name updates immediately after save
- Changes persist after page reload
- Changes persist after logout/login
- Gradient fallback shows when no image
- Works for Admin accounts
- Works for Department accounts
- Works for Logistics accounts

### ❌ NOT WORKING (Report if you see):
- Header shows old image after update
- Header shows old display name after update
- Profile image disappears after reload
- Console errors about localStorage
- Image upload fails silently

## Troubleshooting

### Issue: Header not updating
1. Open DevTools → Console
2. Check for `[Header] Profile update event detected` log
3. If missing, check `[Settings] Dispatched profileUpdated event` log
4. If both missing, the event system is not working

### Issue: Image not saving
1. Check Network tab for `/api/accounts` PUT request
2. Check response status (should be 200)
3. Check Supabase → users table → profile_image column
4. Check localStorage → profileImage key

### Issue: Image not loading on login
1. Check Network tab for login API response
2. Verify response includes `profileImage` field
3. Check localStorage after login
4. Check console for `[Header] Loading user data` log

## Database Verification

### Check Supabase:
1. Go to Supabase Dashboard
2. Table Editor → users table
3. Find your test account
4. ✅ Check: `profile_image` column has URL value
5. ✅ Check: URL starts with Supabase storage URL

### Check Storage:
1. Go to Supabase Dashboard
2. Storage → employee-profiles bucket
3. ✅ Check: Your uploaded images are there
4. ✅ Check: Files are accessible (click to view)

## Success Criteria

All tests pass ✅ = Feature is working correctly
Any test fails ❌ = Report the specific test that failed
