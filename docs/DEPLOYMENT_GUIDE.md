# 🚀 Production Deployment Guide

## Complete guide to deploying your inventory system to production

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you've completed:

- [x] ✅ RLS enabled on Supabase
- [x] ✅ Passwords hashed with bcrypt
- [x] ✅ API routes protected
- [ ] ⏳ Environment variables secured
- [ ] ⏳ Production build tested
- [ ] ⏳ Domain configured (optional)

---

## 🎯 Deployment Options

### Option 1: Vercel (Recommended) ⭐
- **Pros:** Easiest, free tier, automatic deployments, built for Next.js
- **Cons:** None for your use case
- **Cost:** Free for hobby projects, $20/month for pro

### Option 2: Netlify
- **Pros:** Easy, free tier, good performance
- **Cons:** Slightly more complex Next.js setup
- **Cost:** Free for hobby projects

### Option 3: Self-Hosted (VPS)
- **Pros:** Full control, cheaper at scale
- **Cons:** Requires DevOps knowledge, more maintenance
- **Cost:** $5-20/month

**We'll use Vercel for this guide** (easiest and best for Next.js)

---

## 🚀 STEP-BY-STEP: Deploy to Vercel

### Step 1: Create Vercel Account (5 minutes)

1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub

### Step 2: Import Your Project (2 minutes)

1. Click "Add New..." → "Project"
2. Find your repository: `WIHI-Asia-Inventory-System`
3. Click "Import"

### Step 3: Configure Build Settings (1 minute)

Vercel will auto-detect Next.js. Verify these settings:

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

**Don't click Deploy yet!** We need to add environment variables first.

### Step 4: Add Environment Variables (5 minutes)

Click "Environment Variables" and add these:

#### Required Variables:

| Name | Value | Where to Get It |
|------|-------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | Supabase Dashboard → Settings → API (⚠️ Keep secret!) |

#### Optional Variables (if using Google Sheets):

| Name | Value |
|------|-------|
| `GOOGLE_SHEET_ID` | Your sheet ID |
| `GOOGLE_CLIENT_EMAIL` | Service account email |
| `GOOGLE_PRIVATE_KEY` | Private key (with \n for newlines) |

**Important:** 
- Make sure to select "Production", "Preview", and "Development" for all variables
- The `SUPABASE_SERVICE_ROLE_KEY` is sensitive - never expose it!

### Step 5: Deploy! (3-5 minutes)

1. Click "Deploy"
2. Wait for build to complete (3-5 minutes)
3. ✅ You'll get a URL like: `https://your-project.vercel.app`

### Step 6: Test Your Deployment (5 minutes)

1. Visit your Vercel URL
2. Test login as admin: `admin` / `admin123`
3. Test login as operations: `operations` / `ops456`
4. Test creating a product (admin only)
5. Test viewing products (both roles)
6. ✅ Everything should work!

---

## 🌐 Custom Domain Setup (Optional)

### If You Have a Domain:

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `inventory.yourcompany.com`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation (5-60 minutes)
5. ✅ Your app will be available at your custom domain with HTTPS!

### If You Don't Have a Domain:

- Use the free Vercel URL: `https://your-project.vercel.app`
- It's perfectly fine for beta testing and pilot customers
- You can add a custom domain later

---

## 🔒 Post-Deployment Security

### Step 1: Verify RLS is Active

1. Open browser console on your deployed site
2. Try to access Supabase directly:
```javascript
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient('YOUR_URL', 'YOUR_ANON_KEY')
const { data, error } = await supabase.from('inventory').delete().eq('id', 'test')
console.log(error) // Should show RLS policy violation
```
3. ✅ Should fail with RLS error

### Step 2: Verify API Protection

1. Try accessing API without login:
```
https://your-project.vercel.app/api/items
```
2. ✅ Should return: `{"error":"Unauthorized - Please login"}`

### Step 3: Test Role-Based Access

1. Login as operations staff
2. Try to create a product
3. ✅ Should fail with "Forbidden" error

---

## 📊 Monitoring & Analytics

### Vercel Analytics (Built-in)

1. Go to Vercel Dashboard → Your Project → Analytics
2. See:
   - Page views
   - Unique visitors
   - Top pages
   - Performance metrics

### Error Tracking (Recommended)

Install Sentry for error tracking:

