import { LOCATIONS, WEATHER_TAB_ORDER, MAIN_TABS, REPORT_SOURCES, LAKE_BOWFISHING_RECORDS, STATE_BOWFISHING_RECORDS, APP_VERSION } from "./config.js?v=20240629";
import { fetchWeatherForecast, fetchMarineForecast } from "./weather.js?v=20240629";
import { fetchTraLivingston, formatTraObserved } from "./tra.js?v=20240629";
import { buildLineChart, chartHourLabels } from "./charts.js?v=20240629";
import { renderCharterPage } from "./charter.js?v=20240629";
import { renderDayHeaderContent } from "./gauge.js?v=20240629";
import { showLocationMap, hideLocationMap, loadLeaflet } from "./maps.js?v=20240629";
import {
  formatDayHeading,
  formatHourLabel,
  formatTimestamp,
  formatCfs,
  windDirLabel,
  stormLabel,
  getCfsZone,
  createCfsBar,
  getWindColor,
} from "./utils.js?v=20240629";

const statusBar = document.getElementById("status-bar");
const forecastRoot = document.getElementById("forecast-root");
const extraPanels = document.getElementById("extra-panels");
const taglineEl = document.querySelector(".tagline");
const mainNavRoot = document.getElementById("main-nav");
const subNavRoot = document.getElementById("sub-nav");
const regionNavRoot = document.getElementById("region-nav"); // optional container (added in index if needed, falls back to dynamic)

const appVersionEl = document.getElementById("app-version");
const forceRefreshBtn = document.getElementById("force-refresh-btn");

// Compute labels + titles from config (no more duplication when adding lakes)
const SUB_LABELS = {};
const SUB_TITLES = {};
for (const [id, loc] of Object.entries(LOCATIONS)) {
  SUB_LABELS[id] = loc.shortLabel || loc.label.split(/ [·(]/)[0];
  SUB_TITLES[id] = loc.subtitle || loc.label;
}

const REGION_LABELS = {
  texas: "Texas",
  arkansas: "Arkansas",
  "tennessee-alabama": "Tennessee Valley",
  offshore: "Offshore",
};

/** Wire version display + the force-refresh button.
 *  The button does a navigation with a cache-buster query param.
 *  Combined with the ?v= on the script/link tags + no-cache metas on HTML,
 *  this gives users with stale bookmarks (esp. iOS Safari home screen / PWA) a one-tap way
 *  to pull the latest shell + data without manually clearing cache.
 */
function setupVersionAndRefresh() {
  if (appVersionEl) {
    appVersionEl.textContent = APP_VERSION || "dev";
  }
  if (forceRefreshBtn) {
    forceRefreshBtn.addEventListener("click", () => {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("cb", Date.now().toString(36));
        // assign forces a real navigation (better cache behavior than reload() in some PWAs)
        window.location.assign(url.toString());
      } catch (e) {
        // fallback
        window.location.reload();
      }
    });
  }
}

/** PWA install prompt (beforeinstallprompt).
 *  Shows a nice in-app prompt instead of (or in addition to) the browser's mini-infobar.
 *  This is a big part of making it feel like a "real app" users actively install.
 */
let deferredInstallPrompt = null;

function setupPwaInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    deferredInstallPrompt = e;

    // Show our own install UI (simple version: make the refresh line or a new banner visible)
    const installHint = document.getElementById("pwa-install-hint");
    if (installHint) {
      installHint.style.display = "inline";
      installHint.onclick = async () => {
        if (!deferredInstallPrompt) return;
        deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;
        console.log(`[StrumCity] PWA install outcome: ${outcome}`);
        deferredInstallPrompt = null;
        installHint.style.display = "none";
      };
    }
  });

  // Optional: log when it was successfully installed
  window.addEventListener("appinstalled", () => {
    console.log("[StrumCity] PWA was installed");
    const installHint = document.getElementById("pwa-install-hint");
    if (installHint) installHint.style.display = "none";
  });
}

let activeMain = "conditions";
let activeLocation = "conroe";
let activeRegion = "all"; // "all" | "texas" | "arkansas" | "tennessee-alabama" | "offshore"
let cache = {};
let weatherFetchedAt = {}; // id -> Date of last successful fetch (for accurate "Updated" time + staleness checks)
const WEATHER_REFRESH_MS = 15 * 60 * 1000; // 15 minutes - auto refresh stale weather if user returns after hours (e.g. phone in pocket)

function buildMainNav() {
  mainNavRoot.innerHTML = MAIN_TABS.map(
    (tab) =>
      `<button type="button" class="main-btn${tab.id === activeMain ? " active" : ""}" data-main="${tab.id}">${tab.label}</button>`
  ).join("");

  mainNavRoot.querySelectorAll(".main-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeMain = btn.dataset.main;
      mainNavRoot.querySelectorAll(".main-btn").forEach((b) => {
        b.classList.toggle("active", b.dataset.main === activeMain);
      });
      loadMain(activeMain);
    });
  });
}

// Wire the header shop bubbles (split left/right tilted CTAs — clicking either opens the shop tab)
document.querySelectorAll(".shop-header-bubble").forEach((btn) => {
  btn.addEventListener("click", () => {
    activeMain = "shop";
    const nav = document.getElementById("main-nav");
    if (nav) {
      nav.querySelectorAll(".main-btn").forEach((b) => {
        b.classList.toggle("active", b.dataset.main === "shop");
      });
    }
    loadMain("shop");
  });
});

function buildRegionNav() {
  // Create or reuse a region filter bar (cool multi-state grouping UI).
  // Filters the location sub-buttons to the chosen region so the bar doesn't get overwhelming with 17+ lakes.
  let container = document.getElementById("region-nav");
  if (!container) {
    container = document.createElement("div");
    container.id = "region-nav";
    container.className = "region-nav";
    subNavRoot.parentNode.insertBefore(container, subNavRoot);
  }

  const regions = ["all", "texas", "arkansas", "tennessee-alabama", "offshore"];
  container.innerHTML = regions
    .map((r) => {
      const label = r === "all" ? "All" : REGION_LABELS[r];
      const active = r === activeRegion ? " active" : "";
      return `<button type="button" class="region-btn${active}" data-region="${r}">${label}</button>`;
    })
    .join("");

  container.querySelectorAll(".region-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeRegion = btn.dataset.region;
      container.querySelectorAll(".region-btn").forEach((b) => {
        b.classList.toggle("active", b.dataset.region === activeRegion);
      });
      buildSubNav(); // re-filter locations
    });
  });
}

function buildSubNav() {
  let ids = WEATHER_TAB_ORDER;
  if (activeRegion && activeRegion !== "all") {
    ids = ids.filter((id) => LOCATIONS[id] && LOCATIONS[id].region === activeRegion);
  }

  subNavRoot.innerHTML = ids
    .map(
      (id) =>
        `<button type="button" class="sub-btn${id === activeLocation ? " active" : ""}" data-location="${id}" title="${SUB_TITLES[id]}">${SUB_LABELS[id]}</button>`
    )
    .join("");

  subNavRoot.querySelectorAll(".sub-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeLocation = btn.dataset.location;
      subNavRoot.querySelectorAll(".sub-btn").forEach((b) => {
        b.classList.toggle("active", b.dataset.location === activeLocation);
      });
      loadWeatherLocation(activeLocation);
    });
  });
}

function setSubNavVisible(visible) {
  subNavRoot.classList.toggle("hidden", !visible);
  const rnav = document.getElementById("region-nav");
  if (rnav) rnav.classList.toggle("hidden", !visible);
}

buildMainNav();
buildRegionNav();
buildSubNav();
setupVersionAndRefresh();
setupPwaInstallPrompt();
loadMain(activeMain);

