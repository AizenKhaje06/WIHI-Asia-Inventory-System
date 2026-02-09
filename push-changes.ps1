# Git commit and push script
Write-Host "Adding files..." -ForegroundColor Cyan
git add .

Write-Host "Committing changes..." -ForegroundColor Cyan
git commit -m "Fix: Day tab calendar day calculation + accurate comparison data + cleanup temp files

- Changed Day tab from rolling 24 hours to calendar day (00:00-23:59)
- Added yesterdaySales, lastWeekSales, lastMonthSales to API
- Updated frontend comparison logic for all tabs
- Updated TypeScript types
- Service worker cache v13
- Deleted 33 temporary MD files"

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push

Write-Host "Done!" -ForegroundColor Green
Read-Host "Press Enter to exit"
