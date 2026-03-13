# Restart Dev Server - Supabase Error Fix

## Issue
Supabase API error: "Invalid API key" or "500 error"

## Possible Causes
1. Environment variables not loaded properly
2. Dev server needs restart
3. Browser cache issue

## Solution

### Step 1: Stop the current dev server
Press `Ctrl + C` in your terminal

### Step 2: Clear Next.js cache
```cmd
rmdir /s /q .next
```

### Step 3: Restart dev server
```cmd
npm run dev
```

### Step 4: Hard refresh browser
- Chrome/Edge: `Ctrl + Shift + R`
- Or clear browser cache

## If Still Not Working

Check if `.env.local` file has the correct Supabase keys:
```env
NEXT_PUBLIC_SUPABASE_URL=https://rsvzbmhuckwndvqfhzml.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (should be a very long string)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (should be a very long string)
```

Get the correct keys from: https://app.supabase.com/project/rsvzbmhuckwndvqfhzml/settings/api

## Note
The card design changes did NOT cause this error. This is purely an environment variable / server restart issue.
