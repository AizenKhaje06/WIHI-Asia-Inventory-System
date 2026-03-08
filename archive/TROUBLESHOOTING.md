# Troubleshooting Guide

## Current Issue: Webpack Error

**Error:** `__webpack_require__.n is not a function`

### Quick Fixes (Try in order):

#### 1. Hard Refresh Browser ✅ TRY THIS FIRST
```
Press: Ctrl + Shift + R (Windows/Linux)
Or: Cmd + Shift + R (Mac)
```
This clears the browser cache and forces a fresh load.

#### 2. Clear Browser Data
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

#### 3. Clear Next.js Cache (Already Done)
```bash
# Delete .next folder
Remove-Item -Path ".next" -Recurse -Force

# Restart server
npm run dev
```

#### 4. Clear node_modules and Reinstall
```bash
# Stop server first
Remove-Item -Path "node_modules" -Recurse -Force
Remove-Item -Path "package-lock.json" -Force
npm install
npm run dev
```

#### 5. Check Browser Console
Open DevTools (F12) and look for:
- ✅ No hydration warnings
- ✅ No import errors
- ❌ Any red errors

---

## Common Issues & Solutions

### Issue: "Module not found" Error
**Solution:** Check import paths are correct
```typescript
// ✅ Correct
import { Component } from "@/components/component"

// ❌ Wrong
import { Component } from "components/component"
```

### Issue: Hydration Error
**Solution:** Check localStorage usage has SSR guards
```typescript
// ✅ Correct
if (typeof window !== 'undefined') {
  localStorage.setItem(key, value)
}

// ❌ Wrong
localStorage.setItem(key, value)
```

### Issue: Theme Not Working
**Solution:** Verify ThemeProvider in root layout
- Check `app/layout.tsx` has ThemeProvider
- Check `suppressHydrationWarning` on html tag

### Issue: API Slow
**Solution:** Check caching is working
- Look for "[Cache HIT]" in server logs
- First load should be slow
- Second load should be fast

---

## Server Commands

### Start Server
```bash
npm run dev
```

### Stop Server
```
Ctrl + C in terminal
```

### Restart Server
```bash
# Stop with Ctrl + C, then:
npm run dev
```

### Build for Production
```bash
npm run build
npm run start
```

---

## Debugging Steps

### 1. Check Server Logs
Look for:
- ✅ "Ready in Xms" - Server started
- ✅ "[Cache HIT]" - Caching working
- ❌ Error messages

### 2. Check Browser Console
Look for:
- ✅ No errors
- ✅ No warnings
- ❌ Hydration errors
- ❌ Import errors

### 3. Check Network Tab
Look for:
- ✅ API calls returning 200
- ✅ Fast response times (cached)
- ❌ 404 errors
- ❌ 500 errors

---

## Environment Variables

### Required Variables
```env
GOOGLE_CLIENT_EMAIL=your-email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-spreadsheet-id
```

### Check Variables Loaded
Server logs should show:
```
- Environments: .env.local
```

### If Variables Not Loading
1. Check `.env.local` exists in root
2. Restart server
3. Verify no typos in variable names

---

## Performance Checks

### API Caching Working?
**First Request:**
```
[Cache MISS] inventory-items - Fetching fresh data
GET /api/items 200 in 2000ms
```

**Second Request:**
```
[Cache HIT] inventory-items
GET /api/items 200 in 8ms
```

### Theme Working?
- Toggle dark/light mode
- No flash on page load
- Theme persists on refresh

### Authentication Working?
- Login successful
- Logout clears localStorage
- Remember Me works

---

## Known Issues

### 1. Webpack Hot Reload Error
**Symptom:** `__webpack_require__.n is not a function`  
**Cause:** Hot module replacement issue  
**Fix:** Hard refresh browser (Ctrl + Shift + R)

### 2. Google Sheets Deprecation Warnings
**Symptom:** "The `credentials` option is deprecated"  
**Impact:** None - just warnings  
**Fix:** Not needed - Google Sheets library issue

### 3. Next.js Outdated Warning
**Symptom:** "Next.js 15.2.8 (outdated)"  
**Impact:** None for development  
**Fix:** `npm update next` (optional)

---

## When to Ask for Help

If you've tried all the above and still have issues:

1. **Provide:**
   - Screenshot of error
   - Browser console logs
   - Server terminal logs
   - Steps to reproduce

2. **Check:**
   - Node version: `node --version` (should be 18+)
   - npm version: `npm --version`
   - Operating system

3. **Try:**
   - Different browser
   - Incognito mode
   - Different network

---

## Quick Health Check

Run these checks:

```bash
# 1. Check Node version
node --version  # Should be 18+

# 2. Check npm version
npm --version

# 3. Check if server is running
# Open: http://localhost:3000

# 4. Check environment variables
# Server logs should show: "Environments: .env.local"

# 5. Check for errors
# Browser console (F12) should have no red errors
```

---

## Success Indicators

✅ **Everything Working:**
- Server starts without errors
- Browser shows login page
- No console errors
- Theme switching works
- Login/logout works
- Dashboard loads fast (cached)
- No hydration warnings

---

## Emergency Reset

If nothing works, nuclear option:

```bash
# 1. Stop server (Ctrl + C)

# 2. Delete everything
Remove-Item -Path "node_modules" -Recurse -Force
Remove-Item -Path ".next" -Recurse -Force
Remove-Item -Path "package-lock.json" -Force

# 3. Reinstall
npm install

# 4. Restart
npm run dev

# 5. Hard refresh browser
# Ctrl + Shift + R
```

---

**Last Updated:** February 2, 2026  
**Status:** Ready to troubleshoot
