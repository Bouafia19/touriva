# TOURIVA MARKETPLACE — PRODUCTION LAUNCH ACCEPTANCE CHECKLIST

**Document Version:** 1.0.0  
**Target Date:** Pre-Launch Gate Review (November 2026)  
**Governance:** Touriva Platform Engineering & Security Operations  

This practical checklist defines the mandatory operational, architectural, and security criteria required before Touriva Marketplace can safely accept real sellers, publish artisan products, process customer orders, and handle real financial transactions.

---

## 1. INFRASTRUCTURE & DEPLOYMENT

- [x] **Storefront Netlify Deployment:** `https://market.touriva.nextchallenge.tech` deployed and serving HTTP/2 200.
- [x] **Seller Portal Netlify Deployment:** `https://seller.market.touriva.nextchallenge.tech` deployed and serving HTTP/2 200.
- [x] **Admin Portal Netlify Deployment:** `https://admin.market.touriva.nextchallenge.tech` deployed and serving HTTP/2 200.
- [x] **Hostinger DNS Records:** CNAME records properly mapped to Netlify edge instances.
- [x] **SSL/TLS Certificates:** Valid Let's Encrypt certificates provisioned across all 3 subdomains (active to Feb 2027).
- [x] **SPA Routing:** Netlify `_redirects` (`/* /index.html 200`) verified on all deep link URLs.
- [x] **CORS Policies:** Explicit allowlist configured for storefront, seller, and admin domains.
- [ ] **Render API Service Tier:** Upgrade Render API from free tier (`plan: free`) to paid tier (`starter` / `standard`) to eliminate 45–60s cold-start delays.
- [ ] **Custom API Domain:** Configure `api.market.touriva.nextchallenge.tech` pointing to Render API instead of using generic `onrender.com` domain.
- [ ] **Static Asset Security Headers:** Add Netlify `_headers` file with CSP, HSTS, X-Frame-Options, and Referrer-Policy on all 3 sites.

---

## 2. CYBERSECURITY & ACCESS CONTROL

- [ ] **[CRITICAL] Disable Demo Login in Production:** Gate `POST /api/users/demo-login` with `NODE_ENV !== 'production'`. Ensure 1-click admin tokens cannot be issued over the public Internet.
- [ ] **[CRITICAL] Fix Password Hashing on Signup:** Update `shop/backend/models/User.js` so that `User.signup` stores `password: hash` rather than plaintext `password`.
- [ ] **[CRITICAL] Fix Order BOLA / PII Leak:** Remove `optionalAuth` vulnerability on `GET /api/marketplace/orders/:id` and `POST /payment-proof`. Restrict guest order access to secret order tokens.
- [ ] **[CRITICAL] Deprecate / Restrict Legacy Product Mutation Routes:** Remove or restrict legacy `PATCH /api/products/:id` and `DELETE /api/products/:id` so partners cannot overwrite competitor products.
- [ ] **[HIGH] Eliminate Passwordless Web Login:** Remove `POST /api/users/loginWeb` or enforce password / verified SMS OTP authentication.
- [ ] **[HIGH] Dynamic Seller Password Generation:** Replace static `SellerWelcome#2026!` with secure email invitation tokens for new sellers.
- [ ] **[MEDIUM] Mount Helmet Middleware:** Add `helmet()` in `shop/backend/server.js` and disable `x-powered-by` header.
- [ ] **[MEDIUM] Redis-Backed Distributed Rate Limiting:** Replace in-memory rate limiting with Redis to survive server restarts and scale across instances.
- [x] **[VERIFIED] Admin URL Exclusion:** Ensure `admin.market.touriva.nextchallenge.tech` remains strictly excluded from customer storefront buttons and navigation.

---

## 3. CUSTOMER STOREFRONT EXPERIENCE

- [x] **Official Green Branding:** Touriva green identity (`#173f35`), official logo, and editorial typography implemented.
- [x] **Responsive Navigation:** Mobile drawer, desktop headers, category navigation functioning.
- [x] **Catalog Browsing:** Category filters, search input, price sorting, and pagination functioning.
- [x] **Product Detail Pages:** Product images, descriptions, pricing, seller store link, and specifications rendered.
- [x] **Multi-Vendor Cart Drawer:** Add to cart, quantity increments, subtotal calculation, cart persistence in localStorage.
- [x] **Checkout Flow:** Customer delivery form (58 wilayas dropdown, full address, phone number).
- [ ] **Customer Authentication Loop:** Test and verify that a newly registered customer can log in, edit profile, and view order history.
- [ ] **Real BaridiMob Account Configuration:** Replace placeholder RIP `00799999000123456789` in checkout modal with verified platform bank/postal account details.
- [ ] **Order Confirmation Notifications:** Implement transactional email/SMS notifications confirming order receipt to customers.

---

## 4. SELLER PORTAL OPERATIONS

- [x] **Seller Application Form:** Public onboarding form at `/sellers/apply` submitting to moderation queue.
- [x] **Seller Isolation Enforced:** Verified that sellers can only view and update their own products, orders, and finances via `/api/seller/*`.
- [x] **Product Moderation Lifecycle:** Newly created seller products default to `pending_review` and `published: false` until approved by platform owner.
- [x] **Fulfillment Status Controls:** Seller can update item status to `preparing`, `shipped`, `delivered`, with tracking numbers.
- [x] **Seller Dashboard Metrics:** Product counts, orders breakdown, gross revenue, accrued commission, and net payouts calculated from DB.
- [ ] **Automated Merchant Welcome Notification:** Email dispatch with secure setup link upon admin approval.
- [ ] **Low Stock Email Alerts:** Automated email alerting seller when stock drops below 5 units.
- [ ] **External Image Hosting:** Migrate product image uploads from MongoDB base64 strings to cloud object storage (S3/Cloudinary).

