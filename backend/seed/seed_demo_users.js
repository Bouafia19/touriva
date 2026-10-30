/**
 * Touriva Dedicated Demo Users & Fictional Dataset Seeder
 * 
 * Target Accounts:
 * 1. Tourist / Customer : Demo Tourist      <demo.customer@touriva.test>
 * 2. Agency Director    : Demo Agency       <demo.agency@touriva.test>
 * 3. Platform Admin     : Touriva Demo Administrator <demo.admin@touriva.test>
 * 
 * Safety Guarantees:
 * - 100% Idempotent: Never duplicates accounts, packages, departures, or bookings.
 * - Non-destructive: Never deletes or overwrites existing real or production accounts.
 * - Target safety: Strictly targets 'touriva' database. Refuses execution on 'djawal'.
 * - Password hashing: Uses bcrypt with standard salt rounds.
 */

require('dotenv').config({ path: __dirname + '/../.env' })
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

// Models
const User = require('../models/User')
const Role = require('../models/Role')
const Wilaya = require('../models/Wilaya')
const Daira = require('../models/Daira')
const Commune = require('../models/Commune')
const Category = require('../models/Category')
const Trip = require('../models/Trip')
const TripDeparture = require('../models/TripDeparture')
const TripBooking = require('../models/TripBooking')
const TripEnquiry = require('../models/TripEnquiry')
const TripPayment = require('../models/TripPayment')
const TripRefund = require('../models/TripRefund')
const Announcement = require('../models/Announcement')
const { recalculateBookingFinancials } = require('../utils/financialCalculator')

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/touriva'
const TARGET_DB_NAME = 'touriva'

// Secure demo passwords (also documented in confidential TOURIVA_DEMO_CREDENTIALS.md)
const DEMO_CREDENTIALS = {
  customer: {
    name: 'Demo Tourist',
    firstName: 'Demo',
    lastName: 'Tourist',
    email: 'demo.customer@touriva.test',
    phone: '+213550000020',
    password: 'TouristDemo#2026!',
    role: 'client',
    typeAccount: 'visitor'
  },
  agency: {
    name: 'Demo Agency',
    firstName: 'Demo',
    lastName: 'Agency',
    email: 'demo.agency@touriva.test',
    phone: '+213550000021',
    password: 'AgencyDirector#2026!',
    role: 'partner',
    typeAccount: 'touristAgencies',
    companyName: 'Touriva Horizons Voyages & Tourisme',
    rc: '16/00-9876543A26',
    nif: '002616019876543',
    nis: '98765432101',
    art: '16010098765',
    hasLicense: true
  },
  admin: {
    name: 'Touriva Demo Administrator',
    firstName: 'Touriva',
    lastName: 'Demo Administrator',
    email: 'demo.admin@touriva.test',
    phone: '+213550000022',
    password: 'AdminControl#2026!',
    role: 'administrator',
    typeAccount: 'others'
  }
}

function verifySafeDatabase(uri, dbName) {
  const normalizedDb = (dbName || '').toLowerCase().trim()
  const normalizedUri = (uri || '').toLowerCase().trim()

  if (normalizedDb.includes('djawal') || normalizedUri.includes('djawal')) {
    throw new Error(`[CRITICAL SAFETY VIOLATION] Database references 'djawal'. Aborting immediately!`)
  }

  if (normalizedDb !== TARGET_DB_NAME) {
    throw new Error(`[CRITICAL SAFETY VIOLATION] Expected DB '${TARGET_DB_NAME}', got '${normalizedDb}'. Aborting!`)
  }
}

