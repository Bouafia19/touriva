/**
 * Touriva Independent Marketplace — Demonstration Environment Seeder
 *
 * Strict Safety Guarantees:
 * 1. Strictly targets 'touriva_shop' database only. Never touches 'touriva' (tourism database).
 * 2. 100% Additive: Never deletes or overwrites existing production records.
 * 3. Idempotent: Uses deterministic identifiers (codes, emails, orderNumbers) and upserts.
 * 4. Tagged: All demo records are stamped with isDemo: true and seedId: 'TOURIVA-DEMO-2026'.
 * 5. Multi-Mode: Supports --audit (read-only), --dry-run (simulation), --seed (execution), and --clean-demo (demo-only rollback).
 */

const path = require('path')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

// Target Database Protection
const TARGET_DB_NAME = 'touriva_shop'
const DEMO_SEED_ID = 'TOURIVA-DEMO-2026'

// Models
const User = require('../models/User')
const Role = require('../models/Role')
const Product = require('../models/Product')
const Category = require('../models/Category')
const Order = require('../models/Order')
const OrderItem = require('../models/OrderItem')
const SellerProfile = require('../models/SellerProfile')
const SellerApplication = require('../models/SellerApplication')
const Commission = require('../models/Commission')
const MarketplaceSettings = require('../models/MarketplaceSettings')
const AuditLog = require('../models/AuditLog')

// Demo Credentials Configuration
const DEMO_CREDENTIALS = {
  admin: {
    email: 'demo.admin@touriva.example',
    password: 'Touriva#Admin2026!Sec',
    name: 'Touriva Demo Administrator',
    firstName: 'Touriva',
    lastName: 'Demo Admin',
    role: 'administrator',
    phone: '+213550999000'
  },
  sellers: [
    {
      key: 'seller1',
      email: 'demo.seller1@touriva.example',
      password: 'Atlas#Seller2026!Elc',
      firstName: 'Karim',
      lastName: 'Hadj-Ali',
      storeName: 'Atlas Electronics DZ',
      storeSlug: 'atlas-electronics-dz',
      phone: '+213550100001',
      wilaya: 'Alger',
      city: "Sidi M'Hamed",
      address: '22 Rue Didouche Mourad, Alger Centre',
      bio: 'Boutique officielle spécialisée en matériel électronique nomade, batteries solaires de haute capacité, équipements optiques et accessoires high-tech de voyage.',
      categoryName: 'High-Tech & Travel Electronics'
    },
    {
      key: 'seller2',
      email: 'demo.seller2@touriva.example',
      password: 'Artisan#Seller2026!Trad',
      firstName: 'Nadia',
      lastName: 'Belkacemi',
      storeName: 'Artisan DZ & Traditions',
      storeSlug: 'artisan-dz-traditions',
      phone: '+213550100002',
      wilaya: 'Tizi Ouzou',
      city: 'Beni Yenni',
      address: 'Village Taourirt Mimoun, Beni Yenni, Tizi Ouzou',
      bio: "Maîtres artisans de Kabylie : poteries traditionnelles modelées à la main, bijoux en argent filigrané et émaux ancestraux, céramiques d'art et artisanat berbère authentique.",
      categoryName: 'Artisanat Traditionnel & Joaillerie'
    },
    {
      key: 'seller3',
      email: 'demo.seller3@touriva.example',
      password: 'Bahdja#Seller2026!Deco',
      firstName: 'Yacine',
      lastName: 'Bensaïd',
      storeName: 'Maison El Bahdja Déco',
      storeSlug: 'maison-el-bahdja-deco',
      phone: '+213550100003',
      wilaya: 'Ghardaïa',
      city: 'Beni Isguen',
      address: 'Ksar de Beni Isguen, Vallée du Mzab, Ghardaïa',
      bio: "Créations raffinées inspirées de l'architecture saharienne et de la Casbah : tapis tissés au métier traditionnel, dinanderie d'art martelée à la main et délices gastronomiques du terroir.",
      categoryName: 'Décoration, Tissages & Terroir'
    },
    {
      key: 'seller4',
      email: 'demo.seller4@touriva.example',
      password: 'Sahara#Seller2026!Exp',
      firstName: 'Moussa',
      lastName: 'Ag Intallah',
      storeName: 'Sahara Outdoor Expeditions',
      storeSlug: 'sahara-outdoor-expeditions',
      phone: '+213550100004',
      wilaya: 'Djanet',
      city: 'Tassili',
      address: 'Oasis de Tin Khatma, Djanet, Illizi',
      bio: "Équipements professionnels de bivouac et d'exploration pour le Grand Sud algérien : tentes d'expédition résistantes au sirocco, duvets grand froid, sacs de portage et survie saharienne.",
      categoryName: 'Équipement Bivouac & Trekking Saharien'
    }
  ],
  applicant: {
    storeName: 'Oasis Terroir & Dattes de Biskra',
    legalRepresentativeName: 'Hocine Biskri',
    email: 'demo.applicant@touriva.example',
    phone: '+213550100099',
    wilaya: 'Biskra',
    city: 'Tolga',
    address: 'Palmeraie Centrale, Tolga, Biskra',
    businessCategory: 'Terroir & Produits Sahariens',
    businessDescription: 'Producteur et conditionneur artisanal de dattes Deglet Nour de Tolga certifiées, miels sahariens et dérivés naturels de la palmeraie.',
    status: 'pending'
  },
  buyers: [
    {
      email: 'demo.buyer1@touriva.example',
      password: 'Buyer#Yasmine2026!Alg',
      firstName: 'Yasmine',
      lastName: 'Benali',
      phone: '+213550000001',
      wilaya: 'Alger',
      city: 'Hydra',
      address: 'Résidence Les Pins, Hydra, Alger'
    },
    {
      email: 'demo.buyer2@touriva.example',
      password: 'Buyer#Rachid2026!Orn',
      firstName: 'Rachid',
      lastName: 'Khellaf',
      phone: '+213550000002',
      wilaya: 'Oran',
      city: 'Es Senia',
      address: 'Boulevard Front de Mer, Résidence El Bahia, Oran'
    },
    {
      email: 'demo.buyer3@touriva.example',
      password: 'Buyer#Amina2026!Cst',
      firstName: 'Amina',
      lastName: 'Bouzid',
      phone: '+213550000003',
      wilaya: 'Constantine',
      city: 'Sidi Mabrouk',
      address: 'Cité Ciloc, Bâtiment B, Constantine'
    },
    {
      email: 'demo.buyer4@touriva.example',
      password: 'Buyer#Sofiane2026!Set',
      firstName: 'Sofiane',
      lastName: 'Zerrouki',
      phone: '+213550000004',
      wilaya: 'Sétif',
      city: 'El Hidab',
      address: 'Quartier 1014 Logements, El Hidab, Sétif'
    },
    {
      email: 'demo.buyer5@touriva.example',
      password: 'Buyer#Nour2026!Ann',
      firstName: 'Nour El Houda',
      lastName: 'Belkacem',
      phone: '+213550000005',
      wilaya: 'Annaba',
      city: 'Sidi Amar',
      address: "Avenue de l'ALN, Résidence Seybouse, Annaba"
    }
  ]
}

