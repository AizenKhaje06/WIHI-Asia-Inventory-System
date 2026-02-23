@echo off
echo ========================================
echo COMMITTING ALL CHANGES TO GITHUB
echo ========================================
echo.

echo [1/3] Adding all files...
git add -A

echo [2/3] Committing changes...
git commit -m "Fix sales channel icons - replace Next Image with img tag for custom PNG icons"

echo [3/3] Pushing to GitHub...
git push

echo.
echo ========================================
echo DONE! Changes pushed to GitHub
echo ========================================
pause
