# 📘 Supabase Migration Guide - Step by Step

## 🎯 Goal
Run migration 033 to add Team Leader role support to your database.

---

## 📍 Step-by-Step Instructions

### Step 1: Open Supabase Dashboard

1. Go to: **https://app.supabase.com**
2. Login with your account
3. Select project: **WIHI Asia Inventory System**
   - Project ID: `rsvzbmhuckwndvqfhzml`

---

### Step 2: Navigate to SQL Editor

```
Dashboard → Left Sidebar → SQL Editor → New Query
```

**Visual Path:**
```
🏠 Dashboard
  └─ 📝 SQL Editor (left sidebar)
      └─ ➕ New Query (top right button)
```

---

### Step 3: Copy Migration SQL

**Open this file in your project:**
```
supabase/migrations/033_add_team_leader_role.sql
```

**Copy ALL content** (Ctrl+A, Ctrl+C)

---

### Step 4: Paste and Run

1. **Paste** the SQL into the SQL Editor
2. **Click "Run"** button (bottom right)
3. **Wait** for execution (should take 1-2 seconds)

**Expected Output:**
```
✅ Success. No rows returned
```

---

### Step 5: Verify Migration

**Run this verification query:**

```sql
-- Check if department_id column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('department_id', 'role');
```

**Expected Result:**
```
column_name    | data_type | is_nullable
department_id  | uuid      | YES
role           | varchar   | NO
```

---

### Step 6: Check Role Constraint

```sql
-- Verify team_leader role is allowed
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname = 'users_role_check';
```

**Expected Result:**
Should show constraint with: `'admin', 'team_leader', 'staff', 'viewer'`

---

### Step 7: Test View Creation

```sql
-- Check if view was created
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_name = 'team_members_by_department';
```

**Expected Result:**
```
table_name                    | table_type
team_members_by_department    | VIEW
```

---

## ✅ Success Checklist

After running migration, you should have:

- [x] `department_id` column in users table
- [x] Updated role constraint with 'team_leader'
- [x] `team_members_by_department` view created
- [x] Indexes created for performance
- [x] No errors in SQL Editor

---

## 🧪 Create Test Account

### Option A: Using SQL (Quick)

1. **Get a department ID:**
```sql
SELECT id, name FROM departments LIMIT 5;
```

2. **Create team leader:**
```sql
INSERT INTO users (username, displayName, role, email, department_id, password)
VALUES (
  'teamleader1',
  'Team Leader Test',
  'team_leader',
  'teamleader@test.com',
  'PASTE_DEPARTMENT_ID_HERE',
  '$2a$10$rZ5zKZ5zKZ5zKZ5zKZ5zKeuqK5zKZ5zKZ5zKZ5zKZ5zKZ5zKZ5zK'
);
```

**Login Credentials:**
- Username: `teamleader1`
- Password: `leader456`

### Option B: Using Settings Page (Recommended)

1. Login as admin
2. Go to Settings → User Management
3. Click "Add User"
4. Fill in:
   - Username: `teamleader1`
   - Display Name: `Team Leader Test`
   - Role: `Team Leader`
   - Email: `teamleader@test.com`
   - Department: Select from dropdown
5. Save

---

## 🐛 Common Issues

### Issue 1: "column already exists"

**Solution:**
```sql
-- Check if column exists
SELECT column_name FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'department_id';

-- If it exists, migration already ran - skip to verification
```

### Issue 2: "constraint already exists"

**Solution:**
```sql
-- Drop and recreate
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'team_leader', 'staff', 'viewer'));
```

### Issue 3: "view already exists"

**Solution:**
```sql
-- Recreate view
DROP VIEW IF EXISTS team_members_by_department CASCADE;

-- Then re-run the CREATE VIEW statement from migration
```

---

## 🎯 What's Next?

After successful migration:

1. ✅ **Create test team leader account**
2. ✅ **Test login** with team leader credentials
3. ✅ **Verify sidebar** shows correct menu items
4. ✅ **Test permissions:**
   - Can access Warehouse Dispatch (edit)
   - Can access Packing Queue (view only)
   - Can access Track Orders (view only)
   - Cannot access Settings
   - Cannot access Internal Usage

5. 🔄 **Update UI pages** with view-only mode:
   - Track Orders page
   - Packing Queue page

---

## 📞 Need Help?

If you encounter any issues:

1. **Check Supabase Logs:**
   - Dashboard → Logs → Database Logs

2. **Verify Table Structure:**
```sql
\d users  -- Shows table structure
```

3. **Check Existing Data:**
```sql
SELECT username, role, department_id FROM users;
```

---

## 🎉 Success!

Once migration is complete:
- ✅ Database supports team leader role
- ✅ Department assignments enabled
- ✅ Permission system ready
- ✅ Ready to create team leader accounts

**Next:** Test the new role and update UI pages for view-only mode!