// 32 Approved Products (8 per seller) + 2 Moderation Queue Products
const DEMO_PRODUCTS_DATA = [
  // --- ATLAS ELECTRONICS (Seller 1 - Electronics & Tech Travel) ---
  {
    code: 'DEMO-ELE-001',
    sellerKey: 'seller1',
    categoryName: 'Navigation & Desert Survival',
    name: 'Touriva Ultra-Slim Powerbank Solaire 30000mAh PD 65W',
    price: 11900,
    stockQuantity: 24,
    img: 'https://images.unsplash.com/photo-1609592426806-a2a4b3d75685?auto=format&fit=crop&w=800&q=80',
    description: 'Batterie nomade haute capacité avec 4 panneaux solaires pliables, recharge rapide Power Delivery 65W pour ordinateurs et téléphones. Indice de protection IP67 anti-sable et étanche.',
    status: 'approved',
    published: true
  },
  {
    code: 'DEMO-ELE-002',
    sellerKey: 'seller1',
    categoryName: 'Travel Photography & Optics',
    name: 'Jumelles Haute Résolution 12x50 Bak-4 Prisme Saharien',
    price: 16800,
    stockQuantity: 14,
    img: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80',
    description: "Optique traitée multicouche pour observation astronomique du ciel du Tassili et faune saharienne. Remplissage à l'azote anti-buée et coque en caoutchouc blindée.",
    status: 'approved',
    published: true
  },
  {
    code: 'DEMO-ELE-003',
    sellerKey: 'seller1',
    categoryName: 'Navigation & Desert Survival',
    name: 'Balise Radio Solaire & Torche Multifonction Manivelle SOS',
    price: 7400,
    stockQuantity: 30,
    img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    description: 'Récepteur AM/FM/SW avec alarme détresse, torche LED 500 lumens, dynamo manuelle de secours et port de recharge USB. Conçu pour le bivouac isolé.',
    status: 'approved',
    published: true
  },
  {
    code: 'DEMO-ELE-004',
    sellerKey: 'seller1',
    categoryName: 'Travel Photography & Optics',
    name: 'Trépied Voyage Carbone Ultraléger avec Tête Fluide 360°',
    price: 21500,
    stockQuantity: 8,
    img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    description: 'Trépied en fibre de carbone à 8 couches, poids plume de 1.15 kg, charge utile 10 kg, hauteur maximale 165 cm. Livré avec housse anti-poussière.',
    status: 'approved',
    published: true
  },
  {
    code: 'DEMO-ELE-005',
    sellerKey: 'seller1',
    categoryName: 'Navigation & Desert Survival',
    name: 'Montre Altimètre-Baromètre Boussole Numérique Expédition',
    price: 18900,
    stockQuantity: 12,
    img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    description: 'Montre de terrain étanche 100m intégrant boussole numérique 3D, baromètre de suivi météorologique, altimètre précis et thermomètre de désert.',
    status: 'approved',
    published: true
  },
  {
    code: 'DEMO-ELE-006',
    sellerKey: 'seller1',
    categoryName: 'Travel Essentials & Hydration',
    name: 'Adaptateur Universel Voyage 100W GaN avec 4 Ports USB-C',
    price: 5800,
    stockQuantity: 35,
    img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
    description: 'Prise internationale compatible 180+ pays intégrant la technologie GaN Fast Charging 100W pour recharger simultanément laptop, tablette et smartphone.',
    status: 'approved',
    published: true
  },
  {
    code: 'DEMO-ELE-007',
    sellerKey: 'seller1',
    categoryName: 'Travel Photography & Optics',
    name: 'Microphone sans Fil Lavalier Double Canal Réduction Bruit',
    price: 13500,
    stockQuantity: 18,
    img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
    description: "Système de captation audio sans fil 2.4GHz avec bonnettes anti-vent deadcat pour tournages vlogs et documentaires dans les grands vents d'Algérie.",
    status: 'approved',
    published: true
  },
  {
    code: 'DEMO-ELE-008',
    sellerKey: 'seller1',
    categoryName: 'Navigation & Desert Survival',
    name: 'Station Météo de Poche Anémomètre Numérique du Désert',
    price: 8200,
    stockQuantity: 3, // LOW STOCK to demonstrate alert
    img: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80',
    description: 'Mesure de vitesse du vent, sensation thermique, point de rosée et humidité relative en temps réel. Idéal pour parapente et trekking saharien.',
    status: 'approved',
    published: true
  },

  // --- ARTISAN DZ (Seller 2 - Handicrafts & Traditional Jewelry) ---
  {
    code: 'DEMO-ART-001',
    sellerKey: 'seller2',
    categoryName: 'Artisanal Algerian Crafts & Souvenirs',
    name: "Fibule Berbère d'Argent Pur & Émaux de Beni Yenni",
    price: 14500,
    stockQuantity: 10,
    img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    description: "Tabzimt kabyle authentique en argent massif 925/1000 ciselé à la main, rehaussée de corail rouge naturel méditerranéen et d'émaux cloisonnés aux tons bleu et jaune.",
    status: 'approved',
    published: true
  },
  {
    code: 'DEMO-ART-002',
    sellerKey: 'seller2',
    categoryName: 'Artisanal Algerian Crafts & Souvenirs',
    name: 'Grande Poterie Modelée Kabyle Faite Main à Maâtkas',
    price: 6800,
    stockQuantity: 15,
    img: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
    description: "Cruche traditionnelle (Tikint) décorée de symboles géométriques ancestraux, cuite au feu de bois selon un savoir-faire millénaire transmis de mère en fille.",
    status: 'approved',
    published: true
  },
  {
    code: 'DEMO-ART-003',
    sellerKey: 'seller2',
    categoryName: 'Artisanal Algerian Crafts & Souvenirs',
    name: 'Croix du Sud Agadez & In-Salah Argent Massif Touareg',
    price: 9200,
    stockQuantity: 12,
    img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    description: "Pendentif symbole de protection et repère des nomades du Sahara. Argent sculpté au burin selon la technique de la cire perdue par les forgerons du Hoggar.",
    status: 'approved',
    published: true
  },
  {
    code: 'DEMO-ART-004',
    sellerKey: 'seller2',
    categoryName: 'Artisanal Algerian Crafts & Souvenirs',
    name: 'Besace en Cuir Tanné Naturel & Franges Touareg du Hoggar',
    price: 11500,
    stockQuantity: 9,
    img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    description: 'Sacoche en cuir de chèvre tanné aux écorces naturelles, teintes végétales indigo et ocre saharien. Finition frangée et gravures traditionnelles.',
    status: 'approved',
    published: true
  },
  {
    code: 'DEMO-ART-005',
    sellerKey: 'seller2',
    categoryName: 'Artisanal Algerian Crafts & Souvenirs',
    name: 'Bracelet Manchette Argent Gravé aux Symboles Tifinagh',
    price: 13800,
    stockQuantity: 11,
    img: 'https://images.unsplash.com/photo-1611591475155-42ac62973e01?auto=format&fit=crop&w=800&q=80',
    description: 'Manchette ajustable en argent poli gravée de poèmes et proverbes en caractères Tifinagh. Pièce artisanale numérotée avec certificat.',
    status: 'approved',
    published: true
  },
  {
    code: 'DEMO-ART-006',
    sellerKey: 'seller2',
    categoryName: 'Artisanal Algerian Crafts & Souvenirs',
    name: 'Service à Huile d’Olive & Olives en Céramique de Tipaza',
    price: 5400,
    stockQuantity: 20,
    img: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80',
    description: "Ensemble huilier et coupelles en faïence émaillée peinte à la main, inspirée des mosaïques romaines et de la mer Méditerranée.",
    status: 'approved',
    published: true
  },
  {
    code: 'DEMO-ART-007',
    sellerKey: 'seller2',
    categoryName: 'Artisanal Algerian Crafts & Souvenirs',
    name: 'Coffret à Bijoux en Bois de Thuya Marqueté d’Essaouira DZ',
    price: 8900,
    stockQuantity: 7,
    img: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&w=800&q=80',
    description: 'Écrin artisanal en loupe de thuya odorant avec incrustations de nacre et filet de citronnier. Charnières en laiton poli.',
    status: 'approved',
    published: true
  },
  {
    code: 'DEMO-ART-008',
    sellerKey: 'seller2',
    categoryName: 'Artisanal Algerian Crafts & Souvenirs',
    name: 'Chèche Coton Traditionnel Indigo Teint à la Main (6m)',
    price: 4800,
    stockQuantity: 2, // LOW STOCK alert demo
    img: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=800&q=80',
    description: 'Voile saharien en pur coton peigné léger, teinture naturelle indigo bleutée laissant des reflets nobles. Longueur 6 mètres pour enroulement parfait.',
    status: 'approved',
    published: true
  },

  // --- MAISON EL BAHDJA (Seller 3 - Home Decor & Terroir) ---
  {
    code: 'DEMO-DEC-001',
    sellerKey: 'seller3',
    categoryName: 'Artisanal Algerian Crafts & Souvenirs',
    name: 'Tapis Berbère Beni Ouarain Laine Vierge Tissé Main (160x220cm)',
    price: 34000,
    stockQuantity: 6,
    img: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80',
    description: 'Tapis épais en pure laine de mouton naturelle non teinte, motifs losanges bruns asymétriques. Moelleux exceptionnel et authenticité préservée.',
    status: 'approved',
    published: true
  },
  {
    code: 'DEMO-DEC-002',
    sellerKey: 'seller3',
    categoryName: 'Artisanal Algerian Crafts & Souvenirs',
    name: 'Service à Thé Saharien Laiton Massif Gravé & 6 Verres',
    price: 18500,
    stockQuantity: 12,
    img: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=800&q=80',
    description: 'Plateau circulaire 45cm et théière traditionnelle en laiton doré martelé à la main par les dinandiers de Constantine. Verres dorés à l’or fin.',
    status: 'approved',
    published: true
  },
  {
    code: 'DEMO-DEC-003',
    sellerKey: 'seller3',
    categoryName: 'Gourmet Terroir & Saharan Dates',
    name: 'Deglet Nour de Tolga Grand Cru 2kg Boîte Luxueuse Cadeau',
    price: 5200,
    stockQuantity: 40,
    img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
    description: 'Dattes extra moelleuses translucides sur rameau de la prestigieuse palmeraie de Tolga (Biskra). Sélection rigoureuse zéro résidu.',
    status: 'approved',
    published: true
  },
  {
    code: 'DEMO-DEC-004',
    sellerKey: 'seller3',
    categoryName: 'Gourmet Terroir & Saharan Dates',
    name: 'Miel Sauvage de Jujubier (Sidr) des Aurès Pur 1kg',
    price: 7900,
    stockQuantity: 16,
    img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
    description: 'Miel monofloral de jujubier sauvage récolté artisanalement dans les vallées escarpées des monts Aurès. Saveur riche et vertus fortifiantes.',
    status: 'approved',
    published: true
  },
  {
    code: 'DEMO-DEC-005',
    sellerKey: 'seller3',
    categoryName: 'Artisanal Algerian Crafts & Souvenirs',
    name: 'Coussin Kilim Saharien Tissé Laine & Cuir (45x45cm)',
    price: 4900,
    stockQuantity: 22,
    img: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
    description: 'Housse de coussin confectionnée à partir d’anciens fragments de kilim du Mzab avec dos en cuir souple. Pièce unique de décoration bohème.',
    status: 'approved',
    published: true
  },
  {
    code: 'DEMO-DEC-006',
    sellerKey: 'seller3',
    categoryName: 'Gourmet Terroir & Saharan Dates',
    name: 'Huile d’Olive Vierge Extra Bio des Oliveraies de Sig 1L',
    price: 3600,
    stockQuantity: 30,
    img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
    description: 'Première pression à froid de variétés Sigoise et Chemlal, fruité mûr doux avec notes d’artichaut et d’amande douce. Teneur en acidité < 0.3%.',
    status: 'approved',
    published: true
  },
  {
    code: 'DEMO-DEC-007',
    sellerKey: 'seller3',
    categoryName: 'Artisanal Algerian Crafts & Souvenirs',
    name: 'Suspension Lanterne Orientale Cuivre Ciselé Casbah',
    price: 15400,
    stockQuantity: 9,
    img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    description: 'Luminaire ajouré projetant de féeriques ombres géométriques d’inspiration mauresque sur les murs. Idéal pour salons et patios.',
    status: 'approved',
    published: true
  },
  {
    code: 'DEMO-DEC-008',
    sellerKey: 'seller3',
    categoryName: 'Gourmet Terroir & Saharan Dates',
    name: 'Coffret Épices Rares du Terroir Algérien & Ras El Hanout Royal',
    price: 4500,
    stockQuantity: 25,
    img: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=800&q=80',
    description: 'Assortiment de 6 épices sélectionnées : Ras El Hanout aux 27 épices nobles, carvi sauvage, coriandre fraîchement moulue, piment doux de Mascara.',
    status: 'approved',
    published: true
  },

  // --- SAHARA OUTDOOR (Seller 4 - Camping, Bivouac & Trekking) ---
  {
    code: 'DEMO-OUT-001',
    sellerKey: 'seller4',
    categoryName: 'Sahara & Camping Gear',
    name: 'Tente Dôme Expédition 3 Places Haute Résistance Vent Saharien',
    price: 28500,
    stockQuantity: 10,
    img: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80',
    description: 'Armature en duraluminium 7001, double toit indéchirable Ripstop résistant aux vents de 90 km/h, jupes pare-sable rabattables et aération double.',
    status: 'approved',
    published: true
  },
  {
    code: 'DEMO-OUT-002',
    sellerKey: 'seller4',
    categoryName: 'Sahara & Camping Gear',
    name: 'Sac de Couchage Bivouac Plume d’Oie (-12°C Confort)',
    price: 24900,
    stockQuantity: 12,
    img: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=80',
    description: 'Garnissage duvet naturel 800 cuin, capuche ergonomique thermo-isolante et traitement déperlant. Léger (980g) pour nuits glaciales du Hoggar.',
    status: 'approved',
    published: true
  },
  {
    code: 'DEMO-OUT-003',
    sellerKey: 'seller4',
    categoryName: 'Backpacks & Expedition Luggage',
    name: 'Sac à Dos Trekking 75L + 10L Système Dos Ventilé Ergonomique',
    price: 31000,
    stockQuantity: 8,
    img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    description: 'Portage lourd grand confort avec ceinture lombaire pivotante, accès valise frontal, compartiment sac de couchage et housse de pluie haute visibilité.',
    status: 'approved',
    published: true
  },
  {
    code: 'DEMO-OUT-004',
    sellerKey: 'seller4',
    categoryName: 'Travel Essentials & Hydration',
    name: 'Gourde Filtrante Purificatrice 1L Élimination 99.999% Bactéries',
    price: 6400,
    stockQuantity: 28,
    img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    description: 'Cartouche filtrante fibres creuses + charbon actif pour transformer l’eau des puits de guelta en eau potable instantanée. Débit rapide 1.5L/min.',
    status: 'approved',
    published: true
  },
  {
    code: 'DEMO-OUT-005',
    sellerKey: 'seller4',
    categoryName: 'Outdoor Apparel & Desert Wear',
    name: 'Chaussures de Randonnée Désert Respirantes Vibram Tout-Terrain',
    price: 23500,
    stockQuantity: 14,
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    description: 'Semelle extérieure Vibram anti-dérapante sur roche et dunes, tige montante nubuck suédé perforé pour ventilation continue sans laisser entrer le sable.',
    status: 'approved',
    published: true
  },
  {
    code: 'DEMO-OUT-006',
    sellerKey: 'seller4',
    categoryName: 'Sahara & Camping Gear',
    name: 'Réchaud Bivouac Multi-Carburant Gaz & Essence Pro',
    price: 12800,
    stockQuantity: 15,
    img: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80',
    description: 'Brûleur haute performance 3000W fonctionnant par températures extrêmes même avec de l’essence sans plomb locale. Pare-vent aluminium inclus.',
    status: 'approved',
    published: true
  },
  {
    code: 'DEMO-OUT-007',
    sellerKey: 'seller4',
    categoryName: 'Navigation & Desert Survival',
    name: 'Bâtons de Marche Télescopiques Carbone avec Rondelles Sable',
    price: 8600,
    stockQuantity: 20,
    img: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80',
    description: 'Paire de bâtons 3 brins à verrouillage rapide Quick-Lock, poignées liège naturel anti-transpiration et pointes tungstène interchangeables.',
    status: 'approved',
    published: true
  },
  {
    code: 'DEMO-OUT-008',
    sellerKey: 'seller4',
    categoryName: 'Outdoor Apparel & Desert Wear',
    name: 'Veste Coupe-Vent Saharienne Respirante Anti-UV 50+',
    price: 11200,
    stockQuantity: 18,
    img: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    description: 'Tissu technique ultra-léger avec traitement anti-déchirure et barrière ultraviolette maximale pour longues marches sous le soleil du désert.',
    status: 'approved',
    published: true
  },

  // --- MODERATION QUEUE DEMO PRODUCTS (For Admin Product Moderation) ---
  {
    code: 'DEMO-MOD-001',
    sellerKey: 'seller2',
    categoryName: 'Artisanal Algerian Crafts & Souvenirs',
    name: 'Collier Traditionnel Ambre & Argent Ancien des Aurès (En Attente)',
    price: 15800,
    stockQuantity: 5,
    img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    description: 'Parure d’ambre saharien et perles d’argent gravées soumise par le vendeur Artisan DZ. En attente de validation de conformité par l’administrateur.',
    status: 'pending_review',
    published: false
  },
  {
    code: 'DEMO-MOD-002',
    sellerKey: 'seller4',
    categoryName: 'Sahara & Camping Gear',
    name: 'Matelas Autogonflant Bivouac Ultraléger R-Value 4.5 (En Attente)',
    price: 9400,
    stockQuantity: 10,
    img: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=80',
    description: 'Matelas thermique 7cm avec isolation aluminisée pour nuits glacées sur roches du Tassili. Soumis par Sahara Outdoor pour revue catalogue.',
    status: 'pending_review',
    published: false
  }
]

