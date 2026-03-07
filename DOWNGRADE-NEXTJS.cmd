@echo off
echo ========================================
echo Downgrading Next.js to Fix 405 Error
echo ========================================
echo.

echo This will downgrade Next.js from 15.2.8 to 14.2.18 (stable)
echo.
pause

echo Step 1: Killing Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Step 2: Uninstalling Next.js 15.2.8...
npm uninstall next

echo Step 3: Installing Next.js 14.2.18...
npm install next@14.2.18

echo Step 4: Deleting caches...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo Step 5: Starting server...
npm run dev
