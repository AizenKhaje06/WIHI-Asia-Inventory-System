# Vercel Environment Variables Setup Guide

## Problem
Your Vercel deployment is failing with error: `Error: supabaseUrl is required.`

This happens because your `.env.local` file (which contains your Supabase credentials) is not pushed to GitHub and Vercel doesn't have access to these environment variables.

## Solution: Add Environment Variables to Vercel

### Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to: **Settings** → **API**
3. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - Keep this secret!

### Step 2: Add Environment Variables to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your project: `wihi-asia-inventory-system`
3. Go to **Settings** → **Environment Variables**
4. Add these variables one by one:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | Production, Preview, Development |
| `CRON_SECRET` | Any random string (e.g., `your-secret-123`) | Production, Preview, Development |
| `RESEND_API_KEY` | Your Resend API key (optional) | Production, Preview, Development |
| `RESEND_FROM_EMAIL` | Your sender email (optional) | Production, Preview, Development |

**Important:** 
- Check all three environments (Production, Preview, Development) for each variable
- Click "Save" after adding each variable

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add CRON_SECRET
```

### Step 3: Redeploy

After adding the environment variables:

1. Go to your Vercel project dashboard
2. Go to **Deployments** tab
3. Click the **three dots (...)** on the latest deployment
4. Click **Redeploy**
5. Make sure "Use existing Build Cache" is **UNCHECKED**
6. Click **Redeploy**

OR simply push a new commit to trigger automatic deployment:

```bash
git commit --allow-empty -m "trigger redeploy with env vars"
git push origin main
```

### Step 4: Verify Deployment

1. Wait for the deployment to complete (usually 1-2 minutes)
2. Check the deployment logs for any errors
3. Visit your deployed site to confirm it's working

## Required Environment Variables

### Minimum Required (for basic functionality):
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `CRON_SECRET` - Random secret for cron job security

### Optional (for email features):
- `RESEND_API_KEY` - For sending emails (get from https://resend.com)
- `RESEND_FROM_EMAIL` - Sender email address
- `NEXT_PUBLIC_APP_URL` - Your production URL (e.g., `https://your-app.vercel.app`)

## Security Notes

⚠️ **NEVER commit `.env.local` to Git!**
- It's already in `.gitignore`
- Contains sensitive credentials
- Each environment (local, Vercel) should have its own copy

⚠️ **Keep `SUPABASE_SERVICE_ROLE_KEY` secret!**
- Has full database access
- Only add to Vercel environment variables
- Never expose in client-side code

## Troubleshooting

### Build still failing after adding env vars?
1. Make sure you checked all three environments (Production, Preview, Development)
2. Redeploy WITHOUT using build cache
3. Check deployment logs for specific error messages

### Can't find environment variables in Vercel?
1. Make sure you're in the correct project
2. Check you have the right permissions (owner/admin)
3. Try refreshing the page

### Deployment succeeds but app doesn't work?
1. Check browser console for errors
2. Verify environment variables are set correctly
3. Make sure Supabase URL and keys are valid

## Next Steps

After successful deployment:
1. Test all features (login, inventory, orders, etc.)
2. Check that cron jobs are working (email reports)
3. Monitor Vercel logs for any runtime errors

---

**Need Help?**
- Check Vercel deployment logs for detailed error messages
- Verify Supabase credentials are correct
- Make sure all required environment variables are set
