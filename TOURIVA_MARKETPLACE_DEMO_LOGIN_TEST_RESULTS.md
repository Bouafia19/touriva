# TOURIVA INDEPENDENT MARKETPLACE — DEMO LOGIN TEST RESULTS

> **Test Suite:** Automated Unit, Integration & API Acceptance  
> **Environment:** Node.js v24 / Jest / Supertest / Live Render Production API  
> **Execution Date:** November 5, 2026  
> **Overall Result:** **81 / 81 TESTS PASSED (100%)**

---

## 1. AUTOMATED TEST SUITE EXECUTION SUMMARY

```
PASS tests/demo_users_and_auth.test.js (19 tests)
PASS tests/p0_security_remediation.test.js (14 tests)
PASS tests/e2e_marketplace_lifecycle.test.js (18 tests)
PASS tests/marketplace_api.test.js (16 tests)
PASS tests/shop_api.test.js (14 tests)

Test Suites: 5 passed, 5 total
Tests:       81 passed, 81 total
Snapshots:   0 total
Time:        6.821 s
Ran all test suites.
```

---

## 2. DETAILED BREAKDOWN: `demo_users_and_auth.test.js`

This dedicated suite verifies that demo personas can authenticate cleanly through real endpoints and that security boundaries are strictly enforced.

### Section 1: Customer Demo Authentication
- `1.1: Customer can sign in via email and password` — **PASS**
  - Authenticates `customer@touriva.test` via `POST /api/users/login`.
  - Receives HTTP 200, valid JWT, and role `client`.
- `1.2: Customer can sign in via phone number and password` — **PASS**
  - Authenticates `+213550000010` via `POST /api/users/login`.
  - Receives HTTP 200, valid JWT, and user metadata.

### Section 2: Seller Demo Authentication
- `2.1: Seller 1 can sign in with valid credentials` — **PASS**
  - Authenticates `seller1@touriva.test` with role `seller`.
  - Receives HTTP 200 and valid JWT.
- `2.2: Seller 2 can sign in with valid credentials` — **PASS**
  - Authenticates `seller2@touriva.test` with role `seller`.
  - Receives HTTP 200 and valid JWT.

### Section 3: Owner Administrator Authentication
- `3.1: Admin can sign in with valid credentials and receives CASL rules` — **PASS**
  - Authenticates `admin@touriva.test` with role `administrator`.
  - Receives HTTP 200, CASL abilities, and valid JWT.

### Section 4: Authentication Security & Invalid Credentials
- `4.1: Rejects login with wrong password (HTTP 400)` — **PASS**
  - Submits invalid password; receives error `Invalid email or password`.
- `4.2: Rejects login with non-existent email (HTTP 400)` — **PASS**
  - Submits non-existent email; receives HTTP 400.
- `4.3: Enforces bcrypt password hashing (no plaintext in DB)` — **PASS**
  - Queries DB directly; verifies all password fields start with `$2b$10$`.

### Section 5: Role-Based Access Control (RBAC)
- `5.1: Client cannot access seller dashboard (HTTP 403)` — **PASS**
  - Requests `/api/seller/dashboard` with customer token; rejected with HTTP 403.
- `5.2: Client cannot access admin orders (HTTP 403)` — **PASS**
  - Requests `/api/marketplace-admin/orders` with customer token; rejected with HTTP 403.
- `5.3: Seller cannot access admin settings (HTTP 403)` — **PASS**
  - Requests `/api/marketplace-admin/settings` with seller token; rejected with HTTP 403.

### Section 6: Multi-Tenant Seller Isolation
- `6.1: Seller 1 only sees their own products` — **PASS**
  - Requests `/api/seller/products` as Seller 1; returns only Seller 1 products.
- `6.2: Seller 1 only sees their own orders` — **PASS**
  - Requests `/api/seller/orders` as Seller 1; returns only Seller 1 order items.
- `6.3: Cross-seller product modification is blocked (HTTP 403)` — **PASS**
  - Seller 1 attempts `PUT /api/seller/products/:s2ProductId`; rejected with HTTP 403.
- `6.4: Cross-seller product deletion is blocked (HTTP 403)` — **PASS**
  - Seller 1 attempts `DELETE /api/seller/products/:s2ProductId`; rejected with HTTP 403.

### Section 7: Customer Order Isolation
- `7.1: Customer can view their own orders via /api/marketplace/orders/my` — **PASS**
  - Requests customer orders; returns only own orders.
- `7.2: Customer cannot view another customer's order without authorization` — **PASS**
  - Requests another user's order; access denied or not found.

### Section 8: Demo Login Restriction & Anti-Bypass
- `8.1: Prohibits administrator demo login bypass (SEC-01)` — **PASS**
  - Attempts unauthenticated admin demo token generation; blocked.
- `8.2: Disables demo login completely in production mode (NODE_ENV=production)` — **PASS**
  - Tests `/api/users/demo-login` under `NODE_ENV=production`; returns HTTP 404.

---

## 3. LIVE PRODUCTION DIRECT API TEST MATRIX

Executed directly against `https://touriva-shop-api.onrender.com`:

| Test Account | Persona | Tested Endpoint | Payload | HTTP Status | Verdict |
|---|---|---|---|---|---|
| `customer@touriva.test` | Verified Customer | `POST /api/users/login` | `{ email, password, role: 'client' }` | **200 OK** | PASS |
| `traveler2@touriva.test` | Verified Traveler | `POST /api/users/login` | `{ email, password, role: 'client' }` | **200 OK** | PASS |
| `buyer2@touriva.test` | Legacy Buyer | `POST /api/users/login` | `{ email, password, role: 'client' }` | **200 OK** | PASS |
| `demo.buyer1@touriva.example` | Demo Buyer (Algiers) | `POST /api/users/login` | `{ email, password, role: 'client' }` | **200 OK** | PASS |
| `seller1@touriva.test` | Primary Verified Seller | `POST /api/users/login` | `{ email, password, role: 'seller' }` | **200 OK** | PASS |
| `demo.seller1@touriva.example` | Atlas Electronics DZ | `POST /api/users/login` | `{ email, password, role: 'seller' }` | **200 OK** | PASS |
| `admin@touriva.test` | Legacy Super Admin | `POST /api/users/login` | `{ email, password, role: 'administrator' }` | **200 OK** | PASS |
| `demo.admin@touriva.example` | Marketplace Admin | `POST /api/users/login` | `{ email, password, role: 'administrator' }` | **200 OK** | PASS |
| Anonymous | Unauthenticated Attacker | `POST /api/users/demo-login` | `{ role: 'admin' }` | **404 Not Found** | SECURE |
| Seller 1 | Cross-Tenant Attacker | `PUT /api/seller/products/:s2Id` | `{ name: 'HACKED' }` | **403 Forbidden** | SECURE |
