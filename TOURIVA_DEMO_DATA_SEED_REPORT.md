# Touriva — Clean Old Data & Seed Fresh Demo Data Report

**Generated**: October 19, 2026  
**Platform**: Touriva National Tourism & Travel Ecosystem (Algeria)  
**Database Targets**: `mongodb://localhost:27017/touriva` and `mongodb://localhost:27017/touriva_shop`  

---

## 1. Executive Summary

All Touriva databases have been safely audited, purged of legacy/placeholder/inherited test records, and populated with a completely fresh, coherent, and realistic Algerian tourism demo dataset.

Touriva now functions as a fully populated, interconnected tourism platform immediately upon startup across all user-facing, administrative, and merchant portals:
- **Touriva Customer App** (`http://localhost:2021` / `http://localhost:2020`): Discover Algerian destinations, explore curated excursions, book guided tours, inspect handpicked hotels and authentic restaurants, and search across all 58 wilayas.
- **Touriva Tourism Administration Portal** (`http://localhost:2025`): Platform control center managing certified guides, licensed travel agencies, hotels, restaurants, historical landmarks, verified reservations, and subscription billings.
- **Touriva Shop Marketplace** (`http://localhost:2023`): Complete travel store featuring expedition backpacks, desert trekking tents, authentic Tuareg tagelmust scarves, Mozabite brass crafts, Tolga gourmet dates, and GPS navigation gear.
- **Touriva Shop Administration** (`http://localhost:2022`): Commerce administration managing store categories, product catalogs, customer orders, and marketplace merchant accounts.
- **Touriva Seller Portal** (`http://localhost:2024`): Merchant dashboard allowing outfitters and local craft collectives to monitor incoming travel orders and product inventory.

---

## 2. Critical Safety Guarantees & Djawal Isolation

### Strict Safety Rules Upheld:
1. **Djawal Completely Untouched**:
   - The databases `djawal` (3,960,832 bytes, 24 collections) and `djawalShop` (1,511,424 bytes, 20 collections) remain **100% untouched and unmodified**.
   - No Djawal source files, collections, databases, or indexes were altered or dropped.
   - Verified before, during, and after script execution via direct MongoDB Admin inspect commands.
2. **Strict Database Isolation**:
   - Operations were strictly restricted to databases named `touriva` and `touriva_shop`.
   - Both seeders feature programmatic safety assertions refusing to execute if the target database name is anything other than `touriva` or `touriva_shop`, or if the connection string references `djawal`.
3. **No Schema or Architectural Disruptions**:
   - Application architecture, frontend stores, backend routes, ports, Docker configs, and CASL abilities remain intact.
   - All collection indexes—including `2dsphere` spatial geospatial indexes on `hotels.location`, `restaurants.location`, and `sites.location`—were preserved by utilizing collection-level `deleteMany({})` instead of destructive database dropping.

---

## 3. Database Cleanup Audit

### Database 1: Touriva Core (`mongodb://localhost:27017/touriva`)

| Collection | Pre-Cleanup Count | Action Taken | Records Removed | Final Clean State |
| :--- | :---: | :--- | :---: | :---: |
| `hotels` | 235 | Purged scraped records with broken Google Place tokens & null wilayas | 235 | 0 (then reseeded) |
| `restaurants` | 193 | Purged scraped records with broken tokens & null wilayas | 193 | 0 (then reseeded) |
| `sites` | 139 | Purged scraped records with broken tokens & null wilayas | 139 | 0 (then reseeded) |
| `activities` | 4 | Purged incomplete activity stubs | 4 | 0 (then reseeded) |
| `trips` | 9 | Purged placeholder test records ("t1", "T", "T1") | 9 | 0 (then reseeded) |
| `tripsubscriptions`| 5 | Purged test reservations with fake names ("b b", "P P") | 5 | 0 (then reseeded) |
| `users` | 3 | Purged test users ("b b", "u u", "o o") | 3 | 0 (then reseeded) |
| `roles` | 0 | Cleared | 0 | 0 (then reseeded) |
| `partners` | 0 | Cleared | 0 | 0 (then reseeded) |
| `categories` | 0 | Cleared | 0 | 0 (then reseeded) |
| `publications` | 0 | Cleared | 0 | 0 (then reseeded) |
| `announcements` | 0 | Cleared | 0 | 0 (then reseeded) |
| `plans` | 0 | Cleared | 0 | 0 (then reseeded) |
| `billings` | 0 | Cleared | 0 | 0 (then reseeded) |
| `terms` | 3 | Replaced with official Touriva guarantees | 3 | 0 (then reseeded) |
| `brands` | 0 | Cleared | 0 | 0 (then reseeded) |
| `wilayas` | 57 | **Preserved intact** (Official Algerian administrative reference data) | 0 | 57 |
| `dairas` | 549 | **Preserved intact** (Official Algerian administrative reference data) | 0 | 549 |
| `communes` | 1542 | **Preserved intact** (Official Algerian administrative reference data) | 0 | 1542 |

