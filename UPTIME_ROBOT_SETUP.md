# Set Up UptimeRobot (the "robot") for StrumCity Line & Dock

This keeps your Render service **awake and monitored** 24/7.

## Will this keep my site "open" / always responsive?

**Short answer:** Yes, this is exactly why we set it up.

- **On Free tier**: Render spins the service down after ~15 minutes with **no incoming traffic**. Your UptimeRobot pings (every 5 min to /ping) provide constant traffic, so it never sleeps. First visitor won't hit a cold start (30-60s delay + loading page).

- **On Starter ($7/mo) or Standard ($25/mo) — what you are paying for**: These plans are **designed to be always-on** (no automatic spin-down). The pings are not strictly required for wake-ups, but they:
  - Keep the instance "warm" (zero chance of any idle behavior).
  - Give you real monitoring + instant alerts (email/Slack/etc.) if the site ever goes down for any reason.
  - Match Render's own health checks (we set `healthCheckPath: /ping`).

- The local `ping-keepalive.ps1` script is a backup you can run on your PC if UptimeRobot ever has issues.

- Result: Your charter clients (and you) will almost always get a fast, responsive site instead of waiting for a wake-up.

You currently have (or had) monitors on both the root and /ping. The /ping one is the lightweight "health" one — re-add it if you deleted it (see the section below).

## Why do this?
- On **Free tier**: Prevents 15-minute sleep + cold starts (30-60s delays).
- On **Starter** ($7/mo, what you have per history): Still useful for monitoring + alerts if something goes wrong (Render can have hiccups).
- On **Standard** or higher: Pure monitoring + uptime reports + public status page you can share with clients.
- Free UptimeRobot gives you 50 monitors at 5-minute intervals, email/Slack/etc alerts, and public status pages.

The project now has a fast `/ping` endpoint (added to `server.py`) that returns `StrumCity OK` instantly — perfect for monitors (no full page load, no images).

Render health checks are also pointed at `/ping`.

## Step-by-step Setup (takes ~2 minutes)

