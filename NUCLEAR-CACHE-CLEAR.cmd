@echo off
echo ========================================
echo  NUCLEAR CACHE CLEAR - CLEAR EVERYTHING
echo ========================================
echo.
echo This will clear:
echo   - Next.js build cache
echo   - npm cache
echo   - Service worker cache
echo   - Browser cache (instructions)
echo.
pause

echo [1/4] Stopping all Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo Done!

echo [2/4] Clearing Next.js cache...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache
echo Done!

echo [3/4] Clearing npm cache...
npm cache clean --force
echo Done!

echo [4/4] Service worker updated to v15...
echo Done!

echo.
echo ========================================
echo  CACHE CLEARED SUCCESSFULLY!
echo ========================================
echo.
echo IMPORTANT: Now do these steps:
echo.
echo 1. RESTART DEV SERVER:
echo    npm run dev
echo.
echo 2. CLEAR BROWSER CACHE:
echo    Press Ctrl + Shift + Delete
echo    Select: "Cached images and files"
echo    Time range: "All time"
echo    Click "Clear data"
echo.
echo 3. UNREGISTER SERVICE WORKER:
echo    a. Press F12 (open DevTools)
echo    b. Go to "Application" tab
echo    c. Click "Service Workers" on left
echo    d. Click "Unregister" for all workers
echo    e. Click "Clear storage" → "Clear site data"
echo.
echo 4. HARD REFRESH:
echo    Press Ctrl + Shift + R
echo.
echo 5. If still showing old design:
echo    Close ALL browser windows
echo    Reopen browser
echo    Go to localhost:3000
echo.
pause