function loadMain(mainId) {
  extraPanels.innerHTML = "";
  forecastRoot.innerHTML = "";

  // cleanup previous radar if active
  if (window.radarCleanup) {
    try { window.radarCleanup(); } catch(e){}
    window.radarCleanup = null;
  }

  if (mainId === "conditions") {
    setSubNavVisible(true);
    // Keep region filter consistent with current location (nice for multi-state)
    const loc = LOCATIONS[activeLocation];
    if (loc && loc.region && activeRegion !== "all" && activeRegion !== loc.region) {
      activeRegion = loc.region;
      const rnav = document.getElementById("region-nav");
      if (rnav) {
        rnav.querySelectorAll(".region-btn").forEach((b) => {
          b.classList.toggle("active", b.dataset.region === activeRegion);
        });
      }
    }
    buildSubNav();
    loadWeatherLocation(activeLocation);
    return;
  }

  if (mainId === "radar") {
    setSubNavVisible(false);
    hideLocationMap();
    setStatus("Texas Radar Loop");
    taglineEl.textContent = "Live NEXRAD radar (IEM/NWS) · zoom & play recent frames loop";
    renderRadarPage();
    return;
  }

  setSubNavVisible(false);
  hideLocationMap();

  if (mainId === "charter") {
    setStatus("Strum City Fishing Charter");
    taglineEl.textContent = "Boat · gear · what to bring · Texas license";
    forecastRoot.innerHTML = renderCharterPage();
    return;
  }

  if (mainId === "reports") {
    setStatus("Fishing Report");
    taglineEl.textContent = "Weekly reports & updates (TPWD currently paused — check these active local sources)";
    forecastRoot.innerHTML = renderReportsPage();
    // wire up the lake subtabs after render (each lake gets full dedicated page like Records)
    setTimeout(initReportsSubtabs, 0);
    return;
  }

  if (mainId === "records") {
    setSubNavVisible(false);
    hideLocationMap();
    setStatus("Bowfishing Records");
    taglineEl.textContent = "TPWD lake & state bowfishing records • tap a tab for full details";
    forecastRoot.innerHTML = renderRecordsPage();
    // wire up the subtabs after render (lakes and states are completely separate)
    setTimeout(initRecordsSubtabs, 0);
    return;
  }

  if (mainId === "shop") {
    setStatus("StrumCity Gear Shop");
    taglineEl.textContent = "Bowfishing gear • New store, adding any products (some untested)";
    forecastRoot.innerHTML = renderShopPage();
    setTimeout(initShopifyTestProductEmbed, 0);
    return;
  }
}

async function loadWeatherLocation(id) {
  extraPanels.innerHTML = "";
  forecastRoot.innerHTML = "";

  const loc = LOCATIONS[id];
  if (!loc) return;

  if (id !== "trinity" && !loc.fullDay) {
    renderWindSidebar();
  }

  showLocationMap(loc).catch((err) => {
    console.warn(err);
    setStatus(`Map could not load (need internet). Forecast data is still below.`, true);
  });

  setStatus(`Loading ${loc.label}…`);

  taglineEl.textContent = loc.fullDay
    ? `Gulf ~${loc.offshoreMiles} mi out · 24-hour wind & wave lines`
    : "Your line to the water · 5pm–2am hourly reports";

  try {
    if (id === "trinity") await renderTrinityFlow(loc);

    let days;
    const last = weatherFetchedAt[id];
    const isStale = !last || (Date.now() - last.getTime() > WEATHER_REFRESH_MS);
    if (cache[id] && !isStale) {
      days = cache[id];
    } else {
      // fresh fetch (either never loaded, or stale >15min)
      days =
        loc.type === "marine"
          ? await fetchMarineForecast(loc.latitude, loc.longitude, {
              fullDay: !!loc.fullDay,
            })
          : await fetchWeatherForecast(loc.latitude, loc.longitude);
      cache[id] = days;
      weatherFetchedAt[id] = new Date();
    }

    const updatedTime = (weatherFetchedAt[id] || new Date()).toLocaleTimeString("en-US", { timeZone: "America/Chicago" });

    if (loc.fullDay) {
      renderMarineCharts(days);
      setStatus(
        `${loc.label} · ${loc.subtitle} · 7-day hourly · Updated ${updatedTime}`
      );
    } else {
      renderForecast(days, false);
      setStatus(`${loc.label} · ${loc.subtitle} · 5pm–2am CT · Updated ${updatedTime}`);
    }
  } catch (err) {
    console.error(err);
    setStatus(`Could not load data: ${err.message}`, true);
  }
}

function formatNow() {
  return new Date().toLocaleTimeString("en-US", { timeZone: "America/Chicago" });
}

/**
 * Auto-refresh logic so data doesn't go stale for hours (phone in pocket, come back later, etc.)
 * - Periodic check every 5 min
 * - On tab/app becoming visible after being hidden (key for mobile)
 * - Only affects the active location on the Water Report tab
 * - Uses 15 min staleness threshold (WEATHER_REFRESH_MS)
 * - Forces re-fetch by clearing cache entry
 */
function refreshWeatherIfStale() {
  if (activeMain !== "conditions") return;
  const id = activeLocation;
  const last = weatherFetchedAt[id];
  if (!last || (Date.now() - last.getTime() > WEATHER_REFRESH_MS)) {
    console.log(`[StrumCity] Auto-refreshing weather for ${id} (stale data)`);
    delete cache[id];
    // weatherFetchedAt will be reset inside loadWeatherLocation on successful fetch
    loadWeatherLocation(id);
  }
}

// Check periodically (lightweight)
setInterval(refreshWeatherIfStale, 5 * 60 * 1000);

// When user returns to the tab/app after hours (phone pocket scenario)
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    // Small delay so the page has settled
    setTimeout(refreshWeatherIfStale, 250);
  }
});

async function renderTrinityFlow(loc) {
  const tra = await fetchTraLivingston();

  const lakeLine = tra.lakeLevel
    ? `<p class="flow-meta">Lake level: <strong>${tra.lakeLevel.feet} ft</strong> · ${formatTraObserved(tra.lakeLevel.observedAt)}</p>`
    : "";

  const damZone = getCfsZone(tra.discharge.cfs);
  const damBar = createCfsBar(tra.discharge.cfs);

  extraPanels.innerHTML = `
    <section class="flow-panel" aria-labelledby="dam-flow-title">
      <h2 id="dam-flow-title">Livingston Dam discharge</h2>
      <p class="flow-value" style="color:${damZone.color}">${formatCfs(tra.discharge.cfs)}</p>
      ${damBar}
      <p class="flow-meta">${tra.discharge.source}<br/>Observed ${formatTraObserved(tra.discharge.observedAt)}</p>
      ${lakeLine}
      <p class="flow-meta"><a href="${loc.traLink}" target="_blank" rel="noopener">lakedata.traweb.net</a> (same TRA feed)</p>
    </section>
  `;
}

function renderWindSidebar() {
  const ranges = [
    { range: "1–4 mph", label: "Very flat / \"glassy\"", note: "Excellent visibility for spotting fish" },
    { range: "4–7 mph", label: "Rippled water", note: "Still fishable" },
    { range: "8–11 mph", label: "A little choppy in shallows", note: "" },
    { range: "12–15 mph", label: "Hard, tough fishing", note: "" },
    { range: "15–20+ mph", label: "Rough lake, approaching hazardous", note: "We typically won't launch" },
  ];

  const listItems = ranges.map(r => {
    // extract lower bound roughly for color (e.g. from "1–4", "12–15", "15–20+")
    const low = parseInt(r.range.split(/[–-]/)[0], 10) || 0;
    const color = getWindColor(low);
    return `
    <li>
      <span style="color:${color}; font-weight:700;">●</span> <strong>${r.range}:</strong> ${r.label}${r.note ? ` — ${r.note}` : ""}
    </li>
  `;
  }).join("");

  extraPanels.innerHTML = `
    <section class="info-card wind-sidebar">
      <h2>Wind Conditions Guide</h2>
      <p class="info-note">Nighttime winds (5pm–2am) on the lakes. Gusts can make conditions feel stronger than sustained wind.</p>
      <ul class="wind-ranges info-list">
        ${listItems}
      </ul>
      <p class="info-fine">Sustained wind speeds from forecast. Always check conditions before heading out.</p>
    </section>
  `;
}

async function renderRadarPage() {
  forecastRoot.innerHTML = `
    <div class="radar-page">
      <div class="radar-controls">
        <div class="radar-locations" id="radar-locations"></div>
        <div class="radar-play">
          <button id="radar-play">▶ Play Loop</button>
          <button id="radar-pause">⏸ Pause</button>
          <span id="radar-time" style="margin-left:0.5rem; color:var(--muted); font-size:0.75rem;"></span>
        </div>
        <div class="radar-time-slider">
          <input type="range" id="radar-slider" min="0" max="0" value="0" style="width:100%; margin-top:0.3rem;">
        </div>
      </div>
      <div id="radar-map" class="radar-map"></div>
      <p class="radar-note">NEXRAD CONUS composite base reflectivity © IEM / Iowa State (NWS data, ~5 min updates). Long loop of recent past frames via archive. Location buttons center the view. Play/scrub the animation. (Fallback to RainViewer if IEM unavailable.)</p>
    </div>
  `;

  initRadar();
}