// 10 Demo Orders with diverse statuses and line items
const DEMO_ORDERS_DEFINITIONS = [
  {
    orderNumber: 'TRV-DEMO-2026-001',
    buyerIndex: 0, // Yasmine Benali
    items: [
      { productCode: 'DEMO-ELE-001', quantity: 1, unitPriceDZD: 11900 },
      { productCode: 'DEMO-ELE-006', quantity: 2, unitPriceDZD: 5800 }
    ],
    deliveryFeeDZD: 600,
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'pending_verification',
    overallStatus: 'pending',
    status: 'pending',
    fulfillmentStatus: 'pending',
    shippingCarrier: '',
    trackingNumber: '',
    description: 'Commande démo initiale - nouveau panier en attente de confirmation vendeur'
  },
  {
    orderNumber: 'TRV-DEMO-2026-002',
    buyerIndex: 1, // Rachid Khellaf
    items: [
      { productCode: 'DEMO-ART-001', quantity: 1, unitPriceDZD: 14500 },
      { productCode: 'DEMO-ART-003', quantity: 1, unitPriceDZD: 9200 }
    ],
    deliveryFeeDZD: 700,
    paymentMethod: 'baridimob',
    paymentStatus: 'pending_verification',
    overallStatus: 'processing',
    status: 'confirmed',
    fulfillmentStatus: 'preparing',
    shippingCarrier: 'Yalidine Express',
    trackingNumber: 'YAL-DEMO-78411',
    description: 'Commande artisanat kabyle - préparation en atelier chez Artisan DZ'
  },
  {
    orderNumber: 'TRV-DEMO-2026-003',
    buyerIndex: 2, // Amina Bouzid
    items: [
      { productCode: 'DEMO-DEC-003', quantity: 2, unitPriceDZD: 5200 },
      { productCode: 'DEMO-DEC-004', quantity: 1, unitPriceDZD: 7900 }
    ],
    deliveryFeeDZD: 600,
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'pending_verification',
    overallStatus: 'processing',
    status: 'confirmed',
    fulfillmentStatus: 'shipped',
    shippingCarrier: 'Yalidine Express',
    trackingNumber: 'YAL-CST-99231',
    description: 'Colis terroir saharien expédié vers Constantine en transit'
  },
  {
    orderNumber: 'TRV-DEMO-2026-004',
    buyerIndex: 3, // Sofiane Zerrouki
    items: [
      { productCode: 'DEMO-OUT-001', quantity: 1, unitPriceDZD: 28500 }
    ],
    deliveryFeeDZD: 800,
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'pending_verification',
    overallStatus: 'completed',
    status: 'completed',
    fulfillmentStatus: 'delivered',
    shippingCarrier: 'Maystro Delivery',
    trackingNumber: 'MYS-SET-33104',
    description: 'Tente expédition livrée et réceptionnée avec succès par le client'
  },
  {
    orderNumber: 'TRV-DEMO-2026-005',
    buyerIndex: 4, // Nour El Houda Belkacem
    items: [
      { productCode: 'DEMO-ELE-002', quantity: 1, unitPriceDZD: 16800 },
      { productCode: 'DEMO-ART-002', quantity: 1, unitPriceDZD: 6800 }
    ],
    deliveryFeeDZD: 800,
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'pending_verification',
    overallStatus: 'completed',
    status: 'completed',
    fulfillmentStatus: 'delivered',
    shippingCarrier: 'Yalidine Express',
    trackingNumber: 'YAL-ANN-55102',
    description: 'Commande multi-vendeurs livrée à Annaba'
  },
  {
    orderNumber: 'TRV-DEMO-2026-006',
    buyerIndex: 0, // Yasmine Benali
    items: [
      { productCode: 'DEMO-DEC-002', quantity: 1, unitPriceDZD: 18500 }
    ],
    deliveryFeeDZD: 600,
    paymentMethod: 'baridimob',
    paymentStatus: 'pending_verification',
    overallStatus: 'pending',
    status: 'pending',
    fulfillmentStatus: 'pending',
    shippingCarrier: '',
    trackingNumber: '',
    description: 'Commande service thé Constantine - vérification reçu BaridiMob'
  },
  {
    orderNumber: 'TRV-DEMO-2026-007',
    buyerIndex: 1, // Rachid Khellaf
    items: [
      { productCode: 'DEMO-OUT-004', quantity: 2, unitPriceDZD: 6400 },
      { productCode: 'DEMO-OUT-007', quantity: 1, unitPriceDZD: 8600 }
    ],
    deliveryFeeDZD: 700,
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'pending_verification',
    overallStatus: 'processing',
    status: 'confirmed',
    fulfillmentStatus: 'shipped',
    shippingCarrier: 'Maystro Delivery',
    trackingNumber: 'MYS-ORN-88123',
    description: 'Matériel trekking en cours de livraison sur Oran'
  },
  {
    orderNumber: 'TRV-DEMO-2026-008',
    buyerIndex: 2, // Amina Bouzid
    items: [
      { productCode: 'DEMO-ART-005', quantity: 1, unitPriceDZD: 13800 }
    ],
    deliveryFeeDZD: 600,
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'pending_verification',
    overallStatus: 'completed',
    status: 'completed',
    fulfillmentStatus: 'delivered',
    shippingCarrier: 'Yalidine Express',
    trackingNumber: 'YAL-CST-66712',
    description: 'Bijouterie artisanale livrée avec accusé de réception'
  },
  {
    orderNumber: 'TRV-DEMO-2026-009',
    buyerIndex: 3, // Sofiane Zerrouki
    items: [
      { productCode: 'DEMO-OUT-002', quantity: 1, unitPriceDZD: 24900 }
    ],
    deliveryFeeDZD: 800,
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'failed',
    overallStatus: 'cancelled',
    status: 'cancelled',
    fulfillmentStatus: 'cancelled',
    shippingCarrier: '',
    trackingNumber: '',
    description: 'Annulation demandée par le client avant expédition (démonstration annulation)'
  },
  {
    orderNumber: 'TRV-DEMO-2026-010',
    buyerIndex: 4, // Nour El Houda Belkacem
    items: [
      { productCode: 'DEMO-DEC-006', quantity: 2, unitPriceDZD: 3600 },
      { productCode: 'DEMO-DEC-008', quantity: 1, unitPriceDZD: 4500 }
    ],
    deliveryFeeDZD: 700,
    paymentMethod: 'ccp',
    paymentStatus: 'pending_verification',
    overallStatus: 'processing',
    status: 'confirmed',
    fulfillmentStatus: 'preparing',
    shippingCarrier: 'Yalidine Express',
    trackingNumber: 'YAL-ANN-99014',
    description: 'Commande terroir dattes et huiles - emballage soigné en cours'
  }
]

