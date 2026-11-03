# TOURIVA INDEPENDENT MARKETPLACE — DEPLOYMENT EXECUTION REPORT

**Execution Date:** November 3, 2026  
**Platform Owner:** Khaled Bouafia  
**Infrastructure Platform:** Render & Hostinger DNS  
**Deployment Status:** STAGED & READY FOR LIVE PROVISIONING  
**Protection Policy:** Zero modification to tourism platform (`touriva-web`, `touriva-api`)  

---

## 1. Production Service Inventory & Specifications

The Touriva Marketplace utilizes four distinct production services on Render. The static site frontends are already registered in the Render workspace; the Node.js backend API is specified for immediate provisioning.

### Production Services Matrix

| Service Name | Render Service ID | Service Type | Root Directory | Build Command | Start / Publish | Production URL | Target Custom Domain |
|---|---|---|---|---|---|---|---|
| **`touriva-shop-web`** | `srv-dbb6sljncjis73dm5240` | Static Site | `shop/frontEnd/touriva_shop_web` | `npm install && npm run build` | `dist` | `https://touriva-shop-web.onrender.com` | `market.touriva.nextchallenge.tech` |
| **`touriva-shop-seller-admin`** | `srv-dbb6ssigjjms73d86ing` | Static Site | `shop/frontEnd/touriva_shop_seller_admin` | `npm install && npm run build` | `dist` | `https://touriva-shop-seller-admin.onrender.com` | `seller.market.touriva.nextchallenge.tech` |
| **`touriva-shop-admin`** | `srv-dbb6som7bikc73d9il40` | Static Site | `shop/frontEnd/touriva_shop_admin` | `npm install && npm run build` | `dist` | `https://touriva-shop-admin.onrender.com` | `admin.market.touriva.nextchallenge.tech` |
| **`touriva-shop-api`** | *Pending Provisioning* | Web Service | `shop/backend` | `npm install` | `node server.js` | *Pending Hostname* | `api.market.touriva.nextchallenge.tech` |

---

## 2. Protected Tourism Services (CONFIRMED FROZEN)

The following production services were forensically inspected and will receive **zero modifications**:

```
[FROZEN TOURISM SERVICES]
1. touriva-web
   - Service ID: srv-dbb3a78m7kps73aspl90
   - Live URL: https://touriva-web.onrender.com
   - Custom Domain: https://touriva.nextchallenge.tech
   - Status: ACTIVE & FROZEN

2. touriva-api
   - Service ID: srv-dbb3a4lg1s2s73e3ll9g
   - Live URL: https://touriva-api.onrender.com
   - Custom Domain: https://api.touriva.nextchallenge.tech
   - Status: ACTIVE & FROZEN (279/279 Tests Passing)
```

---

## 3. Environment Variables Specification

To safeguard secrets, values are managed securely through Render dashboard environment variables. Below is the exact key checklist:

### A. Backend Web Service (`touriva-shop-api`)
```
PORT=10000
NODE_ENV=production
MONGO_URI=mongodb+srv://touriva_app:[SECURE_CREDENTIAL]@cluster0.hzmvepq.mongodb.net/touriva_shop?retryWrites=true&w=majority
SECRET=[SECURE_JWT_SECRET]
CORS_ORIGINS=https://market.touriva.nextchallenge.tech,https://seller.market.touriva.nextchallenge.tech,https://admin.market.touriva.nextchallenge.tech,https://touriva-shop-web.onrender.com,https://touriva-shop-seller-admin.onrender.com,https://touriva-shop-admin.onrender.com
```

### B. Frontend Static Sites (`touriva-shop-web`, `touriva-shop-seller-admin`, `touriva-shop-admin`)
```
VITE_API_BASE_URL=https://api.market.touriva.nextchallenge.tech
VITE_SHOP_API_BASE_URL=https://api.market.touriva.nextchallenge.tech
```

---

## 4. Controlled Execution Steps for Owner Approval

### Step 1: Git Push to Production Branch
Once approved, commit and push all marketplace changes to `origin/master`:
```bash
git add shop/ TOURIVA_MARKETPLACE_*.md
git commit -m "feat(marketplace): independent owner-operated multi-vendor marketplace engine"
git push origin master
```
*Effect:* Render static sites (`touriva-shop-web`, `touriva-shop-seller-admin`, `touriva-shop-admin`) will automatically trigger a clean production build from `master`.

### Step 2: Provisioning `touriva-shop-api` Web Service
In Render Dashboard:
1. Click **New +** $\rightarrow$ **Web Service**.
2. Select GitHub repository: `Bouafia19/touriva`.
3. Fill configuration:
   - **Name:** `touriva-shop-api`
   - **Region:** Frankfurt (EU Central)
   - **Branch:** `master`
   - **Root Directory:** `shop/backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Health Check Path:** `/api/health`
4. Enter Environment Variables as specified in Section 3.
5. Click **Create Web Service**.

### Step 3: Database Seeding on Production Atlas
Execute the non-destructive marketplace seeder targeting `touriva_shop`:
```bash
MONGO_URI="mongodb+srv://touriva_app:****@cluster0.hzmvepq.mongodb.net/touriva_shop?retryWrites=true&w=majority" npm --prefix shop/backend run seed:demo
```
*Effect:* Creates default Wilayas, categories, pilot artisan profiles, and baseline settings in `touriva_shop` with zero impact on `touriva`.

---

## 5. Health Check & Monitoring Verification

| Target Endpoint | Method | Expected HTTP Status | Expected Response Body |
|---|---|---|---|
| `/api/health` | `GET` | `200 OK` | `{"status":"ok","service":"touriva-shop-backend"}` |
| `/api/marketplace/products` | `GET` | `200 OK` | `{"products":[...],"total":...}` |
| `/api/marketplace/settings` | `GET` | `200 OK` | `{"settings":{"defaultCommissionRate":10,...}}` |

---
*Prepared by Touriva DevOps & Infrastructure Automation Team.*