**Total Core Records Removed**: **588** obsolete/placeholder/broken records.

---

### Database 2: Touriva Shop (`mongodb://localhost:27017/touriva_shop`)

| Collection | Pre-Cleanup Count | Action Taken | Records Removed | Final Clean State |
| :--- | :---: | :--- | :---: | :---: |
| `products` | 1 | Purged placeholder product ("prod 1") | 1 | 0 (then reseeded) |
| `categories` | 1 | Purged placeholder category ("cat 1") | 1 | 0 (then reseeded) |
| `orders` | 1 | Purged test order | 1 | 0 (then reseeded) |
| `users` | 2 | Purged placeholder accounts ("admin@gmail.com", "k@gmail.com") | 2 | 0 (then reseeded) |
| `brands` | 0 | Cleared | 0 | 0 (then reseeded) |
| `roles` | 0 | Cleared | 0 | 0 (then reseeded) |
| `terms` | 0 | Cleared | 0 | 0 (then reseeded) |
| `billings` | 0 | Cleared | 0 | 0 (then reseeded) |
| `wilayas` | 0 | Populated with official Algerian wilayas for shipping | 0 | 57 |

**Total Shop Records Removed**: **5** placeholder/test records.

---

## 4. Fresh Touriva Demo Dataset Created

### Core Touriva Platform Summary (`touriva`)

| Entity Type | Count | Description / Details |
| :--- | :---: | :--- |
| **Users** | **11** | Certified guides, travel agencies, hotel groups, associations, travelers, and administrator. |
| **Roles (CASL)** | **23** | Complete permissions for all admin panel subjects (`Dashboard`, `Hotels`, `Trips`, `Users`, etc.). |
| **Wilayas** | **57** | Full Algerian administrative coverage (Algiers, Oran, Constantine, Djanet, Ghardaïa, Biskra, etc.). |
| **Dairas** | **549** | Official administrative sub-districts linked directly to parent wilayas. |
| **Communes** | **1542** | Official administrative municipalities linked to dairas. |
| **Hotels & Lodges** | **18** | Luxury hotels, coastal retreats, and desert eco-lodges with 2dsphere coordinates and real images. |
| **Restaurants** | **18** | Authentic Algerian culinary establishments (traditional palaces, coastal seafood, oasis dining). |
| **Cultural Sites** | **18** | Major historical landmarks (UNESCO Casbah, Tassili, Timgad, Djemila, Santa Cruz, Rhumel bridges). |
| **Excursions / Trips** | **8** | Multi-day curated itineraries with day-by-day schedules, coordinates, photos, and prices. |
| **Trip Bookings** | **8** | Verified traveler reservations linked to seeded trips, travelers, and phone numbers. |
| **Activities** | **24** | Comprehensive activity catalog (Sahara 4x4, Tassili rock art trek, Casbah tour, diving, etc.). |
| **Partners Directory** | **6** | Accredited travel operators, guide cooperatives, and hotel chains. |
| **Categories** | **6** | Core tourism themes (Sahara Expeditions, Heritage, Coastal, Gastronomy, Mountain Treks, Crafts). |
| **Publications** | **4** | Editorial travel stories with verified photography and author attribution. |
| **Announcements** | **2** | Partner early-bird promotion packages. |
| **Partner Plans** | **3** | Certified Guide, Licensed Agency, and Premium Hotel membership tiers. |
| **Billing Invoices** | **3** | Verified partner subscription payments (CIB/Edahabia, bank wire). |
| **Terms & Conditions**| **3** | Official Touriva traveler guarantees and guide accreditation standards. |

---

### Touriva Shop & Marketplace Summary (`touriva_shop`)

