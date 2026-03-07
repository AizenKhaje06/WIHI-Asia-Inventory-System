@echo off
echo ========================================
echo NUCLEAR FIX - Complete Reset
echo ========================================
echo.

echo Step 1: Killing ALL Node processes...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM next.exe 2>nul
taskkill /F /IM npm.exe 2>nul
timeout /t 3 /nobreak >nul
echo Done!
echo.

echo Step 2: Deleting ALL caches...
if exist .next (
    echo Deleting .next...
    rmdir /s /q .next
)
if exist node_modules\.cache (
    echo Deleting node_modules\.cache...
    rmdir /s /q node_modules\.cache
)
if exist .swc (
    echo Deleting .swc...
    rmdir /s /q .swc
)
echo All caches deleted!
echo.

echo Step 3: Touching route file to force recompilation...
copy /b app\api\bundles\route.ts +,,
echo Route file touched!
echo.

echo Step 4: Starting fresh dev server...
echo.
echo AFTER SERVER STARTS:
echo 1. Wait for "Ready in X.Xs"
echo 2. Browser: Ctrl+Shift+R (hard refresh)
echo 3. Try creating bundle
echo.
echo If it STILL shows 405 error, the issue is with Next.js itself.
echo You may need to upgrade Next.js or use a different approach.
echo.
echo Starting server now...
echo.

npm run dev
