# Touriva — Production Deployment Operator Checklist

**Date:** 2026-10-29  
**Platform:** Touriva (Algerian Tourism SaaS Platform)  
**Target Environment:** Render Cloud Platform  
**Status:** READY FOR OPERATOR EXECUTION  

---

## Stage 1: Pre-Deployment Verification Checklist

- [ ] **Working Tree Safety:**
  - [ ] Run `git status` to verify all Phase 1–4 files are accounted for.
  - [ ] Create a local backup checkpoint branch: `git branch backup/phase4-pre-deploy-checkpoint`.
  - [ ] Confirm no untracked secrets, credentials, or private test keys are staged.

- [ ] **Automated Test Suite Verification (Local Isolated Environment):**
  - [ ] Execute Phase 4 targeted tests:  
    `npm --prefix backend test -- tests/agency_financials_phase4.test.js` (Must report 41/41 passing).
  - [ ] Execute full backend regression suite:  
    `npm --prefix backend test` (Must report 11/11 suites, 221/221 passing).
  - [ ] Execute frontend unit tests:  
    `npm --prefix frontEnd/touriva test` (Must report 2/2 suites, 18/18 passing).
  - [ ] Execute frontend production compilation:  
    `npm --prefix frontEnd/touriva run build` (Must complete with 0 errors).

- [ ] **Database Pre-Deployment Snapshot:**
  - [ ] Log into MongoDB Atlas Dashboard.
  - [ ] Navigate to Cluster > Backup > **Take On-Demand Snapshot**.
  - [ ] Record the snapshot ID and confirmation timestamp in operational logs.

---

## Stage 2: Infrastructure Configuration Checklist (Render Dashboard)

> [!IMPORTANT]
> The steps below require manual access to the Render Dashboard (`khaledsetif1900@gmail.com`).

- [ ] **Service Plan Upgrade (`touriva-api`):**
  - [ ] Navigate to **Web Service > touriva-api > Settings**.
  - [ ] Change plan from **Free** to **Starter** (ensures persistent execution and disk support).
  - [ ] Verify Region is set to `Frankfurt (EU Central)` matching MongoDB Atlas region.

- [ ] **Persistent Disk Attachment:**
  - [ ] In `touriva-api > Settings`, navigate to **Disks**.
  - [ ] Click **Add Disk** and configure:
    - **Disk Name:** `touriva-payment-proofs-disk`
    - **Mount Path:** `/opt/render/project/src/backend/uploads` (or set custom `PAYMENT_PROOF_DIR`)
    - **Size:** `10 GB`
  - [ ] Save changes and allow disk initialization.

- [ ] **Environment Variables Verification:**
  Verify that the following environment variables are configured on `touriva-api` (never disclose secret values):
  - [ ] `NODE_ENV`: `production`
  - [ ] `PORT`: `4000`
  - [ ] `SECRET`: (Cryptographically random string, minimum 32 characters)
  - [ ] `MONGO_URI`: (Production MongoDB Atlas SRV connection string with credentials)
  - [ ] `CORS_ORIGINS`: Full allowlist:
    `https://touriva-web.onrender.com,https://touriva-admin.onrender.com,https://touriva-shop-web.onrender.com,https://touriva-shop-admin.onrender.com,https://touriva-shop-seller-admin.onrender.com`

---

## Stage 3: Code Deployment & Staging Validation Checklist

- [ ] **Code Deployment Trigger:**
  - [ ] Commit verified Phase 1–4 work to `master`:  
    `git commit -m "feat(financials): complete Phase 4 financial tracking, proof storage and agency ledger"`
  - [ ] Push to GitHub remote:  
    `git push origin master`
  - [ ] Monitor Render build logs for `touriva-api` and `touriva-web`. Verify `build succeeded` and service is `Live`.

- [ ] **Health & Connectivity Smoke Test:**
  - [ ] Query health check:  
    `curl -s https://touriva-api.onrender.com/api/health`
  - [ ] Verify JSON response:  
    `{"status":"ok","service":"Touriva Tourism API","database":"connected"}`.

- [ ] **Storage Persistence Verification Across Restart:**
  - [ ] Log in as an accredited test agency operator on `https://touriva-web.onrender.com`.
  - [ ] Submit a test payment proof document for a test booking.
  - [ ] Stream the proof file:  
    `GET https://touriva-api.onrender.com/api/agency/payments/<payment_id>/proof` (Verify HTTP 200).
  - [ ] Trigger a manual **Restart Service** in the Render Dashboard for `touriva-api`.
  - [ ] Wait for restart to complete (200 OK on `/api/health`).
  - [ ] Re-stream the proof file:  
    `GET https://touriva-api.onrender.com/api/agency/payments/<payment_id>/proof` (Verify HTTP 200).
  - [ ] Confirm file survived container replacement.

---

## Stage 4: Controlled Pilot Activation Checklist

- [ ] **Executive Pilot Sign-Off:**
  - [ ] Confirm signed approval from platform administrator and lead engineer.
  - [ ] Designate the 2 accredited pilot travel agencies in Algeria.
  - [ ] Brief agency operators on manual receipt verification and BaridiMob/CCP RIP workflow.

- [ ] **Pilot Agency Onboarding:**
  - [ ] Verify agency account accreditation (`fileStatus: 'confirmed'`, `typeAccount: 'touristAgencies'`).
  - [ ] Create initial published scheduled excursion packages for the pilot agencies.
  - [ ] Verify package deposit rules (if enabled) are configured within bounds.

- [ ] **Live Financial Workflow Walkthrough:**
  - [ ] Tourist books seats on scheduled excursion.
  - [ ] Tourist submits BaridiMob or CCP payment proof via customer portal.
  - [ ] Agency operator inspects proof under "Encaissements & Justificatifs".
  - [ ] Agency operator verifies payment -> verify `totalPaidDZD` increases and balance due updates.
  - [ ] Agency operator inspects Grand Livre des Réservations to confirm receivables balance.

---

## Stage 5: Post-Deployment Monitoring & Daily Operations Checklist

- [ ] **Daily Operational Verification (First 14 Days of Pilot):**
  - [ ] Check Render application logs for unhandled exceptions, 500 errors, or failed file uploads.
  - [ ] Reconcile agency daily total collected dinars against verified payments in `TripPayment`.
  - [ ] Monitor persistent disk storage utilization via Render metrics dashboard.
  - [ ] Verify MongoDB Atlas nightly automated snapshot backups have executed successfully.

---

## Emergency Decision Gates

| Trigger Condition | Action Required | Responsible Party |
| :--- | :--- | :--- |
| **Proof file lost on disk (404)** | Halt pilot payments immediately. Inspect disk mount path and permissions. Revert to emergency manual receipt archival. | DevOps / Operator |
| **Discrepancy in agency ledger balance** | Trigger `recalculateBookingFinancials` reconciliation hook. Audit `statusHistory` log. | Lead Engineer |
| **Unresponsive API (> 60s downtime)** | Check Render service status and Atlas connection limits. If persistent, trigger Rollback Plan. | Platform Operator |
