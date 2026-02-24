@echo off
echo Committing Activity Log timestamp fix...
git add app/dashboard/log/page.tsx
git commit -m "Fix Activity Log timestamp to match Transaction History - Added Asia/Manila timezone to date and time formatting - Removed unused imports - Now displays correct Philippines time"
git push
echo Done!
pause
