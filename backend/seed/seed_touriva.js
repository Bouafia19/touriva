/**
 * Touriva Core Platform — High Quality Demo Dataset Seeder
 * 
 * Safety Guarantees:
 * 1. NEVER touches Djawal or any non-Touriva database.
 * 2. Strictly verifies database name equals 'touriva'.
 * 3. Pre-audit report before any destructive operations.
 * 4. Preserves 2dsphere indexes and collections structures.
 * 5. Full referential integrity validation.
 */

require('dotenv').config({ path: __dirname + '/../.env' })
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

// Models
const User = require('../models/User')
const Role = require('../models/Role')
const Hotel = require('../models/Hotel')
const Restaurant = require('../models/Restaurant')
const Site = require('../models/Site')
const Activity = require('../models/Activity')
const Trip = require('../models/Trip')
const TripSubscription = require('../models/TripSubscription')
const Partner = require('../models/Partner')
const Category = require('../models/Category')
const Publication = require('../models/Publication')
const Announcement = require('../models/Announcement')
const Plan = require('../models/Plan')
const Billing = require('../models/Billing')
const Term = require('../models/Term')
const Brand = require('../models/Brand')
const Wilaya = require('../models/Wilaya')
const Daira = require('../models/Daira')
const Commune = require('../models/Commune')

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/touriva'
const TARGET_DB_NAME = 'touriva'
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
  console.log(`[PHASE 1 - DATABASE AUDIT] Connection & Collections`)
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

async function cleanOldTourivaData(db) {
  console.log(`\n======================================================`)
  console.log(`[PHASE 2 - CLEAN OLD TOURIVA DATA] Removing inherited & test records`)
  console.log(`======================================================`)

  const collectionsToClean = [
    'hotels',
    'restaurants',
    'sites',
    'activities',
    'trips',
    'tripsubscriptions',
    'users',
    'roles',
    'partners',
    'categories',
    'publications',
    'announcements',
    'plans',
    'billings',
    'terms',
    'brands'
  ]

  const cleanupSummary = []

  for (const collName of collectionsToClean) {
    const coll = db.collection(collName)
    const beforeCount = await coll.countDocuments()
    await coll.deleteMany({})
    cleanupSummary.push({ collection: collName, deletedRecords: beforeCount, remaining: 0 })
  }

  console.table(cleanupSummary)
  console.log(`[SUCCESS] Preserved administrative geography (wilayas, dairas, communes) and all indexes intact.`)
}

