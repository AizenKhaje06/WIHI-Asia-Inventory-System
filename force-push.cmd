@echo off
echo ========================================
echo FORCE PUSH - Overwriting GitHub Repository
echo ========================================
echo.
echo WARNING: This will REPLACE the GitHub repository
echo with your current local code!
echo.
pause

echo.
echo Step 1: Adding all changes...
git add .
if %errorlevel% neq 0 (
    echo ERROR: Failed to add files
    pause
    exit /b 1
)
echo ✓ Files added

echo.
echo Step 2: Creating commit...
git commit -m "Force update: Dashboard API fixes + comparison data fields"
if %errorlevel% neq 0 (
    echo Note: No changes to commit or commit failed
)

echo.
echo Step 3: Force pushing to GitHub...
git push origin main --force
if %errorlevel% neq 0 (
    echo ERROR: Force push failed
    echo Trying 'master' branch instead...
    git push origin master --force
    if %errorlevel% neq 0 (
        echo ERROR: Force push failed on both main and master
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo ✓ FORCE PUSH COMPLETE!
echo ========================================
echo.
echo Your local code has been pushed to GitHub
echo and has replaced the remote repository.
echo.
pause
