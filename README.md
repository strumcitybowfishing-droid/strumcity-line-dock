# StrumCity Line & Dock

Evening water reports (5pm–2am CT) for Strum City guide areas.

> **Grok / Development Session Resume**  
> See [GROK-RESUME.md](./GROK-RESUME.md) for full current state, what was last worked on, exact commands, known issues (NordVPN, firewall, `py` vs `python`), and how to pick up quickly after a PC restart or new session.  
> Last updated: late night 2026-06-02 before bed. Say "resume previous" or "read GROK-RESUME.md" to continue.

**🚀 Live public site (Standard plan on Render):** https://strumcity-line-dock.onrender.com

Tested working: main page loads, all static assets (JS/CSS), and the custom TRA dam proxy API.

## Quick Local Start (after any restart)
1. Open PowerShell  
2. `cd C:\Users\johnn\Documents\strumcity-line-dock`  
3. `py server.py` (leave the window open)  

Then open:  
- This PC: http://localhost:3456  
- Phone on same Wi-Fi: http://192.168.1.65:3456 (update IP with `ipconfig` if needed)

There's also `start-local-server.ps1` (run or double-click it).

**Note:** The server must be running for the app to work fully (especially Trinity dam data). Opening `index.html` directly from Explorer does **not** work.

## Photos