1. Go to [https://uptimerobot.com/](https://uptimerobot.com/) and click **Sign up** (free account, no credit card).

2. After signing in / verifying email, click **+ Add New Monitor** (or the big + button).

3. Fill in exactly like this:

   - **Monitor Type**: `HTTP(s)`
   - **Friendly Name**: `StrumCity Line & Dock` (or whatever you like)
   - **URL (or IP)**: `https://strumcity-line-dock.onrender.com/ping`
     - (Use `/ping` — it's the lightweight endpoint we added. Root `/` also works but loads more.)
   - **Monitoring Interval**: `5 minutes` (free tier limit; fastest you can do for free)
   - **Monitor Timeout**: `30` seconds (default is fine)
   - **Advanced** (optional but recommended):
     - **Keyword**: Check `exists` and put `StrumCity OK`  
       (This confirms it's our app responding correctly, not a Render loading page or error.)
     - **HTTP Method**: `GET` (default)
     - **Post Data**: leave empty
     - **Request Headers**: leave empty (or add `User-Agent: UptimeRobot` if you want)
     - **Follow Redirects**: Yes (default)

4. **Notifications** (very important):
   - Click **Add Alert Contact** or choose existing.
   - At minimum add your email.
   - Bonus: Add Slack, Discord, Telegram, SMS (paid upgrades for some), or the mobile app push.
   - You can set "Alert when down" and optionally "when up again" (recovery).

5. Click **Create Monitor**.

6. (Recommended) Create a public Status Page:
   - In the left menu: **Status Pages** → **+ Create Status Page**
   - Name: `StrumCity Line & Dock Status`
   - Select the monitor you just created.
   - Customize colors/logo if you want (you can use one of the gallery photos or a simple boat icon).
   - Publish. You'll get a public URL like `https://stats.uptimerobot.com/xxxxxxx` that you can bookmark or link from your site (e.g. in footer).
   - Clients love seeing "99.8% uptime this month".

## If you deleted the /ping monitor (like you just did)

Yes, it's worth adding it back. Reasons:
- It's the **exact same target** as Render's own `healthCheckPath` (in render.yaml).
- Much lighter/faster than pinging the full root page (no HTML, no CSS, no JS, no images — just instant "StrumCity OK").
- Better for frequent pings (5 min) without loading unnecessary resources or triggering full app init.
- Keyword check is very reliable.
- The root monitor works fine as a backup, but /ping is the preferred "health" monitor we built the system around.

**How to re-add it right now (takes 30 seconds):**

1. In UptimeRobot, click **+ Add New Monitor**.
2. Use these exact settings (copy-paste):
   - Monitor Type: HTTP(s)
   - Friendly Name: `StrumCity /ping` (or "StrumCity health")
   - URL: `https://strumcity-line-dock.onrender.com/ping`
   - Monitoring Interval: 5 minutes
   - Monitor Timeout: 30
   - Advanced → Keyword: Check `exists` → `StrumCity OK`
3. Use the same notification contacts as your root monitor.
4. Create it.

It should go green on the first check (or force "Check Now" after a minute). The HEAD support fix we deployed means no more 404s.

You can keep the root monitor too (for full-page uptime) or delete it if you want to keep things minimal.

## Test it

- Wait ~5 minutes (or use "Check Now" in UptimeRobot).
- In UptimeRobot dashboard you should see the first check as "Up".
- Manually visit `https://strumcity-line-dock.onrender.com/ping` in a browser or incognito — you should see plain text `StrumCity OK`.
- To test wake from sleep (if on free/Starter historically): pause the monitor for 20 min, then resume and see the first ping after sleep.

(Live test as of now: both GET and HEAD to /ping return clean 200 OK with the expected response — the previous 404 issue is fully resolved.)

## Extra Tips

- **For local development**: You can run a similar ping locally with the included script (see below) or just use the live one.
- **Multiple monitors** (free): You can add one for the main URL too, or for specific pages like `/` with different keywords.
- **Render free/Starter note**: Even with pings, free tier has the 750 hours/month limit. Pings keep it from sleeping but you still consume hours when it's "up". On paid plans (Starter+) there is no hour limit or sleep.
- **Custom domain**: If you ever add a custom domain to Render, update the UptimeRobot URL to the custom one (or keep both monitors).
- **Alerts only on real problems**: UptimeRobot does multiple re-checks from different locations before declaring "Down", so you won't get spammed by transient network blips.

## Local Ping Script (Windows PowerShell backup / testing)

We added `scripts/ping-keepalive.ps1` (create it if missing — see below). Run it in a separate window to simulate pings locally:

```powershell
cd C:\Users\johnn\Documents\strumcity-line-dock
.\scripts\ping-keepalive.ps1
```

It pings the live site (or localhost if you change the URL) every 5 minutes.

(You can also schedule it with Task Scheduler to run at startup minimized.)

## Files We Added/Changed for This

- `server.py` — added fast `/ping`, `/health`, `/status` endpoints (with full GET + HEAD support so monitors using HEAD don't get 404).
- `render.yaml` — healthCheckPath now points to `/ping` (lighter, faster checks).
- This `UPTIME_ROBOT_SETUP.md`
- README.md updated with link to this guide.
- (Optional) `scripts/ping-keepalive.ps1` for local use.

## Quick Command Reference

- Live ping target: `https://strumcity-line-dock.onrender.com/ping`
- Local (while running `py server.py`): `http://localhost:3456/ping`
- To test manually: `curl https://strumcity-line-dock.onrender.com/ping`

Once UptimeRobot is running, your site will be much more reliably "up" for users (especially important for a charter booking tool people might check on the water).

Let me know when you've signed up and created the monitor — we can tweak the keyword, add more monitors (e.g. for the TRA proxy), or set up a status page embed in the footer if you want.

Ready to test? Just run the local server and hit the /ping endpoint. Then go set up the robot! 🤖