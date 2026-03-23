# 🚀 Run Migration 033 - Team Leader Role

## Quick Steps

### Option 1: Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Open: https://app.supabase.com
   - Select your project: `rsvzbmhuckwndvqfhzml`

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy & Paste Migration**
   - Copy the entire content from `supabase/migrations/033_add_team_leader_role.sql`
   - Paste into SQL Editor
   - Click "Run" button

4. **Verify Success**
   - Should see: "Success. No rows returned"
   - Check Table Editor → users → should see new `department_id` column

---

### Option 2: Using Supabase CLI (If installed)

```bash
# Make sure you're in project root
cd "C:\Users\Administrator\Documents\CURSOR PROJECTS\WIHI-Asia-Inventory-System"

# Run migration
supabase db push
```

---

## ✅ Verification Checklist

After running migration, verify:

### 1. Check Users Table
```sql
-- Run this in SQL Editor
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'department_id';
```

**Expected Result:**
```
column_name    | data_type
department_id  | uuid
```

### 2. Check Role Constraint
```sql
-- Run this in SQL Editor
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'users_role_check';
```

**Expected Result:**
Should include `'team_leader'` in the check clause

### 3. Check View Created
```sql
-- Run this in SQL Editor
SELECT * FROM team_members_by_department LIMIT 5;
```

**Expected Result:**
Should return rows (or empty if no team members yet)

---

## 🧪 Create Test Team Leader Account

After migration succeeds, create a test account:

```sql
-- 1. First, get a department ID (or create one if needed)
SELECT id, name FROM departments LIMIT 5;

-- 2. Create test team leader
-- Note: You'll need to hash the password first or use the app's signup
INSERT INTO users (
  username, 
  displayName, 
  role, 
  email,
  department_id,
  password
) VALUES (
  'teamleader1',
  'Team Leader Test',
  'team_leader',
  'teamleader@test.com',
  'YOUR_DEPARTMENT_ID_HERE',  -- Replace with actual department ID
  '$2a$10$YourHashedPasswordHere'  -- You'll need to hash 'leader456'
);
```

**Better Option:** Create team leader through Settings page after migration:
1. Login as admin
2. Go to Settings → User Management
3. Create new user with role "Team Leader"
4. Assign to department

---

## 🐛 Troubleshooting

### Error: "column already exists"
```sql
-- Check if column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'department_id';

-- If exists, skip to next step
```

### Error: "constraint already exists"
```sql
-- Drop old constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Re-run the constraint creation part
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'team_leader', 'staff', 'viewer'));
```

### Error: "view already exists"
```sql
-- Drop and recreate view
DROP VIEW IF EXISTS team_members_by_department;

-- Re-run the CREATE VIEW statement
```

---

## 📋 Migration Content Preview

```sql
-- Add department_id column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_users_department_id ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Update role constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'team_leader', 'staff', 'viewer'));

-- Create view
CREATE OR REPLACE VIEW team_members_by_department AS
SELECT 
  u.id,
  u.username,
  u.displayName,
  u.email,
  u.phone,
  u.role,
  u.department_id,
  d.name as department_name,
  u.created_at,
  u.last_login
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
WHERE u.role IN ('team_leader', 'staff');
```

---

## ✅ Success Indicators

After successful migration:
- ✅ No errors in SQL Editor
- ✅ `department_id` column exists in users table
- ✅ Role constraint includes 'team_leader'
- ✅ `team_members_by_department` view exists
- ✅ Can create user with role 'team_leader'

---

## 🎯 Next Steps After Migration

1. ✅ Migration complete
2. 🔄 Create test team leader account
3. 🔄 Test login with team leader
4. 🔄 Verify permissions work
5. 🔄 Update Track Orders page (view-only mode)
6. 🔄 Update Packing Queue page (view-only mode)

---

**Ready to run?** Copy the SQL from `supabase/migrations/033_add_team_leader_role.sql` and paste into Supabase SQL Editor!
