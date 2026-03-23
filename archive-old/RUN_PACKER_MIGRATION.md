# Run Packer Migration - Step by Step

## Problem
The database has a check constraint that only allows `admin`, `team_leader`, and `operations` roles. We need to add `packer` to the allowed roles.

## Solution - Run These 2 SQL Scripts in Order

### Step 1: Update Role Constraint
Run this in Supabase SQL Editor:

```sql
-- Drop the existing check constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new check constraint with packer role included
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'team_leader', 'operations', 'packer'));

-- Verify the constraint was updated
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'users'::regclass 
AND conname = 'users_role_check';
```

**Expected Result**: Should show the new constraint with all 4 roles.

### Step 2: Create Packer Account
After Step 1 succeeds, run this:

```sql
-- Create Packer Account
INSERT INTO users (id, username, password, role, display_name, email)
VALUES (
  gen_random_uuid(),
  'packer1',
  'pack789',
  'packer',
  'Packer 1',
  'packer1@example.com'
)
ON CONFLICT (username) DO UPDATE
SET 
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  display_name = EXCLUDED.display_name,
  email = EXCLUDED.email;

-- Verify the account was created
SELECT id, username, role, display_name, email, created_at
FROM users
WHERE username = 'packer1';
```

**Expected Result**: Should show the new packer1 account.

## Quick Copy-Paste

### Copy This First (Step 1):
```sql
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'team_leader', 'operations', 'packer'));
```

### Then Copy This (Step 2):
```sql
INSERT INTO users (id, username, password, role, display_name, email)
VALUES (gen_random_uuid(), 'packer1', 'pack789', 'packer', 'Packer 1', 'packer1@example.com')
ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role, display_name = EXCLUDED.display_name, email = EXCLUDED.email;
```

## Verify
After both steps, check the account:
```sql
SELECT * FROM users WHERE username = 'packer1';
```

You should see:
- username: `packer1`
- password: `pack789`
- role: `packer`
- display_name: `Packer 1`

## Test Login
1. Go to login page
2. Click "Packer" tab
3. Username: `packer1`
4. Password: `pack789`
5. Should redirect to `/packer/dashboard`

---

**Status**: Ready to run
**Files**: 
- `supabase/migrations/033_add_packer_role.sql` (Step 1)
- `CREATE_PACKER_ACCOUNT.sql` (Step 2)
