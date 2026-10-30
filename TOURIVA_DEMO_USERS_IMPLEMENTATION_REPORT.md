# Touriva — Dedicated Demo Users & Exploration System Implementation Report

**Project:** Touriva Core Tourism Platform & Administration Panel  
**Repository:** `Bouafia19/touriva`  
**Branch:** `master`  
**Date:** October 2026  
**Status:** **Completed & Verified**

---

## Executive Summary

To enable prospective travel-agency owners, tour operators, and municipal tourism committees in Algeria to thoroughly explore the Touriva platform without exposing real customer information or compromising platform administrative security, a dedicated suite of fictional demo accounts and realistic operational demo data has been implemented.

This implementation delivers:
1. **Public Web Demo Accounts:** Dedicated accounts for **Tourist / Customer** (`demo.customer@touriva.test`) and **Agency Director** (`demo.agency@touriva.test`), equipped with secure demo passwords and accessible via both explicit credentials and 1-click seamless demo access.
2. **Platform Administrator Demo Account:** A dedicated **Touriva Demo Administrator** (`demo.admin@touriva.test`) configured strictly under the existing CASL authorization system with full audit capabilities, completely protected from public exposure.
3. **Realistic Fictional Tourism Dataset:** Fully articulated Algerian excursion packages (Saharan expeditions in Djanet, coastal heritage in Oran/Tlemcen, and oasis urbanism in Ghardaïa), scheduled departures, passenger manifests, tailor-made enquiries/quotations, and a multi-channel financial ledger (CIB, BaridiMob, CCP, and agency cash desk).
4. **Enhanced Demo Login Experience:** Distinct, clearly labeled "Demo Accounts" sections on both public web (`/login`) and administration (`/login`) portals.
5. **Database & Deployment Safety:** 100% idempotent seeder (`npm run --prefix backend seed:demo-users`), zero destruction of existing real users, non-exposure of passwords in client-side bundles, and strict domain reservation blocking `@touriva.test` on public registration.
6. **Comprehensive Verification:** 244 backend unit/integration tests passing (100% green), including 23 new dedicated demo tests, and 18 frontend tests passing.

---

## 1. Demo Accounts & Role Architecture

```
+-------------------------------------------------------------------------------------------------------------------------+
|                                              TOURIVA DEMO USER MATRIX                                                   |
+--------------------------+----------------------------+---------------+----------------------+--------------------------+
| Role Description         | Email Address              | Phone Number  | Model Role / Type    | Assigned Permissions     |
+--------------------------+----------------------------+---------------+----------------------+--------------------------+
| Tourist / Customer       | demo.customer@touriva.test | +213550000020 | client / visitor     | Package discovery,       |
| (Demo Tourist)           |                            | (0550000020)  |                      | booking intake, proof    |
|                          |                            |               |                      | uploads, personal trips  |
+--------------------------+----------------------------+---------------+----------------------+--------------------------+
| Agency Director          | demo.agency@touriva.test   | +213550000021 | partner /            | Agency operations room,  |
| (Demo Agency)            |                            | (0550000021)  | touristAgencies      | package creation,        |
|                          |                            |               |                      | departure manifests,     |
|                          |                            |               |                      | BaridiMob cash ledger    |
+--------------------------+----------------------------+---------------+----------------------+--------------------------+
| Platform Administrator   | demo.admin@touriva.test    | +213550000022 | administrator /      | Full CASL permissions    |
| (Touriva Demo Admin)     |                            | (0550000022)  | others               | across all 23 platform   |
|                          |                            |               |                      | management subjects      |
+--------------------------+----------------------------+---------------+----------------------+--------------------------+
```

### Password & Credential Storage Policy
All demo passwords use bcrypt password hashing with salt rounds of 10 (`bcrypt.hash(password, 10)`). Actual plaintext passwords and authentication tokens are documented exclusively in the confidential report:
- `TOURIVA_DEMO_CREDENTIALS.md` (Git-ignored and strictly excluded from public frontend bundles).

---

## 2. Realistic Fictional Tourism Dataset

To allow prospective travel agency clients to experience real-world workflows, the demo dataset incorporates Algerian geography, regulatory requirements, and local financial settlement channels:

