import { LOCATIONS, WEATHER_TAB_ORDER, MAIN_TABS } from "./config.js";
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
    taglineEl.textContent = "Live radar animation · zoom & play recent + nowcast frames";
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

  const listItems = ranges.map(r => `
    <li>
      <strong>${r.range}:</strong> ${r.label}${r.note ? ` — ${r.note}` : ""}
    </li>
  `).join("");

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
      </div>
      <div id="radar-map" class="radar-map"></div>
      <p class="radar-note">Data © RainViewer. Shows recent past + short-term nowcast radar frames. Use location buttons to center/zoom on area. Play animates the loop.</p>
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
    attributionControl: true
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
      const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
      if (!res.ok) throw new Error('RainViewer API error');
      const data = await res.json();

      const past = (data.radar && data.radar.past) || [];
      const nowcast = (data.radar && data.radar.nowcast) || [];

      // take recent past (last ~8 frames ~80min) + all nowcast (~2h)
      frames = [
        ...past.slice(-8),
        ...nowcast
      ].map(f => ({
        time: f.time,
        url: `https://tilecache.rainviewer.com${f.path}/256/{z}/{x}/{y}/2/1_1.png`
      })).slice(-12); // limit to ~12 frames for smooth loop

      if (frames.length > 0) {
        setRadarFrame(0);
      }
    } catch (e) {
      console.error('Failed to load radar:', e);
      mapEl.innerHTML = '<p style="padding:1rem; color:var(--storm);">Radar feed temporarily unavailable. Please try again later.</p>';
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
        updateInterval: 200
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
          const z = loc.mapZoom || (loc.type === 'marine' ? 8 : 9);
          window.radarMapInstance.flyTo([loc.latitude, loc.longitude], z, { duration: 0.7 });
        }
      });
      locContainer.appendChild(btn);
    });
  }

  await loadRadarData();

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