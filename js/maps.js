/** Map background: local satellite JPG per spot, Leaflet fallback if missing. */

let map = null;
let topoLayer = null;
let leafletReady = null;
let useLeaflet = false;

const staticImg = () => document.getElementById("map-static");

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

function loadLeaflet() {
  if (leafletReady) return leafletReady;

  leafletReady = (async () => {
    if (globalThis.L) return globalThis.L;

    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    try {
      await loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js");
    } catch {
      await loadScript("https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js");
    }

    if (!globalThis.L) throw new Error("Map library did not load");
    return globalThis.L;
  })();

  return leafletReady;
}

async function initMapBackground() {
  const L = await loadLeaflet();
  const el = document.getElementById("map-bg");
  if (!el || map) return;

  map = L.map(el, {
    center: [30.36, -95.59],
    zoom: 11,
    zoomControl: false,
    attributionControl: true,
    scrollWheelZoom: false,
    dragging: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
  });

  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 19, attribution: "Esri" }
  ).addTo(map);

  topoLayer = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    maxZoom: 17,
    opacity: 0.5,
    attribution: "OpenTopoMap",
  });

  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 19, opacity: 0.65 }
  ).addTo(map);
}

function showStaticMap(loc) {
  const el = document.getElementById("map-bg");
  const img = staticImg();
  if (!el || !img) return Promise.reject(new Error("Map container missing"));

  document.body.classList.add("map-active");
  el.classList.remove("is-hidden", "map-mode-leaflet");
  el.classList.add("map-mode-static");
  el.setAttribute("aria-hidden", "false");

  useLeaflet = false;
  const leafletPane = el.querySelector(".leaflet-container");
  if (leafletPane) leafletPane.style.visibility = "hidden";

  const src = `images/maps/${loc.id}.jpg`;

  return new Promise((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`No static map: ${src}`));
    if (img.dataset.location === loc.id && img.src.endsWith(`${loc.id}.jpg`) && img.complete && img.naturalWidth > 0) {
      resolve();
      return;
    }
    img.dataset.location = loc.id;
    img.alt = `Satellite map — ${loc.label}`;
    img.src = src;
  });
}

async function showLeafletMap(loc) {
  const el = document.getElementById("map-bg");
  document.body.classList.add("map-active");
  el?.classList.remove("is-hidden", "map-mode-static");
  el?.classList.add("map-mode-leaflet");
  el?.setAttribute("aria-hidden", "false");

  const img = staticImg();
  if (img) img.removeAttribute("src");

  await initMapBackground();
  if (!map || !el) throw new Error("Map container missing");

  useLeaflet = true;
  const leafletPane = el.querySelector(".leaflet-container");
  if (leafletPane) leafletPane.style.visibility = "visible";

  const zoom =
    loc.mapZoom ??
    (loc.type === "marine" ? 9 : loc.id === "samrayburn" || loc.id === "toledobend" ? 10 : 11);

  if (loc.type === "marine") {
    if (topoLayer && map.hasLayer(topoLayer)) map.removeLayer(topoLayer);
  } else if (topoLayer && !map.hasLayer(topoLayer)) {
    topoLayer.addTo(map);
  }

  map.setView([loc.latitude, loc.longitude], zoom, { animate: true, duration: 0.5 });

  requestAnimationFrame(() => map.invalidateSize());
  setTimeout(() => map.invalidateSize(), 100);
  setTimeout(() => map.invalidateSize(), 500);
}

export async function showLocationMap(loc) {
  try {
    await showStaticMap(loc);
  } catch {
    await showLeafletMap(loc);
  }
}

export function hideLocationMap() {
  document.body.classList.remove("map-active");
  const el = document.getElementById("map-bg");
  el?.classList.add("is-hidden");
  el?.setAttribute("aria-hidden", "true");
}