@echo off
cls
echo.
echo ========================================
echo   PUSHING TO GITHUB
echo ========================================
echo.
echo Adding all changes...
git add -A
echo.
echo Committing...
git commit -m "feat: Enhanced Revenue Chart and Staff Name tracking - Added enterprise-level Revenue Chart component - Fixed dashboard profit calculation - Added staff name to activity logs - Improved tooltip and comparison metrics - Added database migration for staff_name - Fixed currency formatting"
echo.
echo Pushing to GitHub...
git push origin main
echo.
echo ========================================
echo   DONE!
echo ========================================
echo.
pause
