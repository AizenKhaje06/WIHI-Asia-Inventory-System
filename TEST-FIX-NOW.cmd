@echo off
echo ========================================
echo TEST THE REAL FIX
echo ========================================
echo.
echo The issue was PERMISSIONS, not caching!
echo.
echo I fixed lib/auth.ts - added packing-queue to admin permissions
echo.
echo ========================================
echo STEP 1: TEST LOCALLY
echo ========================================
echo.
echo 1. Stop your dev server (Ctrl+C if running)
echo 2. Run: npm run dev
echo 3. Login as admin
echo 4. Check sidebar - "Packing Queue" should appear
echo 5. Click it - should work
echo 6. Hard refresh - should still work
echo.
pause

echo.
echo ========================================
echo STEP 2: DEPLOY TO VERCEL
echo ========================================
echo.
echo Running git commands...
echo.

git add .
git commit -m "Fix: Add packing-queue to admin/operations permissions"
git push origin main

echo.
echo ========================================
echo DONE!
echo ========================================
echo.
echo Wait 2 minutes for Vercel to deploy
echo Then test on production
echo.
echo The fix is simple - just added the route to ROLE_PERMISSIONS
echo No cache clearing needed!
echo.
pause
