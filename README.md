# StrumCity Line & Dock

Evening water reports (5pm–2am CT) for Strum City guide areas.

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

Use **GitHub** (stores your code) + **Render** (runs `server.py` 24/7 on a free plan).

1. **GitHub account** — sign up at https://github.com if needed.
2. **GitHub Desktop** (easiest on Windows) — https://desktop.github.com  
   - Install → **File → Add local repository** → choose `C:\Users\johnn\Documents\strumcity-line-dock`  
   - If it says “not a repository”, click **create a repository** here (keep name `strumcity-line-dock`).  
   - **Publish repository** to GitHub (private is fine; friends only need the Render URL).
3. **Render** — https://render.com → sign up (free) with GitHub.  
   - **New +** → **Web Service** → connect your `strumcity-line-dock` repo.  
   - **Runtime:** Python 3  
   - **Start command:** `python server.py`  
   - **Instance type:** Free  
   - Click **Create Web Service**. Wait a few minutes for deploy.
4. Copy the URL Render gives you (like `https://strumcity-line-dock.onrender.com`) and text it to friends.

**After you change the app:** commit in GitHub Desktop → **Push origin** → Render redeploys automatically in ~1–2 minutes.

**Free plan note:** Render may sleep after ~15 minutes with no visitors; the first open after that can take 30–60 seconds to wake up.

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