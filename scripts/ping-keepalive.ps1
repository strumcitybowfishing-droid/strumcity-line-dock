# StrumCity Line & Dock - Simple Keep-Alive / Local Ping Script
#
# Purpose:
# - Simulate UptimeRobot pings locally while developing (keeps localhost responsive in some scenarios).
# - Or run it against the LIVE URL as a backup "robot" if you can't/don't want to use UptimeRobot right now.
# - Pings every 5 minutes (300 seconds) by default — matches UptimeRobot free tier.
#
# Usage:
#   1. Open a PowerShell window (separate from the server one).
#   2. cd to the project folder.
#   3. .\scripts\ping-keepalive.ps1
#
# To target LIVE site (recommended for keeping Render awake):
#   Edit the $url below to https://strumcity-line-dock.onrender.com/ping
#
# To run minimized / at startup:
#   - Right-click the .ps1 → Run with PowerShell (or create a shortcut with -WindowStyle Hidden)
#   - Or use Task Scheduler (Action: powershell.exe -File "full\path\to\ping-keepalive.ps1" , trigger: At log on, Run whether user is logged on or not).
#
# Stops with Ctrl+C.

$targetUrl = "https://strumcity-line-dock.onrender.com/ping"   # Change to http://localhost:3456/ping for local-only testing
$intervalSeconds = 300   # 5 minutes — same as UptimeRobot free plan. Use 600 (10 min) if you want to be extra gentle.
$timeoutSeconds = 15

Write-Host "StrumCity ping-keepalive starting..." -ForegroundColor Cyan
Write-Host "Target: $targetUrl" -ForegroundColor Gray
Write-Host "Interval: every $intervalSeconds seconds (Ctrl+C to stop)" -ForegroundColor Gray
Write-Host ""

while ($true) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    try {
        $response = Invoke-WebRequest -Uri $targetUrl -UseBasicParsing -TimeoutSec $timeoutSeconds -ErrorAction Stop
        if ($response.StatusCode -eq 200 -and $response.Content -match "StrumCity") {
            Write-Host "[$timestamp] OK - $($response.StatusCode) - $($response.Content.Trim())" -ForegroundColor Green
        } else {
            Write-Host "[$timestamp] Unexpected response: $($response.StatusCode) - $($response.Content)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "[$timestamp] FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }

    Start-Sleep -Seconds $intervalSeconds
}