# Touriva — Tourism & Travel Experience Platform

> **Discover More. Travel Better.**

Touriva is a modern, full-stack tourism and travel experience platform modernized from the Djawal architecture. It enables travelers, travel agencies, certified tour guides, and tourism associations to discover attractions, book guided excursions and trips, manage hospitality listings, and engage with travel equipment commerce.

---

## Architecture Overview

Touriva consists of two interconnected subsystems orchestrating 5 frontend applications, 2 backend microservices, and Nginx reverse proxy infrastructure:

```
touriva/
├── backend/                             # Core Express 5 Tourism API (Port 4000)
│   ├── controllers/                     # Tourism sites, hotels, restaurants, trips, auth
│   ├── models/                          # Mongoose 9 models with 2dsphere geo-spatial indexes
│   ├── routes/                          # REST endpoints for tourism services
│   ├── services/                        # Email (Nodemailer), SMS (Twilio), AI itineraries (Ollama)
│   ├── scripts/                         # Safe database migration scripts
│   └── tests/                           # Automated Jest API test suite (15 tests)
├── frontEnd/
│   ├── touriva/                         # Main Tourism Discovery Web & Mobile App (Vue 3, Vuetify 4, Capacitor 7)
│   │   ├── android/                     # Capacitor Android project (com.touriva.app)
│   │   ├── ios/                         # Capacitor iOS project (com.touriva.app)
│   │   └── src/__tests__/               # Vitest component & brand token tests
│   └── touriva_adminPanel/              # Administrative Management Portal (Vue 3, Vuetify 4, Vite 7)
├── shop/                                # Tourism Equipment & Merchandise Subsystem
│   ├── backend/                         # Shop Express 5 API (Port 5000, 4 Jest tests)
│   └── frontEnd/
│       ├── touriva_shop_web/            # Customer Travel Store (Vue 3, Vuetify 4, Vite 7)
│       ├── touriva_shop_admin/          # Store Administrative Management (Vue 3, Vuetify 4)
│       └── touriva_shop_seller_admin/   # Merchant / Vendor Portal (Vue 3, Vuetify 4)
├── nginx/                               # Production reverse proxy configuration
│   └── touriva.conf                     # Nginx gateway routing
└── docker-compose.yaml                  # Containerized deployment manifest
```

---

## Technology Stack Modernization

All subsystems have been upgraded to mutually compatible, stable production releases:

| Component | Legacy Djawal Version | Touriva Modernized Version | Notes |
| :--- | :--- | :--- | :--- |
| **Vue.js** | Vue 3.4.x | **Vue 3.5.28** | Latest stable production runtime |
| **Component UI** | Vuetify 3.6.14 | **Vuetify 4.2.6** | Resolved `VDateInput` labs migration |
| **State Management** | Pinia 2.1.7 | **Pinia 3.0.4** | Modern store composition |
| **Build Tooling** | Vite 5.2.x | **Vite 7.3.1** | Lightning-fast HMR and Rollup 4 bundling |
| **Internationalization** | Vue I18n 9.x | **Vue I18n 11.2.7** | Arabic (RTL), French, English |
| **Node.js Runtime** | Node 18/20 | **Node.js LTS (v24.11.1)** | Native ESM/CJS interop support |
| **Backend Framework** | Express 4.18 | **Express 5.2.1** | Modern async error handling & routing |
| **Database ODM** | Mongoose 7.x | **Mongoose 9.1.2** | Strict schemas, 2dsphere geo-indexing |
| **Database** | MongoDB 6.0 | **MongoDB 7.0** | Isolated `touriva` & `touriva_shop` databases |
| **Mobile Bridge** | Capacitor 5.x | **Capacitor 7.0.2 / 7.1.7** | Android & iOS native containers |
| **Security Headers** | Basic CORS | **Helmet 8.1.0 + Rate-Limit** | Strict HTTP security & throttle guards |
| **Automated Testing** | None | **Jest 29 + Vitest 5** | 22 automated unit/integration tests |

---

## Visual Identity & Branding

Touriva departs from legacy purple tones to establish an evocative, premium travel palette:

- **Primary Brand Color**: `Oceanic Emerald` (`#0f766e` / `#14b8a6`) — symbolizing exploration, nature, and coastal destinations.
- **Secondary Accent**: `Sunrise Amber` (`#f59e0b` / `#d97706`) — representing warmth, dunes, culture, and golden hour adventures.
- **Surface & Backgrounds**: Crisp light slate (`#f8fafc`) with high-contrast text typography (`#0f172a`).
- **Tagline**: *"Discover More. Travel Better."*
- **Vector Assets**: Centralized SVG and responsive high-res PNG logos and favicons in `src/assets/logo.svg` and `public/favicon.svg`.
- **Central Configuration**: Managed via `src/config/branding.js` across all frontend apps.

---

## Database Architecture & Safe Migration

The original Djawal databases (`djawal` and `djawalShop`) are strictly isolated and never overwritten. Touriva operates on its own dedicated databases:

- `touriva` — Tourism listings, user accounts, trips, bookings, reviews, and wilaya metadata.
- `touriva_shop` — Products, categories, vendor plans, and merchant orders.

### Executing Database Migration

To safely seed Touriva from existing data without modifying Djawal:

```bash
cd backend
node scripts/migrate_from_djawal.js
```

