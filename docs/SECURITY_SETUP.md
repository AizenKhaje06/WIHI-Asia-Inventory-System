# 🔒 Security Setup Guide

This guide walks you through setting up critical security features for production deployment.

## ⚠️ CRITICAL: Run These Steps Before Deployment

---

## Step 1: Enable Row Level Security (RLS)

### What is RLS?
Row Level Security prevents unauthorized direct database access. Without RLS, anyone with your Supabase anon key can read/write/delete data directly.

### How to Enable:

1. **Open Supabase SQL Editor**
   - Go to https://app.supabase.com
   - Select your project
   - Click "SQL Editor" in the left sidebar

2. **Run Migration 001**
   - Copy the contents of `supabase/migrations/001_enable_rls.sql`
   - Paste into SQL Editor
   - Click "Run"
   - Verify: All tables should show `rowsecurity = true`

3. **Run Migration 002**
   - Copy the contents of `supabase/migrations/002_create_policies.sql`
   - Paste into SQL Editor
   - Click "Run"
   - Verify: Run the verification query at the bottom

### Verification:
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check policies exist
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Expected Result:** All tables should have `rowsecurity = t` and multiple policies per table.

---

## Step 2: Secure Environment Variables

### Current Risk:
Your `.env.local` file contains sensitive keys that could be exposed.

### Actions Required:

1. **Verify .gitignore**
   ```bash
   # Check if .env.local is ignored
   git check-ignore .env.local
   ```
   
   If not ignored, add to `.gitignore`:
   ```
   .env.local
   .env*.local
   ```

2. **Rotate API Keys** (CRITICAL)
   
   Your current keys are exposed in this conversation. You MUST rotate them:
   
   **Supabase:**
   - Go to Project Settings > API
   - Click "Reset" on Service Role Key
   - Update `.env.local` with new key
   
   **Google Sheets:**
   - Go to Google Cloud Console
   - Create new service account
   - Download new private key
   - Update `.env.local`

3. **Create .env.example**
   ```bash
   # Copy structure without secrets
   cp .env.local .env.example
   # Edit .env.example and replace all values with placeholders
   ```

### Production Environment Variables:

When deploying to Vercel/Netlify, add these environment variables in the dashboard:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**DO NOT** commit actual keys to Git!

---

## Step 3: Password Hashing (Next Implementation)

### Current Risk:
Passwords are stored in plain text in the database.

### What We'll Implement:
- bcrypt password hashing
- Secure password comparison
- Password migration for existing users

**Status:** Implementation files will be created in next step.

---

## Step 4: API Route Protection (Next Implementation)

### Current Risk:
API routes have no authentication checks. Anyone can call them directly.

### What We'll Implement:
- Authentication middleware
- Role-based authorization
- Request validation

**Status:** Implementation files will be created in next step.

---

## 🚨 IMMEDIATE ACTIONS (Do This Now)

### Priority 1: RLS (30 minutes)
- [ ] Run migration 001_enable_rls.sql in Supabase
- [ ] Run migration 002_create_policies.sql in Supabase
- [ ] Verify RLS is enabled on all tables
- [ ] Test that direct database access is blocked

### Priority 2: Environment Security (15 minutes)
- [ ] Verify .env.local is in .gitignore
- [ ] Create .env.example template
- [ ] Rotate Supabase service role key
- [ ] Rotate Google service account key
- [ ] Update .env.local with new keys

### Priority 3: Git Security (5 minutes)
- [ ] Check Git history for exposed secrets
- [ ] If found, use git-filter-repo to remove them
- [ ] Force push cleaned history (if needed)

---

## Testing RLS

After enabling RLS, test that it works:

### Test 1: Direct Database Access Should Fail
```javascript
// This should NOT work anymore (will fail with RLS error)
const { data, error } = await supabase
  .from('inventory')
  .delete()
  .eq('id', 'some-id')

console.log(error) // Should show RLS policy violation
```

### Test 2: API Routes Should Still Work
```bash
# This should still work (uses service role key)
curl http://localhost:3000/api/items
```

---

## Security Checklist

Before deploying to production:

- [ ] RLS enabled on all tables
- [ ] Security policies created and tested
- [ ] .env.local in .gitignore
- [ ] All API keys rotated
- [ ] .env.example created
- [ ] No secrets in Git history
- [ ] Production environment variables configured
- [ ] Password hashing implemented (next step)
- [ ] API authentication implemented (next step)
- [ ] Security audit completed (final step)

---

## Need Help?

If you encounter issues:

1. **RLS Errors:** Check that service role key is set correctly
2. **Policy Errors:** Verify policies match your table structure
3. **API Errors:** Ensure you're using `supabaseAdmin` (service role) in API routes

## Next Steps

Once RLS is enabled and environment is secured:
1. Implement password hashing
2. Add API route protection
3. Run security tests
4. Deploy to production

---

**Last Updated:** 2024
**Status:** Phase 1 - Critical Security Implementation
