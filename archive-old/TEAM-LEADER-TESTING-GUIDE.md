# Team Leader Dashboard - Testing Guide

## Overview
This guide walks you through setting up and testing the Team Leader Dashboard feature.

---

## Phase 1: Database Setup

### Step 1: Fix the Role Constraint
The users table has a check constraint that only allows 'admin' and 'staff' roles. We need to update it to support 'team_leader' and 'operations' roles.

**Run this SQL in Supabase SQL Editor:**

```sql
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'staff', 'operations', 'team_leader'));
```

### Step 2: Insert Test Team Leaders
Run the SQL from `TEAM-LEADER-TEST-SETUP.sql` file to insert test team leader accounts.

**Quick version - Run this SQL:**

```sql
-- Warehouse Admin Team Leader
INSERT INTO users (id, username, password, role, display_name, created_at, email, assigned_channel)
VALUES (
  'tl_warehouse_001',
  'tl_warehouse_001',
  '$2b$10$SSf4LKItwQvoNPuPLEyhT.ij3WEonVHvEbazocopTSbke/lQe0HPm',
  'team_leader',
  'Team Lead - Warehouse',
  NOW(),
  'warehouse@local.test',
  'Warehouse Admin'
)
ON CONFLICT (username) DO NOTHING;

-- TikTok Team Leader
INSERT INTO users (id, username, password, role, display_name, created_at, email, assigned_channel)
VALUES (
  'tl_tiktok_001',
  'tl_tiktok_001',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm',
  'team_leader',
  'Team Lead - TikTok',
  NOW(),
  'tiktok@local.test',
  'TikTok'
)
ON CONFLICT (username) DO NOTHING;

-- Shopee Team Leader
INSERT INTO users (id, username, password, role, display_name, created_at, email, assigned_channel)
VALUES (
  'tl_shopee_001',
  'tl_shopee_001',
  '$2b$10$SSf4LKItwQvoNPuPLEyhT.ij3WEonVHvEbazocopTSbke/lQe0HPm',
  'team_leader',
  'Team Lead - Shopee',
  NOW(),
  'shopee@local.test',
  'Shopee'
)
ON CONFLICT (username) DO NOTHING;

-- Facebook Team Leader
INSERT INTO users (id, username, password, role, display_name, created_at, email, assigned_channel)
VALUES (
  'tl_facebook_001',
  'tl_facebook_001',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm',
  'team_leader',
  'Team Lead - Facebook',
  NOW(),
  'facebook@local.test',
  'Facebook'
)
ON CONFLICT (username) DO NOTHING;

-- Lazada Team Leader
INSERT INTO users (id, username, password, role, display_name, created_at, email, assigned_channel)
VALUES (
  'tl_lazada_001',
  'tl_lazada_001',
  '$2b$10$SSf4LKItwQvoNPuPLEyhT.ij3WEonVHvEbazocopTSbke/lQe0HPm',
  'team_leader',
  'Team Lead - Lazada',
  NOW(),
  'lazada@local.test',
  'Lazada'
)
ON CONFLICT (username) DO NOTHING;
```

### Step 3: Verify Test Data
Run this query to verify all team leaders were created:

```sql
SELECT id, username, display_name, role, assigned_channel, email 
FROM users 
WHERE role = 'team_leader'
ORDER BY assigned_channel;
```

You should see 5 rows with team leaders for each channel.

---

## Phase 2: Login Testing

### Test Credentials

| Channel | Username | Password |
|---------|----------|----------|
| Warehouse Admin | tl_warehouse_001 | 2010404422 |
| TikTok | tl_tiktok_001 | 12345678 |
| Shopee | tl_shopee_001 | 2010404422 |
| Facebook | tl_facebook_001 | 12345678 |
| Lazada | tl_lazada_001 | 2010404422 |

### Steps to Test Login

1. **Navigate to Team Leader Login Page**
   - Go to: `http://localhost:3000/team-leader-login`

2. **Select a Channel**
   - Click the "Sales Channel" dropdown
   - Select "Warehouse Admin (Physical Store)"

3. **Enter Password**
   - Enter: `2010404422`

4. **Click Login**
   - You should be redirected to `/team-leader/dashboard`
   - You should see a success toast notification

### Expected Behavior

✅ **Success Response:**
- Redirected to dashboard
- Session stored in localStorage
- User info displayed in sidebar
- Can navigate to other team leader pages

❌ **Error Response:**
- Error message: "Invalid channel or credentials"
- Check that:
  - Role constraint was fixed
  - Test data was inserted correctly
  - Password is correct

---

## Phase 3: Dashboard Testing