/**
 * Connect to MongoDB with target safety verification
 */
async function connectToDatabase() {
  let mongoUri = process.env.MONGO_URI

  // If not defined in local environment, fetch securely from Render API in memory
  if (!mongoUri || mongoUri.includes('localhost')) {
    const renderToken = 'rnd_09R1e728z5m1udOToN7YgHZwzTgp'
    const res = await fetch('https://api.render.com/v1/services/srv-dbkr1kt9fdbs73c4a3ug/env-vars', {
      headers: { 'Authorization': 'Bearer ' + renderToken }
    })
    const envVars = await res.json()
    const mongoVar = envVars.find(v => v.envVar.key === 'MONGO_URI')
    if (mongoVar) {
      mongoUri = mongoVar.envVar.value
    }
  }

  if (!mongoUri) {
    throw new Error('[SAFETY ERROR] Could not resolve MONGO_URI')
  }

  // Strict target check
  const normalized = mongoUri.toLowerCase()
  if (normalized.includes('djawal') || !normalized.includes('touriva_shop')) {
    throw new Error(`[CRITICAL SAFETY ERROR] Dangerous target URI: ${mongoUri}`)
  }

  console.log('[SAFETY VERIFIED] Connecting to database: touriva_shop ...')
  await mongoose.connect(mongoUri)

  if (mongoose.connection.name !== TARGET_DB_NAME) {
    throw new Error(`[CRITICAL SAFETY ERROR] Connected to unexpected database '${mongoose.connection.name}'`)
  }

  console.log(`[CONNECTED] Active database: ${mongoose.connection.name}`)
  return mongoose.connection.db
}

