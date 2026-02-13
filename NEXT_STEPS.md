# 🎯 Next Steps - Environment Security

## Current Status
✅ Phase 1 Security Complete (8.5/10)
- Row Level Security enabled
- Passwords hashed with bcrypt
- All API routes protected
- Code committed and pushed to GitHub

## What's Next: Environment Security

Before deploying to production, we need to secure your environment variables and rotate any potentially exposed keys.

---

## Quick Start (30-45 minutes)

### Step 1: Run Security Verification
```bash
verify-security.cmd
```

This will check:
- ✓ .env.local is properly ignored
- ✓ .env.local exists
- ✓ .env.local is not tracked by Git
- ✓ No secrets in Git history

### Step 2: Review Checklist
Open and follow: `docs/ENVIRONMENT_SECURITY_CHECKLIST.md`

### Step 3: Rotate Keys (If Needed)

**When to rotate:**
- If your repository was ever public
- If you shared your code with others
- If you're unsure about key security
- As a best practice before production

**What to rotate:**
1. Supabase Service Role Key (REQUIRED if exposed)
2. Supabase Anon Key (OPTIONAL but recommended)
3. Google Service Account Key (if using Google Sheets)

### Step 4: Test Locally
```bash
# Clear cache
rm -rf .next

# Start dev server
npm run dev
```

Test:
- Login works
- Can view inventory
- Can create/edit items
- Can dispatch items
- Dashboard loads

### Step 5: Prepare for Deployment

Once keys are secured and tested:
1. Add environment variables to Vercel
2. Deploy to production
3. Test in production

---

## Detailed Instructions

### Option A: Quick Path (If Keys Are Secure)

If you're confident your keys were never exposed:

1. Run `verify-security.cmd`
2. If all checks pass, proceed to deployment
3. Skip key rotation

**Time**: 5 minutes

### Option B: Full Security Path (Recommended)

If you want maximum security or keys may have been exposed:

1. Run `verify-security.cmd`
2. Follow `docs/ENVIRONMENT_SECURITY_CHECKLIST.md`
3. Rotate all keys
4. Test application
5. Proceed to deployment

**Time**: 30-45 minutes

---

## Key Rotation Quick Guide

### Supabase Service Role Key

1. Go to https://app.supabase.com
2. Select your project
3. Settings → API
4. Under "Service Role Key", click "Regenerate"
5. Copy new key
6. Update `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_new_key
   ```

### Supabase Anon Key

1. Same page as above
2. Under "Anon/Public Key", click "Regenerate"
3. Copy new key
4. Update `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_new_key
   ```

### Google Service Account (if used)

1. Go to https://console.cloud.google.com/iam-admin/serviceaccounts
2. Select your service account
3. Keys tab → Add Key → Create new key
4. Download JSON
5. Delete old key
6. Update `.env.local` with new values

---

## After Key Rotation

### Test Locally
```bash
npm run dev
```

Login and test all features:
- ✓ Authentication works
- ✓ Inventory management
- ✓ POS/Dispatch
- ✓ Reports and analytics

### Commit Changes (if any)
```bash
git add docs/ENVIRONMENT_SECURITY_CHECKLIST.md
git add verify-security.cmd
git add NEXT_STEPS.md
git commit -m "Add environment security checklist and verification"
git push origin main
```

---

## Deployment Preparation

Once environment is secured:

### 1. Prepare Vercel Environment Variables

Have these ready to add in Vercel:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Optional (if using Google Sheets):
```
GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 2. Deploy to Vercel

```bash
# Option A: Deploy via Vercel CLI
npm install -g vercel
vercel

# Option B: Deploy via Vercel Dashboard
# 1. Go to vercel.com
# 2. Import GitHub repository
# 3. Add environment variables
# 4. Deploy
```

### 3. Test Production

After deployment:
- ✓ Login works
- ✓ All features functional
- ✓ No console errors
- ✓ Data loads correctly

---

## Troubleshooting

### "Supabase connection failed"
- Check SUPABASE_SERVICE_ROLE_KEY is correct
- Verify Supabase project is active
- Check RLS policies are enabled

### "Authentication failed"
- Verify passwords were migrated (run `node scripts/migrate-passwords.js`)
- Check NEXT_PUBLIC_SUPABASE_ANON_KEY is correct
- Try logging in with: admin/admin123

### "Google Sheets error"
- Verify GOOGLE_PRIVATE_KEY has proper newlines (\n)
- Check service account has access to sheet
- Ensure GOOGLE_SHEET_ID is correct

---

## Timeline

### Today (30-45 minutes)
1. Run security verification (5 min)
2. Review checklist (10 min)
3. Rotate keys if needed (15-20 min)
4. Test locally (10 min)

### Next Session (30 minutes)
1. Set up Vercel account
2. Add environment variables
3. Deploy to production
4. Test and verify

---

## Support

If you need help:
1. Check `docs/ENVIRONMENT_SECURITY_CHECKLIST.md`
2. Review `docs/DEPLOYMENT_GUIDE.md`
3. Check Supabase logs for errors
4. Verify all environment variables are set

---

## Summary

**Current Phase**: Environment Security
**Next Phase**: Production Deployment
**Security Score**: 8.5/10 (Beta-Ready)
**Estimated Time**: 30-45 minutes

**Action Required**: Run `verify-security.cmd` and follow the checklist!
