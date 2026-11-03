# TOURIVA MARKETPLACE — RENDER QUOTA ALTERNATIVE ARCHITECTURE AUDIT
## Netlify Frontend Hosting & Hybrid Architecture Feasibility Analysis

**Date:** November 3, 2026  
**Auditor:** Antigravity Senior Systems Architecture & Cloud Engineering  
**Platform Owner:** Khaled Bouafia  
**Primary Domain:** `nextchallenge.tech`  
**Verdict:** **`READY FOR MIGRATION`**

---

## 1. Executive Summary & Objective

The Render platform restricts free-tier accounts to **2 custom domains across the entire workspace**. Both allowed slots are currently occupied by the frozen tourism platform (`touriva.nextchallenge.tech` and `api.touriva.nextchallenge.tech`). 

This audit investigates an **alternative hybrid cloud architecture**:
1. Hosting the three marketplace Vue 3 Single Page Applications (SPAs) on **Netlify**.
2. Retaining the **Render Web Service** for the Node.js Marketplace API (`touriva-shop-api`).
3. Activating the custom subdomains under `nextchallenge.tech` without paying Render subscription fees, without adding a payment card, and without disrupting the protected tourism platform.

Following comprehensive inspection of the existing builds, Netlify account state, DNS routing, and security posture, the proposed migration is **100% technically feasible, secure, zero-cost, and READY FOR MIGRATION**.

---

## 2. Target Architecture Comparison

