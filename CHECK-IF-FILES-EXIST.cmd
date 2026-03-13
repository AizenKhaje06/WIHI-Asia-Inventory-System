@echo off
echo ========================================
echo CHECKING IF PACKING QUEUE FILES EXIST
echo ========================================
echo.

echo Checking files...
echo.

if exist "app\dashboard\packing-queue\page.tsx" (
    echo [OK] page.tsx EXISTS
) else (
    echo [ERROR] page.tsx MISSING!
)

if exist "app\dashboard\packing-queue\error.tsx" (
    echo [OK] error.tsx EXISTS
) else (
    echo [WARN] error.tsx missing
)

if exist "app\dashboard\packing-queue\loading.tsx" (
    echo [OK] loading.tsx EXISTS
) else (
    echo [WARN] loading.tsx missing
)

if exist "app\dashboard\packing-queue\not-found.tsx" (
    echo [OK] not-found.tsx EXISTS
) else (
    echo [WARN] not-found.tsx missing
)

if exist "app\dashboard\packing-queue-new\page.tsx" (
    echo [OK] packing-queue-new EXISTS (test route)
) else (
    echo [INFO] packing-queue-new not created yet
)

echo.
echo ========================================
echo FILE CHECK COMPLETE
echo ========================================
echo.
echo If page.tsx EXISTS but still 404:
echo - It's a Vercel deployment issue
echo - Not a file missing issue
echo.
pause