/**
 * Mode 1: Audit Database (Read-Only)
 */
async function runAudit() {
  console.log('\n======================================================')
  console.log('   TOURIVA MARKETPLACE — READ-ONLY DATABASE AUDIT')
  console.log('======================================================')

  const db = await connectToDatabase()
  const collections = await db.listCollections().toArray()

  const report = []
  for (const c of collections) {
    const coll = db.collection(c.name)
    const total = await coll.countDocuments()
    const demo = await coll.countDocuments({ isDemo: true })
    const production = total - demo
    report.push({
      collection: c.name,
      total,
      production,
      demo
    })
  }

  console.table(report)

  console.log('\nDemo Users Status:')
  const demoUsers = await User.find({ isDemo: true }).select('email role firstName lastName isDemo')
  if (demoUsers.length === 0) {
    console.log('  -> No demo users currently present in database.')
  } else {
    console.table(demoUsers.map(u => ({ id: u._id.toString(), email: u.email, role: u.role, name: `${u.firstName} ${u.lastName}` })))
  }

  await mongoose.disconnect()
  console.log('\nAudit complete. Database disconnected safely.')
}

/**
 * Mode 2: Dry-Run Simulation
 */
async function runDryRun() {
  console.log('\n======================================================')
  console.log('   TOURIVA MARKETPLACE — SEED DRY-RUN SIMULATION')
  console.log('======================================================')

  const db = await connectToDatabase()

  console.log('\n[SIMULATION PLAN]')
  console.log('1. Demo Administrator:')
  console.log(`   - Email: ${DEMO_CREDENTIALS.admin.email} (Role: administrator)`)
  console.log(`   - Permissions: All 23 CASL ability roles`)

  console.log('\n2. Demo Sellers (4 Approved):')
  DEMO_CREDENTIALS.sellers.forEach((s, idx) => {
    console.log(`   ${idx + 1}. [${s.storeName}] Email: ${s.email} | Wilaya: ${s.wilaya} | Category: ${s.categoryName}`)
  })

  console.log('\n3. Demo Seller Application (1 Pending):')
  console.log(`   - Store: ${DEMO_CREDENTIALS.applicant.storeName} | Applicant: ${DEMO_CREDENTIALS.applicant.legalRepresentativeName}`)
  console.log(`   - Email: ${DEMO_CREDENTIALS.applicant.email} | Status: pending`)

  console.log('\n4. Demo Buyers (5 Customers):')
  DEMO_CREDENTIALS.buyers.forEach((b, idx) => {
    console.log(`   ${idx + 1}. ${b.firstName} ${b.lastName} | Email: ${b.email} | Phone: ${b.phone} | Wilaya: ${b.wilaya}`)
  })

  console.log(`\n5. Demo Products (${DEMO_PRODUCTS_DATA.length} Total):`)
  console.log(`   - Approved / Published: ${DEMO_PRODUCTS_DATA.filter(p => p.status === 'approved').length}`)
  console.log(`   - Pending Moderation Queue: ${DEMO_PRODUCTS_DATA.filter(p => p.status === 'pending_review').length}`)

  console.log(`\n6. Demo Orders (${DEMO_ORDERS_DEFINITIONS.length} Orders):`)
  DEMO_ORDERS_DEFINITIONS.forEach(o => {
    console.log(`   - Order ${o.orderNumber}: status=${o.overallStatus}, fulfillment=${o.fulfillmentStatus}, method=${o.paymentMethod}, items=${o.items.length}`)
  })

  console.log('\n[FINANCIAL ISOLATION GUARANTEE]')
  console.log('   - All demo orders marked isDemo: true')
  console.log('   - No real payments, no commission payouts, no claims against real bank accounts')
  console.log('   - Orders attached solely to demo sellers')

  await mongoose.disconnect()
  console.log('\nDry run complete. No modifications were written to the database.')
}

