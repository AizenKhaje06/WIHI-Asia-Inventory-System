git add .
if ($LASTEXITCODE -eq 0) {
    git commit -m "Fix: Day tab calendar day calculation + accurate comparison data + cleanup temp files"
    if ($LASTEXITCODE -eq 0) {
        git push
    }
}
