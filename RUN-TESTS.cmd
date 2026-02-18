@echo off
echo ========================================
echo   WIHI Asia - Performance Testing
echo ========================================
echo.

:menu
echo Select test to run:
echo.
echo 1. Load Test (Normal load, 10 users)
echo 2. Stress Test (Find breaking point)
echo 3. Both Tests (Sequential)
echo 4. Exit
echo.
set /p choice="Enter choice (1-4): "

if "%choice%"=="1" goto loadtest
if "%choice%"=="2" goto stresstest
if "%choice%"=="3" goto both
if "%choice%"=="4" goto end
goto menu

:loadtest
echo.
echo Running Load Test...
echo.
node tests/load-test.js
echo.
pause
goto menu

:stresstest
echo.
echo Running Stress Test...
echo WARNING: This will generate high load!
echo.
pause
node tests/stress-test.js
echo.
pause
goto menu

:both
echo.
echo Running Both Tests...
echo.
echo [1/2] Load Test
node tests/load-test.js
echo.
echo Cooling down for 5 seconds...
timeout /t 5 /nobreak
echo.
echo [2/2] Stress Test
node tests/stress-test.js
echo.
pause
goto menu

:end
echo.
echo Tests completed. Goodbye!
timeout /t 2 /nobreak
