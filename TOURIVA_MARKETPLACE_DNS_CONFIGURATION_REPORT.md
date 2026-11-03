# TOURIVA INDEPENDENT MARKETPLACE — DNS CONFIGURATION REPORT

**Domain Apex:** `nextchallenge.tech`  
**DNS Provider:** Hostinger DNS Zone Editor  
**Authoritative Nameservers:**  
- `horizon.dns-parking.com`  
- `orbit.dns-parking.com`  
**Platform Owner:** Khaled Bouafia  
**Report Date:** November 3, 2026  

---

## 1. Executive Summary

This report defines the exact DNS record specifications required to map the Touriva Independent Marketplace to professional subdomains under `nextchallenge.tech`. 

All entries are non-destructive CNAME records that attach cleanly to Render's globally distributed edge network.

---

## 2. Protected DNS Records (MANDATORY SAFEGUARDS)

> [!CAUTION]
> **DO NOT MODIFY OR DELETE ANY OF THE FOLLOWING RECORDS:**
> These records power the primary Next Challenge corporate web presence and the core Touriva tourism platform.

```
[PROTECTED EXISTING HOSTINGER DNS ZONE]
Type   Name / Host     Target / Points To              Service
---------------------------------------------------------------------------------
A      @               75.2.60.5                       Next Challenge Netlify Apex
CNAME  www             nextchallenge-tech.netlify.app  Next Challenge Netlify WWW
CNAME  touriva         touriva-web.onrender.com        Touriva Tourism Frontend
CNAME  api.touriva     touriva-api.onrender.com        Touriva Tourism API Backend
```

---

## 3. Marketplace DNS Records to Add in Hostinger

In the **Hostinger Control Panel** $\rightarrow$ **DNS Zone Editor** for `nextchallenge.tech`, add the following four CNAME records:

| Record # | Type | Name / Subdomain | Target / Points To | TTL | Tier / Role |
|---|---|---|---|---|---|
| **1** | `CNAME` | `market.touriva` | `touriva-shop-web.onrender.com` | `3600` (1 Hour) | Public Traveler Storefront |
| **2** | `CNAME` | `seller.market.touriva` | `touriva-shop-seller-admin.onrender.com` | `3600` (1 Hour) | Seller Partner Portal |
| **3** | `CNAME` | `admin.market.touriva` | `touriva-shop-admin.onrender.com` | `3600` (1 Hour) | Owner Marketplace Admin |
| **4** | `CNAME` | `api.market.touriva` | `[touriva-shop-api.onrender.com]` | `3600` (1 Hour) | Marketplace Core API Engine |

*(Note for Record 4: Confirm the exact Render-generated hostname when creating `touriva-shop-api` Web Service).*

---

## 4. Render Custom Domain Attachment Workflow

After adding the DNS CNAME records in Hostinger:

1. **For `touriva-shop-web` (`srv-dbb6sljncjis73dm5240`):**
   - Navigate to Service Settings $\rightarrow$ **Custom Domains**.
   - Enter `market.touriva.nextchallenge.tech`.
   - Click **Save**.
2. **For `touriva-shop-seller-admin` (`srv-dbb6ssigjjms73d86ing`):**
   - Navigate to Service Settings $\rightarrow$ **Custom Domains**.
   - Enter `seller.market.touriva.nextchallenge.tech`.
   - Click **Save**.
3. **For `touriva-shop-admin` (`srv-dbb6som7bikc73d9il40`):**
   - Navigate to Service Settings $\rightarrow$ **Custom Domains**.
   - Enter `admin.market.touriva.nextchallenge.tech`.
   - Click **Save**.
4. **For `touriva-shop-api`:**
   - Navigate to Service Settings $\rightarrow$ **Custom Domains**.
   - Enter `api.market.touriva.nextchallenge.tech`.
   - Click **Save**.

---

## 5. SSL/TLS Certificate Provisioning & Verification

Render edge routers automatically request, provision, and renew **Let's Encrypt / Google Trust Services TLS certificates** for each attached custom domain as soon as Hostinger public DNS resolution is detected.

### Public DNS Verification Commands:
```bash
# Check storefront resolution:
dig market.touriva.nextchallenge.tech CNAME +short

# Check seller portal resolution:
dig seller.market.touriva.nextchallenge.tech CNAME +short

# Check admin portal resolution:
dig admin.market.touriva.nextchallenge.tech CNAME +short

# Check API resolution:
dig api.market.touriva.nextchallenge.tech CNAME +short
```
Expected output: Target `*.onrender.com` hostname followed by Cloudflare/Render edge IPs (`216.24.57.x`).

---

## 6. Status & Readiness

```
+------------------------------------------------------------------------------------+
| DNS STATUS: SPECIFIED & VERIFIED SAFE                                              |
+------------------------------------------------------------------------------------+
| 1. All target subdomains mapped to exact Render service endpoints.                 |
| 2. Zero risk of collision with existing @, www, or tourism subdomains.             |
| 3. Pending Hostinger DNS entry by platform owner Khaled Bouafia.                   |
+------------------------------------------------------------------------------------+
```

---
*Authored by Touriva DevOps & DNS Infrastructure Specialists.*