async function initRadar() {
  const mapEl = document.getElementById('radar-map');
  if (!mapEl) return;

  const L = await loadLeaflet();

  if (window.radarMapInstance) {
    window.radarMapInstance.remove();
  }

  const radarMap = L.map(mapEl, {
    zoomControl: true,
    attributionControl: true,
    maxZoom: 18
  }).setView([30.3, -95.5], 7);

  window.radarMapInstance = radarMap;

  // base map - simple OSM for radar clarity
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
  }).addTo(radarMap);

  let radarLayer = null;
  let frames = [];
  let currentIdx = 0;
  let animTimer = null;
  let isPlaying = false;

  async function loadRadarData() {
    try {
      // Use IEM (Iowa Environmental Mesonet) NEXRAD CONUS composite for a different/official US radar source.
      // Provides ~5-min base reflectivity mosaics. Build frames list from their JSON for accurate past times + long loop.
      const end = new Date();
      const start = new Date(end.getTime() - 4 * 3600 * 1000); // ~4 hours of history for long loop
      const startIso = start.toISOString().replace(/\.\d+Z$/, 'Z').slice(0, 16) + 'Z';
      const endIso = end.toISOString().replace(/\.\d+Z$/, 'Z').slice(0, 16) + 'Z';
      const listUrl = `https://mesonet.agron.iastate.edu/json/radar.py?operation=list&radar=USCOMP&product=N0Q&start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(endIso)}`;
      const res = await fetch(listUrl);
      if (!res.ok) throw new Error('IEM radar list error');
      const data = await res.json();
      const scans = (data && data.scans) || [];

      frames = scans.slice(-40).map(s => {
        const iso = s.ts || s.valid || '';
        const dt = new Date(iso);
        const epoch = Math.floor(dt.getTime() / 1000);
        // Format for IEM ridge/USCOMP tile layer name: YYYYMMDDHHMM
        const formatted = iso.replace(/[-:T Z]/g, '').slice(0, 12);
        const url = `https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-N0Q-${formatted}/{z}/{x}/{y}.png`;
        return { time: epoch, url, iso };
      }).filter(f => f.time > 0);

      if (frames.length > 0) {
        setRadarFrame(0);
      } else {
        throw new Error('No IEM frames');
      }
    } catch (e) {
      console.error('Failed to load IEM radar, falling back to RainViewer:', e);
      // Fallback keeps things working
      try {
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        if (!res.ok) throw new Error('RainViewer API error');
        const data = await res.json();
        const past = (data.radar && data.radar.past) || [];
        const nowcast = (data.radar && data.radar.nowcast) || [];
        frames = [...past, ...nowcast].map(f => ({
          time: f.time,
          url: `https://tilecache.rainviewer.com${f.path}/256/{z}/{x}/{y}/6/1_1.png`
        })).slice(-30);
        if (frames.length > 0) setRadarFrame(0);
      } catch (e2) {
        console.error('Fallback also failed:', e2);
        mapEl.innerHTML = '<p style="padding:1rem; color:var(--storm);">Radar feed temporarily unavailable. Please try again later.</p>';
      }
    }
  }

  function setRadarFrame(idx) {
    if (!frames[idx] || !radarMap) return;
    currentIdx = idx;
    const frame = frames[idx];
    const url = frame.url;

    if (radarLayer) {
      radarLayer.setUrl(url);
    } else {
      radarLayer = L.tileLayer(url, {
        opacity: 0.75,
        zIndex: 10,
        updateInterval: 200,
        maxNativeZoom: 12,
        maxZoom: 14
      }).addTo(radarMap);
    }

    const timeEl = document.getElementById('radar-time');
    if (timeEl) {
      const d = new Date(frame.time * 1000);
      timeEl.textContent = d.toLocaleTimeString('en-US', {
        timeZone: 'America/Chicago',
        hour: 'numeric',
        minute: '2-digit'
      }) + ' CT';
    }

    const slider = document.getElementById('radar-slider');
    if (slider) {
      slider.value = idx;
    }
  }

  function playLoop() {
    if (isPlaying || frames.length < 2) return;
    isPlaying = true;
    if (animTimer) clearInterval(animTimer);
    animTimer = setInterval(() => {
      let next = currentIdx + 1;
      if (next >= frames.length) next = 0;
      setRadarFrame(next);
    }, 650);
  }

  function pauseLoop() {
    isPlaying = false;
    if (animTimer) {
      clearInterval(animTimer);
      animTimer = null;
    }
  }

  // wire buttons
  const playBtn = document.getElementById('radar-play');
  const pauseBtn = document.getElementById('radar-pause');
  if (playBtn) playBtn.addEventListener('click', playLoop);
  if (pauseBtn) pauseBtn.addEventListener('click', pauseLoop);

  // location buttons - grouped by region for the expanded multi-state set (AR radar, TN/AL etc. easy)
  const locContainer = document.getElementById('radar-locations');
  if (locContainer && LOCATIONS) {
    const groups = {};
    Object.values(LOCATIONS).forEach(loc => {
      const r = loc.region || 'other';
      if (!groups[r]) groups[r] = [];
      groups[r].push(loc);
    });

    Object.entries(groups).forEach(([reg, locs]) => {
      const gdiv = document.createElement('div');
      gdiv.className = 'radar-group';
      const label = document.createElement('span');
      label.className = 'radar-group-label';
      label.textContent = REGION_LABELS[reg] || reg;
      gdiv.appendChild(label);

      locs.forEach(loc => {
        const btn = document.createElement('button');
        btn.textContent = loc.label.replace(' · Cold Spring', '');
        btn.dataset.loc = loc.id;
        btn.addEventListener('click', () => {
          if (window.radarMapInstance) {
            const z = Math.min(loc.mapZoom || (loc.type === 'marine' ? 8 : 9), 12);
            window.radarMapInstance.flyTo([loc.latitude, loc.longitude], z, { duration: 0.7 });
          }
        });
        gdiv.appendChild(btn);
      });
      locContainer.appendChild(gdiv);
    });
  }

  await loadRadarData();

  // setup time slider
  const slider = document.getElementById('radar-slider');
  if (slider) {
    slider.max = Math.max(0, frames.length - 1);
    slider.value = 0;
    slider.addEventListener('input', () => {
      pauseLoop();
      setRadarFrame(parseInt(slider.value, 10));
    });
  }

  // auto-start the loop once loaded
  if (frames.length > 1) {
    setTimeout(playLoop, 800);
  }

  // cleanup on tab switch? (simple)
  const cleanup = () => {
    if (animTimer) clearInterval(animTimer);
    if (window.radarMapInstance) {
      window.radarMapInstance.remove();
      window.radarMapInstance = null;
    }
  };
  // attach to window for possible future cleanup if needed
  window.radarCleanup = cleanup;
}

function renderMarineCharts(days) {
  forecastRoot.innerHTML = days
    .map((day, index) => {
      const open = index === 0 ? "open" : "";
      const times = day.hours.map((h) => h.time);
      const labels = chartHourLabels(times, 3);

      const waveChart = buildLineChart({
        title: "Wave height",
        labels,
        yUnit: "feet",
        series: [
          {
            label: "Combined seas",
            values: day.hours.map((h) => h.waveFt),
            color: "#39ff14",
          },
          {
            label: "Wind waves",
            values: day.hours.map((h) => h.windWaveFt),
            color: "#9aff6a",
            dashed: true,
          },
        ],
      });

      const windChart = buildLineChart({
        title: "Wind",
        labels,
        yUnit: "mph",
        series: [
          {
            label: "Sustained",
            values: day.hours.map((h) => h.windMph),
            color: "#39ff14",
          },
        ],
      });

      return `
        <article class="day-block ${open}" data-day>
          <div class="day-header" role="button" tabindex="0" aria-expanded="${index === 0}">
            ${renderDayHeaderContent(day, index, formatDayHeading(day.headingKey))}
          </div>
          <div class="day-body">
            ${waveChart}
            ${windChart}
            <p class="details-label">Rain &amp; storms (hourly)</p>
            ${marineDetailsTable(day.hours)}
          </div>
        </article>
      `;
    })
    .join("");

  bindDayToggles();
}