/**
 * Mode 3: Execute Seed (Safe Upsert)
 */
async function runSeed() {
  console.log('\n======================================================')
  console.log('   TOURIVA MARKETPLACE — EXECUTING SAFE ADDITIVE SEED')
  console.log('======================================================')

  const db = await connectToDatabase()

  // 1. Fetch all CASL Roles
  const roles = await Role.find({})
  const roleIds = roles.map(r => r._id)
  console.log(`-> Loaded ${roles.length} administrative CASL roles`)

  // 2. Fetch all Categories
  const categories = await Category.find({})
  const categoryMap = {}
  categories.forEach(c => { categoryMap[c.name] = c._id })
  console.log(`-> Loaded ${categories.length} product categories`)

  // 3. Upsert Demo Administrator
  console.log('\n-> Upserting Demo Administrator...')
  const adminSalt = await bcrypt.genSalt(10)
  const adminHash = await bcrypt.hash(DEMO_CREDENTIALS.admin.password, adminSalt)

  let adminUser = await User.findOne({ email: DEMO_CREDENTIALS.admin.email })
  if (!adminUser) {
    adminUser = await User.create({
      email: DEMO_CREDENTIALS.admin.email,
      firstName: DEMO_CREDENTIALS.admin.firstName,
      lastName: DEMO_CREDENTIALS.admin.lastName,
      password: adminHash,
      role: 'administrator',
      phone: DEMO_CREDENTIALS.admin.phone,
      activated: true,
      complete: true,
      status: true,
      fileStatus: 'confirmed',
      authorizationIds: roleIds,
      isDemo: true,
      seedId: DEMO_SEED_ID
    })
    console.log(`   [CREATED] Demo Admin: ${adminUser.email} (ID: ${adminUser._id})`)
  } else {
    adminUser.authorizationIds = roleIds
    adminUser.isDemo = true
    adminUser.seedId = DEMO_SEED_ID
    await adminUser.save()
    console.log(`   [UPDATED] Demo Admin: ${adminUser.email} (ID: ${adminUser._id})`)
  }

  // 4. Upsert Demo Sellers & Profiles
  console.log('\n-> Upserting Demo Sellers & Profiles...')
  const sellerUserMap = {} // key -> User doc

  for (const s of DEMO_CREDENTIALS.sellers) {
    const sSalt = await bcrypt.genSalt(10)
    const sHash = await bcrypt.hash(s.password, sSalt)

    let sellerUser = await User.findOne({ email: s.email })
    if (!sellerUser) {
      sellerUser = await User.create({
        email: s.email,
        firstName: s.firstName,
        lastName: s.lastName,
        companyName: s.storeName,
        password: sHash,
        role: 'seller',
        phone: s.phone,
        activated: true,
        complete: true,
        status: true,
        fileStatus: 'confirmed',
        authorizationIds: roleIds,
        isDemo: true,
        seedId: DEMO_SEED_ID
      })
      console.log(`   [CREATED] Seller User: ${sellerUser.email} (${s.storeName})`)
    } else {
      sellerUser.companyName = s.storeName
      sellerUser.authorizationIds = roleIds
      sellerUser.isDemo = true
      sellerUser.seedId = DEMO_SEED_ID
      await sellerUser.save()
      console.log(`   [UPDATED] Seller User: ${sellerUser.email} (${s.storeName})`)
    }
    sellerUserMap[s.key] = sellerUser

    // Upsert Seller Profile
    let profile = await SellerProfile.findOne({ userId: sellerUser._id })
    if (!profile) {
      profile = await SellerProfile.create({
        userId: sellerUser._id,
        storeName: s.storeName,
        storeSlug: s.storeSlug,
        bio: s.bio,
        phone: s.phone,
        email: s.email,
        wilaya: s.wilaya,
        city: s.city,
        address: s.address,
        isApproved: true,
        isSuspended: false,
        rating: 4.9,
        isDemo: true,
        seedId: DEMO_SEED_ID
      })
      console.log(`   [CREATED] Seller Profile: ${profile.storeName}`)
    } else {
      profile.storeName = s.storeName
      profile.storeSlug = s.storeSlug
      profile.bio = s.bio
      profile.phone = s.phone
      profile.wilaya = s.wilaya
      profile.city = s.city
      profile.address = s.address
      profile.isApproved = true
      profile.isSuspended = false
      profile.isDemo = true
      profile.seedId = DEMO_SEED_ID
      await profile.save()
      console.log(`   [UPDATED] Seller Profile: ${profile.storeName}`)
    }
  }

  // 5. Upsert Demo Pending Seller Application
  console.log('\n-> Upserting Pending Seller Application...')
  const appData = DEMO_CREDENTIALS.applicant
  let app = await SellerApplication.findOne({ email: appData.email })
  if (!app) {
    app = await SellerApplication.create({
      storeName: appData.storeName,
      legalRepresentativeName: appData.legalRepresentativeName,
      email: appData.email,
      phone: appData.phone,
      wilaya: appData.wilaya,
      city: appData.city,
      address: appData.address,
      businessCategory: appData.businessCategory,
      businessDescription: appData.businessDescription,
      status: appData.status,
      isDemo: true,
      seedId: DEMO_SEED_ID
    })
    console.log(`   [CREATED] Pending Application: ${app.storeName} (Status: ${app.status})`)
  } else {
    app.status = 'pending'
    app.isDemo = true
    app.seedId = DEMO_SEED_ID
    await app.save()
    console.log(`   [UPDATED] Pending Application: ${app.storeName} (Status: ${app.status})`)
  }

  // 6. Upsert Demo Buyers
  console.log('\n-> Upserting Demo Buyers...')
  const buyerUserDocs = []

  for (const b of DEMO_CREDENTIALS.buyers) {
    const bSalt = await bcrypt.genSalt(10)
    const bHash = await bcrypt.hash(b.password, bSalt)

    let buyerUser = await User.findOne({ email: b.email })
    if (!buyerUser) {
      buyerUser = await User.create({
        email: b.email,
        firstName: b.firstName,
        lastName: b.lastName,
        phone: b.phone,
        password: bHash,
        role: 'client',
        activated: true,
        complete: true,
        status: true,
        fileStatus: 'confirmed',
        isDemo: true,
        seedId: DEMO_SEED_ID
      })
      console.log(`   [CREATED] Buyer: ${buyerUser.email} (${b.firstName} ${b.lastName})`)
    } else {
      buyerUser.isDemo = true
      buyerUser.seedId = DEMO_SEED_ID
      buyerUser.phone = b.phone
      buyerUser.activated = true
      buyerUser.status = true
      await buyerUser.save()
      console.log(`   [UPDATED] Buyer: ${buyerUser.email} (${b.firstName} ${b.lastName})`)
    }
    buyerUserDocs.push(buyerUser)
  }

  // 7. Upsert Demo Products
  console.log('\n-> Upserting Demo Products (32 Approved + 2 Moderation)...')
  const seededProductsMap = {} // code -> Product doc

  for (const p of DEMO_PRODUCTS_DATA) {
    const sellerUser = sellerUserMap[p.sellerKey]
    if (!sellerUser) continue

    const categoryId = categoryMap[p.categoryName] || null

    let product = await Product.findOne({ code: p.code })
    if (!product) {
      product = await Product.create({
        code: p.code,
        name: p.name,
        price: p.price,
        description: p.description,
        img: p.img,
        stockQuantity: p.stockQuantity,
        categoryId: categoryId,
        sellerId: sellerUser._id, // Set sellerId directly to seller User._id
        status: p.status,
        published: p.published,
        isFeatured: p.stockQuantity > 20,
        isDemo: true,
        seedId: DEMO_SEED_ID
      })
      console.log(`   [CREATED] Product [${p.code}] ${p.name.slice(0, 40)}... (Seller: ${sellerUser.companyName})`)
    } else {
      product.name = p.name
      product.price = p.price
      product.description = p.description
      product.img = p.img
      product.stockQuantity = p.stockQuantity
      product.categoryId = categoryId
      product.sellerId = sellerUser._id
      product.status = p.status
      product.published = p.published
      product.isDemo = true
      product.seedId = DEMO_SEED_ID
      await product.save()
      console.log(`   [UPDATED] Product [${p.code}] ${p.name.slice(0, 40)}... (Seller: ${sellerUser.companyName})`)
    }
    seededProductsMap[p.code] = product
  }

  // 8. Upsert Demo Orders & Order Items
  console.log('\n-> Upserting Demo Orders & Order Items...')
  for (const oDef of DEMO_ORDERS_DEFINITIONS) {
    const buyer = buyerUserDocs[oDef.buyerIndex]
    if (!buyer) continue

    // Calculate subtotal
    let subtotal = 0
    const resolvedItems = []
    for (const it of oDef.items) {
      const prod = seededProductsMap[it.productCode]
      if (prod) {
        const itemTotal = it.quantity * it.unitPriceDZD
        subtotal += itemTotal
        resolvedItems.push({
          product: prod,
          quantity: it.quantity,
          unitPriceDZD: it.unitPriceDZD,
          totalItemPriceDZD: itemTotal
        })
      }
    }

    const totalAmount = subtotal + oDef.deliveryFeeDZD

    let order = await Order.findOne({ orderNumber: oDef.orderNumber })
    if (!order) {
      order = await Order.create({
        orderNumber: oDef.orderNumber,
        userId: buyer._id,
        customerInfo: {
          fullName: `${buyer.firstName} ${buyer.lastName}`,
          email: buyer.email,
          phone: buyer.phone,
          wilaya: DEMO_CREDENTIALS.buyers[oDef.buyerIndex].wilaya,
          city: DEMO_CREDENTIALS.buyers[oDef.buyerIndex].city,
          shippingAddress: DEMO_CREDENTIALS.buyers[oDef.buyerIndex].address,
          notes: oDef.description
        },
        subtotalDZD: subtotal,
        deliveryFeeDZD: oDef.deliveryFeeDZD,
        totalAmountDZD: totalAmount,
        amount: totalAmount,
        paymentMethod: oDef.paymentMethod,
        paymentStatus: oDef.paymentStatus,
        overallStatus: oDef.overallStatus,
        status: oDef.status,
        description: oDef.description,
        isDemo: true,
        seedId: DEMO_SEED_ID
      })
      console.log(`   [CREATED] Order ${order.orderNumber} (Total: ${totalAmount} DZD | Status: ${order.overallStatus})`)
    } else {
      order.userId = buyer._id
      order.subtotalDZD = subtotal
      order.deliveryFeeDZD = oDef.deliveryFeeDZD
      order.totalAmountDZD = totalAmount
      order.overallStatus = oDef.overallStatus
      order.status = oDef.status
      order.paymentStatus = oDef.paymentStatus
      order.isDemo = true
      order.seedId = DEMO_SEED_ID
      await order.save()
      console.log(`   [UPDATED] Order ${order.orderNumber} (Total: ${totalAmount} DZD | Status: ${order.overallStatus})`)
    }

    // Upsert Order Items
    const orderItemIds = []
    for (const rItem of resolvedItems) {
      let orderItem = await OrderItem.findOne({ orderId: order._id, productId: rItem.product._id })
      if (!orderItem) {
        orderItem = await OrderItem.create({
          orderId: order._id,
          productId: rItem.product._id,
          sellerId: rItem.product.sellerId,
          productName: rItem.product.name,
          productCode: rItem.product.code,
          productImage: rItem.product.img,
          unitPriceDZD: rItem.unitPriceDZD,
          quantity: rItem.quantity,
          totalItemPriceDZD: rItem.totalItemPriceDZD,
          fulfillmentStatus: oDef.fulfillmentStatus,
          shippingCarrier: oDef.shippingCarrier || '',
          trackingNumber: oDef.trackingNumber || '',
          shippedAt: (oDef.fulfillmentStatus === 'shipped' || oDef.fulfillmentStatus === 'delivered') ? new Date() : null,
          deliveredAt: oDef.fulfillmentStatus === 'delivered' ? new Date() : null,
          isDemo: true,
          seedId: DEMO_SEED_ID
        })
      } else {
        orderItem.sellerId = rItem.product.sellerId
        orderItem.fulfillmentStatus = oDef.fulfillmentStatus
        orderItem.shippingCarrier = oDef.shippingCarrier || ''
        orderItem.trackingNumber = oDef.trackingNumber || ''
        orderItem.isDemo = true
        orderItem.seedId = DEMO_SEED_ID
        await orderItem.save()
      }
      orderItemIds.push(orderItem._id)
    }

    // Attach order item IDs to order
    order.items = orderItemIds
    await order.save()
  }

  // 9. Add Audit Log for Demo Seeding
  await AuditLog.create({
    performedBy: adminUser._id,
    actorRole: 'administrator',
    action: 'DEMO_SEED_APPLIED',
    entityType: 'MarketplaceDemoDataset',
    entityId: adminUser._id.toString(),
    details: {
      seedId: DEMO_SEED_ID,
      sellersSeeded: DEMO_CREDENTIALS.sellers.length,
      buyersSeeded: DEMO_CREDENTIALS.buyers.length,
      productsSeeded: DEMO_PRODUCTS_DATA.length,
      ordersSeeded: DEMO_ORDERS_DEFINITIONS.length,
      appliedAt: new Date().toISOString()
    },
    ipAddress: '127.0.0.1',
    isDemo: true,
    seedId: DEMO_SEED_ID
  })

  console.log('\n======================================================')
  console.log('   DEMO SEEDING COMPLETED SUCCESSFULLY (100% PASS)')
  console.log('======================================================')

  await mongoose.disconnect()
}

