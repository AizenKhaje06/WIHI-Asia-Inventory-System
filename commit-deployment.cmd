@echo off
echo Committing deployment files...
git add .
git commit -m "Add production deployment configuration and guides"
git push origin main
echo.
echo Done! Files pushed to GitHub.
pause
