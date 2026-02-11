$response = Invoke-RestMethod -Uri "http://localhost:3001/api/dashboard?period=ID"

Write-Host "=== DASHBOARD API TEST ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "yesterdaySales: $($response.yesterdaySales)" -ForegroundColor $(if ($response.yesterdaySales -ne $null) { "Green" } else { "Red" })
Write-Host "lastWeekSales: $($response.lastWeekSales)" -ForegroundColor $(if ($response.lastWeekSales -ne $null) { "Green" } else { "Red" })
Write-Host "lastMonthSales: $($response.lastMonthSales)" -ForegroundColor $(if ($response.lastMonthSales -ne $null) { "Green" } else { "Red" })
Write-Host ""
Write-Host "salesVelocity: $($response.salesVelocity)" -ForegroundColor Yellow
Write-Host "revenueToday: $($response.revenueToday)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Total fields in response: $($response.PSObject.Properties.Count)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Last 5 fields:" -ForegroundColor Cyan
$response.PSObject.Properties | Select-Object -Last 5 | ForEach-Object {
    Write-Host "  $($_.Name): $($_.Value)"
}
