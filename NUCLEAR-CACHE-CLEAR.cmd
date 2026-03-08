@echo off
echo ========================================
echo NUCLEAR CACHE CLEAR - COMPLETE RESET
echo ========================================
echo.

echo [1/6] Stopping any running Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/6] Deleting .next folder...
if exist .next (
    rmdir /s /q .next
    echo     ✓ .next deleted
) else (
    echo     ✓ .next not found
)

echo [3/6] Deleting node_modules cache folders...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo     ✓ node_modules\.cache deleted
) else (
    echo     ✓ node_modules\.cache not found
)

if exist node_modules\.turbo (
    rmdir /s /q node_modules\.turbo
    echo     ✓ node_modules\.turbo deleted
) else (
    echo     ✓ node_modules\.turbo not found
)

echo [4/6] Clearing npm cache...
call npm cache clean --force
echo     ✓ npm cache cleared

echo [5/6] Deleting temp files...
if exist %TEMP%\next-* (
    del /q /s %TEMP%\next-* 2>nul
    echo     ✓ Temp files cleared
) else (
    echo     ✓ No temp files found
)

echo [6/6] Waiting 3 seconds before restart...
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo CACHE CLEARED SUCCESSFULLY!
echo ========================================
echo.
echo Now starting development server...
echo.

call npm run dev
