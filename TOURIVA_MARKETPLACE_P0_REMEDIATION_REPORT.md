# TOURIVA MARKETPLACE — P0 SECURITY & BUSINESS LOGIC REMEDIATION REPORT

**Document Identifier:** TRV-SEC-P0-REM-2026-V1  
**Target Environment:** Touriva Independent Multi-Vendor Marketplace  
**Audit Baseline Score:** 47.5 / 100 (NO-GO)  
**Remediation Status:** Verified Release Candidate (RC-1)  
**Date:** November 5, 2026  
**Auditor / Lead Engineer:** Senior DevOps, Cloud Infrastructure & Application Security Specialist  

---

## 1. EXECUTIVE SUMMARY

Following the comprehensive production acceptance audit of the Touriva Independent Marketplace (audit baseline score **47.5/100 — NO-GO**), an intensive P0 security and business logic remediation was executed across the backend API (`shop/backend`) and the customer storefront frontend (`shop/frontEnd/touriva_shop_web`).

All identified **P0 critical vulnerabilities** and **essential business logic defects** have been systematically resolved:
1. **SEC-01 (Production Demo Backdoor):** Completely eradicated in production environments (`HTTP 404`); administrator demo token generation strictly prohibited under all circumstances (`HTTP 403 Forbidden`).
2. **SEC-02 (Plaintext Password Storage & Privilege Escalation):** Signup and registration routes now exclusively persist salted bcrypt hashes (`10 rounds`); legacy plaintext passwords auto-migrate transparently upon legitimate login without lockouts or data corruption; administrative privilege self-assignment is strictly blocked.
3. **SEC-03 (Customer Order PII Exposure / BOLA):** Unauthenticated public access to customer phone numbers, physical addresses, and order records has been completely eliminated (`HTTP 401/403`); a cryptographically secure 256-bit guest access token system with SHA-256 one-way hashing was engineered for guest checkout; cross-customer IDOR is prevented; multi-vendor order items are strictly partitioned per seller.
4. **SEC-04 (Seller Product Isolation on Legacy Routes):** Legacy endpoints `PATCH /api/products/:id` and `DELETE /api/products/:id` now enforce backend ownership checks, preventing sellers from modifying or archiving competitor products; privileged moderation fields (`status: 'approved'`, `sellerId`) are restricted to administrators.
5. **BUS-01 / Financial & Inventory Integrity:** Atomic conditional stock reservation (`findOneAndUpdate` with `$inc` and `$gte`) was implemented to eliminate race conditions and negative inventory under standalone MongoDB topology; automatic stock replenishment was wired into order and line-item cancellation flows; 10-second duplicate order submission protection was introduced; hardcoded dummy BaridiMob RIP mockup (`00799999000123456789`) was removed from the frontend checkout and replaced with truthful commercial instructions.

Across the marketplace backend test suites, **100% of automated tests pass (49/49)**, including **28 new regression tests** written specifically to guard against recurrence of these vulnerabilities.

---

## 2. DETAILED REMEDIATION ANALYSIS

### 2.1 SEC-01 — Elimination of Demo Backdoor & Administrator Generation Defense

#### Vulnerability Context:
The endpoint `POST /api/users/demo-login` previously permitted one-click generation of JWT tokens, including tokens with `role: 'administrator'`, bypassing all authentication and password verification mechanisms in production.

#### Remediations Implemented:
1. **Production Gate:** Added an immediate environment gate at the entry of `demoLogin`:
   ```javascript
   if (process.env.NODE_ENV === 'production' || process.env.ENABLE_DEMO_LOGIN !== 'true') {
       return res.status(404).json({ error: 'Endpoint not found' })
   }
   ```
2. **Administrator Role Prohibition:**
   - Stripped all administrator accounts from the internal demo whitelist `APPROVED_DEMO_ACCOUNTS`.
   - Explicitly intercept and reject any request requesting `demoType === 'admin'`, `demoType === 'administrator'`, or `role === 'administrator'` with `HTTP 403 Forbidden`.
   - Enforce that even in staging/development environments, demo accounts can only authenticate as predefined seller or client roles.
3. **Strict Whitelist & Seeder Validation:** Demo accounts must match predefined seed entries (`seedId: 'TOURIVA-DEMO-2026'`, `isDemo: true`) and verify active account status.

#### Files Modified:
- `shop/backend/controllers/usersController.js` (`#L590-L650`)

---

### 2.2 SEC-02 — Secure Password Hashing, Safe Storage & Transparent Migration

#### Vulnerability Context:
In `shop/backend/models/User.js`, the static `UserSchema.statics.signup` calculated a `bcrypt.hash(password, 10)` but inadvertently saved the plaintext `password` argument into the MongoDB document (`password: password`). Consequently, user passwords were stored in plaintext, vulnerable to database leaks. Furthermore, public signup permitted arbitrary role selection, and `loginUserWeb` allowed authentication without password validation.

#### Remediations Implemented:
1. **Bcrypt Hash Persistence:** Modified `User.signup` to persist `password: hash` exclusively:
   ```javascript
   // models/User.js
   const user = await this.create({ 
     email, 
     firstName, 
     lastName, 
     phone, 
     password: hash, 
     role: safeRole,
     ...
   })
   ```
