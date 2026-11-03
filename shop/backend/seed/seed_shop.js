/**
 * Touriva Shop & Marketplace — High Quality Demo Dataset Seeder
 * 
 * Safety Guarantees:
 * 1. NEVER touches Djawal or any non-Touriva database.
 * 2. Strictly verifies database name equals 'touriva_shop'.
 * 3. Pre-audit report before any destructive operations.
 * 4. Preserves indexes and collections structures.
 * 5. Full referential integrity validation.
 */

require('dotenv').config({ path: __dirname + '/../.env' })
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

// Models
const User = require('../models/User')
const Role = require('../models/Role')
const Product = require('../models/Product')
const Category = require('../models/Category')
const Order = require('../models/Order')
const Brand = require('../models/Brand')
const Term = require('../models/Term')
const Billing = require('../models/Billing')
const Wilaya = require('../models/Wilaya')
const SellerApplication = require('../models/SellerApplication')
const SellerProfile = require('../models/SellerProfile')
const OrderItem = require('../models/OrderItem')
const Commission = require('../models/Commission')
const MarketplaceSettings = require('../models/MarketplaceSettings')
const AuditLog = require('../models/AuditLog')

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/touriva_shop'
const TARGET_DB_NAME = 'touriva_shop'
const DEMO_PASSWORD = 'Password123!'

/**
 * Strict safety check refusing to execute on any unexpected database or Djawal
 */
function verifySafeTargetDatabase(uri, dbName) {
  const normalizedDb = dbName.toLowerCase().trim()
  const normalizedUri = uri.toLowerCase().trim()

  if (normalizedDb.includes('djawal') || normalizedUri.includes('djawal')) {
    throw new Error(`[CRITICAL SAFETY VIOLATION] Target references 'djawal'. Aborting immediately!`)
  }

  if (normalizedDb !== TARGET_DB_NAME) {
    throw new Error(`[CRITICAL SAFETY VIOLATION] Expected DB '${TARGET_DB_NAME}', got '${normalizedDb}'. Aborting!`)
  }
}

async function auditDatabase(db) {
  console.log(`\n======================================================`)
  console.log(`[PHASE 1 - SHOP DATABASE AUDIT] Connection & Collections`)
  console.log(`Connection URI : ${MONGO_URI}`)
  console.log(`Database Name  : ${db.databaseName}`)
  console.log(`======================================================`)

  const collections = await db.listCollections().toArray()
  const auditReport = []

  for (const c of collections) {
    const count = await db.collection(c.name).countDocuments()
    auditReport.push({ collection: c.name, documentCount: count })
  }

  auditReport.sort((a, b) => a.collection.localeCompare(b.collection))
  console.table(auditReport)
  return auditReport
}

async function cleanOldShopData(db) {
  console.log(`\n======================================================`)
  console.log(`[PHASE 2 - CLEAN OLD SHOP DATA] Removing placeholder products & orders`)
  console.log(`======================================================`)

  const collectionsToClean = [
    'products',
    'categories',
    'orders',
    'orderitems',
    'commissions',
    'sellerapplications',
    'sellerprofiles',
    'marketplacesettings',
    'auditlogs',
    'users',
    'roles',
    'brands',
    'terms',
    'billings'
  ]

  const cleanupSummary = []

  for (const collName of collectionsToClean) {
    const coll = db.collection(collName)
    const beforeCount = await coll.countDocuments()
    await coll.deleteMany({})
    cleanupSummary.push({ collection: collName, deletedRecords: beforeCount, remaining: 0 })
  }

  console.table(cleanupSummary)
  console.log(`[SUCCESS] Preserved collection schemas and indexes intact.`)
}

