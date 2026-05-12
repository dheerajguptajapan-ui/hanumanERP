@echo off
title Inventory Management System — Launcher
color 0A
cd /d "%~dp0"

echo.
echo  ============================================================
echo   Inventory Management ERP — Local Server
echo  ============================================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    color 0C
    echo  [ERROR] Node.js is not installed on this computer.
    echo.
    echo  Please download and install Node.js from:
    echo  https://nodejs.org/en/download/
    echo.
    echo  After installing, double-click this file again.
    echo.
    pause
    exit /b 1
)

:: Check if dist folder exists
if not exist "dist\" (
    echo  [INFO] Building the application for the first time...
    echo  This may take 1-2 minutes. Please wait.
    echo.
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo  [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
    call npm run build
    if %ERRORLEVEL% neq 0 (
        echo  [ERROR] Failed to build the application.
        pause
        exit /b 1
    )
    echo.
    echo  [OK] Build complete!
    echo.
)

:: Check if serve is available, install if not
npx serve --version >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo  [INFO] Installing local server tool...
    call npm install -g serve
)

echo  [OK] Starting server on http://localhost:3000
echo.
echo  The app will open in your browser automatically.
echo  Keep this window open while using the app.
echo  To stop, close this window or press Ctrl+C.
echo.
echo  ============================================================
echo.

:: Open browser after short delay
start "" /b cmd /c "timeout /t 2 >nul && start http://localhost:3000"

:: Start the server
npx serve dist -l 3000 -s
