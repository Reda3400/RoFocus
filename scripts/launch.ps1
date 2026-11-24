$ErrorActionPreference = "Stop"

try {
    $Root = (Resolve-Path "$PSScriptRoot\..").Path
    $Port = if ($env:REFOCUS_PORT) { $env:REFOCUS_PORT } else { "4173" }
    $Url = "http://localhost:$Port/"

    if (-not (Test-Path "$Root\dist\index.html")) {
        throw "RoFocus is not built yet. Run: npm install --ignore-scripts; npm run build"
    }

    # Windows usually installs Python as python.exe; python3 is only a fallback.
    $PythonCmd = Get-Command python -CommandType Application -ErrorAction SilentlyContinue
    if (-not $PythonCmd) { $PythonCmd = Get-Command python3 -CommandType Application -ErrorAction SilentlyContinue }
    if (-not $PythonCmd) { throw "Python 3 is required. Install it and add it to PATH." }

# Start the Python server in the background using Start-Process
$ServerProcess = Start-Process $PythonCmd.Source -ArgumentList "`"$Root\scripts\serve.py`"", "`"$Root\dist`"", "$Port" -NoNewWindow -PassThru

# Ensure cleanup on exit
try {
    # Wait until the port is answering
    $sw = [Diagnostics.Stopwatch]::StartNew()
    $connected = $false
    while ($sw.ElapsedMilliseconds -lt 15000) {
        try {
            $client = New-Object Net.Sockets.TcpClient
            $client.Connect("127.0.0.1", [int]$Port)
            $client.Close()
            $connected = $true
            break
        } catch {
            Start-Sleep -Milliseconds 200
        }
    }

    if (-not $connected) {
        throw "RoFocus server did not start on port $Port."
    }

    # Open the browser
    Start-Process $Url

    # Wait while the server process is running
    while (-not $ServerProcess.HasExited) {
        Start-Sleep -Seconds 1
    }
}
finally {
    if ($ServerProcess -and -not $ServerProcess.HasExited) {
        Stop-Process -Id $ServerProcess.Id -Force -ErrorAction SilentlyContinue
    }
}
} catch {
    Write-Host $_ -ForegroundColor Red
    Read-Host "Press Enter to close"
    exit 1
}
