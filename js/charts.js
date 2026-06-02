/**
 * Responsive SVG line charts for hourly wind / wave trends.
 */

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

  const paths = series.map((s) => {
    const points = s.values.map((v, i) => {
      const x = pad.left + i * step;
      const safe = v == null || Number.isNaN(v) ? minY : v;
      const y = pad.top + scaleValue(safe, minY, maxY, innerH);
      return `${x},${y}`;
    });
    const dash = s.dashed ? ' stroke-dasharray="5 4"' : "";
    return `<polyline class="chart-line" fill="none" stroke="${s.color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"${dash} points="${points.join(" ")}"/>`;
  });

  const xLabels = labels
    .map((label, i) => {
      if (!label) return "";
      const x = pad.left + i * step;
      return `<text x="${x}" y="${height - 8}" class="chart-axis" text-anchor="middle">${label}</text>`;
    })
    .join("");

  const legend = series
    .map(
      (s) =>
        `<span class="chart-legend-item"><span class="chart-legend-swatch" style="background:${s.color}"></span>${s.label}</span>`
    )
    .join("");

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