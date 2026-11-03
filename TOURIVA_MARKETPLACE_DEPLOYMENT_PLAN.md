# TOURIVA INDEPENDENT MARKETPLACE — PRODUCTION DEPLOYMENT PLAYBOOK

**Platform Owner:** Khaled Bouafia  
**Ecosystem:** Next Challenge (`nextchallenge.tech`)  
**Deployment Tier:** Multi-Subdomain Production Release  
**Status:** Prepared for Owner Execution  

---

## 1. Production Architecture Overview

The deployment plan establishes four dedicated production web services on **Render** paired with custom subdomains on **Hostinger DNS**:

| Component | Target Subdomain | Render Service Name | Service Type | Build Command / Root |
|---|---|---|---|---|
| **Public Storefront** | `market.touriva.nextchallenge.tech` | `touriva-shop-web` | Static Site / Node Web Service | `npm run build` (Root: `shop/frontEnd/touriva_shop_web`) |
| **Seller Portal** | `seller.market.touriva.nextchallenge.tech` | `touriva-shop-seller` | Static Site / Node Web Service | `npm run build` (Root: `shop/frontEnd/touriva_shop_seller_admin`) |
| **Marketplace Admin** | `admin.market.touriva.nextchallenge.tech` | `touriva-shop-admin` | Static Site / Node Web Service | `npm run build` (Root: `shop/frontEnd/touriva_shop_admin`) |
| **Marketplace API** | `api.market.touriva.nextchallenge.tech` | `touriva-shop-api` | Node Web Service | `npm start` (Root: `shop/backend`) |

---

## 2. Strict DNS Safeguards & Hostinger Configuration

> [!IMPORTANT]
> **DNS Safety Requirement:**
> Under no circumstances should existing Hostinger records for `nextchallenge.tech` apex (`@`), `www`, `touriva`, or `api.touriva` be edited or removed.

### DNS Records to Create on Hostinger:

| Type | Name / Host | Target / Points To | TTL | Purpose |
|---|---|---|---|---|
| **CNAME** | `market.touriva` | `touriva-shop-web.onrender.com` | Auto / 3600 | Public Traveler Storefront |
| **CNAME** | `seller.market` | `touriva-shop-seller.onrender.com` | Auto / 3600 | Seller Partner Portal |
| **CNAME** | `admin.market` | `touriva-shop-admin.onrender.com` | Auto / 3600 | Owner Marketplace Administration |
| **CNAME** | `api.market.touriva` | `touriva-shop-api.onrender.com` | Auto / 3600 | Marketplace Core API Engine |

### DNS Records that MUST REMAIN UNTOUCHED:

```
[DO NOT MODIFY]
A     @       75.2.60.5                       (Next Challenge Corporate Site / Netlify)
CNAME www     nextchallenge-tech.netlify.app  (Next Challenge WWW)
CNAME touriva touriva-web.onrender.com        (Touriva Tourism Frontend)
CNAME api.touriva touriva-api.onrender.com    (Touriva Tourism API Backend)
```

---

## 3. Render Web Services Provisioning Guide

### Service 1: `touriva-shop-api` (Backend Engine)
1. In Render Dashboard, click **New +** $\rightarrow$ **Web Service**.
2. Connect the Git repository `touriva`.
3. Configure settings:
   - **Name:** `touriva-shop-api`
   - **Root Directory:** `shop/backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** Starter or Standard
4. Add Environment Variables:
   - `PORT`: `2025` (or default `10000`)
   - `MONGO_URI`: Production MongoDB URI pointing to `touriva_shop` database
   - `JWT_SECRET`: Secure cryptographic token secret
   - `NODE_ENV`: `production`
5. Attach Custom Domain:
   - In Settings $\rightarrow$ Custom Domains, add `api.market.touriva.nextchallenge.tech`.
   - Render automatically provisions a free Let's Encrypt SSL certificate once DNS resolves.

### Service 2: `touriva-shop-web` (Public Storefront)
1. Click **New +** $\rightarrow$ **Static Site** (or Web Service).
2. Configure settings:
   - **Name:** `touriva-shop-web`
   - **Root Directory:** `shop/frontEnd/touriva_shop_web`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
3. Environment Variables:
   - `VITE_API_BASE_URL`: `https://api.market.touriva.nextchallenge.tech`
4. Attach Custom Domain: `market.touriva.nextchallenge.tech`.

### Service 3: `touriva-shop-seller` (Seller Portal)
1. Click **New +** $\rightarrow$ **Static Site**.
2. Configure settings:
   - **Name:** `touriva-shop-seller`
   - **Root Directory:** `shop/frontEnd/touriva_shop_seller_admin`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
3. Environment Variables:
   - `VITE_API_BASE_URL`: `https://api.market.touriva.nextchallenge.tech`
4. Attach Custom Domain: `seller.market.touriva.nextchallenge.tech`.

### Service 4: `touriva-shop-admin` (Owner Administration)
1. Click **New +** $\rightarrow$ **Static Site**.
2. Configure settings:
   - **Name:** `touriva-shop-admin`
   - **Root Directory:** `shop/frontEnd/touriva_shop_admin`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
3. Environment Variables:
   - `VITE_API_BASE_URL`: `https://api.market.touriva.nextchallenge.tech`
4. Attach Custom Domain: `admin.market.touriva.nextchallenge.tech`.

---

## 4. Post-Deployment Verification Checklist

Once DNS propagation completes:
- [ ] Verify `https://api.market.touriva.nextchallenge.tech/api/marketplace/products` returns HTTP 200 with approved catalog.
- [ ] Verify `https://market.touriva.nextchallenge.tech` renders the storefront with modern editorial branding.
- [ ] Perform a test order checkout on the public storefront.
- [ ] Log in to `https://seller.market.touriva.nextchallenge.tech` with `seller1@touriva.test` and verify scoped inventory.
- [ ] Log in to `https://admin.market.touriva.nextchallenge.tech` with `admin@touriva.test` (Khaled Bouafia) and verify moderation and commission queues.
- [ ] Confirm `https://touriva.nextchallenge.tech` and `https://api.touriva.nextchallenge.tech` remain 100% operational with no changes.

---

## 5. Rollback & Contingency Plan

If any DNS or hosting issue arises during deployment:
1. **Immediate Decoupling:** Delete or deactivate the 4 newly created CNAME records on Hostinger. Because the apex and tourism CNAMEs were never touched, the tourism platform experiences zero downtime.
2. **Database Protection:** The marketplace database `touriva_shop` is fully independent. In the event of a critical error, database rollbacks can be executed on `touriva_shop` without affecting `touriva`.

---
*Prepared by Touriva DevOps & Infrastructure Engineering Team.*
