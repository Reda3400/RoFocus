@echo off
:: Creates RoFocus shortcuts on the Desktop and Start Menu.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-shortcut.ps1"
if errorlevel 1 (
    echo Failed to create shortcuts.
    pause
    exit /b 1
)
pause
