@echo off
setlocal EnableDelayedExpansion

:: RoFocus Windows Launcher
:: Starts the Python server, opens the browser, and keeps running until the tab closes.

set "ROOT=%~dp0.."
pushd "%ROOT%"
set "ROOT=%CD%"
popd

set "PORT=4173"
if not "%REFOCUS_PORT%"=="" set "PORT=%REFOCUS_PORT%"
set "URL=http://localhost:%PORT%/"

if not exist "%ROOT%\dist\index.html" (
    echo RoFocus is not built yet. Run: npm install --ignore-scripts ^&^& npm run build
    pause
    exit /b 1
)

:: Windows usually installs Python as python.exe; python3 is only a fallback.
set "PY=python"
where python >nul 2>&1
if errorlevel 1 set "PY=python3"
where !PY! >nul 2>&1
if errorlevel 1 (
    echo Python 3 is required. Install it and add it to PATH.
    pause
    exit /b 1
)

:: Start Python server in the background
start "" /b "!PY!" "%ROOT%\scripts\serve.py" "%ROOT%\dist" "%PORT%"

:: Wait until the port is answering
set /a TRIES=0
:WAITLOOP
!PY! -c "import socket,sys; s=socket.socket(); s.settimeout(0.2); sys.exit(0 if s.connect_ex(('127.0.0.1', %PORT%)) == 0 else 1)" >nul 2>&1
if not errorlevel 1 goto READY
set /a TRIES+=1
if !TRIES! GEQ 30 goto NOSERVER
timeout /t 1 /nobreak >nul
goto WAITLOOP

:NOSERVER
echo RoFocus server did not start on port %PORT%.
pause
exit /b 1

:READY
:: Open browser
start "" "%URL%"

:: Keep the shortcut alive while the server is answering.
:MONITORLOOP
!PY! -c "import socket,sys; s=socket.socket(); s.settimeout(0.2); sys.exit(0 if s.connect_ex(('127.0.0.1', %PORT%)) == 0 else 1)" >nul 2>&1
if errorlevel 1 goto END
timeout /t 2 /nobreak >nul
goto MONITORLOOP

:END
exit /b 0
