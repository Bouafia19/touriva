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
    role: 'administrator', // Seller portal uses administrator role for CASL access
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
    role: 'administrator',
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
    role: 'administrator',
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
  for (const p of productsData) {
    const category = seededCategories[p.categoryIndex]
    const brand = seededBrands[p.brandIndex]
    const product = await Product.create({
      code: p.code,
      name: p.name,
      price: p.price,
      description: p.description,
      img: p.img,
      categoryId: category ? category._id : null,
      brandId: brand ? brand._id : null,
      thumbnails: p.thumbnails || [p.img],
      features: p.features || [],
      published: true
    })
    seededProducts.push(product)
  }

  // 8. Demo Shop Customer Orders (10 realistic orders)
  console.log(`-> Seeding Verified Shop Orders...`)
  const ordersData = [
    {
      user: customer1._id,
      productIndex: 0, // Sahara tent
      quantity: 1,
      status: 'confirmed',
      date: new Date('2026-02-10T11:30:00Z'),
      description: 'Delivery to Hydra, Alger. Contact before arrival.'
    },
    {
      user: customer1._id,
      productIndex: 8, // Tuareg chèche
      quantity: 2,
      status: 'completed',
      date: new Date('2026-02-14T09:15:00Z'),
      description: 'Gift packaging requested.'
    },
    {
      user: customer2._id,
      productIndex: 4, // Atlas 65L backpack
      quantity: 1,
      status: 'confirmed',
      date: new Date('2026-02-20T16:45:00Z'),
      description: 'Express shipping to Oran Centre.'
    },
    {
      user: customer2._id,
      productIndex: 12, // Brass teapot set
      quantity: 1,
      status: 'completed',
      date: new Date('2026-03-01T14:20:00Z'),
      description: 'Fragile handling required.'
    },
    {
      user: customer1._id,
      productIndex: 16, // Stainless flask
      quantity: 2,
      status: 'pending',
      date: new Date('2026-03-05T10:00:00Z'),
      description: 'Payment via Edahabia card pending confirmation.'
    },
    {
      user: customer2._id,
      productIndex: 22, // Deglet Nour dates box
      quantity: 4,
      status: 'completed',
      date: new Date('2026-03-10T12:00:00Z'),
      description: 'Ramadan gift order.'
    },
    {
      user: customer1._id,
      productIndex: 25, // Solar power bank
      quantity: 1,
      status: 'confirmed',
      date: new Date('2026-03-15T08:30:00Z'),
      description: 'Delivery before weekend desert trip.'
    },
    {
      user: customer2._id,
      productIndex: 27, // Trekking poles
      quantity: 1,
      status: 'cancelled',
      date: new Date('2026-03-18T19:00:00Z'),
      description: 'Customer selected alternative model.'
    },
    {
      user: customer1._id,
      productIndex: 28, // First aid kit
      quantity: 1,
      status: 'pending',
      date: new Date('2026-03-22T17:10:00Z'),
      description: 'Standard delivery to Kouba, Alger.'
    },
    {
      user: customer2._id,
      productIndex: 5, // Leather duffel
      quantity: 1,
      status: 'confirmed',
      date: new Date('2026-03-25T13:40:00Z'),
      description: 'Priority courier delivery to Tlemcen.'
    }
  ]

  for (const ord of ordersData) {
    const product = seededProducts[ord.productIndex]
    if (product) {
      await Order.create({
        userId: ord.user,
        productId: product._id,
        amount: product.price * ord.quantity,
        date: ord.date,
        description: ord.description,
        status: ord.status
      })
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
    const product = await Product.findById(o.productId)
    if (!product) errors.push(`Order '${o._id}' references non-existent product ${o.productId}`)
    if (o.amount <= 0) errors.push(`Order '${o._id}' has invalid amount: ${o.amount}`)
  }

  // Check users & password hash
  const users = await User.find({})
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
