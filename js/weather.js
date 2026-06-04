import { TIMEZONE } from "./config.js?v=20250605";
import {
  filterEveningHours,
  groupRowsByDay,
  isStormCode,
  kmhToMph,
  mmToInches,
  mToFeet,
} from "./utils.js?v=20250605";

const FORECAST_PARAMS = [
  "precipitation",
  "precipitation_probability",
  "wind_speed_10m",
  "wind_gusts_10m",
  "wind_direction_10m",
  "weather_code",
].join(",");

export async function fetchWeatherForecast(lat, lon) {
  try {
    const data = await fetchOpenMeteoWeather(lat, lon);
    return normalizeWeather(data);
  } catch (err) {
    console.warn("[StrumCity] Open-Meteo weather failed, using NWS fallback:", err && err.message ? err.message : err);
    const nwsData = await fetchNwsWeatherShape(lat, lon);
    return normalizeWeather(nwsData);
  }
}

export async function fetchMarineForecast(lat, lon, { fullDay = false } = {}) {
  const marineUrl = new URL("https://marine-api.open-meteo.com/v1/marine");
  marineUrl.searchParams.set("latitude", lat);
  marineUrl.searchParams.set("longitude", lon);
  marineUrl.searchParams.set(
    "hourly",
    "wave_height,wave_period,wind_wave_height,swell_wave_height"
  );
  marineUrl.searchParams.set("timezone", TIMEZONE);
  marineUrl.searchParams.set("forecast_days", "7");

  let weatherData;
  try {
    weatherData = await fetchOpenMeteoWeather(lat, lon);
  } catch (e) {
    console.warn("[StrumCity] Open-Meteo weather (paired for marine) failed, using NWS fallback:", e && e.message ? e.message : e);
    weatherData = await fetchNwsWeatherShape(lat, lon);
  }

  const marineRes = await fetch(marineUrl);
  if (!marineRes.ok) throw new Error(`Marine request failed (${marineRes.status})`);
  const marine = await marineRes.json();
  return normalizeMarine(marine, weatherData, { fullDay });
}

