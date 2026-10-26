# TOURIVA — GOOGLE MAPS API KEY ROTATION & GOOGLE CLOUD SECURITY STATUS

**Audit Date:** October 26, 2026, 17:46 UTC  
**Auditor / Agent:** Antigravity Autonomous Security Engineering Agent  
**Overall Status:** **NOT READY — MANUAL ACTION REQUIRED**  
**Google Maps Legacy Key Revoked:** **NOT VERIFIED** (Requires Google Cloud Console Confirmation)  
**Replacement Key Restricted:** **NOT VERIFIED** (Requires Google Cloud Console Configuration)  
**Production Maps Functionality:** **BLOCKED** (Awaiting key deployment; safe fallback active)  

---

## 1. CONSUMER INVENTORY & KEY AUDIT

An exhaustive inspection across all services was conducted to map all Google Maps and Places dependencies:

| Microservice / Application | Directory Root | Maps / Places Dependencies | Environment Variable | Build-Time vs Runtime | Production Origin | Status |
|---|---|---|---|---|---|---|
| **Touriva Tourist Web** | `frontEnd/touriva` | Maps JS API (`Map`, `Marker`, `Polyline`), Places API (`Autocomplete`, photos, searchNearby) | `VITE_GOOGLE_MAPS_KEY` | **Build-time** (Vite replaces `%VITE_GOOGLE_MAPS_KEY%` and `import.meta.env`) | `https://touriva-web.onrender.com` | Key excised; fallback guard active |
| **Touriva Mobile (Android)** | `frontEnd/touriva/android` | Web assets inside Capacitor WebView | Shared via web assets | **Embedded in bundle** | `https://localhost` (Capacitor 7 scheme) | Network security hardened; system CAs only |
| **Touriva Admin Portal** | `frontEnd/touriva_adminPanel` | None | N/A | N/A | `https://touriva-admin.onrender.com` | **0 Maps Dependencies** |
| **Touriva Shop Web** | `shop/frontEnd/touriva_shop_web` | None | N/A | N/A | `https://touriva-shop-web.onrender.com` | **0 Maps Dependencies** |
| **Touriva Shop Admin** | `shop/frontEnd/touriva_shop_admin` | None | N/A | N/A | `https://touriva-shop-admin.onrender.com` | **0 Maps Dependencies** |
| **Touriva Shop Seller** | `shop/frontEnd/touriva_shop_seller_admin` | None | N/A | N/A | `https://touriva-shop-seller-admin.onrender.com` | **0 Maps Dependencies** |
| **Touriva REST API** | `backend/` | None | N/A | N/A | `https://touriva-api.onrender.com` | **0 Server-side Maps Calls** |

### 1.1 Legacy Key Status
- **Safe Key Fingerprint:** `AIzaSyDxFsMTjS...7wN4`
- **Source Code Removal:** Verified 0 occurrences across all `.js`, `.ts`, `.vue`, `.html`, and `.json` source files (`git grep` verified).
- **Bundle Removal:** Verified absent from compiled JavaScript bundles in `dist/`.
- **Source Maps:** Verified absent (`0 .map files`).
- **Cloud Revocation Status:** **NOT VERIFIED**. Because direct Google Cloud CLI access (`gcloud`) is not available in this Linux environment, revocation of the exposed key in the Google Cloud Console must be completed by the authorized project owner.

---

## 2. PRODUCTION FALLBACK BEHAVIOR & GRACEFUL DEGRADATION

1. **Defensive Dynamic Loader in `frontEnd/touriva/index.html`:**
   ```html
   <script>
     (function() {
       const key = '%VITE_GOOGLE_MAPS_KEY%';
       if (key && key !== '%VITE_GOOGLE_MAPS_KEY%' && key.trim() !== '') {
         const s = document.createElement('script');
         s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&loading=async`;
         s.async = true;
         document.head.appendChild(s);
       }
     })();
   </script>
   ```
2. **Live Production Probe:**
   Probing `https://touriva-web.onrender.com` via curl confirms that because `VITE_GOOGLE_MAPS_KEY` is not yet set in the Render Dashboard, the placeholder is retained and the safety guard prevents injecting a broken script tag.
3. **Component-Level Error Handling:**
   - `frontEnd/touriva/src/views/Trip/New.vue`: `if (!window.google || !window.google.maps) return`
   - `frontEnd/touriva/src/views/Trip/TripBuilder.vue`: `if (!input || typeof google === 'undefined' || !google.maps || !google.maps.places) return`
   - `frontEnd/touriva/src/stores/sites.js`: Falls back automatically to local database destination records.
   - Result: Destination exploration, itineraries, and client pages function normally without throwing unhandled exceptions.

---

## 3. PROPOSED ORIGINS EVALUATION & RESTRICTIONS MATRIX

Each candidate origin was evaluated individually:

| Candidate Origin | Classification | Recommendation | Technical Rationale |
|---|---|:---:|---|
| `https://touriva-web.onrender.com/*` | **Production Web** | **INCLUDE** | Active production hosting URL on Render for customer tourism discovery. |
| `https://touriva.com/*` | **Production Custom** | **INCLUDE** | Primary custom production apex domain for the Touriva platform. |
| `https://www.touriva.com/*` | **Production Custom** | **INCLUDE** | Canonical www production domain. |
| `https://*.touriva.com/*` | **Wildcard Subdomains** | **OPTIONAL** | Only required if customer apps with maps are hosted on subdomains. |
| `http://localhost:5173/*` | **Development** | **DEV ONLY** | Default Vite dev server port. Keep separate from production key if possible. |
| `https://localhost/*` | **Mobile WebView** | **INCLUDE** | Capacitor 7 Android serves local assets from `https://localhost` (`androidScheme: "https"`). |

### Minimal Required Google Maps APIs:
- **Maps JavaScript API**
- **Places API (New)**
- **Geocoding API**
*(Do not enable Directions API, Elevation API, or Distance Matrix API unless new features require them).*

---

## 4. PRECISE MANUAL ROTATION CHECKLIST FOR OPERATOR

Because Google Cloud credentials are not available inside this workspace, execute the following steps:

1. **Google Cloud Console:**
   - Log into [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials).
   - Click **Create Credentials > API Key**. Name it `touriva-web-production`.
   - Under **Application restrictions**, choose **Websites (HTTP referrers)** and add:
     - `https://touriva-web.onrender.com/*`
     - `https://touriva.com/*`
     - `https://www.touriva.com/*`
     - `http://localhost:5173/*`
     - `https://localhost/*`
   - Under **API restrictions**, select **Restrict key** and check:
     - *Maps JavaScript API*
     - *Places API (New)*
     - *Geocoding API*
   - Save the key.
2. **Render Dashboard:**
   - Log into [https://dashboard.render.com](https://dashboard.render.com).
   - Select service `touriva-web` (ID `srv-dbb3a78m7kps73aspl90`).
   - Go to **Environment** > Add environment variable:
     - `VITE_GOOGLE_MAPS_KEY` = `[New Web Production Key]`
   - Go to **Manual Deploy** > click **Clear build cache & deploy** *(mandatory because Vite embeds keys at build time)*.
3. **Live Verification:**
   - Open `https://touriva-web.onrender.com`.
   - Verify interactive maps load, place search returns results, and the browser console has zero `ApiTargetBlockedMapError` or 403 errors.
4. **Revocation:**
   - Return to Google Cloud Console and **DELETE / REVOKE** the legacy exposed key (`AIzaSyDx...7wN4`).
