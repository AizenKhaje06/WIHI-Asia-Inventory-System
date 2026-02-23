@echo off
echo ========================================
echo COMMITTING GRADIENT HEADER UPDATES
echo ========================================
echo.

echo [1/3] Adding files...
git add app/dashboard/reports/page.tsx
git add app/dashboard/inventory/page.tsx
git add app/dashboard/inventory/low-stock/page.tsx
git add app/dashboard/inventory/out-of-stock/page.tsx
git add app/dashboard/cancelled-orders/page.tsx
git add app/dashboard/sales-channels/page.tsx

echo [2/3] Committing changes...
git commit -m "Update page headers with gradient text - Reports, Inventory, Low Stock, Out of Stock, Cancelled Orders, and Sales Channels"

echo [3/3] Pushing to GitHub...
git push

echo.
echo ========================================
echo DONE! All changes pushed to GitHub
echo ========================================
pause
