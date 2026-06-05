# StrumCity Line & Dock - Local Server Launcher
# Double-click this file or run it in PowerShell.
# It will start the development server on port 3456 (required for the full app + dam data proxy).

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

Write-Host "Starting StrumCity Line & Dock local server..." -ForegroundColor Cyan
Write-Host "Project: $projectRoot" -ForegroundColor Gray
Write-Host ""

# Detect local IPv4 addresses (skip loopback and APIPA)
$allIPv4 = @( Get-NetIPAddress -AddressFamily IPv4 | 
    Where-Object { $_.IPAddress -notmatch '^(127\.|169\.254\.)' } |
    Select-Object -ExpandProperty IPAddress ) | Where-Object { $_ } | Sort-Object -Unique

# Prefer non-VPN LAN ranges (192.168.1.x , 10.x non-tunnel, etc.)
$vpnLike = '^(10\.100\.|10\.5\.|172\.16\.|192\.168\.100\.)'
$lanIPs = $allIPv4 | Where-Object { $_ -notmatch $vpnLike }

if (-not $lanIPs -or $lanIPs.Count -eq 0) {
    $lanIPs = $allIPv4
}

# Check for VPN adapters (NordVPN etc. often break localhost/LAN)
$vpnDetected = Get-NetAdapter | Where-Object { 
    $_.InterfaceDescription -like '*Nord*' -or 
    $_.InterfaceDescription -like '*VPN*' -or 
    $_.InterfaceDescription -like '*TAP*' -or 
    $_.InterfaceDescription -like '*TUN*' 
} | Where-Object { $_.Status -eq 'Up' }

Write-Host "Open in browser:" -ForegroundColor Green
Write-Host "  This PC:        http://localhost:3456" -ForegroundColor Green
if ($lanIPs) {
    $lanIPs | ForEach-Object { 
        Write-Host "  Phone on Wi-Fi: http://$_:3456" -ForegroundColor Green 
    }
} else {
    Write-Host "  Phone on Wi-Fi: http://<your-lan-ip>:3456  (run ipconfig to find it)" -ForegroundColor Green
}
Write-Host ""
Write-Host "Useful for UptimeRobot / monitoring:" -ForegroundColor Green
Write-Host "  Ping endpoint (lightweight): http://localhost:3456/ping  (returns 'StrumCity OK')" -ForegroundColor Green
Write-Host ""

if ($vpnDetected) {
    Write-Host "!!! WARNING: VPN adapter detected (NordVPN or similar is active)." -ForegroundColor Yellow
    Write-Host "    This frequently breaks localhost and LAN access from browsers/phones." -ForegroundColor Yellow
    Write-Host "    >>> Pause or disconnect NordVPN completely, then re-run this script. <<<" -ForegroundColor Red
    Write-Host ""
} else {
    Write-Host "(No VPN adapters detected right now - good.)" -ForegroundColor DarkGray
}

# One-time firewall rule (run this in an *Administrator* PowerShell if phones can't reach the LAN IP)
Write-Host ""
Write-Host "If phone on LAN still can't connect after disabling VPN:" -ForegroundColor Yellow
Write-Host "  Run this ONCE in an *Administrator* PowerShell window:" -ForegroundColor Yellow
Write-Host "  netsh advfirewall firewall add rule name=`"StrumCity-3456`" dir=in action=allow protocol=TCP localport=3456" -ForegroundColor Cyan
Write-Host ""

Write-Host "Press Ctrl+C in this window to stop the server." -ForegroundColor Yellow
Write-Host ""

# Prefer the Windows Python Launcher (py) which handles multiple Pythons correctly.
# Bare "python" often fails due to Microsoft Store stub.
try {
    py -3 server.py
} catch {
    Write-Host ""
    Write-Host "ERROR: Could not launch with 'py -3'." -ForegroundColor Red
    Write-Host "Try these in order:" -ForegroundColor Yellow
    Write-Host "  1. py -3 server.py" -ForegroundColor Yellow
    Write-Host "  2. python -3 server.py" -ForegroundColor Yellow
    Write-Host "  3. python server.py" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "If you see Microsoft Store popup, install the real Python from python.org or enable the 'py' launcher in Windows Features." -ForegroundColor Yellow
    Write-Host ""
    throw
}

# Keep the window open even if the server exits (so you can see any error messages)
Read-Host "Server stopped or exited. Press Enter to close this window..."

# If you see "python was not found" or similar, make sure the Python Launcher is installed
# (it usually is on Windows). Use 'py' not 'python'.