This idempotent migration script:
1. Connects to `mongodb://localhost:27017`.
2. Clones all collections from `djawal` to `touriva` and `djawalShop` to `touriva_shop`.
3. Creates geospatial `2dsphere` indexes on coordinates (`location.coordinates` and `geometry.coordinates`) for proximity search.
4. Leaves the original Djawal databases untouched.

---

## Environment Configuration

Both backends include `.env.example` templates with non-production secrets:

### Touriva Core Backend (`backend/.env`)
```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/touriva
SECRET=touriva_secure_jwt_secret_token_tourism_2026
ACCOUNT_SID=your_twilio_account_sid
AUTH_TOKEN=your_twilio_auth_token
SERVICE_ID=your_twilio_service_id
OLLAMA_API_KEY=your_ollama_api_key
MAIL_USER=touriva.travel@gmail.com
MAIL_PASS=your_email_password
CORS_ORIGINS=*
NODE_ENV=development
```

### Touriva Shop Backend (`shop/backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/touriva_shop
SECRET=touriva_shop_secure_jwt_secret_token_2026
ACCOUNT_SID=your_twilio_account_sid
AUTH_TOKEN=your_twilio_auth_token
SERVICE_ID=your_twilio_service_id
NODE_ENV=development
```

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v20 or v24 LTS
- **MongoDB**: v7.0 running on `localhost:27017`
- **npm**: v10+

### 2. Manual Bare-Metal Launch

#### Start Core Backend
```bash
cd backend
npm install
node server.js
# Core API running on http://localhost:4000
# Health check: http://localhost:4000/api/health
```

#### Start Shop Backend
```bash
cd shop/backend
npm install
node server.js
# Shop API running on http://localhost:5000
# Health check: http://localhost:5000/api/health
```

#### Start Frontend Applications
```bash
# Main Tourism Web App
cd frontEnd/touriva
npm install
npm run dev # http://localhost:5173

# Admin Management Portal
cd frontEnd/touriva_adminPanel
npm install
npm run dev # http://localhost:5174

# Tourism Shop Storefront
cd shop/frontEnd/touriva_shop_web
npm install
npm run dev

# Shop Admin
cd shop/frontEnd/touriva_shop_admin
npm install
npm run dev

# Shop Vendor/Seller Admin
cd shop/frontEnd/touriva_shop_seller_admin
npm install
npm run dev
```

### 3. Docker Compose Deployment

To build and run the complete containerized Touriva tourism stack:

```bash
docker-compose up --build -d
```

- **Touriva Gateway / Nginx**: `http://localhost:8080`
- **Touriva Web Client**: `http://localhost:2020`
- **Touriva Admin Portal**: `http://localhost:2021`
- **Touriva Core API**: `http://localhost:4000`

---

## Automated Test Verification

Touriva includes automated test suites covering frontend configuration, backend health, authentication, tourism services, and shop APIs:

```bash
# 1. Run Touriva Core Backend Tests (15 tests)
cd backend
npm test

# 2. Run Touriva Shop Backend Tests (4 tests)
cd shop/backend
npm test

# 3. Run Touriva Client Vitest Tests (3 tests)
cd frontEnd/touriva
npm test
```

**Total Passing Tests: 22 / 22 (100% pass rate).**

---

## Mobile Application (Capacitor 7)

The main Touriva frontend includes native Android and iOS wrappers:
- **Application ID**: `com.touriva.app`
- **App Name**: `Touriva`
- **Configuration**: `frontEnd/touriva/capacitor.config.json`

### Android Build & Run
```bash
cd frontEnd/touriva
npm run build
npx cap sync android
npx cap open android
```

---

## Feature Migration Checklist

| Feature Category | Original Djawal State | Modernized Touriva State | Status |
| :--- | :--- | :--- | :--- |
| **Tourist Sites & Attractions** | Filter by category, wilaya, coordinates | Preserved, enhanced brand cards, geo-indexed | ✅ Complete |
| **Hotels & Accommodations** | Listings, star rating, phone contact | Preserved, upgraded UI components, responsive | ✅ Complete |
| **Dining & Restaurants** | Traditional & modern eateries listing | Preserved, modernized search & filters | ✅ Complete |
| **Excursions & Guided Trips** | Trip itinerary, pricing, seats left | Preserved, verified reservation bookings | ✅ Complete |
| **Trip Bookings / Subscriptions**| User reservation flow & grouped lists | Tested and verified with DB persistence | ✅ Complete |
| **User Authentication** | Guide, Agency, Association, Visitor roles | Preserved & secured with JWT & bcrypt | ✅ Complete |
| **Geographic Structure** | 58 Wilayas, Dairas, Communes | Cloned and indexed with MongoDB 2dsphere | ✅ Complete |
| **Admin Management Portal** | CRUD for all listings & approvals | Upgraded to Vuetify 4, builds cleanly | ✅ Complete |
| **Merchandise Storefront** | Products, categories, orders | Upgraded to Vue 3.5 / Vuetify 4, tested | ✅ Complete |
| **Shop Merchant Admin** | Seller subscriptions, orders, ads | Upgraded to Vuetify 4, builds cleanly | ✅ Complete |
| **AI Itinerary Generation** | Ollama integration in backend | Preserved in `aiTripController.js` | ✅ Complete |
| **Security & Headers** | Open CORS, no rate limiter | Helmet security headers, rate-limiting | ✅ Complete |
| **Internationalization** | Hardcoded legacy terms in some views | Replaced with Touriva brand tokens (AR/FR/EN) | ✅ Complete |
