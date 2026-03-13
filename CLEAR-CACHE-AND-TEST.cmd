@echo off
echo ========================================
echo CLEARING CACHE AND RESTARTING SERVER
echo ========================================
echo.

echo Step 1: Clearing .next build cache...
if exist .next (
    rmdir /s /q .next
    echo ✓ .next folder deleted
) else (
    echo ✓ .next folder not found (already clean)
)
echo.

echo Step 2: Instructions for testing...
echo.
echo GAWIN MO TO:
echo 1. Restart dev server: npm run dev
echo 2. Hard refresh browser: Ctrl + Shift + R
echo 3. Check Dashboard - "Inventory Value"
echo 4. Check Inventory - "Total Value"
echo 5. Dapat SAME NA SILA! (kasama na bundles)
echo.

echo ========================================
echo READY TO TEST!
echo ========================================
pause
