$ErrorActionPreference = "Stop"

$Root = Resolve-Path "$PSScriptRoot\.."
$Port = if ($env:REFOCUS_PORT) { $env:REFOCUS_PORT } else { "4173" }
$Url = "http://localhost:$Port/"

# Start the Python server in the background using Start-Process
$ServerProcess = Start-Process python3 -ArgumentList "`"$Root\scripts\serve.py`"", "`"$Root\dist`"", "$Port" -NoNewWindow -PassThru

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
        Write-Warning "Server did not start in time."
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
