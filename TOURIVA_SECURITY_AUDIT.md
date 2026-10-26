# Touriva Comprehensive Security Audit Report

**Date of Audit:** October 26, 2026  
**Auditor:** DeepMind Antigravity Advanced Agentic Coding Engine  
**Target Codebase:** Touriva Platform (`/home/next/next projects/touriva`)  
**Scope:** Core Backend API, Shop Backend, 5 Web Frontends, Android Mobile Component, Production Render Services  
**Overall Security Score:** **42 / 100**  
**Security Status:** **HIGH RISK — NOT PRODUCTION READY**

---

## 1. Executive Security Summary

A rigorous, full-scope security audit of the Touriva platform was performed covering static analysis, dynamic API testing against both local and live Render production environments, dependency vulnerability scanning, secrets discovery, cryptographic review, and mobile application posture analysis.

While positive architectural foundations exist (such as Express 5, Helmet HTTP headers, bcrypt password hashing, and basic rate limiting), the audit identified **multiple Critical-severity security vulnerabilities** that constitute immediate production blockers:

1. **Unauthenticated Account Takeover & Role Elevation (`CRIT-01`):** The endpoint `PATCH /api/users/update_existing_user/:id` is mounted prior to authentication middleware and accepts unvalidated `{ ...req.body }` with password and role modifications. Any anonymous visitor can overwrite any user's credentials and escalate to `administrator`.
2. **Sensitive Data & Password Hash Exposure (`CRIT-02`):** `GET /api/users` does not restrict access to administrators and fails to project out `password`. Any authenticated visitor (including newly self-registered clients) receives the bcrypt password hashes, phone numbers, emails, and personal identification documents of all users in the system.
3. **84 Unprotected Mutation Endpoints (`CRIT-03`):** Authentication middleware (`requireAuth`) is completely commented out in multiple route controllers (`sites.js`, `hotels.js`, `restaurants.js`, `products.js`, `activities.js`, `trips.js`, `wilayas.js`, `announcements.js`, `advertising.js`, `plans.js`, `partners.js`, `communes.js`, `dairas.js`, `formations.js`, `inboxes.js`). Any anonymous internet user can create, modify, or permanently delete core tourism resources.
4. **CORS Misconfiguration with Credentials Enabled (`CRIT-04`):** The API dynamically reflects arbitrary `Origin` headers while setting `Access-Control-Allow-Credentials: true`. Verified live on `https://touriva-api.onrender.com`.
5. **Hardcoded Google Maps API Key in Bundles & Repositories (`HIGH-01`):** A live Google Maps API key is committed across multiple store files, templates, and compiled distribution assets.
6. **Insecure Android Network Security Configuration (`HIGH-02`):** Mobile network configuration allows cleartext HTTP traffic globally and trusts user-installed CA certificates, facilitating Man-in-the-Middle (MITM) attacks.
7. **Critical Dependency Advisories in Mobile & Client Bundles (`HIGH-03`):** Critical Capacitor vulnerability GHSA-rvm3-566m-v7fv (CVSS 9.3) and Axios prototype pollution/SSRF vulnerabilities.

---

## 2. Vulnerability Classification Matrix