```
                                      TOURIVA DEMO WORKFLOW ARCHITECTURE

   [ Demo Tourist ]                                                     [ Demo Agency: Touriva Horizons ]
   demo.customer@touriva.test                                            demo.agency@touriva.test
          |                                                                         |
          | 1. Explore Packages & Departures                                        | 1. Operates Control Room
          +------------------------------------------------------------------------>|    - Package: Tassili n'Ajjer (7d)
          |                                                                         |    - Package: Oran & Tlemcen (4d)
          | 2. Book Seats on Djanet Departure (TRV-BKG-DEMO01)                      |    - Package: Vallée du M'Zab (5d)
          |    Manifest: [ Demo Tourist, Amina Tourist ]                            |
          +------------------------------------------------------------------------>| 2. Receives Booking in Manifest
          |                                                                         |    Capacity: 14 | Booked: 5 | Left: 9
          | 3. Pay via CIB / Submit BaridiMob Proof (TRV-PAY-DEMO02)                |
          +------------------------------------------------------------------------>| 3. Audits Proof & Validates Receipt
          |                                                                         |    Ledger: 15,000 DA BaridiMob Verified
          | 4. Custom Enquiry for 4 Travelers (TRV-ENQ-DEMO01)                      |
          +------------------------------------------------------------------------>| 4. Responds with Tailored Quotation
          |                                                                         |    (360,000 DA with 4x4 & VIP Camp)
```

