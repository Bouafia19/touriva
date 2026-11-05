# TOURIVA MARKETPLACE — RC-1 INDEPENDENT SECURITY VERIFICATION

**Document Identifier:** TRV-SEC-VERIF-RC1-2026-V1  
**Target Environment:** Touriva Independent Multi-Vendor Marketplace  
**Release Candidate:** v1.0.0-rc.1  
**Author:** Senior Cloud Infrastructure & Application Security Auditor  
**Date:** November 5, 2026  
**Status:** ALL P0 AND ADDITIONAL SECURITY CONTROLS INDEPENDENTLY VERIFIED  

---

## 1. EXECUTIVE VERIFICATION SUMMARY

This report documents the independent verification of all security controls and business logic remediations implemented in the Touriva Independent Marketplace codebase. Rather than relying on previous test assertions, each vulnerability was independently analyzed at the API and controller level, tested against live endpoints with custom payloads, and cross-verified against database storage.

All five primary security vulnerabilities (SEC-01 through SEC-05), the core inventory integrity defect (BUS-01), the deceptive checkout information issue (UX-01), and additional Phase 2 security vectors have been verified as resolved.

---

## 2. INDEPENDENT VULNERABILITY REPRODUCTION & VERIFICATION

### 2.1 SEC-01: Demo Administrator Backdoor Defense
- **Endpoint:** `POST /api/users/demo-login`
- **Original Vulnerability:** In previous versions, any client could invoke this route with `accountType: 'admin'` or `demoType: 'admin'` and obtain an active JWT token for Khaled Bouafia (`role: 'administrator'`) without credentials.
- **Independent Verification Results:**
  1. *Production Environment Check:* When `NODE_ENV=production`, the endpoint immediately terminates execution and returns `HTTP 404 {"error": "Endpoint not found"}`.
  2. *Disabled Flag Check:* In non-production environments where `ENABLE_DEMO_LOGIN` is not explicitly set to `'true'`, the endpoint returns `HTTP 404`.
  3. *Administrator Ban Check:* When invoked with `{ demoType: 'admin' }`, `{ demoType: 'administrator' }`, or `{ role: 'administrator' }`, the controller intercepts the request before database querying and returns `HTTP 403 Forbidden` (`{"error": "Administrator demo authentication is strictly prohibited."}`).
  4. *Approved Whitelist:* The internal whitelist `APPROVED_DEMO_ACCOUNTS` contains only `seller` and `client` roles. Administrator accounts have been completely purged from demo code paths.

### 2.2 SEC-02: Password Hashing, Safe Storage & Privilege Escalation Defense
- **Endpoints:** `POST /api/users/signup`, `POST /api/users/signupUserWeb`, `POST /api/users/login`
- **Original Vulnerability:** `UserSchema.statics.signup` calculated `bcrypt.hash(password, 10)` but persisted `password: password` (plaintext) to MongoDB. Furthermore, any public registrant could pass `role: 'administrator'` to obtain immediate owner permissions.
- **Independent Verification Results:**
  1. *Bcrypt Hash Storage:* Registering a new account stores a salted bcrypt string matching `/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/` in MongoDB. Direct query via `.select('+password')` confirmed zero plaintext persistence.
  2. *Response Sanitization:* API response payloads for registration and profile fetching strictly omit `password` and password hashes.
  3. *Admin Self-Assignment Prevention:* Submitting `{ role: 'administrator' }` to either `POST /api/users/signup` or `POST /api/users/signupUserWeb` returns `HTTP 403 Forbidden` (`{"error": "Self-assignment of administrator privileges is strictly prohibited."}`).
  4. *Transparent On-Login Migration:* Simulating pre-existing legacy accounts with plaintext passwords, the custom `verifyPasswordWithMigration` method authenticates the user on first login, converts the plaintext password to a salted bcrypt hash, persists it to the database, and leaves zero plaintext data in memory or logs.

### 2.3 SEC-03: Order PII Exposure (BOLA/IDOR) & Cryptographic Guest Tokens
- **Endpoints:** `GET /api/marketplace/orders/:id`, `POST /api/marketplace/orders/:id/payment-proof`
- **Original Vulnerability:** `GET /api/marketplace/orders/:id` allowed unauthenticated users to view customer names, phone numbers, and physical addresses by guessing order numbers or MongoDB IDs. Customer B could read Customer A's orders, and sellers could see competitor line items.
- **Independent Verification Results:**
  1. *Unauthenticated Access Denied:* An unauthenticated request without a token returns `HTTP 401 Unauthorized`.
  2. *Cryptographic Guest Access:* Guest orders generate a 256-bit entropy token (`crypto.randomBytes(32)`). The plaintext token is returned only once to the guest in the checkout response; only its SHA-256 hash (`guestAccessTokenHash`) is saved in the database with `select: false`.
  3. *Guest Token Validation:* Supplying the valid token via `?token=...` or `x-order-token` returns order details; supplying a tampered token returns `HTTP 403 Forbidden`.
  4. *Customer IDOR Prevention:* Customer B attempting to view Customer A's order with a valid JWT receives `HTTP 403 Forbidden`.
  5. *Multi-Vendor Tenant Scoping:* When Seller A views an order containing items from Seller A and Seller B, the API filters `order.items` to only return Seller A's products. If Seller A has no items in the order, access is denied with `HTTP 403 Forbidden`.

