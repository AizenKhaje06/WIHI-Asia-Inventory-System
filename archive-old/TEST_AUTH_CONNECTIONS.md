# Test Authentication Connections

## Overview
This document provides test cases to verify all account types can authenticate properly.

## Prerequisites
1. Run `CHECK_ALL_ACCOUNTS.sql` in Supabase SQL Editor first
2. Verify all accounts exist and have passwords
3. Check that team leaders have assigned_channel values

## Test Cases

### 1. Admin Login Test
**Endpoint:** Main Login Page - Admin Tab
**Steps:**
1. Go to login page
2. Click "Admin" tab
3. Enter admin username
4. Enter admin password
5. Click "Sign In"

**Expected Result:**
- ✅ Successful login
- ✅ Redirects to `/dashboard`
- ✅ localStorage contains: `isLoggedIn`, `username`, `userRole`, `displayName`, `currentUser`

**Test Accounts:**
- Username: `admin` (or your admin username)
- Check database for actual admin accounts

---

### 2. Team Leader Login Test - Shopee
**Endpoint:** Main Login Page - Staff Tab
**Steps:**
1. Go to login page
2. Click "Staff" tab
3. Select "Shopee" from dropdown
4. Enter Shopee team leader password
5. Click "Sign In"

**Expected Result:**
- ✅ Successful login
- ✅ Redirects to `/team-leader/dashboard`
- ✅ localStorage contains: `x-team-leader-user-id`, `x-team-leader-channel`, `x-team-leader-role`
- ✅ Dashboard shows Shopee-specific data

**Test Account:**
- Channel: Shopee
- Username in DB: `staff_shopee_001`
- Check database for password

---

### 3. Team Leader Login Test - TikTok
**Endpoint:** Main Login Page - Staff Tab
**Steps:**
1. Go to login page
2. Click "Staff" tab
3. Select "TikTok" from dropdown
4. Enter TikTok team leader password
5. Click "Sign In"

**Expected Result:**
- ✅ Successful login
- ✅ Redirects to `/team-leader/dashboard`
- ✅ localStorage contains team leader session data
- ✅ Dashboard shows TikTok-specific data

**Test Account:**
- Channel: TikTok
- Username in DB: `staff_tiktok_001`
- Check database for password

---

### 4. Team Leader Login Test - Lazada
**Endpoint:** Main Login Page - Staff Tab
**Steps:**
1. Go to login page
2. Click "Staff" tab
3. Select "Lazada" from dropdown
4. Enter Lazada team leader password
5. Click "Sign In"

**Expected Result:**
- ✅ Successful login
- ✅ Redirects to `/team-leader/dashboard`
- ✅ Dashboard shows Lazada-specific data

---

### 5. Team Leader Login Test - Facebook
**Endpoint:** Main Login Page - Staff Tab
**Steps:**
1. Go to login page
2. Click "Staff" tab
3. Select "Facebook" from dropdown
4. Enter Facebook team leader password
5. Click "Sign In"

**Expected Result:**
- ✅ Successful login
- ✅ Redirects to `/team-leader/dashboard`
- ✅ Dashboard shows Facebook-specific data

---

### 6. Team Leader Login Test - Physical Store
**Endpoint:** Main Login Page - Staff Tab
**Steps:**
1. Go to login page
2. Click "Staff" tab
3. Select "Physical Store" from dropdown
4. Enter Physical Store team leader password
5. Click "Sign In"

**Expected Result:**
- ✅ Successful login
- ✅ Redirects to `/team-leader/dashboard`
- ✅ Dashboard shows Physical Store-specific data

---

### 7. Operations Staff Login Test
**Endpoint:** Main Login Page - Admin Tab
**Steps:**
1. Go to login page
2. Click "Admin" tab (operations uses admin login flow)
3. Enter operations username
4. Enter operations password
5. Click "Sign In"

**Expected Result:**
- ✅ Successful login
- ✅ Redirects to `/dashboard/operations`
- ✅ localStorage contains user data with role = 'operations'

---

## API Endpoint Tests

### Test 1: Get Channels List
```bash
curl http://localhost:3000/api/auth/channels
```

**Expected Response:**
```json
{
  "success": true,
  "channels": [
    { "id": "warehouse-admin", "name": "Warehouse Admin", "label": "Warehouse Admin (Physical Store)" },
    { "id": "tiktok", "name": "TikTok", "label": "TikTok" },
    { "id": "shopee", "name": "Shopee", "label": "Shopee" },
    { "id": "facebook", "name": "Facebook", "label": "Facebook" },
    { "id": "lazada", "name": "Lazada", "label": "Lazada" }
  ]
}
```

---

### Test 2: Team Leader Login API
```bash
curl -X POST http://localhost:3000/api/auth/team-leader-login \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "Shopee",
    "password": "YOUR_PASSWORD_HERE"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "username": "staff_shopee_001",
    "displayName": "Shopee Team Leader",
    "email": "...",
    "role": "team_leader",
    "assignedChannel": "Shopee"
  },
  "sessionData": { ... }
}
```

---

### Test 3: Admin Login API
```bash
curl -X POST http://localhost:3000/api/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "action": "validate",
    "username": "admin",
    "password": "YOUR_PASSWORD_HERE"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "account": {
    "username": "admin",
    "role": "admin",
    "displayName": "Administrator",
    "email": "...",
    "phone": "..."
  }
}
```

---

## Common Issues & Solutions

### Issue 1: "Invalid channel or credentials"
**Cause:** 
- Wrong password
- No team leader account for that channel
- assigned_channel doesn't match

**Solution:**
1. Run `CHECK_ALL_ACCOUNTS.sql`
2. Verify team leader exists for the channel
3. Check assigned_channel value matches exactly (case-sensitive)
4. Verify password is set

---

### Issue 2: "Channel is required"
**Cause:** Dropdown not loading or no channel selected

**Solution:**
1. Check `/api/auth/channels` endpoint is working
2. Verify channels are loading in browser console
3. Check network tab for API errors

---

### Issue 3: Redirect to wrong dashboard
**Cause:** Role or session data not set correctly

**Solution:**
1. Check localStorage after login
2. Verify role in database matches expected value
3. Clear localStorage and try again

---

### Issue 4: "Unauthorized" errors after login
**Cause:** Session data not stored properly

**Solution:**
1. Check browser console for localStorage errors
2. Verify session data is being saved
3. Check API middleware is reading headers correctly

---

## Database Verification Queries

### Check Team Leader Accounts
```sql
SELECT 
    username,
    display_name,
    assigned_channel,
    role,
    CASE WHEN password IS NOT NULL THEN 'Has Password' ELSE 'No Password' END as password_status
FROM users
WHERE role = 'team_leader'
ORDER BY assigned_channel;
```

### Check All Roles
```sql
SELECT role, COUNT(*) as count
FROM users
GROUP BY role;
```

### Verify Channel Coverage
```sql
SELECT 
    channel,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM users 
            WHERE role = 'team_leader' 
            AND assigned_channel = channel
        ) THEN 'Has Team Leader'
        ELSE 'Missing Team Leader'
    END as status
FROM (
    VALUES 
        ('Shopee'),
        ('Lazada'),
        ('Facebook'),
        ('TikTok'),
        ('Physical Store')
) AS expected_channels(channel);
```

---

## Next Steps After Testing

1. ✅ Verify all test cases pass
2. ✅ Document any failed tests
3. ✅ Create missing team leader accounts if needed
4. ✅ Update passwords if authentication fails
5. ✅ Test on production/Vercel deployment
6. ✅ Update documentation with actual credentials (securely)
