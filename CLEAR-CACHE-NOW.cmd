@echo off
echo ========================================
echo  CLEARING ALL CACHES
echo ========================================
echo.

echo [1/3] Stopping dev server...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/3] Clearing Next.js cache...
if exist .next rmdir /s /q .next
echo Next.js cache cleared!

echo [3/3] Clearing npm cache...
npm cache clean --force
echo npm cache cleared!

echo.
echo ========================================
echo  CACHE CLEARED SUCCESSFULLY!
echo ========================================
echo.
echo Now restart your dev server:
echo   npm run dev
echo.
echo Then open browser and press:
echo   Ctrl + Shift + R (hard refresh)
echo.
pause