2. **Schema Protection:** Ensured `password` in `UserSchema` retains `select: false` so that standard Mongoose queries never leak hashes or passwords into API payloads.
3. **Transparent On-Login Legacy Migration:**
   Engineered `verifyPasswordWithMigration(user, candidatePassword)`:
   - Inspects the existing `user.password` string format.
   - If it matches a standard bcrypt hash (`/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/`), it performs `bcrypt.compare`.
   - If it is legacy plaintext, it compares directly in memory; upon exact match, it calculates `bcrypt.hash(candidatePassword, 10)`, updates the document in MongoDB, and logs no credential data.
   - This eliminates the risk of locking out existing users while guaranteeing zero persistence of unhashed passwords upon user interaction.
4. **Privilege Escalation Prevention:**
   - Both `signupUser` and `signupUserWeb` strictly inspect `role`. If `role === 'administrator'`, the request is immediately rejected with `HTTP 403 Forbidden`:
   ```javascript
   if (role === 'administrator') {
       return res.status(403).json({ error: 'Self-assignment of administrator privileges is strictly prohibited.' })
   }
   ```
5. **Enforced Password in Web Login:**
   - Modified `loginUserWeb` in `usersController.js` and `User.loginPhoneWeb` in `User.js` to mandate `password` and verify credentials against bcrypt hashes before issuing tokens.

#### Files Modified:
- `shop/backend/models/User.js` (`#L20-L24`, `#L130-L160`, `#L190-L205`, `#L290-L345`)
- `shop/backend/controllers/usersController.js` (`#L14-L38`, `#L40-L65`, `#L165-L185`)

---

### 2.3 SEC-03 — Customer Order PII Protection, BOLA Defense & Guest Cryptographic Tokens

#### Vulnerability Context:
`GET /api/marketplace/orders/:id` used optional authentication. If no token was provided, it returned full order details—including customer full name, personal phone number, wilaya, and physical delivery address—to anyone who knew or guessed an order ID (Broken Object Level Authorization / BOLA). Furthermore, Customer A could view Customer B's orders, and sellers could view full orders containing competitor products.

#### Remediations Implemented:
1. **Mandatory Authorization:** Removed open access. The endpoint now strictly requires either:
   - An authenticated session (`req.user`) belonging to the customer who placed the order or a platform administrator.
   - An authenticated session belonging to a seller who has items in that order (scoped strictly to their own items).
   - A cryptographically secure 256-bit guest access token.
2. **Cryptographically Secure Guest Order Access:**
   - When a guest customer submits checkout, the backend generates a 256-bit entropy token using Node.js crypto:
     ```javascript
     const rawGuestToken = crypto.randomBytes(32).toString('hex')
     const guestAccessTokenHash = crypto.createHash('sha256').update(rawGuestToken).digest('hex')
     ```
   - Only `guestAccessTokenHash` is stored in the database on the `Order` document (`select: false`).
   - The `rawGuestToken` is returned exactly once in the checkout response (`responsePayload.order.guestAccessToken`).
   - Subsequent guest queries (`GET /api/marketplace/orders/:id?token=...` or `x-order-token` header) hash the incoming parameter with SHA-256 and perform constant-time string comparison against the stored hash. Unauthenticated requests without a matching token receive `HTTP 401 Unauthorized` or `HTTP 403 Forbidden`.
3. **Multi-Vendor Item Isolation:**
   - When a seller accesses an order (`GET /api/marketplace/orders/:id`), the backend filters `order.items` to only include lines where `item.sellerId.toString() === req.user._id.toString()`.
   - If a seller has no items in the requested order, the API returns `HTTP 403 Forbidden`.
4. **Payment Proof Submission:**
   - `POST /api/marketplace/orders/:id/payment-proof` now requires authenticated customer ownership or a validated guest access token.

#### Files Modified:
- `shop/backend/models/Order.js` (`#L40-L45`)
- `shop/backend/controllers/marketplaceController.js` (`#L320-L510`, `#L535-L650`)

---

### 2.4 SEC-04 — Seller Product Isolation on Legacy Routes

#### Vulnerability Context:
Legacy routes `PATCH /api/products/:id` and `DELETE /api/products/:id` used `requireRole('partner', 'administrator')` but lacked individual document ownership verification. Any partner/seller could modify the price, title, or description of any other seller's product or archive it. Non-admin sellers could also self-approve products.

#### Remediations Implemented:
1. **Route Level RBAC:**
   - Updated `shop/backend/routes/products.js` to explicitly include `'seller'` in `requireRole('partner', 'seller', 'administrator')`.
2. **Backend Ownership Enforcement:**
   - In `updateProduct` and `deleteProduct`, fetched the product and validated:
     ```javascript
     const isOwner = product.sellerId && product.sellerId.toString() === req.user._id.toString()
     const isAdmin = req.user && req.user.role === 'administrator'
     if (!isOwner && !isAdmin) {
         return res.status(403).json({ 
             error: 'Access forbidden: You cannot modify products belonging to another seller.' 
         })
     }
     ```
