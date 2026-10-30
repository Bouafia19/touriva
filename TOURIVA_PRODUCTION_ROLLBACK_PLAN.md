# Touriva — Production Rollback Plan

**Date:** 2026-10-29  
**Platform:** Touriva (Algerian Tourism SaaS Platform)  
**Target Environment:** Render Cloud Platform  
**Status:** READY FOR OPERATOR USE  

---

## 1. Objective & Golden Rules

This plan outlines the exact, step-by-step procedures to safely revert Touriva to a known stable state in the event of an infrastructure failure, data inconsistency, or critical operational issue during the Phase 4 Controlled Financial Pilot.

> [!CAUTION] Golden Rule of Financial Rollback
> **NEVER DROP OR RESTORE A DATABASE DESTRUCTIVELY IF REAL FINANCIAL TRANSACTIONS OCCURRED.**  
> Restoring a database snapshot taken prior to deployment wipes out legitimate booking payments recorded during the pilot. Rollback must prioritize **ledger preservation**, zero data loss, and application-level isolation.

---

## 2. Rollback Triggers

A rollback should be triggered immediately if any of the following occur:
1. **Critical Financial Invariant Violation:** Any bug causing double-crediting of balance, negative balances, or unauthorized fund manipulation.
2. **Persistent Storage Failure:** Uploaded payment receipts fail to persist across container restarts, resulting in unrecoverable 404 errors during agency verification.
3. **Severe Multi-Tenant IDOR Breach:** Agency A being able to view or modify Agency B's payments, proofs, or bookings.
4. **Unrecoverable Service Instability:** Extended API downtime (> 15 minutes) caused by deployment runtime failure or memory leaks.

---

## 3. Rollback Procedures by Failure Scenario

### Scenario A: Application Code Rollback (Infrastructure & Database Healthy)
*Trigger: Regression bug discovered in payment or booking controller logic.*

1. **Step 1 — Identify Stable Baseline Commit:**
   - Pre-Phase 4 deployment baseline commit: `94e40ad` (or previous stable tag).
2. **Step 2 — Revert via Git:**
   ```bash
   # Revert commit on master
   git revert HEAD --no-edit
   git push origin master
   ```
   *(Render will automatically trigger a clean build and redeployment of the previous stable revision).*
3. **Step 3 — Ledger Preservation Check:**
   - Existing `TripPayment` and `TripRefund` collections remain intact in MongoDB Atlas.
   - Any payments recorded during the pilot remain preserved for manual audit.
4. **Step 4 — Verify Live Service:**
   - Verify `GET https://touriva-api.onrender.com/api/health` returns 200 OK.
   - Verify frontend routes remain operational.

---

### Scenario B: Storage Volume & Mount Failure
*Trigger: Attached persistent disk fails to mount or throws filesystem read/write errors.*

1. **Step 1 — Temporary Freeze of New Proof Uploads:**
   - Inform the 2 pilot agencies to record payments as `cash` at counter or direct bank verification using off-platform reference slips temporarily.
2. **Step 2 — Inspect Render Disk Status:**
   - In Render Dashboard > `touriva-api` > **Disks**, verify disk status and mount path.
   - Check application logs for `EACCES` (permissions) or `ENOENT` (missing mount path) errors.
3. **Step 3 — Remediation without Data Deletion:**
   - **DO NOT DELETE THE DISK.**
   - If mount path was misconfigured, adjust environment variable `PAYMENT_PROOF_DIR` to match the exact Render mount point.
   - Restart the service.

---

### Scenario C: Database Data Corruption or Transaction Integrity Failure
*Trigger: Inconsistent or corrupt data requiring point-in-time recovery.*

1. **Step 1 — Put Platform in Maintenance Mode:**
   - Temporarily set `NODE_ENV=maintenance` or pause public traffic on `touriva-api` to prevent new payments from writing to the database.
2. **Step 2 — Export Pilot Delta Ledger (Zero-Data-Loss Extraction):**
   - Before restoring any pre-deployment snapshot, dump all payments and refunds created during the pilot:
     ```bash
     mongodump --uri="<MONGO_URI>" --collection=trippayments --out=/tmp/touriva_pilot_dump
     mongodump --uri="<MONGO_URI>" --collection=triprefunds --out=/tmp/touriva_pilot_dump
     mongodump --uri="<MONGO_URI>" --collection=tripbookings --out=/tmp/touriva_pilot_dump
     ```
3. **Step 3 — Point-in-Time Atlas Restore:**
   - In MongoDB Atlas Dashboard, restore cluster to a secondary staging cluster (or target database).
4. **Step 4 — Reconcile & Backfill Delta:**
   - Merge the exported pilot ledger records back into the restored database so no customer payment claim is lost.
5. **Step 5 — Re-run Authoritative Recalculation:**
   - Run `recalculateBookingFinancials` across all active bookings to ensure balances match authoritative ledger records.

---

## 4. Post-Rollback Verification Checklist

- [ ] `touriva-api` health endpoint returns HTTP 200 `database: connected`.
- [ ] All 5 static frontend websites load properly (`touriva-web`, `touriva-admin`, `touriva-shop-*`).
- [ ] Agency operators can log in and view their bookings without 500 errors.
- [ ] All uploaded proof files on disk remain accessible or safely archived.
- [ ] Incident report documented detailing root cause, financial impact (if any), and corrective measures.

---

## 5. Communications Plan in Case of Rollback

- **Internal Engineering:** Immediately notify platform administrator and lead developer.
- **Pilot Travel Agencies:** Contact agency operators via phone and WhatsApp within 15 minutes explaining maintenance status and instructing them to hold manual verifications until restored.
- **Customers:** For any customer with an in-flight booking during rollback, customer service verifies payment slip manually via telephone.
