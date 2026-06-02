import { LOCATIONS, WEATHER_TAB_ORDER, MAIN_TABS, REPORT_SOURCES } from "./config.js";
import { fetchWeatherForecast, fetchMarineForecast } from "./weather.js";
import { fetchTraLivingston, formatTraObserved } from "./tra.js";
import { buildLineChart, chartHourLabels } from "./charts.js";
import { renderPhotosPage } from "./gallery.js";
import { renderCharterPage } from "./charter.js";
import { renderDayHeaderContent } from "./gauge.js";
import { showLocationMap, hideLocationMap, loadLeaflet } from "./maps.js";
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
} from "./utils.js";

const statusBar = document.getElementById("status-bar");
const forecastRoot = document.getElementById("forecast-root");
const extraPanels = document.getElementById("extra-panels");
const taglineEl = document.querySelector(".tagline");
const mainNavRoot = document.getElementById("main-nav");
const subNavRoot = document.getElementById("sub-nav");

const SUB_LABELS = {
  conroe: "Conroe",
  samrayburn: "Rayburn",
  toledobend: "Toledo",
  stillhouse: "Stillhouse",
  hubbard: "Hubbard",
  trinity: "Trinity",
  surfside: "Surfside",
};

const SUB_TITLES = {
  conroe: "Lake Conroe",
  samrayburn: "Sam Rayburn",
  toledobend: "Toledo Bend",
  stillhouse: "Stillhouse Hollow",
  hubbard: "Hubbard Creek",
  trinity: "Trinity · Cold Spring",
  surfside: "Surfside Offshore",
};

let activeMain = "conditions";
let activeLocation = "conroe";
let cache = {};

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

function buildSubNav() {
  subNavRoot.innerHTML = WEATHER_TAB_ORDER.map(
    (id) =>
      `<button type="button" class="sub-btn${id === activeLocation ? " active" : ""}" data-location="${id}" title="${SUB_TITLES[id]}">${SUB_LABELS[id]}</button>`
  ).join("");

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
}

buildMainNav();
buildSubNav();
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
    return;
  }

  if (mainId === "photos") {
    setStatus("Strum City charter photos");
    taglineEl.textContent = "Strum City · Facebook, Instagram & charter highlights";
    forecastRoot.innerHTML = renderPhotosPage();
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
    if (cache[id]) {
      days = cache[id];
    } else {
      days =
        loc.type === "marine"
          ? await fetchMarineForecast(loc.latitude, loc.longitude, {
              fullDay: !!loc.fullDay,
            })
          : await fetchWeatherForecast(loc.latitude, loc.longitude);
      cache[id] = days;
    }

    if (loc.fullDay) {
      renderMarineCharts(days);
      setStatus(
        `${loc.label} · ${loc.subtitle} · 7-day hourly · Updated ${formatNow()}`
      );
    } else {
      renderForecast(days, false);
      setStatus(`${loc.label} · ${loc.subtitle} · 5pm–2am CT · Updated ${formatNow()}`);
    }
  } catch (err) {
    console.error(err);
    setStatus(`Could not load data: ${err.message}`, true);
  }
}

