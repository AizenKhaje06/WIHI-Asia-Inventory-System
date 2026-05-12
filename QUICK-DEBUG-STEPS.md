# Quick Debug Steps - Invalid Department Error

## Step 1: Check if Migration Ran

Go to Supabase SQL Editor and run:

```sql
SELECT id, username, password, role, display_name, assigned_channel 
FROM users 
WHERE role = 'operations';
```

**Expected Result**: Should show 5 rows (Facebook, TikTok, Lazada, Shopee, Physical Store)

**If NO ROWS**: Migration hasn't run yet. Run the migration:

```sql
-- Copy and paste the entire content from:
-- supabase/migrations/039_add_department_users.sql
```

---

## Step 2: Check Browser Console

1. Open browser (F12)
2. Go to Console tab
3. Try to login again
4. Look for logs that start with `[Department Auth]`

You should see:
```
[Department Auth] Request: { department: 'TikTok', passwordLength: 9 }
[Department Auth] Query result: { found: true, username: 'TikTok', role: 'operations', storedPassword: 'tiktok123' }
[Department Auth] Comparing passwords: { provided: 'tiktok123', stored: 'tiktok123', match: true }
```

---

## Step 3: Check Network Tab

1. Open browser (F12)
2. Go to Network tab
3. Try to login again
4. Look for request to `/api/departments/authenticate`
5. Click on it and check:
   - Request payload
   - Response

---

## Step 4: Manual Test via API

Open a new browser tab and paste this in the console:

```javascript
fetch('http://localhost:3000/api/departments/authenticate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    department: 'TikTok',
    password: 'tiktok123'
  })
})
.then(r => r.json())
.then(d => console.log('Result:', d))
```

**Expected Result**:
```json
{
  "success": true,
  "department": {
    "id": "dept_tiktok_...",
    "name": "TikTok",
    "display_name": "TikTok Department",
    "assigned_channel": "TikTok"
  }
}
```

---

## Common Issues

### Issue 1: Migration Not Run
**Solution**: Run the migration SQL in Supabase SQL Editor

### Issue 2: Wrong Supabase Connection
**Solution**: Check `.env.local` file - make sure SUPABASE_URL and SUPABASE_ANON_KEY are correct

### Issue 3: RLS (Row Level Security) Blocking Query
**Solution**: Check if RLS is enabled on users table and if there are policies blocking the query

To check RLS:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';
```

To temporarily disable RLS for testing:
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

---

## Quick Fix: Manual Insert

If migration keeps failing, manually insert one user for testing:

```sql
INSERT INTO users (id, username, password, role, display_name, assigned_channel) 
VALUES ('test_tiktok_001', 'TikTok', 'tiktok123', 'operations', 'TikTok Department', 'TikTok');
```

Then try logging in again.
