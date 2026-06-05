import { EVENING_HOURS } from "./config.js?v=20250608";

const MPH_PER_KMH = 0.621371;
const INCH_PER_MM = 0.0393701;
const FT_PER_M = 3.28084;

export function kmhToMph(kmh) {
  return kmh == null ? null : Math.round(kmh * MPH_PER_KMH);
}

export function mmToInches(mm) {
  return mm == null ? null : Math.round(mm * INCH_PER_MM * 100) / 100;
}

export function mToFeet(m) {
  return m == null ? null : Math.round(m * FT_PER_M * 10) / 10;
}

export function windDirLabel(deg) {
  if (deg == null) return "—";
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const idx = Math.round(deg / 45) % 8;
  return `${dirs[idx]} (${Math.round(deg)}°)`;
}

/** WMO weather code: thunderstorm / severe */
export function isStormCode(code) {
  if (code == null) return false;
  return code >= 95 && code <= 99;
}

export function stormLabel(code) {
  if (code == null) return "";
  if (code === 95) return "Thunder";
  if (code === 96 || code === 99) return "Thunder + hail";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (isStormCode(code)) return "Storm";
  return "";
}

export function parseLocalHour(isoLocal) {
  const hour = parseInt(isoLocal.slice(11, 13), 10);
  return hour;
}

export function formatHourLabel(isoLocal) {
  const h = parseLocalHour(isoLocal);
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${suffix}`;
}

export function formatDayHeading(isoLocal) {
  const dayKey = isoLocal.slice(0, 10);
  const todayChicago = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Chicago",
  });
  const label = new Date(`${dayKey}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "America/Chicago",
  });
  return dayKey === todayChicago ? `Today · ${label}` : label;
}

export function filterEveningHours(times, ...series) {
  const indices = [];
  for (let i = 0; i < times.length; i++) {
    const hour = parseLocalHour(times[i]);
    if (EVENING_HOURS.has(hour)) indices.push(i);
  }
  return indices.map((i) => {
    const row = { time: times[i] };
    series.forEach((arr, idx) => {
      row[`s${idx}`] = arr[i];
    });
    return row;
  });
}

export function groupRowsByDay(rows, valueKeys) {
  const days = new Map();
  for (const row of rows) {
    const dayKey = row.time.slice(0, 10);
    if (!days.has(dayKey)) days.set(dayKey, []);
    const entry = { time: row.time };
    valueKeys.forEach((k, idx) => {
      entry[k] = row[`s${idx}`];
    });
    days.get(dayKey).push(entry);
  }
  return [...days.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(0, 7);
}

export function formatNumber(n, unit = "") {
  if (n == null || Number.isNaN(n)) return "—";
  return `${n}${unit}`;
}

export function formatCfs(value) {
  if (value == null) return "—";
  return `${Number(value).toLocaleString()} cfs`;
}

export function formatTimestamp(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    timeZone: "America/Chicago",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Returns zone info for a CFS value for color + label */
export function getCfsZone(cfs) {
  if (cfs == null || Number.isNaN(cfs)) {
    return { cls: "low", text: "No reading", color: "var(--muted)" };
  }
  if (cfs >= 2000 && cfs <= 7000) {
    return { cls: "bow", text: "Perfect for bowfishing", color: "var(--accent)" };
  }
  if (cfs >= 5000 && cfs <= 15000) {
    return { cls: "rod", text: "Great for rod & reel", color: "#67e8f9" };
  }
  if (cfs > 15000) {
    return { cls: "flood", text: "Flood stage", color: "var(--storm)" };
  }
  return { cls: "low", text: "Below optimal", color: "var(--muted)" };
}

/** Color for wind speed on graphs/sidebar, matching the wind conditions legend ranges for good/bad fishing */
export function getWindColor(mph) {
  if (mph == null || Number.isNaN(mph)) return "#6b7280";
  if (mph <= 7) return "#22c55e"; // 1-7 mph: glassy or rippled — good fishing (fishable)
  if (mph <= 11) return "#eab308"; // 8-11 mph: a little choppy — marginal
  return "#ef4444"; // 12+ mph: hard/tough or hazardous — bad fishing
}

/** Visual slider bar showing where the current CFS sits (1000–40k range) */
export function createCfsBar(cfs) {
  if (cfs == null || Number.isNaN(cfs)) return "";

  const min = 1000;
  const max = 40000;
  const clamped = Math.max(min, Math.min(max, cfs));
  const pct = ((clamped - min) / (max - min)) * 100;

  const p2k = ((2000 - min) / (max - min)) * 100;
  const p7k = ((7000 - min) / (max - min)) * 100;
  const p15k = ((15000 - min) / (max - min)) * 100;

  // Gradient with zones: low gray -> bow green -> rod cyan -> flood red
  const gradient = `linear-gradient(to right,
    #6b7280 0%,
    #6b7280 ${p2k}%,
    var(--accent) ${p2k}%,
    var(--accent) ${p7k}%,
    #67e8f9 ${p7k}%,
    #67e8f9 ${p15k}%,
    var(--storm) ${p15k}%,
    var(--storm) 100%
  )`.replace(/\s+/g, " ");

  return `
    <div class="cfs-bar-container">
      <div class="cfs-bar" style="background:${gradient};">
        <div class="cfs-marker" style="left:${pct}%;"></div>
      </div>
      <div class="cfs-ticks">
        <span>1k</span>
        <span>2k</span>
        <span>7k</span>
        <span>15k</span>
        <span>40k</span>
      </div>
      <div class="cfs-legend">
        <span class="legend-item"><span class="dot bow"></span>2k–7k bowfishing</span>
        <span class="legend-item"><span class="dot rod"></span>5k–15k rod &amp; reel</span>
        <span class="legend-item"><span class="dot flood"></span>15k+ flood</span>
      </div>
    </div>
  `;
}
