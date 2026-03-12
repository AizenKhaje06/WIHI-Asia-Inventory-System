@echo off
echo ========================================
echo FORCE REDEPLOY - FIX VERCEL 404 ERROR
echo ========================================
echo.
echo This will force a clean rebuild on Vercel
echo to fix the missing Packing Queue page.
echo.
pause

echo.
echo Step 1: Adding all files...
git add .

echo.
echo Step 2: Creating commit...
git commit -m "Force rebuild - fix packing queue 404 error"

echo.
echo Step 3: Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo DONE! Now go to Vercel Dashboard:
echo ========================================
echo.
echo 1. Go to your Vercel project
echo 2. Click "Deployments"
echo 3. Click the 3 dots on latest deployment
echo 4. Click "Redeploy"
echo 5. UNCHECK "Use existing Build Cache"
echo 6. Click "Redeploy"
echo.
echo This will force a clean build without cache.
echo.
pause
