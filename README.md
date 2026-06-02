# StrumCity Line & Dock

Evening water reports (5pm–2am CT) for Strum City guide areas.

> **Grok / Development Session Resume**  
> See [GROK-RESUME.md](./GROK-RESUME.md) for full current state, what was last worked on, exact commands, known issues (NordVPN, firewall, `py` vs `python`), and how to pick up quickly after a PC restart or new session.  
> Last updated: late night 2026-06-02 before bed. Say "resume previous" or "read GROK-RESUME.md" to continue.

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
2. **Boat & Trip** — what we provide, what to bring, Texas license links
3. **Photos** — charter photos

**Water Report sub-tabs (5pm–2am CT unless noted):** Conroe, Sam Rayburn, Toledo Bend, Stillhouse, Hubbard Creek, Trinity, Surfside (24h charts, ~50 mi offshore)

## Locations

- **Lake Conroe** — hourly wind and rain
- **Sam Rayburn** — middle of lake
- **Toledo Bend** — south end
- **Stillhouse Hollow** — central Texas
- **Hubbard Creek** — west Texas reservoir
- **Trinity · Cold Spring** — wind/rain plus **TRA Livingston Dam discharge (cfs)** + USGS Cold Spring flow
- **Surfside Offshore** — waves, wind, rain, storm indicators

## Run locally

```powershell
cd C:\Users\johnn\Documents\strumcity-line-dock
py server.py
```

Open http://localhost:3456 in your browser (or on your iPhone on the same Wi‑Fi).

`server.py` serves the app and proxies TRA dam discharge (required — the TRA feed blocks direct browser access).

## Share online (friends can open a link)

Your app is ~17 MB (photos + maps). It must run on a **server** (`server.py`), not only as files on a USB stick.

### Option A — Permanent free link (recommended)

Your code is already published on GitHub:  
**https://github.com/strumcitybowfishing-droid/strumcity-line-dock**

Now get a permanent public URL on **Render** (free tier, Python server, auto deploys on git push).

#### Easiest: Blueprint (uses render.yaml — recommended)

1. Go to https://render.com and sign in with your GitHub account.
2. Click **New +** (top right) → **Blueprint**.
3. Find and select the `strumcity-line-dock` repo → **Connect**.
4. Render detects the `render.yaml` — it should show the service settings. Click **Deploy**.
5. Wait 3–5 min until status is **Live** (green).
6. Copy the generated URL (looks like `https://strumcity-line-dock.onrender.com`) and send to friends.

#### Alternative: Manual Web Service (if you prefer)

1. **New +** → **Web Service**.
2. Connect the `strumcity-line-dock` repo.
3. Configure:
   - **Name:** `strumcity-line-dock`
   - **Region:** pick closest (e.g. Ohio)
   - **Branch:** `main`
   - **Runtime:** `Python 3`
   - **Build Command:** leave blank (or `echo ok`)
   - **Start Command:** `python server.py`
   - **Instance Type:** Free
4. Click **Create Web Service** at bottom.
5. Wait for **Live**, copy the URL.

**After you change the app:**  
Use GitHub Desktop (or git) to commit + push → Render auto-redeploys in 1–2 minutes.

**Free plan note:** Render may sleep after ~15 min idle; first load after sleep can take 30–60 seconds to wake.

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

### What does *not* work alone

- Opening `index.html` from File Explorer (no TRA dam data).  
- Plain GitHub Pages / Netlify “static only” (no Python proxy unless you add extra setup).

## Open in Cursor

File → Open Folder → `C:\Users\johnn\Documents\strumcity-line-dock`