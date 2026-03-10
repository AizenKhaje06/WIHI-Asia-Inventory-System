# Team Leader Dashboard - Quick Start

## 🚀 Get Started in 3 Steps

### Step 1: Fix Database Constraint (1 minute)
Run this SQL in Supabase SQL Editor:

```sql
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'staff', 'operations', 'team_leader'));
```

### Step 2: Insert Test Data (1 minute)
Open `TEAM-LEADER-TEST-SETUP.sql` and run all the INSERT statements.

Or run this quick version:

```sql
INSERT INTO users (id, username, password, role, display_name, created_at, email, assigned_channel)
VALUES ('tl_warehouse_001', 'tl_warehouse_001', '$2b$10$SSf4LKItwQvoNPuPLEyhT.ij3WEonVHvEbazocopTSbke/lQe0HPm', 'team_leader', 'Team Lead - Warehouse', NOW(), 'warehouse@local.test', 'Warehouse Admin');

INSERT INTO users (id, username, password, role, display_name, created_at, email, assigned_channel)
VALUES ('tl_tiktok_001', 'tl_tiktok_001', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', 'team_leader', 'Team Lead - TikTok', NOW(), 'tiktok@local.test', 'TikTok');

INSERT INTO users (id, username, password, role, display_name, created_at, email, assigned_channel)
VALUES ('tl_shopee_001', 'tl_shopee_001', '$2b$10$SSf4LKItwQvoNPuPLEyhT.ij3WEonVHvEbazocopTSbke/lQe0HPm', 'team_leader', 'Team Lead - Shopee', NOW(), 'shopee@local.test', 'Shopee');

INSERT INTO users (id, username, password, role, display_name, created_at, email, assigned_channel)
VALUES ('tl_facebook_001', 'tl_facebook_001', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', 'team_leader', 'Team Lead - Facebook', NOW(), 'facebook@local.test', 'Facebook');

INSERT INTO users (id, username, password, role, display_name, created_at, email, assigned_channel)
VALUES ('tl_lazada_001', 'tl_lazada_001', '$2b$10$SSf4LKItwQvoNPuPLEyhT.ij3WEonVHvEbazocopTSbke/lQe0HPm', 'team_leader', 'Team Lead - Lazada', NOW(), 'lazada@local.test', 'Lazada');
```

### Step 3: Test Login (2 minutes)
1. Go to: `http://localhost:3000/team-leader-login`
2. Select Channel: **Warehouse Admin**
3. Enter Password: **2010404422**
4. Click **Login**

✅ You should be redirected to the dashboard!

---

## 📋 Test Credentials

| Channel | Username | Password |
|---------|----------|----------|
| Warehouse Admin | tl_warehouse_001 | 2010404422 |
| TikTok | tl_tiktok_001 | 12345678 |
| Shopee | tl_shopee_001 | 2010404422 |
| Facebook | tl_facebook_001 | 12345678 |
| Lazada | tl_lazada_001 | 2010404422 |

---

## 🔍 What to Test

### Dashboard (`/team-leader/dashboard`)
- ✅ KPI cards show data
- ✅ Real-time updates every 5 seconds
- ✅ Only shows data for assigned channel

### Track Orders (`/team-leader/track-orders`)
- ✅ Lists orders for assigned channel
- ✅ Search functionality works
- ✅ Can view order details

### Packing Queue (`/team-leader/packing-queue`)
- ✅ Shows pending orders
- ✅ Can mark orders as packed

### Dispatch (`/team-leader/dispatch`)
- ✅ Shows packed orders
- ✅ Can enter courier and tracking info

### Inventory Alerts (`/team-leader/inventory-alerts`)
- ✅ Shows low stock alerts
- ✅ Filtered by channel

### Settings (`/team-leader/settings`)
- ✅ Shows user info
- ✅ Can change password

---

## ❌ Troubleshooting

### "Invalid channel or credentials" Error
1. Check role constraint was fixed
2. Verify test data was inserted
3. Check password is correct
4. Verify channel name matches exactly

### No Data on Dashboard
1. Insert sample orders using TEAM-LEADER-TEST-SETUP.sql
2. Check browser Network tab for API errors
3. Check localStorage for session data

### Can't Access Pages
1. Make sure you're logged in
2. Check browser console for errors
3. Verify session is stored in localStorage

---

## 📚 Full Documentation

For detailed testing guide, see: `TEAM-LEADER-TESTING-GUIDE.md`

For complete SQL setup, see: `TEAM-LEADER-TEST-SETUP.sql`

---

## 🎯 Next Steps

After testing:
1. ✅ Verify all pages work
2. ✅ Test data isolation between channels
3. ✅ Test logout
4. ✅ Test password change
5. 📝 Commit changes
6. 🚀 Deploy

---

**Questions?** Check the full testing guide or review the spec files in `.kiro/specs/team-leader-dashboard/`