| Finding ID | Title | OWASP / CWE Category | Severity | Production Blocking? |
|:---|:---|:---|:---:|:---:|
| **SEC-CRIT-01** | Unauthenticated Account Takeover & Privilege Escalation | CWE-287 / OWASP A01:2021 | **CRITICAL** | **YES** |
| **SEC-CRIT-02** | Full Database User PII & Password Hash Leakage via `GET /api/users` | CWE-200 / CWE-359 / OWASP A01 | **CRITICAL** | **YES** |
| **SEC-CRIT-03** | 84 Mutation Routes Missing Authentication (`requireAuth` Disabled) | CWE-306 / OWASP A01:2021 | **CRITICAL** | **YES** |
| **SEC-CRIT-04** | Arbitrary CORS Origin Reflection with `Access-Control-Allow-Credentials` | CWE-942 / OWASP A05:2021 | **CRITICAL** | **YES** |
| **SEC-HIGH-01** | Hardcoded Google Maps API Key in Source & Bundles | CWE-798 / OWASP A07:2021 | **HIGH** | **YES** |
| **SEC-HIGH-02** | Insecure Android Network Security Config (User CA Trust & Cleartext) | CWE-295 / CWE-319 | **HIGH** | **YES** |
| **SEC-HIGH-03** | Capacitor Android/iOS Remote Content Origin Bypass (GHSA-rvm3-566m-v7fv) | CWE-346 / CWE-441 | **HIGH** | **YES** |
| **SEC-HIGH-04** | Unbounded JSON Body Limit (50MB) Susceptible to Memory Exhaustion | CWE-400 / CWE-770 | **HIGH** | NO |
| **SEC-MED-01** | Password Complexity Unenforced (`validator.isStrongPassword` commented out) | CWE-521 / OWASP A07:2021 | **MEDIUM** | NO |
| **SEC-MED-02** | Lack of JWT Invalidation / Revocation Mechanism (7-day static window) | CWE-613 / OWASP A07:2021 | **MEDIUM** | NO |
| **SEC-MED-03** | Lack of Server-Side CASL Authorization Enforcement | CWE-285 / OWASP A01:2021 | **MEDIUM** | NO |
| **SEC-LOW-01** | Verbose Error Stack Traces in Development Mode | CWE-209 | **LOW** | NO |
| **SEC-LOW-02** | Transitive Outdated Packages in Shop Submodules | CWE-1104 | **LOW** | NO |

---

## 3. Deep-Dive Vulnerability Analysis

### 3.1 SEC-CRIT-01: Unauthenticated Account Takeover & Privilege Escalation
- **Affected Route:** `PATCH /api/users/update_existing_user/:id`
- **Affected Files:**
  - `backend/routes/users.js` (line 50)
  - `backend/controllers/usersController.js` (lines 173–201)
  - `shop/backend/routes/users.js` (line 47)
- **Vulnerability Description:**
  In `backend/routes/users.js`, `router.patch('/update_existing_user/:id', update_existing_user)` is placed **before** `router.use(requireAuth)`. Furthermore, `update_existing_user` takes `{ ...req.body }` directly into `User.findOneAndUpdate({ _id: id }, { ...req.body })`. If `password` is present in `req.body`, it salts and hashes the new password before saving.
- **Proof of Concept / Evidence:**
  Executing an unauthenticated request:
  ```http
  PATCH /api/users/update_existing_user/6ad5eb439093d45f5ec48c3e HTTP/1.1
  Host: localhost:4000
  Content-Type: application/json

  {
    "password": "AttackerTakeover123!",
    "role": "administrator"
  }
  ```
  The endpoint processes the request without checking any JWT token or origin credentials, updates the target user's password, and grants administrative permissions.
- **Impact:** Complete takeover of any user or administrator account by anyone with network access.
- **Remediation:**
  1. Move `router.patch('/update_existing_user/:id')` behind `router.use(requireAuth)`.
  2. Implement strict authorization asserting `req.user._id.toString() === req.params.id || req.user.role === 'administrator'`.
  3. Prohibit role modification via this endpoint; role modifications must be restricted to an admin-only endpoint.

---

### 3.2 SEC-CRIT-02: User PII & Password Hash Leakage via `GET /api/users`
- **Affected Route:** `GET /api/users`
- **Affected Files:**
  - `backend/controllers/usersController.js` (lines 137–141)
  - `backend/models/User.js`
- **Vulnerability Description:**
  In `backend/controllers/usersController.js`:
  ```javascript
  const getUsers = async (req, res) => {
      const users = await User.find().sort({ createdAt: -1}).populate("categoryId").populate("authorizationIds")
      res.status(200).json(users)
  }
  ```
  1. There is no check verifying that `req.user.role === 'administrator'`. Any user holding a valid JWT token (such as a newly signed up traveler or partner) can invoke `GET /api/users`.
  2. The query does not exclude the `password` field (`.select('-password')`), nor does `UserSchema` specify `select: false` on `password`.
