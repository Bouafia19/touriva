# Touriva Authentication Fix & Verification Report

## Executive Summary

The observed authentication error `400 {"error":"Authorization token required"}` and associated login failures on the deployed Touriva web application (`https://touriva-web.onrender.com`) and Android application have been systematically diagnosed, resolved, verified, and deployed to production.

- **Live Web Application:** [https://touriva-web.onrender.com](https://touriva-web.onrender.com)
- **Live REST API:** [https://touriva-api.onrender.com](https://touriva-api.onrender.com)
- **Git Commit:** `2c85ca9` pushed to `master` on `https://github.com/Bouafia19/touriva`
- **Render Production Status:** Both `touriva-api` (`srv-dbb3a4lg1s2s73e3ll9g`) and `touriva-web` (`srv-dbb3a78m7kps73aspl90`) are **Live** with zero deployment or runtime errors.

---

## 1. Root Cause Analysis

Investigation revealed two interconnected issues spanning the Express backend, Pinia/Capacitor authentication stores, and the Vue login view:

### A. Failing Protected Endpoint Calling `requireAuth` (`Authorization token required`)
- **Exact Failing Endpoint:** `GET /api/users/:id` (triggered by `users.fetchUser()` on page mounting, e.g. in `Tabs.vue`) and other protected endpoints.
- **HTTP Method:** `GET`
- **Response Code:** `401 Unauthorized` (observed as a 4xx client authorization error).
- **Response Body:** `{"error":"Authorization token required"}`
- **Root Cause:**
  1. In `Tabs.vue`, `users.fetchUser()` was invoked immediately on component mount without checking whether the user was authenticated.
  2. In multiple frontend Pinia stores (`users.js`, `billings.js`, `publications.js`, `announcements.js`, `daira.js`, `commune.js`, `sites.js`, `hotels.js`, `restaurants.js`), requests manually interpolated `headers: { 'Authorization': 'Bearer ' + ls?.token }`.
  3. When an unauthenticated visitor visited the platform, or when a session token was missing/null/undefined, stores sent either `'Authorization': 'Bearer undefined'`, `'Authorization': 'Bearer null'`, or an empty header.
  4. In `backend/middleware/requireAuth.js`, when no valid Bearer token was present, the middleware returned `401 {"error":"Authorization token required"}`.
  5. Furthermore, stale or expired tokens from previous sessions were never cleared on 401 errors, leaving subsequent navigation loops poisoned.

### B. Sign-In Role & Phone Formatting Mismatch (`{"error":"ip"}` / Status 400)
- **Exact Failing Endpoint:** `POST /api/users/login`
- **HTTP Method:** `POST`
- **Response Code:** `400 Bad Request`
- **Response Body:** `{"error":"ip"}` (meaning *Identifiant / Téléphone non trouvé*)
- **Root Cause:**
  1. `Login.vue` hardcoded `role: 'partner'` in its call to `auth.account_sign_in()`. When client/traveler users attempted to log in, the backend `User.loginPhone` specifically queried `{ role: 'partner' }`, resulting in immediate lookup failure (`ip`).
  2. `Login.vue` concatenated `'+213' + phoneNumber.value`. If users entered standard Algerian 10-digit mobile numbers (e.g., `0550000010`), this resulted in a 14-character string (`+2130550000010`). If users entered 10 digits directly without `+213`, `User.loginPhone`'s length checks (which only tested `length === 14` or `13`) failed completely.
  3. `User.loginEmail` was restricted strictly to `role: 'administrator'`, locking out client and partner email sign-in.
  4. In `Login.vue`, Axios error responses were stringified as generic `"Error: Request failed with status code 400"`, obscuring the underlying error from the user.

---

## 2. Files Changed & Detailed Modifications

### Backend (`backend/` & `shop/backend/`)

1. **`backend/middleware/requireAuth.js`** and **`shop/backend/middleware/requireAuth.js`**:
   - Added validation that `req.headers.authorization` starts with `Bearer `.
   - Specifically guarded against empty or literal strings (`'undefined'`, `'null'`), returning `401 {"error":"Authorization token required"}`.
   - Verified that `jwt.verify` extracts `_id`, and that the user exists in MongoDB before invoking `next()`.
   - Returns consistent `401 {"error":"request is not authorized"}` on token expiry or invalid signatures.

2. **`backend/models/User.js`**:
   - Implemented `normalizePhoneVariants(rawPhone)`: parses raw Algerian phone numbers and generates all valid canonical variants (`+213550...`, `+2130550...`, `0550...`, `00213550...`, `550...`).
   - Refactored `UserSchema.statics.loginPhone`: searches phone variants across the specified role first; if not found or if role was not specified, searches across active accounts regardless of role.
   - Refactored `UserSchema.statics.loginEmail`: supports clients, partners, and administrators.
   - Updated `UserSchema.statics.loginPhoneWeb` to use `normalizePhoneVariants`.

3. **`backend/controllers/usersController.js`**:
   - Updated `loginUser`: flexibly routes to `loginEmail` when email is provided and `loginPhone` when phone is provided; handles administrator permission rules while returning standard `{ user, token }` for travelers and partners.
   - Updated `verifyUser`: utilizes `loginPhoneWeb` with phone normalization.

4. **`backend/tests/auth_and_users.test.js`**:
   - Expanded the automated test suite to 10 comprehensive tests covering client login, partner login, local phone formatting, international phone formatting, invalid passwords, nonexistent accounts, missing tokens, malformed tokens (`Bearer undefined`), invalid JWTs, and authenticated profile queries.

### Frontend (`frontEnd/touriva/`)

1. **`frontEnd/touriva/src/main.js`**:
   - Added **Axios Request Interceptor**:
     - Automatically strips malformed Authorization headers containing `'undefined'` or `'null'`.
     - Automatically retrieves and attaches `Authorization: Bearer <token>` from storage if the token is valid.
   - Added **Axios Response Interceptor**:
     - Automatically clears cached user credentials from `localStorage` upon receiving a `401 Unauthorized` error on protected endpoints (excluding login/signup), preventing stale session poisoning.

2. **`frontEnd/touriva/src/stores/auth.js`**:
   - Dual-writes user info to both Capacitor `Preferences` and `window.localStorage` synchronously, guaranteeing immediate access across stores and interceptors.
   - `account_sign_in()`: records `this.user` and `this.token`, awaits storage persistence, and extracts exact API error messages (`error.response?.data?.error || error.message`).
   - `account_sign_out()`: clears storage, resets store state, and navigates to `/`.

3. **`frontEnd/touriva/src/views/user/Login.vue`**:
   - Stripped hardcoded `role: 'partner'`.
   - Normalizes phone inputs before submitting (strips leading 0 if prepending `+213`).
   - Formats user-facing error alerts: translates `'ip'` to *"Phone number not registered"*, `'ipass'` to *"Incorrect password"*, and handles generic API errors cleanly.
   - Guarantees button loading state resets in a `finally` block.

4. **`frontEnd/touriva/src/stores/users.js`**:
   - `fetchUser()`: aborts immediately without network traffic if `!ls || !ls.token || !ls.user?._id`.
   - `loadUser()`: safely checks `ls?.user` with optional chaining to eliminate `TypeError`.
   - `editUsers()`, `updateUserProfile()`, `uploadPartnerImages()`, `loadPartnerPhotos()`: added authentication guards.

5. **`frontEnd/touriva/src/stores/` (Other Stores)**:
   - `billings.js`, `announcements.js`, `publications.js`, `daira.js`, `commune.js`, `sites.js`, `hotels.js`, `restaurants.js`, `advertising.js`, `wilaya.js`, `notifications.js`: cleaned up redundant or malformed header interpolation and added safe async/await guards.

6. **`frontEnd/touriva/src/views/Tabs.vue`**:
   - Mounted hook checks `if (users.getUser) { users.fetchUser() }`, preventing unauthenticated calls to `GET /api/users/:id`.

7. **`frontEnd/touriva/src/views/profile/Billing.vue`** & **`AdminAnnouncementForm.vue`**:
   - Added null guards before accessing `ls.user`.

---

## 3. Android Application Verification

- **Architecture:** The Android app in `frontEnd/touriva/android/` is a native Capacitor container (`com.touriva.app`) hosting the compiled web assets from `frontEnd/touriva/dist/`.
- **Sync:** Executed `npm run build && npx cap sync android` in `frontEnd/touriva/`.
- **Outcome:** Web assets and Capacitor configuration in `android/app/src/main/assets/public/` were synchronized with the updated auth flow.
- **Compatibility:**
  - Network security config (`android/app/src/main/res/xml/network_security_config.xml`) allows HTTPS traffic to `touriva-api.onrender.com`.
  - Android shares the identical Axios interceptors, token persistence via `@capacitor/preferences`, and phone normalization logic.
  - The Android app does not suffer from separate or diverging authentication issues.

---

## 4. Build & Deployment Results

| Target | Build Tool / Command | Result |
| :--- | :--- | :--- |
| **Backend API** | `jest --detectOpenHandles --forceExit` | **PASS** (22/22 tests passing across 4 test suites) |
| **Frontend Web** | Vite 7 (`npm run build`) | **PASS** (zero errors, bundle generated in 5.16s) |
| **Android Sync** | `npx cap sync android` | **PASS** (5 plugins detected, public assets updated) |
| **Render API** | Web Service (`srv-dbb3a4lg1s2s73e3ll9g`) | **Live** (`dep-dbb47oqfngtc739rvtmg`) |
| **Render Web** | Static Site (`srv-dbb3a78m7kps73aspl90`) | **Live** (`dep-dbb47qigjjms73cvgtjg`) |

---

## 5. Live Production Verification Test Results

Tests executed against live production endpoints (`https://touriva-api.onrender.com` & `https://touriva-web.onrender.com`):

```text
=== TOURIVA LIVE AUTHENTICATION VERIFICATION ===

1. Health Check: PASS Touriva Tourism API connected
2. Client Login (+213550000010): PASS User: customer@touriva.test Role: client HasToken: true
3. Client Login (0550000010): PASS User: customer@touriva.test HasToken: true
4. Partner Login (0550000002): PASS User: guide@touriva.test Role: partner
5. Wrong Password Handling: PASS Status: 400 Error: ipass
6. Nonexistent Phone Handling: PASS Status: 400 Error: ip
7. Protected Endpoint Without Token (GET /api/users): PASS Status: 401 Error: Authorization token required
8. Malformed Token Header (Bearer undefined): PASS Status: 401 Error: Authorization token required
9. Malformed Token Header (Bearer null): PASS Status: 401 Error: Authorization token required
10. Invalid JWT Token: PASS Status: 401 Error: request is not authorized
11. Protected Endpoint With Valid JWT (GET /api/users/:id): PASS Fetched User ID: 6ad5eb439093d45f5ec48c50 Phone: +213550000010
12. Trip Booking (POST /api/tripSubscriptions): PASS Status: 201 Booking ID: 6ad644330940c0d0a453b9e1

=== ALL 12 LIVE PRODUCTION VERIFICATION TESTS COMPLETED ===
```

### Key Security & Flow Confirmations:
1. **Public Login Route:** `POST /api/users/login` succeeds without requiring any pre-existing JWT.
2. **Flexible Phone Input:** Accepts both Algerian local format (`0550...`) and international format (`+213550...`).
3. **Protected Endpoint Security:** Unauthenticated requests to `/api/users` and `/api/users/:id` return `401 {"error":"Authorization token required"}`.
4. **Invalid Token Security:** Malformed tokens return `401 {"error":"Authorization token required"}` and bogus JWTs return `401 {"error":"request is not authorized"}`.
5. **Session Continuity:** Authenticated requests with a valid token return `200 OK` and load the user profile as expected.

---

## 6. Remaining Issues & Recommendations

- **No remaining authentication issues:** The web sign-in error has been fully fixed and the live deployment verified.
- **Free Plan Cold Starts:** Render free web services spin down after 15 minutes of inactivity. Initial requests may take 30–50 seconds while the service spins up, after which response times are normal.
- **Protected Djawal Boundaries:** The original Djawal codebase and its databases were completely untouched.
