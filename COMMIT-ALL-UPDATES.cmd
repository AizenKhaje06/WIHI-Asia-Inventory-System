@echo off
echo ========================================
echo COMMITTING VERTEX BRANDING UPDATE
echo ========================================
echo.

echo [1/3] Adding all files...
git add components/premium-sidebar.tsx
git add app/page.tsx
git add app/dashboard/reports/page.tsx
git add app/dashboard/inventory/page.tsx
git add app/dashboard/inventory/low-stock/page.tsx
git add app/dashboard/inventory/out-of-stock/page.tsx
git add app/dashboard/cancelled-orders/page.tsx
git add app/dashboard/sales-channels/page.tsx

echo [2/3] Committing changes...
git commit -m "Complete Vertex branding - sidebar and login page with dark mode support"

echo [3/3] Pushing to GitHub...
git push

echo.
echo ========================================
echo DONE! Vertex branding deployed
echo ========================================
pause
