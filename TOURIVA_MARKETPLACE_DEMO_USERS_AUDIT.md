# TOURIVA INDEPENDENT MARKETPLACE — PRODUCTION DEMO USERS AUDIT

> **Platform:** Touriva Independent Multi-Vendor Marketplace  
> **Environment:** Production (MongoDB Atlas, Render API, Netlify Frontends)  
> **Date:** November 5, 2026  
> **Lead Security & Reliability Engineer:** Antigravity / Production Assurance  
> **Executive Status:** Comprehensive Audit Completed & Documented

---

## 1. EXECUTIVE SUMMARY

An end-to-end production audit was conducted on the authentication mechanisms, database records, and persona isolation for the **Touriva Independent Multi-Vendor Marketplace**. The audit examined the production database (`touriva_shop`), production backend API (`https://touriva-shop-api.onrender.com`), and all three production frontends:
1. **Customer Storefront:** `https://market.touriva.nextchallenge.tech`
2. **Seller Partner Portal:** `https://seller.market.touriva.nextchallenge.tech`
3. **Owner Admin Portal:** `https://admin.market.touriva.nextchallenge.tech`

### Key Findings
1. **Broken 1-Click Demo Buttons in Production:** During the P0 security remediation phase, the unauthenticated demo endpoint (`POST /api/users/demo-login`) was rightly restricted in production (`NODE_ENV=production` returns HTTP 404). However, the frontends were still hardcoded to invoke this endpoint when demo quick-login buttons were clicked. This produced instant 404 failures in production.
2. **Seller Referential Integrity Mismatch:** 33 seeded marketplace products and 13 order items had their `sellerId` attribute mapped to `SellerProfile._id` instead of the seller's `User._id`. When sellers authenticated and queried `/api/seller/dashboard` or `/api/seller/products`, the backend filtered by `req.user._id`, resulting in 0 visible products, 0 orders, and empty dashboards.
3. **Legacy Account Fragmentation:** The legacy buyer persona `traveler2@touriva.test` existed in the main Touriva tourism database, whereas the marketplace database seeded `buyer2@touriva.test` for the same user. Neither was unified, causing demo confusion.
4. **CORS Preflight Header Block:** The backend CORS configuration omitted `Cache-Control`, `Pragma`, and `Expires` from `allowedHeaders`. Browsers issuing preflight requests with standard HTTP cache headers were blocked with CORS policy errors.
5. **Strict Security Verification:** All demo passwords in the database were confirmed to be valid salted bcrypt hashes (`$2b$10$`). No plaintext passwords or unauthenticated backdoors existed.

---

## 2. PRODUCTION DATABASE AUDIT & USER REGISTER

Before inspecting database records, a full cold backup was dumped to `/home/next/next projects/touriva/audit/database_backups/touriva_shop_2026-11-05T17-38-49-329Z/touriva_shop` covering all 25 collections.

### 2.1 Demo User Account Register

