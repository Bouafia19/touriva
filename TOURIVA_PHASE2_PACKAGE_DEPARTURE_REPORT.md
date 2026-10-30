# Touriva — Phase 2: Package & Departure Management Report

**Date:** October 29, 2026  
**Project:** Touriva — Algerian Tourism Platform  
**Workspace:** `/home/next/next projects/touriva`  
**Git Branch:** `master` (All Phase 1 & Phase 2 changes preserved, uncommitted)  
**Deliverable Status:** **Completed & Verified**

---

## 1. Executive Summary

Phase 2 builds directly upon the Phase 1 security hardening and verification foundation to deliver a comprehensive **Excursion Package & Scheduled Departure Management** capability for verified Algerian tourism agencies.

Key accomplishments in this phase:
1. **Separation of Packages and Scheduled Departures:** Excursion packages (itineraries, inclusions, exclusions, policies) are decoupled from calendar dates via a dedicated `TripDeparture` model. This preserves backward compatibility for existing tourist-planned itineraries while supporting recurring departures.
2. **Dedicated Agency Workspace (`/agency/*`):** Created an agency management interface inside `frontEnd/touriva`, styled with the Touriva Mediterranean/Sahara visual identity (deep emerald `#102D27`, warm ivory `#FAF8F2`, and desert sand `#D9B98C`).
3. **Operational Capabilities for Agencies:**
   - Operational dashboard with live metrics, accreditation status alerts, and quick actions.
   - Package catalog with full CRUD, status controls (`published`, `pending`, `paused`, `archived`), Wilaya targeting, and rich editorial fields.
   - Departure scheduling manager with start/end date validation, positive DZD pricing, seat capacity progress tracking, and mandatory-reason cancellation workflows.
4. **Tourist Discovery & Direct Agency Contact:**
   - Redesigned `TripDetail.vue` with dynamic scheduled departure selection, accreditation badges (`Agence Agréée Ministère du Tourisme`), inclusions/exclusions checklists, and direct Algerian WhatsApp contact links (`wa.me/213...`).
   - Enhanced `TripCard.vue` with agency badge indicators.
5. **Strict Authorization & Data Isolation:**
   - Server-enforced ownership: agencies cannot view, modify, delete, or schedule departures for packages owned by other agencies (403/404 IDOR prevention).
   - Unverified agencies (`fileStatus: 'pending'` or `'rejected'`) are blocked from publishing packages and scheduling departures.
6. **Automated Verification:**
   - 28/28 new automated Phase 2 regression tests passing in `backend/tests/agency_packages_phase2.test.js`.
   - 118/118 total backend tests passing (including Phase 1 security tests).
   - 18/18 frontend Vitest tests passing.
   - Production Vite build (`npm --prefix frontEnd/touriva run build`) passing cleanly with zero errors.

---

## 2. Data Models & Schema Design

### 2.1 Enhanced `Trip.js` (`backend/models/Trip.js`)
Existing fields (`name`, `price`, `creator`, `days`, `items`, `destination`) were preserved for legacy compatibility, and the schema was enriched with:

| Field | Type | Description |
| :--- | :--- | :--- |
| `description` | `String` | Detailed itinerary summary (trimmed) |
| `inclusions` | `[String]` | Array of included amenities (transport, meals, local guide) |
| `exclusions` | `[String]` | Array of items not covered (flights, personal expenses) |
| `cancellationPolicy`| `String` | Free cancellation window and terms |
| `meetingPoint` | `String` | Default assembly point and departure instructions |
| `durationDays` | `Number` | Duration in days (default: 1, min: 1) |
| `theme` | `String` | Excursion category (e.g. Sahara, Cultural, Coastal, Trekking) |
| `photos` | `[String]` | Array of high-resolution showcase image URLs |
| `status` | `String` (enum)| `['created', 'pending', 'published', 'paused', 'archived']` |

*Compatibility Note:* Tourist-created itineraries retain `status: 'created'` and are excluded from public agency package feeds by default (`published: true` filter).

### 2.2 Dedicated `TripDeparture.js` (`backend/models/TripDeparture.js`)
A dedicated Mongoose model managing recurring calendar departures for packages:

```javascript
const tripDepartureSchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
  agency: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  priceDZD: { type: Number, required: true, min: [0, 'Price must be non-negative'] },
  capacity: { type: Number, required: true, min: [1, 'Capacity must be at least 1'] },
  bookedSeats: { type: Number, default: 0, min: [0, 'Booked seats cannot be negative'] },
  minGroupSize: { type: Number, default: 1, min: 1 },
  meetingPoint: { type: String, trim: true },
  departureInstructions: { type: String, trim: true },
  status: {
    type: String,
    enum: ['scheduled', 'guaranteed', 'completed', 'cancelled'],
    default: 'scheduled',
    index: true
  },
  cancellationReason: { type: String, trim: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})
```