function formatNow() {
  return new Date().toLocaleTimeString("en-US", { timeZone: "America/Chicago" });
}

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

  // location buttons
  const locContainer = document.getElementById('radar-locations');
  if (locContainer && LOCATIONS) {
    Object.values(LOCATIONS).forEach(loc => {
      const btn = document.createElement('button');
      btn.textContent = loc.label.replace(' · Cold Spring', '');
      btn.dataset.loc = loc.id;
      btn.addEventListener('click', () => {
        if (window.radarMapInstance) {
          const z = Math.min(loc.mapZoom || (loc.type === 'marine' ? 8 : 9), 12);
          window.radarMapInstance.flyTo([loc.latitude, loc.longitude], z, { duration: 0.7 });
        }
      });
      locContainer.appendChild(btn);
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
  // Hardcoded current fishing reports per lake per species, based on available online sources (e.g. lakeconroe.com, TPWD snippets, guide reports). Update as new reports come in.
  const reportsHTML = `
    <article class="report-card">
      <h3>Lake Conroe</h3>
      <div class="species-report">
        <h4>Black Bass</h4>
        <p>Now that we have reached the month of April, many of the bass have finished the spawn, but not all. The late spawners seem to be sometimes a little more aggressive when they hit lures. Rattle‑Traps, spinnerbaits, and plastic worms are all good lure choices at this time fished in the backs of creeks and coves in 2’–7′ depths. Boat docks, stumps, grass beds, and any rock structure are the types of cover that bass can be found around. Fishing is heating up as spring patterns take hold; buck bass fanning beds and larger females moving in behind them with shad pushing shallow—rattle traps and perch-colored baits getting strong reaction strikes in skinny water.</p>
      </div>
      <div class="species-report">
        <h4>Crappie</h4>
        <p>Most of the crappie will have moved out to deeper water and can be caught around key areas such as bridge pilings, timber, and brush piles in 12’–20′ depths. Jigs and minnows are your best baits during this time of year. Crappie are moving shallow on the north end with warming water, while on the south end they remain on structure in 13-24 feet but are beginning to transition; minnows and jigs working lake-wide.</p>
      </div>
      <div class="species-report">
        <h4>Hybrid Striped Bass &amp; White Bass</h4>
        <p>These fish can be found on most of the main lake humps and points south of the 1097 bridge in 15’–30′ depths. Trolling small Pet spoons or jigging slab spoons near the bottom are good patterns to use when catching these fish. Also, using live shad or minnows can be very effective at times. Hybrids are being caught in 8-28 feet on slabs, spoons, and large minnows or shad (many juveniles—check ID).</p>
      </div>
      <div class="species-report">
        <h4>Catfish</h4>
        <p>There are two different ways of catching catfish at this time of year. One is by baiting up an area along the river or a creek channel with milo or range cubes and fishing with dip baits or shrimp. The other is to use shad under a bobber and fish along a bulkhead in shallow water. Catfish move shallow during this time of year feeding on shad that are spawning. This type of fishing for cats is best during the morning hours. Catfish are stacking on baited holes in 10-40 feet of water, with Catfish Bubblegum, liver, worms, and punch bait over cubes producing steady catches, while drifting natural baits is yielding quality fish.</p>
      </div>
      <p class="report-source-note"><a href="https://lakeconroe.com/category/lake-conroe-fishing-report/" target="_blank" rel="noopener">Source: LakeConroe.com (March 2026 report by Butch Terpe)</a> · TPWD Feb 2026</p>
    </article>

    <article class="report-card">
      <h3>Sam Rayburn</h3>
      <div class="species-report">
        <h4>Bass</h4>
        <p>SLOW. Water muddy; 46 degrees; 9.01 feet below pool. Water temperatures in the pockets are 58-62 degrees, and the lake has risen slightly but remains about 9 feet low. A recent cool front is expected to slow the bite for a few days, but fish should soon begin moving up to scout bedding areas. Focus on points and pockets where bass are staging and preparing to transition shallow. Spinnerbaits and rattle traps are effective for covering water and locating active fish. Surface temps 69-71, bass spawning best bite in 2' to 7'.</p>
      </div>
      <div class="species-report">
        <h4>Crappie and White Bass</h4>
        <p>Crappie and white bass remain up the river, where minnows and Road Runners are producing. Crappie are good on brush piles in 10-12 feet of water on minnows and jigs. As far as crappie, the bite has gotten a lot better recently with some really nice crappie on the piles in about 18 feet.</p>
      </div>
      <div class="species-report">
        <h4>Catfish</h4>
        <p>Catfish are biting well in baited areas. Target on the points with red crankbait or lipless crankbaits for other species, but catfish action noted in reports. Good numbers around big balls of shad in some reports.</p>
      </div>
      <p class="report-source-note"><a href="https://lufkindailynews.com/sports/outdoors/east-texas-fishing-report/" target="_blank" rel="noopener">Source: Lufkin Daily News / TPWD snippets</a> | <a href="https://attoyacoutfitters.com/fishing-reports" target="_blank" rel="noopener">Attoyac Outfitters</a></p>
    </article>

    <article class="report-card">
      <h3>Toledo Bend</h3>
      <div class="species-report">
        <h4>Bass</h4>
        <p>FAIR. 46 degrees; 4.06 feet below pool. Fishing has slowed significantly due to high winds and cold temperatures, with water temperatures dropping back into the mid-50s. A few fish are moving shallow, but presentations must be worked very slowly to get bites. The most consistent action is coming from mid-depth ranges of 8-14 feet using football jigs, Texas-rigged plastics, and crankbaits. Access to main-lake areas has been limited by wind, but conditions are expected to improve.</p>
      </div>
      <div class="species-report">
        <h4>Crappie</h4>
        <p>Crappie are beginning to bite well in the backs of creeks, showing up in 2-8 feet of water on live bait and jigs. However, heavy rain is forecast this weekend, which could muddy up the creeks and slow the bite. Crappie are good on minnows moving deeper as well in other notes.</p>
      </div>
      <div class="species-report">
        <h4>Striped Bass / White Bass / Catfish</h4>
        <p>Striped bass remain fair in deep water. White bass are fair, staying deep off points mainly with spoons. Catfish noted in regional patterns. Toledo Bend is fishing well overall, with water temperatures in the mid to upper 50s and bass being caught in a wide range of depths from 2 to 25 feet, giving anglers success with a variety of techniques across the lake.</p>
      </div>
      <p class="report-source-note"><a href="https://attoyacoutfitters.com/fishing-reports" target="_blank" rel="noopener">Source: Attoyac Outfitters / TPWD</a></p>
    </article>

    <article class="report-card">
      <h3>Stillhouse Hollow</h3>
      <div class="species-report">
        <h4>White Bass</h4>
        <p>FAIR. Water stained; 60 degrees; 1.90 feet below pool. It is a "tale of two fisheries" right now for Stillhouse white bass. There are fish steadily making their way up the Lampasas River to spawn, and there are fish still residing in the main lake. The river fishery is best on the weekdays and during poor weather when fishing pressure is minimized. Trolling crankbaits which imitate medium-sized threadfin shad, like the Bomber 5A, or the Storm Smash Shad will put fish in the boat slowly but steadily. If you closely watch side-imaging, you will likely spot migrating schools which can be cast to to put bonus fish in the boat. Horsehead-style jigs with an underpin in white and chartreuse less than 2 inch long do well. Back on the main lake the deep, lethargic fish which have been present but difficult to goad into biting are now much more aggressive. Look in 35 feet or less along the old Lampasas River channel during bright conditions, and as shallow as 12-14 feet at first light, last light, and under cloud cover. The mini white bass Alabama rig with white paddle tails less than 3inches long or MAL Originals get the job done when retrieved with a sawtooth retrieve.</p>
      </div>
      <div class="species-report">
        <h4>Largemouth Bass</h4>
        <p>Bass are fair targeting nomadic fish roaming in open water with minnow-style soft plastics. Forward-facing sonar will play a key role in locating these schools. Large groups of bass, sometimes numbering dozens of fish, are following bait and can provide fast action once located. Alabama rigs will catch fish in submerged vegetation in 12–20 feet of water, where anglers can often catch multiple bass from the same area. Water temps around 72°, bass holding shallow in less than 6 feet around flats with submerged vegetation in some reports; also deep structure bites.</p>
      </div>
      <div class="species-report">
        <h4>Other (Catfish, Crappie, Smallmouth, etc.)</h4>
        <p>Channel catfish can be caught throughout the year. Drift fishing with shad across the flats is usually good. Trotlining is best in the upper lake. Crappie and white bass fishing noted in reports as variable. Smallmouth bass also present with solid ones reported on mid-strolling minnow plastics over deep water.</p>
      </div>
      <p class="report-source-note"><a href="https://captainexperiences.com/fishing-reports/locations/regions/stillhouse-hollow-lake" target="_blank" rel="noopener">Source: Captain Experiences / TPWD</a></p>
    </article>

    <article class="report-card">
      <h3>Hubbard Creek</h3>
      <div class="species-report">
        <h4>Bass</h4>
        <p>SLOW. Water Stained; 58 degrees; 14.85 feet below pool. Target bass on the points with red crankbait or lipless crankbaits. The lake is a popular choice for largemouth bass anglers, especially tournament anglers (Florida largemouth introduced 1979). With current low levels, focus on points and available cover.</p>
      </div>
      <div class="species-report">
        <h4>Crappie</h4>
        <p>When the reservoir is full, it is known for excellent white crappie fishing in Hubbard and Sandy Creeks in late fall and winter. Crappie noted in reports as holding in cover; with low water, look for remaining brush and structure in creeks and channels. Crappie and white bass are being caught up the creeks in regional notes.</p>
      </div>
      <div class="species-report">
        <h4>White Bass and Catfish</h4>
        <p>White bass and catfish fishing opportunities in upper areas and channels. Catfishing is often underrated: the lake supports good populations of catfish, especially channel cats. Catfish are good around big balls of shad. Look for white crappie and white bass fishing in the creeks when levels allow.</p>
      </div>
      <p class="report-source-note"><a href="https://tpwd.texas.gov/fishboat/fish/recreational/lakes/hubbard_creek/" target="_blank" rel="noopener">Source: TPWD Hubbard Creek Lake page</a></p>
    </article>

    <article class="report-card">
      <h3>Surfside Offshore</h3>
      <div class="species-report">
        <h4>Redfish</h4>
        <p>GOOD. High winds will blow water out of the back lakes and off the flats concentrating fish in guts and deeper holes. Expect numbers of redfish and drum. Target wind blown shorelines or wind blown drains off of a flat for redfish and drum. Redfish are good with mullet; slot redfish scattered but starting to cruise the first and second gut—best bait cut mullet or cracked crab. Also good in surf using live shrimp, shrimp bites and cut mullet.</p>
      </div>
      <div class="species-report">
        <h4>Speckled Trout</h4>
        <p>Coastal reports note good action for trout in guts and deeper holes with high winds. Use appropriate baits for structure. Trout are good drifting mid bay with artificials or in the surf with slow sinking lures and shrimp free lined along rocks. Fishing has been good to great on days we can get out with limits of trout and redfish. 7-day forecasts show high bite scores on certain days.</p>
      </div>
      <div class="species-report">
        <h4>Drum, Sheepshead, Pompano &amp; Inshore</h4>
        <p>Redfish, pompano and trout have been good in the surf. Black drum showing up in guts and deeper holes—best bait shrimp, Fishbites, or crab. Sheepshead around structure and jetties. Inshore wade, bank, or jetty fishing for flounder, redfish, or speckled trout when conditions allow.</p>
      </div>
      <div class="species-report">
        <h4>Offshore (Snapper, Mahi, Kings, etc.)</h4>
        <p>For further offshore (~50 mi), reports from guides note red snapper, ling (cobia), kingfish, bonita, mahi, and tuna bites in season. The deep water habitat attracts many varieties. Check specific forecasts and tides; offshore depth changes dramatically attracting pelagics.</p>
      </div>
      <p class="report-source-note"><a href="https://tpwd.texas.gov/fishboat/fish/action/reptmap.php?EcoRegion=GC" target="_blank" rel="noopener">Source: TPWD Gulf Coast</a> | <a href="https://windy.app/fishing/spot/5812433/Surfside+Beach" target="_blank" rel="noopener">Windy.app</a> | Local guides</p>
    </article>
  `;
  return `
    <div class="reports-page">
      <p class="reports-intro">Current and weekly fishing reports for our locations (excluding Trinity river). Reports written out by targeted species based on recent available online sources (e.g. lakeconroe.com, TPWD, guides). Sources update as available — always verify latest before heading out.</p>
      <div class="report-grid">
        ${reportsHTML}
      </div>
      <p class="reports-footer">TPWD weekly reports are currently paused. Data compiled from local and regional sources for reference.</p>
    </div>
  `;
}
