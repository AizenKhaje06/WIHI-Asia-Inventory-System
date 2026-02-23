$ErrorActionPreference = "Stop"

Write-Host "Adding files to git..." -ForegroundColor Cyan
git add app/dashboard/sales-channels/page.tsx

Write-Host "Committing changes..." -ForegroundColor Cyan
git commit -m "Fix sales channel icons - replace Next Image with img tag for custom PNG icons"

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push

Write-Host "Done!" -ForegroundColor Green
