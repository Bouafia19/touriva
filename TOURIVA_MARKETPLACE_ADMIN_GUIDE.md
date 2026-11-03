# TOURIVA INDEPENDENT MARKETPLACE — OWNER & ADMINISTRATOR OPERATING MANUAL

**Audience:** Platform Owner & Administrator (**Khaled Bouafia**)  
**Access Portal:** `https://admin.market.touriva.nextchallenge.tech`  
**Classification:** Confidential Operational Manual  
**Version:** 1.0.0 (November 2026)  

---

## 1. Introduction & Ownership Philosophy

Touriva Marketplace is an **owner-controlled multi-vendor commerce platform**. As the owner and administrator, you (**Khaled Bouafia**) hold exclusive authority over the platform's brand, operational policies, catalog curation, and financial transactions.

Sellers do not possess independent administrative rights. They operate as verified merchant partners whose catalogs and payouts are supervised directly by you.

```
                      +-----------------------------+
                      |   KHALED BOUAFIA (OWNER)    |
                      |   Touriva Marketplace Admin |
                      +-----------------------------+
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
+---------------------+   +---------------------+   +---------------------+
| VENDOR ONBOARDING   |   | CATALOG CURATION    |   | FINANCIAL LEDGER    |
| - Review Apps       |   | - Moderate Products |   | - Verify Payments   |
| - Assign Commission |   | - Enforce Standards |   | - Settle Payouts    |
| - Suspend Delinquent|   | - Delist Violations |   | - Set Platform Fees |
+---------------------+   +---------------------+   +---------------------+
```

---

## 2. Accessing the Administration Console

1. Navigate to: `https://admin.market.touriva.nextchallenge.tech`
2. Sign in with your administrator credentials:
   - **Default Admin Account:** `admin@touriva.test` (or your primary admin email)
   - **Password:** `Password123!` (or your secure administrative password)
3. You will arrive at the **Executive Marketplace Overview**, displaying real-time platform metrics.

---

## 3. Daily Operational Workflows

### 3.1 Reviewing & Approving Seller Applications

Prospective Algerian artisans and merchants apply via the public storefront (`/apply-seller`).

1. In the sidebar, click **Seller Applications** (`/admin/seller-applications`).
2. Review pending applications displaying store name, contact person, phone, craft category, and regional wilaya.
3. Click on an application to inspect the business description.
4. **To Approve a Vendor:**
   - Click the green **Approve** button.
   - Set the vendor's **Commission Rate %** (Default is 10%; you can adjust higher or lower for priority artisans).
   - Enter internal approval notes.
   - Click **Confirm Approval**.
   - *System Action:* A seller user account and `SellerProfile` are automatically generated. The vendor receives permission to log in to the Seller Portal (`seller.market.touriva.nextchallenge.tech`).
5. **To Reject an Application:**
   - Click **Reject**.
   - Enter a polite and professional rejection reason (e.g., "Missing artisanal qualification" or "Products outside tourism catalog guidelines").
   - Click **Decline Application**.

---

### 3.2 Product Moderation Queue (Quality Control)

To preserve Touriva's premium reputation, no vendor can publish a product directly to the public storefront without your review.

1. In the sidebar, click **Product Moderation** (`/admin/products/moderation`).
2. The queue displays all items submitted with `status: 'pending_review'`.
3. Inspect:
   - **Product Image:** Ensure high resolution, clear presentation, and authentic travel aesthetic.
   - **Product Title & Description:** Verify accurate cultural or technical descriptions.
   - **Pricing & Stock:** Ensure fair market pricing in Algerian Dinars (DZD).
   - **Seller Attribution:** Confirm which vendor submitted the item.
4. **To Approve:** Click **Approve**. The product immediately transitions to `status: 'approved'` and is rendered live on `market.touriva.nextchallenge.tech`.
5. **To Reject:** Click **Reject** and provide corrective instructions (e.g., "Please upload a clearer image on a neutral background with dimensions specified"). The seller sees this feedback in their portal.

---

### 3.3 Customer Payment Verification

Touriva supports Cash on Delivery (COD), BaridiMob, and CCP postal transfers. When travelers pay via BaridiMob or CCP, they upload a digital transfer slip.

1. In the sidebar, click **Customer Orders** (`/admin/orders`).
2. Filter by **Proof Uploaded** (`payment_submitted`).
3. Click **View Proof** to inspect the customer's payment slip or transaction reference.
4. Verify the transferred amount matches the order total.
5. Click **Verify Payment**.
6. *System Action:*
   - The order transitions to `paymentStatus: 'paid'`.
   - The system automatically calculates your Touriva platform commission for every line item in the order.
   - Corresponding records are created in the **Commission Ledger**.

---

### 3.4 Managing the Commission Ledger & Vendor Payouts

1. In the sidebar, click **Commission Ledger** (`/admin/commissions`).
2. View your financial breakdown:
   - **Platform Revenue:** Total Touriva commissions earned to date.
   - **Pending Vendor Payouts:** Accumulated net earnings owed to vendors.
   - **Settled to Vendors:** Historical disbursements already paid out.
3. When you disburse earnings to a vendor via CCP or BaridiMob:
   - Locate the accrued commission row.
   - Click **Settle Payout**.
   - Enter your bank/postal transaction reference (e.g., `CCP-TRF-982104` or `BM-883920`).
   - Click **Confirm Disbursement**.
   - *System Action:* The item marks as `settled`, maintaining an exact financial audit trail.

---

### 3.5 Vendor Governance & Suspension

If a seller fails to ship items within SLA, receives low ratings, or engages in fraudulent behavior:

1. In the sidebar, click **Vendors & Sellers** (`/admin/sellers`).
2. Find the vendor row.
3. Click **Suspend**.
4. *System Action:*
   - The vendor's status transitions to `isSuspended: true`.
   - **Every product belonging to this vendor is instantly hidden from the public storefront.**
   - The seller's portal displays an administrative freeze alert.
5. Once resolved, clicking **Reactivate** restores their active standing and relists their approved products.

---

### 3.6 Configuring Global Platform Settings

1. In the sidebar, click **Marketplace Settings** (`/admin/marketplace-settings`).
2. You can configure:
   - **Default Commission Rate (%):** Applied to newly approved vendors (e.g., 10%).
   - **Accepted Payment Rails:** Toggle switches for COD, BaridiMob, and CCP.
   - **Support Phone & Email:** Displayed to travelers across customer invoices.
   - **Marketplace Announcement Banner:** Public alert shown on the storefront header.
3. Click **Save Settings** to persist your changes globally.

---
*Maintained by Touriva Core Architecture & Governance Team for Khaled Bouafia.*
