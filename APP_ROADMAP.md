# StrumCity Line & Dock — Path to "Actual App"

**Current state (June 2026):** High-quality vanilla HTML/CSS/JS Progressive Web App (PWA). Works great as a mobile web experience and "Add to Home Screen" on iOS Safari / Android. 6 main tabs (Water/Reports/Records/Radar/Trip/Photos), multi-state lakes, real curated bowfishing records with names + dates, per-lake full subtabs for Reports and Records, dynamic weather with staleness handling for "phone in pocket", radar loops, static images (~40MB gallery+maps), minimal Python proxy server on Render for dam data.

We just improved the update story for stuck bookmarks (no-cache on shell, ?v= on assets, in-app ⟳ Refresh button, version in footer).

**Just started in this session (as concrete first steps toward Phase 0):**
- Updated `manifest.webmanifest` with icon placeholders + categories/shortcuts (you'll need to add the actual `icon-*.png` files in the project root).
- Added `beforeinstallprompt` handling + an "Install app" button that appears when the browser offers installation (in `app.js` + small UI in footer).
- Created `sw.js` (basic precache + runtime cache + update support) and registered it from `app.js`.
- These give us the foundation for offline + reliable "real app" install behavior while we iterate on the web code exactly like before.

Run your local server and test the install prompt on a phone or Chrome dev tools (Application tab → Manifest). The SW will show in console.

**User priorities (from 2026-06 discussion):**
- Native feel / performance (bottom tabs, gestures, faster maps, device APIs like GPS "nearest lake").
- No Apple Developer account / Mac yet → Android first or stay excellent PWA for now.
- Next 1-2 months priority: **Polish the existing web/PWA first** (icons, Service Worker, bottom nav from DESIGN_SUGGESTIONS.md, better updates, install experience).

Goal: Make it feel and behave like a "real app" you can confidently tell clients to install, while keeping the development flow (edit locally → test on phone via localhost:3456 or LAN → git push → Render) simple and fast. One web codebase as the source of truth.

## Recommended Overall Strategy (Phased, Low-Risk)

**Phase 0 (Now – 2-4 weeks): Make the PWA excellent and "native-like" (your current priority)**
- No new frameworks or build tools required.
- Users get a reliable home-screen experience that updates well.
- Feels more like a native charter app on phone.
- We can ship this quickly with the same local + push workflow.

**Phase 1 (When ready): Wrap with Capacitor for real Android app (and iOS later)**
- Keep 90-95% of code as the existing web app.
- Add thin native shells (iOS/Android).
- Unlocks: proper push notifications, better offline, App Store listing (Android easy on Windows), native plugins (GPS, background, camera for catch photos, etc.).
- Web version stays live for SEO and non-app users.
- You can develop the core in browser/localhost, then `npx cap sync && npx cap run android`.

**Phase 2 (Optional, later):** Backend upgrades + more native features (dynamic records, user-submitted reports, real booking flow, auth).

**Phase 3 (Future):** If needed, evaluate full native rewrite (React Native/Flutter) or add desktop (Tauri).

We will **not** rewrite everything unless you explicitly want to. The current stack has been very fast to iterate.

## Detailed Next Steps (Prioritized by your answers)

### Immediate / Phase 0 Polish (start here)

1. **PWA Manifest & Installability (critical for "real app" feel)**
   - Add proper `icons` array (192x192, 512x512, maskable versions recommended).
   - Add `categories`, `shortcuts`, `screenshots` for better store-like install UI.
   - Implement `beforeinstallprompt` in JS to show a nice in-app "Install StrumCity" banner (instead of relying only on browser UI).
   - Add apple-touch-icon + splash screen meta for iOS (even without full native).
   - **Action for us:** Create placeholder icon files or instructions + update manifest.webmanifest + index.html. (You'll need to provide or generate a clean logo/icon — we can use a simple boat/fish design or one of your photos cropped.)

2. **Bottom Navigation (biggest "native feel" win — directly from DESIGN_SUGGESTIONS.md)**
   - On phones (<640-768px), show a fixed bottom tab bar with icons + short labels (🌊 Water, 🎣 Reports, 🏆 Records, 📡 Radar, 🛥️ Trip, 📷 Photos).
   - Top nav can collapse to a minimal header or current tab indicator on mobile.
   - Use CSS + a bit of JS to switch. Keep desktop experience top-nav or hybrid.
   - Add safe-area-inset-bottom for notched phones.
   - This directly addresses your "native feel / performance" priority and the design doc's #1 recommendation.
   - Bonus: persistent "current lake" chip in the bottom bar or header.

3. **Service Worker + Offline + Update Control**
   - Create a `sw.js` (vanilla, no workbox needed at first).
   - Basic strategy:
     - Cache the app shell (HTML, CSS, JS, manifest, key images) for instant load.
     - Network-first (or stale-while-revalidate) for weather data, radar tiles, reports.
     - Offline fallback page or cached last-known data for key screens.
   - Register the SW from index.html or app.js.
   - Use it to improve the "Refresh app" experience (skipWaiting, claim, postMessage for "update ready").
   - This makes "phone in pocket + poor signal" much more robust and gives you a place to show "New version available — tap to update".
   - Also helps with the bookmark staleness problem long-term.

4. **Device API Wins (quick native-like features)**
   - Geolocation: "Use my location" button that picks the nearest lake (great for "on the water").
   - Pull-to-refresh simulation (or real via touch events) on main content areas.
   - Better haptic feedback on tab switches / FAB (navigator.vibrate where supported).
   - Share API for specific reports/records (navigator.share).

5. **Polish & Update UX (build on what we just shipped)**
   - Make the ⟳ Refresh button more prominent on mobile or auto-suggest when SW detects new version.
   - Version the data/config more visibly (e.g. "Records last curated MM/DD").
   - Add a simple "What's new" modal or changelog section (we can maintain a small array in config).
   - Improve radar and map loading states/performance (lazy, better caching).
   - Address any remaining DESIGN_SUGGESTIONS low-hanging fruit (waves, hovers, etc.).

6. **Icons, Assets & Performance**
   - Optimize or lazy-load gallery + map backgrounds (current ~40MB was noted as main capacity consumer earlier).
   - Add a few high-quality app icons + splash assets.
   - Consider moving some images to a CDN or WebP/AVIF later.

### After Phase 0 Solid (when you say "let's go hybrid")

**Capacitor Path (recommended for "actual app" without full rewrite):**
- Add `package.json` + npm (we'll run `npm init` etc. locally).
- `npm install @capacitor/core @capacitor/cli`
- `npx cap init` (configure for the existing web root).
- `npx cap add android` (works great on your Windows machine).
- `npx cap sync`
- Build Android APK/AAB, test on phone via USB or emulator.
- For push: Add @capacitor/push-notifications + a provider (Firebase is common, or OneSignal).
- For iOS later: `npx cap add ios` (requires Mac/Xcode or use cloud build like EAS/Capacitor Cloud).
- Live updates: Capacitor has options or third-party (Capacitor Live Updates, etc.) so you can push JS changes without full App Store review.
- The Python server/proxy stays for the web version; for native we can either keep calling the Render API or move the proxy logic into a small hosted function / remove if CORS allows direct calls.

**Android first (matches your current "no Mac yet" answer):**
- You can have a real installable Android app on your phone (and eventually Play Store) while the web PWA remains the main dev target.
- iOS PWA experience will also benefit from the web polish we do in Phase 0.

### Longer-term / "Real App" Features

- **Backend:** Move LAKE_BOWFISHING_RECORDS / REPORT_SOURCES / photos-manifest to Supabase (Postgres + storage + simple auth) or Firebase so you (or a helper) can update records/reports/photos from a simple admin UI without code deploys. Add user-submitted catches (with photo + review queue).
- **Bookings:** Replace/integrate the 🛥️ Book tel: FAB with a real calendar (Cal.com embed, Stripe payments, or just a better form that emails/SMS you).
- **Push notifications:** High-wind alerts, new dam generation, weekly report summaries, "conditions look good for [your lakes]".
- **Personalization:** Local storage or account for "favorite lakes", personal logbook, notifications per lake.
- **Native extras (once in Capacitor):** GPS auto lake, background location (with permission), camera for quick catch photos, share to social, Apple Watch / Android Wear complications for quick conditions, etc.
- **Monetization:** Free core + premium (detailed charts, archived reports, ad-free, early access?).

## How We'll Work Together (same flow you like)

- Everything starts local (edit files, run `start-local-server.ps1` or `py server.py`, test on your phone at http://192.168.1.65:3456 or localhost).
- Use the same git commit + push to trigger Render.
- For native (Phase 1+): We'll add scripts like `npm run build:android` or `npx cap run android`. You'll test the native shell on device.
- We can keep DESIGN_SUGGESTIONS.md for UI/UX ideas and this roadmap for the bigger picture.
- After each chunk: you test on phone (Safari + eventual native), give feedback ("bottom nav feels good but make the active state stronger"), we iterate.
- No big bangs — small, shippable improvements.

## Immediate Actionable Next Steps (pick one or more)

1. **Create / flesh out this roadmap more** (we just did the skeleton).
2. **Implement bottom tab navigation** (highest "native feel" bang for buck per your answers + design doc). We can do it in one or two sessions, test locally, push.
3. **Add Service Worker + basic offline + update prompt**.
4. **PWA icons + beforeinstallprompt banner** (makes "install as real app" obvious to users).
5. **Geolocation "nearest lake" feature**.
6. **All of the above, starting with bottom nav + icons**.

Say something like:
- "Let's do the bottom nav next"
- "Start with Service Worker and install prompt"
- "Create full icons and update the manifest"
- "Let's bootstrap Capacitor for Android even if we polish web first"
- "Update the roadmap with more details on backend"

Or give any other direction (e.g. "I want to focus on push notifications sooner" or "make the Records tab support user photos someday").

We can also audit current performance/capacity, add a changelog, or clean up anything while we're at it.

This keeps the momentum from the PWA work (Records, Reports subtabs, centered tabs, FAB, cache fixes) while moving toward something that truly feels like "the StrumCity app" on people's phones.

Ready when you are — just tell me the first concrete piece. 🎣