#### Schema Invariants & Protections:
1. **Virtual `availableSeats`:** Computed automatically as `Math.max(0, this.capacity - (this.bookedSeats || 0))`.
2. **Pre-Save Date Validation:** Enforces `endDate >= startDate`. Rejects invalid intervals with HTTP 400.
3. **Pre-Save Capacity Protection:** Prevents updating `capacity` to a value lower than currently `bookedSeats`.
4. **Compound Indexes:**
   - `{ trip: 1, startDate: 1, status: 1 }` for rapid tourist package calendar lookups.
   - `{ agency: 1, status: 1, startDate: 1 }` for agency schedule filtering.

---

## 3. Backend API Routes & Controllers

Mounted at `/api/agency` in `backend/server.js`, protected by `requireAuth` and `requireRole('partner', 'administrator')`:

### 3.1 Agency Management API (`backend/routes/agency.js`)

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/agency/profile` | Auth + Agency/Admin | Retrieves agency accreditation, fileStatus, and live metrics |
| `GET` | `/api/agency/packages` | Auth + Agency/Admin | Lists agency-owned packages (supports `?status=` filter) |
| `POST` | `/api/agency/packages` | `requireAgencyVerified` | Creates a new excursion package with Wilaya, inclusions, DZD price |
| `GET` | `/api/agency/packages/:id` | Auth + Agency/Admin | Retrieves package details with its full departure schedule |
| `PATCH` | `/api/agency/packages/:id` | Auth + Agency/Admin | Updates package metadata, price, status, or itinerary |
| `DELETE`| `/api/agency/packages/:id` | Auth + Agency/Admin | Deletes package and unbooked departures (or archives if booked) |
| `GET` | `/api/agency/departures` | Auth + Agency/Admin | Lists scheduled departures (supports `?trip=`, `?status=`, `?upcoming=true`) |
| `POST` | `/api/agency/departures` | `requireAgencyVerified` | Schedules a departure session for an agency-owned package |
| `PATCH` | `/api/agency/departures/:id`| Auth + Agency/Admin | Updates departure dates, price, meeting point, or capacity |
| `POST` / `PATCH` | `/api/agency/departures/:id/cancel` | Auth + Agency/Admin | Cancels departure with mandatory `cancellationReason` |
| `DELETE`| `/api/agency/departures/:id` | Auth + Agency/Admin | Deletes departure only if `bookedSeats === 0` |

### 3.2 Public Tourist Discovery Endpoints (`backend/routes/trips.js`)

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/trips?published=true` | Public | Lists published packages, populating creator `companyName` & `fileStatus` |
| `GET` | `/api/trips/:id/departures` | Public | Returns upcoming active (`scheduled`, `guaranteed`) departures with `availableSeats` |

---

## 4. Frontend Architecture & Agency Workspace

### 4.1 Route Hierarchy (`frontEnd/touriva/src/router/index.js`)
All agency routes are grouped under the `/agency` route tree, utilizing a dedicated `AgencyLayout` and guarded by `meta.requiresAgency`:

