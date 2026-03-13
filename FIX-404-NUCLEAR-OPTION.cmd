@echo off
echo ========================================
echo NUCLEAR OPTION - FIX STUCK 404 ERROR
echo ========================================
echo.
echo This will:
echo 1. Add error boundaries
echo 2. Force clean commit
echo 3. Push to trigger rebuild
echo.
pause

echo.
echo Step 1: Adding all files (including new error handlers)...
git add .

echo.
echo Step 2: Creating commit...
git commit -m "Fix: Add error boundaries and force rebuild for packing-queue 404"

echo.
echo Step 3: Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo DONE! Now do this in Vercel:
echo ========================================
echo.
echo 1. Go to Vercel Dashboard
echo 2. Settings → General
echo 3. Scroll to "Build & Development Settings"
echo 4. Click "Clear Build Cache"
echo 5. Go to Deployments
echo 6. Click latest deployment → 3 dots → Redeploy
echo 7. UNCHECK "Use existing Build Cache"
echo 8. Click "Redeploy"
echo.
echo WAIT 3-5 MINUTES for build to complete
echo.
echo Then test:
echo - Clear browser cache (Ctrl+Shift+Delete)
echo - Open incognito window
echo - Go to /dashboard/packing-queue
echo.
pause
