# Touriva — Updated Formal Defect & Bug Register

**Document Reference:** `TOURIVA_UPDATED_BUG_REGISTER.md`  
**Date:** October 30, 2026  
**Auditor & Implementation Team:** Antigravity Autonomous Systems Engineering Team  
**Scope:** Customer Web, Agency Backoffice, Administrator Portal, Android Mobile App (Capacitor 7), Backend REST API, Database Integration  
**Repository:** `Bouafia19/touriva.git`  
**Production Branch:** `master`

---

## 1. Master Bug Status Summary

| Bug ID | Severity | Category | Component | Description | Current Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MOB-01** | **CRITICAL** | Mobile App | `android/app/src/main/assets/public/` | Packaged Android web assets out-of-sync with production code | **RESOLVED & VERIFIED** |
| **WEB-01** | **HIGH** | Router / Auth | `frontEnd/touriva/src/router/index.js` | Asymmetric auth check blocks guest catalog browsing on mobile | **RESOLVED & VERIFIED** |
| **WEB-02** | **HIGH** | Auth / Agency | `frontEnd/touriva/src/stores/auth.js` | Partner credential login redirects agency directors to `/tabs` instead of `/agency/dashboard` | **RESOLVED & VERIFIED** |
| **WEB-03** | **MEDIUM** | State Store | `frontEnd/touriva/src/stores/auth.js` | Method `attempt(token)` overwrites `this.user` with raw JWT token string | **RESOLVED & VERIFIED** |
| **WEB-04** | **HIGH** | Agency / Docs | `frontEnd/touriva/src/views/agency/AgencyDepartures.vue` | Official printable manifest fails via `window.open` due to relative URL & missing auth header | **RESOLVED & VERIFIED** |
| **WEB-05** | **HIGH** | Agency / Financial | `frontEnd/touriva/src/views/agency/AgencyFinancials.vue` | Proof image preview and PDF download fail due to missing Bearer token in native `<img>` and `<a>` | **RESOLVED & VERIFIED** |
| **MOB-02** | **MEDIUM** | Mobile App | `frontEnd/touriva/src/App.vue` | Hardware/gesture back-button does not step back in Vue Router history | **RESOLVED & VERIFIED** |
| **MOB-05** | **LOW** | Mobile / Web | `frontEnd/touriva/src/App.vue` | Capacitor Filesystem folder creation invoked in standard browser context | **RESOLVED & VERIFIED** |
| **API-01** | **LOW** | Network Client | `frontEnd/touriva/src/main.js` | Hardcoded private LAN IP fallback causes delay on local network failures | **RESOLVED & VERIFIED** |
| **ADM-01** | **LOW** | Admin / Agency | `backend/controllers/usersController.js` | Partner document rejection note does not trigger in-app notification | **RESOLVED & VERIFIED** |
| **MOB-03** | **MEDIUM** | Mobile Build | `android/keystore.properties` | Missing production keystore configuration prevents signed release builds | **OPEN (Pre-Release Blocker)** |
| **MOB-04** | **LOW** | Mobile Config | `android/app/google-services.json` | Missing Firebase configuration disables native push notifications | **OPEN (Optional Auxiliary)** |

---

## 2. Detailed Bug Reports & Resolution Proofs

### Bug MOB-01: Packaged Android Web Assets Out-of-Sync with Production Code
- **Bug ID:** `MOB-01`
- **Severity:** **CRITICAL** (Blocker for Mobile App Distribution)
- **Status:** **RESOLVED & VERIFIED** (Phase 1)
- **Component:** `frontEnd/touriva/android/app/src/main/assets/public/`
- **Root Cause:** Vite compiles to `frontEnd/touriva/dist/`. Capacitor requires an explicit copy step (`npx cap copy android`) to copy files into `android/app/src/main/assets/public/`. This synchronization was missing after recent feature additions, causing the app to render a blank screen.
- **Resolution Summary:**
  - Incremented `versionCode` to 12 and `versionName` to `"12.0"` in `android/app/build.gradle`.
  - Executed production Vite build (`npm run build`).
  - Synchronized assets via `npx cap copy android`.
  - Reassembled debug APK (`./gradlew assembleDebug`).
- **Verification Proof:** Tested on Samsung Galaxy A03s (`SM-A035F`). App launched successfully, rendering full B2B homepage section and branding (*"Touriva — Plateforme Digitale pour Agences de Voyages & Tourisme"*).

---