| User Identifier | Email | Phone | DB Role | Status | Bcrypt Hash Status | isDemo | Seed ID |
|---|---|---|---|---|---|---|---|
| Lynda Meziani | `customer@touriva.test` | `+213550000010` | `client` | Active (`true`) | Verified (`$2b$10$`) | `true` | `LEGACY_DEMO_REPAIRED` |
| Mehdi Larbi | `traveler2@touriva.test` | `+213550000012` | `client` | Active (`true`) | Verified (`$2b$10$`) | `true` | `LEGACY_DEMO_REPAIRED` |
| Rachid Khellaf (Legacy) | `buyer2@touriva.test` | `+213550000012` | `client` | Active (`true`) | Verified (`$2b$10$`) | `true` | `LEGACY_DEMO_REPAIRED` |
| Yasmine Benali | `demo.buyer1@touriva.example` | `+213550000001` | `client` | Active (`true`) | Verified (`$2b$10$`) | `true` | `TOURIVA-DEMO-2026` |
| Rachid Khellaf | `demo.buyer2@touriva.example` | `+213550000002` | `client` | Active (`true`) | Verified (`$2b$10$`) | `true` | `TOURIVA-DEMO-2026` |
| Amina Bouzid | `demo.buyer3@touriva.example` | `+213550000003` | `client` | Active (`true`) | Verified (`$2b$10$`) | `true` | `TOURIVA-DEMO-2026` |
| Sofiane Zerrouki | `demo.buyer4@touriva.example` | `+213550000004` | `client` | Active (`true`) | Verified (`$2b$10$`) | `true` | `TOURIVA-DEMO-2026` |
| Nour El Houda Belkacem | `demo.buyer5@touriva.example` | `+213550000005` | `client` | Active (`true`) | Verified (`$2b$10$`) | `true` | `TOURIVA-DEMO-2026` |
| Karim Menouar (Atlas) | `demo.seller1@touriva.example` | `+213550000021` | `seller` | Active (`true`) | Verified (`$2b$10$`) | `true` | `TOURIVA-DEMO-2026` |
| Fatima Mansouri (Artisan) | `demo.seller2@touriva.example` | `+213550000022` | `seller` | Active (`true`) | Verified (`$2b$10$`) | `true` | `TOURIVA-DEMO-2026` |
| Bilal Saadi (El Bahdja) | `demo.seller3@touriva.example` | `+213550000023` | `seller` | Active (`true`) | Verified (`$2b$10$`) | `true` | `TOURIVA-DEMO-2026` |
| Tariq Belkheir (Sahara) | `demo.seller4@touriva.example` | `+213550000024` | `seller` | Active (`true`) | Verified (`$2b$10$`) | `true` | `TOURIVA-DEMO-2026` |
| Sahara Expedition Outfitters | `seller1@touriva.test` | `+213550000001` | `seller` | Active (`true`) | Verified (`$2b$10$`) | `true` | `LEGACY_DEMO_REPAIRED` |
| Atlas Craftworks DZ | `seller2@touriva.test` | `+213550000002` | `seller` | Active (`true`) | Verified (`$2b$10$`) | `true` | `LEGACY_DEMO_REPAIRED` |
| Touriva Artisan Collective | `seller3@touriva.test` | `+213550000003` | `seller` | Active (`true`) | Verified (`$2b$10$`) | `true` | `LEGACY_DEMO_REPAIRED` |
| Platform Admin (Demo) | `demo.admin@touriva.example` | `+213550999000` | `administrator` | Active (`true`) | Verified (`$2b$10$`) | `true` | `TOURIVA-DEMO-2026` |
| Super Admin (Legacy) | `admin@touriva.test` | `+213550000000` | `administrator` | Active (`true`) | Verified (`$2b$10$`) | `true` | `LEGACY_DEMO_REPAIRED` |

---

## 3. IDENTIFIED DEFECTS & ROOT CAUSES

### Defect 1: Demo Login API Disablement Collision (UX-01)
- **Severity:** High (Functional blocker)
- **Root Cause:** In RC-1 P0 remediation, `POST /api/users/demo-login` was blocked in production with `NODE_ENV=production -> 404` to eliminate passwordless privilege escalation (SEC-01 & SEC-05). The frontend UI buttons in Storefront, Seller Admin, and Admin still called `auth.demoSignIn` invoking this disabled endpoint.
- **Impact:** Reviewers clicking "1-Click Demo Access" received HTTP 404 errors.

### Defect 2: Seller Catalog Invisibility (IDOR / Foreign Key Inversion)
- **Severity:** High (Functional blocker)
- **Root Cause:** Legacy seed scripts populated `product.sellerId` with `SellerProfile._id` instead of `User._id`. When the hardened `sellerController.js` verified ownership via `sellerId: req.user._id`, queries returned empty sets.
- **Impact:** Real and demo sellers logging into `seller.market.touriva.nextchallenge.tech` saw 0 products and empty metrics despite 33 active catalog items in the database.

### Defect 3: CORS Preflight Rejection of Cache Headers
- **Severity:** Medium (Browser interop failure)
- **Root Cause:** `shop/backend/server.js` cors middleware allowed only `['Content-Type', 'Authorization', 'X-Requested-With']`. Legacy frontend Axios requests sent `Cache-Control: no-cache, Pragma: no-cache, Expires: 0`. Modern Chromium browsers rejected the preflight `OPTIONS` request.
- **Impact:** Storefront login occasionally blocked in Chrome/Chromium.

### Defect 4: Rate Limiter Threshold Sensitivity
- **Severity:** Medium (Operational annoyance)
- **Root Cause:** `authLimiter` was capped at 20 requests per 15 minutes. An automated audit or reviewer switching between customer, seller, and admin accounts quickly hit HTTP 429 Too Many Requests.
- **Impact:** Demo access blocked after multiple rapid logins.

---

## 4. AUDIT CONCLUSION

All demo accounts exist, are correctly activated, and use strong salted bcrypt hashes. However, operational and routing flaws prevented smooth end-to-end demo execution. Remediation was immediately initiated to restore full functionality without weakening any security control.
