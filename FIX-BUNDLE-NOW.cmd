@echo off
echo ========================================
echo BUNDLE FIX - CACHE CLEAR
echo ========================================
echo.

echo Step 1: Stopping any running processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Step 2: Deleting .next folder...
if exist .next (
    rmdir /s /q .next
    echo .next deleted
) else (
    echo .next not found
)

echo Step 3: Deleting Turbopack cache...
if exist .next\cache (
    rmdir /s /q .next\cache
    echo Turbopack cache deleted
)

echo Step 4: Clearing npm cache...
call npm cache clean --force

echo Step 5: Deleting node_modules\.cache...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo node_modules cache deleted
)

echo.
echo ========================================
echo CACHE CLEARED SUCCESSFULLY!
echo ========================================
echo.
echo Next steps:
echo 1. Run: npm run dev
echo 2. Wait for server to start
echo 3. Press Ctrl+Shift+R in browser
echo 4. Test bundle creation
echo.
pause