### Bug WEB-01: Asymmetric Auth Check Blocks Guest Catalog Browsing on Mobile Only
- **Bug ID:** `WEB-01`
- **Severity:** **HIGH**
- **Status:** **RESOLVED & VERIFIED** (Phase 1)
- **Component:** `frontEnd/touriva/src/router/index.js`
- **Root Cause:** Inconsistent platform-branching route guards and erroneous placement of `requiresAuth: true` on public catalog routes (`/trips`, `/sites`, `/hotels`, `/restaurants`, `/tripDetail/:id`).
- **Resolution Summary:**
  - Removed `requiresAuth: true` from public discovery routes in `router/index.js`.
  - Maintained `requiresAuth: true` on user-specific protected routes (`/updateProfile`, `/myTrips`, `/subscriptions`, `/billing`, `/documents`).
  - Added explicit `requiresAgency: true` on `/agency` backoffice routes.
  - Unified router guards into an asynchronous handler ensuring identical authorization policy across Web and Mobile.
- **Verification Proof:** Tested unauthenticated browsing on Samsung Galaxy A03s. Guests browse `/trips` and `/sites` freely. Attempting to access `/subscriptions` or `/agency/dashboard` redirects to `/login`.

---

### Bug WEB-02: Partner Credential Login Redirects Agency Directors to `/tabs`
- **Bug ID:** `WEB-02`
- **Severity:** **HIGH**
- **Status:** **RESOLVED & VERIFIED** (Phase 2)
- **Component:** `frontEnd/touriva/src/stores/auth.js`
- **Root Cause:** In `auth.js`, `account_sign_in` unconditionally redirected all users to `/tabs`.
- **Resolution Summary:**
  - Updated `account_sign_in` with role-aware destination routing:
    ```javascript
    if (this.user?.role === 'partner' && this.user?.typeAccount === 'touristAgencies') {
      this.router.push('/agency/dashboard')
    } else {
      this.router.push('/tabs')
    }
    ```
- **Verification Proof:** Automated unit tests pass. Partner login on Samsung Galaxy A03s routes directly to `/agency/dashboard`.

---

### Bug WEB-03: Method `attempt(token)` Overwrites `this.user` with Raw JWT Token String
- **Bug ID:** `WEB-03`
- **Severity:** **MEDIUM**
- **Status:** **RESOLVED & VERIFIED** (Phase 2)
- **Component:** `frontEnd/touriva/src/stores/auth.js`
- **Root Cause:** In `auth.js`, `attempt(token)` assigned `this.user = token`, replacing the reactive user object with a string.
- **Resolution Summary:**
  - Refactored `attempt(token, user = null)` to set `this.token = token` and restore `this.user` as a full user object from parameter or `getLSUserInfo()`. Never assigns token string to `this.user`.
- **Verification Proof:** Automated unit tests pass. Inspected Pinia store on device: `auth.user` preserves full profile object.

---

### Bug WEB-04: Official Printable Manifest Fails via `window.open`
- **Bug ID:** `WEB-04`
- **Severity:** **HIGH**
- **Status:** **RESOLVED & VERIFIED** (Phase 2)
- **Component:** `frontEnd/touriva/src/views/agency/AgencyDepartures.vue` & `src/stores/agency.js`
- **Root Cause:** Direct `window.open()` used a relative URL and lacked the required `Authorization: Bearer <token>` header.
- **Resolution Summary:**
  - Added `fetchManifestHtml(departureId)` in `agency.js` using authenticated Axios with `responseType: 'text'`.
  - Updated `printManifest` in `AgencyDepartures.vue` to fetch HTML string, create a Blob URL (`text/html;charset=utf-8`), open in print window, and schedule Object URL revocation after 60s.
- **Verification Proof:** Tested against departure `6ae488e58ad1f08afcde008e` on Samsung Galaxy A03s; retrieved 8,336 bytes of official passenger manifest HTML with HTTP 200.

---

### Bug WEB-05: Proof Image Preview and PDF Download Fail Due to Missing Bearer Token
- **Bug ID:** `WEB-05`
- **Severity:** **HIGH**
- **Status:** **RESOLVED & VERIFIED** (Phase 2)
- **Component:** `frontEnd/touriva/src/views/agency/AgencyFinancials.vue` & `src/stores/agency.js`
- **Root Cause:** Protected endpoint `/api/agency/payments/:id/proof` was bound directly to native `<img>` and `<a>` tags which cannot attach Bearer headers.
- **Resolution Summary:**
  - Added `fetchPaymentProofBlob(paymentId)` in `agency.js` using authenticated Axios with `responseType: 'blob'`.
  - Refactored proof modal in `AgencyFinancials.vue` to fetch binary blob, bind Blob URL to preview image/link, and display a user-friendly error alert with retry button when a proof document is missing (404).