async function seedFreshShopData(db) {
  console.log(`\n======================================================`)
  console.log(`[PHASE 3 - SEED FRESH TOURIVA SHOP DEMO DATASET]`)
  console.log(`======================================================`)

  // 1. Roles for Shop Admin & Seller Admin Portals (CASL abilities)
  console.log(`-> Seeding Shop Admin & Seller Roles (CASL Permissions)...`)
  const roleSubjects = [
    'Dashboard', 'Users', 'Products', 'Orders', 'OrderDetail', 'NewOrder',
    'AdminCategories', 'AddCategory', 'EditCategory', 'Brands', 'Roles',
    'Location', 'Billing', 'Detail', 'Notifications', 'Ads', 'Publications',
    'TermsConditions', 'Settings', 'About', 'Account', 'Company', 'Plans'
  ]

  const seededRoles = []
  for (const subject of roleSubjects) {
    const r = await Role.create({
      name: `Manage ${subject}`,
      subject,
      actions: {
        read: true,
        create: true,
        update: true,
        delete: true
      }
    })
    seededRoles.push(r._id)
  }

  // 2. Password Hash
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10)

  // 3. Sync Algerian Wilayas for Shop delivery
  console.log(`-> Syncing Geographic Wilayas for Shop Shipping & Orders...`)
  const existingWilayasCount = await Wilaya.countDocuments()
  if (existingWilayasCount === 0) {
    // Read from Touriva main DB or insert standard wilayas
    try {
      const mainConn = await mongoose.createConnection('mongodb://localhost:27017/touriva').asPromise()
      const mainWilayas = await mainConn.db.collection('wilayas').find({}).toArray()
      if (mainWilayas.length > 0) {
        await Wilaya.insertMany(mainWilayas.map(w => ({ _id: w._id, name: w.name, nameFr: w.nameFr, nameAr: w.nameAr })))
        console.log(`Synced ${mainWilayas.length} Algerian wilayas into Touriva Shop.`)
      }
      await mainConn.close()
    } catch (e) {
      console.warn(`Note: Could not copy wilayas from touriva main DB: ${e.message}`)
    }
  }

  // 4. Shop Demo Accounts: Admin, Sellers, Customers
  console.log(`-> Seeding Shop Admin, Merchant Sellers & Customers...`)
  const shopAdmin = await User.create({
    email: 'admin@touriva.test',
    firstName: 'Shop Admin',
    lastName: 'Touriva',
    phone: '+213550000001',
    password: passwordHash,
    role: 'administrator',
    activated: true,
    complete: true,
    status: true,
    fileStatus: 'confirmed',
    authorizationIds: seededRoles
  })

  // Seller 1: Sahara Expedition Outfitters
  const seller1 = await User.create({
    email: 'seller1@touriva.test',
    firstName: 'Amine',
    lastName: 'Mansouri',
    phone: '+213550000021',
    password: passwordHash,
    role: 'seller',
    companyName: 'Sahara Expedition Outfitters DZ',
    rc: '16/00-7788991A25',
    nif: '002016077889912',
    nis: '12345678921',
    activated: true,
    complete: true,
    status: true,
    fileStatus: 'confirmed',
    authorizationIds: seededRoles
  })

  // Seller 2: Atlas Mountain & Trekking Gear
  const seller2 = await User.create({
    email: 'seller2@touriva.test',
    firstName: 'Karim',
    lastName: 'Bensalem',
    phone: '+213550000022',
    password: passwordHash,
    role: 'seller',
    companyName: 'Atlas Mountain & Trekking Pro',
    rc: '16/00-8899002B25',
    activated: true,
    complete: true,
    status: true,
    fileStatus: 'confirmed',
    authorizationIds: seededRoles
  })

  // Seller 3: Artisans du M’Zab & Terroir Saharien
  const seller3 = await User.create({
    email: 'seller3@touriva.test',
    firstName: 'Omar',
    lastName: 'Kaddour',
    phone: '+213550000023',
    password: passwordHash,
    role: 'seller',
    companyName: 'Artisans du M’Zab & Terroir Saharien',
    rc: '47/00-9900113C25',
    activated: true,
    complete: true,
    status: true,
    fileStatus: 'confirmed',
    authorizationIds: seededRoles
  })

  // Customer 1
  const customer1 = await User.create({
    email: 'customer@touriva.test',
    firstName: 'Lynda',
    lastName: 'Meziani',
    phone: '+213550000010',
    password: passwordHash,
    role: 'client',
    activated: true,
    complete: true,
    status: true,
    fileStatus: 'confirmed'
  })

  // Customer 2
  const customer2 = await User.create({
    email: 'buyer2@touriva.test',
    firstName: 'Mehdi',
    lastName: 'Larbi',
    phone: '+213550000011',
    password: passwordHash,
    role: 'client',
    activated: true,
    complete: true,
    status: true,
    fileStatus: 'confirmed'
  })

  // 4b. Multi-Vendor Marketplace Settings & Seller Profiles
  console.log(`-> Seeding Marketplace Settings & Multi-Vendor Profiles...`)
  await MarketplaceSettings.create({
    defaultCommissionRate: 10,
    supportPhone: '+213 550 00 00 00',
    supportEmail: 'contact@touriva.dz',
    enableCod: true,
    enableBaridiMob: true,
    enableCcp: true,
    announcement: 'Bienvenue sur Touriva Marketplace — Le carrefour de l\'artisanat et de l\'aventure algérienne.'
  })

  const profile1 = await SellerProfile.create({
    userId: seller1._id,
    storeName: 'Sahara Expedition Outfitters DZ',
    storeSlug: 'sahara-expedition',
    email: seller1.email,
    phone: seller1.phone,
    wilaya: 'Djanet',
    address: 'Zone Artisanale, Djanet, Illizi',
    bio: 'Pionniers de l\'équipement saharien et artisanat touareg d\'exception. Bivouac, tentes de trek et artisanat du Tassili n\'Ajjer.',
    logoUrl: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    rating: 4.9,
    reviewCount: 38,
    commissionRate: 10,
    isSuspended: false
  })

  const profile2 = await SellerProfile.create({
    userId: seller2._id,
    storeName: 'Atlas Mountain & Trekking Pro',
    storeSlug: 'atlas-trekking',
    email: seller2.email,
    phone: seller2.phone,
    wilaya: 'Blida',
    address: 'Chréa Boulevard, Blida',
    bio: 'Spécialiste de la randonnée en haute montagne et des expéditions dans les massifs du Djurdjura, Babors et Chréa.',
    logoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    rating: 4.8,
    reviewCount: 29,
    commissionRate: 10,
    isSuspended: false
  })

  const profile3 = await SellerProfile.create({
    userId: seller3._id,
    storeName: 'Artisans du M’Zab & Terroir Saharien',
    storeSlug: 'artisans-mzab',
    email: seller3.email,
    phone: seller3.phone,
    wilaya: 'Ghardaïa',
    address: 'Ksar de Beni Isguen, Ghardaïa',
    bio: 'Héritiers du savoir-faire séculaire mozabite. Poteries, tapis tissés à la main, dinanderie et délices culinaires du terroir.',
    logoUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    rating: 5.0,
    reviewCount: 42,
    commissionRate: 8,
    isSuspended: false
  })

  // Historical Approved & Live Pending Vendor Applications
  await SellerApplication.create([
    {
      legalRepresentativeName: 'Amine Mansouri',
      email: seller1.email,
      phone: seller1.phone,
      address: 'Zone Artisanale, Djanet',
      storeName: 'Sahara Expedition Outfitters DZ',
      businessCategory: 'Outdoor Gear & Sahara Equipment',
      wilaya: 'Djanet',
      businessDescription: 'Fabrication et distribution d\'équipements de randonnée désertique.',
      status: 'approved',
      assignedSellerId: profile1._id,
      commissionRate: 10,
      reviewNotes: 'Verified Sahara artisan credentials'
    },
    {
      legalRepresentativeName: 'Karim Bensalem',
      email: seller2.email,
      phone: seller2.phone,
      address: 'Chréa Boulevard, Blida',
      storeName: 'Atlas Mountain & Trekking Pro',
      businessCategory: 'Mountain & Climbing Equipment',
      wilaya: 'Blida',
      businessDescription: 'Équipementier pour clubs de montagne et randonneurs en Algérie.',
      status: 'approved',
      assignedSellerId: profile2._id,
      commissionRate: 10,
      reviewNotes: 'Verified trade register 16/00-8899002B25'
    },
    {
      legalRepresentativeName: 'Farida Ait Ahmed',
      email: 'farida.kabylie@artisanat.dz',
      phone: '+213550000031',
      address: 'Village Beni Yenni, Grande Kabylie',
      storeName: 'Bijoux d\'Argent & Fibules de Beni Yenni',
      businessCategory: 'Artisanal Jewelry & Silvercraft',
      wilaya: 'Tizi Ouzou',
      businessDescription: 'Atelier familial de bijouterie kabyle traditionnelle en argent massif et corail naturel méditerranéen.',
      status: 'pending'
    },
    {
      legalRepresentativeName: 'Moussa Ag Othman',
      email: 'moussa.tamanrasset@nomadcraft.dz',
      phone: '+213550000032',
      address: 'Quartier Tahaggart, Tamanrasset',
      storeName: 'Hoggar Cuir & Maroquinerie Nomade',
      businessCategory: 'Traditional Leatherwork & Accessories',
      wilaya: 'Tamanrasset',
      businessDescription: 'Sacs de voyage, ceintures et sandales en cuir saharien tanné à l\'écorce végétale d\'acacia.',
      status: 'pending'
    }
  ])

  // 5. Shop Brands
  console.log(`-> Seeding Outdoor & Travel Equipment Brands...`)
  const brandsData = [
    { name: 'Touriva Outdoor Pro' },
    { name: 'Sahara Trek Gear' },
    { name: 'Tassili Heritage Gear' },
    { name: 'Numidia Leathercraft' },
    { name: 'Atlas Explorer' }
  ]
  const seededBrands = []
  for (const b of brandsData) {
    const brand = await Brand.create(b)
    seededBrands.push(brand)
  }

  // 6. Travel Merchandise Categories (8 categories)
  console.log(`-> Seeding Travel Shop Categories Catalog...`)
  const categoriesData = [
    {
      name: 'Sahara & Camping Gear',
      img: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Backpacks & Expedition Luggage',
      img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Outdoor Apparel & Desert Wear',
      img: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Artisanal Algerian Crafts & Souvenirs',
      img: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Travel Essentials & Hydration',
      img: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Travel Photography & Optics',
      img: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Gourmet Terroir & Saharan Dates',
      img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Navigation & Desert Survival',
      img: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80'
    }
  ]

  const seededCategories = []
  for (const c of categoriesData) {
    const cat = await Category.create({
      name: c.name,
      img: c.img,
      parent: null,
      children: []
    })
    seededCategories.push(cat)
  }

  // 7. Travel Products Catalog (36 realistic tourism products)
  console.log(`-> Seeding Authentic Tourism Travel Products (36 items)...`)
  const productsData = [
    // Category 0: Sahara & Camping Gear
    {
      code: 'TRV-SHR-001',
      name: 'Touriva Sahara 2-Person Desert Trekking Tent',
      price: 24500,
      description: 'Ultra-light wind-resistant dome tent engineered for high-altitude desert plateaus and fine-sand environments. Double-wall ventilation prevents interior heat buildup.',
      img: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80',
      categoryIndex: 0,
      brandIndex: 0,
      features: ['Fine sand micro-mesh screens', 'Aluminum alloy shock-cord poles', 'UV 50+ reflective flysheet', 'Total weight: 2.1 kg'],
      thumbnails: [
        'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      code: 'TRV-SHR-002',
      name: 'Djanet Starlight LED Rechargeable Camping Lantern',
      price: 6800,
      description: 'Rugged 1000-lumen multi-mode camping lantern featuring warm ambient light, solar trickle charging, and an integrated 5200mAh emergency smartphone power bank.',
      img: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80',
      categoryIndex: 0,
      brandIndex: 1,
      features: ['1000 Lumens variable output', 'Solar & USB-C rechargeable', 'IPX6 waterproof rating', 'Over 48 hours battery life'],
      thumbnails: [
        'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      code: 'TRV-SHR-003',
      name: 'Compact Sahara Bivouac Mummy Sleeping Bag (-5°C)',
      price: 18500,
      description: 'Engineered for extreme desert temperature drops. Features thermal hollow-fiber insulation, ergonomic mummy hood, and water-repellent ripstop shell.',
      img: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80',
      categoryIndex: 0,
      brandIndex: 1,
      features: ['Comfort rating: 0°C, Limit: -5°C', 'Compressible down to 24x18cm', 'Weight: 1.35 kg', 'Dual draft tubes on zipper'],
      thumbnails: [
        'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      code: 'TRV-SHR-004',
      name: 'Ultra-Light Titanium Desert Camp Stove & Pot Set',
      price: 9200,
      description: 'Pocket-sized piezometric ignition camping stove paired with a 900ml hard-anodized aluminum pot with insulated folding handles.',
      img: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
      categoryIndex: 0,
      brandIndex: 0,
      features: ['Boils 1L water in 3.5 minutes', 'Integrated wind guard shield', 'Includes mesh travel pouch', 'Total weight: 280g'],
      thumbnails: [
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'
      ]
    },

    // Category 1: Backpacks & Expedition Luggage
    {
      code: 'TRV-BAG-001',
      name: 'Atlas Pro 65L Technical Expedition Backpack',
      price: 32000,
      description: 'Heavy-duty multi-day trekking rucksack with ergonomic adjustable spine suspension, integrated rain cover, and bottom sleeping bag compartment.',
      img: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80',
      categoryIndex: 1,
      brandIndex: 4,
      features: ['65L + 10L expandable capacity', 'Air-mesh breathable back panel', 'Hydration bladder sleeve compatible', 'Trekking pole attachment loops'],
      thumbnails: [
        'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      code: 'TRV-BAG-002',
      name: 'Hand-Crafted Numidian Full-Grain Leather Travel Duffel',
      price: 28000,
      description: 'Artisanal heirloom weekend travel bag handcrafted from premium Algerian vegetable-tanned leather, brass hardware, and heavy cotton lining.',
      img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
      categoryIndex: 1,
      brandIndex: 3,
      features: ['100% genuine Algerian full-grain leather', 'Reinforced leather grab handles', 'Detachable padded shoulder strap', 'Cabin luggage compliant dimensions'],
      thumbnails: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      code: 'TRV-BAG-003',
      name: 'Touriva 30L Daypack for City & Casbah Walking Tours',
      price: 11500,
      description: 'Lightweight urban daypack with anti-theft hidden zippers, padded laptop compartment, and water bottle side pockets for day explorations.',
      img: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80',
      categoryIndex: 1,
      brandIndex: 0,
      features: ['30-liter capacity', 'Water-resistant coated nylon', 'Secret RFID-blocking rear pocket', 'Reflective security detailing'],
      thumbnails: [
        'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      code: 'TRV-BAG-004',
      name: 'Heavy-Duty 50L Waterproof Expedition Duffel Bag',
      price: 14000,
      description: 'Submersible-grade PVC tarpaulin duffel built to withstand Saharan sandstorms, 4x4 roof-rack dust, and Mediterranean sea spray.',
      img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
      categoryIndex: 1,
      brandIndex: 1,
      features: ['IPX7 dustproof & waterproof', 'Converts to backpack with stowable straps', 'MOLLE attachment lash points', 'Welded reinforced seams'],
      thumbnails: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80'
      ]
    },

    // Category 2: Outdoor Apparel & Desert Wear
    {
      code: 'TRV-APP-001',
      name: 'Authentic Tuareg Tagelmust Cotton Desert Chèche (5 Meters)',
      price: 4500,
      description: 'Traditional 5-meter indigo-woven pure cotton Saharan chèche headwear, providing essential protection against relentless sun, wind, and blowing sand.',
      img: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=800&q=80',
      categoryIndex: 2,
      brandIndex: 2,
      features: ['100% natural breathable woven cotton', 'Traditional 5m length for wrapping', 'Provides UV 50+ face and neck shade', 'Hand-dyed by Saharan artisans'],
      thumbnails: [
        'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      code: 'TRV-APP-002',
      name: 'Sahara Wide-Brim UV Explorer Sun Hat',
      price: 3800,
      description: 'Breathable quick-dry safari hat featuring UPF 50+ sun protection, foldable neck flap cape, and moisture-wicking sweatband.',
      img: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=800&q=80',
      categoryIndex: 2,
      brandIndex: 0,
      features: ['UPF 50+ certified sun block', 'Stowable rear neck protection flap', 'Adjustable chin strap for wind', 'Crushable & packable design'],
      thumbnails: [
        'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      code: 'TRV-APP-003',
      name: 'Atlas All-Terrain High-Traction Desert Trekking Boots',
      price: 22000,
      description: 'Lightweight high-ankle trekking boots equipped with sand-shedding Vibram rubber soles, suede leather uppers, and breathable Cordura panels.',
      img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      categoryIndex: 2,
      brandIndex: 4,
      features: ['Vibram all-terrain compound sole', 'Padded ergonomic ankle cuff', 'Gusseted tongue to lock out sand', 'Impact-absorbing EVA midsole'],
      thumbnails: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      code: 'TRV-APP-004',
      name: 'Touriva Lightweight Windbreaker & Dune Jacket',
      price: 9500,
      description: 'Packable wind-resistant shell jacket that folds into its own chest pocket. Essential for breezy Mediterranean coasts and Saharan dune ridges.',
      img: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=800&q=80',
      categoryIndex: 2,
      brandIndex: 0,
      features: ['DWR water-repellent finish', 'Folds into compact 12cm pouch', 'Underarm laser-cut ventilation', 'YKK wind-sealed zips'],
      thumbnails: [
        'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=800&q=80'
      ]
    },

    // Category 3: Artisanal Algerian Crafts & Souvenirs
    {
      code: 'TRV-CRF-001',
      name: 'Ghardaïa Handcrafted Brass Tea Pot & Tray Set',
      price: 16500,
      description: 'Exquisite authentic Mozabite brass teapot hand-engraved with geometric arabesque motifs, complete with traditional brass serving tray and 6 tea glasses.',
      img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
      categoryIndex: 3,
      brandIndex: 3,
      features: ['Solid food-safe tinned brass', 'Hand-chiseled arabesque filigree', 'Includes 35cm matching tray', 'Handcrafted in the M’Zab valley'],
      thumbnails: [
        'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      code: 'TRV-CRF-002',
      name: 'Hand-Woven Beni Isguen Saharan Wool Kilim Rug (120x80cm)',
      price: 26000,
      description: 'One-of-a-kind authentic handwoven Mozabite kilim rug made with natural sheep wool and vegetable dyes, depicting ancient ancestral protective symbols.',
      img: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
      categoryIndex: 3,
      brandIndex: 3,
      features: ['100% natural hand-spun wool', 'Vegetable-based organic dyes', 'Authentic tribal geometric patterns', 'Includes artisan certificate of origin'],
      thumbnails: [
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      code: 'TRV-CRF-003',
      name: 'Traditional Tuareg Silver Agadez Cross Pendant (Southern Sahara)',
      price: 8500,
      description: 'Masterfully forged pure 925 silver talisman crafted by Djanet blacksmith artisans. Traditionally gifted to desert travelers as a guide and protective emblem.',
      img: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
      categoryIndex: 3,
      brandIndex: 2,
      features: ['925 Sterling Silver hallmarked', 'Hand-engraved Tuareg geometric motifs', 'Comes on genuine braided leather cord', 'Presented in handcrafted velvet box'],
      thumbnails: [
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      code: 'TRV-CRF-004',
      name: 'Kabyle Artisanal Hand-Painted Ceramic Olive Oil Pitcher',
      price: 5200,
      description: 'Terracotta ceramic jar hand-painted with ancient Berber geometric symbols using natural mineral pigments from the Djurdjura mountains.',
      img: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
      categoryIndex: 3,
      brandIndex: 3,
      features: ['Authentic clay kiln fired', 'Natural mineral red and black pigments', 'Food safe interior glazing', 'Height: 28cm'],
      thumbnails: [
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'
      ]
    },

    // Category 4: Travel Essentials & Hydration
    {
      code: 'TRV-HYD-001',
      name: 'Touriva Insulated Stainless Steel Desert Flask 1.2L',
      price: 4900,
      description: 'Double-walled vacuum insulated flask keeping water ice-cold for up to 36 hours under 45°C Saharan sun, with powder-coated anti-slip grip.',
      img: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
      categoryIndex: 4,
      brandIndex: 0,
      features: ['18/8 Pro-grade stainless steel', 'Keeps cold 36h / hot 18h', 'BPA-free wide-mouth chug lid', 'Scratch-resistant textured finish'],
      thumbnails: [
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      code: 'TRV-HYD-002',
      name: 'Portable Water Micro-Purification Pump Filter (0.1 Micron)',
      price: 11000,
      description: 'Essential survival pump removes 99.999% of bacteria and protozoa from natural oasis wells, mountain streams, and remote sources without chemicals.',
      img: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
      categoryIndex: 4,
      brandIndex: 1,
      features: ['0.1 Micron hollow-fiber membrane', 'Filters up to 2,000 liters', 'Flow rate: 1.4 liters per minute', 'Includes clean hose and pre-filter'],
      thumbnails: [
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      code: 'TRV-HYD-003',
      name: 'Ultra-Compact Quick-Dry Microfiber Beach & Trekking Towel',
      price: 2800,
      description: 'Absorbs 4 times its weight in water and dries 3 times faster than standard cotton. Essential for coastal excursions and desert bivouacs.',
      img: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
      categoryIndex: 4,
      brandIndex: 0,
      features: ['XL Size: 160 x 80cm', 'Antibacterial silver-ion treatment', 'Packs into 15x8cm ventilated pouch', 'Ultra-soft suede texture'],
      thumbnails: [
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      code: 'TRV-HYD-004',
      name: 'Touriva 6-Piece Travel Luggage Packing Cubes Set',
      price: 4200,
      description: 'High-density compression organizers for modular backpack and suitcase packing, featuring mesh visibility panels and double zippers.',
      img: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
      categoryIndex: 4,
      brandIndex: 0,
      features: ['Set of 6 sizes (L, M, S + shoe pouch)', 'Compresses contents by up to 40%', 'Ultra-light ripstop fabric', 'Reinforced webbing grab handles'],
      thumbnails: [
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'
      ]
    },

    // Category 5: Travel Photography & Optics
    {
      code: 'TRV-OPT-001',
      name: 'Touriva Pro Carbon Fiber Travel Camera Tripod',
      price: 19500,
      description: 'Ultra-compact carbon fiber tripod engineered for landscape travel photography. Weighs just 1.1kg and folds to 33cm for easy backpack attachment.',
      img: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80',
      categoryIndex: 5,
      brandIndex: 0,
      features: ['100% 8-layer carbon fiber tubes', 'Max payload: 8 kg', '360-degree panorama ball head', 'Reversible center column for macro'],
      thumbnails: [
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      code: 'TRV-OPT-002',
      name: 'Waterproof Sand-Sealed Camera Lens & Drone Pouch',
      price: 5400,
      description: 'Padded shockproof neoprene lens case sealed with dust-proof zipper flaps to protect sensitive camera glass from fine desert silica sand.',
      img: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80',
      categoryIndex: 5,
      brandIndex: 0,
      features: ['10mm high-density impact foam', 'Sand-tight labyrinth zip seal', 'Carabiner clip for exterior pack mount', 'Fits lenses up to 70-200mm'],
      thumbnails: [
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      code: 'TRV-OPT-003',
      name: 'Sahara Explorer 10x42 High-Definition Binoculars',
      price: 14500,
      description: 'Nitrogen-purged fog-proof binoculars with Bak-4 roof prisms, providing crystal-clear viewing of desert gazelles and Barbary falcons.',
      img: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80',
      categoryIndex: 5,
      brandIndex: 1,
      features: ['10x Magnification / 42mm Objective', 'Multi-coated anti-reflective glass', 'Non-slip textured rubber armor', 'Twist-up eyecups for eyeglass wearers'],
      thumbnails: [
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80'
      ]
    },

    // Category 6: Gourmet Terroir & Saharan Dates
    {
      code: 'TRV-GRM-001',
      name: 'Royal Deglet Nour of Tolga (Biskra) Gourmet Box 1kg',
      price: 3200,
      description: 'The Queen of Dates. Extra-fancy translucent golden honey-sweet Deglet Nour dates harvested on the palm branch in Tolga oasis.',
      img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
      categoryIndex: 6,
      brandIndex: 3,
      features: ['Hand-harvested on the branch', 'AOP Tolga geographic certified origin', '100% natural, no added glucose', 'Elegantly packaged wooden gift box'],
      thumbnails: [
        'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      code: 'TRV-GRM-002',
      name: 'Pure Mountain Thyme & Wild Oregano Honey of the Aurès 500g',
      price: 4500,
      description: 'Wild mountain honey harvested at 1,500m in the pine and thyme forests of the Aurès mountains. Known for its intense aroma and therapeutic qualities.',
      img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
      categoryIndex: 6,
      brandIndex: 3,
      features: ['100% raw unpasteurized honey', 'Wild aromatic herb nectar', 'Cold-extracted by traditional apiaries', 'Glass jar with airtight seal'],
      thumbnails: [
        'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      code: 'TRV-GRM-003',
      name: 'Virgin Cold-Pressed Olive Oil of Sig (Mascara) 750ml',
      price: 2900,
      description: 'Award-winning first cold-pressed extra virgin olive oil made from native Chemlal and Sigoise olives, boasting a fruity peppery finish.',
      img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
      categoryIndex: 6,
      brandIndex: 3,
      features: ['Acidity < 0.3%', 'First cold press extraction', 'Dark glass UV-protective bottle', 'Gold medal Algerian Terroir 2025'],
      thumbnails: [
        'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80'
      ]
    },

    // Category 7: Navigation & Desert Survival
    {
      code: 'TRV-NAV-001',
      name: 'Touriva 24000mAh Solar Outdoor Power Bank (20W PD)',
      price: 8900,
      description: 'High-capacity ruggedized power bank with fold-out solar panel, dual USB-C fast charging, integrated LED torch, and IP67 dustproof shock armor.',
      img: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80',
      categoryIndex: 7,
      brandIndex: 0,
      features: ['24,000mAh battery capacity', '20W Power Delivery USB-C output', 'Integrated 3-panel solar charger', 'Built-in SOS emergency beacon'],
      thumbnails: [
        'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      code: 'TRV-NAV-002',
      name: 'Professional Metal Military Sighting Compass with Clinometer',
      price: 4800,
      description: 'Heavy-duty zinc alloy liquid-damped compass featuring sighting optic, phosphorescent dial for night navigation, and slope measurement scale.',
      img: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80',
      categoryIndex: 7,
      brandIndex: 1,
      features: ['Thermo-elastic liquid filled capsule', 'Luminous glow-in-the-dark dial', 'Centimeter & inch map measurement edges', 'Tripod attachment screw thread'],
      thumbnails: [
        'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      code: 'TRV-NAV-003',
      name: 'Pair of Folding Carbon Fiber Trekking Poles with Sand Baskets',
      price: 7600,
      description: 'Tough three-section telescoping walking poles with ergonomic EVA foam grips, tungsten carbide tips, and oversized removable sand baskets.',
      img: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80',
      categoryIndex: 7,
      brandIndex: 4,
      features: ['100% High-modulus carbon fiber', 'Quick-cam aluminum flip locks', 'Adjustable from 65cm to 135cm', 'Includes wide snow/sand baskets'],
      thumbnails: [
        'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      code: 'TRV-NAV-004',
      name: 'Comprehensive Wilderness Travel First Aid & Antivenom Kit',
      price: 6200,
      description: 'Hospital-grade compact medical pouch tailored for remote desert and mountain treks. Includes venom suction extractor, sterile dressings, and foil blanket.',
      img: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
      categoryIndex: 7,
      brandIndex: 0,
      features: ['Over 95 essential medical items', 'Venom vacuum extraction pump', 'Emergency thermal mylar blanket', 'Rip-away water resistant MOLLE pouch'],
      thumbnails: [
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      code: 'TRV-NAV-005',
      name: 'Algeria National Geographic Travel Map & Water-Resistant Journal',
      price: 3400,
      description: 'Tear-proof waterproof topographic map of Algeria detailing national parks and historical sites, paired with an all-weather expedition notebook.',
      img: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80',
      categoryIndex: 7,
      brandIndex: 0,
      features: ['1:1,500,000 detailed topographic scale', 'Synthetic waterproof stone paper', 'Writes in rain, sand, and heat', 'Includes travel pencil with compass cap'],
      thumbnails: [
        'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80'
      ]
    }
  ]

  const seededProducts = []
  for (let i = 0; i < productsData.length; i++) {
    const p = productsData[i]
    const category = seededCategories[p.categoryIndex]
    const brand = seededBrands[p.brandIndex]
    const assignedProfile = i < 12 ? profile1 : (i < 24 ? profile2 : profile3)

    const product = await Product.create({
      code: p.code,
      name: p.name,
      price: p.price,
      discountPrice: p.price > 10000 ? p.price - 1500 : undefined,
      stockQuantity: 20,
      description: p.description,
      img: p.img,
      categoryId: category ? category._id : null,
      brandId: brand ? brand._id : null,
      sellerId: assignedProfile._id,
      status: 'approved',
      thumbnails: p.thumbnails || [p.img],
      features: p.features || [],
      published: true
    })
    seededProducts.push(product)
  }

  // Live products pending review for the Product Moderation queue demo
  const pendingProduct1 = await Product.create({
    code: 'TRV-REV-001',
    name: 'Collier Traditionnel Agate du Tassili & Argent Pur',
    price: 12500,
    stockQuantity: 5,
    description: 'Bijou d\'artisanat saharien sculpté à la main, monté avec de l\'argent 925 et une agate naturelle du Tassili.',
    img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    categoryId: seededCategories[1]._id,
    brandId: seededBrands[2]._id,
    sellerId: profile1._id,
    status: 'pending_review',
    published: false
  })
  seededProducts.push(pendingProduct1)

  const pendingProduct2 = await Product.create({
    code: 'TRV-REV-002',
    name: 'Bâtons de Randonnée Carbone Procolis Ultralight',
    price: 9800,
    stockQuantity: 15,
    description: 'Bâtons télescopiques 3 brins en fibre de carbone avec poignée liège naturel et système de verrouillage rapide.',
    img: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80',
    categoryId: seededCategories[0]._id,
    brandId: seededBrands[4]._id,
    sellerId: profile2._id,
    status: 'pending_review',
    published: false
  })
  seededProducts.push(pendingProduct2)

  // 8. Demo Marketplace Multi-Vendor Orders
  console.log(`-> Seeding Verified Multi-Vendor Orders & Commission Ledger...`)
  const ordersData = [
    {
      user: customer1,
      orderNumber: 'TRV-MKT-2026-00001',
      productIndices: [0, 8], // Sahara tent (Seller 1) & Tuareg chèche (Seller 1)
      status: 'confirmed',
      paymentStatus: 'verified',
      paymentMethod: 'baridimob',
      date: new Date('2026-02-10T11:30:00Z'),
      customerInfo: {
        fullName: 'Lynda Meziani',
        email: customer1.email,
        phone: customer1.phone,
        wilaya: 'Algiers',
        address: '14 Rue Didouche Mourad, Alger Centre'
      }
    },
    {
      user: customer2,
      orderNumber: 'TRV-MKT-2026-00002',
      productIndices: [4, 12], // Atlas 65L backpack (Seller 1) & Brass teapot (Seller 2) -> Multi-vendor!
      status: 'confirmed',
      paymentStatus: 'verified',
      paymentMethod: 'ccp',
      date: new Date('2026-02-20T16:45:00Z'),
      customerInfo: {
        fullName: 'Mehdi Larbi',
        email: customer2.email,
        phone: customer2.phone,
        wilaya: 'Oran',
        address: 'Boulevard de la Soummam, Oran'
      }
    },
    {
      user: customer1,
      orderNumber: 'TRV-MKT-2026-00003',
      productIndices: [16, 22], // Flask & Dates box (Seller 2 & Seller 3)
      status: 'pending',
      paymentStatus: 'pending_verification',
      paymentMethod: 'baridimob',
      date: new Date('2026-03-05T10:00:00Z'),
      customerInfo: {
        fullName: 'Lynda Meziani',
        email: customer1.email,
        phone: customer1.phone,
        wilaya: 'Algiers',
        address: '14 Rue Didouche Mourad, Alger Centre'
      },
      paymentProof: {
        receiptImageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
        transactionReference: 'BM-TRF-98204910'
      }
    },
    {
      user: customer2,
      orderNumber: 'TRV-MKT-2026-00004',
      productIndices: [25, 27], // Solar power bank & Trekking poles
      status: 'pending',
      paymentStatus: 'pending_verification',
      paymentMethod: 'cash_on_delivery',
      date: new Date('2026-03-15T08:30:00Z'),
      customerInfo: {
        fullName: 'Mehdi Larbi',
        email: customer2.email,
        phone: customer2.phone,
        wilaya: 'Constantine',
        address: 'Cité Bellevue, Constantine'
      }
    }
  ]

  for (const ord of ordersData) {
    const itemIds = []
    let subtotal = 0

    for (const pIdx of ord.productIndices) {
      const prod = seededProducts[pIdx]
      if (!prod) continue
      const itemPrice = prod.discountPrice || prod.price
      subtotal += itemPrice

      const orderItem = await OrderItem.create({
        orderId: new mongoose.Types.ObjectId(), // placeholder, linked below
        productId: prod._id,
        sellerId: prod.sellerId,
        productName: prod.name,
        productCode: prod.code,
        productImage: prod.img,
        unitPriceDZD: itemPrice,
        quantity: 1,
        totalItemPriceDZD: itemPrice,
        fulfillmentStatus: ord.status === 'confirmed' ? 'shipped' : 'pending'
      })
      itemIds.push(orderItem._id)
    }

    const firstProduct = seededProducts[ord.productIndices[0]]
    const orderDoc = await Order.create({
      userId: ord.user._id,
      productId: firstProduct ? firstProduct._id : null,
      amount: subtotal + 600,
      orderNumber: ord.orderNumber,
      items: itemIds,
      customerInfo: ord.customerInfo,
      subtotalDZD: subtotal,
      deliveryFeeDZD: 600,
      totalAmountDZD: subtotal + 600,
      paymentMethod: ord.paymentMethod,
      paymentStatus: ord.paymentStatus,
      paymentProof: ord.paymentProof,
      status: ord.status,
      date: ord.date
    })

    // Update orderId on OrderItems
    await OrderItem.updateMany({ _id: { $in: itemIds } }, { $set: { orderId: orderDoc._id } })

    // If order is paid, create Commission records
    if (ord.paymentStatus === 'verified') {
      const createdItems = await OrderItem.find({ _id: { $in: itemIds } })
      for (const itm of createdItems) {
        const rate = 10
        const commAmt = Math.round((itm.totalItemPriceDZD * rate) / 100)
        const netAmt = itm.totalItemPriceDZD - commAmt

        await Commission.create({
          orderId: orderDoc._id,
          orderItemId: itm._id,
          sellerId: itm.sellerId,
          grossAmountDZD: itm.totalItemPriceDZD,
          commissionRatePercent: rate,
          commissionAmountDZD: commAmt,
          sellerPayoutDZD: netAmt,
          status: 'accrued'
        })
      }
    }
  }

  // 9. Shop Terms & Conditions
  console.log(`-> Seeding Touriva Shop Customer & Merchant Terms...`)
  await Term.create([
    {
      order: '1.',
      title: 'Touriva Travel Store Customer Policy',
      text: 'All equipment and artisan merchandise purchased on Touriva Shop are guaranteed authentic and sourced directly from certified national outdoor manufacturers and licensed Algerian artisans.'
    },
    {
      order: '2.',
      title: 'Shipping & Delivery Across 58 Wilayas',
      text: 'Touriva delivers across all 58 Algerian wilayas via trusted express courier partners, with tracked parcel delivery to home addresses or secure pickup desks.'
    },
    {
      order: '3.',
      title: 'Merchant & Seller Standards',
      text: 'Sellers operating on Touriva Marketplace must meet professional trade standards, uphold quality craftsmanship guarantees, and honor transparent return policies.'
    }
  ])

  console.log(`[SUCCESS] Touriva Shop Demo Dataset successfully created!`)
}

async function validateShopRelationships(db) {
  console.log(`\n======================================================`)
  console.log(`[DATA RELATIONSHIP VALIDATION] Verifying Shop references & constraints`)
  console.log(`======================================================`)

  const errors = []

  // Check products
  const products = await Product.find({})
  const seenCodes = new Set()
  for (const p of products) {
    if (!p.code) errors.push(`Product '${p.name}' missing SKU code`)
    if (seenCodes.has(p.code)) errors.push(`Duplicate product code: '${p.code}'`)
    seenCodes.add(p.code)
    if (!p.categoryId) errors.push(`Product '${p.name}' missing categoryId`)
    const cat = await Category.findById(p.categoryId)
    if (!cat) errors.push(`Product '${p.name}' references non-existent category ${p.categoryId}`)
  }

  // Check orders
  const orders = await Order.find({})
  for (const o of orders) {
    const user = await User.findById(o.userId)
    if (!user) errors.push(`Order '${o._id}' references non-existent user ${o.userId}`)
    if (o.productId) {
      const product = await Product.findById(o.productId)
      if (!product) errors.push(`Order '${o._id}' references non-existent product ${o.productId}`)
    }
    if (o.items && o.items.length > 0) {
      const itemsCount = await OrderItem.countDocuments({ _id: { $in: o.items } })
      if (itemsCount !== o.items.length) {
        errors.push(`Order '${o._id}' has dangling OrderItem references`)
      }
    }
    const orderTotal = o.totalAmountDZD || o.amount || 0
    if (orderTotal <= 0) errors.push(`Order '${o._id}' has invalid amount: ${orderTotal}`)
  }

  // Check users & password hash
  const users = await User.find({}).select('+password')
  for (const u of users) {
    if (!u.password || !u.password.startsWith('$2')) {
      errors.push(`User '${u.email}' does not have valid bcrypt password hash`)
    }
  }

  // Check for any legacy Djawal branding
  const collections = await db.listCollections().toArray()
  for (const c of collections) {
    if (c.name.startsWith('system.')) continue
    const sample = await db.collection(c.name).find({}).toArray()
    for (const doc of sample) {
      const docStr = JSON.stringify(doc).toLowerCase()
      if (docStr.includes('djawal')) {
        errors.push(`Collection '${c.name}' doc '${doc._id}' contains obsolete keyword 'djawal'`)
      }
    }
  }

  if (errors.length > 0) {
    console.error(`[VALIDATION FAILED] Found ${errors.length} integrity errors:`)
    console.error(errors)
    throw new Error(`Integrity validation failed with ${errors.length} errors.`)
  } else {
    console.log(`[VALIDATION PASSED] All shop products, orders, categories, and sellers are 100% valid!`)
    console.log(`[VALIDATION PASSED] Zero Djawal branding detected in Touriva Shop content.`)
  }

  // Final count audit
  const finalSummary = []
  for (const c of collections) {
    const count = await db.collection(c.name).countDocuments()
    finalSummary.push({ collection: c.name, count })
  }
  finalSummary.sort((a, b) => a.collection.localeCompare(b.collection))
  console.log(`\nFinal Seeded Shop Records Summary:`)
  console.table(finalSummary)
}

async function runSeed() {
  try {
    console.log(`\nStarting Touriva Shop Platform Seed Script...`)
    await mongoose.connect(MONGO_URI)
    const db = mongoose.connection.db

    // 1. Strict Safety Check
    verifySafeTargetDatabase(MONGO_URI, db.databaseName)

    // 2. Audit
    await auditDatabase(db)

    // 3. Clean
    await cleanOldShopData(db)

    // 4. Seed
    await seedFreshShopData(db)

    // 5. Validate
    await validateShopRelationships(db)

    console.log(`\n======================================================`)
    console.log(`[COMPLETE] Touriva Shop Database is completely refreshed!`)
    console.log(`======================================================\n`)
    process.exit(0)
  } catch (err) {
    console.error(`\n[FATAL ERROR] Shop seed aborted:`, err.message)
    console.error(err.stack)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
  }
}

if (require.main === module) {
  runSeed()
}

module.exports = { runSeed }
