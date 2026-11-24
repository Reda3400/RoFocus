$ErrorActionPreference = "Stop"

# Creates RoFocus shortcuts on the Desktop and Start Menu.

$Root = (Resolve-Path "$PSScriptRoot\..").Path
$Desktop = [Environment]::GetFolderPath("Desktop")
$StartMenu = Join-Path ([Environment]::GetFolderPath("StartMenu")) "Programs"

foreach ($dir in @($Desktop, $StartMenu)) {
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
}

$Icon = Join-Path $Root "public\favicon.ico"
if (-not (Test-Path $Icon)) { $Icon = "" }

$Wsh = New-Object -ComObject WScript.Shell
foreach ($dir in @($Desktop, $StartMenu)) {
    $lnk = Join-Path $dir "RoFocus.lnk"
    $shortcut = $Wsh.CreateShortcut($lnk)
    $shortcut.TargetPath = "cmd.exe"
    $shortcut.Arguments = "/c `"`"$Root\scripts\launch.bat`"`""
    $shortcut.WorkingDirectory = $Root
    $shortcut.Description = "Return to what matters"
    if ($Icon) { $shortcut.IconLocation = "$Icon,0" }
    $shortcut.Save()
}

Write-Host "RoFocus shortcut ready on the Desktop and in the Start Menu."
