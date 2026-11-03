# TOURIVA INDEPENDENT MARKETPLACE — PRODUCTION ROLLBACK & CONTINGENCY PROTOCOL

**Classification:** Critical Disaster Recovery & Contingency Plan  
**Target:** Touriva Independent Multi-Vendor Marketplace  
**Platform Owner:** Khaled Bouafia  
**Ecosystem:** Next Challenge (`nextchallenge.tech`)  
**Version:** 1.0.0 (November 2026)  

---

## 1. Executive Summary & Non-Interference Guarantee

The primary architectural guarantee of the Touriva Marketplace deployment is **complete infrastructural independence** from the core Touriva tourism platform. 

In the event of an unexpected outage, hosting defect, or application error in the marketplace, rollback procedures can be executed with **zero impact** on the existing Next Challenge corporate website, Touriva travel agency portals, or tourist booking engines.

---

## 2. Decoupling & Isolation Architecture

```
+----------------------------------------------------------------------------------------------------+
|                                      NEXT CHALLENGE ECOSYSTEM                                      |
+----------------------------------------------------------------------------------------------------+
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
+----------------------------------+                             +-----------------------------------+
|    PRIMARY TOURISM PLATFORM      |                             |   TOUIRVA INDEPENDENT MARKETPLACE |
|    (STRICTLY PROTECTED & FROZEN) |                             |     (INDEPENDENT DECOUPLING)      |
+----------------------------------+                             +-----------------------------------+
| Hostinger: touriva / api.touriva |                             | Hostinger: market / seller.market |
| Render: touriva-web / touriva-api|                             | Render: touriva-shop-web / api... |
| Database: MongoDB 'touriva'      |                             | Database: MongoDB 'touriva_shop'  |
+----------------------------------+                             +-----------------------------------+
                 │                                                                 │
                 ▼                                                                 ▼
      IMMUNE TO MARKETPLACE                                              CAN BE ROLLED BACK OR
           OPERATIONS                                                    DECOUPLED IN 60 SECONDS
```

---

## 3. Rollback Scenarios & Trigger Conditions

A rollback may be initiated under any of the following operational triggers:
1. **Critical DNS Failure:** Newly created CNAME records conflict with existing DNS configurations.
2. **Build / Runtime Failure on Render:** Frontend or backend services fail to initialize after deployment.
3. **Database Connectivity Outage:** Inability to communicate with the `touriva_shop` MongoDB namespace.
4. **Security Anomaly:** Unauthorized access detected on marketplace administrative routes.

---

## 4. Step-by-Step Rollback Procedures

### Scenario A: Immediate DNS Decoupling (Instant Traffic Cutoff)
**Execution Time:** < 2 minutes  
**Impact:** Directs public traffic away from marketplace services without affecting tourism.

1. Log in to **Hostinger** $\rightarrow$ **DNS Zone Editor** for `nextchallenge.tech`.
2. Locate the four marketplace CNAME records:
   - `market.touriva`
   - `seller.market.touriva`
   - `admin.market.touriva`
   - `api.market.touriva`
3. Click **Delete** on each of these four records.
4. **DO NOT TOUCH:**
   - `@` (A record: `75.2.60.5`)
   - `www` (CNAME: `nextchallenge-tech.netlify.app`)
   - `touriva` (CNAME: `touriva-web.onrender.com`)
   - `api.touriva` (CNAME: `touriva-api.onrender.com`)
5. Public marketplace traffic terminates immediately; tourism operations continue seamlessly.

---

### Scenario B: Render Web Services Rollback & Suspension
**Execution Time:** < 3 minutes  
**Impact:** Freezes Render compute resources and restores previous baseline.

1. In Render Dashboard, select `touriva-shop-web` (`srv-dbb6sljncjis73dm5240`):
   - Navigate to **Deploys**.
   - Click the previous stable commit/build and select **Rollback to this deploy**.
2. Repeat for `touriva-shop-seller-admin` (`srv-dbb6ssigjjms73d86ing`) and `touriva-shop-admin` (`srv-dbb6som7bikc73d9il40`).
3. If `touriva-shop-api` experiences an unrecoverable exception:
   - In Settings, click **Suspend Service**.
   - This immediately halts Node.js execution and frees memory resources.

---

### Scenario C: Database Restoration (`touriva_shop`)
**Execution Time:** < 5 minutes  
**Impact:** Restores marketplace database to a clean, verified state.

Because the marketplace operates in a dedicated database (`touriva_shop`), database rollbacks cannot touch tourism data:
1. To restore seed baseline without affecting tourism:
   ```bash
   MONGO_URI="mongodb+srv://touriva_app:****@cluster0.hzmvepq.mongodb.net/touriva_shop?retryWrites=true&w=majority" npm --prefix shop/backend run seed:demo
   ```
2. The script drops and repopulates only marketplace collections (`sellerprofiles`, `sellerapplications`, `products`, `orders`, `orderitems`, `commissions`).
3. Database `touriva` remains 100% untouched throughout.

---

### Scenario D: Git Codebase Reversion
If code reversion is required:
```bash
# Revert to last certified tourism release commit
git checkout master
git revert HEAD --no-edit
git push origin master
```

---

## 5. Post-Rollback Verification Checklist

Following any rollback execution, verify:
- [ ] `https://touriva.nextchallenge.tech` loads the tourism landing page and agency portal without error.
- [ ] `https://api.touriva.nextchallenge.tech/api/health` returns `{"status":"healthy","service":"touriva-api"}`.
- [ ] `https://nextchallenge.tech` renders the corporate Netlify website without error.
- [ ] MongoDB Atlas cluster shows normal CPU and connection metrics on database `touriva`.

---

## 6. Emergency Contacts & Responsibility

| Role | Contact / Authority | Responsibility |
|---|---|---|
| **Platform Owner** | **Khaled Bouafia** | Sole authority for rollback authorization and commercial decisions |
| **DevOps & Architecture** | Senior DevOps Engineer | DNS modifications, Render service controls, Git reversions |
| **Database Administrator** | MongoDB Atlas Lead | Cluster monitoring, snapshot restorations, connection pools |

---
*Maintained by Touriva Core Infrastructure & Reliability Engineering.*
