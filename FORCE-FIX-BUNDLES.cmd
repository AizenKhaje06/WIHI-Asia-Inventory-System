@echo off
echo ========================================
echo FORCE FIX - Bundle Creation Error
echo ========================================
echo.

echo Step 1: Killing ALL Node processes...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM next.exe 2>nul
timeout /t 2 /nobreak >nul
echo Done!
echo.

echo Step 2: Deleting .next cache...
if exist .next (
    rmdir /s /q .next
    echo Cache deleted!
) else (
    echo No cache found.
)
echo.

echo Step 3: Deleting node_modules/.cache...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo Module cache deleted!
) else (
    echo No module cache found.
)
echo.

echo Step 4: Starting fresh dev server...
echo.
echo IMPORTANT AFTER SERVER STARTS:
echo 1. Wait for "Ready in X.Xs" message
echo 2. Go to browser
echo 3. Press Ctrl+Shift+R (hard refresh)
echo 4. Open bundle dialog
echo 5. Fill in Bundle Name (REQUIRED!)
echo 6. Fill all other fields
echo 7. Try creating bundle
echo.
echo Starting server now...
echo.

npm run dev