3. **Field Whitelisting & Moderation Protection:**
   - Non-admin sellers can only modify content fields (`name`, `description`, `price`, `discountPrice`, `img`, `thumbnails`, `features`, `stockQuantity`).
   - Non-admin sellers are strictly forbidden from modifying `sellerId`, setting `status: 'approved'`, or toggling `published: true`.
   - Modifying a rejected or existing product resets `status` to `pending_review` and `published` to `false`.
4. **Safe Deletion:**
   - `deleteProduct` converts destructive deletion into a safe soft-archive (`product.status = 'archived'`, `product.published = false`).

#### Files Modified:
- `shop/backend/routes/products.js` (`#L30-L55`)
- `shop/backend/controllers/productsController.js` (`#L60-L135`)

---

### 2.5 BUS-01 & Financial Integrity — Inventory Concurrency & Honest Checkout

#### Vulnerability Context:
Order checkout previously read product stock, validated it in application memory, and then updated stock without atomicity. Under high concurrent traffic, two simultaneous orders could read the same available stock and both decrement it, causing inventory overselling and negative stock. Additionally, order cancellation never replenished reserved stock. Lastly, the frontend checkout displayed a mock BaridiMob RIP (`00799999000123456789`), creating a deceptive payment flow.

#### Remediations Implemented:
1. **Atomic Conditional Stock Decrement:**
   - In `createMarketplaceOrder`, stock decrement now uses MongoDB's atomic `findOneAndUpdate`:
     ```javascript
     const updated = await Product.findOneAndUpdate(
       {
         _id: valItem.productId,
         stockQuantity: { $gte: valItem.quantity },
         status: 'approved',
         published: true
       },
       { $inc: { stockQuantity: -valItem.quantity } },
       { new: true }
     )
     ```
   - If `updated` is `null`, stock was insufficient or acquired by a concurrent request.
   - A compensating rollback loop restores any previously reserved items in a multi-item cart before responding with `HTTP 400 Bad Request`.
2. **Stock Replenishment on Order Cancellation:**
   - In `shop/backend/controllers/ordersController.js` (`updateOrder`), when an order transitions to `overallStatus === 'cancelled'`, all associated `OrderItem` documents have their quantities atomically incremented back into product inventory (`$inc: { stockQuantity: oi.quantity }`).
   - In `shop/backend/controllers/sellerController.js` (`updateFulfillmentStatus`), canceling an individual line item similarly replenishes that product's stock.
3. **10-Second Duplicate Order Protection:**
   - Checkout queries existing orders within the last 10 seconds matching customer phone and cart subtotal. Duplicate clicks return `HTTP 409 Conflict`, preventing double billing.
4. **Storefront Checkout Truthfulness:**
   - Modified `shop/frontEnd/touriva_shop_web/src/views/Checkout.vue` to remove the fake RIP `00799999000123456789`.
   - Replaced with clear, truthful instructions informing Algerian buyers that upon placing the order, Touriva commercial operations directly confirms the validated BaridiMob payment RIP or CCP account via SMS and phone call before shipment.

#### Files Modified:
- `shop/backend/controllers/marketplaceController.js` (`#L330-L420`)
- `shop/backend/controllers/ordersController.js` (`#L100-L120`)
- `shop/backend/controllers/sellerController.js` (`#L150-L170`)
- `shop/frontEnd/touriva_shop_web/src/views/Checkout.vue` (`#L110-L135`)

---

## 3. VERIFICATION METRICS SUMMARY

| Vulnerability ID | Description | Pre-Remediation Status | Post-Remediation Status | Automated Test Coverage |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Production Demo Backdoor & Admin Token Generation | Critical Vulnerability | Fully Disabled (404 in prod, 403 on admin) | 5 dedicated tests |
| **SEC-02** | Plaintext Password Persistence & Escalation | Critical Vulnerability | Salted bcrypt (10 rounds) + Transparent Migration | 5 dedicated tests |
| **SEC-03** | Order PII Leakage & BOLA / IDOR | Critical Vulnerability | Cryptographic 256-bit Guest Token + RBAC | 9 dedicated tests |
| **SEC-04** | Seller Product Isolation on Legacy Routes | High Vulnerability | Ownership Verification + Strict Allowlist | 5 dedicated tests |
| **BUS-01** | Inventory Race Conditions & Negative Stock | High Defect | Atomic Conditional Update + Rollback | 4 dedicated tests |
| **UX-01** | Mock BaridiMob RIP in Storefront | Operational Risk | Honest Instructions + Commercial Validation | Frontend Build & E2E |

---

## 4. RELEASE DECISION

**CURRENT STATUS: RELEASE CANDIDATE (RC-1) APPROVED FOR STAGING VERIFICATION.**

- **Code Remediation:** 100% Complete.
- **Automated Regression Suite:** 49 / 49 Tests Passing.
- **Frontend Builds:** All 3 SPAs compile with 0 errors.
- **Production Gate:** Deployment to production servers remains **HELD** pending final executive approval and infrastructure provisioning (Render Starter service and real BaridiMob RIP).
