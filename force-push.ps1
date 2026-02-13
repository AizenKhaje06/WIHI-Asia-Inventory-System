Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FORCE PUSH - Overwriting GitHub Repository" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "WARNING: This will REPLACE the GitHub repository" -ForegroundColor Yellow
Write-Host "with your current local code!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to continue or Ctrl+C to cancel..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "Step 1: Adding all changes..." -ForegroundColor Cyan
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to add files" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✓ Files added" -ForegroundColor Green

Write-Host ""
Write-Host "Step 2: Creating commit..." -ForegroundColor Cyan
git commit -m "Force update: Dashboard API fixes + comparison data fields"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Note: No changes to commit or commit failed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 3: Force pushing to GitHub..." -ForegroundColor Cyan
git push origin main --force
if ($LASTEXITCODE -ne 0) {
    Write-Host "Trying 'master' branch instead..." -ForegroundColor Yellow
    git push origin master --force
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Force push failed on both main and master" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ FORCE PUSH COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your local code has been pushed to GitHub" -ForegroundColor Green
Write-Host "and has replaced the remote repository." -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit"
