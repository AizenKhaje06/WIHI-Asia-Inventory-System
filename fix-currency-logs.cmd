@echo off
echo ========================================
echo   Fix Currency Symbols in Logs
echo ========================================
echo.
echo This will replace $ with peso sign in all existing logs
echo.
pause
echo.
echo Running script...
npx tsx scripts/fix-currency-in-logs.ts
echo.
echo Done!
pause
