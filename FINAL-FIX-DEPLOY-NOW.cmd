@echo off
echo ========================================
echo FINAL FIX - DEPLOY NOW
echo ========================================
echo.
echo Fixed 2 issues:
echo 1. Permissions - Added packing-queue to ROLE_PERMISSIONS
echo 2. Build Error - Added 'use client' to loading/not-found
echo.
pause

echo.
echo Deploying all fixes...
echo.

git add .
git commit -m "Fix: Packing queue permissions and build errors"
git push origin main

echo.
echo ========================================
echo DONE!
echo ========================================
echo.
echo Changes deployed:
echo - lib/auth.ts (permissions)
echo - app/dashboard/packing-queue/loading.tsx ('use client')
echo - app/dashboard/packing-queue/not-found.tsx ('use client')
echo.
echo Wait 2-3 minutes for Vercel to build and deploy
echo.
echo Then test:
echo 1. Login as admin
echo 2. Check sidebar - "Packing Queue" should appear
echo 3. Click it - should load
echo 4. Hard refresh - should work
echo.
pause
