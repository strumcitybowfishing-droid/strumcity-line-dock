/** 0 = green (calm/dry), 100 = red (wind > 10 mph and/or rain chance > 40%) */

const WIND_LIMIT_MPH = 10;
const RAIN_LIMIT_PCT = 40;

export function computeDayGaugeScore(hours) {
  if (!hours?.length) {
    return { score: 0, maxWind: 0, maxRainChance: 0 };
  }

  let maxWind = 0;
  let maxRainChance = 0;

  for (const h of hours) {
    const wind = h.windMph ?? 0;
    maxWind = Math.max(maxWind, wind);
    maxRainChance = Math.max(maxRainChance, h.rainChance ?? 0);
  }

  const windFactor = Math.min(1, maxWind / WIND_LIMIT_MPH);
  const rainFactor = Math.min(1, maxRainChance / RAIN_LIMIT_PCT);
  const score = Math.round(Math.max(windFactor, rainFactor) * 100);

  return {
    score,
    maxWind: Math.round(maxWind),
    maxRainChance: Math.round(maxRainChance),
  };
}

function needleColor(score) {
  if (score < 35) return "#39ff14";
  if (score < 65) return "#b8ff00";
  return "#ff4444";
}

export function renderDayGauge(score, uid) {
  const angle = 180 - (score / 100) * 180;
  const color = needleColor(score);
  const gradId = `gg-${uid}`;

  return `
    <div class="day-gauge-wrap" title="Green = calm &amp; dry. Red = wind over ${WIND_LIMIT_MPH} mph or rain over ${RAIN_LIMIT_PCT}%">
      <svg class="day-gauge" viewBox="0 0 100 54" role="img" aria-label="Roughness ${score} percent, higher is worse">
        <defs>
          <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#39ff14" />
            <stop offset="100%" stop-color="#ff4444" />
          </linearGradient>
        </defs>
        <path d="M 14 46 A 36 36 0 0 1 86 46" fill="none" stroke="#1a1a1a" stroke-width="7" />
        <path d="M 14 46 A 36 36 0 0 1 86 46" fill="none" stroke="url(#${gradId})" stroke-width="5" stroke-linecap="round" />
        <g transform="rotate(${angle} 50 46)">
          <line x1="50" y1="46" x2="50" y2="14" stroke="${color}" stroke-width="2.5" stroke-linecap="round" />
        </g>
        <circle cx="50" cy="46" r="3.5" fill="#0a0a0a" stroke="${color}" stroke-width="1.5" />
      </svg>
    </div>
  `;
}

export function renderDayHeaderContent(day, index, dayTitle) {
  const { score, maxWind, maxRainChance } = computeDayGaugeScore(day.hours);
  const uid = (day.dayKey ?? `d${index}`).replace(/-/g, "");
  const gauge = renderDayGauge(score, uid);

  return `
    <div class="day-header-main">
      ${gauge}
      <div class="day-header-text">
        <h2>${dayTitle}</h2>
        <p class="day-gauge-meta">Peak ${maxWind} mph · Rain ${maxRainChance}%</p>
      </div>
    </div>
    <div class="day-summary">${day.summary}</div>
    <span class="chevron" aria-hidden="true">▼</span>
  `;
}