| Entity Type | Count | Description / Details |
| :--- | :---: | :--- |
| **Users** | **6** | 3 Merchant sellers, 1 platform shop admin, 2 retail travel customers. |
| **Merchant Sellers**| **3** | Sahara Expedition Outfitters DZ, Atlas Mountain & Trekking Pro, Artisans du M’Zab. |
| **Brands** | **5** | Touriva Outdoor Pro, Sahara Trek Gear, Tassili Heritage, Numidia Leathercraft, Atlas Explorer. |
| **Categories** | **8** | Sahara & Camping, Backpacks, Outdoor Apparel, Artisanal Crafts, Hydration, Optics, Terroir, Navigation. |
| **Products** | **31** | Comprehensive catalog with unique SKUs (`TRV-*`), high-res images, pricing, and features. |
| **Orders** | **10** | Realistic orders across statuses (`confirmed`, `completed`, `pending`, `cancelled`) with correct totals. |
| **Roles (CASL)** | **23** | Authorization roles for Shop Admin and Seller Portal. |
| **Wilayas** | **57** | Synced Algerian wilayas ensuring delivery forms function across all provinces. |
| **Shop Terms** | **3** | Authenticity guarantees, shipping across 58 wilayas, and merchant standards. |

---

## 5. Seeded Accounts & Credentials

All seeded accounts use standard bcrypt password hashing.

**Standard Demo Password for All Accounts**: `Password123!`

### Core Touriva Platform Accounts (`http://localhost:2021` / `http://localhost:2025`)

| Role | Email | Phone Number | Organization / Name | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@touriva.test` | `+213550000001` | Touriva Platform Admin | Full Admin Portal Control Center (`:2025`) |
| **Guide** | `guide@touriva.test` | `+213550000002` | Touriva Saharan Expeditions | Certified National Guide (Web/App) |
| **Guide (Local)** | `guide.sahara@touriva.test` | `+213550000003` | Tassili Nomad Tours | Tuareg Desert Guide (Web/App) |
| **Agency** | `agency@touriva.test` | `+213550000004` | Numidia Voyages & Expeditions | Licensed Travel Agency (Web/App) |
| **Agency** | `agency.casbah@touriva.test` | `+213550000005` | Casbah Heritage Travel | Cultural Travel Operator (Web/App) |
| **Hotel Partner** | `hotel@touriva.test` | `+213550000006` | El Aurassi Hospitality Group | Hospitality Operator (Web/App) |
| **Desert Lodge** | `lodge.djanet@touriva.test`| `+213550000007` | Tassili Eco-Lodge Djanet | Saharan Lodge Partner (Web/App) |
| **Restaurant** | `restaurant.demo@touriva.test`| `+213550000008`| Dar El Dey Gastronomie | Culinary Partner (Web/App) |
| **Association** | `association.demo@touriva.test`|`+213550000009`| Assoc. Sauvegarde M’Zab | Heritage Association (Web/App) |
| **Customer 1** | `customer@touriva.test` | `+213550000010` | Lynda Meziani | Traveler Account (Reservations & Bookings) |
| **Customer 2** | `traveler2@touriva.test`| `+213550000011` | Mehdi Larbi | Traveler Account (Reservations & Bookings) |

---

### Touriva Shop & Seller Accounts (`http://localhost:2022` / `http://localhost:2023` / `http://localhost:2024`)

| Role | Email | Phone Number | Business Entity | Portal Access |
| :--- | :--- | :--- | :--- | :--- |
| **Shop Admin** | `admin@touriva.test` | `+213550000001` | Touriva Marketplace HQ | Shop Admin (`:2022`) |
| **Seller 1** | `seller1@touriva.test` | `+213550000021` | Sahara Expedition Outfitters DZ | Seller Portal (`:2024`) |
| **Seller 2** | `seller2@touriva.test` | `+213550000022` | Atlas Mountain & Trekking Pro | Seller Portal (`:2024`) |
| **Seller 3** | `seller3@touriva.test` | `+213550000023` | Artisans du M’Zab & Terroir | Seller Portal (`:2024`) |
| **Customer 1** | `customer@touriva.test` | `+213550000010` | Lynda Meziani | Shop Web (`:2023`) |
| **Customer 2** | `buyer2@touriva.test` | `+213550000011` | Mehdi Larbi | Shop Web (`:2023`) |

---

## 6. Data Relationship & Referential Integrity Validation

An automated verification suite ran immediately after seeding:
- **Foreign Key Validity**:
  - 100% of Hotels (`18/18`) possess valid `wilayaId`, `dairaId`, `communeId`, and valid 2-element `Point` coordinates (`[lng, lat]`).
  - 100% of Restaurants (`18/18`) possess valid `wilayaId`, `dairaId`, `communeId`, and valid `Point` coordinates.
  - 100% of Historical Sites (`18/18`) possess valid `wilayaId`, `dairaId`, `communeId`, and valid `Point` coordinates.
  - 100% of Trips (`8/8`) reference existing creator `User`s and existing destination `Wilaya`s, with non-empty day-by-day item arrays.
  - 100% of Trip Subscriptions (`8/8`) reference existing `Trip` documents.
  - 100% of Shop Products (`31/31`) possess unique SKU codes, valid category references, and verified imagery.
  - 100% of Shop Orders (`10/10`) reference existing `User` and `Product` records with mathematically consistent amounts (`amount == price * quantity`).
