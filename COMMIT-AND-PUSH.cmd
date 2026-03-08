@echo off
echo ========================================
echo COMMITTING BUNDLE VIRTUAL STOCK CHANGES
echo ========================================
echo.

git add .
git commit -m "feat: Add virtual stock calculation to bundles - Auto-calculate bundle quantity based on available component stock"
git push

echo.
echo ========================================
echo PUSHED TO GITHUB!
echo ========================================
echo.
echo Vercel will auto-deploy in a few minutes.
echo Check your Vercel dashboard for deployment status.
echo.
pause
