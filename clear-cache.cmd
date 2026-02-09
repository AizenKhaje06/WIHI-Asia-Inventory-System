@echo off
echo Clearing Next.js cache and rebuilding...
echo.

echo Step 1: Deleting .next folder...
if exist .next (
    rmdir /s /q .next
    echo .next folder deleted!
) else (
    echo .next folder not found, skipping...
)

echo.
echo Step 2: Clearing npm cache...
npm cache clean --force

echo.
echo Step 3: Done! Now run: npm run dev
echo.
echo IMPORTANT: After starting the dev server:
echo 1. Open DevTools (F12)
echo 2. Go to Application tab
echo 3. Click "Service Workers"
echo 4. Click "Unregister" on all service workers
echo 5. Hard refresh: Ctrl + Shift + R
echo.
pause
