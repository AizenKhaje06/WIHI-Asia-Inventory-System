@echo off
echo ========================================
echo COMMITTING 80%% COMPACT UI CHANGES
echo ========================================
echo.

git add .
git commit -m "UI: 80%% compact view (20%% size reduction) - Sidebar: 256px to 208px, header 80px to 64px, logo 48px to 40px, all text/padding/icons reduced 20%%, StockSync text full display - Dashboard: page header, 6 KPI cards, 4 quick stats, Quick Actions all 20%% smaller - Layout margins adjusted"
git push

echo.
echo ========================================
echo DONE!
echo ========================================
pause