- **Verification Proof:** Tested on Samsung Galaxy A03s; graceful error handling verified on payments lacking proof slips.

---

### Bug MOB-02: Android Hardware/Gesture Back-Button Does Not Step Back in Vue Router
- **Bug ID:** `MOB-02`
- **Severity:** **MEDIUM**
- **Status:** **RESOLVED & VERIFIED** (Phase 3)
- **Component:** `frontEnd/touriva/src/App.vue`
- **Root Cause:** Native back button was decoupled from the Vue Router HTML5 history stack.
- **Resolution Summary:**
  - Installed `@capacitor/app@^7.0.0`.
  - Registered `App.addListener('backButton')` in `App.vue` to check `currentPath` against root paths (`['/', '/tabs', '/login', '/agency/dashboard']`), calling `router.back()` on nested views and `App.exitApp()` on root pages.
  - Added lifecycle listener removal in `onUnmounted()`.
- **Verification Proof:** Tested on Samsung Galaxy A03s. Navigating `/` -> `/trips` and sending `adb shell input keyevent 4` navigated back to `/`. Sending `input keyevent 4` on `/` safely minimized the app.

---

### Bug MOB-05: Capacitor Filesystem Folder Creation Invoked in Standard Browser Context
- **Bug ID:** `MOB-05`
- **Severity:** **LOW**
- **Status:** **RESOLVED & VERIFIED** (Phase 3)
- **Component:** `frontEnd/touriva/src/App.vue`
- **Root Cause:** `createImageCacheFolder()` was called outside of `if (Capacitor.isNativePlatform())`, throwing runtime web console warnings.
- **Resolution Summary:**
  - Enclosed `createImageCacheFolder()` strictly inside `if (Capacitor.isNativePlatform())`.
- **Verification Proof:** Web browser console clean; automated Vitest test verifies platform guard.

---

### Bug API-01: Hardcoded Private LAN IP Fallback Causes Delay on Local Network Failures
- **Bug ID:** `API-01`
- **Severity:** **LOW**
- **Status:** **RESOLVED & VERIFIED** (Phase 3)
- **Component:** `frontEnd/touriva/src/main.js`
- **Root Cause:** Hardcoded private IP `172.20.10.3:4004` in Axios response error interceptor.
- **Resolution Summary:**
  - Removed private LAN IP retry block completely. Network errors reject cleanly without retry delays.
- **Verification Proof:** Automated Vitest test confirms absence of private LAN IP; verified on mobile network.

---

### Bug ADM-01: Partner Document Rejection Note Does Not Trigger In-App Notification
- **Bug ID:** `ADM-01`
- **Severity:** **LOW**
- **Status:** **RESOLVED & VERIFIED** (Phase 3)
- **Component:** `backend/controllers/usersController.js` & `frontEnd/touriva/src/views/profile/Notifications.vue`
- **Root Cause:** Administrator document rejection updated `User.rejectionReason` but lacked an in-app notification entity.
- **Resolution Summary:**
  - Added `notifications` array schema to `backend/models/User.js`.
  - Added compliance notification dispatch in `updateUser` and `update_existing_user` with built-in deduplication.
  - Implemented `GET /api/users/me/notifications` and `PATCH /api/users/me/notifications/:notifId/read`.
  - Created editorial in-app notifications feed in `frontEnd/touriva/src/views/profile/Notifications.vue`.
- **Verification Proof:** Backend test suite `phase3_adm01_notifications.test.js` passes 6/6 tests. Verified notification screen on Samsung Galaxy A03s.

---

### Bug MOB-03: Missing Production Keystore Configuration Prevents Signed Release Builds
- **Bug ID:** `MOB-03`
- **Severity:** **MEDIUM**
- **Status:** **OPEN (Pre-Release Blocker)**
- **Component:** `frontEnd/touriva/android/keystore.properties`
- **Impact:** `./gradlew assembleRelease` outputs unsigned APK (`app-release-unsigned.apk`).
- **Required Action:** Generate official release keystore and configure `keystore.properties` upon explicit authorization prior to production store submission.

---

### Bug MOB-04: Missing Firebase Configuration Disables Native Push Notifications
- **Bug ID:** `MOB-04`
- **Severity:** **LOW**
- **Status:** **OPEN (Optional Auxiliary)**
- **Component:** `frontEnd/touriva/android/app/google-services.json`
- **Impact:** Native OS push notification alerts disabled. Platform relies on in-app notifications and SMS/email.
- **Required Action:** Provide official Firebase project `google-services.json` if native push notifications are desired.