### 2.1 Tourism Packages Created by Demo Agency
1. **Grand Circuit Tassili n'Ajjer & Cités de Pierre**
   - **Destination:** Djanet (Parc National du Tassili n'Ajjer, UNESCO)
   - **Duration & Price:** 7 days / 6 nights | `95 000 DZD`
   - **Itinerary:** Complete 7-day GPS coordinates covering Tin Khatma, Tikobaouine arch, and Saharan bivouacs.
   - **Deposit Rules:** Fixed deposit of `25 000 DZD`.
   - **Inclusions:** 4x4 transport, Tuareg drivers and cooks, full pension, camping gear, airport transfers.
2. **Échappée Côtière Oranaise & Palais Zianides de Tlemcen**
   - **Destination:** Oran & Tlemcen
   - **Duration & Price:** 4 days / 3 nights | `42 000 DZD`
   - **Theme:** Heritage, Ottoman and Zianid architecture, Fort Santa Cruz, Palais El Mechouar.
   - **Deposit Rules:** Fixed deposit of `15 000 DZD`.
3. **Trésors Oasiens du M'Zab & Palmeraies de Ghardaïa**
   - **Destination:** Ghardaïa (Vallée du M'Zab, UNESCO)
   - **Duration & Price:** 5 days / 4 nights | `48 000 DZD`
   - **Deposit Rules:** 30% percentage deposit (`14 400 DZD`).

### 2.2 Scheduled Departures & Passenger Manifests
- **Djanet Session 1:** Departure `2026-11-10` | Capacity: 14 passengers | Booked: 5 | Status: `guaranteed`
- **Djanet Session 2:** Departure `2026-11-30` | Capacity: 14 passengers | Booked: 0 | Status: `scheduled`
- **Oran Session 1:** Departure `2026-11-15` | Capacity: 16 passengers | Booked: 1 | Status: `scheduled`
- **Ghardaïa Session 1:** Departure `2026-11-22` | Capacity: 12 passengers | Booked: 2 | Status: `scheduled`

### 2.3 Bookings & Passenger Manifest Integrity
- **Booking `TRV-BKG-DEMO01` (Customer: Demo Tourist):**
  - Excursion: Tassili n'Ajjer Departure `2026-11-10`.
  - Seats: 2 passengers (`Demo Tourist` and `Amina Tourist`).
  - Manifest Data: Special notes (*"Régime végétarien / photographe amateur"*), emergency contact phone numbers.
  - Financial Status: `paid` (Full settlement of `190 000 DZD` via Satim CIB).
- **Booking `TRV-BKG-DEMO02` (Customer: Demo Tourist):**
  - Excursion: Oran & Tlemcen Departure `2026-11-15`.
  - Seats: 1 passenger (`Demo Tourist`).
  - Financial Status: `partially_paid` (`15 000 DZD` deposit verified via BaridiMob `MOB-882190`, `27 000 DZD` balance due).
- **Booking `TRV-BKG-DEMO03` (In-Agency Desk Client: Yacine Belkacem):**
  - Excursion: Tassili n'Ajjer Departure `2026-11-10`.
  - Seats: 3 passengers (Adults + child).
  - Financial Status: `paid` (`285 000 DZD` settled in cash at agency desk, receipt `CSH-REC-2026-0042`).
- **Booking `TRV-BKG-DEMO04` (Pending Traveler: Samira Haddad):**
  - Excursion: Ghardaïa Departure `2026-11-22`.
  - Seats: 2 passengers.
  - Financial Status: `unpaid` (BaridiMob receipt `MOB-993841` submitted for `30 000 DZD`, pending agency audit).

### 2.4 Tailor-Made Enquiries & Quotations
- **Enquiry `TRV-ENQ-DEMO01`:** Submitted by `demo.customer@touriva.test` for a 4-person private photographic Sahara expedition to Oued Djerat. Status: `quoted` with formal offer of `360 000 DZD` valid for 15 days.
- **Enquiry `TRV-ENQ-DEMO02`:** Submitted by an architectural association for an 8-person cultural tour in Ghardaïa. Status: `requested`.

---

## 3. Demo Login Experience

### 3.1 Public Web Application (`frontEnd/touriva/src/views/user/Login.vue`)
The public login experience was upgraded to maximize ease-of-use for prospective travel agency evaluators while guaranteeing authentication integrity:

1. **Clearly Labeled "Demo Accounts" Card:**
   - Positioned prominently at the top of the login container.
   - Distinct badges (`DEMO ACCESS`).
   - Interactive options:
     - **👤 Touriste / Client Démo:** `demo.customer@touriva.test`
     - **🏢 Directeur d'Agence Démo:** `demo.agency@touriva.test`
   - Clicking either option executes `auth.demoSignIn(role)`:
     - Tourist demo automatically directs to traveler tabs (`/tabs`).
     - Agency demo automatically directs to the operational agency control room (`/agency/dashboard`).
2. **Dual-Mode Manual Authentication:**
   - Input field updated to accept either **Phone Number** (`0550 12 34 56`) or **Email Address** (`demo.customer@touriva.test`).
   - Allows prospective evaluators to type demo credentials manually if desired.
3. **No Credential Leakage in Frontend Bundles:**
   - Client-side code does NOT store plaintext passwords.
   - The backend validates demo requests and signs authentic JWT tokens using server-side secrets.

### 3.2 Admin Panel (`frontEnd/touriva_adminPanel/src/views/auth/Login.vue`)
1. **Isolated Administrator Demo Card:**
   - Clearly labeled **Touriva Demo Administrator**.
   - One-click helper populates the email field with `demo.admin@touriva.test`.
   - Explanatory guidance instructs evaluators to enter the password from the private report.
2. **Strict Security Isolation:**
   - The backend `POST /api/users/demo-login` explicitly rejects `admin` or `administrator` requests with **`403 Forbidden`**.
   - Administrative login requires standard cryptographic verification against bcrypt password hashes via `POST /api/users/login`.
   - Admin credentials are never exposed in public web assets or source code.

---

## 4. Database & Deployment Safety Verification

| Safety Requirement | Status | Technical Enforcement |
|---|---|---|
| **Idempotency** | **VERIFIED** | Upsert queries compare by unique fields (`email`, `bookingReference`, `paymentReference`, `enquiryReference`). Running seeder repeatedly produces identical record counts. |
| **No Production Overwrites** | **VERIFIED** | Strictly scoped to `@touriva.test` accounts. Real customer and partner accounts are never touched. |
| **Domain Reservation** | **VERIFIED** | `User.signup` and `User.signupWeb` reject any registration attempting to use `@touriva.test` with a `400 Bad Request`. |
| **Password Hashing** | **VERIFIED** | Standard bcrypt with 10 salt rounds used for all accounts. |
| **CASL Ability Mapping** | **VERIFIED** | Admin demo user receives exact matching abilities for all 23 subjects; no superuser bypasses. |
| **Frontend Bundle Hygiene** | **VERIFIED** | Audited compiled production bundles (`dist/`). Zero secrets, passwords, or database URIs detected. |

---

## 5. Test Suite & Verification Results

### 5.1 Dedicated Demo Test Suite (`backend/tests/demo_users.test.js`)
All 23 dedicated tests pass without error:

```
PASS tests/demo_users.test.js
  Touriva Demo Users & Role Authorization Suite
    1. Public Web Demo Authentication
      ✓ 1.1: Customer can log in via standard POST /api/users/login with email & password (106 ms)
      ✓ 1.2: Customer can log in via standard POST /api/users/login with phone & password (64 ms)
      ✓ 1.3: Customer can authenticate via dedicated POST /api/users/demo-login (1-Click) (15 ms)
      ✓ 1.4: Agency Director can log in via standard POST /api/users/login with email & password (61 ms)
      ✓ 1.5: Agency Director can authenticate via dedicated POST /api/users/demo-login (1-Click) (13 ms)
    2. Administrator Demo Authentication & Security Isolation
      ✓ 2.1: Administrator can log in via standard POST /api/users/login with credentials & role (72 ms)
      ✓ 2.2: CRITICAL SECURITY: POST /api/users/demo-login strictly forbids admin requests (403) (17 ms)
      ✓ 2.3: POST /api/users/demo-login rejects invalid demoType with 400 (10 ms)
    3. Database & Registration Safety
      ✓ 3.1: Public signup rejects registration using @touriva.test domain (18 ms)
      ✓ 3.2: Web signup rejects registration using @touriva.test domain (10 ms)
    4. Role-Based Access Isolation
      ✓ 4.1: Customer is forbidden from accessing agency profile (403) (13 ms)
      ✓ 4.2: Customer is forbidden from accessing agency financial dashboard (403) (10 ms)
      ✓ 4.3: Customer is forbidden from accessing admin billing (403) (11 ms)
      ✓ 4.4: Agency Director can access agency profile & metrics (39 ms)
      ✓ 4.5: Agency Director can access packages list (24 ms)
      ✓ 4.6: Agency Director can access agency financial dashboard (36 ms)
      ✓ 4.7: Agency Director is forbidden from admin platform billing (403) (13 ms)
      ✓ 4.8: Administrator can access global platform billing & agency financials (76 ms)
    5. Realistic Fictional Demo Data Validation
      ✓ 5.1: Demo Agency departures contain valid capacity & booked passenger counts (9 ms)
      ✓ 5.2: Demo bookings contain full passenger manifests (4 ms)
      ✓ 5.3: Partially paid booking accurately reflects deposit and balance due (4 ms)
      ✓ 5.4: Custom enquiries and agency quotations are available (4 ms)
    6. Idempotency & Persistence Safety
      ✓ 6.1: Running seedDemoUsersAndData multiple times does not duplicate accounts or records (577 ms)

Test Suites: 1 passed, 1 total
Tests:       23 passed, 23 total
Snapshots:   0 total
Time:        3.148 s
```

### 5.2 Global Platform Test Suites
- **Backend API Test Suites:** **12 passed, 12 total** (244 tests passing, 0 failing).
- **Frontend Client Test Suites:** **2 passed, 2 total** (18 tests passing, 0 failing).
- **Production Build Status:** Both `frontEnd/touriva` and `frontEnd/touriva_adminPanel` compile cleanly with `vite build` (0 build errors).

---

## 6. Deliverables & File Changes Summary

1. `TOURIVA_DEMO_CREDENTIALS.md`: Private credentials file containing demo emails, passwords, phones, roles, and administrative details (excluded from git tracking).
2. `TOURIVA_DEMO_USERS_IMPLEMENTATION_REPORT.md`: This comprehensive implementation and verification document.
3. `backend/seed/seed_demo_users.js`: Standalone idempotent seeder creating demo users, packages, departures, passenger manifests, financial transactions, and custom quotations.
4. `backend/models/User.js`: Hardened `signup` and `signupWeb` static methods to reserve `@touriva.test`.
5. `backend/controllers/usersController.js`: Implemented `demoLogin` controller with strict 403 enforcement against administrative requests.
6. `backend/routes/users.js`: Added `/api/users/demo-login` route.
7. `backend/package.json`: Added `seed:demo-users` script.
8. `scripts/seed_all.js`: Integrated `seed_demo_users.js` into master seed pipeline.
9. `frontEnd/touriva/src/views/user/Login.vue`: Added interactive demo accounts card, 1-click tourist and agency sign-in, and phone/email dual input support.
10. `frontEnd/touriva/src/stores/auth.js`: Added `demoSignIn(demoType)` action with automatic routing to `/agency/dashboard` or `/tabs`.
11. `frontEnd/touriva_adminPanel/src/views/auth/Login.vue`: Added demo administrator card with quick-fill helper and guidance.
12. `frontEnd/touriva/src/lang/{en,fr,ar}.js` & `frontEnd/touriva_adminPanel/src/lang/{en,fr,ar}.js`: Complete bilingual/trilingual localization for demo login elements.
13. `backend/tests/demo_users.test.js`: 23 comprehensive tests covering login, security boundaries, role isolation, data integrity, and idempotency.

---

## 7. Conclusion

Prospective travel agency clients, tour operators, and platform evaluators can now immediately experience Touriva's end-to-end capabilities across both the public travel portal and the dedicated administrative suite. All operations maintain full cryptographic authentication, strict multi-tenant authorization, complete protection of production data, and absolute isolation of administrative credentials.
