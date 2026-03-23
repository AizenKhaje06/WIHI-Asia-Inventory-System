@echo off
echo ========================================
echo GitHub Commit - March 23, 2026
echo ========================================
echo.

echo Adding all changes to git...
git add .

echo.
echo Committing changes...
git commit -m "Complete date/time display fixes across all order tracking pages" -m "- Fixed Order Dispatch Form date defaulting to previous day (UTC issue)" -m "- Added time display to Packing Queue date column" -m "- Fixed Track Orders to show packed timestamp with time" -m "- Fixed Activity Logs timezone display" -m "- Added units sold count to Dashboard Revenue Overview" -m "- Added units sold count to Sales Analytics calendar" -m "- Renamed and swapped dashboard charts (Department/Store Performance)" -m "- Fixed data accuracy - both Dashboard and Analytics use orders table" -m "- All pages now show consistent MM/DD/YY HH:mm format" -m "- Removed explicit timezone parameters for natural conversion"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo Commit Complete!
echo ========================================
pause