- **No Orphaned Records**: Zero references point to deleted or missing documents.
- **No Duplicates**: Zero duplicate product SKUs or conflicting user email/phone combinations.
- **Branding Audit**: Scanned all database collections for occurrences of obsolete branding. Zero occurrences of `djawal` detected.

---

## 7. Frontend Verification

All 5 Touriva frontend applications and both backend APIs were tested live:

### 1. Touriva Main Web App (`http://localhost:2021`)
- **Homepage (`/`)**: Displays curated hero photography, quick category exploration bars, featured guided excursions (e.g., *Sahara Odyssey: Djanet & Tassili n’Ajjer*), curated destinations (Algiers, Djanet, Constantine, Oran, Ghardaïa), historical monuments, and stays.
- **Excursions Directory (`/trips`)**: Displays all 8 multi-day guided expeditions with prices, durations, certified guide company names, and destination badges.
- **Excursion Detail (`/tripDetail/:id`)**: Renders day-by-day schedules with times, descriptions, and interactive booking modal.
- **Hotels Directory (`/hotels`)**: Lists all 18 authentic stays with ratings, addresses, and phone numbers.
- **Restaurants Directory (`/restaurants`)**: Displays 18 traditional Algerian dining establishments with cuisines and locations.
- **Historical Sites (`/sites`)**: Displays 18 landmarks with verified descriptions and photography.
- **Reservations (`/subscriptions`)**: Displays traveler bookings.
- **User Authentication (`/login`)**: Verified login using phone number `+213550000002` and password `Password123!`.

### 2. Touriva Tourism Administration Portal (`http://localhost:2025`)
- **Login (`/login`)**: Successfully logs in using `admin@touriva.test` and `Password123!`.
- **Dashboard (`/dashboard`)**: Displays platform KPI summaries, active excursions, listings, and partner counts.
- **Users Management (`/users`)**: Lists all seeded partner guides, agencies, and hospitality operators.
- **Hotels Management (`/hotels`)**: Full data table of seeded accommodations.
- **Restaurants Management (`/restaurants`)**: Full data table of seeded dining spots.
- **Historical Sites (`/sites`)**: Full table of cultural attractions.
- **Trips Management (`/trips`)**: Displays excursions and publication status.
- **Trip Subscriptions (`/tripSubscriptions`)**: Displays all traveler reservations grouped by excursion name.
- **Activities Catalog (`/activities`)**: Lists all 24 tourism activities.

### 3. Touriva Shop Web Marketplace (`http://localhost:2023`)
- **Store Homepage / Tabs (`/tabs`)**: Renders travel categories, banners, and curated product grid.
- **Categories Navigation (`/categories`)**: Displays 8 travel categories with high-res imagery.
- **Category Products Filter (`/products`)**: Tested category filtering (e.g. *Sahara & Camping Gear* displays 4 products; *Backpacks* displays 4 products; *Artisanal Crafts* displays 4 products).
- **Product Details (`/product/:id`)**: Renders product descriptions, price in DZD, features list, and add-to-cart actions.

### 4. Touriva Shop Admin (`http://localhost:2022`)
- **Admin Login (`/login`)**: Verified login using `admin@touriva.test`.
- **Products Catalog (`/products`)**: Full table of 31 travel items with prices and SKU codes.
- **Orders Management (`/orders`)**: Displays customer orders with customer names, product codes, and statuses.

### 5. Touriva Seller Portal (`http://localhost:2024`)
- **Merchant Login (`/login`)**: Verified login using `seller1@touriva.test` (*Sahara Expedition Outfitters DZ*).
- **Seller Dashboard (`/dashboard`) & Products (`/products`)**: Displays store catalog and incoming customer orders.

---

## 8. Reproducible Seed Commands

The seed system is fully automated, idempotent, and safe to execute repeatedly without duplicating records or dropping databases.

### Seed Touriva Core Platform:
```bash
cd "/home/next/next projects/touriva/backend"
npm run seed:demo
# or directly: node seed/seed_touriva.js
```

### Seed Touriva Shop Platform:
```bash
cd "/home/next/next projects/touriva/shop/backend"
npm run seed:demo
# or directly: node seed/seed_shop.js
```

### Run Unified Master Seeder (Both Platforms):
```bash
cd "/home/next/next projects/touriva"
node scripts/seed_all.js
```
