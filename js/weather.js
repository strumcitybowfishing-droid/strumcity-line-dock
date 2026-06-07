import { TIMEZONE } from "./config.js?v=20250621";
import {
  filterEveningHours,
  groupRowsByDay,
  isStormCode,
  kmhToMph,
  mmToInches,
  mToFeet,
} from "./utils.js?v=20250621";

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

/** NWS (weather.gov) fallback using raw grid data for *variable* (non-quantized 0/5/10) wind values,
 *  plus gusts/dir + better precip. One fetch (direct grid url via precomputed), faster than before.
 *  Produces synthetic Open-Meteo shape so normalize* + charts/tables work unchanged.
 */
async function fetchNwsWeatherShape(lat, lon) {
  const ua = {
    "User-Agent": "StrumCity-Line-Dock/1.0 (https://strumcity-line-dock.onrender.com)",
  };

  // Precomputed from points to avoid extra roundtrip (faster graph loads). See collect script in history.
  const GRID_MAP = {
    '30.3569,-95.5922': 'HGX/55,121',
    '31.06,-94.12': 'LCH/25,131',
    '31.02,-93.52': 'LCH/48,129',
    '31.63,-97.48': 'FWD/63,54',
    '31.11,-97.47': 'FWD/63,31',
    '31.87,-97.37': 'FWD/67,64',
    '31.56,-97.21': 'FWD/73,50',
    '32.826,-98.571': 'FWD/23,107',
    '30.588,-95.129': 'HGX/72,131',
    '28.223,-94.92': 'HGX/80,27',
    '34.60,-93.33': 'LZK/44,66',
    '36.48,-92.65': 'LZK/67,150',
    '36.57,-93.30': 'SGF/67,6',
    '34.99,-88.19': 'HUN/4,51',
    '34.41,-86.26': 'HUN/76,29',
    '35.74,-84.71': 'MRX/43,39',
  };
  const key = `${lat},${lon}`;
  const gridRef = GRID_MAP[key];
  if (!gridRef) throw new Error(`No NWS grid mapping for ${key}`);
  const gridUrl = `https://api.weather.gov/gridpoints/${gridRef}`;

  const gRes = await fetch(gridUrl, { headers: ua });
  if (!gRes.ok) throw new Error(`NWS grid failed (${gRes.status})`);
  const g = await gRes.json();
  const props = g?.properties || {};

  const windSpeedVals = props.windSpeed?.values || [];
  const windGustVals = props.windGust?.values || [];
  const windDirVals = props.windDirection?.values || [];
  const popVals = props.probabilityOfPrecipitation?.values || [];
  const qpfVals = props.quantitativePrecipitation?.values || [];
  const weatherVals = props.weather?.values || [];

  const hourData = {}; // '2026-06-04T17:00' -> {precipMm, pop, windKmh, gustKmh, dir, wcode}

  function chicagoHourString(date) {
    const tz = 'America/Chicago';
    const ymd = date.toLocaleDateString('en-CA', { timeZone: tz });
    let h = date.toLocaleTimeString('en-US', { timeZone: tz, hour: 'numeric', hour12: false }).trim();
    if (h === '24') h = '00';
    h = h.padStart(2, '0');
    return `${ymd}T${h}:00`;
  }

  function expandLoop(entries, apply) {
    for (const e of entries) {
      if (e.value == null) continue;
      const [startStr, durStr] = (e.validTime || '').split('/');
      if (!startStr) continue;
      const start = new Date(startStr);
      let hrs = 1;
      if (durStr && durStr.startsWith('PT')) {
        const mm = durStr.match(/PT(\d+)H/);
        if (mm) hrs = parseInt(mm[1], 10) || 1;
      }
      for (let i = 0; i < hrs; i++) {
        const t = new Date(start.getTime() + i * 3600 * 1000);
        const ts = chicagoHourString(t);
        if (!hourData[ts]) hourData[ts] = { precipMm: 0, pop: 0, windKmh: null, gustKmh: null, dir: null, wcode: 0 };
        apply(hourData[ts], e.value, hrs);
      }
    }
  }

  // QPF: inches over multi-hr block -> prorated mm per hour
  expandLoop(qpfVals, (slot, val, hrs) => {
    const perHrIn = (val || 0) / (hrs || 1);
    slot.precipMm = perHrIn * 25.4;
  });

  // POP: %
  expandLoop(popVals, (slot, val) => { slot.pop = Math.round(val || 0); });

  // Wind m/s -> kmh (for synthetic shape)
  expandLoop(windSpeedVals, (slot, val) => { slot.windKmh = Math.round((val || 0) * 3.6); });

  // Gust m/s -> kmh
  expandLoop(windGustVals, (slot, val) => { slot.gustKmh = Math.round((val || 0) * 3.6); });

  // Dir: already degrees
  expandLoop(windDirVals, (slot, val) => { slot.dir = Math.round(val || 0); });

  // Weather conditions -> wmo-ish code for storms etc
  expandLoop(weatherVals, (slot, wxList) => {
    slot.wcode = wxToCode(wxList);
  });

  // Build aligned arrays (future hours only to avoid old days in UI)
  const nowStr = chicagoHourString(new Date());
  const allTimes = Object.keys(hourData).sort();
  const useTimes = allTimes.filter((t) => t >= nowStr); // include current hour onward
  const finalTimes = useTimes.length ? useTimes : allTimes;

  const time = [], precipitation = [], precipitation_probability = [];
  const wind_speed_10m = [], wind_gusts_10m = [], wind_direction_10m = [], weather_code = [];

  for (const ts of finalTimes) {
    const d = hourData[ts] || {};
    time.push(ts);
    precipitation.push(d.precipMm || 0);
    precipitation_probability.push(d.pop || 0);
    wind_speed_10m.push(d.windKmh != null ? d.windKmh : 0);
    const g = (d.gustKmh != null ? d.gustKmh : (d.windKmh != null ? d.windKmh : 0));
    wind_gusts_10m.push(g);
    wind_direction_10m.push(d.dir != null ? d.dir : 0);
    weather_code.push(d.wcode || 0);
  }

  if (time.length === 0) throw new Error('No NWS grid hours after filtering');

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

function wxToCode(wxList) {
  if (!wxList || !wxList.length) return 0;
  const first = wxList[0] || {};
  const w = (first.weather || '').toLowerCase();
  const cov = (first.coverage || '').toLowerCase();
  if (w.includes('thunder') || w.includes('tornado')) return 95;
  if (w.includes('snow')) return 71;
  if (w.includes('sleet') || w.includes('ice')) return 66;
  if (w.includes('freez')) return 67;
  if (w.includes('shower')) return 80;
  if (w.includes('rain') || w.includes('drizzle')) return 61;
  if (w.includes('fog') || w.includes('mist')) return 45;
  if (cov.includes('overcast') || cov.includes('cloud')) return 3;
  if (cov.includes('clear') || cov.includes('sun')) return 0;
  return 1;
}