async function seedFreshDemoData(db) {
  console.log(`\n======================================================`)
  console.log(`[PHASE 3 - SEED FRESH TOURIVA DEMO DATASET]`)
  console.log(`======================================================`)

  // Pre-fetch geography references
  const wilayaList = await Wilaya.find({})
  const wilayaMap = {}
  for (const w of wilayaList) {
    wilayaMap[w.name] = w._id
  }

  // Helper to fetch valid daira and commune for a given wilaya
  async function getGeoHierarchy(wilayaName) {
    const wId = wilayaMap[wilayaName]
    if (!wId) return { wilayaId: null, dairaId: null, communeId: null }
    const daira = await Daira.findOne({ wilayaId: wId })
    const commune = daira ? await Commune.findOne({ dairaId: daira._id }) : null
    return {
      wilayaId: wId,
      dairaId: daira ? daira._id : null,
      communeId: commune ? commune._id : null
    }
  }

  // 1. Roles for Admin CASL Abilities
  console.log(`-> Seeding Admin Panel Permissions (CASL Roles)...`)
  const roleSubjects = [
    'Dashboard', 'Users', 'Hotels', 'Restaurants', 'Sites', 'Trips',
    'TripSubscriptions', 'Activities', 'Location', 'Billing', 'Detail',
    'Notifications', 'Ads', 'Publications', 'AdminCategories', 'TermsConditions',
    'Settings', 'About', 'Brands', 'Roles', 'Account', 'Company', 'Plans'
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

  // 3. Demo Users & Tourism Partners
  console.log(`-> Seeding Authenticated Users & Tourism Partners...`)
  const geoAlger = await getGeoHierarchy('Alger')
  const geoDjanet = await getGeoHierarchy('Djanet')
  const geoOran = await getGeoHierarchy('Oran')
  const geoGhardaia = await getGeoHierarchy('Ghardaïa')
  const geoConstantine = await getGeoHierarchy('Constantine')

  // Core Platform Administrator
  const adminUser = await User.create({
    email: 'admin@touriva.test',
    firstName: 'Admin',
    lastName: 'Touriva',
    phone: '+213550000001',
    password: passwordHash,
    role: 'administrator',
    typeAccount: 'others',
    activated: true,
    complete: true,
    status: true,
    fileStatus: 'confirmed',
    authorizationIds: seededRoles,
    wilayaId: geoAlger.wilayaId,
    dairaId: geoAlger.dairaId,
    communeId: geoAlger.communeId
  })

  // Certified National Tour Guide
  const guideUser1 = await User.create({
    email: 'guide@touriva.test',
    firstName: 'Amine',
    lastName: 'Mansouri',
    phone: '+213550000002',
    password: passwordHash,
    role: 'partner',
    typeAccount: 'touristGuide',
    guideType: 'nationalGuide',
    hasLicense: true,
    companyName: 'Touriva Saharan Expeditions',
    activated: true,
    complete: true,
    status: true,
    fileStatus: 'confirmed',
    wilayaId: geoDjanet.wilayaId,
    dairaId: geoDjanet.dairaId,
    communeId: geoDjanet.communeId
  })

  // Local Desert Guide (Tuareg Nomad Guide)
  const guideUser2 = await User.create({
    email: 'guide.sahara@touriva.test',
    firstName: 'Moussa',
    lastName: 'Ag Othman',
    phone: '+213550000003',
    password: passwordHash,
    role: 'partner',
    typeAccount: 'touristGuide',
    guideType: 'localGuide',
    hasLicense: true,
    companyName: 'Tassili Nomad Tours',
    activated: true,
    complete: true,
    status: true,
    fileStatus: 'confirmed',
    wilayaId: geoDjanet.wilayaId,
    dairaId: geoDjanet.dairaId,
    communeId: geoDjanet.communeId
  })

  // Licensed Tourism Travel Agency
  const agencyUser1 = await User.create({
    email: 'agency@touriva.test',
    firstName: 'Karim',
    lastName: 'Bensalem',
    phone: '+213550000004',
    password: passwordHash,
    role: 'partner',
    typeAccount: 'touristAgencies',
    companyName: 'Numidia Voyages & Expeditions',
    rc: '16/00-0987654A23',
    nif: '002016012345678',
    nis: '12345678901',
    art: '16010045678',
    activated: true,
    complete: true,
    status: true,
    fileStatus: 'confirmed',
    hasLicense: true,
    wilayaId: geoAlger.wilayaId,
    dairaId: geoAlger.dairaId,
    communeId: geoAlger.communeId
  })

  // Casbah Heritage Travel Agency
  const agencyUser2 = await User.create({
    email: 'agency.casbah@touriva.test',
    firstName: 'Yasmine',
    lastName: 'Hadj-Ali',
    phone: '+213550000005',
    password: passwordHash,
    role: 'partner',
    typeAccount: 'touristAgencies',
    companyName: 'Casbah Heritage Travel',
    rc: '16/00-1122334B24',
    activated: true,
    complete: true,
    status: true,
    fileStatus: 'confirmed',
    hasLicense: true,
    wilayaId: geoAlger.wilayaId,
    dairaId: geoAlger.dairaId,
    communeId: geoAlger.communeId
  })

  // Hotel Hospitality Partner
  const hotelPartner = await User.create({
    email: 'hotel@touriva.test',
    firstName: 'Sofiane',
    lastName: 'Cherif',
    phone: '+213550000006',
    password: passwordHash,
    role: 'partner',
    typeAccount: 'others',
    companyName: 'El Aurassi Hospitality Group',
    activated: true,
    complete: true,
    status: true,
    fileStatus: 'confirmed',
    wilayaId: geoAlger.wilayaId,
    dairaId: geoAlger.dairaId,
    communeId: geoAlger.communeId
  })

  // Desert Lodge Partner
  const lodgePartner = await User.create({
    email: 'lodge.djanet@touriva.test',
    firstName: 'Ahmed',
    lastName: 'Belkacem',
    phone: '+213550000007',
    password: passwordHash,
    role: 'partner',
    typeAccount: 'others',
    companyName: 'Tassili Eco-Lodge Djanet',
    activated: true,
    complete: true,
    status: true,
    fileStatus: 'confirmed',
    wilayaId: geoDjanet.wilayaId,
    dairaId: geoDjanet.dairaId,
    communeId: geoDjanet.communeId
  })

  // Traditional Gastronomy Partner
  const restaurantPartner = await User.create({
    email: 'restaurant.demo@touriva.test',
    firstName: 'Nadia',
    lastName: 'Bouzid',
    phone: '+213550000008',
    password: passwordHash,
    role: 'partner',
    typeAccount: 'others',
    companyName: 'Dar El Dey Gastronomie',
    activated: true,
    complete: true,
    status: true,
    fileStatus: 'confirmed',
    wilayaId: geoAlger.wilayaId,
    dairaId: geoAlger.dairaId,
    communeId: geoAlger.communeId
  })

  // Tourism & Heritage Preservation Association
  const associationUser = await User.create({
    email: 'association.demo@touriva.test',
    firstName: 'Omar',
    lastName: 'Kaddour',
    phone: '+213550000009',
    password: passwordHash,
    role: 'partner',
    typeAccount: 'associations',
    companyName: 'Association Sauvegarde du Patrimoine M’Zab',
    activated: true,
    complete: true,
    status: true,
    fileStatus: 'confirmed',
    wilayaId: geoGhardaia.wilayaId,
    dairaId: geoGhardaia.dairaId,
    communeId: geoGhardaia.communeId
  })

  // Customer / Traveler Accounts
  const customerUser1 = await User.create({
    email: 'customer@touriva.test',
    firstName: 'Lynda',
    lastName: 'Meziani',
    phone: '+213550000010',
    password: passwordHash,
    role: 'client',
    typeAccount: 'visitor',
    activated: true,
    complete: true,
    status: true,
    fileStatus: 'confirmed',
    wilayaId: geoAlger.wilayaId,
    dairaId: geoAlger.dairaId,
    communeId: geoAlger.communeId
  })

  const customerUser2 = await User.create({
    email: 'traveler2@touriva.test',
    firstName: 'Mehdi',
    lastName: 'Larbi',
    phone: '+213550000011',
    password: passwordHash,
    role: 'client',
    typeAccount: 'visitor',
    activated: true,
    complete: true,
    status: true,
    fileStatus: 'confirmed',
    wilayaId: geoOran.wilayaId,
    dairaId: geoOran.dairaId,
    communeId: geoOran.communeId
  })

  // 4. Partner Directory
  console.log(`-> Seeding Partner Directory...`)
  await Partner.create([
    {
      name: 'Numidia Voyages & Expeditions',
      nameFr: 'Numidia Voyages & Expéditions',
      nameAr: 'نوميديا للأسفار والرحلات الاستكشافية',
      description: 'Accredited national tourism operator specializing in Sahara expeditions and cultural circuits across Algeria.',
      descriptionFr: 'Opérateur touristique national agréé, spécialiste des expéditions sahariennes et des circuits culturels algériens.',
      descriptionAr: 'وكالة سياحية وطنية معتمدة متخصصة في الرحلات الصحراوية والمسارات الثقافية عبر الجزائر.',
      photo: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Touriva Saharan Guides Cooperative',
      nameFr: 'Coopérative des Guides Sahariens Touriva',
      nameAr: 'تعاونية المرشدين الصحراويين توريفا',
      description: 'Professional cooperative of certified Algerian Saharan guides with decades of deep desert expertise in Tassili and Hoggar.',
      descriptionFr: 'Coopérative professionnelle de guides sahariens certifiés avec une connaissance intime du Tassili et du Hoggar.',
      descriptionAr: 'تعاونية مهنية من المرشدين الصحراويين المعتمدين ذوي الخبرة العميقة في طاسيلي والهقار.',
      photo: 'https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'El Aurassi Hospitality Group',
      nameFr: 'Groupe Hôtelier El Aurassi',
      nameAr: 'مجموعة الأوراسي الفندقية',
      description: 'Flagship Algerian luxury hospitality group perched above the Bay of Algiers offering premier Mediterranean accommodations.',
      descriptionFr: 'Groupe hôtelier d’excellence surplombant la baie d’Alger offrant une hospitalité méditerranéenne raffinée.',
      descriptionAr: 'مجموعة فندقية راقية تطل على خليج الجزائر وتقدم أرقى خدمات الضيافة المتوسطية.',
      photo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Tassili Nomad Tours',
      nameFr: 'Tassili Nomad Tours',
      nameAr: 'طاسيلي نوماد تورز',
      description: 'Authentic Tuareg bivouac and 4x4 expedition provider based in Djanet, committed to sustainable Saharan ecotourism.',
      descriptionFr: 'Prestataire de bivouacs et expéditions 4x4 basé à Djanet, engagé pour l’écotourisme saharien durable.',
      descriptionAr: 'منظم رحلات سفاري ومخيمات صحراوية تقليدية في جانت ملتزم بالسياحة البيئية المستدامة.',
      photo: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Casbah Heritage Travel Agency',
      nameFr: 'Agence Patrimoine de la Casbah',
      nameAr: 'وكالة تراث القصبة للسياحة',
      description: 'Boutique cultural agency dedicated to guided historical walking odysseys through the UNESCO Casbah and Ottoman landmarks.',
      descriptionFr: 'Agence culturelle dédiée aux visites guidées de la Casbah d’Alger et des palais ottomans historiques.',
      descriptionAr: 'وكالة سياحية متخصصة في الجولات الإرشادية لقصبة الجزائر والقصور العثمانية التاريخية.',
      photo: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'M’Zab Valley Cultural Association',
      nameFr: 'Association Culturelle de la Vallée du M’Zab',
      nameAr: 'الجمعية الثقافية لوادي ميزاب',
      description: 'Local heritage conservation network managing sustainable cultural walks through the fortified Ksars of Ghardaïa.',
      descriptionFr: 'Réseau de valorisation du patrimoine gérant les visites guidées des Ksars fortifiés de Ghardaïa.',
      descriptionAr: 'جمعية محلية لحماية التراث وتنظيم الجولات الثقافية في قصور وادي ميزاب المصنفة عالميا.',
      photo: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80'
    }
  ])

  // 5. Tourism Categories
  console.log(`-> Seeding Tourism Categories...`)
  const seededCategories = await Category.create([
    {
      name: 'Sahara & Desert Expeditions',
      img: 'https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=800&q=80',
      typeAccount: 'none'
    },
    {
      name: 'UNESCO Heritage & Ancient Cities',
      img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
      typeAccount: 'none'
    },
    {
      name: 'Mediterranean Coastal Escapes',
      img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      typeAccount: 'none'
    },
    {
      name: 'Gastronomy & Culinary Traditions',
      img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      typeAccount: 'none'
    },
    {
      name: 'Mountain Treks & Natural Parks',
      img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
      typeAccount: 'none'
    },
    {
      name: 'Artisan Workshops & Living Terroir',
      img: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
      typeAccount: 'none'
    }
  ])

  // 6. Tourism Activities (24 activities)
  console.log(`-> Seeding Tourism Activities Catalog...`)
  const activityNames = [
    'Sahara 4x4 Dune Exploration',
    'Tassili n’Ajjer Prehistoric Rock Art Trek',
    'Djanet Starlight Desert Camping',
    'Ghardaïa M’Zab Pentapolis Cultural Walk',
    'Algiers Casbah UNESCO Guided Tour',
    'Tipaza Roman Antiquities & Maritime Park',
    'Béjaïa Cap Carbon Mountain Hiking',
    'Jijel Corniche Sea Kayaking & Grottos',
    'Constantine Suspension Bridges & Gorge Walk',
    'Tlemcen Zianide Royal Architecture Tour',
    'Traditional Algerian Culinary Masterclass',
    'Sahara Sunset Camel Caravan Expedition',
    'Saharan Wilderness Photography Masterclass',
    'M’Zab Valley Traditional Weaving Workshop',
    'Djemila Roman Amphitheatre & Forum Walk',
    'Timimoun Red Oasis Bicycle Discovery',
    'Hoggar Assekrem Sunrise Pilgrimage',
    'Biskra Ziban Oasis & Date Harvest Tour',
    'Mediterranean Marine Scuba Diving',
    'Aurès Canyons & Ghoufi Balconies Trek',
    'Cherchell Ancient Numidian Museum Walk',
    'Sétif Ain El Fouara & Archaeology Trail',
    'Tuareg Desert Music & Acoustic Night',
    'Kabyle Silver Jewelry Crafting Workshop'
  ]

  for (const name of activityNames) {
    await Activity.create({ name })
  }

  // 7. Partner Subscription Plans & Billings
  console.log(`-> Seeding Partner Membership Plans & Billing...`)
  const planGuide = await Plan.create({
    name: 'Guide Touristique Certifié Touriva',
    price: '12000',
    description: 'Annual verified accreditation for licensed Algerian national and local tourist guides.'
  })

  const planAgency = await Plan.create({
    name: 'Agence de Voyages Agréée',
    price: '36000',
    description: 'Premier operator subscription with multi-day excursion publishing and client booking management.'
  })

  const planHotel = await Plan.create({
    name: 'Partenaire Hôtelier Premium',
    price: '55000',
    description: 'High visibility hotel showcase with verified booking inquiries and destination highlights.'
  })

  await Billing.create([
    {
      userId: guideUser1._id,
      planId: planGuide._id,
      amount: 12000,
      paymentMethod: 'CIB / Edahabia',
      status: 'confirmed',
      billingDate: new Date('2026-01-15')
    },
    {
      userId: agencyUser1._id,
      planId: planAgency._id,
      amount: 36000,
      paymentMethod: 'Virement Bancaire BNA',
      status: 'confirmed',
      billingDate: new Date('2026-02-01')
    },
    {
      userId: hotelPartner._id,
      planId: planHotel._id,
      amount: 55000,
      paymentMethod: 'CIB / Edahabia',
      status: 'confirmed',
      billingDate: new Date('2026-03-01')
    }
  ])

  // 8. Hotels (18 verified authentic accommodations across Algeria)
  console.log(`-> Seeding Authentic Algerian Hotels & Desert Lodges...`)
  const hotelsData = [
    {
      name: 'Hôtel El Aurassi',
      address: '02 Boulevard Frantz Fanon, Les Tagarins, Alger',
      rating: 4.8,
      latitude: 36.7725,
      longitude: 3.0528,
      wilayaName: 'Alger',
      phone: '+213 21 74 82 52',
      description: 'Iconic 5-star modernist hotel crowning the hills of Algiers, boasting sweeping Mediterranean panoramic views, Olympic pool, and gourmet dining.',
      photo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Sofitel Algiers Hamma Garden',
      address: '172 Rue Hassiba Ben Bouali, El Hamma, Alger',
      rating: 4.7,
      latitude: 36.7485,
      longitude: 3.0735,
      wilayaName: 'Alger',
      phone: '+213 21 68 52 10',
      description: 'Refined luxury hospitality bordered by the historic Jardin d’Essai botanical gardens, featuring French elegance and Algerian warmth.',
      photo: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Royal Hotel Oran',
      address: '01 Boulevard de la Soummam, Oran Centre',
      rating: 4.8,
      latitude: 35.6985,
      longitude: -0.6335,
      wilayaName: 'Oran',
      phone: '+213 41 29 17 17',
      description: 'Historic Belle Époque palace hotel in the cultural heart of Oran, adorned with master paintings, wellness spa, and fine dining.',
      photo: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Le Méridien Oran Hotel & Convention Centre',
      address: 'Les Genêts, Chemin des Crêtes, Oran',
      rating: 4.6,
      latitude: 35.7275,
      longitude: -0.5840,
      wilayaName: 'Oran',
      phone: '+213 41 98 40 00',
      description: 'Contemporary cliffside hotel towering over the Mediterranean Sea, offering seaside terraces, an infinity pool, and luxury suites.',
      photo: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Constantine Marriott Hotel',
      address: 'Route des Falaises, Constantine',
      rating: 4.9,
      latitude: 36.3575,
      longitude: 6.6110,
      wilayaName: 'Constantine',
      phone: '+213 31 73 10 00',
      description: 'Palatial luxury perched high on the cliffs of the Rhumel River, blending Arab-Moorish architectural grandeur with world-class hospitality.',
      photo: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Grand Hôtel Cirta',
      address: '01 Avenue Rahmani Cherif, Constantine',
      rating: 4.5,
      latitude: 36.3648,
      longitude: 6.6095,
      wilayaName: 'Constantine',
      phone: '+213 31 92 68 40',
      description: 'Authentic neoclassical jewel in the center of the City of Bridges, rich in history, oriental arches, and vintage hospitality.',
      photo: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Hôtel Les Hammadites',
      address: 'Plage des Aiguades, Route de Cap Carbon, Béjaïa',
      rating: 4.4,
      latitude: 36.7620,
      longitude: 5.0880,
      wilayaName: 'Béjaïa',
      phone: '+213 34 16 22 22',
      description: 'Seaside resort located right on the turquoise gulf of Béjaïa, near the Cap Carbon national reserve and monkey cliff nature trails.',
      photo: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Renaissance Tlemcen Hotel',
      address: 'Plateau Lalla Setti, Tlemcen',
      rating: 4.9,
      latitude: 34.8625,
      longitude: -1.3090,
      wilayaName: 'Tlemcen',
      phone: '+213 43 40 11 11',
      description: 'Majestic Arabo-Andalusian palace perched atop the Lalla Setti plateau with breathtaking vistas over historic Tlemcen and mountain forests.',
      photo: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Hôtel Les Zianides',
      address: 'Boulevard Khedim Ali, Tlemcen',
      rating: 4.3,
      latitude: 34.8810,
      longitude: -1.3180,
      wilayaName: 'Tlemcen',
      phone: '+213 43 20 60 00',
      description: 'Comfortable Andalusian-styled hotel nestled within lush gardens in central Tlemcen, close to the Mechouar royal palace.',
      photo: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Hôtel Jugurtha Palace',
      address: 'Boulevard de l’Oasis, Biskra',
      rating: 4.5,
      latitude: 34.8450,
      longitude: 5.7210,
      wilayaName: 'Biskra',
      phone: '+213 33 74 15 15',
      description: 'Gateway to the Sahara hotel oasis surrounded by towering date palms, outdoor thermal swimming pools, and traditional tent salons.',
      photo: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Tassili Desert Eco-Lodge',
      address: 'Oasis d’Iharir, Djanet',
      rating: 4.9,
      latitude: 24.5510,
      longitude: 9.4820,
      wilayaName: 'Djanet',
      phone: '+213 29 47 18 20',
      description: 'Authentic Saharan eco-lodge blending local sandstone architecture with solar energy, panoramic dunes, and campfire stargazing nights.',
      photo: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Djanet Erg Admer Desert Camp',
      address: 'Dunes d’Erg Admer, Djanet',
      rating: 4.8,
      latitude: 24.5800,
      longitude: 9.3900,
      wilayaName: 'Djanet',
      phone: '+213 29 47 22 11',
      description: 'Luxury nomadic desert bivouac set deep within the golden crests of Erg Admer, serving Bedouin roasted delicacies beneath the Saharan Milky Way.',
      photo: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Maison Traditionnelle d’Hôtes Ghardaïa',
      address: 'Ksar de Beni Isguen, Vallée du M’Zab, Ghardaïa',
      rating: 4.8,
      latitude: 32.4820,
      longitude: 3.6890,
      wilayaName: 'Ghardaïa',
      phone: '+213 29 88 41 33',
      description: 'Charming traditional Mozabite guesthouse in the UNESCO fortified Ksar of Beni Isguen, offering cool clay courtyards and rooftop terraces.',
      photo: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Hôtel Seybouse International',
      address: '01 Rue du 24 Février, Annaba',
      rating: 4.5,
      latitude: 36.8990,
      longitude: 7.7610,
      wilayaName: 'Annaba',
      phone: '+213 38 86 44 44',
      description: 'Prime hotel overlooking the bustling port and Mediterranean corniche of ancient Hippo Regius, featuring modern conference and dining facilities.',
      photo: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Village Touristique CET Tipaza',
      address: 'Complexe Touristique Matarès, Tipaza',
      rating: 4.4,
      latitude: 36.5980,
      longitude: 2.4580,
      wilayaName: 'Tipaza',
      phone: '+213 24 47 70 00',
      description: 'Mediterranean seaside holiday village located directly along sandy beaches and walking distance from the ancient Roman ruins.',
      photo: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Auberge Saharienne de Timimoun',
      address: 'Oasis Rouge, Timimoun',
      rating: 4.7,
      latitude: 29.2620,
      longitude: 0.2350,
      wilayaName: 'Timimoun',
      phone: '+213 49 90 12 30',
      description: 'Stunning neo-Sudanese red clay auberge overlooking the vast palm groves and shimmering salt sebkha of the Gourara desert.',
      photo: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Hôtel Tahat',
      address: 'Route Nationale 1, Tamanrasset',
      rating: 4.3,
      latitude: 22.7910,
      longitude: 5.5180,
      wilayaName: 'Tamanrasset',
      phone: '+213 29 34 11 00',
      description: 'Traditional Tuareg style expedition hotel serving as the premier staging base for expeditions into the volcanic needles of Hoggar and Assekrem.',
      photo: 'https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Hôtel Park Mall Sétif',
      address: 'Boulevard de l’ALN, Sétif',
      rating: 4.7,
      latitude: 36.1915,
      longitude: 5.4095,
      wilayaName: 'Sétif',
      phone: '+213 36 84 90 00',
      description: 'Four-star modern tower hotel located right in central Sétif, featuring panoramic views, fitness center, and proximity to Ain El Fouara.',
      photo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
    }
  ]

  for (const h of hotelsData) {
    const geo = await getGeoHierarchy(h.wilayaName)
    await Hotel.create({
      name: h.name,
      address: h.address,
      rating: h.rating,
      latitude: h.latitude,
      longitude: h.longitude,
      location: {
        type: 'Point',
        coordinates: [h.longitude, h.latitude]
      },
      description: h.description,
      phone: h.phone,
      photo: h.photo,
      wilayaId: geo.wilayaId,
      dairaId: geo.dairaId,
      communeId: geo.communeId,
      status: 'published'
    })
  }

  // 9. Restaurants (18 authentic Algerian dining establishments)
  console.log(`-> Seeding Authentic Algerian Restaurants & Gastronomy...`)
  const restaurantsData = [
    {
      name: 'Restaurant Dar El Dey',
      address: 'Rue de la Casbah, Alger',
      rating: 4.8,
      latitude: 36.7850,
      longitude: 3.0610,
      wilayaName: 'Alger',
      phone: '+213 21 73 14 20',
      description: 'Authentic palace dining inside an Ottoman Casbah residence serving traditional Rechta algéroise, Couscous royal, and almond pastries with orange blossom water.',
      photo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Restaurant El Babor',
      address: 'Port de Pêche de La Pêcherie, Alger',
      rating: 4.7,
      latitude: 36.7800,
      longitude: 3.0680,
      wilayaName: 'Alger',
      phone: '+213 21 71 85 90',
      description: 'Famed harbor restaurant specializing in freshly caught Mediterranean sea bass, grilled red prawns, and bouillabaisse algéroise overlooking the marina.',
      photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Restaurant Le Corsaire',
      address: 'Corniche d’Aïn El Turk, Oran',
      rating: 4.6,
      latitude: 35.7440,
      longitude: -0.7480,
      wilayaName: 'Oran',
      phone: '+213 41 41 22 30',
      description: 'Seaside dining terrace on the Oran coast renowned for Mediterranean seafood paella, grilled dorade, and fresh calamares accompanied by coastal breezes.',
      photo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Restaurant La Casbah d’Oran',
      address: 'Rue Mohamed Khemisti, Oran Centre',
      rating: 4.7,
      latitude: 35.7010,
      longitude: -0.6350,
      wilayaName: 'Oran',
      phone: '+213 41 33 19 80',
      description: 'Classic western Algerian culinary landmark celebrated for its authentic Calentica with cumin, Tajine Zitoune, and slow-braised lamb shanks.',
      photo: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Restaurant Tiddis',
      address: 'Boulevard Zighoud Youcef, Constantine',
      rating: 4.8,
      latitude: 36.3680,
      longitude: 6.6120,
      wilayaName: 'Constantine',
      phone: '+213 31 92 45 10',
      description: 'Constantinois culinary haven renowned for rich Chakhchoukha constantinoise, handmade Trida pasta with tender chicken, and fragrant Djari soup.',
      photo: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Restaurant Gorges du Rhumel',
      address: 'Pont de Sidi Rached, Constantine',
      rating: 4.6,
      latitude: 36.3620,
      longitude: 6.6150,
      wilayaName: 'Constantine',
      phone: '+213 31 94 30 22',
      description: 'Dramatic cliffside restaurant overlooking the roaring Rhumel gorge, offering savory Tajine Chwa and traditional sweet Djawzia walnut nougat.',
      photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Restaurant Les Hammadites Délices',
      address: 'Boulevard Colonel Amirouche, Béjaïa',
      rating: 4.7,
      latitude: 36.7530,
      longitude: 5.0710,
      wilayaName: 'Béjaïa',
      phone: '+213 34 22 80 15',
      description: 'Celebrated coastal restaurant blending fresh Kabyle olive oil cuisine, steamed barley couscous with wild herbs, and fresh sardines à la chermoula.',
      photo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Restaurant Brise de Mer',
      address: 'Front de Mer, Port de Jijel, Jijel',
      rating: 4.6,
      latitude: 36.8220,
      longitude: 5.7690,
      wilayaName: 'Jijel',
      phone: '+213 34 47 12 40',
      description: 'Beloved seafront terrace where the day’s fishing catch is prepared on open wood grills, served with garlic crust toasts and chilled fruit juices.',
      photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Restaurant El Mordjane',
      address: 'Rue de la Grande Mosquée, Tlemcen',
      rating: 4.8,
      latitude: 34.8820,
      longitude: -1.3120,
      wilayaName: 'Tlemcen',
      phone: '+213 43 27 55 90',
      description: 'Prestigious Tlemcenian gastronomic salon offering savory sweet Pastilla, lamb Barkouk with prunes and toasted almonds, and mint tea.',
      photo: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Restaurant Le Petit Phare',
      address: 'Port Antique Romain, Tipaza',
      rating: 4.7,
      latitude: 36.5940,
      longitude: 2.4490,
      wilayaName: 'Tipaza',
      phone: '+213 24 47 91 10',
      description: 'Charming seaside table nestled right next to the Roman archaeological harbor, famous for grilled Mediterranean squid and seasonal citrus salads.',
      photo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Restaurant Seybouse Marina',
      address: 'Avant-Port de Plaisance, Annaba',
      rating: 4.5,
      latitude: 36.9010,
      longitude: 7.7650,
      wilayaName: 'Annaba',
      phone: '+213 38 84 21 00',
      description: 'Bustling marina establishment serving Annaba’s signature seafood Brik à l’oeuf, grilled swordfish steaks, and Mediterranean fish soup.',
      photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Restaurant Al-Baraka M’Zab',
      address: 'Marché Central de Ghardaïa, Ghardaïa',
      rating: 4.8,
      latitude: 32.4920,
      longitude: 3.6740,
      wilayaName: 'Ghardaïa',
      phone: '+213 29 88 12 34',
      description: 'Authentic oasis family restaurant crafting ancient Mozabite flatbreads, desert-truffle stews (Terfez), and slow-cooked vegetable tagines.',
      photo: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Restaurant Palmeraie des Palmes',
      address: 'Palmeraie de Sidi Okba, Biskra',
      rating: 4.7,
      latitude: 34.8480,
      longitude: 5.7320,
      wilayaName: 'Biskra',
      phone: '+213 33 74 88 00',
      description: 'Atmospheric dining pavilion nestled inside a hundred-year-old date grove, famous for spicy Chakhchoukha de Biskra and Deglet Nour date pastries.',
      photo: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Restaurant Nomade Djanet',
      address: 'Campement d’Iharir, Djanet',
      rating: 4.9,
      latitude: 24.5550,
      longitude: 9.4880,
      wilayaName: 'Djanet',
      phone: '+213 29 47 30 11',
      description: 'Traditional Tuareg camp dining under open Saharan skies, featuring Taguella desert sand bread, charcoal-roasted mutton, and ritual green tea.',
      photo: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Restaurant Caravansérail Timimoun',
      address: 'Ksar Gourara, Timimoun',
      rating: 4.7,
      latitude: 29.2640,
      longitude: 0.2320,
      wilayaName: 'Timimoun',
      phone: '+213 49 90 20 40',
      description: 'Red adobe restaurant featuring authentic earthen-oven bread, spiced desert lamb skewers, and sweet mint infusions with roasted peanuts.',
      photo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Restaurant Hoggar Oasis',
      address: 'Avenue du 1er Novembre, Tamanrasset',
      rating: 4.6,
      latitude: 22.7870,
      longitude: 5.5240,
      wilayaName: 'Tamanrasset',
      phone: '+213 29 34 25 10',
      description: 'Saharan travelers’ gathering spot offering hearty camel stew, dates couscous, and Tuareg hospitality for mountain hikers.',
      photo: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Restaurant Fontaine d’Ain El Fouara',
      address: 'Place de l’Indépendance, Sétif',
      rating: 4.5,
      latitude: 36.1905,
      longitude: 5.4055,
      wilayaName: 'Sétif',
      phone: '+213 36 83 45 60',
      description: 'Historic city-center brass salon serving tender high-plateau mechoui roasted lamb, Berkoukes pasta, and honey-drenched Makroudh.',
      photo: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Restaurant Le Cèdre des Aurès',
      address: 'Route de Lambèse, Batna',
      rating: 4.6,
      latitude: 35.5580,
      longitude: 6.1780,
      wilayaName: 'Batna',
      phone: '+213 33 81 20 90',
      description: 'Mountain culinary sanctuary showcasing authentic Chaoui culinary traditions, forest mushroom tajines, and organic cedar-forest mountain honey.',
      photo: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80'
    }
  ]

  for (const r of restaurantsData) {
    const geo = await getGeoHierarchy(r.wilayaName)
    await Restaurant.create({
      name: r.name,
      address: r.address,
      rating: r.rating,
      latitude: r.latitude,
      longitude: r.longitude,
      location: {
        type: 'Point',
        coordinates: [r.longitude, r.latitude]
      },
      description: r.description,
      phone: r.phone,
      photo: r.photo,
      wilayaId: geo.wilayaId,
      dairaId: geo.dairaId,
      communeId: geo.communeId,
      status: 'published'
    })
  }

  // 10. Cultural Sites & Heritage Landmarks (18 major Algerian destinations)
  console.log(`-> Seeding Cultural Sites & Heritage Landmarks...`)
  const sitesData = [
    {
      name: 'Casbah of Algiers (UNESCO World Heritage)',
      address: 'Casbah, Alger 16000',
      rating: 4.9,
      latitude: 36.7865,
      longitude: 3.0600,
      wilayaName: 'Alger',
      phone: '+213 21 73 00 20',
      description: 'Incomparable Islamic medieval city overlooking the Bay of Algiers, boasting whitewashed Ottoman palaces, narrow stone stairways, and artisanal craft guilds.',
      photo: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Maqam Echahid (Martyrs’ Memorial)',
      address: 'Boulevard Frères Bouadou, El Madania, Alger',
      rating: 4.8,
      latitude: 36.7455,
      longitude: 3.0695,
      wilayaName: 'Alger',
      phone: '+213 21 66 92 00',
      description: 'Iconic 92-meter three stylized palm leaves monument honoring the Algerian national struggle, commanding breathtaking 360-degree views of the capital.',
      photo: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Tipaza Roman Archaeological Park (UNESCO)',
      address: 'Route Nationale 11, Tipaza',
      rating: 4.9,
      latitude: 36.5935,
      longitude: 2.4485,
      wilayaName: 'Tipaza',
      phone: '+213 24 47 01 23',
      description: 'Phenomenal coastal Greco-Roman ruins perched directly against turquoise waves, featuring ancient amphitheaters, basilica mosaics, and Phoenician tombs.',
      photo: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Pont Suspendu de Sidi M’Cid',
      address: 'Gorges du Rhumel, Constantine',
      rating: 4.9,
      latitude: 36.3715,
      longitude: 6.6145,
      wilayaName: 'Constantine',
      phone: '+213 31 92 11 00',
      description: 'World-famous 164-meter suspension bridge suspended 175 meters above the dizzying Rhumel River gorge, linking the kasbah to the Sidi M’Cid monument.',
      photo: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Tassili n’Ajjer National Park (UNESCO)',
      address: 'Plateau du Tassili n’Ajjer, Djanet',
      rating: 5.0,
      latitude: 24.5500,
      longitude: 9.4800,
      wilayaName: 'Djanet',
      phone: '+213 29 47 10 05',
      description: 'One of the most extraordinary open-air prehistoric rock art museums on Earth, featuring 15,000 ancient engravings in a surreal sandstone canyon labyrinth.',
      photo: 'https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Djemila Roman Archaeological City (UNESCO)',
      address: 'Commune de Djemila, Sétif',
      rating: 4.9,
      latitude: 36.3195,
      longitude: 5.7360,
      wilayaName: 'Sétif',
      phone: '+213 36 89 12 00',
      description: 'Cuicul, a mountain Roman town nestled 900 meters above sea level, preserved with forums, temples, Christian basilicas, and peerless floor mosaics.',
      photo: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Timgad Roman Imperial City (UNESCO)',
      address: 'Commune de Timgad, Batna',
      rating: 4.9,
      latitude: 35.4845,
      longitude: 6.4675,
      wilayaName: 'Batna',
      phone: '+213 33 87 10 10',
      description: 'The Pompeii of North Africa, built by Emperor Trajan around 100 AD, famed for its perfect Roman orthogonal grid plan, triumphal arch, and grand theater.',
      photo: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Fort Santa Cruz & Chapelle',
      address: 'Mont Murdjadjo, Oran',
      rating: 4.8,
      latitude: 35.7090,
      longitude: -0.6635,
      wilayaName: 'Oran',
      phone: '+213 41 39 12 00',
      description: 'Impressive 16th-century Spanish stone fortress built atop Mount Murdjadjo 400 meters high, offering staggering views over the port of Mers El Kébir and Oran.',
      photo: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Palais des Raïs (Bastion 23)',
      address: 'Boulevard Amara Rachid, Bab El Oued, Alger',
      rating: 4.7,
      latitude: 36.7875,
      longitude: 3.0635,
      wilayaName: 'Alger',
      phone: '+213 21 73 88 20',
      description: 'Superb 16th-century Ottoman waterfront palace complex featuring hand-carved cedar wood ceilings, painted ceramic tiles, and maritime history exhibitions.',
      photo: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Vallée du M’Zab & Ksars Fortifiés (UNESCO)',
      address: 'Ghardaïa, Beni Isguen, Melika, Bounoura, El Atteuf',
      rating: 4.9,
      latitude: 32.4850,
      longitude: 3.6800,
      wilayaName: 'Ghardaïa',
      phone: '+213 29 88 50 00',
      description: 'Thousand-year-old fortified pentapolis showcasing pastel clay minarets, ancient ancestral water irrigation foggaras, and unique communal urban planning.',
      photo: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Palais Royal El Mechouar',
      address: 'Place El Mechouar, Tlemcen',
      rating: 4.8,
      latitude: 34.8825,
      longitude: -1.3140,
      wilayaName: 'Tlemcen',
      phone: '+213 43 20 45 10',
      description: 'Splendid fortified royal citadel of the Zianide sultans, embellished with Moorish stuccowork, reflecting marble pools, and fragrant orange courtyards.',
      photo: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Cap Carbon & Réserve Naturelle',
      address: 'Parc National de Gouraya, Béjaïa',
      rating: 4.8,
      latitude: 36.7750,
      longitude: 5.1050,
      wilayaName: 'Béjaïa',
      phone: '+213 34 16 00 11',
      description: 'Spectacular limestone sea cliff reaching 220 meters above the Mediterranean, home to one of the world’s tallest lighthouses and wild Barbary macaques.',
      photo: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Grottes Merveilleuses de Jijel',
      address: 'Falaises de Dar El Oued, Corniche de Jijel',
      rating: 4.7,
      latitude: 36.7950,
      longitude: 5.6200,
      wilayaName: 'Jijel',
      phone: '+213 34 49 10 30',
      description: 'Enchanting coastal limestone cavern system discovered in 1917, featuring millions of years old stalactites and stalagmites sculptured into natural art.',
      photo: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Balcons de Ghoufi (Gorges de l’Ighir)',
      address: 'Canyon de Ghoufi, Ghassira, Batna',
      rating: 4.9,
      latitude: 35.0500,
      longitude: 6.1600,
      wilayaName: 'Batna',
      phone: '+213 33 81 15 00',
      description: 'The Grand Canyon of Algeria, carved by Oued Labiod through red cliff terraces, featuring thousand-year-old abandoned Berber cliff villages and palm groves.',
      photo: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Oasis Rouge de Timimoun',
      address: 'Gourara, Timimoun',
      rating: 4.8,
      latitude: 29.2630,
      longitude: 0.2310,
      wilayaName: 'Timimoun',
      phone: '+213 49 90 10 00',
      description: 'Captivating red clay desert town rising like a mirage above the palm oasis, renowned for its ingenious ancient foggara subterranean water systems.',
      photo: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Plateau de l’Assekrem & Ermitage',
      address: 'Monts Hoggar, Parc National de l’Ahaggar, Tamanrasset',
      rating: 5.0,
      latitude: 23.2660,
      longitude: 5.6330,
      wilayaName: 'Tamanrasset',
      phone: '+213 29 34 10 10',
      description: 'Legendary volcanic plateau at 2,728 meters altitude, renowned as offering one of the most sublime sunrise and sunset vistas across the planet.',
      photo: 'https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Basilique Saint Augustin & Hippone Antique',
      address: 'Colline de Bou-Khadra, Annaba',
      rating: 4.8,
      latitude: 36.8830,
      longitude: 7.7520,
      wilayaName: 'Annaba',
      phone: '+213 38 86 12 12',
      description: 'Majestic 19th-century Arabo-Byzantine basilica overlooking the archaeological ruins of Hippo Regius where Saint Augustine taught and wrote.',
      photo: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Ksar de Taghit & Grand Erg Occidental',
      address: 'Vallée de la Saoura, Béchar',
      rating: 4.9,
      latitude: 30.9160,
      longitude: -2.0300,
      wilayaName: 'Béchar',
      phone: '+213 49 82 10 20',
      description: 'The Jewel of the Desert, an 11th-century mud-brick ksar standing in the shadow of majestic 200-meter golden sand dunes and prehistoric rock carvings.',
      photo: 'https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=1200&q=80'
    }
  ]

  for (const s of sitesData) {
    const geo = await getGeoHierarchy(s.wilayaName)
    await Site.create({
      name: s.name,
      address: s.address,
      rating: s.rating,
      latitude: s.latitude,
      longitude: s.longitude,
      location: {
        type: 'Point',
        coordinates: [s.longitude, s.latitude]
      },
      description: s.description,
      phone: s.phone,
      photo: s.photo,
      wilayaId: geo.wilayaId,
      dairaId: geo.dairaId,
      communeId: geo.communeId,
      status: 'published'
    })
  }

  // 11. Multi-Day Curated Excursions & Guided Trips (12 rich trips)
  console.log(`-> Seeding Curated Guided Excursions & Expeditions...`)
  const tripsData = [
    {
      name: 'Sahara Odyssey: Djanet & Tassili n’Ajjer Expedition',
      creator: guideUser1._id,
      wilayaName: 'Djanet',
      image: 'https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=1200&q=80',
      price: '85000',
      rating: 5.0,
      days: [1, 2, 3, 4, 5],
      items: [
        {
          day: 1,
          items: [
            {
              title: 'Arrival in Djanet & Oasis Welcome',
              time: '14:00',
              description: 'Welcome reception at Djanet airport, transfer to eco-lodge, traditional Tuareg tea ceremony, and briefing.',
              lat: 24.5534,
              lng: 9.4848,
              image: 'https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=800&q=80'
            },
            {
              title: 'Sunset over Erg Admer Dunes',
              time: '17:30',
              description: '4x4 excursion to the crest of Erg Admer for golden hour desert photography followed by campfire dinner.',
              lat: 24.5800,
              lng: 9.3900,
              image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80'
            }
          ]
        },
        {
          day: 2,
          items: [
            {
              title: 'Canyon of Essendilene Trekking',
              time: '09:00',
              description: 'Hike into the lush oleander canyon of Essendilene to discover emerald rock pools hidden in sandstone cliffs.',
              lat: 24.8000,
              lng: 9.2000,
              image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'
            }
          ]
        },
        {
          day: 3,
          items: [
            {
              title: 'Tikoubaouine Natural Sandstone Arches',
              time: '10:00',
              description: 'Discovery of dramatic stone arches, ancient Tuareg burial monuments, and prehistoric rock art sites.',
              lat: 24.6500,
              lng: 9.5500,
              image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80'
            }
          ]
        },
        {
          day: 4,
          items: [
            {
              title: 'The Crying Cows (La Vache qui Pleure) Bas-Relief',
              time: '11:00',
              description: 'Visit the world-renowned 7,000-year-old rock carving depicting crying cattle awaiting desert rains.',
              lat: 24.4500,
              lng: 9.6000,
              image: 'https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=800&q=80'
            }
          ]
        },
        {
          day: 5,
          items: [
            {
              title: 'Djanet Old Ksar & Artisanal Souk',
              time: '09:30',
              description: 'Stroll through the old mudbrick ksars of Zelouaz and El Mihan, purchasing Tuareg silver jewelry before departure.',
              lat: 24.5534,
              lng: 9.4848,
              image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'
            }
          ]
        }
      ]
    },
    {
      name: 'Heritage of Algiers: Casbah, Ottoman Palaces & Tipaza Ruins',
      creator: agencyUser1._id,
      wilayaName: 'Alger',
      image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1200&q=80',
      price: '38000',
      rating: 4.9,
      days: [1, 2, 3],
      items: [
        {
          day: 1,
          items: [
            {
              title: 'Casbah of Algiers Walking Tour',
              time: '09:30',
              description: 'Guided descent through UNESCO alleys, visiting Dar Mustapha Pacha, copper craftsmen, and Ketchaoua Mosque.',
              lat: 36.7865,
              lng: 3.0600,
              image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=800&q=80'
            },
            {
              title: 'Rooftop Gastronomic Lunch & Bastion 23',
              time: '13:00',
              description: 'Traditional Rechta lunch with Bay views, followed by exploring the 16th-century sea fortifications of Bastion 23.',
              lat: 36.7875,
              lng: 3.0635,
              image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
            }
          ]
        },
        {
          day: 2,
          items: [
            {
              title: 'Tipaza Roman Coastal Archaeological Park',
              time: '10:00',
              description: 'Scenic drive along the Mediterranean coast to explore the Roman theater, forum, and maritime port of Tipaza.',
              lat: 36.5935,
              lng: 2.4485,
              image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80'
            },
            {
              title: 'Royal Mauritanian Mausoleum (Tombeau de la Chrétienne)',
              time: '15:30',
              description: 'Visit the monumental circular stone pyramid tomb of King Juba II and Queen Cleopatra Selene II.',
              lat: 36.5740,
              lng: 2.5510,
              image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80'
            }
          ]
        },
        {
          day: 3,
          items: [
            {
              title: 'Jardin d’Essai du Hamma & Martyrs’ Memorial',
              time: '10:00',
              description: 'Walking tour through the world-famous tropical botanical gardens, cable car ride to Maqam Echahid.',
              lat: 36.7485,
              lng: 3.0735,
              image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=800&q=80'
            }
          ]
        }
      ]
    },
    {
      name: 'Grand Tour of Eastern Algeria: Constantine to Béjaïa',
      creator: agencyUser1._id,
      wilayaName: 'Constantine',
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=80',
      price: '52000',
      rating: 4.9,
      days: [1, 2, 3, 4],
      items: [
        {
          day: 1,
          items: [
            {
              title: 'The City of Bridges Suspension Trail',
              time: '09:00',
              description: 'Cross the iconic Sidi M’Cid, Sidi Rached, and Mellah Slimane bridges over the dramatic Rhumel gorge.',
              lat: 36.3715,
              lng: 6.6145,
              image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=800&q=80'
            }
          ]
        },
        {
          day: 2,
          items: [
            {
              title: 'Tiddis Ancient Roman Hilltop Citadel',
              time: '10:00',
              description: 'Excursion north of Constantine to explore the terraced ruins of Roman Castellum Tidditanorum.',
              lat: 36.4670,
              lng: 6.4830,
              image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80'
            }
          ]
        },
        {
          day: 3,
          items: [
            {
              title: 'Djemila UNESCO Roman Forum & Museum',
              time: '11:00',
              description: 'Cross into Sétif to witness the triumphal arch of Caracalla and world-renowned museum mosaics.',
              lat: 36.3195,
              lng: 5.7360,
              image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80'
            }
          ]
        },
        {
          day: 4,
          items: [
            {
              title: 'Cap Carbon & Gulf of Béjaïa Hike',
              time: '10:00',
              description: 'Coastal hiking in Gouraya National Park to the Cap Carbon lighthouse and Pic des Singes.',
              lat: 36.7750,
              lng: 5.1050,
              image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
            }
          ]
        }
      ]
    },
    {
      name: 'Coastal Elegance: Oran Citadel & Tlemcen Andalusian Heritage',
      creator: agencyUser2._id,
      wilayaName: 'Oran',
      image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
      price: '44000',
      rating: 4.8,
      days: [1, 2, 3],
      items: [
        {
          day: 1,
          items: [
            {
              title: 'Oran Cultural Boulevard & Santa Cruz Fortress',
              time: '10:00',
              description: 'Tour of Front de Mer, Place du 1er Novembre, and panoramic ascent to Spanish Fort Santa Cruz.',
              lat: 35.7090,
              lng: -0.6635,
              image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80'
            }
          ]
        },
        {
          day: 2,
          items: [
            {
              title: 'Tlemcen Royal Mechouar Palace & Grand Mosque',
              time: '10:30',
              description: 'Travel to Tlemcen to explore the 12th-century Zianide palace and exquisite Almoravid architecture.',
              lat: 34.8825,
              lng: -1.3140,
              image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80'
            }
          ]
        },
        {
          day: 3,
          items: [
            {
              title: 'Mansourah Minaret & Lalla Setti Plateau',
              time: '11:00',
              description: 'Visit the soaring 38-meter ruined minaret of Mansourah and cable-car ride up Lalla Setti.',
              lat: 34.8625,
              lng: -1.3090,
              image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80'
            }
          ]
        }
      ]
    },
    {
      name: 'Ghardaïa & M’Zab Valley: Thousand-Year Desert Urbanism',
      creator: associationUser._id,
      wilayaName: 'Ghardaïa',
      image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
      price: '36000',
      rating: 4.9,
      days: [1, 2, 3],
      items: [
        {
          day: 1,
          items: [
            {
              title: 'Ghardaïa Central Market & Pyramid Minaret',
              time: '10:00',
              description: 'Walk through the historical market square, spice merchants, and traditional carpet auction.',
              lat: 32.4920,
              lng: 3.6740,
              image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80'
            }
          ]
        },
        {
          day: 2,
          items: [
            {
              title: 'Fortified Ksar of Beni Isguen & Watchtower',
              time: '15:30',
              description: 'Strictly guided walk through the holy ksar, ancestral silent afternoon auction, and Borj Boulila tower.',
              lat: 32.4820,
              lng: 3.6890,
              image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80'
            }
          ]
        },
        {
          day: 3,
          items: [
            {
              title: 'Palm Grove Foggara Irrigation & El Atteuf',
              time: '09:30',
              description: 'Explore the ancestral underground water distribution network and the oldest mosque in the valley at El Atteuf.',
              lat: 32.4700,
              lng: 3.7500,
              image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80'
            }
          ]
        }
      ]
    },
    {
      name: 'Timimoun Red Oasis & Great Western Erg Trek',
      creator: guideUser1._id,
      wilayaName: 'Timimoun',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
      price: '46000',
      rating: 4.8,
      days: [1, 2, 3],
      items: [
        {
          day: 1,
          items: [
            {
              title: 'Red Clay Architecture & Palm Oasis Walk',
              time: '11:00',
              description: 'Discovery of Timimoun’s red adobe castle walls, date palm groves, and traditional water distribution clock.',
              lat: 29.2630,
              lng: 0.2310,
              image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'
            }
          ]
        },
        {
          day: 2,
          items: [
            {
              title: 'Ghost Ksars of the Desert & Salt Sebkha',
              time: '09:30',
              description: 'Expedition to the ruined desert fortresses of Ighzer and Tala, perched on cliffs overlooking the shimmering salt pan.',
              lat: 29.3500,
              lng: 0.2800,
              image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'
            }
          ]
        },
        {
          day: 3,
          items: [
            {
              title: 'Dune Bivouac & Saharan Sunset',
              time: '16:00',
              description: 'Camel trek onto the towering golden crests of the Great Western Erg for sunset tea and traditional bread tasting.',
              lat: 29.2800,
              lng: 0.2100,
              image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80'
            }
          ]
        }
      ]
    },
    {
      name: 'Roman Numidia Odyssey: Timgad & Ghoufi Canyons',
      creator: agencyUser1._id,
      wilayaName: 'Batna',
      image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
      price: '34000',
      rating: 4.8,
      days: [1, 2],
      items: [
        {
          day: 1,
          items: [
            {
              title: 'Trajan’s Imperial City of Timgad',
              time: '09:30',
              description: 'Full day exploration of the Trajan Arch, Roman library, public baths, theater, and pristine Capitol.',
              lat: 35.4845,
              lng: 6.4675,
              image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80'
            }
          ]
        },
        {
          day: 2,
          items: [
            {
              title: 'Balconies of Ghoufi Canyon Expedition',
              time: '10:00',
              description: 'Hike along the rim of the dramatic red canyon, descending into the lush date palm valley below ancient troglodyte homes.',
              lat: 35.0500,
              lng: 6.1600,
              image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'
            }
          ]
        }
      ]
    },
    {
      name: 'Taghit Dunes & Saoura Valley Cultural Expedition',
      creator: guideUser1._id,
      wilayaName: 'Béchar',
      image: 'https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=1200&q=80',
      price: '39000',
      rating: 4.9,
      days: [1, 2, 3],
      items: [
        {
          day: 1,
          items: [
            {
              title: 'Taghit 11th-Century Mudbrick Ksar',
              time: '10:00',
              description: 'Guided walking tour through the shaded labyrinth of Taghit’s ancient defensive citadel.',
              lat: 30.9160,
              lng: -2.0300,
              image: 'https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=800&q=80'
            }
          ]
        },
        {
          day: 2,
          items: [
            {
              title: 'Prehistoric Rock Engravings of Zaouia Tahtania',
              time: '09:00',
              description: 'Discover neolithic stone art depicting antelopes and ostriches etched into smooth desert boulders.',
              lat: 30.8800,
              lng: -2.0100,
              image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80'
            }
          ]
        },
        {
          day: 3,
          items: [
            {
              title: 'Summit of the Giant Dune',
              time: '16:30',
              description: 'Ascent to the peak of the 200m high Erg dune overlooking the Saoura palm riverbed at sunset.',
              lat: 30.9200,
              lng: -2.0200,
              image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80'
            }
          ]
        }
      ]
    }
  ]

  const seededTrips = []
  for (const t of tripsData) {
    const geo = await getGeoHierarchy(t.wilayaName)
    const trip = await Trip.create({
      name: t.name,
      creator: t.creator,
      destination: geo.wilayaId,
      image: t.image,
      price: t.price,
      rating: t.rating,
      days: t.days,
      items: t.items,
      status: 'published',
      published: true
    })
    seededTrips.push(trip)
  }

  // 12. Bookings & Traveler Reservations (TripSubscription)
  console.log(`-> Seeding Verified Traveler Reservations...`)
  const reservationsData = [
    {
      tripIndex: 0,
      fullName: 'Lynda Meziani',
      phone: '+213550000010'
    },
    {
      tripIndex: 0,
      fullName: 'Dr. Karim Benabdallah',
      phone: '+213661122334'
    },
    {
      tripIndex: 1,
      fullName: 'Mehdi Larbi',
      phone: '+213550000011'
    },
    {
      tripIndex: 1,
      fullName: 'Sarah Belkacemi',
      phone: '+213770456789'
    },
    {
      tripIndex: 2,
      fullName: 'Nabil Khelifi',
      phone: '+213552987654'
    },
    {
      tripIndex: 3,
      fullName: 'Selma Touati',
      phone: '+213661334455'
    },
    {
      tripIndex: 4,
      fullName: 'Fatima Zahra Benali',
      phone: '+213771556677'
    },
    {
      tripIndex: 5,
      fullName: 'Rachid Brahami',
      phone: '+213558889900'
    }
  ]

  for (const res of reservationsData) {
    const targetTrip = seededTrips[res.tripIndex]
    if (targetTrip) {
      await TripSubscription.create({
        trip: targetTrip._id,
        fullName: res.fullName,
        phone: res.phone
      })
    }
  }

  // 13. Travel Publications / Stories
  console.log(`-> Seeding Editorial Travel Stories & Publications...`)
  await Publication.create([
    {
      ownerId: guideUser1._id,
      categoryId: seededCategories[0]._id,
      title: 'Under the Saharan Skies: A Night in the Canyons of Djanet',
      description: 'The golden dunes of Erg Admer settle into a serene silence as the evening temperature drops. A firsthand guide to preparing for high-desert night expeditions in Tassili.',
      rating: 4.9,
      photo: 'https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=1200&q=80'
    },
    {
      ownerId: agencyUser2._id,
      categoryId: seededCategories[1]._id,
      title: 'Walking the UNESCO Casbah: Living Palaces & Ancient Crafts',
      description: 'Beyond the whitewashed facades lie hidden Ottoman courtyards with carved cedar and centuries of heritage safeguarded by master artisans.',
      rating: 4.8,
      photo: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1200&q=80'
    },
    {
      ownerId: agencyUser1._id,
      categoryId: seededCategories[2]._id,
      title: 'Constantine: The Breathtaking Suspension Bridges of Cirta',
      description: 'Perched above the Rhumel Gorge, Constantine commands one of the most astonishing urban geographies in North Africa.',
      rating: 5.0,
      photo: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=80'
    },
    {
      ownerId: associationUser._id,
      categoryId: seededCategories[1]._id,
      title: 'The Sustainable Urban Architecture of the M’Zab Valley',
      description: 'How thousand-year-old desert builders created an oasis civilization with zero waste and natural climate regulation.',
      rating: 4.9,
      photo: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80'
    }
  ])

  // 14. Partner Announcements
  console.log(`-> Seeding Partner Announcements & Special Packages...`)
  await Announcement.create([
    {
      name: 'Early Season Sahara 2026: 15% Off Djanet Expeditions',
      price: '72250',
      description: 'Reserve your 5-day guided Tassili n’Ajjer expedition with Numidia Voyages before end of month for early bird rates.',
      img: 'https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=800&q=80',
      category: seededCategories[0]._id,
      ownerId: agencyUser1._id,
      published: true,
      paid: true
    },
    {
      name: 'Weekend Cultural Break: Tlemcen & Oran Coastal Escape',
      price: '32000',
      description: 'All-inclusive 2-day historical guided escape covering the royal Mechouar palace and Santa Cruz fortress.',
      img: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80',
      category: seededCategories[2]._id,
      ownerId: agencyUser2._id,
      published: true,
      paid: true
    }
  ])

  // 15. Official Touriva Platform Terms
  console.log(`-> Seeding Touriva Terms & Traveler Guarantees...`)
  await Term.create([
    {
      order: '1.',
      title: 'Touriva Tourism Platform Use',
      text: 'Touriva is the dedicated Algerian tourism discovery and travel reservation portal. All users agree to use directory listings, guide contacts, and itineraries for lawful, authentic tourism purposes in compliance with national travel regulations.'
    },
    {
      order: '2.',
      title: 'Certified Guide & Agency Partner Verification',
      text: 'All tourism guides, travel agencies, and hospitality operators listed on Touriva are vetted for official professional accreditation and licensing issued by the Ministry of Tourism and Crafts of Algeria.'
    },
    {
      order: '3.',
      title: 'Traveler Reservations & Integrity Guarantee',
      text: 'Excursion bookings submitted through Touriva connect travelers directly with certified operators. Operator partners commit to honoring confirmed itineraries and ensuring highest safety standards across all Algerian destinations.'
    }
  ])

  console.log(`[SUCCESS] Touriva Core Demo Dataset successfully created!`)
}

async function validateRelationships(db) {
  console.log(`\n======================================================`)
  console.log(`[DATA RELATIONSHIP VALIDATION] Verifying references & constraints`)
  console.log(`======================================================`)

  const errors = []

  // Check hotels
  const hotels = await Hotel.find({})
  for (const h of hotels) {
    if (!h.wilayaId) errors.push(`Hotel '${h.name}' missing wilayaId`)
    if (!h.location || !h.location.coordinates || h.location.coordinates.length !== 2) {
      errors.push(`Hotel '${h.name}' invalid GeoJSON point coordinates`)
    }
  }

  // Check restaurants
  const restaurants = await Restaurant.find({})
  for (const r of restaurants) {
    if (!r.wilayaId) errors.push(`Restaurant '${r.name}' missing wilayaId`)
    if (!r.location || !r.location.coordinates || r.location.coordinates.length !== 2) {
      errors.push(`Restaurant '${r.name}' invalid GeoJSON point coordinates`)
    }
  }

  // Check sites
  const sites = await Site.find({})
  for (const s of sites) {
    if (!s.wilayaId) errors.push(`Site '${s.name}' missing wilayaId`)
    if (!s.location || !s.location.coordinates || s.location.coordinates.length !== 2) {
      errors.push(`Site '${s.name}' invalid GeoJSON point coordinates`)
    }
  }

  // Check trips
  const trips = await Trip.find({})
  for (const t of trips) {
    const creator = await User.findById(t.creator)
    if (!creator) errors.push(`Trip '${t.name}' references non-existent creator ${t.creator}`)
    const destination = await Wilaya.findById(t.destination)
    if (!destination) errors.push(`Trip '${t.name}' references non-existent destination ${t.destination}`)
    if (!t.items || t.items.length === 0) errors.push(`Trip '${t.name}' has no day itinerary items`)
  }

  // Check trip subscriptions
  const subs = await TripSubscription.find({})
  for (const sub of subs) {
    const trip = await Trip.findById(sub.trip)
    if (!trip) errors.push(`TripSubscription '${sub._id}' references non-existent trip ${sub.trip}`)
  }

  // Check users & password hash
  const users = await User.find({})
  for (const u of users) {
    if (!u.password || !u.password.startsWith('$2')) {
      errors.push(`User '${u.email}' does not have valid bcrypt password hash`)
    }
  }

  // Verify Admin CASL Permissions
  const admin = await User.findOne({ email: 'admin@touriva.test' })
  if (!admin || !admin.authorizationIds || admin.authorizationIds.length === 0) {
    errors.push(`Admin user 'admin@touriva.test' missing authorizationIds`)
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
    console.log(`[VALIDATION PASSED] All references, geo coordinates, and user accounts are 100% valid!`)
    console.log(`[VALIDATION PASSED] Zero Djawal branding detected in Touriva database content.`)
  }

  // Final count audit
  const finalSummary = []
  for (const c of collections) {
    const count = await db.collection(c.name).countDocuments()
    finalSummary.push({ collection: c.name, count })
  }
  finalSummary.sort((a, b) => a.collection.localeCompare(b.collection))
  console.log(`\nFinal Seeded Records Summary:`)
  console.table(finalSummary)
}

async function runSeed() {
  try {
    console.log(`\nStarting Touriva Core Platform Seed Script...`)
    await mongoose.connect(MONGO_URI)
    const db = mongoose.connection.db

    // 1. Strict Safety Check
    verifySafeTargetDatabase(MONGO_URI, db.databaseName)

    // 2. Audit
    await auditDatabase(db)

    // 3. Clean
    await cleanOldTourivaData(db)

    // 4. Seed
    await seedFreshDemoData(db)

    // 5. Validate
    await validateRelationships(db)

    console.log(`\n======================================================`)
    console.log(`[COMPLETE] Touriva Core Database is completely refreshed!`)
    console.log(`======================================================\n`)
    process.exit(0)
  } catch (err) {
    console.error(`\n[FATAL ERROR] Seed aborted:`, err.message)
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