function renderForecast(days, isMarine) {
  forecastRoot.innerHTML = days
    .map((day, index) => {
      const open = index === 0 ? "open" : "";
      let inner;
      if (isMarine) {
        const table = marineTable(day.hours);
        inner = table;
      } else {
        const times = day.hours.map((h) => h.time);
        const labels = chartHourLabels(times, 3);

        const windChart = buildLineChart({
          title: "Wind",
          labels,
          yUnit: "mph",
          series: [
            {
              label: "Sustained",
              values: day.hours.map((h) => h.windMph),
              color: "#39ff14",
            },
          ],
        });

        const table = weatherTable(day.hours);
        inner = `
          ${windChart}
          <p class="details-label">Rain, chance, wind, dir & storms (hourly)</p>
          <div class="hour-table-wrap" style="display:block;">
            ${table}
          </div>
        `;
      }
      return `
        <article class="day-block ${open}" data-day>
          <div class="day-header" role="button" tabindex="0" aria-expanded="${index === 0}">
            ${renderDayHeaderContent(day, index, formatDayHeading(day.headingKey))}
          </div>
          <div class="day-body">
            ${inner}
          </div>
        </article>
      `;
    })
    .join("");

  bindDayToggles();
}

function bindDayToggles() {
  forecastRoot.querySelectorAll(".day-header").forEach((header) => {
    const toggle = () => {
      const block = header.closest(".day-block");
      const isOpen = block.classList.toggle("open");
      header.setAttribute("aria-expanded", String(isOpen));
    };
    header.addEventListener("click", toggle);
    header.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  });
}

