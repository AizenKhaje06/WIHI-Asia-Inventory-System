@echo off
echo ========================================
echo  QUICK COMMIT AND PUSH
echo ========================================
echo.

REM Get current date and time for commit message
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a:%%b)

echo Adding all changes...
git add .

echo.
echo Committing with timestamp...
git commit -m "Update: %mydate% %mytime%"

echo.
echo Pushing to GitHub...
git push

echo.
echo ========================================
echo  DONE! All changes committed and pushed
echo ========================================
pause
