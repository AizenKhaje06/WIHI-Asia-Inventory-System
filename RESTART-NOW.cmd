@echo off
echo ========================================
echo RESTARTING DEV SERVER
echo ========================================
echo.
echo Step 1: Clearing Next.js cache...
rmdir /s /q .next 2>nul
echo Cache cleared!
echo.
echo Step 2: Starting dev server...
echo.
npm run dev
