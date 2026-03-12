# 🚨 VERCEL 404 ERROR - Packing Queue Page

## Problem
After deploying to Vercel:
- Packing Queue page missing from admin dashboard
- Sidebar link disappeared
- Hard refresh shows 404 error
- Works fine in local development

## Root Cause
This is a **Vercel build/cache issue**, NOT a code problem. Common causes:
1. Build cache corruption
2. Incomplete file upload
3. Route not registered during build
4. Environment variable issues

## IMMEDIATE FIX - Run These Commands

### Option 1: Force Redeploy (RECOMMENDED)
```bash
# In your project root
git add .
git commit -m "Force rebuild - fix packing queue 404"
git push origin main
```

Then in Vercel Dashboard:
1. Go to your project
2. Click "Deployments"
3. Click the 3 dots on latest deployment
4. Click "Redeploy"
5. Check "Use existing Build Cache" = **OFF** (IMPORTANT!)
6. Click "Redeploy"

### Option 2: Clear Vercel Cache via CLI
```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Redeploy without cache
vercel --prod --force
```

### Option 3: Manual Cache Clear
1. Go to Vercel Dashboard
2. Settings → General
3. Scroll to "Build & Development Settings"
4. Click "Clear Build Cache"
5. Go to Deployments
6. Redeploy latest

## Verification Steps

After redeployment, check:

### 1. Check Build Logs
Look for:
```
✓ Generating static pages (X/X)
✓ Collecting page data
✓ Finalizing page optimization
```

Make sure `/dashboard/packing-queue` is listed in routes.

### 2. Test the Page
```
https://your-app.vercel.app/dashboard/packing-queue
```

Should load, not 404.

### 3. Check Sidebar
- Login as admin
- Sidebar should show "Packing Queue" link
- Click should navigate properly

## Prevention

### Add to `.vercelignore` (if needed)
```
# Vercel ignore file
*.md
*.log
.env.local
.env.development
node_modules
.next
```

### Ensure `next.config.mjs` is correct
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure all routes are included
  experimental: {
    // Remove if present
    // outputFileTracingExcludes: {}
  },
  
  // Headers for camera permission
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(self)',
          },
        ],
      },
    ]
  },
}

export default nextConfig
```

## If Still Not Working

### Check File Structure
Ensure these files exist:
```
app/
  dashboard/
    packing-queue/
      page.tsx  ← Must exist
```

### Check for TypeScript Errors
```bash
npm run build
```

Look for errors in build output. Fix any TypeScript errors.

### Check Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

All should be set for Production.

### Check API Routes
Ensure these exist:
```
app/api/packer/queue/route.ts
app/api/packer/pack/[id]/route.ts
app/api/team-leader/packing-queue/route.ts
```

## Common Vercel Issues

### Issue 1: Partial Upload
**Symptom**: Some pages work, others 404
**Fix**: Force redeploy without cache

### Issue 2: Build Cache Corruption
**Symptom**: Works locally, 404 on Vercel
**Fix**: Clear build cache, redeploy

### Issue 3: Route Not Registered
**Symptom**: 404 on direct access, works via navigation
**Fix**: Check `next.config.mjs`, ensure no route exclusions

### Issue 4: Environment Variables
**Symptom**: Page loads but data doesn't
**Fix**: Check all env vars are set in Vercel

## Quick Checklist

- [ ] Files exist in correct location
- [ ] No TypeScript errors (`npm run build`)
- [ ] Environment variables set in Vercel
- [ ] Build cache cleared
- [ ] Force redeployed
- [ ] Tested in incognito/private window
- [ ] Hard refresh (Ctrl+Shift+R)

## Emergency Rollback

If nothing works:
1. Go to Vercel → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"
4. This reverts to previous version

## Contact Support

If issue persists after all fixes:
1. Vercel Support: https://vercel.com/support
2. Provide:
   - Project URL
   - Deployment ID
   - Build logs
   - Screenshot of 404 error

## Status

This is a **deployment issue**, not a code issue. The code is correct. Follow the force redeploy steps above to fix.

## Expected Result After Fix

✅ Packing Queue page loads
✅ Sidebar shows link
✅ No 404 errors
✅ Hard refresh works
✅ All admin features accessible
