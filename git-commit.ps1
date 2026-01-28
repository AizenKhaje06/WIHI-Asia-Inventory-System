git add .
if ($LASTEXITCODE -eq 0) {
    git commit -m "Fix sidebar logo and text layout - balanced spacing and sizing"
    if ($LASTEXITCODE -eq 0) {
        git push
    }
}
