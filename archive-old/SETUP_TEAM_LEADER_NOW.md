# 🚀 Team Leader Setup - Quick Guide

## ✅ Step 1: Run Migrations in Supabase

Go to Supabase SQL Editor and run these **5 migrations in order**:

### Migration 021: Add Team Leader Fields
```sql
-- Copy from: supabase/migrations/021_add_team_leader_fields.sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_channel VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'operations';
CREATE INDEX IF NOT EXISTS idx_users_assigned_channel ON users(assigned_channel);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_channel_role ON users(assigned_channel, role);
COMMENT ON COLUMN users.assigned_channel IS 'Sales channel assigned to team leader (Warehouse Admin, TikTok, Shopee, Facebook, Lazada)';
COMMENT ON COLUMN users.role IS 'User role: admin, operations, team_leader';
```

### Migration 022: Add Channel to Orders
```sql
-- Copy from: supabase/migrations/022_add_channel_to_orders.sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS sales_channel VARCHAR(50);
CREATE INDEX IF NOT EXISTS idx_orders_sales_channel ON orders(sales_channel);
COMMENT ON COLUMN orders.sales_channel IS 'Sales channel for the order (Warehouse Admin, TikTok, Shopee, Facebook, Lazada)';
```

### Migration 023: Create Inventory Alerts Table
```sql
-- Copy from: supabase/migrations/023_create_inventory_alerts_table.sql
CREATE TABLE IF NOT EXISTS inventory_alerts (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  store_id VARCHAR(50) NOT NULL,
  current_stock INTEGER NOT NULL,
  threshold INTEGER NOT NULL,
  channel VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_channel ON inventory_alerts(channel);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_store_id ON inventory_alerts(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_channel_store ON inventory_alerts(channel, store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_product_id ON inventory_alerts(product_id);
```

### Migration 024: Create Dispatch Tracking Table
```sql
-- Copy from: supabase/migrations/024_create_dispatch_tracking_table.sql
CREATE TABLE IF NOT EXISTS dispatch_tracking (
  id VARCHAR(50) PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL,
  dispatch_timestamp TIMESTAMP NOT NULL,
  tracking_info JSONB,
  channel VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_dispatch_tracking_order_id ON dispatch_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_dispatch_tracking_channel ON dispatch_tracking(channel);
CREATE INDEX IF NOT EXISTS idx_dispatch_tracking_order_channel ON dispatch_tracking(order_id, channel);
CREATE INDEX IF NOT EXISTS idx_dispatch_tracking_timestamp ON dispatch_tracking(dispatch_timestamp);
```

### Migration 025: Fix Role Constraint
```sql
-- Copy from: supabase/migrations/025_fix_users_role_constraint.sql
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'staff', 'operations', 'team_leader'));
```

---

## ✅ Step 2: Create Test Team Leader Accounts

Run this SQL in Supabase (from `TEAM-LEADER-TEST-SETUP.sql`):

```sql
-- Warehouse Admin Team Leader
INSERT INTO users (username, display_name, password, role, assigned_channel, created_at)
VALUES (
  'tl_warehouse_001',
  'Warehouse Admin Team Leader',
  '$2a$10$YourHashedPassword',  -- Hash of '2010404422'
  'team_leader',
  'Warehouse Admin',
  NOW()
);

-- TikTok Team Leader
INSERT INTO users (username, display_name, password, role, assigned_channel, created_at)
VALUES (
  'tl_tiktok_001',
  'TikTok Team Leader',
  '$2a$10$YourHashedPassword',  -- Hash of '12345678'
  'team_leader',
  'TikTok',
  NOW()
);

-- Shopee Team Leader
INSERT INTO users (username, display_name, password, role, assigned_channel, created_at)
VALUES (
  'tl_shopee_001',
  'Shopee Team Leader',
  '$2a$10$YourHashedPassword',  -- Hash of '2010404422'
  'team_leader',
  'Shopee',
  NOW()
);
```

**Note:** Check `TEAM-LEADER-TEST-SETUP.sql` for complete SQL with proper password hashes.

---

## ✅ Step 3: Test Login

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Go to Team Leader Login:**
   ```
   http://localhost:3000/team-leader-login
   ```

3. **Test Credentials:**
   - Channel: **Warehouse Admin**
   - Password: **2010404422**

4. **Click Login** - Should redirect to dashboard

---

## 📋 What You Get

### Pages Available:
- ✅ `/team-leader-login` - Login page
- ✅ `/team-leader/dashboard` - Dashboard with KPIs
- ✅ `/team-leader/track-orders` - Order tracking (view only)
- ✅ `/team-leader/packing-queue` - Packing queue (view only)
- ✅ `/team-leader/dispatch` - Warehouse dispatch (full access)
- ✅ `/team-leader/inventory-alerts` - Low stock alerts
- ✅ `/team-leader/settings` - Account settings

### Features:
- ✅ Channel-based data isolation
- ✅ Real-time dashboard updates
- ✅ Order management
- ✅ Packing queue (view only)
- ✅ Dispatch management (full access)
- ✅ Inventory alerts
- ✅ Password change

---

## 🧪 Testing Checklist

- [ ] Run all 5 migrations
- [ ] Create test accounts
- [ ] Login with Warehouse Admin
- [ ] Check dashboard loads
- [ ] Check KPI cards show data
- [ ] Navigate to all pages
- [ ] Test logout
- [ ] Login with different channel
- [ ] Verify data isolation

---

## 📚 Documentation

- **Quick Start:** `TEAM-LEADER-QUICK-START.md`
- **Testing Guide:** `TEAM-LEADER-TESTING-GUIDE.md`
- **Test Setup SQL:** `TEAM-LEADER-TEST-SETUP.sql`
- **Implementation Details:** `TEAM-LEADER-IMPLEMENTATION-COMPLETE.md`

---

## 🐛 Troubleshooting

### "Invalid channel or credentials"
- Check password is correct
- Verify test account was created
- Check assigned_channel matches exactly

### No data on dashboard
- Insert sample orders with sales_channel
- Check browser console for errors
- Verify session in localStorage

### Can't access pages
- Make sure you're logged in
- Check localStorage for session
- Verify role is 'team_leader'

---

## 🎯 Next Steps

1. ✅ Run migrations
2. ✅ Create test accounts
3. ✅ Test login and all pages
4. ✅ Verify data isolation works
5. ✅ Deploy to production

---

**Status:** Ready to Setup! 🚀

Follow the steps above to get the Team Leader Dashboard running.