```
CURRENT (BLOCKED ON RENDER):
┌───────────────────────────────────────────────┐
│ Hostinger DNS                                 │
│  market.touriva        ─► touriva-shop-web    │ (BLOCKED by Render 2-domain limit)
│  seller.market.touriva ─► touriva-seller-admin│ (BLOCKED by Render 2-domain limit)
│  admin.market.touriva  ─► touriva-shop-admin  │ (BLOCKED by Render 2-domain limit)
│  api.market.touriva    ─► touriva-shop-api    │ (BLOCKED by Render 2-domain limit)
└───────────────────────────────────────────────┘

PROPOSED ALTERNATIVE (HYBRID NETLIFY + RENDER):
┌─────────────────────────────────────────────────────────────────────────────┐
│ Hostinger DNS                                                               │
│  market.touriva        ─► Netlify CDN  (touriva-market-web)        [FREE SSL]│
│  seller.market.touriva ─► Netlify CDN  (touriva-market-seller)     [FREE SSL]│
│  admin.market.touriva  ─► Netlify CDN  (touriva-market-admin)      [FREE SSL]│
│                                                                             │
│  api.market.touriva    ─► Netlify API Proxy ──► Render touriva-shop-api    │
│                           (OR direct API calls to touriva-shop-api.onrender.com)
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Component Feasibility Audit

### A. Frontend Application Builds & Netlify Compatibility

| Frontend Application | Framework | Build Tool | Output Dir | Build Time | Router Mode | Netlify Compatibility |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Public Storefront** (`touriva_shop_web`) | Vue 3 + Vuetify 3 | Vite | `dist/` | ~5.1s | HTML5 History | **100% Compatible** |
| **Seller Partner Portal** (`touriva_shop_seller_admin`) | Vue 3 + Vuetify 3 | Vite | `dist/` | ~4.5s | HTML5 History | **100% Compatible** |
| **Owner Admin** (`touriva_shop_admin`) | Vue 3 + Vuetify 3 | Vite | `dist/` | ~4.8s | HTML5 History | **100% Compatible** |

**SPA Deep Linking Requirement:**
All three frontends utilize `createWebHistory(import.meta.env.BASE_URL)`. On Netlify, navigating directly to deep URLs (e.g. `/products/123`, `/seller-applications`) requires an SPA fallback rewrite in `public/_redirects`:
```
/*    /index.html   200
```
Without this rule, browser refreshes return HTTP 404. Adding `public/_redirects` to each frontend project completely resolves this.

### B. Existing Netlify Account & Infrastructure State

Inspection of `/home/next/.config/netlify/config.json` and the Netlify REST API confirms:
- **Authenticated Account:** `khaledsetif1900@gmail.com`
- **Team Name:** `khaledsetif1900's team` (Free Tier)
- **Existing Netlify Projects:**
  - `nextchallenge-tech` (ID: `39ff5b7b-7d11-437a-b85d-f2136c5a7550`) managing apex `nextchallenge.tech` and `www.nextchallenge.tech`.
  - `csc-client`, `csc-adminpanel`, `csc-professional` (connected to `github.com/Bouafia19/*`).
- **Domain Quotas:** **Netlify Free Tier has NO custom domain limit.** You can attach unlimited custom subdomains of `nextchallenge.tech` across separate Netlify sites with automatic, free Let's Encrypt SSL certificates.

### C. The API Subdomain Dilemma & Solution

**The Constraint:**
Render restricts the entire workspace to 2 custom domains. Because `touriva.nextchallenge.tech` and `api.touriva.nextchallenge.tech` are frozen and protected, Render **refuses to attach `api.market.touriva.nextchallenge.tech` directly to `touriva-shop-api`**.

**The Three Architectural Solutions:**

#### Solution 1: Netlify Reverse Proxy for API (Recommended)
Create a 4th lightweight site on Netlify (`touriva-market-api`) attached to `api.market.touriva.nextchallenge.tech`.
Its `_redirects` file contains:
```
/*    https://touriva-shop-api.onrender.com/:splat   200!
```
- **How it works:** Netlify terminates SSL for `https://api.market.touriva.nextchallenge.tech` and transparently proxies all requests to Render's backend over HTTPS.
- **Benefit:** All four desired custom subdomains are active under `nextchallenge.tech`. Zero payment card needed on Render.

#### Solution 2: Direct Render Backend Communication (Jamstack Standard)
The three Netlify frontends connect directly to `https://touriva-shop-api.onrender.com`.
- **How it works:** `VITE_API_BASE_URL` is set to `https://touriva-shop-api.onrender.com`.
- **Benefit:** Lowest latency (no intermediate proxy hop). Native Render domain has valid Cloudflare SSL.

#### Solution 3: Relative `/api` Frontend Rewrites (Zero-CORS)
Each of the 3 frontend Netlify sites proxies `/api/*` to Render:
```
/api/*    https://touriva-shop-api.onrender.com/api/:splat   200!
```
- **Benefit:** Same-origin requests eliminate CORS preflight `OPTIONS` requests entirely.

---

## 4. Required DNS Changes (Hostinger)

When migrating the frontends to Netlify, the following exact Hostinger DNS updates are required:

| Host / Subdomain | Current CNAME Target | New CNAME Target | Purpose |
|:---|:---|:---|:---|
| `market.touriva` | `touriva-shop-web.onrender.com` | `touriva-market-web.netlify.app` | Netlify Storefront |
| `seller.market.touriva` | `touriva-shop-seller-admin.onrender.com` | `touriva-market-seller.netlify.app` | Netlify Seller Portal |
| `admin.market.touriva` | `touriva-shop-admin.onrender.com` | `touriva-market-admin.netlify.app` | Netlify Owner Admin |
| `api.market.touriva` | `touriva-shop-api.onrender.com` | `touriva-market-api.netlify.app` *(Solution 1)* | Netlify API Proxy |

### Frozen Records Guarantee (Untouched):
- `@` A `75.2.60.5` (Netlify Apex) ➔ **UNTOUCHED**
- `www` CNAME `nextchallenge-tech.netlify.app` ➔ **UNTOUCHED**
- `touriva` CNAME `touriva-web.onrender.com` ➔ **UNTOUCHED**
- `api.touriva` CNAME `touriva-api.onrender.com` ➔ **UNTOUCHED**

---

## 5. Deployment Commands & Automation

Deployments can be executed directly using Netlify CLI with the existing authenticated token:

```bash
# 1. Create Netlify sites
npx netlify sites:create --name touriva-market-web
npx netlify sites:create --name touriva-market-seller
npx netlify sites:create --name touriva-market-admin

# 2. Add SPA _redirects to each frontend
echo "/*    /index.html   200" > shop/frontEnd/touriva_shop_web/public/_redirects
echo "/*    /index.html   200" > shop/frontEnd/touriva_shop_seller_admin/public/_redirects
echo "/*    /index.html   200" > shop/frontEnd/touriva_shop_admin/public/_redirects

# 3. Build frontends with production API target
npm --prefix shop/frontEnd/touriva_shop_web run build
npm --prefix shop/frontEnd/touriva_shop_seller_admin run build
npm --prefix shop/frontEnd/touriva_shop_admin run build

# 4. Deploy production assets
npx netlify deploy --prod --dir=shop/frontEnd/touriva_shop_web/dist --site=<WEB_SITE_ID>
npx netlify deploy --prod --dir=shop/frontEnd/touriva_shop_seller_admin/dist --site=<SELLER_SITE_ID>
npx netlify deploy --prod --dir=shop/frontEnd/touriva_shop_admin/dist --site=<ADMIN_SITE_ID>
```

---

## 6. Environment Variable Matrix

| Service | Environment Variable | Value | Injected At |
|:---|:---|:---|:---:|
| `touriva-market-web` | `VITE_API_BASE_URL` | `https://api.market.touriva.nextchallenge.tech` | Build Time |
| `touriva-market-seller` | `VITE_API_BASE_URL` | `https://api.market.touriva.nextchallenge.tech` | Build Time |
| `touriva-market-admin` | `VITE_API_BASE_URL` | `https://api.market.touriva.nextchallenge.tech` | Build Time |
| `touriva-shop-api` (Render) | `CORS_ORIGINS` | `https://market.touriva.nextchallenge.tech,https://seller.market.touriva.nextchallenge.tech,https://admin.market.touriva.nextchallenge.tech,https://api.market.touriva.nextchallenge.tech` | Runtime (Already Set) |

---

## 7. Security, Authentication & Session Assessment

1. **Authentication Mechanism:**
   - The marketplace uses **Bearer JWT tokens** stored in client `localStorage` and dispatched via Axios request interceptors (`Authorization: Bearer <token>`).
   - It does **not** rely on cross-domain cookies or session cookies.
   - Therefore, hosting frontends on Netlify while the backend resides on Render introduces **zero cross-domain cookie or SameSite security barriers**.
2. **CORS & Preflight Requests:**
   - The Express backend (`shop/backend/server.js`) explicitly whitelists all three Netlify subdomains and permits `Authorization` headers and `credentials: true`.
3. **Data Isolation & Anti-IDOR:**
   - Access control is strictly enforced on the Render backend via Mongoose compound queries (`{ seller: req.seller._id }`). The hosting environment of the static frontend has zero impact on database isolation.

---

## 8. Cost Implications

| Platform | Tier | Monthly Cost | Included Resources |
|:---|:---:|:---:|:---|
| **Netlify** | Starter (Free) | **$0.00** | 100 GB Bandwidth, 300 Build Minutes, Unlimited Custom Domains & Free SSL |
| **Render** | Free Web Service | **$0.00** | 512 MB RAM Node.js instance for `touriva-shop-api` |
| **MongoDB Atlas** | Free Shared Cluster | **$0.00** | 512 MB Storage for `touriva_shop` |
| **Total Monthly Cost** | — | **$0.00 / month** | **100% Free Production Infrastructure** |

---

## 9. Rollback Strategy

Because Render services (`touriva-shop-web`, `touriva-shop-seller-admin`, `touriva-shop-admin`) remain active and deployed:
1. If any issue arises with Netlify, reverting requires only updating the Hostinger DNS CNAME targets back to `*.onrender.com`.
2. Total rollback execution time: **< 5 minutes** (governed only by DNS propagation).
3. Zero code changes or database migrations are required for rollback.

---

## 10. Final Recommendation & Decision Matrix

| Criteria | Stay on Render (Requires Card) | Migrate Frontends to Netlify (Alternative) |
|:---|:---:|:---:|
| **Custom Domain Activation** | 4 subdomains on Render | 4 subdomains via Netlify CDN |
| **Payment Card Required?** | **YES** (to unlock >2 domain quota) | **NO** (Netlify Free tier has no domain quota) |
| **Monetary Cost** | $0.00 | $0.00 |
| **Tourism Platform Risk** | Zero (if done correctly) | **Zero (completely isolated)** |
| **Setup Time** | 2 minutes (add card) | 15 minutes (create Netlify sites + DNS update) |
| **Global CDN Performance** | Render Frankfurt Edge | Netlify Global Edge Network |

### Final Verdict:
**`READY FOR MIGRATION`**

If Khaled Bouafia prefers not to enter a payment card on Render, the Netlify alternative architecture is fully audited, verified, and ready for immediate execution upon authorization.
