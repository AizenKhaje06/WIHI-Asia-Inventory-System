$file = "app\api\sales\route.ts"
$content = Get-Content $file -Raw

# Add staffName field before details in addLog calls
$content = $content -replace '(itemName: inventoryItem\.name,)\s+(details:)', '$1
            staffName: staffName || "Unknown",$2'

Set-Content $file -Value $content -NoNewline
Write-Host "Fixed! staffName field added to addLog calls"
