# Debug: Admin Profile Image Not Uploading to Supabase

## Problem
Admin accounts (e.g., Aizen06) - profile_image column is **NULL** in Supabase  
Operations accounts (e.g., Facebook-Juan) - profile_image has URL ✅

## Added Logging

### 1. Settings Page (`app/dashboard/settings/page.tsx`)
Already has:
```
[Settings] Updating localStorage with: { displayName, profileImage }
```

### 2. Accounts API (`app/api/accounts/route.ts`)
Added:
```
[Accounts API] updateProfile called: { targetUsername, updates, hasProfileImage }
```

### 3. Database Layer (`lib/supabase-db.ts`)
Added:
```
[updateAccount] Updating user: { username, updateData, hasProfileImage }
[updateAccount] Update successful for: username
```

## Test Steps

### Step 1: Login as Admin
1. Login as **Aizen06** / **Aizen06**
2. Open DevTools Console (F12)

### Step 2: Upload Profile Image
1. Go to Settings → Profile tab
2. Click "Upload Image"
3. Select an image file
4. **Watch console** - should see:
   ```
   [ImageUpload] Uploading to: /api/upload-profile
   [Upload Profile] Success: https://...supabase.co/storage/v1/object/public/employee-profiles/...
   ```
5. Image preview should appear ✅

### Step 3: Save Changes
1. Click "Save Changes" button
2. **Watch console** - should see:
   ```
   [Settings] Updating localStorage with: {
     displayName: "Aizen Jhake Rivera",
     profileImage: "https://...supabase.co/storage/v1/object/public/employee-profiles/..."
   }
   [Settings] Dispatched profileUpdated event
   ```

### Step 4: Check Server Logs
1. Look at **terminal/server console** (where `npm run dev` is running)
2. Should see:
   ```
   [Accounts API] updateProfile called: {
     targetUsername: "Aizen06",
     updates: {
       displayName: "Aizen Jhake Rivera",
       email: "...",
       phone: "...",
       profileImage: "https://...supabase.co/storage/v1/object/public/employee-profiles/..."
     },
     hasProfileImage: true
   }
   [updateAccount] Updating user: {
     username: "Aizen06",
     updateData: {
       display_name: "Aizen Jhake Rivera",
       email: "...",
       phone: "...",
       profile_image: "https://...supabase.co/storage/v1/object/public/employee-profiles/..."
     },
     hasProfileImage: true
   }
   [updateAccount] Update successful for: Aizen06
   ```

### Step 5: Verify in Supabase
1. Go to Supabase Dashboard
2. Table Editor → `users` table
3. Find row where `username = 'Aizen06'`
4. Check `profile_image` column
5. **Should have URL** (not NULL)

## Possible Issues

### Issue 1: profileImage is empty string in profileForm
**Symptoms:**
- Console shows: `profileImage: ""`
- Or: `hasProfileImage: false`

**Cause:**
- ImageUpload didn't update profileForm state
- `onChange` callback not firing

**Solution:**
- Check if ImageUpload `onChange` prop is correct
- Check if `setProfileForm` is being called

### Issue 2: API receives empty profileImage
**Symptoms:**
- Server log shows: `profileImage: ""`
- Or: `profileImage: null`

**Cause:**
- Frontend sending empty value
- Check Settings page `handleProfileUpdate`

**Solution:**
- Add console.log before API call:
```javascript
console.log('Sending to API:', {
  profileImage: profileForm.profileImage
});
```

### Issue 3: Database update fails silently
**Symptoms:**
- Server log shows: `[updateAccount] Updating user`
- But NO: `[updateAccount] Update successful`

**Cause:**
- Supabase update error
- Check error logs

**Solution:**
- Look for error message in server console
- Check Supabase RLS policies
- Check if `profile_image` column exists

### Issue 4: Update succeeds but value is NULL
**Symptoms:**
- Server log shows: `[updateAccount] Update successful`
- But Supabase still shows NULL

**Cause:**
- `profile_image` being set to NULL explicitly
- Check if `updates.profileImage` is empty string

**Solution:**
- Check server log for `updateData.profile_image` value
- Should be URL, not null/empty

## Quick Test in Browser Console

```javascript
// Check current profileForm state
// (Run this AFTER uploading image but BEFORE clicking Save)
console.log('Profile Form:', {
  displayName: document.querySelector('#displayName').value,
  profileImage: localStorage.getItem('profileImage')
});

// Manually trigger save with logging
const testSave = async () => {
  const profileImage = localStorage.getItem('profileImage');
  console.log('Testing save with profileImage:', profileImage);
  
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
      profileImage: profileImage
    })
  });
  
  const data = await response.json();
  console.log('Save response:', data);
};
testSave();
```

## Expected vs Actual

### Expected Flow:
1. Upload image → Storage ✅
2. ImageUpload onChange → profileForm.profileImage = URL ✅
3. Click Save → API receives URL ✅
4. API calls updateAccount → Supabase update ✅
5. Supabase users.profile_image = URL ✅

### Actual Flow (Admin):
1. Upload image → Storage ✅
2. ImageUpload onChange → profileForm.profileImage = ??? ❓
3. Click Save → API receives ??? ❓
4. API calls updateAccount → ??? ❓
5. Supabase users.profile_image = NULL ❌

## Next Steps

1. **Test with admin account** (Aizen06)
2. **Copy all console logs** (browser + server)
3. **Check Supabase** after save
4. **Report findings**:
   - Does upload succeed?
   - Does profileForm have the URL?
   - Does API receive the URL?
   - Does database update succeed?
   - Is profile_image still NULL?

This will help identify exactly where the flow breaks for admin accounts.
