@echo off
setlocal EnableDelayedExpansion

:: Put RoFocus shortcut on the Windows Desktop and Start Menu Programs folder.

set "ROOT=%~dp0.."
pushd "%ROOT%"
set "ROOT=%CD%"
popd

set "DESKTOP=%USERPROFILE%\Desktop"
set "STARTMENU=%APPDATA%\Microsoft\Windows\Start Menu\Programs"

for %%D in ("%DESKTOP%" "%STARTMENU%") do (
    if not exist "%%~D" mkdir "%%~D"
)

set "LNK_DESKTOP=%DESKTOP%\RoFocus.lnk"
set "LNK_START=%STARTMENU%\RoFocus.lnk"

:: Create shortcut using PowerShell WScript.Shell (using PNG favicon since Windows shortcuts prefer .ico or .png over .svg)
powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%LNK_DESKTOP%'); $s.TargetPath = 'cmd.exe'; $s.Arguments = '/c \"\"%ROOT%\scripts\launch.bat\"\"'; $s.WorkingDirectory = '%ROOT%'; $s.Description = 'Return to what matters'; $s.IconLocation = '%ROOT%\public\favicon.png,0'; $s.Save()"

powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%LNK_START%'); $s.TargetPath = 'cmd.exe'; $s.Arguments = '/c \"\"%ROOT%\scripts\launch.bat\"\"'; $s.WorkingDirectory = '%ROOT%'; $s.Description = 'Return to what matters'; $s.IconLocation = '%ROOT%\public\favicon.png,0'; $s.Save()"

echo RoFocus shortcut created successfully on the Desktop and Start Menu with the app icon!
pause
