# Touriva — Phase 4 Product Decisions & Business Policy Framework

**Document Version:** 1.0.0  
**Date:** October 29, 2026  
**Status:** PENDING STAKEHOLDER APPROVAL (Must Be Resolved Before Coding Phase 4)  
**Target Project:** Touriva — Algerian Tourism Platform (`/home/next/next projects/touriva`)  
**Architecture Verdict:** **READY WITH PRODUCT DECISIONS REQUIRED**

---

## 1. Executive Summary

While the technical architecture, mathematical invariants, database schemas, and multi-tenant security boundaries for Phase 4 are fully established in [`TOURIVA_PHASE4_FINANCIAL_ARCHITECTURE.md`](file:///home/next/next%20projects/touriva/TOURIVA_PHASE4_FINANCIAL_ARCHITECTURE.md), several key **business rules, commercial policies, and regulatory options** require explicit product stakeholder decisions before software implementation begins.

This document catalogues each product decision, presents realistic options tailored to Algerian tourism practices (e.g. CCP, BaridiMob, cash at agency counter, regulatory requirements), highlights trade-offs, and provides the architect's recommendation.

---

## 2. Product Decisions Required Before Implementation

### Decision 1: Booking Confirmation vs. Payment Precedence
*Can an agency confirm a customer's booking before receiving payment?*

- **Context:** In Phase 3, agencies can click "Confirmer" on a `pending` booking. In Algerian tourism, many agencies confirm bookings based on verbal trust or phone contact, expecting payment on departure day or within 48 hours. Others require an immediate deposit before reserving a seat.
- **Options:**
  - **Option A (Flexible - Recommended):** Confirmation is independent of payment. An agency can confirm an `unpaid` or `partially_paid` booking, but the departure ticket is marked *"En attente de paiement"* until fully paid.
  - **Option B (Strict Payment-Gated):** A booking cannot transition to `confirmed` until at least a minimum deposit (or 100% payment) is verified.
  - **Option C (Agency-Configurable):** Each agency chooses in its profile whether to require pre-payment before confirmation.
- **Architect Recommendation:** **Option A**. Maximizes agency autonomy and matches offline Algerian practices without locking the workflow.

---

### Decision 2: Deposit Policies & Partial Payments
*Are deposits mandatory, and who defines the deposit amount/percentage?*

- **Context:** Multi-day Sahara expeditions (e.g. Djanet, Tamanrasset) require significant advance outlays for 4x4s, food, and permits, whereas day trips (e.g. Tipaza, Chréa) are often paid in full on arrival.
- **Options:**
  - **Option 1 (Package-Level Deposit Configuration - Recommended):** When creating or editing an excursion package (`Trip`), the agency can set `requiresDeposit: Boolean` and `depositAmountDZD: Number` or `depositPercentage: Number` (e.g. 30%).
  - **Option 2 (Platform-Wide Fixed Rule):** All bookings require a fixed percentage (e.g. 50%) to be considered secured.
  - **Option 3 (No Structured Deposits):** Only informal installment tracking; any payment amount between 1 DZD and the total is accepted.
- **Architect Recommendation:** **Option 1**. Empowers agencies to tailor deposit terms based on excursion logistics while preserving clear expectations for travelers.

---

### Decision 3: Payment Proof Submission by Customers
*Can customers upload proof files (receipts/screenshots) through the tourist web app?*

- **Context:** In Algeria, travelers paying via BaridiMob or CCP typically receive a digital receipt screenshot or paper slip.
- **Options:**
  - **Option A (Full Tourist Upload - Recommended):** Customers can upload images or PDFs of payment slips directly on their booking detail view (`/tripDetail/:id` or `/document`). Agency receives a review notification.
  - **Option B (WhatsApp / Offline Submission Only):** Customer sends proof to the agency via WhatsApp; agency staff manually inspects and records the payment in the agency dashboard.
  - **Option C (Both A and B Supported):** Customer can upload on Touriva, but agency can also manually log any payment received via external channels.
- **Architect Recommendation:** **Option C**. Best user experience: tech-savvy travelers upload on Touriva, while offline/WhatsApp transactions are still captured in the centralized agency ledger.

---

### Decision 4: Agency Role Permissions for Payment Verification
*Who inside an agency can verify payments and record cash collections?*

- **Context:** Agencies have front-desk counter staff, tour guides, and managing directors.
- **Options:**
  - **Option 1 (Two-Tier Permissions):** Desk staff can record cash/received payments in `submitted` status; only agency owners/managers (`role: 'partner'`, confirmed fileStatus) can mark payments `verified`.
  - **Option 2 (Single-Tier Agency Trust - Recommended for Pilot):** Any authenticated agency operator for that agency account can record and verify cash/wire payments.
  - **Option 3 (Strict Segregation of Duties):** Sub-accounts with dedicated roles (`agency_cashier`, `agency_manager`).
- **Architect Recommendation:** **Option 2 for Phase 4 Pilot**, moving to Option 3 in a future enterprise update when agency sub-user management is implemented.

---

### Decision 5: Auto-Cancellation & Expiration of Unpaid Bookings
*What happens to pending or confirmed bookings that remain unpaid after a deadline?*

- **Context:** If a customer reserves 4 seats on a popular departure and never pays, the agency risks losing paying customers due to held capacity.
- **Options:**
  - **Option A (Manual Agency Cancellation - Recommended for Pilot):** Agency retains discretion to cancel the booking if payment is not received by the deadline. Touriva sends automated reminder notifications.
  - **Option B (Strict Automated Expiry Cron):** If no payment is verified within $X$ hours (e.g. 48 hours), the system automatically cancels the booking and releases the departure seats.
  - **Option C (Configurable Payment Due Date):** Agency sets a `paymentDueDate` on the departure. If unpaid by this date, the agency is prompted to release or grant an extension.
- **Architect Recommendation:** **Option A & C combined**. Provide a clear `paymentDueDate` on the booking and agency dashboard, but do not automatically drop seats via cron without agency intervention during the pilot phase.

---

### Decision 6: Cancellation Penalties & Refund Policies
*Can agencies retain cancellation fees, and how are refund amounts determined?*

- **Context:** In Algerian tourism, cancellation terms vary by lead time (e.g. 100% refund up to 14 days, 50% up to 7 days, 0% within 48 hours).
- **Options:**
  - **Option 1 (Agency-Managed Discretionary Refund - Recommended):** When processing a refund for a cancelled booking, the agency enters the net refund amount and records the deducted `cancellationFeeDZD` according to their published policy.
  - **Option 2 (Automated Tiered Deduction):** Touriva automatically calculates the penalty percentage based on the excursion's saved cancellation policy text.
  - **Option 3 (No Partial Refunds):** Refunds must always be 100% of collected funds.
- **Architect Recommendation:** **Option 1**. Natural language policies are too diverse across Algerian agencies to automate reliably in code without legal disputes. Allowing the agency to enter the specific refund and fee amounts with mandatory audit notes ensures flexibility.

---

### Decision 7: Overpayment Handling Policy
*What happens if a customer accidentally transfers more than the total booking price?*

- **Context:** A customer paying via bank wire might round up or make an accidental error (e.g. transferring 30,000 DZD instead of 25,000 DZD).
- **Options:**
  - **Option A (Strict Server Rejection - Recommended):** The system strictly rejects any payment verification where `amount > balanceDueDZD`. Agency must verify the exact balance due, or split the transaction.
  - **Option B (Permit Overpayment with Credit Balance):** Allow `totalPaid > totalPrice`, resulting in a negative `balanceDue` and status `overpaid`, with an action to disburse an overpayment refund.
- **Architect Recommendation:** **Option A**. Simple, prevents accounting confusion and tax discrepancies for small agencies during the pilot phase.

---

### Decision 8: Platform Visibility & Administrative Audit Oversight
*What financial data should Touriva platform administrators see?*

- **Context:** Platform administrators oversee compliance, anti-fraud, and support disputes.
- **Options:**
  - **Option 1 (Full Oversight - Recommended):** Administrators can view all agency payments, proofs, and refunds across the platform, and can assist in dispute resolution, but cannot directly disburse funds.
  - **Option 2 (Metadata Only):** Administrators see aggregate statistics and transaction references, but cannot view internal agency notes or proof documents.
  - **Option 3 (Zero Platform Access):** Financial data is encrypted and invisible to Touriva admins.
- **Architect Recommendation:** **Option 1**. Critical for fraud detection, ministerial compliance, and handling customer payment dispute tickets.

---

## 3. Implementation Complexity & Risk Analysis

### Component Complexity Breakdown

| Phase 4 Component | Estimated Effort | Complexity Rating | Key Technical Dependencies |
| :--- | :---: | :---: | :--- |
| **`TripPayment` & `TripRefund` Data Models** | 1–2 days | Low | Mongoose schemas, reference hooks |
| **Server Financial Calculator (`recalculateBookingFinancials`)** | 2 days | Medium | Aggregation pipeline, state machine |
| **Proof Document Upload & Secure Streaming** | 2–3 days | Medium-High | Multer, filesystem permissions, streaming |
| **Agency Financial Dashboard & Reports** | 3 days | Medium | Vue 3 Pinia store, Vuetify charts, export |
| **Customer Payment View & Submission Modal** | 2 days | Medium | `TripDetail.vue`, `Document.vue`, Vue modals |
| **Automated Financial Regression Test Suite** | 2–3 days | Medium-High | Jest, Supertest, concurrency checks |

### Highest-Risk Areas & Mitigation Strategies
1. **Concurrency Races on Partial Payments:**
   - *Risk:* Two cashiers recording payments simultaneously could exceed the booking balance.
   - *Mitigation:* Single-document atomic conditional updates (`findOneAndUpdate` with `$expr`) and in-flight key mutex.
2. **Malicious Proof File Uploads (RCE / SSRF):**
   - *Risk:* Uploading PHP/Node scripts or SVG with embedded XML payloads.
   - *Mitigation:* Storing outside web root, stripping original names, binary magic-number sniffing, disallowing SVG, streaming via controlled API.
3. **Double-Refund Invariant Violations:**
   - *Risk:* Multiple refund clicks disbursing more than net collected funds.
   - *Mitigation:* Authoritative check: `totalRefunds + newRefund <= totalPaid`.

---

## 4. Final Architecture Verdict & Recommendations

### Final Verdict: **READY WITH PRODUCT DECISIONS REQUIRED**

The technical blueprint is fully validated, secure, and compatible with the Touriva codebase. Coding of Phase 4 should commence immediately upon stakeholder sign-off on the recommendations above.

### Recommended Implementation Phasing
1. **Sprint 4.1 (Backend Data Layer):** Create `TripPayment` and `TripRefund` models, add financial fields to `TripBooking`, implement `recalculateBookingFinancials` helper and unit tests.
2. **Sprint 4.2 (Proof Storage & Security):** Implement Multer upload handler, file streaming route, and MIME security verification.
3. **Sprint 4.3 (Agency Payment & Refund Controllers):** Implement direct payment recording, proof verification, rejection, and refund endpoints with full authorization.
4. **Sprint 4.4 (Frontend Agency Dashboard):** Build `/agency/financials` and `/agency/dashboard` financial KPI widgets and transaction ledger in Vue 3.
5. **Sprint 4.5 (Frontend Tourist Experience):** Build payment proof submission modal and payment status badges in `TripDetail.vue` and `Document.vue`.
6. **Sprint 4.6 (End-to-End Regression & Verification):** Execute `agency_financials_phase4.test.js` and verify zero regressions across Phases 1–3.
