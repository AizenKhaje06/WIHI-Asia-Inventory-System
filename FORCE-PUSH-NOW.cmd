@echo off
echo ========================================
echo FORCE PUSH TO GITHUB
echo ========================================
echo.

git add .
git commit -m "Force update: Dashboard API fixes + comparison data fields"
git push origin main --force

if %errorlevel% neq 0 (
    echo.
    echo Trying master branch...
    git push origin master --force
)

echo.
echo ========================================
echo DONE!
echo ========================================
pause
