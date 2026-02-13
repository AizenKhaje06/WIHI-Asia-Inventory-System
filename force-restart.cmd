@echo off
echo ========================================
echo FORCE RESTART - Killing all Node processes
echo ========================================

echo.
echo Step 1: Killing all Node.js processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✓ Node processes killed
) else (
    echo ✓ No Node processes found
)

echo.
echo Step 2: Waiting for processes to terminate...
timeout /t 2 /nobreak >nul

echo.
echo Step 3: Deleting .next folder...
if exist .next (
    rmdir /s /q .next
    echo ✓ .next folder deleted
) else (
    echo ✓ .next folder doesn't exist
)

echo.
echo Step 4: Deleting node_modules/.cache...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo ✓ node_modules/.cache deleted
) else (
    echo ✓ node_modules/.cache doesn't exist
)

echo.
echo ========================================
echo CLEANUP COMPLETE!
echo ========================================
echo.
echo Now starting dev server...
echo.

npm run dev
