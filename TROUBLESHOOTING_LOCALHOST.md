# Troubleshooting "localhost not reachable" for StrumCity Line & Dock

This is the standard fix procedure for when `http://localhost:3456` (or LAN IP) doesn't work after starting the server.

## Most Common Causes (in order)
1. **NordVPN (or any VPN) active** — creates virtual adapters (10.100.x.x etc.) that break localhost and LAN access from browser/phone. **#1 cause on this machine.**
2. Server not actually running (wrong `python` vs `py`, or crashed).
3. Windows Firewall blocking (especially for phone on Wi-Fi/LAN; localhost sometimes affected too).
4. Using file:// or wrong URL (must use http://localhost:3456, server must be running).
5. Port conflict or old process.

## Step-by-Step Fix (Do This)

### 1. Pause/Disconnect VPN
- Right-click NordVPN tray icon → **Pause protection** (for 1h or more) **or Disconnect**.
- Verify: run `ipconfig` — you should **not** see 10.100.x.x or similar Nord adapter with IPv4.
- Re-run the launcher after this.

### 2. Use the Correct Launcher (in a normal PowerShell window)
```powershell
cd C:\Users\johnn\Documents\strumcity-line-dock
.\start-local-server.ps1
```
- Or manually: `py -3 server.py` (leave window open).
- **Never** use bare `python server.py` — it hits the Microsoft Store stub and does nothing.
- The script now auto-detects your LAN IP(s), warns about VPN, and prints firewall advice.

You should see in the server window:
```
StrumCity Line & Dock → http://localhost:3456
TRA dam discharge proxied at /api/tra/livingston
USGS river gauges (Trinity/Neches tabs) proxied at /api/usgs/iv/?...
```

### 3. Test Immediately
In **another** PowerShell window (server still running):
```powershell
curl.exe -I http://localhost:3456/ping
```
Expect: `HTTP/1.1 200 OK` ... `StrumCity OK`

Then open in browser: **http://localhost:3456**

For phone on same Wi-Fi: use the IP printed by the launcher (usually http://192.168.1.65:3456).

### 4. If Phone/LAN Still Fails (or localhost weird) — Add Firewall Rule
Run **once** in **Administrator** PowerShell:
```powershell
netsh advfirewall firewall add rule name="StrumCity-3456" dir=in action=allow protocol=TCP localport=3456
```
Then restart the server launcher (normal window).

Existing `python.exe` rules may only be for "Public" profile — the explicit port rule helps.

### 5. Verify Server is Listening
```powershell
netstat -ano | findstr :3456
```
Should show `LISTENING` on 0.0.0.0:3456 (and/or 127.0.0.1:3456).

Kill old instances if needed:
```powershell
taskkill /F /IM py.exe /T
taskkill /F /IM python.exe /T
```

### 6. Other Quick Checks
- Don't open `index.html` directly from Explorer — use http://...
- After PC restart: always re-run the launcher (no auto-start).
- If "py not found": the script will tell you; install Python from python.org (includes the `py` launcher).

## How This Was Fixed in Past Sessions
- VPN pause/disable.
- Explicit `py -3` + launcher script.
- Firewall rule via netsh for port 3456.
- Verified with `curl ... /ping` and direct browser test on localhost + LAN IP.
- Updated start-local-server.ps1 and README with warnings + dynamic IP.

## After It Works
Tell the AI "it works" (or paste successful curl/browser output), and it will save/update this file or the main README with the exact steps that succeeded this time.

Current known good IP (as of last check): 192.168.1.65 on Ethernet (VPN disconnected).

Server must stay running in its PowerShell window for the site (and river tabs / dam data) to work.

## Quick One-Liner to Start + Test (for AI/tool use)
```powershell
cd C:\Users\johnn\Documents\strumcity-line-dock; Start-Process py -ArgumentList '-3','server.py' -WorkingDirectory (Get-Location) -WindowStyle Minimized; Start-Sleep 3; curl.exe -I http://localhost:3456/ping
```

(Use the ps1 for normal use.)

This document created/updated to capture the repeatable fix.