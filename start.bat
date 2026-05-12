@echo off
title HardwarePro ERP
color 0B
cd /d "%~dp0"

:: Check if build exists
if not exist "dist\" (
    echo [ERROR] Application not built. Please run 'INSTALL_ON_WINDOWS.bat' first.
    pause
    exit /b 1
)

echo Starting HardwarePro ERP...
echo URL: http://localhost:3000
echo (Keep this window open while using the app)

:: Open browser automatically
start "" /b cmd /c "timeout /t 2 >nul && start http://localhost:3000"

:: Serve the production build
npx serve dist -l 3000 -s
