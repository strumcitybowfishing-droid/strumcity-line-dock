# StrumCity Line & Dock - Local Server Launcher
# Double-click this file or run it in PowerShell.
# It will start the development server on port 3456 (required for the full app + dam data proxy).

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

Write-Host "Starting StrumCity Line & Dock local server..." -ForegroundColor Cyan
Write-Host "Project: $projectRoot" -ForegroundColor Gray
Write-Host ""
Write-Host "Open in browser:" -ForegroundColor Green
Write-Host "  This PC:        http://localhost:3456" -ForegroundColor Green
Write-Host "  Phone on Wi-Fi: http://192.168.1.65:3456 (or your current LAN IP)" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C in this window to stop the server." -ForegroundColor Yellow
Write-Host ""

py server.py

# If you see "python was not found" or similar, make sure the Python Launcher is installed
# (it usually is on Windows). Use 'py' not 'python'.
