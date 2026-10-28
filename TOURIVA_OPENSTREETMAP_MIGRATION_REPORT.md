# Touriva — Free OpenStreetMap Stack Migration Report

**Project:** Touriva (`https://github.com/Bouafia19/touriva.git`)  
**Target Environment:** Web (`https://touriva-web.onrender.com`), API (`https://touriva-api.onrender.com`), and Android (Capacitor WebView)  
**Date:** October 28, 2026  
**Migration Lead:** Antigravity AI Engineering  
**Branch:** `master`  
**Current Live Production Commit:** `dbede194c74b1ac81def19909e131cdfabf0d2b3`  
**Render Service ID:** `srv-dbb3a78m7kps73aspl90`  
**Render Deploy ID:** `dep-dbgsu9m1egvs73e41r7g` (`Status: Live`)  

---

## 1. Executive Summary

Touriva has successfully transitioned from proprietary Google Maps APIs to a **100% free, zero-billing, open-source geospatial stack** powered by **MapLibre GL JS**, **OpenFreeMap vector tiles**, and **OpenStreetMap Nominatim geocoding**.

All requirements have been met without requiring:
- Google Cloud billing
- Google Maps JavaScript / Places / Geocoding APIs
- A Visa or Mastercard credit card
- A Google Maps API key

The application preserves Touriva's original luxury editorial design language, mobile/desktop responsiveness, Arabic/French/English multilingual support, and database-driven Algerian destinations. The verified migration commit has been pushed to GitHub and deployed live to production on Render.

---

## 2. Previous Google Maps Architecture & Why It Was Replaced

The previous Touriva mapping implementation depended directly on proprietary Google Cloud APIs:
- **Map Rendering:** Dynamic injection of `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places` via `frontEnd/touriva/index.html` referencing `%VITE_GOOGLE_MAPS_KEY%`.
- **Map Views:** `New.vue` utilized `google.maps.Map`, `google.maps.Marker`, `google.maps.InfoWindow`, `google.maps.Polyline`, and `google.maps.LatLngBounds`.
- **Search & Autocomplete:** `TripBuilder.vue` attached `google.maps.places.Autocomplete` to destination search inputs.
- **Nearby Places Search:** Pinia stores (`sites.js`, `hotels.js`, `restaurants.js`, `places.js`) issued direct POST requests to Google Places API (`https://places.googleapis.com/v1/places:searchNearby`) passing `X-Goog-Api-Key`.
- **Place Images:** `PlaceDetail.vue` and `SiteCardLocal.vue` attempted to resolve photos through `https://places.googleapis.com/v1/{photoName}/media?key=${apiKey}`.
- **Embedded Maps:** `ContactSupport.vue` embedded an `<iframe>` pointing to `https://www.google.com/maps/embed`.

### Key Problems with Google Maps:
1. **Billing & Credit Card Obstacle:** Google Cloud Platform requires an active credit card and billing account. Because billing was not linked, `VITE_GOOGLE_MAPS_KEY` remained unset in production, breaking map features.
2. **Broken Runtime:** `window.google` was undefined, causing map initialization to fail silently and autocomplete to be non-functional.
3. **Data Sovereignty:** Touriva already had a verified local MongoDB database of Algerian wilayas, hotels, authentic restaurants, and cultural tourism sites. Relying on Google Places created unnecessary external latency.

---

## 3. New OpenStreetMap Architecture

Touriva now utilizes a modern, resilient, open-source stack:

| Component | Provider / Service | Protocol / URL | Cost / Card Required? |
|---|---|---|---|
| **Map Renderer** | MapLibre GL JS (`^6.16.0`) | WebGL / Canvas | Free / Open-Source (BSD-3) |
| **Primary Vector Tiles** | OpenFreeMap (Liberty style) | `https://tiles.openfreemap.org/styles/liberty` | Free (No card / No key) |
| **Secondary Vector Style** | OpenFreeMap (Bright style) | `https://tiles.openfreemap.org/styles/bright` | Free (No card / No key) |
| **Emergency Raster Fallback** | OpenStreetMap Standard | `https://tile.openstreetmap.org/{z}/{x}/{y}.png` | Free (With attribution) |
| **Geocoding & Search** | Local Curated Database + OSM Nominatim | `https://nominatim.openstreetmap.org/search` | Free (Strict policy-compliant) |
| **Tourism Database** | Touriva MongoDB Engine | `/api/sites`, `/api/hotels`, `/api/restaurants` | Self-hosted on Render |
| **Itinerary Routing** | GeoJSON Vector Lines | Client-side WebGL Polylines | Zero external network calls |
| **Embedded Support Map** | OpenStreetMap Embed | `https://www.openstreetmap.org/export/embed.html` | Free (No card / No key) |

