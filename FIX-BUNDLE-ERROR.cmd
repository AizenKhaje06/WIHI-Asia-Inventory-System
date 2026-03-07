@echo off
echo ========================================
echo Bundle Creation Error - Quick Fix
echo ========================================
echo.

echo Step 1: Stopping Next.js server...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Step 2: Cleaning build cache...
if exist .next rmdir /s /q .next
echo Cache cleaned!

echo Step 3: Starting development server...
echo.
echo IMPORTANT: After server starts:
echo 1. Go to browser and refresh (Ctrl+Shift+R)
echo 2. Open bundle dialog
echo 3. Fill in ALL fields including Bundle Name
echo 4. Try creating bundle again
echo.
echo Starting server now...
echo.

npm run dev