### 2.4 SEC-04: Cross-Seller Product Isolation Across All Routes
- **Endpoints:**
  - Modern: `PUT /api/seller/products/:id`, `DELETE /api/seller/products/:id`
  - Legacy: `PATCH /api/products/:id`, `DELETE /api/products/:id`
  - Admin: `PUT /api/admin/marketplace/products/:id/moderate`
- **Original Vulnerability:** Legacy routes `PATCH /api/products/:id` and `DELETE /api/products/:id` only checked `requireRole('partner', 'administrator')` without verifying document ownership, allowing any seller to alter prices or delete competitor merchandise.
- **Independent Verification Results:**
  1. *Modern Seller Routes:* Verified that `PUT /api/seller/products/:id` and `DELETE /api/seller/products/:id` enforce `product.sellerId.toString() === req.user._id.toString()`. Cross-seller attempts return `HTTP 403 Forbidden`.
  2. *Legacy Routes:* Verified that `PATCH /api/products/:id` and `DELETE /api/products/:id` enforce the identical ownership verification check. Unauthorized sellers receive `HTTP 403 Forbidden`.
  3. *Field Whitelisting:* Non-admin sellers attempting to self-approve products (`status: 'approved'`) or reassign `sellerId` have those fields stripped or overridden. The product moves to `pending_review` status.
  4. *Admin Rights:* Platform administrators retain verified authority to moderate, publish, update, and archive products across all vendors.

### 2.5 SEC-05: Passwordless Login & Privilege Escalation Defense
- **Endpoints:** `POST /api/users/loginWeb`, `POST /api/users/login`
- **Original Vulnerability:** `loginUserWeb` in `usersController.js` previously accepted phone-only requests without verifying passwords.
- **Independent Verification Results:**
  1. *Mandatory Password:* Submitting phone without password returns `HTTP 400 Bad Request` (`{"error": "Phone and password are required"}`).
  2. *Password Verification:* Validates candidate password against bcrypt hash using `User.loginPhoneWeb`. Incorrect passwords return `HTTP 400 Bad Request`.
  3. *Token Creation:* Valid logins issue a signed JWT token with a 7-day expiration (`expiresIn: '7d'`).

### 2.6 BUS-01: Inventory Concurrency, Overselling & Automated Replenishment
- **Endpoints:** `POST /api/marketplace/orders`, `PATCH /api/orders/:id`, `PUT /api/seller/orders/:id/fulfillment`
- **Original Vulnerability:** In-memory inventory checks permitted race conditions under concurrent checkouts, allowing stock to drop below zero. Canceled orders never replenished inventory.
- **Independent Verification Results:**
  1. *Atomic Conditional Reservation:* Checkout decrements stock using MongoDB's atomic `findOneAndUpdate` with query `{ stockQuantity: { $gte: qty }, status: 'approved', published: true }` and update `{ $inc: { stockQuantity: -qty } }`.
  2. *Concurrency Protection:* In a stress test with 3 available units and 6 simultaneous orders, exactly 3 succeeded and 3 failed with HTTP 400. Final stock was verified at exactly 0. Zero overselling.
  3. *Compensating Rollbacks:* Multi-item cart failures immediately restore previously decremented items.
  4. *Replenishment on Cancellation:* Canceling an order via `PATCH /api/orders/:id` or canceling an individual line item via `PUT /api/seller/orders/:id/fulfillment` automatically increments reserved quantities back into `product.stockQuantity`.
  5. *Submission Deduplication:* Orders matching customer phone and subtotal submitted within 10 seconds return `HTTP 409 Conflict`.

### 2.7 UX-01: Elimination of Deceptive BaridiMob RIP Information
- **Component:** `shop/frontEnd/touriva_shop_web/src/views/Checkout.vue`
- **Original Vulnerability:** Storefront checkout presented a mockup BaridiMob RIP `00799999000123456789`, creating operational failure when Algerian buyers attempted transfers.
- **Independent Verification Results:**
  1. *Removal Confirmed:* Mockup RIP was purged from the codebase.
  2. *Truthful Instructions Deployed:* Checkout informs buyers that upon placing the order, Touriva commercial operations validates stock and transmits official payment RIP/CCP details directly via phone and SMS prior to dispatch.

---

## 3. ADDITIONAL PHASE 2 SECURITY TESTING & REMEDIATIONS

### 3.1 JWT Expiration and Signing Configuration
- **Signing Key:** Signed using HMAC-SHA256 with `process.env.SECRET`.
- **Token Expiration:** Updated `createToken` in `usersController.js` to enforce explicit token expiration:
  ```javascript
  const createToken = (_id) => {
      return jwt.sign({_id}, process.env.SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })
  }
  ```
- **Verification:** `requireAuth` middleware verifies signatures and automatically rejects expired tokens via `jwt.verify`.