- **Proof of Concept / Evidence:**
  Live dynamic test execution using a `client` role token:
  ```javascript
  // Authenticated as role 'client' (customer@touriva.test)
  const res = await request(app).get('/api/users').set('Authorization', 'Bearer ' + clientToken);
  // Returned HTTP 200 OK with 11 user records.
  // Sample document returned:
  {
    "_id": "6ad5eb439093d45f5ec48c3e",
    "email": "admin@touriva.test",
    "password": "$2b$10$V9/...",  // BCRYPT HASH LEAKED
    "phone": "+213550000001",
    "role": "administrator"
  }
  ```
- **Impact:** Exposure of sensitive personal identification data (phone, email, legal IDs, commercial register numbers) and password hashes for all registered users, enabling offline dictionary attacks and account compromise.
- **Remediation:**
  1. Enforce `select: false` on the `password` field in `UserSchema`.
  2. Apply role-based access control middleware restricting `GET /api/users` strictly to users where `req.user.role === 'administrator'`.
  3. Sanitize and project only necessary fields for non-sensitive lookups.

---

### 3.3 SEC-CRIT-03: 84 Mutation Routes Missing Authentication
- **Affected Routes:** 84 endpoints across 16 route files
- **Key Affected Files:**
  - `backend/routes/sites.js`
  - `backend/routes/hotels.js`
  - `backend/routes/restaurants.js`
  - `backend/routes/products.js`
  - `backend/routes/activities.js`
  - `backend/routes/trips.js`
  - `backend/routes/wilayas.js`
  - `backend/routes/announcements.js`
  - `backend/routes/advertising.js`
  - `backend/routes/plans.js`
  - `backend/routes/partners.js`
  - `backend/routes/communes.js`
  - `backend/routes/dairas.js`
  - `backend/routes/formations.js`
  - `backend/routes/inboxes.js`
  - `backend/routes/categories.js`
- **Vulnerability Description:**
  In all the files listed above, lines importing and applying `requireAuth` were commented out:
  ```javascript
  // const requireAuth = require('../middleware/requireAuth')
  // router.use(requireAuth)
  ```
  As a direct result:
  - `POST /api/sites`, `DELETE /api/sites/:id`, `PATCH /api/sites/:id`, `POST /api/sites/import` are completely unauthenticated.
  - `POST /api/hotels`, `DELETE /api/hotels/:id`, `PATCH /api/hotels/:id`, `POST /api/hotels/import` are unauthenticated.
  - `POST /api/restaurants`, `DELETE /api/restaurants/:id`, `PATCH /api/restaurants/:id` are unauthenticated.
  - `POST /api/products`, `DELETE /api/products/:id`, `PATCH /api/products/:id` are unauthenticated.
  - `POST /api/trips`, `PUT /api/trips/:id`, `DELETE /api/trips/:id` are unauthenticated.
  - `POST /api/wilayas`, `DELETE /api/wilayas/:id`, `POST /api/wilayas/delete` are unauthenticated.
- **Impact:** Any unauthenticated actor on the internet can delete or modify catalog listings, inject malicious links or content into destinations and hotel entries, or delete entire collections.
- **Remediation:**
  Uncomment `router.use(requireAuth)` on all administrative and mutation routes. Keep only public read-only catalog routes (`GET /`, `GET /:id`) public.

---

### 3.4 SEC-CRIT-04: Arbitrary CORS Origin Reflection with Credentials
- **Affected Component:** `backend/server.js` (lines 35–48)
- **Production Environment:** `render.yaml` (`CORS_ORIGINS: "*"`)
- **Vulnerability Description:**
  In `server.js`:
  ```javascript
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
    : ['*']

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Blocked by CORS policy'))
      }
    },
    credentials: true
  }))
  ```
  When `allowedOrigins.includes('*')` is true, the callback returns `callback(null, true)`, which instructs the `cors` package to mirror the client's supplied `Origin` header in `Access-Control-Allow-Origin` while concurrently issuing `Access-Control-Allow-Credentials: true`.
