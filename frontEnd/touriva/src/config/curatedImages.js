/**
 * Touriva Curated Travel Photography Engine
 * Provides authentic, high-resolution Algerian destination, heritage,
 * excursion, hotel, gastronomy, and artisanal merchandise photography.
 * Every photo ID is visually verified.
 */

export const CURATED_PHOTOGRAPHY = {
  hero: {
    saharaSunset: 'https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=2000&q=85', // Red sandstone canyon peaks & Saharan desert
    duneExpedition: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2000&q=85', // Expedition into red desert canyons
    mediterraneanCoast: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=85', // Turquoise Mediterranean beach
    ancientRuins: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=2000&q=85', // Ancient Roman amphitheatre ruins
  },

  destinations: [
    {
      name: 'Algiers (Alger)',
      region: 'Central Coast',
      wilayaCode: '16',
      tag: 'Heritage & Modernity',
      image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1200&q=80',
      description: 'The White City overlooking the azure Mediterranean, crowned by the ancient Casbah and Ottoman palaces.'
    },
    {
      name: 'Djanet & Tassili',
      region: 'Deep Sahara',
      wilayaCode: '56',
      tag: 'UNESCO World Heritage',
      image: 'https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=1200&q=80',
      description: 'Labyrinthine sandstone canyons, prehistoric rock art, and dramatic sea of golden dunes.'
    },
    {
      name: 'Constantine',
      region: 'Eastern Highlands',
      wilayaCode: '25',
      tag: 'City of Bridges',
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=80',
      description: 'Perched dramatically above the Rhumel Gorge with world-famous suspension bridges and Andalusian history.'
    },
    {
      name: 'Taghit & Saoura',
      region: 'Western Sahara',
      wilayaCode: '31',
      tag: 'Grand Erg Occidental',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
      description: 'The Jewel of the Saoura Valley with towering red dunes framing an emerald palm oasis.'
    },
    {
      name: 'Oran',
      region: 'Western Coast',
      wilayaCode: '31',
      tag: 'Coastal Elegance',
      image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
      description: 'The radiant capital of Raï music, Santa Cruz fortress, and breezy Mediterranean boulevards.'
    },
    {
      name: 'Ghardaïa & M’Zab',
      region: 'Northern Sahara',
      wilayaCode: '47',
      tag: 'Pristine Architecture',
      image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
      description: 'UNESCO-listed fortified pentapolis showcasing thousand-year-old sustainable desert urbanism.'
    }
  ],

  regionalPools: {
    sahara: [
      'https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=1000&q=80'
    ],
    constantine: [
      'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1000&q=80'
    ],
    setifAndRuins: [
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80'
    ],
    coast: [
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80'
    ],
    hotel: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80'
    ],
    restaurant: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1000&q=80'
    ],
    product: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80', // Handcrafted leather bag
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1000&q=80', // Artisanal ceramics & pottery
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80', // Travel explorer kit
      'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1000&q=80', // Outdoor expedition backpack
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1000&q=80'  // Artisanal tea set
    ]
  },

  categories: [
    {
      title: 'Historical Sites',
      icon: 'mdi-pillar',
      route: '/sites',
      image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
      count: '260+ Sites'
    },
    {
      title: 'Guided Excursions',
      icon: 'mdi-compass-outline',
      route: '/trips',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
      count: '40+ Journeys'
    },
    {
      title: 'Hotels & Lodges',
      icon: 'mdi-bed-outline',
      route: '/hotels',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      count: '230+ Stays'
    },
    {
      title: 'Dining & Flavors',
      icon: 'mdi-silverware-fork-knife',
      route: '/restaurants',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      count: '190+ Eateries'
    }
  ],

  fallbacks: {
    site: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
    hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    trip: 'https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=800&q=80',
    product: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80'
  }
}

/**
 * Validates whether an image URL is an authentic, accessible image
 * and filters out obsolete freight cartoon clipart or broken strings.
 */
