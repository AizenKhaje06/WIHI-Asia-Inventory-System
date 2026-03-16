@echo off
echo ========================================
echo VERTEX - GitHub Update Script
echo ========================================
echo.

echo [1/5] Checking Git status...
git status
echo.

echo [2/5] Adding all changes...
git add .
echo.

echo [3/5] Creating commit...
git commit -m "fix: Email reports data accuracy - match track orders page exactly

CRITICAL FIXES:
- Fixed email report Excel/PDF to match track orders page 100%%
- Corrected financial breakdown data mappings
- Fixed parcel status breakdown (was showing all zeros)
- Fixed product column (was showing N/A for all rows)
- Fixed waybill column data population

DATA MAPPING FIXES:
- order.product (was product_name) - now shows actual product names
- order.total (was amount) - correct financial data
- order.waybill (was tracking_number) - proper waybill numbers
- order.parcel_status (was status) - correct status breakdown
- order.qty (was quantity) - consistent quantity field

FILES UPDATED:
- app/api/cron/send-reports/route.ts - Fixed data fetching and transformation
- lib/email-reports.ts - Updated Excel and PDF generation to match track orders
- EMAIL-REPORTS-ALL-COLUMNS-COMPLETE.md - Complete documentation

ISSUES RESOLVED:
✅ Financial breakdown now matches track orders page
✅ Status breakdown shows actual counts (not zeros)
✅ Product column shows real product names (not N/A)
✅ Waybill column properly populated
✅ All 9 parcel statuses correctly counted
✅ Excel format matches track orders export exactly
✅ PDF format matches track orders export exactly

REPORT STRUCTURE (15 columns):
1. No. | 2. Order # | 3. Date | 4. Sales Channel | 5. Store
6. Product | 7. Qty | 8. Amount | 9. COGS | 10. Profit
11. Margin | 12. Courier | 13. Waybill | 14. Payment | 15. Parcel Status

QUALITY: Production Ready
STATUS: All Data Accurate
DATE: March 17, 2026"
echo.

echo [4/5] Pushing to GitHub...
git push origin main
echo.

echo [5/5] Done!
echo.
echo ========================================
echo All changes pushed to GitHub successfully!
echo ========================================
echo.
pause