function marineDetailsTable(hours) {
  const rows = hours
    .map((h) => {
      const rainClass = (h.rainIn ?? 0) > 0 ? "wet" : "";
      const stormRow = h.isStorm ? "storm-row" : "";
      const storm = h.isStorm
        ? `<span class="storm-badge">${stormLabel(h.weatherCode)}</span>`
        : stormLabel(h.weatherCode) || "—";
      return `
        <tr class="${stormRow}">
          <td>${formatHourLabel(h.time)}</td>
          <td><span class="rain-chip ${rainClass}">${h.rainIn ?? 0}"</span></td>
          <td>${h.rainChance ?? 0}%</td>
          <td>${storm}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <div class="hour-table-wrap" style="display:block">
      <table class="hour-table">
        <thead>
          <tr><th>Hour</th><th>Rain</th><th>Chance</th><th>Storms</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function weatherTable(hours) {
  const rows = hours
    .map((h) => {
      const rainClass = (h.rainIn ?? 0) > 0 ? "wet" : "";
      const stormRow = h.isStorm ? "storm-row" : "";
      const storm = h.isStorm
        ? `<span class="storm-badge">${stormLabel(h.weatherCode)}</span>`
        : stormLabel(h.weatherCode);
      return `
        <tr class="${stormRow}">
          <td>${formatHourLabel(h.time)}</td>
          <td><span class="rain-chip ${rainClass}">${h.rainIn ?? 0}"</span></td>
          <td>${h.rainChance ?? 0}%</td>
          <td>${h.windMph ?? "—"}</td>
          <td>${windDirLabel(h.windDir)}</td>
          <td>${storm}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <table class="hour-table">
      <thead>
        <tr>
          <th>Hour</th>
          <th>Rain</th>
          <th>Chance</th>
          <th>Wind mph</th>
          <th>Dir</th>
          <th>Storms</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function marineTable(hours) {
  const rows = hours
    .map((h) => {
      const rainClass = (h.rainIn ?? 0) > 0 ? "wet" : "";
      const stormRow = h.isStorm ? "storm-row" : "";
      const storm = h.isStorm
        ? `<span class="storm-badge">${stormLabel(h.weatherCode)}</span>`
        : stormLabel(h.weatherCode);
      return `
        <tr class="${stormRow}">
          <td>${formatHourLabel(h.time)}</td>
          <td>${h.waveFt ?? "—"}</td>
          <td>${h.windWaveFt ?? "—"}</td>
          <td>${h.windMph ?? "—"}</td>
          <td><span class="rain-chip ${rainClass}">${h.rainIn ?? 0}"</span></td>
          <td>${storm}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <table class="hour-table">
      <thead>
        <tr>
          <th>Hour</th>
          <th>Waves ft</th>
          <th>Wind waves ft</th>
          <th>Wind mph</th>
          <th>Rain</th>
          <th>Storms</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function setStatus(msg, isError = false) {
  statusBar.textContent = msg;
  statusBar.classList.toggle("error", isError);
}

function renderReportsPage() {
  // Per-lake fishing reports. Each lake now gets its own full subtab + dedicated full-page content area (easy to access and scroll, mirroring the Records tab UX the user requested).
  // Content from public reports/guides (TPWD, AGFC, TWRA, ADCNR, USACE, local) as of 2026.
  // IMPORTANT: Temps/levels from the dated source reports — summer water is much warmer and patterns shift (deeper, different forage, etc.).
  // River and offshore cards focus on relevant species for bowfishing/charter too (gar, drum, etc.). Always verify live sources.

  const makeCard = (name, dateNote, speciesHTML, sourceHTML) => `
    <article class="report-card">
      <h3>${name}</h3>
      <div class="report-date">${dateNote}</div>
      ${speciesHTML}
      <p class="report-source-note">${sourceHTML}</p>
    </article>
  `;

  const reportItems = [
    { id: "conroe", html: makeCard(
      "Lake Conroe",
      "Based on March 2026 (LakeConroe.com / Butch Terpe) + Feb 2026 TPWD reports. Recent local observations (late May/early June 2026): daytime water temps mid-70s, lake ~1 ft low.",
      `<div class="species-report"><h4>Black Bass</h4><p>Per spring 2026 reports: many bass had finished the spawn, but not all. Late spawners can be aggressive. Rattle‑Traps, spinnerbaits, and plastic worms fished in the backs of creeks and coves in 2’–7′ depths around boat docks, stumps, grass beds, and rock. Fishing heats up as spring patterns take hold; buck bass fanning beds and larger females moving in with shad pushing shallow—rattle traps and perch-colored baits for reaction strikes in skinny water. Recent notes: bass biting well along edges with rattle traps and creature baits, cranking wind-blown points around shad schools.</p></div>
       <div class="species-report"><h4>Crappie</h4><p>Per spring reports: most crappie moved out to deeper water around bridge pilings, timber, and brush piles in 12’–20′ depths. Jigs and minnows best. Crappie moving shallow on the north end with warming water; south end on structure in 13-24 feet beginning to transition. Recent: crappie fair on brush 12–25 ft on jigs and minnows (lots of shorts mixed in some areas).</p></div>
       <div class="species-report"><h4>Hybrid Striped Bass &amp; White Bass</h4><p>Per spring reports: found on main lake humps and points south of the 1097 bridge in 15’–30′ depths. Trolling small Pet spoons or jigging slab spoons near the bottom; live shad or minnows effective. Hybrids caught in 8-28 feet on slabs, spoons, and large minnows or shad (many juveniles—check ID).</p></div>
       <div class="species-report"><h4>Catfish</h4><p>Per spring reports: two ways — baiting river/creek channels with milo or range cubes and fishing dip baits or shrimp, or shad under a bobber along bulkheads in shallow (cats move shallow feeding on spawning shad; best mornings). Catfish stack on baited holes in 10-40 feet with Catfish Bubblegum, liver, worms, and punch bait over cubes; drifting natural baits also good. Recent: catfish bite solid, quality up, bigger fish on baited holes 10–40 ft.</p></div>`,
      `<a href="https://lakeconroe.com/category/lake-conroe-fishing-report/" target="_blank" rel="noopener">Source: LakeConroe.com (March 2026 report by Butch Terpe)</a> · TPWD Feb 2026 · local posts`
    ) },
    { id: "samrayburn", html: makeCard(
      "Sam Rayburn",
      "Based on Feb 2026 TPWD / regional reports (lake ~9 ft low at time; water ~46°F reported then — summer temps much warmer; patterns shift significantly).",
      `<div class="species-report"><h4>Bass</h4><p>Per source reports: SLOW. Water muddy; lake low. Water temperatures in the pockets were 58-62 degrees. A cool front can slow the bite; fish stage on points and pockets preparing to transition shallow. Spinnerbaits and rattle traps effective for covering water and locating active fish. Surface temps noted around 69-71 in some updates, with best bite in 2' to 7' during spawn periods. (Adjust for current summer conditions.)</p></div>
       <div class="species-report"><h4>Crappie and White Bass</h4><p>Per reports: Crappie and white bass remain up the river, where minnows and Road Runners produce. Crappie good on brush piles in 10-12 feet on minnows and jigs. Bite has improved recently with nice crappie on the piles around 18 feet in updates.</p></div>
       <div class="species-report"><h4>Catfish</h4><p>Per reports: Catfish biting well in baited areas. Good numbers around big balls of shad noted in some reports. Target on the points with red crankbait or lipless crankbaits alongside other species.</p></div>`,
      `<a href="https://lufkindailynews.com/sports/outdoors/east-texas-fishing-report/" target="_blank" rel="noopener">Source: Lufkin Daily News / TPWD snippets</a> | <a href="https://attoyacoutfitters.com/fishing-reports" target="_blank" rel="noopener">Attoyac Outfitters</a>`
    ) },
    { id: "toledobend", html: makeCard(
      "Toledo Bend",
      "Based on Feb 2026 TPWD / Attoyac reports (lake ~4 ft low, water ~46°F and mid-50s at report time — summer water temps substantially higher; patterns change with season and level).",
      `<div class="species-report"><h4>Bass</h4><p>Per source reports: FAIR. Lake low. Fishing slowed due to high winds and cold temperatures (water mid-50s at time). A few fish moving shallow, but presentations worked very slowly. Most consistent action mid-depth 8-14 feet using football jigs, Texas-rigged plastics, and crankbaits. Wind can limit main-lake access; conditions expected to improve with better weather.</p></div>
       <div class="species-report"><h4>Crappie</h4><p>Per reports: Crappie beginning to bite well in backs of creeks in 2-8 feet on live bait and jigs. Heavy rain can muddy creeks and slow the bite. Crappie also good on minnows moving deeper in other notes.</p></div>
       <div class="species-report"><h4>Striped Bass / White Bass / Catfish</h4><p>Per reports: Striped bass remain fair in deep water. White bass fair, staying deep off points mainly with spoons. Catfish noted in regional patterns. Overall fishing well with bass in wide range of depths 2 to 25 feet using variety of techniques.</p></div>`,
      `<a href="https://attoyacoutfitters.com/fishing-reports" target="_blank" rel="noopener">Source: Attoyac Outfitters / TPWD</a>`
    ) },
    { id: "stillhouse", html: makeCard(
      "Stillhouse Hollow",
      "Based on Feb 2026 TPWD (water ~60°F, 1.9 ft low at report) + May 2026 Captain Experiences / local guide notes (water ~72° in updates).",
      `<div class="species-report"><h4>White Bass</h4><p>Per source reports: FAIR. Water stained; ~1.9 ft below pool at time. It is a "tale of two fisheries" for white bass — fish steadily making their way up the Lampasas River to spawn, and fish still in the main lake. River fishery best weekdays/poor weather (less pressure). Trolling crankbaits imitating medium threadfin shad (Bomber 5A, Storm Smash Shad); horsehead jigs white/chartreuse <2". Side-imaging for migrating schools. Main lake: deep lethargic fish become more aggressive; look 35 ft or less along old channel (bright conditions) or 12-14 ft at low light/clouds. Mini Alabama rig or MAL Originals with sawtooth retrieve.</p></div>
       <div class="species-report"><h4>Largemouth Bass</h4><p>Per reports: fair targeting nomadic fish with minnow-style soft plastics. Forward-facing sonar key for schools following bait (sometimes dozens of fish). Alabama rigs in submerged vegetation 12–20 ft (multiple fish from one area). Updates note water ~72°, bass holding shallow <6 ft on flats with submerged vegetation (mix spawn/post-spawn); also deep structure. Finesse worms, Neko-rig creature baits on grass flats.</p></div>
       <div class="species-report"><h4>Other (Catfish, Crappie, Smallmouth, etc.)</h4><p>Channel catfish throughout the year; drift shad on flats good, trotlining upper lake best. Crappie and white bass variable per reports. Smallmouth present; solid ones on mid-strolling minnow plastics over deep water in some updates.</p></div>`,
      `<a href="https://captainexperiences.com/fishing-reports/locations/regions/stillhouse-hollow-lake" target="_blank" rel="noopener">Source: Captain Experiences / TPWD</a>`
    ) },
    { id: "belton", html: makeCard(
      "Lake Belton",
      "Based on spring 2026 TPWD + Captain Experiences / local central TX reports (hybrids a standout; water ~65-72°F in updates — summer patterns shift deeper with warmer water).",
      `<div class="species-report"><h4>Hybrid Striped Bass &amp; White Bass</h4><p>Belton is known as a strong hybrid fishery. Fish main lake points, humps and creek channels 15-30+ ft with slabs, spoons, live shad or trolling small crankbaits. Recent reports note good numbers of hybrids and whites schooling on bait; watch for surface activity early/late.</p></div>
       <div class="species-report"><h4>Largemouth / Smallmouth Bass</h4><p>Rocky banks, timber and points produce. Crankbaits, spinnerbaits and Texas rigs in 5-15 ft. Smallmouth like the clearer rocky areas. Post-spawn fish moving to deeper structure as water warms.</p></div>
       <div class="species-report"><h4>Crappie &amp; Catfish</h4><p>Crappie on brush and timber 10-20 ft with jigs/minnows. Catfish (blue/channel) good on cut bait or shrimp in channels and baited areas 10-40 ft. Gar and buffalo also present for bowfishing interest.</p></div>`,
      `<a href="https://tpwd.texas.gov/fishboat/fish/recreational/lakes/belton/" target="_blank" rel="noopener">Source: TPWD Belton</a> · Captain Experiences / local guides 2026`
    ) },
    { id: "whitney", html: makeCard(
      "Lake Whitney",
      "Based on 2026 TPWD / USACE Brazos reports (lake often noted  a few ft low; water temps rising fast into summer — adjust from spring snapshots).",
      `<div class="species-report"><h4>Bass (Largemouth / Spotted)</h4><p>Points, creeks and timber in 5-15 ft. Spinnerbaits, crankbaits and plastics effective. River arm and main lake pockets hold fish; watch shad schools. Low water concentrates bass on remaining cover.</p></div>
       <div class="species-report"><h4>Crappie &amp; Hybrids/Stripers</h4><p>Crappie on brushpiles and timber 8-18 ft. Hybrids and stripers chase shad in open water or over points — slabs and live bait. Good seasonal fishery on the Brazos impoundment.</p></div>
       <div class="species-report"><h4>Catfish &amp; River Species</h4><p>Blues and channels on bottom rigs or trotlines in deeper river channel areas. The riverine nature means good gar, carp and buffalo potential too (bowfishing friendly stretches below dam).</p></div>`,
      `<a href="https://tpwd.texas.gov/fishboat/fish/recreational/lakes/whitney/" target="_blank" rel="noopener">Source: TPWD Whitney</a> · USACE / local Brazos reports`
    ) },
    { id: "waco", html: makeCard(
      "Lake Waco",
      "Based on 2026 TPWD + USACE / local Waco reports (city lake with good structure; reefs and attractors help concentrate fish).",
      `<div class="species-report"><h4>Bass</h4><p>Largemouth and spotted around the three freshwater reefs, timber and points. Cranks, spinnerbaits and creature baits in 4-12 ft. City lake means good access and consistent pressure but solid numbers.</p></div>
       <div class="species-report"><h4>Crappie &amp; Catfish</h4><p>Crappie on brush and attractors 8-15 ft with jigs/minnows. Blues and channels biting on cut bait or shrimp in 10-25 ft channels and near structure. Good eating fish here.</p></div>`,
      `<a href="https://tpwd.texas.gov/fishboat/fish/recreational/lakes/waco/" target="_blank" rel="noopener">Source: TPWD Waco</a> · USACE Lake Waco fishing page`
    ) },
    { id: "hubbard", html: makeCard(
      "Hubbard Creek",
      "Based on Feb 2026 TPWD report (water stained, 58°F, 14.85 ft low at time). Lake remains significantly low in recent level data (~44-45% full as of late May 2026); adjust expectations for low-water patterns.",
      `<div class="species-report"><h4>Bass</h4><p>Per report: SLOW. Water stained; low pool. Target bass on the points with red crankbait or lipless crankbaits. Popular with largemouth (including Florida strain) and tournament anglers. With low levels, focus on points and available cover.</p></div>
       <div class="species-report"><h4>Crappie</h4><p>When full, excellent white crappie in Hubbard and Sandy Creeks late fall/winter. Per reports: crappie holding in cover; with low water look for remaining brush/structure in creeks/channels. Crappie and white bass caught up the creeks in notes.</p></div>
       <div class="species-report"><h4>White Bass and Catfish</h4><p>Opportunities in upper areas and channels. Catfishing often underrated — good populations of channel cats. Good around big balls of shad. Look for white crappie/white bass in creeks when levels allow.</p></div>`,
      `<a href="https://tpwd.texas.gov/fishboat/fish/recreational/lakes/hubbard_creek/" target="_blank" rel="noopener">Source: TPWD Hubbard Creek Lake page</a>`
    ) },
    { id: "brazos", html: makeCard(
      "Brazos River (Whitney-Waco)",
      "Based on 2026 TPWD basin notes + local river reports (flow-dependent; tailrace below Whitney and stretches toward Waco). River levels fluctuate with dam releases — check gauges.",
      `<div class="species-report"><h4>Gar, Carp &amp; Buffalo (Bowfishing)</h4><p>Classic river bowfishing water. Alligator gar, spotted gar, smallmouth buffalo and common carp in guts, bends and shallow flats at night or low light. Lights and bow rigs standard. Good numbers in the Whitney to Waco stretch when flows are right.</p></div>
       <div class="species-report"><h4>Smallmouth Bass &amp; Catfish</h4><p>Smallmouth in the faster rocky sections and below the dam. Cranks, tubes, spinnerbaits. Channel and blue cats on cut bait or live in deeper holes and runs. Drum also common.</p></div>
       <div class="species-report"><h4>Other</h4><p>White bass and hybrids can push up from the lake. Always watch for changing flows from Whitney Dam generation — safety first on the river.</p></div>`,
      `<a href="https://tpwd.texas.gov/fishboat/fish/recreational/lakes/brazos/" target="_blank" rel="noopener">TPWD Brazos</a> | Brazos River Authority gauges &amp; local reports`
    ) },
    { id: "ouachita", html: makeCard(
      "Lake Ouachita",
      "Based on spring 2026 AGFC reports (water ~70°F in recent updates; crappie moving to mid-depth brush after quick spawn — run and gun for active schools). Clear water lake in the Ouachita NF.",
      `<div class="species-report"><h4>Crappie (Black &amp; White)</h4><p>Run-and-gun brushpiles and mid-depth structure 10-16 ft with jigs (red/chartreuse, Monkey Milk) or minnows. Some fish still shallow early, most transitioning. Good numbers when you find the right piles.</p></div>
       <div class="species-report"><h4>Bass (Spotted / Largemouth)</h4><p>Breaking fish on surface with silver/gold spoons or topwater. Trolling crankbaits for suspended schools. Clear water means finesse or live bait in 8-20 ft around points and timber.</p></div>
       <div class="species-report"><h4>Stripers / Hybrids &amp; Bream</h4><p>Schools of breaking whites/hybrids — cast spoons or small swimbaits. Bream bedding in shallows for easy limits. Catfish also available in deeper channels.</p></div>`,
      `<a href="https://www.agfc.com/news/arkansas-wildlife-weekly-fishing-report/" target="_blank" rel="noopener">AGFC Weekly Reports (Ouachita mentions)</a> · USACE Ouachita`
    ) },
    { id: "bullshoals", html: makeCard(
      "Bull Shoals Lake",
      "Based on 2026 AGFC / guide reports (lake often a few ft low; stripers a signature fish, water 66-70°F in spring updates). Generation flows affect fishing — check USACE.",
      `<div class="species-report"><h4>Striped Bass</h4><p>Trophy striper water. Look for schools on main lake points, humps and over deep brush 15-40 ft. Live shad, large spoons, umbrella rigs or trolling deep divers. Night fishing can be excellent.</p></div>
       <div class="species-report"><h4>Bass (Largemouth / Spotted)</h4><p>Power fishing with spinnerbaits, Chatterbaits and crankbaits on wind-blown banks and drains when stained or overcast. Finesse (Ned, shaky head, Neko) on clear calm days on deep ledges and brush.</p></div>
       <div class="species-report"><h4>Crappie, Walleye &amp; Catfish</h4><p>Crappie on brush and timber. Walleye on points and flats (jigs, crawler harnesses). Good channel cats on baited areas and trotlines. Tailwater below dam has trout but focus lake proper for charter.</p></div>`,
      `<a href="https://www.agfc.com/news/arkansas-wildlife-weekly-fishing-report/" target="_blank" rel="noopener">AGFC (Bull Shoals updates + Del Colvin guides)</a> · USACE`
    ) },
    { id: "tablerock", html: makeCard(
      "Table Rock Lake",
      "Based on 2026 AGFC / USACE / MO reports (excellent multi-species bass lake on the White River system; clear to stained water depending on rain).",
      `<div class="species-report"><h4>Bass (Smallmouth / Largemouth / Spotted)</h4><p>World-class smallmouth on main lake points, bluff ends and rocky banks — tubes, crankbaits, spinnerbaits, Ned rigs. Largemouth in coves and vegetation. Spotted bass abundant on deep structure. Topwater early mornings when shad are active.</p></div>
       <div class="species-report"><h4>Crappie &amp; Other</h4><p>Crappie on brushpiles and timber in 8-18 ft. Walleye and catfish round out the mix. The lake's size and clarity make electronics key for finding schools and structure.</p></div>`,
      `<a href="https://www.agfc.com/news/arkansas-wildlife-weekly-fishing-report/" target="_blank" rel="noopener">AGFC Table Rock</a> | USACE Table Rock Lake`
    ) },
    { id: "pickwick", html: makeCard(
      "Pickwick Lake",
      "Based on 2026 TWRA / local Tennessee River reports (diverse riverine to lake fishery; ledge fishing legendary in summer). Spans TN/AL/MS — check regs per state.",
      `<div class="species-report"><h4>Bass (Largemouth / Smallmouth / Spotted)</h4><p>Upper river section (below Wilson) for smallmouth and spotted on current breaks and ledges. Main lake for largemouth around grass and wood. Jerkbaits, crankbaits, swimbaits, and forward-facing sonar for suspended fish. Pickwick is a multi-species bass factory.</p></div>
       <div class="species-report"><h4>Stripers / Sauger &amp; Crappie</h4><p>Stripers in the river and lower lake on live bait or big swimbaits. Sauger on sand/gravel bars and current. Crappie on brush and timber in the creeks and main lake pockets.</p></div>
       <div class="species-report"><h4>Catfish &amp; Gar</h4><p>Blues and channels in deep holes and river channel. Gar and drum common — good bowfishing targets in the upper riverine sections.</p></div>`,
      `<a href="https://www.tn.gov/twra/fishing/weekly-fishing-report.html" target="_blank" rel="noopener">TWRA Weekly (Pickwick area)</a> · ADCNR / local river reports`
    ) },
    { id: "guntersville", html: makeCard(
      "Lake Guntersville",
      "Based on 2025-2026 ADCNR / guide reports (Alabama's largest lake, 69k acres of grass; legendary for big largemouth. Hydrilla/milfoil key habitat).",
      `<div class="species-report"><h4>Largemouth Bass</h4><p>THE grass lake. Target milfoil and hydrilla edges, pockets and mats with frogs, spinnerbaits, chatterbaits, Texas rigs and flipping. Big fish come from the grass. Also main river channel ledges and points for numbers. Forward-facing sonar helps locate schools in open water too.</p></div>
       <div class="species-report"><h4>Crappie, Sauger &amp; Catfish</h4><p>Crappie on brush, bridges and grass lines (jigs/minnows). Sauger in current areas and tailwaters. Blues and channels on cut bait in deeper river and creek mouths. Excellent variety fishery.</p></div>`,
      `<a href="https://www.outdooralabama.com/reservoirs/lake-guntersville" target="_blank" rel="noopener">Outdoor Alabama Guntersville</a> · TWRA (small TN portion) + local guides`
    ) },
    { id: "wattsbar", html: makeCard(
      "Watts Bar Lake",
      "Based on 2026 TWRA Region 3 reports (Tennessee River mainstem impoundment; good mix of bass, stripers (stocked), crappie and cats. Habitat improvements ongoing).",
      `<div class="species-report"><h4>Bass (Largemouth / Smallmouth)</h4><p>Main channel breaks, points and creek mouths in 5-15 ft for largemouth. Smallmouth on rocky banks and current. Jerkbaits, glides, crankbaits and shaky heads. Stocked Florida strain LM improving the fishery.</p></div>
       <div class="species-report"><h4>Striped Bass / Walleye &amp; Crappie</h4><p>Stripers (stocked) in open water and over points with live bait or large spoons. Walleye on bars and flats. Crappie on brush and timber 8-18 ft. Good numbers reported in recent creel data.</p></div>
       <div class="species-report"><h4>Catfish &amp; Drum</h4><p>Blues, channels and flatheads on bottom rigs, trotlines and jugs. Freshwater drum (sheepshead) common and fun on light tackle or for bowfishing.</p></div>`,
      `<a href="https://www.tn.gov/twra/fishing/where-to-fish/cumberland-plateau-r3/watts-bar-reservoir.html" target="_blank" rel="noopener">TWRA Watts Bar</a> · Weekly fishing reports (Region 3)`
    ) },
  ];

  let lakeButtons = '';
  let lakeViews = '';
  reportItems.forEach(item => {
    const loc = LOCATIONS[item.id];
    const short = loc ? (loc.shortLabel || loc.label) : item.id;
    lakeButtons += `<button type="button" class="sub-btn lake-report-subtab-btn" data-lake="${item.id}">${short}</button>`;

    lakeViews += `
      <div id="lake-report-view-${item.id}" class="reports-view lake-report-view" style="display:none;">
        ${item.html}
      </div>
    `;
  });

  return `
    <div class="reports-page">
      <p class="reports-intro">
        <strong>Fishing Reports</strong><br>
        Use the lake subtabs below. Each lake gets its own full dedicated report area with detailed species info and sources (full page feel for easy access and scrolling).<br>
        Reports are dated snapshots from the most recent publicly available reports. In summer, expect significantly warmer water and different patterns by region. Always check the linked sources for updates and observe current on-water conditions.
      </p>

      <div class="records-subtab-section">
        <div class="records-subtab-label">Lake Fishing Reports</div>
        <div class="subtab-buttons reports-subtabs lake-subtabs">
          ${lakeButtons}
        </div>
        <div class="records-subtab-content" id="lake-reports-content">
          ${lakeViews}
        </div>
      </div>

      <p class="reports-footer">Sources include TPWD, AGFC, TWRA, ADCNR, USACE and local guides. TPWD weekly reports currently paused in some areas. All reports explicitly dated — conditions change with seasons, water levels, generation and weather. Use as reference only and verify latest via the source links. Trinity River has special dam data on the Water Report tab; Surfside uses marine sources.</p>
      <p class="reports-footer shop-teaser">Check the <strong>Shop</strong> tab for gear and supplies.</p>
    </div>
  `;
}

/** New Records tab: subtabs for lakes and separate subtabs for states.
 * Clicking a lake subtab shows ONLY that lake's records, taking the full content area.
 * Separate state subtabs show the full state records for that state.
 * Clean, scrollable, full-page feel for the selected item.
 */
export function renderRecordsPage() {
  // Build lake buttons and hidden views
  let lakeButtons = '';
  let lakeViews = '';
  WEATHER_TAB_ORDER.forEach(id => {
    if (!LAKE_BOWFISHING_RECORDS[id]) return;
    const loc = LOCATIONS[id];
    const short = loc.shortLabel || loc.label;
    const records = LAKE_BOWFISHING_RECORDS[id];
    lakeButtons += `<button type="button" class="sub-btn lake-subtab-btn" data-lake="${id}">${short}</button>`;

    let rows = records.map(r => `
      <tr>
        <td><strong>${r.species}</strong></td>
        <td>${r.weight || "N/A"}</td>
        <td>${r.length || "N/A"}</td>
        <td>${r.girth || "N/A"}</td>
        <td>${r.date || "N/A"}</td>
        <td>${r.waterbody || loc.label}</td>
        <td>${r.angler || "N/A"}</td>
      </tr>
    `).join('');

    lakeViews += `
      <div id="lake-view-${id}" class="records-view lake-view" style="display:none;">
        <h3>${loc.label} — Bowfishing Records</h3>
        <div class="records-table-wrap">
          <table class="records-table">
            <thead>
              <tr>
                <th>Species</th>
                <th>Weight</th>
                <th>Length</th>
                <th>Girth</th>
                <th>Date</th>
                <th>Waterbody</th>
                <th>Angler</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
        <p class="record-note">Records may not be accurate; we are working on verifying them with official sources. Data from TPWD, BAA, etc. Always verify latest official records.</p>
      </div>
    `;
  });

  // Build state buttons and hidden views
  let stateButtons = '';
  let stateViews = '';
  const stateKeys = ['texas', 'arkansas', 'tennessee', 'alabama'];
  const stateNice = { texas: 'Texas', arkansas: 'Arkansas', tennessee: 'Tennessee', alabama: 'Alabama' };
  stateKeys.forEach(st => {
    if (!STATE_BOWFISHING_RECORDS[st]) return;
    const records = STATE_BOWFISHING_RECORDS[st];
    stateButtons += `<button type="button" class="sub-btn state-subtab-btn" data-state="${st}">${stateNice[st]}</button>`;

    let rows = records.map(r => `
      <tr>
        <td><strong>${r.species}</strong></td>
        <td>${r.weight || "N/A"}</td>
        <td>${r.length || "N/A"}</td>
        <td>${r.girth || "N/A"}</td>
        <td>${r.date || "N/A"}</td>
        <td>${r.waterbody || ""}</td>
        <td>${r.angler || "N/A"}</td>
      </tr>
    `).join('');

    stateViews += `
      <div id="state-view-${st}" class="records-view state-view" style="display:none;">
        <h3>${stateNice[st]} State Bowfishing Records</h3>
        <div class="records-table-wrap">
          <table class="records-table">
            <thead>
              <tr>
                <th>Species</th>
                <th>Weight</th>
                <th>Length</th>
                <th>Girth</th>
                <th>Date</th>
                <th>Waterbody</th>
                <th>Angler</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
        <p class="record-note">Records may not be accurate; we are working on verifying them with official sources. Official state records (BAA / wildlife agencies). Always verify current.</p>
      </div>
    `;
  });

  return `
    <div class="records-page">
      <p class="reports-intro">
        <strong>Bowfishing Records</strong><br>
        Use the subtabs below. Lake subtabs show one lake at a time (full area for its species records).<br>
        State subtabs are completely separate — click a state to see its full records.
      </p>

      <!-- LAKE SUBTABS (separate from state) -->
      <div class="records-subtab-section">
        <div class="records-subtab-label">Lake Records</div>
        <div class="subtab-buttons records-subtabs lake-subtabs">
          ${lakeButtons}
        </div>
        <div class="records-subtab-content" id="lake-records-content">
          ${lakeViews}
        </div>
      </div>

      <!-- STATE SUBTABS (completely separate) -->
      <div class="records-subtab-section">
        <div class="records-subtab-label">State Records</div>
        <div class="subtab-buttons records-subtabs state-subtabs">
          ${stateButtons}
        </div>
        <div class="records-subtab-content" id="state-records-content">
          ${stateViews}
        </div>
      </div>

      <p class="reports-footer">
        Data compiled from TPWD, BAA, AGFC, TWRA, ADCNR etc. Verify latest official sources — records update over time.
      </p>
    </div>
  `;
}

function initRecordsSubtabs() {
  // Lake subtabs
  const lakeBtns = document.querySelectorAll('.lake-subtab-btn');
  const lakeContent = document.getElementById('lake-records-content');
  if (lakeBtns.length && lakeContent) {
    lakeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.lake;
        // hide all lake views
        lakeContent.querySelectorAll('.lake-view').forEach(v => v.style.display = 'none');
        // show selected
        const view = document.getElementById('lake-view-' + id);
        if (view) view.style.display = 'block';
        // active button
        lakeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
    // default: show first lake
    const firstLake = lakeBtns[0];
    if (firstLake) {
      const id = firstLake.dataset.lake;
      lakeContent.querySelectorAll('.lake-view').forEach(v => v.style.display = 'none');
      const view = document.getElementById('lake-view-' + id);
      if (view) view.style.display = 'block';
      firstLake.classList.add('active');
    }
  }

  // State subtabs (completely independent)
  const stateBtns = document.querySelectorAll('.state-subtab-btn');
  const stateContent = document.getElementById('state-records-content');
  if (stateBtns.length && stateContent) {
    stateBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const st = btn.dataset.state;
        stateContent.querySelectorAll('.state-view').forEach(v => v.style.display = 'none');
        const view = document.getElementById('state-view-' + st);
        if (view) view.style.display = 'block';
        stateBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
    // default: show first state
    const firstState = stateBtns[0];
    if (firstState) {
      const st = firstState.dataset.state;
      stateContent.querySelectorAll('.state-view').forEach(v => v.style.display = 'none');
      const view = document.getElementById('state-view-' + st);
      if (view) view.style.display = 'block';
      firstState.classList.add('active');
    }
  }
}

/** Reports subtabs: each lake gets a full dedicated content area (easy access, no cramped grid).
 * Modeled exactly after the Records lake subtabs the user requested previously.
 */
function initReportsSubtabs() {
  const reportBtns = document.querySelectorAll('.lake-report-subtab-btn');
  const reportContent = document.getElementById('lake-reports-content');
  if (reportBtns.length && reportContent) {
    reportBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.lake;
        reportContent.querySelectorAll('.lake-report-view').forEach(v => v.style.display = 'none');
        const view = document.getElementById('lake-report-view-' + id);
        if (view) view.style.display = 'block';
        reportBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
    // default: show first lake
    const first = reportBtns[0];
    if (first) {
      const id = first.dataset.lake;
      reportContent.querySelectorAll('.lake-report-view').forEach(v => v.style.display = 'none');
      const view = document.getElementById('lake-report-view-' + id);
      if (view) view.style.display = 'block';
      first.classList.add('active');
    }
  }
}

/** Register the Service Worker for offline support + better update control.
 *  This is foundational for "real app" behavior (works without signal, fast subsequent loads,
 *  and we can use it to surface "new version" prompts that pair with the Refresh button).
 */
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  // Register on load to not block the initial render.
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js?v=20240629')
      .then((reg) => {
        console.log('[StrumCity] Service Worker registered', reg.scope);

        // If there's a waiting SW, the page can tell it to activate (we can wire this to the Refresh button later).
        if (reg.waiting) {
          // For now just log; the in-app refresh will handle navigation which helps.
          console.log('[StrumCity] New SW waiting — use Refresh app button or hard reload');
        }

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[StrumCity] New content available — prompt user to refresh');
                // In a future iteration we can show a non-intrusive "Update available" toast here.
              }
            });
          }
        });
      })
      .catch((err) => console.warn('[StrumCity] SW registration failed (ok for localhost sometimes)', err));
  });
}