- `/agency/dashboard` — [`AgencyDashboard.vue`](file:///home/next/next%20projects/touriva/frontEnd/touriva/src/views/agency/AgencyDashboard.vue)
- `/agency/packages` — [`AgencyPackages.vue`](file:///home/next/next%20projects/touriva/frontEnd/touriva/src/views/agency/AgencyPackages.vue)
- `/agency/packages/new` — [`AgencyPackageEdit.vue`](file:///home/next/next%20projects/touriva/frontEnd/touriva/src/views/agency/AgencyPackageEdit.vue)
- `/agency/packages/:id/edit` — [`AgencyPackageEdit.vue`](file:///home/next/next%20projects/touriva/frontEnd/touriva/src/views/agency/AgencyPackageEdit.vue)
- `/agency/departures` — [`AgencyDepartures.vue`](file:///home/next/next%20projects/touriva/frontEnd/touriva/src/views/agency/AgencyDepartures.vue)

### 4.2 State Management (`frontEnd/touriva/src/stores/agency.js`)
Pinia store `useAgencyStore` centralizes:
- Agency verification status (`isVerified`, `fileStatus`, `rejectionReason`).
- Metric counters (`totalPackages`, `publishedPackages`, `activeDeparturesCount`, `totalBookedTravelers`).
- Package catalog and departures collection CRUD with reactive optimistic updates and error state handling.

### 4.3 Key Views Implemented
1. **`AgencyLayout.vue`:**
   - Emerald top-bar and collapsible navigation drawer.
   - Accreditation pill badge (`Agréée Ministère` vs `Dossier en Cours de Validation`).
   - One-click navigation to tourist portal and direct support.
2. **`AgencyDashboard.vue`:**
   - Verification alert with direct resubmission link if rejected.
   - 4 live metric cards (Packages, Scheduled Departures, Travelers, Published ratio).
   - Quick action shortcuts ("Nouveau Circuit", "Planifier Départ").
   - Split view of recent packages and next departures with seat utilization meters.
3. **`AgencyPackages.vue`:**
   - Filter tabs: Tous, Publiés, Brouillons, En Pause, Archivés.
   - Search by package name or destination.
   - Quick actions: view, edit, toggle pause/publish, archive.
4. **`AgencyPackageEdit.vue`:**
   - 4-tab structured builder: Informations Générales, Détails & Logistique, Programme Journalier, Tarification & Statut.
   - Wilayas of Algeria dropdown with auto-loading.
   - Dynamic tag inputs for Inclusions and Exclusions.
   - Day-by-day step editor with step title and description.
5. **`AgencyDepartures.vue`:**
   - Departure calendar table with date formatting (`DD/MM/YYYY`), seat progress indicators (`booked / capacity`), and status chips.
   - "Planifier un Départ" modal with package selector, date pickers, seat capacity, and DZD pricing.
   - "Annuler la Session" modal requiring explicit cancellation reason.

### 4.4 Tourist Discovery Integration
1. **`TripDetail.vue`:**
   - Accreditation badge displayed next to agency name (`mdi-check-decagram`).
   - WhatsApp direct contact button formatted with Algerian international prefix `+213` and prefilled inquiry message.
   - Dedicated "Sessions de Départ Programmées" card displaying upcoming dates, available seats, and meeting points.
   - Reservation dialog pre-populates the selected departure session.
2. **`TripCard.vue`:**
   - Identifies agency-owned excursions and displays company name with verified badge icon.
3. **`MainLayout.vue`:**
   - Dynamically adds "Espace Agence" link to both desktop user dropdown and mobile drawer for agency accounts.

---

## 5. Security & Isolation Guarantees

| Vulnerability Vector | Defense Mechanism | Verified in Test |
| :--- | :--- | :--- |
| **Unauthenticated API Access** | `requireAuth` rejects requests lacking valid Bearer JWT with 401 | `agency_packages_phase2.test.js: 1.1` |
| **Client Role Privilege Escalation** | `requireRole('partner', 'administrator')` rejects client requests with 403 | `agency_packages_phase2.test.js: 1.2` |
| **Unverified Agency Publishing** | `requireAgencyVerified` middleware rejects pending/rejected agencies from POST routes with 403 | `agency_packages_phase2.test.js: 2.1, 4.1` |
| **Cross-Agency IDOR (Packages)** | Controller checks `trip.creator === req.user._id`; denies foreign package access with 403/404 | `agency_packages_phase2.test.js: 3.4, 3.5` |
| **Cross-Agency IDOR (Departures)** | Controller checks `trip.creator === req.user._id` before departure creation; denies foreign departure modification with 403/404 | `agency_packages_phase2.test.js: 4.2, 4.8` |
| **Creator / Agency Spoofing** | Server always sets `creator = req.user._id` and `agency = req.user._id`, ignoring client-submitted IDs in request body | `agency_packages_phase2.test.js: 2.5` |
| **Invalid Dates Invariant** | Schema and controller reject departures where `endDate < startDate` with 400 | `agency_packages_phase2.test.js: 4.3` |
| **Capacity & Seat Integrity** | Controller and schema reject non-positive capacity and prevent lowering capacity below already `bookedSeats` | `agency_packages_phase2.test.js: 4.4` |
| **Unaccounted Cancellations** | Cancellation endpoint requires non-empty `cancellationReason` (min 5 characters) | `agency_packages_phase2.test.js: 5.1, 5.2` |
| **Cancelled Departure Leakage** | Public `/api/trips/:id/departures` excludes cancelled departures by default | `agency_packages_phase2.test.js: 6.2` |

---

## 6. Verification & Automated Test Results

### 6.1 Backend Test Results (`npm --prefix backend test`)
```
Test Suites: 8 passed, 8 total
Tests:       118 passed, 118 total
Snapshots:   0 total
Time:        5.483 s

PASS tests/agency_security_phase1.test.js (33 tests)
PASS tests/agency_packages_phase2.test.js (28 tests)
PASS tests/critical_security_audit.test.js (20 tests)
PASS tests/auth_and_users.test.js (10 tests)
PASS tests/trips_and_subscriptions.test.js (5 tests)
PASS tests/shop.test.js (6 tests)
PASS tests/tourism_services.test.js (5 tests)
PASS tests/health.test.js (2 tests)
```

### 6.2 Frontend Test Results (`npm --prefix frontEnd/touriva test`)
```
Test Files  2 passed (2)
Tests       18 passed (18)
Duration    2.59s

PASS src/__tests__/branding_and_config.test.js (3 tests)
PASS src/__tests__/osm_map_stack.test.js (15 tests)
```

### 6.3 Frontend Production Build (`npm --prefix frontEnd/touriva run build`)
```
vite v7.3.7 building client environment for production...
896 modules transformed.
dist/index.html                                  1.55 kB
dist/assets/AgencyLayout-DorDMSaD.js             5.12 kB
dist/assets/agency-kkImUpHp.js                   5.65 kB
dist/assets/AgencyPackages-DxFIF_jx.js          10.20 kB
dist/assets/AgencyDashboard-COcusqG1.js         11.70 kB
dist/assets/AgencyPackageEdit-BPk4AZMJ.js       16.34 kB
dist/assets/AgencyDepartures-Cr1eNGUq.js        18.94 kB
dist/assets/TripDetail-Dnpuje63.js              20.20 kB
dist/assets/TripsList-C5QqMjvC.js                9.27 kB
dist/assets/TripCard-xxx.js                      ...
✓ built in 7.93s with 0 errors
```

---

## 7. Manual Walkthrough & QA Verification Guide

### Scenario A: Verified Agency Creates Package and Departure
1. **Login:** Authenticate as an approved agency account (`typeAccount: 'touristAgencies'`, `fileStatus: 'confirmed'`).
2. **Access Dashboard:** Click avatar menu -> "Espace Agence" or navigate directly to `/agency/dashboard`. Confirm verification badge shows green "Agence Agréée Ministère".
3. **Create Package:**
   - Click "Nouveau Circuit" or navigate to `/agency/packages/new`.
   - Enter title (e.g. `Circuit Gourara & Timimoun`), select Wilaya (Adrar), set price in DZD (e.g. `42000`), duration (4 days).
   - In "Détails & Logistique", add inclusions (`Hôtel 3*`, `Transport 4x4`, `Pension Complète`) and exclusions (`Vols`).
   - In "Tarification & Statut", select `Publié sur le catalogue`.
   - Click "Publier l'Excursion".
4. **Schedule Departure:**
   - Navigate to `/agency/departures`.
   - Click "Planifier un Départ".
   - Select the newly created package, departure date, return date, seat capacity (e.g. `16`), and meeting point.
   - Click "Créer le Départ". Verify the departure appears in the schedule table with status `Programmée` and `0 / 16 places réservées`.

### Scenario B: Public Tourist Browsing & Reservation
1. **Public Catalog:** Navigate to `/trips` without logging in.
2. **Card Inspection:** Locate the new package card. Verify the agency's company name and verified badge icon appear.
3. **Trip Details:** Click "Voir le détail".
   - Verify the "Sessions de Départ Programmées" card lists the scheduled departure with available seat count.
   - Click "Contacter l'Agence" to verify the WhatsApp URL opens with the agency phone and encoded trip title.
   - Click "Réserver cette excursion", select the departure from the dropdown, fill traveler details, and submit.

### Scenario C: Agency Departure Cancellation
1. Back in `/agency/departures`, locate the scheduled departure.
2. Click the cancellation icon (ban symbol).
3. Confirm that the dialog rejects submission if the reason field is empty.
4. Enter reason (e.g. `Report météo suite à alerte canicule`) and confirm cancellation.
5. Verify the departure status updates to `Annulée`.
6. Return to the public `TripDetail.vue` page and verify the cancelled departure is immediately hidden from tourist selection.

---

## 8. Transition to Phase 3

With Phase 2 successfully completed, the foundation is ready for **Phase 3: Booking Management, Customer Inquiries & Manifests**:

1. **Structured Booking State Engine:**
   - Transition from simple notification records to full booking lifecycle: `requested` -> `confirmed` / `rejected` -> `completed` / `cancelled`.
2. **Passenger Manifest & Identity:**
   - Collection of mandatory Algerian passenger manifest data (Full Name, Date of Birth, National ID / Passport Number) for desert and border excursions.
3. **Atomic Seat Reservation:**
   - MongoDB `$inc` operations preventing race conditions and overbooking.
4. **Inquiries & Quotation Engine:**
   - Custom quotation requests for school groups, corporate retreats, and tailor-made expeditions.
5. **Payment Tracking:**
   - Manual CCP/BaridiMob transaction reference submission and agency payment confirmation workflows.
