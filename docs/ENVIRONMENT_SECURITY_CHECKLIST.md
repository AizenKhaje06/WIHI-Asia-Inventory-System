# 🔒 Environment Security Checklist

## Overview
This checklist ensures your environment variables and secrets are properly secured before deployment.

---

## ✅ Step 1: Verify .gitignore Protection

Check that sensitive files are NOT committed to Git:

```bash
# Check if .env.local is ignored
git check-ignore .env.local
# Should output: .env.local

# Check Git history for exposed secrets
git log --all --full-history -- .env.local
# Should be empty or show only deletions
```

**Status**: ✅ `.env.local` is properly ignored in `.gitignore`

---

## ✅ Step 2: Verify .env.example is Complete

Your `.env.example` should contain:
- [x] Supabase URL (NEXT_PUBLIC_SUPABASE_URL)
- [x] Supabase Anon Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
- [x] Supabase Service Role Key (SUPABASE_SERVICE_ROLE_KEY)
- [x] Google Sheets ID (optional)
- [x] Google Service Account credentials (optional)
- [x] Clear instructions and notes

**Status**: ✅ `.env.example` is complete and documented

---

## ⚠️ Step 3: Rotate Supabase Keys (IMPORTANT)

Since your repository may have been public or shared, rotate your Supabase keys:

### 3.1 Rotate Service Role Key

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Under **Service Role Key**, click **Regenerate**
5. Copy the new key
6. Update `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_new_service_role_key
   ```

### 3.2 Rotate Anon Key (Optional but Recommended)

1. In the same API settings page
2. Under **Anon/Public Key**, click **Regenerate**
3. Copy the new key
4. Update `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_new_anon_key
   ```

**Why?** If your keys were ever committed to Git, they may be compromised.

---

## ⚠️ Step 4: Rotate Google Service Account Key (If Used)

If you're using Google Sheets integration:

### 4.1 Create New Service Account Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Select your project
3. Find your service account
4. Click **Keys** tab
5. Click **Add Key** → **Create new key**
6. Choose **JSON** format
7. Download the key file

### 4.2 Delete Old Key

1. In the Keys tab, find the old key
2. Click the three dots → **Delete**
3. Confirm deletion

### 4.3 Update .env.local

Extract values from the downloaded JSON:
```
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----\n"
```

---

## ✅ Step 5: Check Git History for Exposed Secrets

### 5.1 Search for Sensitive Patterns

```bash
# Search for Supabase keys
git log -p | grep -i "supabase"

# Search for Google keys
git log -p | grep -i "private_key"

# Search for .env files
git log --all --full-history -- .env*
```

### 5.2 If Secrets Found in History

**Option A: Remove from History (Recommended)**
```bash
# Install BFG Repo-Cleaner
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Remove .env.local from history
bfg --delete-files .env.local

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (WARNING: This rewrites history)
git push origin --force --all
```

**Option B: Rotate All Keys** (Easier)
- Just rotate all keys as described in Steps 3 & 4
- Old keys in history become useless

---

## ✅ Step 6: Verify Current .env.local

Check your current `.env.local` file:

```bash
# View file (be careful not to share output)
cat .env.local

# Check it's not tracked by Git
git status .env.local
# Should show: "nothing to commit"
```

**Checklist**:
- [ ] File exists and has all required variables
- [ ] All keys are filled in (no placeholders)
- [ ] Keys are the NEW rotated keys (not old ones)
- [ ] File is NOT tracked by Git
- [ ] File permissions are restrictive (not world-readable)

---

## ✅ Step 7: Set Up Vercel Environment Variables

When deploying to Vercel, you'll need to add environment variables:

### 7.1 Required Variables

Add these in Vercel Dashboard → Project → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 7.2 Optional Variables (if using Google Sheets)

```
GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_key\n-----END PRIVATE KEY-----\n"
```

**Important**: 
- Mark `SUPABASE_SERVICE_ROLE_KEY` as **Secret**
- Mark `GOOGLE_PRIVATE_KEY` as **Secret**
- Set environment to **Production, Preview, Development** (all)

---

## ✅ Step 8: Test Locally After Key Rotation

After rotating keys, test your application:

```bash
# Clear Next.js cache
rm -rf .next

# Restart development server
npm run dev
```

**Test**:
- [ ] Login works (admin/admin123)
- [ ] Can view inventory
- [ ] Can create/edit items (admin only)
- [ ] Can dispatch items
- [ ] Dashboard loads correctly

---

## ✅ Step 9: Security Best Practices

### 9.1 Never Commit Secrets

**Bad**:
```bash
git add .env.local  # ❌ NEVER DO THIS
```

**Good**:
```bash
# .env.local is already in .gitignore ✅
git add .env.example  # ✅ Template only
```

### 9.2 Use Different Keys for Different Environments

- **Development**: Use test/development keys
- **Production**: Use production keys
- **Never** use production keys in development

### 9.3 Rotate Keys Regularly

- Rotate keys every 90 days
- Rotate immediately if:
  - Keys are exposed
  - Team member leaves
  - Suspicious activity detected

### 9.4 Limit Key Permissions

- Use **Anon Key** for client-side (limited permissions)
- Use **Service Role Key** only server-side (full permissions)
- Never expose Service Role Key to client

---

## 📋 Final Checklist

Before deploying to production:

- [ ] `.env.local` is in `.gitignore`
- [ ] `.env.example` is complete and committed
- [ ] Supabase Service Role Key has been rotated
- [ ] Supabase Anon Key has been rotated (optional)
- [ ] Google Service Account Key has been rotated (if used)
- [ ] Git history checked for exposed secrets
- [ ] Old keys deleted/revoked
- [ ] New keys tested locally
- [ ] Application works with new keys
- [ ] Vercel environment variables ready to add
- [ ] Team members informed of key rotation

---

## 🚨 If Keys Are Compromised

If you suspect your keys have been compromised:

1. **Immediately rotate all keys** (Steps 3 & 4)
2. **Check Supabase logs** for suspicious activity
3. **Review database** for unauthorized changes
4. **Enable Supabase audit logs** (if not already enabled)
5. **Consider enabling 2FA** on Supabase account
6. **Notify team members**

---

## 📞 Support Resources

- **Supabase Security**: https://supabase.com/docs/guides/platform/security
- **Vercel Environment Variables**: https://vercel.com/docs/environment-variables
- **Google Cloud Security**: https://cloud.google.com/security/best-practices

---

## ✅ Status

**Current Status**: Environment security checklist created

**Next Steps**:
1. Rotate Supabase keys (if needed)
2. Rotate Google keys (if needed)
3. Test application with new keys
4. Proceed to deployment

**Estimated Time**: 30-45 minutes
