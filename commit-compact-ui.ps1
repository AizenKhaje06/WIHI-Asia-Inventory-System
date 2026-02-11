# Git commit and push script for 80% compact UI
Write-Host "Adding files..." -ForegroundColor Cyan
git add .

Write-Host "Committing changes..." -ForegroundColor Cyan
git commit -m "UI: 80% compact view (20% size reduction across all components)

- Sidebar: width 256px->208px, collapsed 80px->64px, header 80px->64px
- Logo: 48px->40px, all text sizes reduced by ~20%
- StockSync text now shows in full (removed truncate)
- Dashboard: page header, 6 KPI cards, 4 quick stats cards all 20% smaller
- Quick Actions & Alerts section: buttons, text, spacing reduced
- All padding, margins, icons reduced by ~20%
- Layout margins adjusted to match new sidebar width"

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push

Write-Host "Done!" -ForegroundColor Green
