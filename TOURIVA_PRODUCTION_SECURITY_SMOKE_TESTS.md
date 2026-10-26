# TOURIVA — PRODUCTION SECURITY SMOKE TESTS & LIVE VERIFICATION

**Execution Timestamp:** October 26, 2026, 13:10:03 UTC  
**Target Environment:** Production Render Web Services & Static Frontends  
**Deployed Commit:** `5068a6e67acb5f7b2c8e25b05647eccb383c963e` (`5068a6e`)  
**Base URL:** `https://touriva-api.onrender.com`  
**Auditor / Agent:** Antigravity Autonomous Security Engineering Agent  

---

## 1. SMOKE TEST EXECUTION SUMMARY

| Test ID | Test Category | Target Endpoint | Method | Origin Header | Expected Result | Actual Result | Status |
|:---:|---|---|:---:|---|---|---|:---:|
| **SMK-01** | Service Health & Uptime | `/api/health` | `GET` | *(None)* | HTTP 200, status "ok", DB connected | HTTP 200 `{"status":"ok", ...}` | **PASS** |
| **SMK-02** | CORS Untrusted Origin | `/api/health` | `GET` | `https://malicious-test.com` | No `Access-Control-Allow-Origin` | Header omitted / Origin denied | **PASS** |
| **SMK-03** | CORS Trusted Origin | `/api/health` | `GET` | `https://touriva-web.onrender.com` | `Access-Control-Allow-Origin: https://touriva-web.onrender.com`, `credentials: true` | Matched & Allowed with credentials | **PASS** |
| **SMK-04** | CORS Preflight Handling | `/api/health` | `OPTIONS` | `https://touriva-web.onrender.com` | HTTP 204 No Content, Allowed Methods & Headers | HTTP 204 with full CORS preflight headers | **PASS** |
| **SMK-05** | Account Takeover Protection | `/api/users/update_existing_user/:id` | `PATCH` | *(None)* | HTTP 401 Unauthorized (`Authorization token required`) | HTTP 401 `{"error":"Authorization token required"}` | **PASS** |
| **SMK-06** | User Listing Auth Guard | `/api/users` | `GET` | *(None)* | HTTP 401 Unauthorized (`Authorization token required`) | HTTP 401 `{"error":"Authorization token required"}` | **PASS** |
| **SMK-07** | Mutation Route Auth Guard | `/api/sites` | `POST` | *(None)* | HTTP 401 Unauthorized (`Authorization token required`) | HTTP 401 `{"error":"Authorization token required"}` | **PASS** |
| **SMK-08** | Public Data Availability | `/api/sites` | `GET` | *(None)* | HTTP 200 with catalog array; zero password hashes | HTTP 200 with valid destinations | **PASS** |

---

## 2. DETAILED TEST LOGS & HTTP HEADERS

### 2.1 SMK-01: Health & Service Status Check
**Request:**
```bash
curl -sS -i https://touriva-api.onrender.com/api/health
```
**Response:**
```http
HTTP/2 200 
date: Mon, 26 Oct 2026 13:10:02 GMT
content-type: application/json; charset=utf-8
access-control-allow-credentials: true
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: cross-origin
ratelimit-limit: 1000
ratelimit-remaining: 999
strict-transport-security: max-age=31536000; includeSubDomains
x-content-type-options: nosniff
x-frame-options: SAMEORIGIN

{"status":"ok","service":"Touriva Tourism API","uptime":51.96,"timestamp":"2026-10-26T13:10:02.753Z","database":"connected"}
```
*Verification:* Service is healthy, database connection active, security headers (CSP, HSTS, X-Content-Type-Options) active.

---

### 2.2 SMK-02: CORS Protection against Untrusted Origin
**Request:**
```bash
curl -sS -i -H "Origin: https://malicious-test.com" https://touriva-api.onrender.com/api/health
```
**Response Headers:**
```http
HTTP/2 200 
date: Mon, 26 Oct 2026 13:10:03 GMT
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: cross-origin
strict-transport-security: max-age=31536000; includeSubDomains
x-content-type-options: nosniff
x-frame-options: SAMEORIGIN
```
*Verification:* The response header `Access-Control-Allow-Origin` is **completely absent**. Browsers executing requests from `https://malicious-test.com` will block the response, preventing credentialed cross-origin read attacks.

---

### 2.3 SMK-03: CORS Allowance for Legitimate Production Origin
**Request:**
```bash
curl -sS -i -H "Origin: https://touriva-web.onrender.com" https://touriva-api.onrender.com/api/health
```
**Response Headers:**
```http
HTTP/2 200 
date: Mon, 26 Oct 2026 13:10:03 GMT
content-type: application/json; charset=utf-8
access-control-allow-credentials: true
access-control-allow-origin: https://touriva-web.onrender.com
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: cross-origin
strict-transport-security: max-age=31536000; includeSubDomains
vary: Origin
```
*Verification:* Legitimate frontend `https://touriva-web.onrender.com` is explicitly matched and permitted with `access-control-allow-credentials: true`.

---

### 2.4 SMK-04: CORS Preflight (OPTIONS)
**Request:**
```bash
curl -sS -i -X OPTIONS \
  -H "Origin: https://touriva-web.onrender.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  https://touriva-api.onrender.com/api/health
```
**Response Headers:**
```http
HTTP/2 204 
access-control-allow-credentials: true
access-control-allow-headers: Content-Type,Authorization,X-Requested-With
access-control-allow-methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
access-control-allow-origin: https://touriva-web.onrender.com
```
*Verification:* HTTP 204 No Content returned with appropriate access control headers and methods permitted.

---

### 2.5 SMK-05: Account Takeover Endpoint Protection
**Request:**
```bash
curl -sS -i -X PATCH \
  -H "Content-Type: application/json" \
  -d '{"role":"administrator"}' \
  https://touriva-api.onrender.com/api/users/update_existing_user/123456789012345678901234
```
**Response:**
```http
HTTP/2 401 
content-type: application/json; charset=utf-8

{"error":"Authorization token required"}
```
*Verification:* Unauthorized attempts to mutate user profiles and escalate privileges are strictly rejected with HTTP 401.

---

### 2.6 SMK-06 & SMK-07: Unauthenticated Mutation Protection
**Request (User Enumeration):**
```bash
curl -sS -i https://touriva-api.onrender.com/api/users
```
**Response:**
```http
HTTP/2 401 
{"error":"Authorization token required"}
```

**Request (Site Creation Mutation):**
```bash
curl -sS -i -X POST -H "Content-Type: application/json" \
  -d '{"name":"Unauthorized Site"}' \
  https://touriva-api.onrender.com/api/sites
```
**Response:**
```http
HTTP/2 401 
{"error":"Authorization token required"}
```
*Verification:* All sensitive user retrieval and resource mutations are locked behind authentication middleware.

---

## 3. VERDICT
**ALL LIVE PRODUCTION SMOKE TESTS PASSED (8/8).**
The Phase 1 security remediation is fully active on the live Render infrastructure.