---

## 4. OpenStreetMap Nominatim Acceptable Use Policy Compliance

The implementation strictly adheres to the official [OpenStreetMap Foundation Nominatim Acceptable Use Policy](https://operations.osmfoundation.org/policies/nominatim/):

1. **Zero-Network Keystroke Filtering:**
   Public Nominatim prohibits client-side autocomplete / search-as-you-type. When users type in `TripBuilder.vue`, suggestions are filtered **exclusively in-memory** against the curated Algerian destination database (`filterLocalDestinations()`). Zero network requests are dispatched on keystrokes.
2. **Curated Algerian Destinations Database:**
   Contains all **58 Algerian Wilayas** and iconic tourism destinations (Taghit, Djemila, Timgad, Casbah of Algiers, Tassili n'Ajjer, etc.) with verified coordinates and full multilingual support (English, French, and Arabic script).
3. **Explicit User-Triggered External Search:**
   External Nominatim queries (`searchNominatimExternal()`) are invoked **strictly upon explicit user submission** (pressing Enter or clicking the search icon).
4. **Application-Wide Rate-Limiting Throttle:**
   A global module-level throttle enforces a minimum interval of **1000ms** between consecutive external Nominatim requests across the entire application.
5. **In-Memory Caching:**
   Repeated searches are cached in `externalGeocodeCache`. Subsequent searches for the same term return immediately with zero network overhead.
6. **Privacy & PII Sanitization:**
   Query strings are sanitized prior to dispatch (`sanitizeSearchQuery()`), stripping email addresses, HTML/script injection tags, and control characters to prevent data leakage.
7. **Transparent Application Identification:**
   Requests send explicit headers:
   `User-Agent: Touriva-Algeria-Platform/1.0 (https://touriva-web.onrender.com; contact: contact@touriva.dz)`
   `Accept: application/json`
8. **Attribution & Resilience:**
   Results carry OpenStreetMap attribution (`© OpenStreetMap contributors, ODbL 1.0`). HTTP 429 (Too Many Requests), timeouts (6000ms), and network errors are intercepted gracefully with fallback to local results.
9. **Automated Vitest Verification:**
   Automated tests in `frontEnd/touriva/src/__tests__/osm_map_stack.test.js` prove that simulated rapid typing (`C`, `Co`, `Con`, `Const`, `Consta`, `Constan`, `Constantine`) triggers zero network requests.

---

## 5. Tile Providers & Attribution Audit

- **Primary Provider (OpenFreeMap):**
  Uses `https://tiles.openfreemap.org/styles/liberty`. Verified active, responding with HTTP 200 and serving full vector tile specifications.
- **Failover Strategy:**
  A two-tier fallback cascade is implemented in `initTourivaMap`, `TourivaMap.vue`, and `New.vue`:
  1. `liberty` (OpenFreeMap default)
  2. `bright` (OpenFreeMap secondary)
  3. `OSM_RASTER_FALLBACK` (Standard OpenStreetMap raster layer)
- **Attribution:**
  MapLibre's attribution control displays OpenFreeMap and OpenStreetMap contributors attribution with clickable links in the bottom-right corner of maps.

---

## 6. Files Changed Across the Project

### Created:
1. `frontEnd/touriva/src/utils/osmMap.js`: MapLibre GL wrapper, OpenFreeMap/OSM style configurations, cascading fallback, branded DOM marker pin generator, and popup HTML builder.
2. `frontEnd/touriva/src/utils/geocoding.js`: Complete 58-wilaya curated database, local multilingual filter, throttled Nominatim query engine, PII sanitizer, and cache.
3. `frontEnd/touriva/src/components/TourivaMap.vue`: Reusable Touriva Map component with dynamic resize observer and itinerary route rendering.
4. `frontEnd/touriva/src/__tests__/osm_map_stack.test.js`: Vitest test suite verifying Nominatim compliance, zero-network keystrokes, rate limiting, and styles.

### Modified:
1. `frontEnd/touriva/src/views/Trip/New.vue`: MapLibre GL map instance, DOM pin markers, GeoJSON day routes, tab resize handling.
2. `frontEnd/touriva/src/views/Trip/TripBuilder.vue`: Zero-network local combobox filter while typing, explicit Enter/click external search, and OSM attribution chip.
3. `frontEnd/touriva/src/views/profile/ContactSupport.vue`: Replaced Google Maps iframe with OpenStreetMap embed.
4. `frontEnd/touriva/src/stores/sites.js`, `hotels.js`, `restaurants.js`, `places.js`: Excised Google Places searchNearby; added direct local MongoDB queries.
5. `frontEnd/touriva/src/components/SiteCardLocal.vue` & `PlaceDetail.vue`: Removed Google Maps photo queries.
6. `frontEnd/touriva/index.html`: Excised Google Maps dynamic script tag.
7. `frontEnd/touriva/package.json` & `package-lock.json`: Added `maplibre-gl` dependency.
8. `frontEnd/touriva/.env`, `.env.production`, & `render.yaml`: Purged all `VITE_GOOGLE_MAPS_KEY` references.
9. `backend/tests/security_remediation.test.js`: Verified zero Google Maps API keys or references exist across source files.

### Deleted:
1. `frontEnd/touriva/src/utils/googleMaps.js`: Removed obsolete Google Maps script loader.

---

## 7. Android Signing Integrity & Security Verification

- **Keystore & Signing Identity:**
  `frontEnd/touriva/android/keystore.properties` and keystore files were **100% untouched**.
- **Build Verification:**
  Gradle command:
  ```bash
  cd frontEnd/touriva/android && ./gradlew assembleDebug
  ```
  **Result:** `BUILD SUCCESSFUL in 5s` (240 actionable tasks).
- **Network Security Config:**
  `network_security_config.xml` strictly enforces `cleartextTrafficPermitted=false`. All map tiles and geocoding requests use secure HTTPS.

---

## 8. Test Execution Results

### Frontend Unit Tests (Vitest)
```bash
cd frontEnd/touriva && npm test
```
- **Test Suites:** 2 passed, 2 total
- **Tests:** 18 passed, 18 total
- **Highlights:**
  - Proves typing keystrokes NEVER triggers external Nominatim network requests.
  - Verifies local multilingual matching (English, French, Arabic).
  - Verifies query sanitization and PII stripping.
  - Verifies external query caching and 1000ms global rate limit.
  - Verifies graceful handling of HTTP 429 rate limit errors.

### Backend Test Suite (Jest)
```bash
cd backend && npm test
```
- **Test Suites:** 6 passed, 6 total
- **Tests:** 59 passed, 59 total
- **Highlights:**
  - Authentication, RBAC, IDOR prevention, and CORS policy tests passed.
  - Security remediation test: Confirms zero Google Maps keys or script tags in frontend source and `index.html`.

### Monorepo Production Builds
All 5 frontend applications build with 0 errors:
1. `frontEnd/touriva`: **PASS** (`vite build` in 8.51s)
2. `frontEnd/touriva_adminPanel`: **PASS** (`vite build` in 8.81s)
3. `shop/frontEnd/touriva_shop_web`: **PASS** (`vite build` in 6.42s)
4. `shop/frontEnd/touriva_shop_admin`: **PASS** (`vite build` in 8.12s)
5. `shop/frontEnd/touriva_shop_seller_admin`: **PASS** (`vite build` in 10.68s)

---

## 9. Live Production Deployment & Verification

- **Render Service:** `srv-dbb3a78m7kps73aspl90` (`touriva-web`)
- **Deployed Commit:** `dbede194c74b1ac81def19909e131cdfabf0d2b3`
- **Deploy ID:** `dep-dbgsu9m1egvs73e41r7g`
- **Deploy Status:** `Live` (Finished 2026-10-28T10:32:33Z)
- **Live URL Verification (`https://touriva-web.onrender.com`):**
  - Response: `HTTP/2 200`
  - Zero Google Maps script tags or references present in deployed HTML.
  - Main JS bundle (`/assets/index-DDiE91Hw.js`) and TripBuilder bundle (`/assets/TripBuilder-iIm3M0HN.js`) verified live.
  - OpenFreeMap vector style endpoint verified live (`HTTP/2 200`).
  - OpenStreetMap Nominatim endpoint verified live with Touriva User-Agent (`HTTP/2 200`).

---

## 10. Final Release Verdict

**READY FOR PRODUCTION**

The OpenStreetMap mapping stack is fully implemented, policy-compliant, covered by automated tests, committed to `master`, and verified live on production. Zero Google Cloud billing, zero Google API keys, and zero credit cards are required.