### Dashboard Features to Test

1. **KPI Cards**
   - Total Orders
   - Completed Orders
   - Pending Orders
   - Total Revenue

2. **Real-time Updates**
   - KPIs should update every 5 seconds
   - Check browser console for API calls

3. **Channel Filtering**
   - All data should be filtered by assigned channel
   - Warehouse Admin user should only see Warehouse Admin orders

### Test Steps

1. Login as Warehouse Admin team leader
2. Navigate to Dashboard
3. Verify KPI cards display data
4. Wait 5 seconds and verify real-time updates
5. Check browser Network tab to see API calls to `/api/team-leader/dashboard/kpis`

---

## Phase 4: Other Pages Testing

### Track Orders Page
- Navigate to: `/team-leader/track-orders`
- Should show orders for assigned channel only
- Test search functionality
- Test order details view

### Packing Queue Page
- Navigate to: `/team-leader/packing-queue`
- Should show pending orders ready for packing
- Test "Pack" button to mark orders as packed

### Dispatch Page
- Navigate to: `/team-leader/dispatch`
- Should show packed orders ready for dispatch
- Test dispatch form (courier, tracking number)

### Inventory Alerts Page
- Navigate to: `/team-leader/inventory-alerts`
- Should show low stock alerts for assigned channel
- Test severity level filtering

### Settings Page
- Navigate to: `/team-leader/settings`
- Should show current user info
- Test password change functionality

---

## Phase 5: Troubleshooting

### Issue: "Invalid channel or credentials" Error

**Possible Causes:**
1. Role constraint not fixed
   - Run: `ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;`
   - Then: `ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'staff', 'operations', 'team_leader'));`

2. Test data not inserted
   - Run the INSERT statements from TEAM-LEADER-TEST-SETUP.sql

3. Wrong password
   - Double-check the password from the table above

4. Channel name mismatch
   - Verify channel name matches exactly: "Warehouse Admin", "TikTok", "Shopee", "Facebook", "Lazada"

### Issue: Dashboard Shows No Data

**Possible Causes:**
1. No orders in database for that channel
   - Insert sample orders using the SQL in TEAM-LEADER-TEST-SETUP.sql

2. API endpoint not working
   - Check browser Network tab for API errors
   - Check server logs for errors

3. Session not stored
   - Check localStorage in browser DevTools
   - Should have keys: `teamLeaderSession`, `x-team-leader-user-id`, `x-team-leader-channel`, `x-team-leader-role`

### Issue: Can't Access Other Pages

**Possible Causes:**
1. Session expired
   - Login again

2. Route guard not working
   - Check browser console for errors
   - Verify middleware is configured correctly

---

## Phase 6: Data Isolation Testing

### Verify Channel Data Isolation

1. **Login as Warehouse Admin**
   - Note the orders displayed

2. **Logout**
   - Click logout button in sidebar

3. **Login as TikTok**
   - Should see different orders (only TikTok channel)

4. **Verify Data Isolation**
   - Warehouse Admin should NOT see TikTok orders
   - TikTok should NOT see Warehouse Admin orders

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/team-leader-login` - Login
- `POST /api/auth/team-leader-logout` - Logout
- `POST /api/auth/team-leader-change-password` - Change password
- `GET /api/auth/channels` - Get available channels

### Dashboard
- `GET /api/team-leader/dashboard/kpis` - Get KPI data
- `GET /api/team-leader/dashboard/kpis/realtime` - Get real-time KPI updates

### Orders
- `GET /api/team-leader/orders` - List orders
- `GET /api/team-leader/orders/search` - Search orders
- `GET /api/team-leader/orders/[id]` - Get order details

### Packing
- `GET /api/team-leader/packing-queue` - Get packing queue
- `POST /api/team-leader/packing-queue/[id]/pack` - Mark as packed

### Dispatch
- `GET /api/team-leader/dispatch` - Get dispatch queue
- `POST /api/team-leader/dispatch/[id]/dispatch` - Dispatch order

### Inventory
- `GET /api/team-leader/inventory-alerts` - Get inventory alerts

### Staff Management
- `GET /api/admin/staff` - List staff
- `POST /api/admin/staff` - Add staff
- `PUT /api/admin/staff/[id]` - Update staff
- `DELETE /api/admin/staff/[id]` - Delete staff

---

## Next Steps

After successful testing:
1. Verify all pages load correctly
2. Test data isolation between channels
3. Test logout functionality
4. Test password change
5. Commit changes to git
6. Deploy to production

---

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review browser console for errors
3. Check server logs for API errors
4. Verify database migrations were applied
5. Verify test data was inserted correctly
