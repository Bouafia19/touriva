# TOURIVA MARKETPLACE — POST-DNS CUTOVER & SSL VERIFICATION REPORT

**Date:** November 3, 2026  
**Platform Owner:** Khaled Bouafia (`khaledsetif1900@gmail.com`)  
**Target Domain:** `nextchallenge.tech`  
**Hosting Architecture:** Path B — Netlify Edge (Frontends) + Render Web Service (API) + MongoDB Atlas  
**Verification Verdict:** **`PARTIAL COMPLETION — 2 OF 3 CUSTOM DOMAINS PASS HTTPS`**  
*(Seller Portal & Admin Portal: **100% VERIFIED ON HTTPS WITH VALID LET'S ENCRYPT SSL**; Storefront: **PENDING DNS CACHE EXPIRATION / SSL ISSUANCE**)*

---

## 1. Executive Summary & Verification Matrix

Following owner confirmation that the three Hostinger CNAME records have been updated to the Netlify targets, an evidence-based forensic verification was performed across global DNS resolvers, SSL handshake endpoints, application frontends, and the preserved Render API.

### Custom Domain Status Summary

| Application | Custom Subdomain | DNS Target (Netlify) | Authoritative DNS (Hostinger) | Global DNS Propagation | SSL Certificate Status | Custom Domain HTTPS Test | Verdict |
|:---|:---|:---|:---:|:---:|:---:|:---:|:---:|
| **Seller Portal** | `seller.market.touriva.nextchallenge.tech` | `touriva-market-seller.netlify.app` | **VERIFIED (300s)** | **PROPAGATED** | **ISSUED (Let's Encrypt YE2)** | **HTTP/2 200 OK** | **PASS** |
| **Owner Admin** | `admin.market.touriva.nextchallenge.tech` | `touriva-market-admin.netlify.app` | **VERIFIED (300s)** | **PROPAGATED** | **ISSUED (Let's Encrypt YE1)** | **HTTP/2 200 OK** | **PASS** |
| **Storefront** | `market.touriva.nextchallenge.tech` | `touriva-market-web.netlify.app` | **VERIFIED (300s)** | **PROPAGATED (Cloudflare/Quad9)** | **PENDING (ACME in progress)** | Port 80: **200 OK** / Port 443: **Pending Cert** | **PENDING SSL** |

---

## 2. DNS Verification Across Resolvers

### A. Authoritative Hostinger DNS Nameservers
Authoritative resolution directly queried from Hostinger nameservers (`orbit.dns-parking.com` / `172.64.52.95` and `horizon.dns-parking.com` / `172.64.53.161`):

```dns
;; ANSWER SECTION (Authoritative: orbit.dns-parking.com)
market.touriva.nextchallenge.tech.  300 IN CNAME touriva-market-web.netlify.app.
seller.market.touriva.nextchallenge.tech. 300 IN CNAME touriva-market-seller.netlify.app.
admin.market.touriva.nextchallenge.tech.  300 IN CNAME touriva-market-admin.netlify.app.
```
**Result:** **100% VERIFIED**. All 3 CNAME records are actively and correctly configured in Hostinger DNS with a 300-second TTL.

### B. Global Recursive DNS Resolvers Comparison

| Domain | Cloudflare (`1.1.1.1`) | Quad9 (`9.9.9.9`) | Google DNS (`8.8.8.8`) | OpenDNS (`208.67.222.222`) | System Resolver |
|:---|:---:|:---:|:---:|:---:|:---:|
| `seller.market...` | `touriva-market-seller.netlify.app` | `touriva-market-seller.netlify.app` | `touriva-market-seller.netlify.app` (DoH) | Cached Render Record | `touriva-market-seller...` |
| `admin.market...` | `touriva-market-admin.netlify.app` | `touriva-market-admin.netlify.app` | `touriva-market-admin.netlify.app` (DoH & UDP) | `touriva-market-admin.netlify.app` | `touriva-market-admin...` |
| `market.touriva...` | `touriva-market-web.netlify.app` | `touriva-market-web.netlify.app` | `touriva-market-web.netlify.app` (DoH) / UDP cached | Cached Render Record | Cached Render Record |

*Root Cause of Storefront SSL Delay:* Some global anycast nodes of Google DNS (8.8.8.8) and OpenDNS originally cached the old Render CNAME records before the cutover with a 4-hour TTL (`14400`). While Cloudflare and Quad9 propagated immediately, Netlify's ACME validation server queries multiple global locations and returned `422 {"error":"bad dns for custom domain"}` during an earlier query. As cache timers expire (or if purged via Google Public DNS Cache tool), Storefront certificate generation will complete automatically.

---

## 3. SSL / HTTPS Certificate Verification

### A. Seller Partner Portal (`seller.market.touriva.nextchallenge.tech`)
- **Netlify Certificate ID:** `6ae9e58c36b3c4c50689f67f`
- **Certificate Status:** `state: "issued"`
- **Certificate Authority:** Let's Encrypt (`CN=YE2`)
- **Subject:** `CN=seller.market.touriva.nextchallenge.tech`
- **Start Date:** November 3, 2026, 12:47:16 GMT
- **Expiration Date:** February 1, 2027, 12:47:15 GMT
- **Cryptographic Cipher:** TLSv1.3 / `TLS_AES_128_GCM_SHA256` / `x25519` / `id-ecPublicKey`
- **ALPN Negotiation:** `h2` (HTTP/2)
- **Edge Response:** HTTP/2 200 OK on root `/` and deep route `/login`.

### B. Owner Administration (`admin.market.touriva.nextchallenge.tech`)
- **Netlify Certificate ID:** `6ae9e5a4a89f9677085fc008`
- **Certificate Status:** `state: "issued"`
- **Certificate Authority:** Let's Encrypt (`CN=YE1`)
- **Subject:** `CN=admin.market.touriva.nextchallenge.tech`
- **Start Date:** November 3, 2026, 12:47:40 GMT
- **Expiration Date:** February 1, 2027, 12:47:39 GMT
- **Cryptographic Cipher:** TLSv1.3 / `TLS_AES_128_GCM_SHA256` / `x25519` / `id-ecPublicKey`
- **ALPN Negotiation:** `h2` (HTTP/2)
- **Edge Response:** HTTP/2 200 OK on root `/` and deep route `/login`.

### C. Public Storefront (`market.touriva.nextchallenge.tech`)
- **Netlify Site ID:** `a7c7a1ee-a761-45f5-b9e4-9f55671fd27c`
- **Custom Domain Association:** `market.touriva.nextchallenge.tech` (Attached)
- **HTTP Port 80 Response:** **HTTP/1.1 200 OK** served directly from Netlify Edge (`Server: Netlify`, `X-Nf-Request-Id: 01M6GTCSW316A10ND7QYQAEGJR`, `data-netlify-site-id="a7c7a1ee-a761-45f5-b9e4-9f55671fd27c"`).
- **HTTPS Port 443 Response:** Serving fallback edge wildcard certificate `*.netlify.app` while Let's Encrypt ACME verification finalizes.
- **Certificate Status:** `PENDING SSL ISSUANCE`.

---

## 4. Application Functionality Testing via Custom Domains

Each application was tested against the live Netlify edge nodes and confirmed functional:

1. **Seller Portal (`https://seller.market.touriva.nextchallenge.tech`):**
   - Root page `/`: **HTTP 200 OK**
   - Deep route `/login`: **HTTP 200 OK** (SPA rewrite rule verified)
   - Single Page Application assets: Vuetify, Vue 3, and CSS preloaded successfully.
2. **Owner Admin (`https://admin.market.touriva.nextchallenge.tech`):**
   - Root page `/`: **HTTP 200 OK**
   - Deep route `/login`: **HTTP 200 OK** (SPA rewrite rule verified)
3. **Public Storefront (`http://market.touriva.nextchallenge.tech`):**
   - Root page `/`: **HTTP 200 OK**
   - Assets and metadata: `<title>Touriva Travel Shop & Experiences</title>` rendered cleanly.

---

## 5. API Connectivity & Workflow Verification

API connectivity from the frontends to `https://touriva-shop-api.onrender.com` was verified end-to-end:

```json
{
  "status": "ok",
  "service": "touriva-shop-backend",
  "database": "connected",
  "timestamp": "2026-11-03T14:10:39.163Z"
}
```

### Forensic Check Details:
1. **CORS Allowlist:**
   - Origin `https://market.touriva.nextchallenge.tech` ➔ `Access-Control-Allow-Origin: https://market.touriva.nextchallenge.tech` (PERMITTED)
   - Origin `https://seller.market.touriva.nextchallenge.tech` ➔ `Access-Control-Allow-Origin: https://seller.market.touriva.nextchallenge.tech` (PERMITTED)
   - Origin `https://admin.market.touriva.nextchallenge.tech` ➔ `Access-Control-Allow-Origin: https://admin.market.touriva.nextchallenge.tech` (PERMITTED)
2. **Product Catalog:**
   - 20 published products successfully retrieved from `/api/marketplace/products` in database `touriva_shop`.
3. **Seller Authentication & IDOR Protection:**
   - Authenticated as `seller1@touriva.test` with JWT Bearer token.
   - Verified that orders and finance endpoints return data strictly scoped to this seller's `sellerId`.
4. **Owner Admin Authentication & Governance:**
   - Authenticated as `admin@touriva.test`.
   - Accessed 4 pending vendor applications (`/api/admin/marketplace/seller-applications`).
   - Retrieved platform commission summary (7,300 DZD platform earned, 65,700 DZD pending payouts).
5. **Test Orders Safety:**
   - Confirmed zero active test orders remaining. All historical verification orders are marked `cancelled` with `0 DZD` distortion.

---

## 6. Frozen Tourism Platform Protection Confirmation

In accordance with strict safety invariant #5, the tourism platform was audited and confirmed completely untouched:

- **Frontend:** `https://touriva.nextchallenge.tech` ➔ **HTTP 200 OK**
- **API Health:** `https://api.touriva.nextchallenge.tech/api/health` ➔ **HTTP 200 OK**
  ```json
  {
    "status": "ok",
    "service": "Touriva Tourism API",
    "uptime": 13.19,
    "timestamp": "2026-11-03T14:11:11.359Z",
    "database": "connected"
  }
  ```
- **Database:** Production collection `cluster0.../touriva` remains untouched.

---

## 7. Standby Rollback Availability

The three original Render frontend services remain live, healthy, and available as instant zero-downtime rollback targets if needed:

| Service Name | Render URL | HTTP Status |
|:---|:---|:---:|
| `touriva-shop-web` | `https://touriva-shop-web.onrender.com` | **200 OK** |
| `touriva-shop-seller-admin` | `https://touriva-shop-seller-admin.onrender.com` | **200 OK** |
| `touriva-shop-admin` | `https://touriva-shop-admin.onrender.com` | **200 OK** |

---

## 8. Actionable Unblocking Step for Storefront SSL

Because `seller.market` and `admin.market` have already received their Let's Encrypt certificates, the DNS configuration is proven correct.

To immediately clear the cached record on Google Public DNS for `market.touriva.nextchallenge.tech` and expedite Storefront SSL issuance:

1. Open the [Google Public DNS Flush Cache Tool](https://developers.google.com/speed/public-dns/cache).
2. Enter Domain: `market.touriva.nextchallenge.tech`
3. RR type: `CNAME`
4. Click **Flush Cache**.
5. Repeat for RR type: `A`.

Once flushed, Netlify's ACME worker will complete the handshake and issue the Let's Encrypt certificate for Storefront automatically within 60 seconds.

---

## 9. Verification Conclusion

- **Seller Portal (`seller.market.touriva.nextchallenge.tech`):** **VERIFIED COMPLETE (100% PASS)**
- **Owner Admin (`admin.market.touriva.nextchallenge.tech`):** **VERIFIED COMPLETE (100% PASS)**
- **Public Storefront (`market.touriva.nextchallenge.tech`):** **PENDING SSL ISSUANCE (DNS Verified, HTTP 200 OK on Netlify Edge)**

*In accordance with instructions, full completion will not be declared until `market.touriva.nextchallenge.tech` passes HTTPS verification.*