- **Live Production Proof of Concept:**
  ```bash
  curl -i -H "Origin: https://attacker-controlled-site.com" https://touriva-api.onrender.com/api/health
  ```
  Response received:
  ```http
  HTTP/2 200
  access-control-allow-origin: https://attacker-controlled-site.com
  access-control-allow-credentials: true
  vary: Origin
  ```
- **Impact:** Malicious third-party websites visited by an authenticated Touriva user can make cross-origin authenticated requests and read sensitive responses.
- **Remediation:**
  In production, `CORS_ORIGINS` must be explicitly restricted to Touriva's verified domains:
  `https://touriva-web.onrender.com,https://touriva-admin.onrender.com,https://touriva-shop-web.onrender.com,https://touriva-shop-admin.onrender.com,https://touriva-shop-seller-admin.onrender.com,http://localhost:2020,http://localhost:2021`.

---

### 3.5 SEC-HIGH-01: Hardcoded Google Maps API Key
- **Affected Files:**
  - `frontEnd/touriva/index.html` (line 17)
  - `frontEnd/touriva/src/stores/sites.js` (lines 61, 116)
  - `frontEnd/touriva/src/stores/restaurants.js` (lines 62, 118)
  - `frontEnd/touriva/src/stores/hotels.js` (lines 61, 119)
  - `frontEnd/touriva/src/stores/places.js` (line 31)
  - `frontEnd/touriva/src/views/PlaceDetail.vue` (line 270)
  - `frontEnd/touriva/src/views/Trip/New.vue` (line 590)
  - `frontEnd/touriva/src/components/SiteCardLocal.vue` (line 57)
- **Vulnerability Description:**
  The Google Maps API key `AIzaSyDxFsMTjS-UsZgkJXcAPbtLQFHmNrg7wN4` is hardcoded directly into multiple source code files, store definitions, HTML headers, and compiled production assets.
- **Impact:** Unrestricted quota exhaustion, financial billing unexpected spikes, or API quota denial of service by third parties.
- **Remediation:**
  1. Restrict the API key in the Google Cloud Console by HTTP referrer (e.g. `*.onrender.com/*`) and Android package signature SHA-1.
  2. Replace hardcoded instances with `import.meta.env.VITE_GOOGLE_MAPS_KEY`.

---

### 3.6 SEC-HIGH-02: Insecure Android Network Security Configuration
- **Affected File:** `frontEnd/touriva/android/app/src/main/res/xml/network_security_config.xml`
- **Vulnerability Description:**
  ```xml
  <network-security-config>
      <base-config cleartextTrafficPermitted="true">
          <trust-anchors>
              <certificates src="system" />
              <certificates src="user" />
          </trust-anchors>
      </base-config>
      <domain-config cleartextTrafficPermitted="true">
          <domain includeSubdomains="true">touriva.com</domain>
          ...
      </domain-config>
  </network-security-config>
  ```
  1. `cleartextTrafficPermitted="true"` is enabled across all domains in `<base-config>`.
  2. `<certificates src="user" />` is trusted in production base-config.
- **Impact:** Any user certificate installed on an Android device (via malicious app, malicious WiFi profile, or corporate proxy) can decrypt and modify all HTTPS communications of the mobile application.
- **Remediation:**
  1. Set `cleartextTrafficPermitted="false"` in production.
  2. Separate debug and release network configurations using `debug-overrides` for user certificates.

---

### 3.7 SEC-HIGH-03: Dependency Vulnerabilities
`npm audit` was executed across all sub-projects:

- **`backend`:** 1 High
  - `body-parser` (GHSA-27r3-jxmh-p828): Denial of service via trailing bytes after compressed body.