async function seedDemoUsersAndData() {
  console.log(`\n======================================================`)
  console.log(`[TOURIVA DEMO SEEDER] Initializing Idempotent Demo Setup`)
  console.log(`Connection URI : ${MONGO_URI}`)
  console.log(`======================================================`)

  const shouldDisconnect = mongoose.connection.readyState === 0
  if (shouldDisconnect) {
    await mongoose.connect(MONGO_URI)
  }
  const db = mongoose.connection.db
  verifySafeDatabase(MONGO_URI, db.databaseName)

  // 1. Fetch geographic references
  const wilayaAlger = await Wilaya.findOne({ name: 'Alger' }) || await Wilaya.findOne({})
  const wilayaDjanet = await Wilaya.findOne({ name: 'Djanet' }) || wilayaAlger
  const wilayaOran = await Wilaya.findOne({ name: 'Oran' }) || wilayaAlger
  const wilayaGhardaia = await Wilaya.findOne({ name: 'Ghardaïa' }) || wilayaAlger

  const dairaAlger = await Daira.findOne({ wilayaId: wilayaAlger._id })
  const communeAlger = dairaAlger ? await Commune.findOne({ dairaId: dairaAlger._id }) : null

  // 2. Fetch CASL Roles for Demo Administrator
  const allRoles = await Role.find({})
  const roleIds = allRoles.map(r => r._id)

  console.log(`-> Verified ${roleIds.length} CASL roles for Administrator ability mapping.`)

  // 3. Upsert Demo Accounts Idempotently
  console.log(`-> Upserting Dedicated Demo Accounts...`)

  // 3.1 Demo Administrator
  const adminHash = await bcrypt.hash(DEMO_CREDENTIALS.admin.password, 10)
  let adminUser = await User.findOne({ email: DEMO_CREDENTIALS.admin.email })
  if (!adminUser) {
    adminUser = await User.create({
      email: DEMO_CREDENTIALS.admin.email,
      firstName: DEMO_CREDENTIALS.admin.firstName,
      lastName: DEMO_CREDENTIALS.admin.lastName,
      phone: DEMO_CREDENTIALS.admin.phone,
      password: adminHash,
      role: 'administrator',
      typeAccount: 'others',
      activated: true,
      complete: true,
      status: true,
      fileStatus: 'confirmed',
      authorizationIds: roleIds,
      wilayaId: wilayaAlger._id,
      dairaId: dairaAlger?._id,
      communeId: communeAlger?._id
    })
    console.log(`   [CREATED] Demo Administrator: ${adminUser.email}`)
  } else {
    adminUser.password = adminHash
    adminUser.firstName = DEMO_CREDENTIALS.admin.firstName
    adminUser.lastName = DEMO_CREDENTIALS.admin.lastName
    adminUser.role = 'administrator'
    adminUser.authorizationIds = roleIds
    adminUser.activated = true
    adminUser.status = true
    adminUser.fileStatus = 'confirmed'
    await adminUser.save()
    console.log(`   [VERIFIED/UPDATED] Demo Administrator: ${adminUser.email}`)
  }

  // 3.2 Demo Agency Director
  const agencyHash = await bcrypt.hash(DEMO_CREDENTIALS.agency.password, 10)
  let agencyUser = await User.findOne({ email: DEMO_CREDENTIALS.agency.email })
  if (!agencyUser) {
    agencyUser = await User.create({
      email: DEMO_CREDENTIALS.agency.email,
      firstName: DEMO_CREDENTIALS.agency.firstName,
      lastName: DEMO_CREDENTIALS.agency.lastName,
      phone: DEMO_CREDENTIALS.agency.phone,
      password: agencyHash,
      role: 'partner',
      typeAccount: 'touristAgencies',
      companyName: DEMO_CREDENTIALS.agency.companyName,
      rc: DEMO_CREDENTIALS.agency.rc,
      nif: DEMO_CREDENTIALS.agency.nif,
      nis: DEMO_CREDENTIALS.agency.nis,
      art: DEMO_CREDENTIALS.agency.art,
      hasLicense: true,
      activated: true,
      complete: true,
      status: true,
      fileStatus: 'confirmed',
      wilayaId: wilayaAlger._id,
      dairaId: dairaAlger?._id,
      communeId: communeAlger?._id
    })
    console.log(`   [CREATED] Demo Agency: ${agencyUser.email}`)
  } else {
    agencyUser.password = agencyHash
    agencyUser.firstName = DEMO_CREDENTIALS.agency.firstName
    agencyUser.lastName = DEMO_CREDENTIALS.agency.lastName
    agencyUser.companyName = DEMO_CREDENTIALS.agency.companyName
    agencyUser.rc = DEMO_CREDENTIALS.agency.rc
    agencyUser.nif = DEMO_CREDENTIALS.agency.nif
    agencyUser.nis = DEMO_CREDENTIALS.agency.nis
    agencyUser.art = DEMO_CREDENTIALS.agency.art
    agencyUser.hasLicense = true
    agencyUser.role = 'partner'
    agencyUser.typeAccount = 'touristAgencies'
    agencyUser.activated = true
    agencyUser.status = true
    agencyUser.fileStatus = 'confirmed'
    await agencyUser.save()
    console.log(`   [VERIFIED/UPDATED] Demo Agency: ${agencyUser.email}`)
  }

  // 3.3 Demo Tourist / Customer
  const customerHash = await bcrypt.hash(DEMO_CREDENTIALS.customer.password, 10)
  let customerUser = await User.findOne({ email: DEMO_CREDENTIALS.customer.email })
  if (!customerUser) {
    customerUser = await User.create({
      email: DEMO_CREDENTIALS.customer.email,
      firstName: DEMO_CREDENTIALS.customer.firstName,
      lastName: DEMO_CREDENTIALS.customer.lastName,
      phone: DEMO_CREDENTIALS.customer.phone,
      password: customerHash,
      role: 'client',
      typeAccount: 'visitor',
      activated: true,
      complete: true,
      status: true,
      fileStatus: 'confirmed',
      wilayaId: wilayaAlger._id,
      dairaId: dairaAlger?._id,
      communeId: communeAlger?._id
    })
    console.log(`   [CREATED] Demo Tourist: ${customerUser.email}`)
  } else {
    customerUser.password = customerHash
    customerUser.firstName = DEMO_CREDENTIALS.customer.firstName
    customerUser.lastName = DEMO_CREDENTIALS.customer.lastName
    customerUser.role = 'client'
    customerUser.typeAccount = 'visitor'
    customerUser.activated = true
    customerUser.status = true
    customerUser.fileStatus = 'confirmed'
    await customerUser.save()
    console.log(`   [VERIFIED/UPDATED] Demo Tourist: ${customerUser.email}`)
  }

  // 4. Seed Realistic Packages & Excursions for Demo Agency
  console.log(`-> Seeding Realistic Packages for Demo Agency...`)

  const packageDefs = [
    {
      name: "Grand Circuit Tassili n'Ajjer & Cités de Pierre",
      description: "Expédition immersive de 7 jours au cœur du parc national du Tassili n'Ajjer classé UNESCO. Gravures rupestres, bivouac saharien sous les étoiles, et traversée en 4x4 des canyons et arches naturelles de grès.",
      destination: wilayaDjanet._id,
      image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
      photos: [
        "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=1200&q=80"
      ],
      price: '95000',
      durationDays: 7,
      theme: 'Sahara & Aventure',
      rating: 4.9,
      status: 'published',
      published: true,
      requiresDeposit: true,
      depositType: 'fixed',
      depositAmount: 25000,
      inclusions: [
        'Prise en charge aéroport de Djanet A/R',
        'Véhicules tout-terrain 4x4 avec carburant et chauffeurs touaregs',
        'Guide accompagnateur agréé et cuisinier saharien dédié',
        'Pension complète durant tout le séjour (bivouac traditionnel)',
        'Matériel de campement (tentes, matelas confort, duvets adaptés)'
      ],
      exclusions: [
        'Vols domestiques Alger-Djanet-Alger',
        'Pourboires et dépenses personnelles',
        'Assurance rapatriement individuelle'
      ],
      cancellationPolicy: 'Annulation gratuite jusqu’à 14 jours avant le départ. Retenue de 25% entre 14 et 7 jours.',
      meetingPoint: 'Aéroport Cheikh Amoud Ben Mokhtar de Djanet (DJG)',
      days: [1, 2, 3, 4, 5, 6, 7],
      items: [
        {
          day: 1,
          items: [
            {
              title: 'Accueil à Djanet & Oasis de Tin Khatma',
              time: '14:00',
              description: 'Accueil à l’aéroport de Djanet par l’équipe d’expédition Touriva. Installation au bivouac oasis et thé touareg de bienvenue.',
              lat: 24.5539,
              lng: 9.4853,
              image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80'
            }
          ]
        },
        {
          day: 2,
          items: [
            {
              title: 'Canyon de Tikobaouine & Arche de Grès',
              time: '08:30',
              description: 'Départ en convoi 4x4 vers le majestueux canyon de Tikobaouine. Randonnée découverte sous les arches naturelles sculptées par l’érosion.',
              lat: 24.6200,
              lng: 9.5800,
              image: 'https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=600&q=80'
            }
          ]
        }
      ]
    },
    {
      name: "Échappée Côtière Oranaise & Palais Zianides de Tlemcen",
      description: "Circuit culturel et patrimonial de 4 jours entre le charme méditerranéen d'Oran (Fort Santa Cruz, Front de mer, Beylik) et les splendeurs andalouses de Tlemcen (Palais El Mechouar, Mosquée Sidi Boumediene, Cascades d'El Ourit).",
      destination: wilayaOran._id,
      image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80",
      photos: [
        "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80"
      ],
      price: '42000',
      durationDays: 4,
      theme: 'Histoire & Patrimoine',
      rating: 4.8,
      status: 'published',
      published: true,
      requiresDeposit: true,
      depositType: 'fixed',
      depositAmount: 15000,
      inclusions: [
        'Hôtel 4 étoiles en demi-pension (Oran & Tlemcen)',
        'Transport en autocar grand tourisme climatisé',
        'Guide conférencier historien durant tout le circuit',
        'Droits d’entrée aux monuments et musées nationaux'
      ],
      exclusions: [
        'Repas du midi libres',
        'Boissons et extras'
      ],
      cancellationPolicy: 'Annulation intégrale remboursée jusqu’à 7 jours avant le départ.',
      meetingPoint: 'Place du 1er Novembre (Place d’Armes), Oran',
      days: [1, 2, 3, 4],
      items: [
        {
          day: 1,
          items: [
            {
              title: 'Fort de Santa Cruz & Chapelle de la Vierge',
              time: '09:30',
              description: 'Ascension du mont Murdjadjo, panorama sur la rade de Mers El-Kébir et visite commentée de la forteresse espagnole du XVIe siècle.',
              lat: 35.7093,
              lng: -0.6625,
              image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=600&q=80'
            }
          ]
        }
      ]
    },
    {
      name: "Trésors Oasiens du M'Zab & Palmeraies de Ghardaïa",
      description: "Immersion de 5 jours dans la pentapole millénaire du M’Zab classée UNESCO. Architecture mozabite exemplaire, système de partage des eaux ancestral, et artisanat traditionnel du tapis de Ghardaïa.",
      destination: wilayaGhardaia._id,
      image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
      photos: [
        "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80"
      ],
      price: '48000',
      durationDays: 5,
      theme: 'Architecture & Traditions',
      rating: 4.95,
      status: 'published',
      published: true,
      requiresDeposit: true,
      depositType: 'percentage',
      depositAmount: 30,
      inclusions: [
        'Hébergement traditionnel en maison d’hôtes dans la palmeraie de Beni Isguen',
        'Pension complète avec gastronomie locale mozabite',
        'Guide local agréé de la fondation du patrimoine du M’Zab',
        'Visites exclusives des ksars et de la criée ancestrale'
      ],
      exclusions: [
        'Achats de tapis et artisanat personnel'
      ],
      cancellationPolicy: 'Annulation sans frais jusqu’à 10 jours avant la date de départ.',
      meetingPoint: 'Place du Marché de Ghardaïa',
      days: [1, 2, 3, 4, 5],
      items: [
        {
          day: 1,
          items: [
            {
              title: 'Ksar El Atteuf & Mausolée Cheikh Sidi Brahim',
              time: '15:00',
              description: 'Découverte du ksar fondateur de la vallée (fondé en 1012) dont les lignes architecturales inspirèrent Le Corbusier.',
              lat: 32.4789,
              lng: 3.7483,
              image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80'
            }
          ]
        }
      ]
    }
  ]

  const seededPackages = []
  for (const def of packageDefs) {
    let pkg = await Trip.findOne({ creator: agencyUser._id, name: def.name })
    if (!pkg) {
      pkg = await Trip.create({
        ...def,
        creator: agencyUser._id
      })
      console.log(`   [CREATED] Package: "${pkg.name}" (${pkg.price} DZD)`)
    } else {
      Object.assign(pkg, def)
      await pkg.save()
      console.log(`   [VERIFIED] Package: "${pkg.name}"`)
    }
    seededPackages.push(pkg)
  }

  // 5. Seed Scheduled Departures
  console.log(`-> Seeding Scheduled Departures for Demo Packages...`)
  const now = new Date()
  const departureDefs = [
    {
      trip: seededPackages[0]._id, // Djanet 7 days
      startDate: new Date('2026-11-10T08:00:00.000Z'),
      endDate: new Date('2026-11-17T18:00:00.000Z'),
      priceDZD: 95000,
      capacity: 14,
      bookedSeats: 5,
      minGroupSize: 4,
      meetingPoint: 'Aéroport Cheikh Amoud Ben Mokhtar de Djanet (DJG)',
      departureInstructions: 'Rendez-vous au comptoir Touriva dans le hall des arrivées de l’aéroport de Djanet. Bagages souples recommandés.',
      status: 'guaranteed'
    },
    {
      trip: seededPackages[0]._id, // Djanet 7 days (second session)
      startDate: new Date('2026-11-30T08:00:00.000Z'),
      endDate: new Date('2026-12-07T18:00:00.000Z'),
      priceDZD: 95000,
      capacity: 14,
      bookedSeats: 0,
      minGroupSize: 4,
      meetingPoint: 'Aéroport Cheikh Amoud Ben Mokhtar de Djanet (DJG)',
      departureInstructions: 'Vérifiez la validité de vos pièces d’identité pour les formalités aéroportuaires.',
      status: 'scheduled'
    },
    {
      trip: seededPackages[1]._id, // Oran 4 days
      startDate: new Date('2026-11-15T08:00:00.000Z'),
      endDate: new Date('2026-11-19T18:00:00.000Z'),
      priceDZD: 42000,
      capacity: 16,
      bookedSeats: 1,
      minGroupSize: 6,
      meetingPoint: 'Hôtel Royal Oran (Place d’Armes)',
      departureInstructions: 'Départ de l’autocar à 08h00 précises devant l’hôtel.',
      status: 'scheduled'
    },
    {
      trip: seededPackages[2]._id, // Ghardaia 5 days
      startDate: new Date('2026-11-22T08:00:00.000Z'),
      endDate: new Date('2026-11-27T18:00:00.000Z'),
      priceDZD: 48000,
      capacity: 12,
      bookedSeats: 2,
      minGroupSize: 4,
      meetingPoint: 'Maison d’Hôtes Palmeraie Beni Isguen',
      departureInstructions: 'Accueil dès 14h00. Tenue respectueuse exigée pour les visites de ksars.',
      status: 'scheduled'
    }
  ]

  const seededDepartures = []
  for (const depDef of departureDefs) {
    let dep = await TripDeparture.findOne({
      agency: agencyUser._id,
      trip: depDef.trip,
      startDate: depDef.startDate
    })
    if (!dep) {
      dep = await TripDeparture.create({
        ...depDef,
        agency: agencyUser._id
      })
      console.log(`   [CREATED] Departure: ${dep.startDate.toISOString().split('T')[0]} (Cap: ${dep.capacity}, Booked: ${dep.bookedSeats})`)
    } else {
      Object.assign(dep, depDef)
      await dep.save()
      console.log(`   [VERIFIED] Departure: ${dep.startDate.toISOString().split('T')[0]}`)
    }
    seededDepartures.push(dep)
  }

  // Idempotently prune any obsolete departures for this agency
  await TripDeparture.deleteMany({
    agency: agencyUser._id,
    _id: { $nin: seededDepartures.map(d => d._id) }
  })

  // 6. Seed Realistic Bookings with Passenger Manifests
  console.log(`-> Seeding Bookings & Passenger Manifests...`)

  const bookingDefs = [
    // Booking 1: Demo Tourist booked 2 seats on Djanet departure (Guaranteed & Fully Paid)
    {
      bookingReference: 'TRV-BKG-DEMO01',
      trip: seededPackages[0]._id,
      departure: seededDepartures[0]._id,
      agency: agencyUser._id,
      customer: customerUser._id,
      customerInfo: {
        fullName: 'Demo Tourist',
        phone: customerUser.phone,
        email: customerUser.email
      },
      seats: 2,
      unitPriceDZD: 95000,
      totalPriceDZD: 190000,
      passengers: [
        {
          fullName: 'Demo Tourist',
          ageCategory: 'adult',
          specialNotes: 'Régime végétarien / photographe amateur',
          emergencyPhone: '+213550123499'
        },
        {
          fullName: 'Amina Tourist',
          ageCategory: 'adult',
          specialNotes: 'Aucune restriction médicale',
          emergencyPhone: '+213550123499'
        }
      ],
      status: 'confirmed',
      requiresDeposit: true,
      depositAmountDZD: 50000,
      statusHistory: [
        { status: 'pending', timestamp: new Date(now.getTime() - 5 * 86400000), note: 'Réservation initiée en ligne' },
        { status: 'confirmed', timestamp: new Date(now.getTime() - 4 * 86400000), note: 'Confirmation automatique après règlement CIB' }
      ]
    },

    // Booking 2: Demo Tourist booked 1 seat on Oran departure (Partially Paid with BaridiMob)
    {
      bookingReference: 'TRV-BKG-DEMO02',
      trip: seededPackages[1]._id,
      departure: seededDepartures[2]._id,
      agency: agencyUser._id,
      customer: customerUser._id,
      customerInfo: {
        fullName: 'Demo Tourist',
        phone: customerUser.phone,
        email: customerUser.email
      },
      seats: 1,
      unitPriceDZD: 42000,
      totalPriceDZD: 42000,
      passengers: [
        {
          fullName: 'Demo Tourist',
          ageCategory: 'adult',
          specialNotes: 'Demande chambre au calme',
          emergencyPhone: '+213550123499'
        }
      ],
      status: 'confirmed',
      requiresDeposit: true,
      depositAmountDZD: 15000,
      statusHistory: [
        { status: 'pending', timestamp: new Date(now.getTime() - 3 * 86400000), note: 'Réservation créée' },
        { status: 'confirmed', timestamp: new Date(now.getTime() - 2 * 86400000), note: 'Acompte BaridiMob validé par agence' }
      ]
    },

    // Booking 3: Independent tourist booked 3 seats on Djanet departure (Paid in Cash at Agency Desk)
    {
      bookingReference: 'TRV-BKG-DEMO03',
      trip: seededPackages[0]._id,
      departure: seededDepartures[0]._id,
      agency: agencyUser._id,
      customer: null,
      customerInfo: {
        fullName: 'Yacine Belkacem',
        phone: '+213551223344',
        email: 'yacine.belkacem@fictional.test'
      },
      seats: 3,
      unitPriceDZD: 95000,
      totalPriceDZD: 285000,
      passengers: [
        { fullName: 'Yacine Belkacem', ageCategory: 'adult', emergencyPhone: '+213551998877' },
        { fullName: 'Fatima Belkacem', ageCategory: 'adult', emergencyPhone: '+213551998877' },
        { fullName: 'Ines Belkacem', ageCategory: 'child', specialNotes: 'Enfant 11 ans', emergencyPhone: '+213551998877' }
      ],
      status: 'confirmed',
      requiresDeposit: true,
      depositAmountDZD: 75000,
      statusHistory: [
        { status: 'pending', timestamp: new Date(now.getTime() - 4 * 86400000), note: 'Enregistré au comptoir' },
        { status: 'confirmed', timestamp: new Date(now.getTime() - 4 * 86400000), note: 'Règlement intégral en espèces au comptoir' }
      ]
    },

    // Booking 4: Pending booking awaiting verification on Ghardaia departure
    {
      bookingReference: 'TRV-BKG-DEMO04',
      trip: seededPackages[2]._id,
      departure: seededDepartures[3]._id,
      agency: agencyUser._id,
      customer: null,
      customerInfo: {
        fullName: 'Samira Haddad',
        phone: '+213552334455',
        email: 'samira.haddad@fictional.test'
      },
      seats: 2,
      unitPriceDZD: 48000,
      totalPriceDZD: 96000,
      passengers: [
        { fullName: 'Samira Haddad', ageCategory: 'adult', emergencyPhone: '+213552990011' },
        { fullName: 'Nabila Haddad', ageCategory: 'adult', emergencyPhone: '+213552990011' }
      ],
      status: 'pending',
      requiresDeposit: true,
      depositAmountDZD: 28800,
      statusHistory: [
        { status: 'pending', timestamp: new Date(now.getTime() - 1 * 86400000), note: 'Reçu BaridiMob soumis par le client, en attente d’audit' }
      ]
    }
  ]

  const seededBookings = []
  for (const bkgDef of bookingDefs) {
    let bkg = await TripBooking.findOne({ bookingReference: bkgDef.bookingReference })
    if (!bkg) {
      bkg = await TripBooking.create(bkgDef)
      console.log(`   [CREATED] Booking: ${bkg.bookingReference} (${bkg.customerInfo.fullName}, Seats: ${bkg.seats})`)
    } else {
      Object.assign(bkg, bkgDef)
      await bkg.save()
      console.log(`   [VERIFIED] Booking: ${bkg.bookingReference}`)
    }
    seededBookings.push(bkg)
  }

  // 7. Seed Payments & Financial Ledger Entries
  console.log(`-> Seeding Authoritative Financial Ledger (Payments)...`)

  const paymentDefs = [
    // Payment for Booking 1: Full settlement (190,000 DZD via CIB gateway / Bank wire)
    {
      paymentReference: 'TRV-PAY-DEMO01',
      booking: seededBookings[0]._id,
      departure: seededDepartures[0]._id,
      agency: agencyUser._id,
      customer: customerUser._id,
      amountDZD: 190000,
      currency: 'DZD',
      method: 'gateway_cib',
      status: 'verified',
      transactionReference: 'SATIM-CIB-2026-990184',
      recordedBy: agencyUser._id,
      paymentDate: new Date(now.getTime() - 4 * 86400000)
    },

    // Payment for Booking 2: Deposit settlement (15,000 DZD via BaridiMob)
    {
      paymentReference: 'TRV-PAY-DEMO02',
      booking: seededBookings[1]._id,
      departure: seededDepartures[2]._id,
      agency: agencyUser._id,
      customer: customerUser._id,
      amountDZD: 15000,
      currency: 'DZD',
      method: 'baridimob',
      status: 'verified',
      transactionReference: 'MOB-882190',
      recordedBy: agencyUser._id,
      paymentDate: new Date(now.getTime() - 2 * 86400000)
    },

    // Payment for Booking 3: Cash Desk settlement (285,000 DZD cash in agency)
    {
      paymentReference: 'TRV-PAY-DEMO03',
      booking: seededBookings[2]._id,
      departure: seededDepartures[0]._id,
      agency: agencyUser._id,
      customer: null,
      amountDZD: 285000,
      currency: 'DZD',
      method: 'cash',
      status: 'verified',
      transactionReference: 'CSH-REC-2026-0042',
      recordedBy: agencyUser._id,
      paymentDate: new Date(now.getTime() - 4 * 86400000)
    },

    // Payment for Booking 4: Submitted proof awaiting verification (30,000 DZD via BaridiMob)
    {
      paymentReference: 'TRV-PAY-DEMO04',
      booking: seededBookings[3]._id,
      departure: seededDepartures[3]._id,
      agency: agencyUser._id,
      customer: null,
      amountDZD: 30000,
      currency: 'DZD',
      method: 'baridimob',
      status: 'submitted', // Awaiting agency audit in Grand Livre
      transactionReference: 'MOB-993841',
      recordedBy: agencyUser._id,
      paymentDate: new Date(now.getTime() - 1 * 86400000)
    }
  ]

  for (const payDef of paymentDefs) {
    let pay = await TripPayment.findOne({ paymentReference: payDef.paymentReference })
    if (!pay) {
      pay = await TripPayment.create(payDef)
      console.log(`   [CREATED] Payment: ${pay.paymentReference} (${pay.amountDZD} DZD via ${pay.method}, Status: ${pay.status})`)
    } else {
      Object.assign(pay, payDef)
      await pay.save()
      console.log(`   [VERIFIED] Payment: ${pay.paymentReference}`)
    }
  }

  // 8. Reconcile Bookings Financial Statuses deterministically
  console.log(`-> Deterministically Reconciling Booking Financial Ledgers...`)
  for (const bkg of seededBookings) {
    const updatedBkg = await recalculateBookingFinancials(bkg._id)
    console.log(`   [RECONCILED] ${updatedBkg.bookingReference}: Status=${updatedBkg.financialStatus}, Paid=${updatedBkg.totalPaidDZD} DZD, Due=${updatedBkg.balanceDueDZD} DZD`)
  }

  // 9. Seed Realistic Enquiries & Quotations
  console.log(`-> Seeding Custom Enquiries & Quotations...`)
  const enquiryDefs = [
    {
      enquiryReference: 'TRV-ENQ-DEMO01',
      customer: customerUser._id,
      customerInfo: {
        fullName: 'Demo Tourist',
        phone: customerUser.phone,
        email: customerUser.email
      },
      agency: agencyUser._id,
      destination: 'Djanet & Tassili n’Ajjer',
      wilaya: wilayaDjanet._id,
      startDate: new Date(now.getTime() + 45 * 86400000),
      endDate: new Date(now.getTime() + 51 * 86400000),
      groupSize: 4,
      theme: 'Sahara & Bivouac Privé',
      budgetDZD: 380000,
      specialRequests: 'Nous souhaitons organiser une traversée privée en 4x4 vers l’Oued Djerat pour photographier les fresques rupestres avec un bivouac nomade exclusif pour 4 personnes.',
      status: 'quoted',
      quotation: {
        quotedPriceDZD: 360000,
        itinerarySummary: 'Circuit sur mesure 6 jours en 2x 4x4 tout équipés avec guide naturaliste et chef cuisinier saharien dédié.',
        inclusions: ['Véhicules 4x4 privés', 'Bivouac VIP exclusif', 'Pension complète saharienne', 'Permis d’accès parc national'],
        exclusions: ['Billets d’avion', 'Assurances personnelles'],
        validUntil: new Date(now.getTime() + 15 * 86400000),
        agencyNotes: 'Tarif préférentiel consenti pour la saison automnale.',
        quotedAt: new Date(now.getTime() - 2 * 86400000),
        quotedBy: agencyUser._id
      }
    },
    {
      enquiryReference: 'TRV-ENQ-DEMO02',
      customer: null,
      customerInfo: {
        fullName: 'Nadia Benali',
        phone: '+213559887766',
        email: 'nadia.benali@fictional.test'
      },
      agency: agencyUser._id,
      destination: 'Vallée du M’Zab, Ghardaïa',
      wilaya: wilayaGhardaia._id,
      startDate: new Date(now.getTime() + 30 * 86400000),
      endDate: new Date(now.getTime() + 33 * 86400000),
      groupSize: 8,
      theme: 'Séminaire Éco-Responsable',
      budgetDZD: 400000,
      specialRequests: 'Demande de devis pour un groupe associatif de 8 architectes désireux d’étudier la gestion de l’eau et l’urbanisme millénaire des ksars de la vallée.',
      status: 'requested'
    }
  ]

  for (const enqDef of enquiryDefs) {
    let enq = await TripEnquiry.findOne({ enquiryReference: enqDef.enquiryReference })
    if (!enq) {
      enq = await TripEnquiry.create(enqDef)
      console.log(`   [CREATED] Enquiry: ${enq.enquiryReference} (${enq.customerInfo.fullName}, Status: ${enq.status})`)
    } else {
      Object.assign(enq, enqDef)
      await enq.save()
      console.log(`   [VERIFIED] Enquiry: ${enq.enquiryReference}`)
    }
  }

  // 10. Seed Agency Promotional Announcements
  console.log(`-> Seeding Agency Announcements & Offers...`)
  const defaultCategory = await Category.findOne({})
  const announcementDefs = [
    {
      name: "Saison Saharienne 2026/2027 : Ouverture des Réservations Djanet",
      description: "Touriva Horizons Voyages ouvre officiellement le calendrier des départs garantis vers le Tassili n'Ajjer. Places limitées par convoi pour préserver l'écosystème.",
      price: '95000',
      category: defaultCategory ? defaultCategory._id : null,
      ownerId: agencyUser._id,
      published: true,
      paid: true,
      img: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: "Promotion Spéciale Automne : Escapade Culturelle Oran & Tlemcen",
      description: "Profitez d'un tarif découverte pour notre circuit architectural de 4 jours. Hébergements 4 étoiles sélectionnés avec soin.",
      price: '42000',
      category: defaultCategory ? defaultCategory._id : null,
      ownerId: agencyUser._id,
      published: true,
      paid: true,
      img: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80'
    }
  ]

  for (const annDef of announcementDefs) {
    let ann = await Announcement.findOne({ ownerId: agencyUser._id, name: annDef.name })
    if (!ann) {
      ann = await Announcement.create(annDef)
      console.log(`   [CREATED] Announcement: "${ann.name}"`)
    } else {
      Object.assign(ann, annDef)
      await ann.save()
      console.log(`   [VERIFIED] Announcement: "${ann.name}"`)
    }
  }

  console.log(`\n======================================================`)
  console.log(`[SUCCESS] Touriva Demo Dataset Successfully Seeded!`)
  console.log(`- Demo Customer : ${DEMO_CREDENTIALS.customer.email} (${DEMO_CREDENTIALS.customer.phone})`)
  console.log(`- Demo Agency   : ${DEMO_CREDENTIALS.agency.email} (${DEMO_CREDENTIALS.agency.phone})`)
  console.log(`- Demo Admin    : ${DEMO_CREDENTIALS.admin.email} (${DEMO_CREDENTIALS.admin.phone})`)
  console.log(`======================================================\n`)

  if (shouldDisconnect && require.main === module) {
    await mongoose.disconnect()
  }
}

if (require.main === module) {
  seedDemoUsersAndData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(`[FATAL ERROR] Seeder failed:`, err)
      process.exit(1)
    })
}

module.exports = {
  seedDemoUsersAndData,
  DEMO_CREDENTIALS
}
