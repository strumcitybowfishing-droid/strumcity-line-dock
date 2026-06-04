// StrumCity Line & Dock Service Worker
// Basic offline + update support for the PWA.
// This is the foundation for making it feel like a "real app" (fast loads, works with poor signal, controlled updates).
//
// Strategy (simple, no Workbox):
// - Precache the core shell on install (HTML, CSS, main JS, manifest).
// - Runtime cache for images, fonts, radar tiles, etc.
// - For data fetches (weather etc.): prefer network, fall back to cache.
// - On new SW: skip waiting so the "Refresh app" button can activate it immediately.

const CACHE_NAME = 'strumcity-shell-v20240629';
const PRECACHE_URLS = [
  './',
  './index.html',
  './css/styles.css?v=20240629',
  './js/app.js?v=20240629',
  './js/config.js?v=20240629',
  './js/weather.js?v=20240629',
  './js/utils.js?v=20240629',
  './js/tra.js?v=20240629',
  './js/charts.js?v=20240629',
  './js/charter.js?v=20240629',
  './js/gauge.js?v=20240629',
  './js/maps.js?v=20240629',
  './js/gallery.js?v=20240629',
  './manifest.webmanifest'
  // Add more critical small assets here if needed (e.g. a logo once we have icons)
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch handler: shell from cache (fast + offline), data from network with cache fallback.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Don't interfere with the TRA proxy or external APIs we want fresh.
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }

  // For navigation / HTML: network first, fall back to cache (helps updates).
  if (req.mode === 'navigate' || (req.method === 'GET' && req.headers.get('accept')?.includes('text/html'))) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // For everything else (JS, CSS, images, etc.): cache first, then network.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // Only cache successful same-origin GETs.
        if (res.ok && url.origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached); // last resort offline
    })
  );
});

// Listen for messages from the page (e.g. the Refresh button can tell us to skip waiting).
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