```cmd
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Follow the wizard to set up error tracking.

---

## 🔄 Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:

1. Make changes locally
2. Commit and push:
```cmd
git add .
git commit -m "Your changes"
git push origin main
```
3. Vercel automatically builds and deploys
4. ✅ Changes live in 3-5 minutes!

### Preview Deployments

Every pull request gets a preview URL:
- Test changes before merging
- Share with team for review
- No impact on production

---

## 🐛 Troubleshooting

### Build Fails

**Error:** "Module not found"
**Solution:** Make sure all dependencies are in `package.json`
```cmd
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

### Environment Variables Not Working

**Error:** "Missing environment variable"
**Solution:** 
1. Check spelling in Vercel dashboard
2. Make sure variables are set for "Production"
3. Redeploy after adding variables

### API Routes Return 500

**Error:** "Internal server error"
**Solution:**
1. Check Vercel logs: Dashboard → Your Project → Deployments → Click deployment → View Function Logs
2. Look for error messages
3. Fix the issue and redeploy

### Login Doesn't Work

**Error:** Can't login after deployment
**Solution:**
1. Check that `SUPABASE_SERVICE_ROLE_KEY` is set
2. Verify passwords were migrated (run migration script)
3. Check browser console for errors

---

## 📈 Performance Optimization

### Enable Caching

Already configured in your code! The cache system will work automatically.

### Image Optimization

Use Next.js Image component:
```typescript
import Image from 'next/image'

<Image 
  src="/logo.png" 
  alt="Logo" 
  width={200} 
  height={50}
  priority
/>
```

### Database Optimization

1. Add indexes in Supabase:
```sql
CREATE INDEX idx_inventory_name ON inventory(name);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp);
```

2. Use connection pooling (already enabled in Supabase)

---

## 💰 Cost Breakdown

### Free Tier (Perfect for Beta):
- Vercel: Free (100GB bandwidth, unlimited requests)
- Supabase: Free (500MB database, 2GB bandwidth)
- **Total: $0/month** ✅

### Paid Tier (For Growth):
- Vercel Pro: $20/month (1TB bandwidth, priority support)
- Supabase Pro: $25/month (8GB database, 50GB bandwidth)
- **Total: $45/month**

### When to Upgrade:
- Vercel: When you exceed 100GB bandwidth/month
- Supabase: When you exceed 500MB database or need daily backups

---

## 🎯 Launch Checklist

Before announcing to customers:

### Technical:
- [ ] Deployed to Vercel
- [ ] Custom domain configured (optional)
- [ ] SSL/HTTPS working (automatic with Vercel)
- [ ] All features tested on production
- [ ] Error tracking set up (Sentry)
- [ ] Backups enabled (Supabase automatic backups)

### Security:
- [ ] RLS verified active
- [ ] API protection tested
- [ ] Passwords hashed
- [ ] Environment variables secured
- [ ] No secrets in Git history

### Business:
- [ ] Pricing decided
- [ ] Terms of service written
- [ ] Privacy policy written
- [ ] Support email set up
- [ ] Onboarding process defined

---

## 🚀 Going Live

### Soft Launch (Recommended):

1. **Week 1-2:** Invite 2-3 pilot customers
   - Label as "Beta"
   - Offer 50% discount
   - Ask for feedback

2. **Week 3-4:** Invite 5-10 more customers
   - Fix issues from pilot
   - Refine features
   - Gather testimonials

3. **Week 5+:** Public launch
   - Remove "Beta" label
   - Full price
   - Marketing push

### Hard Launch (Risky):

1. Announce publicly
2. Open to all customers
3. Hope nothing breaks 😅

**We recommend soft launch!**

---

## 📞 Support Resources

### Vercel Support:
- Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord
- Email: support@vercel.com

### Supabase Support:
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com
- GitHub: https://github.com/supabase/supabase

### Next.js Support:
- Docs: https://nextjs.org/docs
- Discord: https://nextjs.org/discord
- GitHub: https://github.com/vercel/next.js

---

## ✅ Success Metrics

Track these after launch:

### Week 1:
- [ ] 0 critical bugs
- [ ] 3+ pilot customers signed up
- [ ] 90%+ uptime

### Month 1:
- [ ] 10+ paying customers
- [ ] <1% error rate
- [ ] Positive feedback

### Month 3:
- [ ] 50+ paying customers
- [ ] Break even on costs
- [ ] Feature requests prioritized

---

## 🎉 You're Ready!

Your system is production-ready. Time to launch! 🚀

### Quick Deploy Command:

```cmd
# Make sure everything is committed
git add .
git commit -m "Production ready"
git push origin main

# Then go to vercel.com and click "Import Project"
```

---

**Created:** 2024
**Status:** Production Deployment Guide
**Next:** Launch to customers! 🎊
