import { EVENING_HOURS } from "./config.js";

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