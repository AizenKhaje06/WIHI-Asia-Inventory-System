@echo off
echo ========================================
echo   Committing Dashboard Enhancements
echo ========================================
echo.

git add -A

echo.
echo Committing changes...
git commit -m "feat: Enhanced Revenue Chart and Staff Name tracking - Added enterprise-level Revenue Chart component with period comparison - Fixed dashboard profit calculation (sales costs only) - Added staff name tracking to activity logs - Created dashboard utilities for data aggregation - Improved tooltip with sales/restock breakdown - Added migration for staff_name column in logs - Fixed currency formatting to use peso sign - Updated comparison metrics with better UX"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo   Done!
echo ========================================
pause