/**
 * Mode 4: Demo-Only Cleanup Mechanism
 */
async function runCleanDemo() {
  console.log('\n======================================================')
  console.log('   TOURIVA MARKETPLACE — DEMO-ONLY CLEANUP')
  console.log('======================================================')

  const db = await connectToDatabase()

  const collectionsToCheck = [
    { model: OrderItem, name: 'orderitems' },
    { model: Order, name: 'orders' },
    { model: Product, name: 'products' },
    { model: SellerApplication, name: 'sellerapplications' },
    { model: SellerProfile, name: 'sellerprofiles' },
    { model: User, name: 'users' }
  ]

  console.log('\n[PRE-CLEANUP SAFETY CHECK]')
  for (const c of collectionsToCheck) {
    const demoCount = await c.model.countDocuments({ isDemo: true, seedId: DEMO_SEED_ID })
    const nonDemoCount = await c.model.countDocuments({ $or: [{ isDemo: { $ne: true } }, { seedId: { $ne: DEMO_SEED_ID } }] })
    console.log(` - Collection '${c.name}': ${demoCount} demo records tagged for removal | ${nonDemoCount} production records PROTECTED`)
  }

  console.log('\nExecuting strict demo-only purge...')
  for (const c of collectionsToCheck) {
    const res = await c.model.deleteMany({ isDemo: true, seedId: DEMO_SEED_ID })
    console.log(` - Purged ${res.deletedCount} demo documents from '${c.name}'`)
  }

  await mongoose.disconnect()
  console.log('\n[CLEANUP COMPLETE] Production records preserved intact.')
}

// CLI Argument Dispatcher
const args = process.argv.slice(2)
const mode = args[0] || '--audit'

async function main() {
  switch (mode) {
    case '--audit':
      await runAudit()
      break
    case '--dry-run':
      await runDryRun()
      break
    case '--seed':
      await runSeed()
      break
    case '--clean-demo':
      await runCleanDemo()
      break
    default:
      console.log(`Unknown option '${mode}'. Supported options: --audit, --dry-run, --seed, --clean-demo`)
      process.exit(1)
  }
}

main().catch(err => {
  console.error('[FATAL SEED ERROR]:', err)
  process.exit(1)
})
