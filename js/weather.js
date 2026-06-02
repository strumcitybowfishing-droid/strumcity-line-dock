import { TIMEZONE } from "./config.js";
import {
  filterEveningHours,
  groupRowsByDay,
  isStormCode,
  kmhToMph,
  mmToInches,
  mToFeet,
} from "./utils.js";

const FORECAST_PARAMS = [
  "precipitation",
  "precipitation_probability",
  "wind_speed_10m",
  "wind_gusts_10m",
  "wind_direction_10m",
  "weather_code",
].join(",");

export async function fetchWeatherForecast(lat, lon) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lat);
  url.searchParams.set("longitude", lon);
  url.searchParams.set("hourly", FORECAST_PARAMS);
  url.searchParams.set("timezone", TIMEZONE);
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("wind_speed_unit", "kmh");

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather request failed (${res.status})`);
  const data = await res.json();
  return normalizeWeather(data);
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

  const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
  weatherUrl.searchParams.set("latitude", lat);
  weatherUrl.searchParams.set("longitude", lon);
  weatherUrl.searchParams.set("hourly", FORECAST_PARAMS);
  weatherUrl.searchParams.set("timezone", TIMEZONE);
  weatherUrl.searchParams.set("forecast_days", "7");
  weatherUrl.searchParams.set("wind_speed_unit", "kmh");

  const [marineRes, weatherRes] = await Promise.all([
    fetch(marineUrl),
    fetch(weatherUrl),
  ]);
  if (!marineRes.ok) throw new Error(`Marine request failed (${marineRes.status})`);
  if (!weatherRes.ok) throw new Error(`Weather request failed (${weatherRes.status})`);

  const marine = await marineRes.json();
  const weather = await weatherRes.json();
  return normalizeMarine(marine, weather, { fullDay });
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