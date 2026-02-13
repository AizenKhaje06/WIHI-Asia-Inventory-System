@echo off
cls
echo ========================================
echo COMMITTING 80%% COMPACT UI CHANGES
echo ========================================
echo.
echo Changes:
echo - Sidebar: 256px to 208px width
echo - Header: 80px to 64px height  
echo - Logo: 48px to 40px
echo - All text/padding/icons reduced 20%%
echo - StockSync text shows in full
echo - Dashboard cards all 20%% smaller
echo.
echo ========================================
echo.

git add .
git commit -m "UI: 80%% compact view (20%% size reduction) - Sidebar width 256px->208px, collapsed 80px->64px, header 80px->64px, logo 48px->40px, all text/padding/icons reduced 20%%, StockSync full text - Dashboard page header, 6 KPI cards, 4 quick stats, Quick Actions all 20%% smaller - Layout margins adjusted"
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