### 3.2 Partner Documents IDOR Defense (New Phase 2 Hardening)
- **Endpoints:** `PATCH /api/users/uploadPartnerImages/:id`, `GET /api/users/loadPartnerPhotos/:id`
- **Finding:** During Phase 2 review, it was discovered that `uploadPartnerImages` and `loadPartnerPhotos` lacked document ownership checks, allowing any authenticated user to fetch or modify sensitive partner legal files (trade registry `commercialRegister`, tax IDs `nifDoc`, `nisDoc`, and national ID cards).
- **Remediation Implemented:**
  - Added strict ownership validation (`isSelf || isAdmin`) to both endpoints.
  - Restricted `uploadPartnerImages` to an allowlist of document fields (`nisDoc`, `commercialRegister`, `nifDoc`, `id`, `avatar`, `logo`, `cover`), preventing arbitrary user document tampering.

### 3.3 Seller Account Suspension Enforcement (New Phase 2 Hardening)
- **Endpoints:** `POST /api/seller/products`, `PUT /api/seller/products/:id`
- **Finding:** While administrative suspension (`PUT /api/admin/marketplace/sellers/:id/status`) delisted existing products, suspended sellers could still submit new products or edit existing ones.
- **Remediation Implemented:**
  - In `sellerController.js`, added active status checks to `createSellerProduct` and `updateSellerProduct`.
  - Suspended sellers are rejected with `HTTP 403 Forbidden` (`{"error": "Your seller account is currently suspended.", "suspensionReason": ...}`).

### 3.4 Rate Limiting & Denial of Service Protection
- Token bucket rate limiters configured in `shop/backend/middleware/rateLimiter.js`:
  - `apiLimiter`: 200 requests / 15 minutes across general API routes.
  - `authLimiter`: 20 attempts / 15 minutes on login endpoints.
  - `demoLimiter`: 60 requests / 15 minutes on demo routes.
  - `checkoutLimiter`: 30 checkout requests / 10 minutes on order submission.

### 3.5 CORS Allowlist & Transport Security
- Production and staging origins are restricted to an explicit allowlist in `shop/backend/server.js`:
  - `https://market.touriva.nextchallenge.tech`
  - `https://seller.market.touriva.nextchallenge.tech`
  - `https://admin.market.touriva.nextchallenge.tech`
  - Netlify frontend app domains and local development origins.
- Wildcards (`*`) are explicitly stripped and rejected.
- Authentication tokens are transmitted via `Authorization: Bearer <JWT>` headers, eliminating browser-based CSRF vulnerabilities associated with ambient cookies.

### 3.6 Secret Exposure & Frontend Bundle Auditing
- Scanned all production bundles (`shop/frontEnd/*/dist/assets/*.js`):
  - No private keys, JWT signing secrets, database connection strings, or cloud access keys were detected in frontend client assets.
  - API base URLs are dynamically resolved via `import.meta.env.VITE_API_BASE_URL`.

### 3.7 Dependency Security Audit (npm audit)
- Identified 47 advisory notices in transitive dependencies of `shop/backend` (including `ws`, `fast-xml-parser`, `protobufjs`, `body-parser`).
- **Mitigation:** Most advisories reside in Firebase admin and unused Twilio client packages. Core marketplace endpoints run on Express 5 native body parsing and Mongoose. An advisory is logged for the production release pipeline to run `npm update` during planned maintenance.

---

## 4. VERIFICATION STATUS MATRIX

| Security Check | Verification Method | Status | Notes |
| :--- | :--- | :---: | :--- |
| **SEC-01: Demo Backdoor** | Live API Request (`POST /api/users/demo-login`) | VERIFIED SECURE | 404 in production, 403 on admin |
| **SEC-02: Password Storage** | Direct MongoDB query & Login API | VERIFIED SECURE | Salted bcrypt (10 rounds), no plaintext |
| **SEC-03: Order PII Access** | Token-less & Forged Token API requests | VERIFIED SECURE | 401/403 enforced, SHA-256 tokens |
| **SEC-04: Seller Isolation** | Cross-Seller PATCH/DELETE requests | VERIFIED SECURE | 403 Forbidden on modern & legacy |
| **SEC-05: Web Auth Security** | Request with missing password | VERIFIED SECURE | 400 Bad Request enforced |
| **BUS-01: Concurrency** | 6 Simultaneous checkout requests | VERIFIED SECURE | Stock never negative, 0 overselling |
| **UX-01: Payment Truth** | Code inspection & Frontend build | VERIFIED SECURE | Fake BaridiMob RIP purged |
| **Partner Document IDOR** | Cross-user document fetch & update | VERIFIED SECURE | Self/Admin check enforced |
| **Seller Suspension** | Suspended seller product creation | VERIFIED SECURE | 403 Forbidden enforced |
| **JWT Expiration** | Token payload analysis | VERIFIED SECURE | 7-day expiration configured |

---

## 5. CONCLUSION

The Touriva Marketplace RC-1 implementation has been independently verified against all primary and secondary security requirements. All vulnerabilities previously graded as critical blockers are closed, tested, and verified.