async function fetchOpenMeteoWeather(lat, lon) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lat);
  url.searchParams.set("longitude", lon);
  url.searchParams.set("hourly", FORECAST_PARAMS);
  url.searchParams.set("timezone", TIMEZONE);
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("wind_speed_unit", "kmh");

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather request failed (${res.status})`);
  return await res.json();
}

function normalizeWeather(data) {
  const h = data.hourly;
  const rows = filterEveningHours(
    h.time,
    h.precipitation,
    h.precipitation_probability,
    h.wind_speed_10m,
    h.wind_gusts_10m,
    h.wind_direction_10m,
    h.weather_code
  );

  const days = groupRowsByDay(rows, [
    "rainMm",
    "rainChance",
    "windKmh",
    "gustKmh",
    "windDir",
    "weatherCode",
  ]);

  return days.map(([dayKey, hours]) => ({
    dayKey,
    headingKey: hours[0].time,
    hours: hours.map(mapWeatherHour),
    summary: summarizeDay(hours.map(mapWeatherHour)),
  }));
}

function normalizeMarine(marineData, weatherData, { fullDay = false } = {}) {
  const m = marineData.hourly;
  const w = weatherData.hourly;

  const timeIndex = new Map(w.time.map((t, i) => [t, i]));
  const aligned = [];

  for (let i = 0; i < m.time.length; i++) {
    const t = m.time[i];
    const wi = timeIndex.get(t);
    if (wi == null) continue;
    aligned.push({
      time: t,
      waveM: m.wave_height[i],
      windWaveM: m.wind_wave_height[i],
      swellM: m.swell_wave_height[i],
      period: m.wave_period[i],
      rainMm: w.precipitation[wi],
      rainChance: w.precipitation_probability[wi],
      windKmh: w.wind_speed_10m[wi],
      gustKmh: w.wind_gusts_10m[wi],
      windDir: w.wind_direction_10m[wi],
      weatherCode: w.weather_code[wi],
    });
  }

  const filtered = fullDay
    ? aligned
    : aligned.filter((row) => {
        const hour = parseInt(row.time.slice(11, 13), 10);
        return [17, 18, 19, 20, 21, 22, 23, 0, 1, 2].includes(hour);
      });

  const days = new Map();
  for (const row of filtered) {
    const dayKey = row.time.slice(0, 10);
    if (!days.has(dayKey)) days.set(dayKey, []);
    days.get(dayKey).push(mapMarineHour(row));
  }

  const sliceLen = fullDay ? 24 : 10;

  return [...days.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(0, 7)
    .map(([dayKey, hours]) => {
      const trimmed = fullDay ? hours.slice(0, sliceLen) : hours;
      return {
        dayKey,
        headingKey: trimmed[0].time,
        hours: trimmed,
        summary: summarizeMarineDay(trimmed),
        fullDay,
      };
    });
}

function mapWeatherHour(row) {
  return {
    time: row.time,
    rainIn: mmToInches(row.rainMm),
    rainChance: row.rainChance ?? 0,
    windMph: kmhToMph(row.windKmh),
    gustMph: kmhToMph(row.gustKmh),
    windDir: row.windDir,
    weatherCode: row.weatherCode,
    isStorm: isStormCode(row.weatherCode),
  };
}

function mapMarineHour(row) {
  return {
    time: row.time,
    waveFt: mToFeet(row.waveM),
    windWaveFt: mToFeet(row.windWaveM),
    swellFt: mToFeet(row.swellM),
    period: row.period != null ? Math.round(row.period * 10) / 10 : null,
    rainIn: mmToInches(row.rainMm),
    rainChance: row.rainChance ?? 0,
    windMph: kmhToMph(row.windKmh),
    gustMph: kmhToMph(row.gustKmh),
    windDir: row.windDir,
    weatherCode: row.weatherCode,
    isStorm: isStormCode(row.weatherCode),
  };
}

function summarizeDay(hours) {
  const maxWind = Math.max(...hours.map((h) => h.windMph ?? 0));
  const totalRain = hours.reduce((s, h) => s + (h.rainIn ?? 0), 0);
  const storms = hours.filter((h) => h.isStorm).length;
  const parts = [`Wind to ${maxWind} mph`, `${totalRain.toFixed(2)} in rain`];
  if (storms) parts.push(`${storms} hr storm risk`);
  return parts.join(" · ");
}

function summarizeMarineDay(hours) {
  const maxWave = Math.max(...hours.map((h) => h.waveFt ?? 0));
  const maxWind = Math.max(...hours.map((h) => h.windMph ?? 0));
  const storms = hours.filter((h) => h.isStorm).length;
  const parts = [`Waves to ${maxWave} ft`, `Wind to ${maxWind} mph`];
  if (storms) parts.push("storms possible");
  return parts.join(" · ");
}

/** NWS (weather.gov) fallback for when Open-Meteo returns 5xx (outages/rate limits observed).
 *  Produces a synthetic response shape compatible with normalizeWeather / normalizeMarine.
 *  Uses NWS points -> grid hourly forecast (US only, covers all our locations).
 */
async function fetchNwsWeatherShape(lat, lon) {
  const ua = {
    "User-Agent": "StrumCity-Line-Dock/1.0 (https://strumcity-line-dock.onrender.com)",
  };
  const pointsUrl = `https://api.weather.gov/points/${lat},${lon}`;
  const pRes = await fetch(pointsUrl, { headers: ua });
  if (!pRes.ok) throw new Error(`NWS points failed (${pRes.status})`);
  const points = await pRes.json();
  const hourlyUrl = points?.properties?.forecastHourly;
  if (!hourlyUrl) throw new Error("No NWS forecastHourly URL from points");

  const hRes = await fetch(hourlyUrl, { headers: ua });
  if (!hRes.ok) throw new Error(`NWS hourly failed (${hRes.status})`);
  const h = await hRes.json();
  const periods = h?.properties?.periods || [];
  if (periods.length === 0) throw new Error("No NWS forecast periods");

  const time = [];
  const precipitation = [];
  const precipitation_probability = [];
  const wind_speed_10m = [];
  const wind_gusts_10m = [];
  const wind_direction_10m = [];
  const weather_code = [];

  for (const p of periods) {
    // NWS startTime e.g. "2026-06-04T08:00:00-05:00" -> strip to "2026-06-04T08:00" to match Open-Meteo tz format
    const t = (p.startTime || "").slice(0, 16);
    if (!t) continue;
    time.push(t);

    const pop = p.probabilityOfPrecipitation?.value ?? 0;
    precipitation_probability.push(pop);
    precipitation.push(0); // NWS /forecast/hourly does not include quantitativePrecip in these periods

    const wsMph = parseWindMph(p.windSpeed);
    const wsKmh = Math.round(wsMph / 0.621371);
    wind_speed_10m.push(wsKmh);

    // No gust field exposed in this NWS product; approximate (gusts not displayed in current UI anyway)
    const gMph = wsMph;
    wind_gusts_10m.push(Math.round(gMph / 0.621371));

    wind_direction_10m.push(cardinalToDeg(p.windDirection));

    weather_code.push(shortForecastToWmo(p.shortForecast || ""));
  }

  return {
    hourly: {
      time,
      precipitation,
      precipitation_probability,
      wind_speed_10m,
      wind_gusts_10m,
      wind_direction_10m,
      weather_code,
    },
  };
}

function parseWindMph(str) {
  if (!str) return 0;
  const m = String(str).match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

function cardinalToDeg(dir) {
  if (!dir) return 0;
  const d = String(dir).trim().toUpperCase();
  const map = {
    N: 0,
    NNE: 22,
    NE: 45,
    ENE: 67,
    E: 90,
    ESE: 112,
    SE: 135,
    SSE: 157,
    S: 180,
    SSW: 202,
    SW: 225,
    WSW: 247,
    W: 270,
    WNW: 292,
    NW: 315,
    NNW: 337,
  };
  return map[d] ?? 0;
}

function shortForecastToWmo(text) {
  const t = text.toLowerCase();
  if (t.includes("thunder") || t.includes("t-storm") || t.includes("storm")) return 95;
  if (t.includes("snow")) return 71;
  if (t.includes("sleet") || t.includes("ice")) return 66;
  if (t.includes("freez")) return 67;
  if (t.includes("shower")) return 80;
  if (t.includes("rain")) return 61;
  if (t.includes("drizzle")) return 51;
  if (t.includes("fog") || t.includes("mist")) return 45;
  if (t.includes("cloud") || t.includes("overcast")) return 3;
  if (t.includes("clear") || t.includes("sunny")) return 0;
  return 1;
}