/**
 * Shop tab: Bowfishing gear store powered by Shopify (dropshipping model).
 * 
 * HOW IT WORKS FOR DROPSHIPPING (user has Shopify account):
 * 1. In your Shopify admin: Add products (bows, reels, accessories) at your selling price.
 *    Connect suppliers via Shopify apps (e.g. DSers, Oberlo alternatives, or direct manufacturer
 *    integrations / wholesale apps) so orders auto-forward and ship direct from manufacturer.
 *    You never touch inventory or shipping.
 * 2. Customers see/buy here on Line & Dock → Shopify handles payment/checkout.
 *    You keep the margin (minus Shopify fees).
 * 3. No extra space bloat: Use Shopify CDN for product images (we embed, not host here).
 *    Current site ~40MB (all images); adding shop adds almost 0MB to repo.
 * 
 * EASIEST IMPLEMENTATION (vanilla JS, no build needed):
 * - Use Shopify "Buy Button" (generate embed code in Shopify admin > Sales channels > Buy Button).
 * - Paste the script + <div id="product-component-xxx"></div> here.
 * - Or for a full mini-store: Use the JS Buy SDK (CDN) to fetch collections/products dynamically.
 * 
 * This is 100% possible and common for niche sites like this.
 * 
 * TODO for user: 
 * - Provide your Shopify store domain (e.g. your-store.myshopify.com) and a storefront access token
 *   (or just paste Buy Button embed codes for specific products/collections).
 * - Set up dropshipping apps/suppliers in Shopify first.
 * 
 * For now: Placeholder with instructions + example embed structure.
 * Once you give Shopify details, we can wire real products.
 */
