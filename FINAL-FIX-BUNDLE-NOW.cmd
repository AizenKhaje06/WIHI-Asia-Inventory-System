@echo off
echo ========================================
echo FINAL FIX - DELETE ALL CACHES
echo ========================================
echo.
echo This will delete ALL cache folders and restart
echo.
pause

echo.
echo Step 1: Deleting .next folder...
if exist .next (
    rmdir /s /q .next
    echo [OK] .next deleted
) else (
    echo [SKIP] .next not found
)

echo.
echo Step 2: Deleting node_modules\.cache...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo [OK] node_modules\.cache deleted
) else (
    echo [SKIP] node_modules\.cache not found
)

echo.
echo Step 3: Deleting node_modules\.turbo...
if exist node_modules\.turbo (
    rmdir /s /q node_modules\.turbo
    echo [OK] node_modules\.turbo deleted
) else (
    echo [SKIP] node_modules\.turbo not found
)

echo.
echo ========================================
echo ALL CACHES CLEARED!
echo ========================================
echo.
echo Now starting fresh server...
echo.
npm run dev
