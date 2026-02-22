@echo off
echo ========================================
echo FORCE REBUILD - Clearing Next.js Cache
echo ========================================
echo.

if exist .next (
    echo Deleting .next folder...
    rmdir /s /q .next
    echo Done!
) else (
    echo .next folder not found
)

if exist node_modules\.cache (
    echo Deleting node_modules\.cache folder...
    rmdir /s /q node_modules\.cache
    echo Done!
) else (
    echo node_modules\.cache folder not found
)

echo.
echo ========================================
echo Cache cleared! Starting dev server...
echo ========================================
echo.

npm run dev
