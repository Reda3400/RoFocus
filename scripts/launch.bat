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

:: Start Python server in the background
start /b python3 "%ROOT%\scripts\serve.py" "%ROOT%\dist" "%PORT%" >nul 2>&1

:: Wait until the port is answering
:WAITLOOP
python -c "import socket; s = socket.socket(); s.settimeout(0.2); exit(0 if s.connect_ex(('127.0.0.1', %PORT%)) == 0 else 1)" >nul 2>&1
if errorlevel 1 (
    timeout /t 1 /nobreak >nul
    goto WAITLOOP
)

:: Open browser
start "" "%URL%"

:: Keep script running (the server dies when the browser tab closes thanks to serve.py heartbeat)
:: We can just ping/wait or loop until python server dies, or let user close window.
:: Actually, in Windows batch, `start /b` runs in the same console window. If we want the console window
:: to close automatically when the server exits, we can wait for the server process or python.
:: Since serve.py exits when the tab closes, let's watch for serve.py / python process or loop checking port.

:MONITORLOOP
python -c "import socket; s = socket.socket(); s.settimeout(0.2); exit(0 if s.connect_ex(('127.0.0.1', %PORT%)) == 0 else 1)" >nul 2>&1
if errorlevel 1 (
    goto END
)
timeout /t 2 /nobreak >nul
goto MONITORLOOP

:END
exit /b 0