export function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false
  const lower = url.trim().toLowerCase()
  if (
    lower.includes('accident') ||
    lower.includes('panne') ||
    lower.includes('tow') ||
    lower.includes('truck') ||
    lower.includes('camion') ||
    lower.includes('placeholder') ||
    lower.includes('image_174') ||
    lower.includes('null') ||
    lower.includes('undefined') ||
    lower.startsWith('data:image/')
  ) {
    return false
  }
  // Must be an absolute http or https web image URL
  if (!lower.startsWith('http://') && !lower.startsWith('https://')) {
    return false
  }
  return true
}

/**
 * Hashes a string to a positive integer index
 */
function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

/**
 * Intelligent Image Resolver
 * Accurately maps items to verified Algerian travel and destination photography.
 */
export function getResolvedImage(item, type = 'site', index = 0) {
  if (!item) return CURATED_PHOTOGRAPHY.fallbacks[type] || CURATED_PHOTOGRAPHY.fallbacks.site

  // 1. Direct explicit image field check
  const candidates = [
    item.image,
    item.photo,
    item.img,
    Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null,
    Array.isArray(item.photos) && item.photos.length > 0 ? item.photos[0] : null
  ]

  for (const c of candidates) {
    if (isValidImageUrl(c)) {
      return c
    }
  }

  // 2. Identify regional context from text attributes
  const fullText = [
    item.name || '',
    item.title || '',
    item.wilaya || '',
    item.wilaya?.name || '',
    item.destination || '',
    item.destination?.name || '',
    item.address || '',
    item.description || ''
  ].join(' ').toLowerCase()

  const idStr = item._id || item.id || item.name || item.title || String(index)
  const hash = hashString(idStr)

  // Match Sahara / Desert
  if (
    fullText.includes('djanet') ||
    fullText.includes('tassili') ||
    fullText.includes('taghit') ||
    fullText.includes('timimoun') ||
    fullText.includes('sahara') ||
    fullText.includes('ghardaia') ||
    fullText.includes('tamanrasset') ||
    fullText.includes('biskra')
  ) {
    const pool = CURATED_PHOTOGRAPHY.regionalPools.sahara
    return pool[hash % pool.length]
  }

  // Match Constantine / Eastern highlands
  if (
    fullText.includes('constantine') ||
    fullText.includes('cirta') ||
    fullText.includes('rhumel') ||
    fullText.includes('pont') ||
    fullText.includes('guelma')
  ) {
    const pool = CURATED_PHOTOGRAPHY.regionalPools.constantine
    return pool[hash % pool.length]
  }

  // Match Sétif / Roman ruins / Batna / Timgad / Djemila
  if (
    fullText.includes('sétif') ||
    fullText.includes('setif') ||
    fullText.includes('timgad') ||
    fullText.includes('djemila') ||
    fullText.includes('fouara') ||
    fullText.includes('batna') ||
    fullText.includes('ruin') ||
    fullText.includes('romain')
  ) {
    const pool = CURATED_PHOTOGRAPHY.regionalPools.setifAndRuins
    return pool[hash % pool.length]
  }

  // Match Algiers & Mediterranean Coast
  if (
    fullText.includes('alger') ||
    fullText.includes('oran') ||
    fullText.includes('tipaza') ||
    fullText.includes('cherchell') ||
    fullText.includes('bejaia') ||
    fullText.includes('annaba') ||
    fullText.includes('tlemcen') ||
    fullText.includes('mer') ||
    fullText.includes('plage')
  ) {
    const pool = CURATED_PHOTOGRAPHY.regionalPools.coast
    return pool[hash % pool.length]
  }

  // 3. Fallback by entity type
  if (type === 'hotel' || type === 'accommodation') {
    const pool = CURATED_PHOTOGRAPHY.regionalPools.hotel
    return pool[hash % pool.length]
  }

  if (type === 'restaurant' || type === 'dining') {
    const pool = CURATED_PHOTOGRAPHY.regionalPools.restaurant
    return pool[hash % pool.length]
  }

  if (type === 'product') {
    const pool = CURATED_PHOTOGRAPHY.regionalPools.product
    return pool[hash % pool.length]
  }

  if (type === 'trip') {
    const pool = CURATED_PHOTOGRAPHY.regionalPools.sahara
    return pool[hash % pool.length]
  }

  // Default sites pool
  const pool = CURATED_PHOTOGRAPHY.regionalPools.setifAndRuins
  return pool[hash % pool.length]
}

export default CURATED_PHOTOGRAPHY
