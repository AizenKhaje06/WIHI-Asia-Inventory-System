# Force Redeploy sa Vercel - Step by Step

## Problem
Vercel is still running OLD code even after git push. The API is expecting old field names (components, selling_price) instead of new ones (items, bundlePrice).

## Solution: Force Redeploy with Cache Clear

### Step 1: Go to Vercel Dashboard
1. Open https://vercel.com/dashboard
2. Click your project name
3. Go to "Deployments" tab

### Step 2: Redeploy Latest
1. Find the latest deployment (should be commit `bd91bc9`)
2. Click the 3 dots menu (⋯) on the right
3. Select "Redeploy"
4. **IMPORTANT**: Check ✅ "Use existing Build Cache" = OFF (unchecked)
5. Click "Redeploy"

### Step 3: Wait for Build
- Wait 2-3 minutes for build to complete
- Watch the build logs for any errors
- Look for "Build Completed" message

### Step 4: Verify Deployment
1. Click on the new deployment
2. Go to "Source" tab
3. Navigate to `app/api/bundles/route.ts`
4. Verify it shows the NEW code:
   ```typescript
   const { name, description, store, salesChannel, bundlePrice, items, badge } = body
   ```
   NOT the old code:
   ```typescript
   const { name, components, selling_price, store } = body
   ```

### Step 5: Hard Refresh Browser
After successful deployment:
1. Open your Vercel site
2. Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
3. Or open DevTools (F12) → Right-click Refresh → "Empty Cache and Hard Reload"

### Step 6: Test Bundle Creation
1. Go to Inventory page
2. Click "Create Bundle"
3. Fill in all fields
4. Add items
5. Set bundle price
6. Click "Create Bundle"
7. Should work now!

## If Still Failing

### Check Build Logs
1. Go to deployment in Vercel
2. Click "Building" tab
3. Look for errors in the logs
4. Common issues:
   - TypeScript errors
   - Missing dependencies
   - Build timeout

### Check Environment Variables
Make sure these are set in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Alternative: Trigger New Commit
If redeploy doesn't work, make a small change and push:
```cmd
echo. >> README.md
git add README.md
git commit -m "chore: trigger rebuild"
git push origin main
```

## Verification Checklist
- [ ] Vercel shows latest commit (bd91bc9)
- [ ] Build completed successfully
- [ ] Source code shows NEW API route
- [ ] Browser cache cleared
- [ ] Bundle creation works
- [ ] No "components" or "selling_price" errors

## Expected Result
After successful redeploy, bundle creation should work with:
- ✅ name
- ✅ store
- ✅ salesChannel
- ✅ bundlePrice
- ✅ items
- ✅ badge

NO MORE:
- ❌ category
- ❌ sku
- ❌ components
- ❌ selling_price
