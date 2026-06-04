/**
 * Responsive SVG line charts for hourly wind / wave trends.
 */

import { getWindColor } from "./utils.js?v=20250605";

function scaleValue(value, min, max, size) {
  if (max <= min) return size / 2;
  return size - ((value - min) / (max - min)) * size;
}

function niceMax(values) {
  const max = Math.max(...values.filter((v) => v != null && !Number.isNaN(v)), 0);
  if (max <= 2) return 2;
  if (max <= 5) return Math.ceil(max);
  return Math.ceil(max * 1.15);
}

export function buildLineChart({
  title,
  labels,
  series,
  yUnit = "",
  height = 150,
}) {
  const pad = { top: 26, right: 10, bottom: 30, left: 38 };
  const width = 360;
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const allValues = series.flatMap((s) =>
    s.values.map((v) => (v == null || Number.isNaN(v) ? null : v)).filter((v) => v != null)
  );
  const minY = 0;
  const maxY = niceMax(allValues);
  const n = labels.length;
  const step = n > 1 ? innerW / (n - 1) : innerW;

  const yTicks = 4;
  const gridLines = [];
  for (let i = 0; i <= yTicks; i++) {
    const val = minY + ((maxY - minY) * i) / yTicks;
    const y = pad.top + scaleValue(val, minY, maxY, innerH);
    gridLines.push(
      `<line x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}" class="chart-grid"/>`
    );
    gridLines.push(
      `<text x="${pad.left - 6}" y="${y + 4}" class="chart-axis" text-anchor="end">${Math.round(val * 10) / 10}</text>`
    );
  }

  const paths = series.flatMap((s) => {
    const isWind = s.label === "Sustained" && title.toLowerCase().includes("wind");
    if (isWind) {
      // Color-code the wind line using the fishing condition ranges from the wind legend.
      // Good (<=7 mph: glassy/rippled) green; marginal (8-11) amber; bad (>=12) red.
      const segs = [];
      for (let i = 0; i < s.values.length - 1; i++) {
        const v1 = s.values[i];
        const v2 = s.values[i + 1];
        if (v1 == null && v2 == null) continue;
        const x1 = pad.left + i * step;
        const safe1 = v1 == null || Number.isNaN(v1) ? minY : v1;
        const y1 = pad.top + scaleValue(safe1, minY, maxY, innerH);
        const x2 = pad.left + (i + 1) * step;
        const safe2 = v2 == null || Number.isNaN(v2) ? minY : v2;
        const y2 = pad.top + scaleValue(safe2, minY, maxY, innerH);
        // Color segment based on the starting value (or could use max for conservative "worst in segment")
        const color = getWindColor(safe1);
        segs.push(
          `<polyline class="chart-line" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" points="${x1},${y1} ${x2},${y2}"/>`
        );
      }
      // Also draw dots at each point for visibility of exact value color
      const dots = s.values
        .map((v, i) => {
          if (v == null || Number.isNaN(v)) return "";
          const x = pad.left + i * step;
          const safe = v;
          const y = pad.top + scaleValue(safe, minY, maxY, innerH);
          const color = getWindColor(safe);
          return `<circle cx="${x}" cy="${y}" r="2.5" fill="${color}" />`;
        })
        .join("");
      return [...segs, dots];
    }
    // default single color polyline (waves etc)
    const points = s.values.map((v, i) => {
      const x = pad.left + i * step;
      const safe = v == null || Number.isNaN(v) ? minY : v;
      const y = pad.top + scaleValue(safe, minY, maxY, innerH);
      return `${x},${y}`;
    });
    const dash = s.dashed ? ' stroke-dasharray="5 4"' : "";
    return [
      `<polyline class="chart-line" fill="none" stroke="${s.color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"${dash} points="${points.join(" ")}"/>`,
    ];
  });

  const xLabels = labels
    .map((label, i) => {
      if (!label) return "";
      const x = pad.left + i * step;
      return `<text x="${x}" y="${height - 8}" class="chart-axis" text-anchor="middle">${label}</text>`;
    })
    .join("");

  let legend;
  const isWindGraph = title.toLowerCase().includes("wind") && series.some((s) => s.label === "Sustained");
  if (isWindGraph) {
    // Color key for wind graph, using the same good/marginal/bad fishing ranges as the wind conditions legend
    legend = `
      <span class="chart-legend-item"><span class="chart-legend-swatch" style="background:#22c55e"></span>≤7 mph: good fishing</span>
      <span class="chart-legend-item"><span class="chart-legend-swatch" style="background:#eab308"></span>8–11 mph: marginal</span>
      <span class="chart-legend-item"><span class="chart-legend-swatch" style="background:#ef4444"></span>12+ mph: bad fishing</span>
    `;
  } else {
    legend = series
      .map(
        (s) =>
          `<span class="chart-legend-item"><span class="chart-legend-swatch" style="background:${s.color}"></span>${s.label}</span>`
      )
      .join("");
  }

  return `
    <div class="chart-card">
      <div class="chart-card-head">
        <h3 class="chart-title">${title}</h3>
        <span class="chart-unit">${yUnit}</span>
      </div>
      <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${title}">
        ${gridLines.join("")}
        ${paths.join("")}
        ${xLabels}
      </svg>
      <div class="chart-legend">${legend}</div>
    </div>
  `;
}

/** Show every Nth hour label to keep 24h readable on mobile */
export function chartHourLabels(times, every = 3) {
  return times.map((t, i) => {
    const hour = parseInt(t.slice(11, 13), 10);
    if (i !== 0 && i !== times.length - 1 && hour % every !== 0) return "";
    const suffix = hour >= 12 ? "p" : "a";
    const h12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${h12}${suffix}`;
  });
}