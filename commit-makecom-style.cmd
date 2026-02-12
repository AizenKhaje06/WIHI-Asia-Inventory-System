@echo off
cls
echo ========================================
echo COMMITTING MAKE.COM STYLE SIDEBAR
echo ========================================
echo.
echo Changes:
echo - Sidebar: 200px width (Make.com style)
echo - Collapsed: 88px with vertical layout
echo - Icon on top, text below (like Make.com)
echo - Settings icon in header
echo - "My Team" subtitle
echo - Removed tooltip, using vertical text
echo - Dashboard cards 20%% smaller
echo - Clean spacing and typography
echo.
echo ========================================
echo.

git add .
git commit -m "UI: Make.com style sidebar - 200px width, collapsed 88px vertical layout (icon top, text bottom), settings icon in header, My Team subtitle, dashboard 20%% compact, removed tooltips"
git push origin main

if %errorlevel% neq 0 (
    echo.
    echo Trying master branch...
    git push origin master
)

echo.
echo ========================================
echo COMMIT COMPLETE!
echo ========================================
echo.
pause
