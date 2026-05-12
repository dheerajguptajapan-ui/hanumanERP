@echo off
title Installing HardwarePro ERP
color 0B
cd /d "%~dp0"

echo.
echo  ============================================================
1: echo   Installing HardwarePro ERP on Windows
echo  ============================================================
echo.

:: 1. Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    color 0C
    echo  [ERROR] Node.js is required to run this software.
    echo  Please install it from https://nodejs.org/
    pause
    exit /b 1
)

:: 2. Install Dependencies
echo  [1/4] Installing system dependencies...
call npm install --quiet
if %ERRORLEVEL% neq 0 (
    echo  [ERROR] Failed to install dependencies. Check your internet connection.
    pause
    exit /b 1
)

:: 3. Build the Application
echo  [2/4] Building application files...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo  [ERROR] Build failed.
    pause
    exit /b 1
)

:: 4. Create Desktop Shortcut
echo  [3/4] Creating Desktop Shortcut...
powershell -ExecutionPolicy Bypass -File "create_shortcut.ps1" "%~dp0"
if %ERRORLEVEL% neq 0 (
    echo  [WARNING] Could not create desktop shortcut automatically.
)

:: 5. Success
echo  [4/4] Finalizing installation...
echo.
echo  ============================================================
echo   SUCCESS! HardwarePro ERP is now installed.
echo  ============================================================
echo.
echo  - A shortcut has been created on your Desktop.
echo  - You can also run 'start.bat' to launch the app.
echo  - Keep this folder where it is; the shortcut points here.
echo.
echo  Press any key to launch the application now...
pause >nul

start "" /b cmd /c "start.bat"
exit
