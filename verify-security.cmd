@echo off
echo ========================================
echo Security Verification Script
echo ========================================
echo.

echo [1/5] Checking .gitignore...
findstr /C:".env.local" .gitignore >nul
if %errorlevel% equ 0 (
    echo ✓ .env.local is in .gitignore
) else (
    echo ✗ WARNING: .env.local NOT in .gitignore!
)
echo.

echo [2/5] Checking if .env.local exists...
if exist .env.local (
    echo ✓ .env.local exists
) else (
    echo ✗ WARNING: .env.local not found! Copy from .env.example
)
echo.

echo [3/5] Checking if .env.local is tracked by Git...
git ls-files .env.local 2>nul
if %errorlevel% equ 0 (
    echo ✗ DANGER: .env.local IS TRACKED BY GIT!
    echo   Run: git rm --cached .env.local
) else (
    echo ✓ .env.local is NOT tracked by Git
)
echo.

echo [4/5] Checking .env.example...
if exist .env.example (
    echo ✓ .env.example exists
) else (
    echo ✗ WARNING: .env.example not found!
)
echo.

echo [5/5] Checking for secrets in Git history...
git log --all --oneline -- .env.local 2>nul | find /c /v "" > temp.txt
set /p count=<temp.txt
del temp.txt
if %count% gtr 0 (
    echo ✗ WARNING: .env.local found in Git history!
    echo   Consider rotating your keys
) else (
    echo ✓ No .env.local in Git history
)
echo.

echo ========================================
echo Security Check Complete
echo ========================================
echo.
echo Next steps:
echo 1. Review docs/ENVIRONMENT_SECURITY_CHECKLIST.md
echo 2. Rotate Supabase keys if needed
echo 3. Test application locally
echo 4. Deploy to Vercel
echo.
pause