function renderShopPage() {
  // Teaser for the full Shopify-powered shop (dropshipping). Real products + Buy Buttons coming soon.
  // Products shown in rows of 3 on click of the browse button. Store is new, adding more daily.

  return `
    <div id="shop-root" class="shop-page">
      <div class="shop-intro" style="text-align:center; margin-bottom:0.5rem;">
        <h2 style="margin:0 0 0.2rem; color:var(--accent); font-size:1.65rem;">🛒 StrumCity Gear Shop</h2>
      </div>

      <p style="text-align:center; font-size:0.85rem; color:#9aa3b2; margin-bottom:0.6rem;">
        The store is new and we are adding any products we can (some untested). More daily.
      </p>

      <!-- Products in rows of 3 - shown immediately when you click the Shop tab. No categories or extra clicks needed. The store is new and we are adding any products we can (some untested). -->
      <div class="product-previews" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:0.6rem; justify-content:center;">
        <div id='product-component-1780535390692'></div>
        <div id='product-component-1780535461842'></div>
        <div id='product-component-1780535486125'></div>
        <div id='product-component-1780535687596'></div>
        <div id='product-component-1780535726852'></div>
        <div id='product-component-1780536642792'></div>
        <div id='product-component-1780536663490'></div>
        <div id='product-component-1780536708386'></div>
        <div id='product-component-1780539953777'></div>
        <div id='product-component-1780540080342'></div>
      </div>

      <p class="fine" style="text-align:center; margin-top:1rem; opacity:0.7; font-size:0.75rem;">
        Quick checkout on Shopify • No more jumping between sites
      </p>
    </div>
  `;
}