- **`frontEnd/touriva`:** 4 Critical, 16 High, 6 Moderate, 1 Low (27 Total)
  - `@capacitor/android` & `@capacitor/ios` (GHSA-rvm3-566m-v7fv - CVSS 9.3): Remote content loaded at app origin via internal HTTP proxy path.
  - `axios` (GHSA-pmwg-cvhr-8vh7, GHSA-3w6x-2g7m-8v23): SSRF bypass, JSON prototype tampering.
- **`frontEnd/touriva_adminPanel`:** 2 Critical, 7 High, 4 Moderate, 1 Low (14 Total)
  - `dompurify` / `jspdf`: Prototype pollution and HTML injection.
- **`shop/backend`:** 4 Critical, 12 High, 11 Moderate, 1 Low (28 Total)

---

## 4. Secrets Exposure Scan

A comprehensive regex scan was conducted across all files (excluding `.git`, `node_modules`, and `dist`):

| Secret Type | Status | Location / Observation |
|:---|:---:|:---|
| **Google Maps API Key** | **FOUND (Committed)** | Key `AIzaSyDx...` in 14 source files across `frontEnd/touriva` |
| **Twilio Credentials** | Safe / Environment-driven | `ACCOUNT_SID`, `AUTH_TOKEN`, `SERVICE_ID` loaded via `.env` |
| **Email Credentials** | Safe / Environment-driven | `MAIL_USER`, `MAIL_PASS` loaded via `.env` |
| **Ollama API Key** | Safe / Environment-driven | `OLLAMA_API_KEY` loaded via `.env` |
| **JWT Secret** | Hardcoded Fallback Found | Fallback `touriva_production_secure_secret_token_2026` in `docker-compose.yaml` |
| **Database Passwords** | Safe / Masked | Local MongoDB requires no auth; Render URI securely injected |
| **Demo Password** | Static Constant | `Password123!` in seed files (acceptable for test fixtures, but accounts must be removed in production) |

---

## 5. Security Posture Scoring

| Domain | Weight | Score | Reason |
|:---|:---:|:---:|:---|
| **Authentication & Session Management** | 20% | 45 / 100 | Static 7-day JWT, missing revoke, password complexity off |
| **Access Control & Authorization** | 25% | 15 / 100 | 84 unauthenticated mutation routes, BOLA on users, public takeover |
| **Data Protection & Cryptography** | 15% | 50 / 100 | Leaked password hashes on `GET /api/users`, base64 image bloat |
| **API & Network Security** | 15% | 40 / 100 | CORS arbitrary reflection, Android cleartext & user CA trust |
| **Secrets & Credential Hygiene** | 10% | 45 / 100 | Hardcoded Google Maps key in source, static fallback secret |
| **Third-Party Dependencies** | 15% | 60 / 100 | Critical Capacitor GHSA-rvm3-566m-v7fv, Axios SSRF/pollution |
| **Weighted Total Security Score** | **100%** | **42 / 100** | **HIGH RISK — IMMEDIATE REMEDIATION MANDATED** |

---

## 6. Required Remediation Roadmap (Phase 2)

```mermaid
flowchart TD
    A["Phase 2 Security Remediation"] --> B["1. Access Control Lockdown"]
    A --> C["2. User Data Protection"]
    A --> D["3. Network & CORS Hardening"]
    A --> E["4. Mobile & Dependency Upgrades"]

    B --> B1["Re-enable requireAuth on all 84 mutation routes"]
    B --> B2["Restrict PATCH /update_existing_user behind auth & role checks"]
    
    C --> C1["Set select: false on User.password"]
    C --> C2["Add requireRole('administrator') on GET /api/users"]

    D --> D1["Replace CORS wildcard with explicit Touriva origin list"]
    D --> D2["Enforce strict Content-Security-Policy"]

    E --> E1["Update @capacitor/* to patched release (>= 7.6.9)"]
    E --> E2["Update Axios to >= 1.15.2 across frontends"]
    E --> E3["Restrict Android network_security_config.xml in release"]
```
