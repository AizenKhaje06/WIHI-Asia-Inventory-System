$env:GIT_TERMINAL_PROMPT=0
Start-Process -FilePath "git" -ArgumentList "add ." -Wait -NoNewWindow
Start-Process -FilePath "git" -ArgumentList "commit","-m","Fix sidebar logo and text layout - balanced spacing" -Wait -NoNewWindow  
Start-Process -FilePath "git" -ArgumentList "push" -Wait -NoNewWindow
Write-Host "Git operations completed"
