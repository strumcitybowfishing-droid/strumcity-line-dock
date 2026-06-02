import { LOCATIONS, WEATHER_TAB_ORDER, MAIN_TABS } from "./config.js";
import { fetchWeatherForecast, fetchMarineForecast } from "./weather.js";
import { fetchTraLivingston, formatTraObserved } from "./tra.js";
import { buildLineChart, chartHourLabels } from "./charts.js";
import { renderPhotosPage } from "./gallery.js";
import { renderCharterPage } from "./charter.js";
import { renderDayHeaderContent } from "./gauge.js";
import { showLocationMap, hideLocationMap } from "./maps.js";
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

  if (mainId === "conditions") {
    setSubNavVisible(true);
    loadWeatherLocation(activeLocation);
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
          {
            label: "Gusts",
            values: day.hours.map((h) => h.gustMph),
            color: "#c8ff9e",
            dashed: true,
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
      const table = isMarine ? marineTable(day.hours) : weatherTable(day.hours);
      return `
        <article class="day-block ${open}" data-day>
          <div class="day-header" role="button" tabindex="0" aria-expanded="${index === 0}">
            ${renderDayHeaderContent(day, index, formatDayHeading(day.headingKey))}
          </div>
          <div class="hour-table-wrap">${table}</div>
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
          <td>${h.windMph ?? "—"} / ${h.gustMph ?? "—"}</td>
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
          <th>Wind / Gust</th>
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
          <td>${h.windMph ?? "—"} / ${h.gustMph ?? "—"}</td>
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
          <th>Wind / Gust mph</th>
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