@echo off
echo ========================================
echo FORCE REBUILD - Department Filtering Fix
echo ========================================
echo.

echo Step 1: Deleting .next folder...
if exist .next (
    rmdir /s /q .next
    echo ✓ .next folder deleted
) else (
    echo ✓ .next folder not found (already clean)
)
echo.

echo Step 2: Deleting node_modules/.cache...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo ✓ node_modules cache deleted
) else (
    echo ✓ node_modules cache not found
)
echo.

echo ========================================
echo REBUILD COMPLETE!
echo ========================================
echo.
echo Now run: npm run dev
echo.
echo Then:
echo 1. Open browser in INCOGNITO mode
echo 2. Go to http://localhost:3000
echo 3. Login as Carlo (Lazada)
echo 4. Check Track Orders page
echo.
pause
