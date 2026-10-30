# Touriva — Live Demo Verification & Quality Checklist

**Target:** Touriva Live Web & Administration Applications  
**Scope:** Demo Accounts, Role Authorization, Operational Ledgers, and Multi-Tenant Isolation  
**Reference Guides:** `TOURIVA_LIVE_DEMO_READINESS_AUDIT.md` & `TOURIVA_LIVE_DEMO_DEPLOYMENT_GUIDE.md`  

---

## 1. Pre-Deployment Verification Checklist (Local Environment)

| Check ID | Verification Item | Target File / Component | Verification Command / Method | Status |
|:---:|---|---|---|:---:|
| **PRE-01** | Dedicated demo tests passing | `backend/tests/demo_users.test.js` | `npm test -- tests/demo_users.test.js` | **PASS (23/23)** |
| **PRE-02** | Full backend test suite passing | `backend/tests/*` (12 suites) | `npm test --prefix backend` | **PASS (244/244)** |
| **PRE-03** | Frontend mapping & branding tests | `frontEnd/touriva/src/__tests__/*` | `npm test --prefix frontEnd/touriva` | **PASS (18/18)** |
| **PRE-04** | Client web build successful | `frontEnd/touriva/dist` | `npm run --prefix frontEnd/touriva build` | **PASS** |
| **PRE-05** | Admin panel build successful | `frontEnd/touriva_adminPanel/dist` | `npm run --prefix frontEnd/touriva_adminPanel build` | **PASS** |
| **PRE-06** | Seeder idempotency verified | `backend/seed/seed_demo_users.js` | Consecutive executions produce identical document counts | **PASS** |
| **PRE-07** | Admin demo endpoint protection | `backend/routes/users.js` | POST `/api/users/demo-login` with `demoType: admin` returns 403 | **PASS** |
| **PRE-08** | Public `@touriva.test` signup blocked | `backend/models/User.js` | Public registration with `@touriva.test` returns 400 | **PASS** |
| **PRE-09** | Zero secrets in compiled assets | `frontEnd/**/dist` | Asset text search for passwords and DB URIs returns 0 matches | **PASS** |
| **PRE-10** | Confidential report git-ignored | `.gitignore` | `git status` does not stage `TOURIVA_DEMO_CREDENTIALS.md` | **PASS** |

---

## 2. Deployment Execution Checklist (Live Render Platform)

> [!NOTE]
> All steps in this section require explicit operator authorization before execution.

| Step ID | Deployment Task | Target Host / Service | Operator Command / Action | Status |
|:---:|---|---|---|:---:|
| **DEP-01** | Atomic Git commit created | Local `master` branch | `git commit -m "feat(demo): add dedicated demo users..."` | **MANUAL APPROVAL REQUIRED** |
| **DEP-02** | Git commit pushed to origin | GitHub `master` branch | `git push origin master` | **MANUAL APPROVAL REQUIRED** |
| **DEP-03** | Backend API deployed | Render `touriva-api` | Monitor deployment of latest commit SHA | **MANUAL APPROVAL REQUIRED** |
| **DEP-04** | Live API health verified | `https://touriva-api.onrender.com` | `curl -s https://touriva-api.onrender.com/api/health` | **MANUAL APPROVAL REQUIRED** |
| **DEP-05** | Live database seeded | MongoDB Atlas cluster | `npm run --prefix backend seed:demo-users` (remote URI) | **MANUAL APPROVAL REQUIRED** |
| **DEP-06** | Client web static site deployed | Render `touriva-web` | Clear build cache & deploy latest commit | **MANUAL APPROVAL REQUIRED** |
| **DEP-07** | Admin panel static site deployed | Render `touriva-admin` | Clear build cache & deploy latest commit | **MANUAL APPROVAL REQUIRED** |

---

## 3. Post-Deployment Smoke Verification Checklist (Live Production)

### 3.1 Customer Experience Verification (`https://touriva-web.onrender.com`)