---

## 5. OWNER ADMINISTRATION & GOVERNANCE

- [x] **Exclusive Owner Control:** Verified that all `/api/admin/marketplace/*` routes strictly require `administrator` role.
- [x] **Executive KPI Dashboard:** Real-time metrics for total sellers, active products, pending reviews, GMV, and commissions.
- [x] **Seller Application Queue:** Ability to approve, reject, or request information with recorded rejection reasons.
- [x] **Product Moderation Queue:** Single-click approval, rejection, or suspension of artisan products.
- [x] **Commission Ledger:** Transparent ledger tracking gross GMV, platform commission, and seller net payouts.
- [x] **Audit Logging:** System actions (`PRODUCT_CREATED`, `ORDER_CREATED`, `SELLER_APPROVED`) logged in `AuditLog` collection.
- [ ] **Admin Frontend Role Guard:** Update `touriva_shop_admin/src/router/index.js` to verify `role === 'administrator'` in `router.beforeEach`.
- [ ] **Automated Commission Payout Reconciliation:** Exportable bank/CCP payment batch file (RIB/RIP list) for batch seller payouts.

---

## 6. DATABASE & BUSINESS LOGIC

- [x] **Server-Side Price Validation:** Product prices fetched from database during checkout, preventing client-side price tampering.
- [x] **Multi-Vendor Schema Architecture:** Order items stored with discrete seller attribution (`OrderItem.sellerId`).
- [ ] **[CRITICAL] Server-Side Stock Decrement:** Implement atomic decrement (`$inc: { stockQuantity: -qty }`) on product purchase.
- [ ] **[CRITICAL] Overselling Prevention:** Reject checkout if requested quantity exceeds available `stockQuantity`.
- [ ] **[CRITICAL] MongoDB Transactions:** Wrap `Order.create`, `OrderItem.create`, and stock decrement inside `session.startTransaction()`.
- [ ] **Stock Restoration on Order Cancellation:** Re-increment product stock when order is cancelled before fulfillment.
- [ ] **BSON Size Protection:** Restrict max product upload payload size and validate image formats.

---

## 7. PAYMENTS & ALGERIAN MARKET REALITIES

- [x] **Cash on Delivery (COD):** Handled as primary national payment method across 58 wilayas.
- [x] **BaridiMob / CCP Offline Workflow:** Support for customer receipt upload and admin verification.
- [ ] **Real BaridiMob Credentials:** Configure official platform postal RIP in admin settings.
- [ ] **Receipt Verification Security:** Require authenticated customer session or secret token to upload payment receipt.
- [ ] **CIB / Edahabia Payment Gateway (SATIM):** Phase 2 roadmap — acquire SATIM e-payment certification and integrate official Algerian card gateway.
- [ ] **Carrier Reconciliation:** Integration with Algerian courier APIs (Yalidine, Maystro, ZR Express) for automated COD collection status updates.

---

## 8. LEGAL, REGULATORY & BUSINESS READINESS

- [ ] **Algerian Law 18-05 Compliance:** Draft and publish formal Terms & Conditions for electronic commerce (Droit de rétractation, guarantees, seller responsibilities).
- [ ] **Algerian Law 18-07 Compliance:** Draft and publish Privacy Policy detailing customer data collection, storage, and rights.
- [ ] **Merchant Commission Agreement:** Formalize seller contract specifying commission rates, payout frequency (e.g., net-14 after delivery), and dispute resolution.
- [ ] **Product Compliance Rules:** Clear documentation on prohibited items (counterfeits, restricted food products, unregulated medical goods).
- [ ] **Commercial Support Desk:** Published support telephone number, WhatsApp business line, and dedicated support email.

---

## 9. MONITORING, BACKUPS & DISASTER RECOVERY

- [ ] **Automated MongoDB Backups:** Configure daily automated snapshots with 30-day retention (via MongoDB Atlas or automated `mongodump` cron to S3).
- [ ] **Disaster Recovery Plan:** Document and test step-by-step restoration procedure from database backup.
- [ ] **Application Performance Monitoring (APM):** Integrate Sentry for frontend and backend error tracking and alerting.
- [ ] **Uptime Monitoring:** Configure Pingdom or UptimeRobot checks on `/api/health` and all 3 frontend domains with SMS/email alerts.
- [ ] **Log Retention & Centralization:** Configure log aggregation for Render API logs to retain audit records beyond ephemeral server memory.

---

## 10. LAUNCH READINESS VERDICT

| Category | Gate Status | Condition to Clear |
|---|---|---|
| **Infrastructure** | **CONDITIONAL** | Upgrade Render API from free tier to paid instance |
| **Security** | **BLOCKED ❌** | Resolve SEC-01 (demo backdoor), SEC-02 (plaintext passwords), SEC-03 (BOLA) |
| **Core Storefront** | **CONDITIONAL** | Fix customer signup loop and real BaridiMob RIP |
| **Seller Operations** | **CONDITIONAL** | Add transactional email for onboarding |
| **Owner Admin** | **PASSED ✅** | Owner controls verified at API level |
| **Database Logic** | **BLOCKED ❌** | Implement stock decrement and MongoDB transactions |
| **Payments** | **CONDITIONAL** | Operational for COD; BaridiMob needs real RIP |
| **Legal & Policies** | **BLOCKED ❌** | Need formal Law 18-05 / 18-07 compliant terms |
| **Backups & Monitoring** | **BLOCKED ❌** | Automated database backup pipeline missing |

**OVERALL LAUNCH STATUS:** **NO-GO (BLOCKED UNTIL P0 SECURITY & DATA REMEDIATION IS COMPLETE)**