// Products show directly on shop tab load in 3-col grid. No category buttons or extra clicks. Store is new, adding any products (some untested).

function initShopifyEmbeds() {
  // If using real Buy Button embeds, Shopify's script auto-inits on the divs.
  // If using full SDK for dynamic load (better for many products), call ShopifyBuyInit here with your domain/token.
  // Example placeholder:
  if (window.ShopifyBuy && window.ShopifyBuy.UI) {
    // ShopifyBuyInit(); // uncomment + define when user provides details
    console.log('[StrumCity Shop] Shopify Buy SDK loaded. Ready for real embeds.');
  }
}

function initShopifyTestProductEmbed() {
  // Initialize all provided test Buy Button embeds (preview only, inside coming soon area)
  const embeds = [
    { nodeId: 'product-component-1780535390692', productId: '8600847581319' },
    { nodeId: 'product-component-1780535461842', productId: '8600845713543' },
    { nodeId: 'product-component-1780535486125', productId: '8600844075143' },
    { nodeId: 'product-component-1780535687596', productId: '8600845418631' },
    { nodeId: 'product-component-1780535726852', productId: '8600845058183' },
    { nodeId: 'product-component-1780536642792', productId: '8600844468359' },
    { nodeId: 'product-component-1780536663490', productId: '8600849973383' },
    { nodeId: 'product-component-1780536708386', productId: '8600848138375' },
    { nodeId: 'product-component-1780539953777', productId: '8600846106759' },
    { nodeId: 'product-component-1780540080342', productId: '8600948244615' }
  ];

  function tryInitAll() {
    if (!window.ShopifyBuy || !window.ShopifyBuy.UI) {
      setTimeout(tryInitAll, 150);
      return;
    }
    var client = ShopifyBuy.buildClient({
      domain: 'uzce1n-nj.myshopify.com',
      storefrontAccessToken: '43c74b540bf607549d2530986eae7e55',
    });
    ShopifyBuy.UI.onReady(client).then(function (ui) {
      embeds.forEach(function (embed) {
        const node = document.getElementById(embed.nodeId);
        if (node) {
          try {
            ui.createComponent('product', {
              id: embed.productId,
              node: node,
              moneyFormat: '%24%7B%7Bamount%7D%7D',
              options: {
                "product": {
                  "styles": {
                    "product": {
                      "max-width": "100%",
                      "width": "100%"
                    }
                  },
                  "text": {
                    "button": "Buy now"
                  }
                },
                "productSet": {
                  "styles": {
                    "products": {
                      "margin-left": "0"
                    }
                  }
                },
                "modalProduct": {
                  "contents": {
                    "img": false,
                    "imgWithCarousel": true,
                    "button": false,
                    "buttonWithQuantity": true
                  },
                  "styles": {
                    "product": {
                      "max-width": "100%",
                      "margin-left": "0px",
                      "margin-bottom": "0px"
                    }
                  },
                  "text": {
                    "button": "Buy now"
                  }
                },
                "option": {},
                "cart": {
                  "text": {
                    "total": "Subtotal",
                    "button": "Checkout"
                  }
                },
                "toggle": {}
              },
            });
          } catch(e) {
            console.log('[StrumCity Shop] Test embed init error for ' + embed.nodeId, e);
          }
        }
      });
    });
  }
  tryInitAll();
}

// TODO: When user provides Shopify details, replace the placeholder cards + add real SDK init like:
// const client = ShopifyBuy.buildClient({ domain: 'your-store.myshopify.com', storefrontAccessToken: 'xxx' });
// Then fetch collections/products and render custom cards + cart.

function getShopContent() {
  // Helper for re-render after SDK load.
  return document.getElementById('shop-products') ? '' : renderShopPage(); // simplified
}