All photos live in `images/gallery/` (one big grid on the Photos tab — no areas). Sourced from [Facebook](https://www.facebook.com/StrumCityBowfishing/), [Instagram](https://www.instagram.com/strumcityoutdoors/), and strumcitybowfishing.com.

To refresh after new posts:

```powershell
cd C:\Users\johnn\Documents\strumcity-line-dock
.\scripts\refresh-gallery.ps1
```

Or drop new `.jpg` files into `images/gallery/` and re-run the script to rebuild `js/photos-manifest.js`.

## Tabs

**Main tabs**

1. **Water Report** — all lake/river/offshore forecasts (sub-tabs below)
2. **Radar** — live animated radar loops (zoom to area + play recent/nowcast)
3. **Boat & Trip** — what we provide, what to bring, Texas license links
4. **Photos** — charter photos

**Water Report sub-tabs (5pm–2am CT unless noted):** Expanded multi-state — Texas (Conroe, Sam Rayburn, Toledo Bend, Stillhouse, Belton, Whitney, Waco, Hubbard, Brazos River, Trinity), Arkansas (Ouachita, Bull Shoals, Table Rock), Tennessee Valley (Pickwick, Guntersville, Watts Bar), Surfside (24h offshore). Use the region filter bar (All / Texas / Arkansas / Tennessee Valley / Offshore) above the location buttons to narrow the list.

## Locations (multi-state)

**Texas** — Lake Conroe, Sam Rayburn, Toledo Bend, Stillhouse Hollow, Lake Belton, Lake Whitney, Lake Waco, Hubbard Creek, Brazos River (Whitney–Waco), Trinity · Cold Spring (with TRA dam data)

**Arkansas** — Lake Ouachita, Bull Shoals Lake, Table Rock Lake

**Tennessee Valley** — Pickwick Lake (TN/AL/MS), Lake Guntersville (AL), Watts Bar Lake (TN)

**Offshore** — Surfside (Gulf ~50 mi)

Use the region pills under Water Report to filter the location buttons. Radar tab location buttons are also grouped by region and cover the full area (IEM CONUS radar works great for AR/TN/AL lakes).

## Run locally

```powershell
cd C:\Users\johnn\Documents\strumcity-line-dock
py server.py
```

Open http://localhost:3456 in your browser (or on your iPhone on the same Wi‑Fi).

`server.py` serves the app and proxies TRA dam discharge (required — the TRA feed blocks direct browser access).

## Share online (friends can open a link)

Your app is ~40 MB total (almost all from images: 30 MB maps for 17 locations + 10 MB gallery). It must run on a **server** (`server.py`), not only as files on a USB stick. (Effective per-user load is much smaller thanks to lazy loading — one lake view is typically ~1 MB.)

### Option A — Permanent free link (recommended)

Your code is already published on GitHub:  
**https://github.com/strumcitybowfishing-droid/strumcity-line-dock**

Now get a permanent public URL on **Render** (paid plan: Standard = always-on/no sleep; Starter = spins down after ~15 min inactivity but wakes on request). Your service plan is whatever you selected/paid for in the dashboard (YAML suggests standard but dashboard wins).

#### Easiest: Blueprint (uses render.yaml — recommended)

1. Go to https://render.com and sign in with your GitHub account.
2. Click **New +** (top right) → **Blueprint**.
3. Find and select the `strumcity-line-dock` repo → **Connect**.
4. Render detects the `render.yaml` — it should show the service settings. Click **Deploy**.
5. Wait 3–5 min until status is **Live** (green).
6. Copy the generated URL (looks like `https://strumcity-line-dock.onrender.com`) and send to friends.

#### If you ever need to recreate the service (rare)

Use the **Blueprint** method above (it reads render.yaml which has `plan: standard` — but if your dashboard service is on the Starter plan you purchased, it will use that. You can change the plan in Settings → Plan after deploy).

The manual steps below are mostly for reference (our current service is already configured correctly on Standard):

1. **New +** → **Web Service**.
2. Connect the `strumcity-line-dock` repo.
3. Configure:
   - **Name:** `strumcity-line-dock`
   - **Region:** pick closest (e.g. Ohio)
   - **Branch:** `main`
   - **Runtime:** `Python 3`
   - **Build Command:** leave blank (or `echo ok`)
   - **Start Command:** `python -u server.py`
   - **Instance Type:** Standard (or Starter if that's the plan you bought — change later in dashboard if needed)
4. Click **Create Web Service** at bottom.
5. Wait for **Live**.

**After you change the app (the normal update workflow):**

See the dedicated section below: **Making Changes & Deploying Updates**

**Important about sleeping / uptime (based on your actual plan):**
- **Standard plan:** Always on, no sleep. Site stays up 24/7 even with no traffic.
- **Starter plan (what you said you bought):** Spins down after ~15 minutes of no incoming requests. First request after sleep triggers a "spin up" (can take 15-60+ seconds for the Python server to start). After that it stays awake while traffic continues.
- Your site will **NOT** reliably be "up" tomorrow morning if no one visits overnight on Starter — it will likely be asleep. You (or a visitor) will need to hit the URL to wake it.
- To keep it always responsive on Starter: Set up a free uptime pinger (e.g. UptimeRobot.com — free account, add HTTP(s) monitor pinging your URL every 5 minutes). This keeps the dyno awake without upgrading.
- To get true always-on: Upgrade the service in Render dashboard (Settings > Plan > Standard). Costs more but no sleep, faster cold starts, better for clients.
- Check your exact plan: Go to https://dashboard.render.com → your service → top of page shows the plan badge. Change there if needed, then redeploy.

### Option B — Quick link tonight (PC must stay on)

While `py server.py` is running:

1. Install Cloudflare Tunnel: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/  
2. In a second PowerShell window:
   ```powershell
   cloudflared tunnel --url http://localhost:3456
   ```
3. Copy the `https://….trycloudflare.com` URL it prints and send that to friends.  
   When you close the PC or stop the tunnel, the link stops working.

### Option C — Your own domain later

On Render: **Settings → Custom Domains** → add something like `dock.strumcitybowfishing.com` (you create a CNAME at your domain registrar).

## Making Changes & Deploying Updates (to the live site)

This is the normal day-to-day workflow:

1. **Edit the code**  
   Change whatever you want:
   - `index.html`
   - `js/app.js`, `js/config.js`, etc.
   - `css/styles.css`
   - `server.py` (for backend/proxy changes)

2. **Test locally** (always do this first)
   ```powershell
   cd C:\Users\johnn\Documents\strumcity-line-dock
   .\start-local-server.ps1
   ```
   Open http://localhost:3456 and make sure it looks/behaves right.

3. **Commit and push to GitHub**
   - **GitHub Desktop** (easiest for most people):
     - Select the changed files
     - Write a short message like "Add Galveston location + better mobile styles"
     - Commit to main
     - Push

   - **PowerShell / terminal**:
     ```powershell
     cd C:\Users\johnn\Documents\strumcity-line-dock
     git add .
     git commit -m "Add Galveston location + better mobile styles"
     git push
     ```

4. **Render picks it up automatically**
   - Render is watching the GitHub repo.
   - Within 30–60 seconds it starts a new deploy using `render.yaml` (Standard plan, `python -u server.py`).
   - Full redeploy usually takes 1–3 minutes.

5. **Watch the deploy + verify**
   - Go to https://dashboard.render.com → your `strumcity-line-dock` service → **Logs** tab.
   - When you see "Live" (green), hard-refresh the live site:
     https://strumcity-line-dock.onrender.com
   - (Ctrl + Shift + R or Cmd + Shift + R)

**If it doesn't auto-deploy:**
- In the Render service → Settings, make sure "Auto-Deploy" is turned on for the `main` branch.
- Or use the "Manual Deploy → Deploy latest commit" button.

**Pro tips**
- Small focused commits are easier to debug if something breaks.
- The `start-local-server.ps1` makes local testing one double-click.
- All your images, JS, CSS, and the Python proxy code live in this folder and get deployed together.

### What does *not* work alone

- Opening `index.html` from File Explorer (no TRA dam data).  
- Plain GitHub Pages / Netlify “static only” (no Python proxy unless you add extra setup).

## Open in Cursor

File → Open Folder → `C:\Users\johnn\Documents\strumcity-line-dock`