| Step ID | Test Description | Expected Behavior | Verification Status |
|:---:|---|---|:---:|
| **SMK-01** | Navigate to `/login` | "Demo Accounts" card is prominently visible with "0 DA DEMO" badge | **PENDING DEPLOYMENT** |
| **SMK-02** | 1-Click Customer Demo Login | Clicking "Touriste / Client Démo" signs in instantly and redirects to `/tabs` | **PENDING DEPLOYMENT** |
| **SMK-03** | User Profile Validation | Top navigation displays "Demo Tourist" (`demo.customer@touriva.test`) | **PENDING DEPLOYMENT** |
| **SMK-04** | Package Discovery | Catalogs show packages: *Grand Circuit Tassili*, *Oran & Tlemcen*, *M’Zab* | **PENDING DEPLOYMENT** |
| **SMK-05** | My Reservations View | Navigating to `/myTrips` displays `TRV-BKG-DEMO01` (Paid) and `TRV-BKG-DEMO02` (Deposit paid) | **PENDING DEPLOYMENT** |
| **SMK-06** | RBAC Enforcement | Attempting to navigate directly to `/agency/dashboard` redirects to `/home` (Forbidden) | **PENDING DEPLOYMENT** |
| **SMK-07** | Logout | Clicking Log Out clears user session and redirects to `/login` | **PENDING DEPLOYMENT** |

---

### 3.2 Agency Director Operations Verification (`https://touriva-web.onrender.com/agency`)

| Step ID | Test Description | Expected Behavior | Verification Status |
|:---:|---|---|:---:|
| **SMK-08** | 1-Click Agency Demo Login | Clicking "Directeur d'Agence Démo" signs in and redirects to `/agency/dashboard` | **PENDING DEPLOYMENT** |
| **SMK-09** | Accreditation Banner | Banner confirms agency officially accredited ("Agence Officiellement Agréée") | **PENDING DEPLOYMENT** |
| **SMK-10** | Company Profile | Header displays "Touriva Horizons Voyages & Tourisme" | **PENDING DEPLOYMENT** |
| **SMK-11** | Package Management | `/agency/packages` displays 3 active published circuits | **PENDING DEPLOYMENT** |
| **SMK-12** | Departure Calendar | `/agency/departures` shows departure `2026-11-10` (Cap: 14, Booked: 5, Left: 9) | **PENDING DEPLOYMENT** |
| **SMK-13** | Passenger Manifest | Clicking "Voir Manifeste" opens official attendance sheet with traveler names & phones | **PENDING DEPLOYMENT** |
| **SMK-14** | Grand Livre Ledger | `/agency/financials` displays verified collections (`490,000 DA`) and BaridiMob proofs | **PENDING DEPLOYMENT** |
| **SMK-15** | Cash Desk Intake | Agency can record manual cash receipts at the agency counter | **PENDING DEPLOYMENT** |
| **SMK-16** | Tailor-Made Enquiries | `/agency/enquiries` displays custom request `TRV-ENQ-DEMO01` and formal quotation | **PENDING DEPLOYMENT** |
| **SMK-17** | RBAC Enforcement | Agency account cannot access `/admin` or `/billing` (Platform admin endpoints) | **PENDING DEPLOYMENT** |

---

### 3.3 Platform Administrator Supervision Verification (`https://touriva-admin.onrender.com`)

| Step ID | Test Description | Expected Behavior | Verification Status |
|:---:|---|---|:---:|
| **SMK-18** | Navigate to Admin Login | Page displays "Touriva Demo Administrator" pre-fill option | **PENDING DEPLOYMENT** |
| **SMK-19** | Pre-Fill Email | Clicking button populates `demo.admin@touriva.test` into the email field | **PENDING DEPLOYMENT** |
| **SMK-20** | Secure Password Login | Entering authorized password from private report authenticates to `/dashboard` | **PENDING DEPLOYMENT** |
| **SMK-21** | Platform KPI Metrics | Dashboard shows system statistics across wilayas, agencies, and users | **PENDING DEPLOYMENT** |
| **SMK-22** | Partner Accreditation Audit | Admin can inspect agency documents (RC, NIF, License) and approve/reject dossiers | **PENDING DEPLOYMENT** |
| **SMK-23** | Global Financial Oversight | Admin can review aggregate platform billing and agency financial volume | **PENDING DEPLOYMENT** |
| **SMK-24** | Session Logout | Admin sign-out destroys JWT in local storage and redirects to `/login` | **PENDING DEPLOYMENT** |

---

## 4. Final Sign-Off Criteria for Client Presentation

Before presenting Touriva to prospective travel agencies, verify that:
- [x] All 244 backend automated tests pass locally.
- [x] All 18 frontend automated tests pass locally.
- [x] Both frontends compile with 0 errors.
- [x] Demo data is strictly fictional (no real customer PII or real bank transactions).
- [ ] Backend API deployed to Render and returns HTTP 200 on health check.
- [ ] Live database seeded with demo accounts via idempotent seeder.
- [ ] Client web and Admin static sites deployed to Render.
- [ ] Live smoke verification passes for Tourist, Agency, and Admin personas.
