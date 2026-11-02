const Wilaya = require('../../models/Wilaya')

/**
 * Normalizes and validates raw AI or manual itinerary data into a strict Touriva Trip document.
 * Guarantees schema conformity with backend/models/Trip.js.
 */
async function normalizeTripData(raw, inputs = {}) {
  const {
    city = 'Algiers',
    days: requestedDays = 3,
    budget = 'medium',
    theme = 'Circuit & Découverte',
    creator = null,
    preferences = []
  } = inputs

  // 1. Duration & Days array calculation
  let duration = parseInt(raw?.durationDays || inputs.days || (raw?.days && raw.days.length) || 3, 10)
  if (isNaN(duration) || duration < 1) duration = 3
  if (duration > 30) duration = 30 // Sensible upper bound for single trip itinerary

  const daysArray = Array.from({ length: duration }, (_, i) => i + 1)

  // 2. Title & Description
  const defaultCityName = typeof city === 'string' && city.trim() ? city.trim() : 'Algeria'
  const tripName = (raw?.name && typeof raw.name === 'string' && raw.name.trim().length >= 3)
    ? raw.name.trim()
    : `${duration}-Day Journey Through ${defaultCityName}`

  const tripDescription = (raw?.description && typeof raw.description === 'string' && raw.description.trim().length >= 10)
    ? raw.description.trim()
    : `An authentic, curated ${duration}-day journey across ${defaultCityName}, exploring iconic heritage landmarks, traditional gastronomy, and local culture.`

  // 3. Destination Resolution (Wilaya ObjectId)
  let destinationId = null
  if (raw?.destination && typeof raw.destination === 'string' && raw.destination.match(/^[0-9a-fA-F]{24}$/)) {
    destinationId = raw.destination
  } else if (inputs.destinationId && inputs.destinationId.match(/^[0-9a-fA-F]{24}$/)) {
    destinationId = inputs.destinationId
  } else {
    try {
      // Query Wilaya by city name
      const searchStr = (defaultCityName || '').replace(/wilaya|province|city/gi, '').trim()
      if (searchStr.length >= 2) {
        // Handle common variations (e.g. Algiers -> Alger, Tipaza -> Tipasa, etc.)
        const regexStr = searchStr.replace(/algiers/i, 'Alger').replace(/alger/i, 'Alger')
        const matchedWilaya = await Wilaya.findOne({
          $or: [
            { name: { $regex: new RegExp(regexStr, 'i') } },
            { nameFr: { $regex: new RegExp(regexStr, 'i') } },
            { nameAr: { $regex: new RegExp(regexStr, 'i') } }
          ]
        }).select('_id')

        if (matchedWilaya) {
          destinationId = matchedWilaya._id
        }
      }
    } catch (err) {
      console.warn('Destination wilaya resolution warning:', err.message)
    }
  }

  // 4. Default Coordinates for fallback
  let baseLat = 36.7525
  let baseLng = 3.042
  if (defaultCityName.toLowerCase().includes('oran')) {
    baseLat = 35.69765; baseLng = -0.63374
  } else if (defaultCityName.toLowerCase().includes('constantine')) {
    baseLat = 36.365; baseLng = 6.6147
  } else if (defaultCityName.toLowerCase().includes('tlemcen')) {
    baseLat = 34.8783; baseLng = -1.315
  } else if (defaultCityName.toLowerCase().includes('ghardaia') || defaultCityName.toLowerCase().includes('ghardaïa')) {
    baseLat = 32.4909; baseLng = 3.6735
  } else if (defaultCityName.toLowerCase().includes('djanet')) {
    baseLat = 24.5539; baseLng = 9.4858
  }

  // 5. Normalization of Daily Itinerary Items
  // Enforces DaySchema: { day: Number, items: [ItemSchema] }
  // and ItemSchema: { title, time, description, lat, lng, image }
  const rawItems = Array.isArray(raw?.items) ? raw.items : []
  const normalizedItems = []

  const timeSlots = ['09:00', '12:30', '15:30', '19:00', '21:00']

  for (let d = 1; d <= duration; d++) {
    // Find matching day record in AI output (1-indexed or 0-indexed)
    const dayRecord = rawItems.find(r => r && (r.day === d || r.day === String(d))) || rawItems[d - 1]
    const dayStops = []

    const candidateStops = Array.isArray(dayRecord?.items)
      ? dayRecord.items
      : Array.isArray(dayRecord?.stops)
        ? dayRecord.stops
        : []

    if (candidateStops.length > 0) {
      candidateStops.forEach((stop, sIdx) => {
        if (!stop || typeof stop !== 'object') return
        const stopTitle = (stop.title || stop.name || stop.activity || `Heritage Stop ${sIdx + 1}`).trim()
        const stopTime = (stop.time && typeof stop.time === 'string' && stop.time.trim())
          ? stop.time.trim()
          : (timeSlots[sIdx % timeSlots.length] || '10:00')
        const stopDesc = (stop.description && typeof stop.description === 'string' && stop.description.trim())
          ? stop.description.trim()
          : `Guided cultural and scenic exploration at ${stopTitle}.`
        const stopLat = !isNaN(parseFloat(stop.lat)) && parseFloat(stop.lat) !== 0
          ? parseFloat(stop.lat)
          : parseFloat((baseLat + (sIdx * 0.005)).toFixed(6))
        const stopLng = !isNaN(parseFloat(stop.lng)) && parseFloat(stop.lng) !== 0
          ? parseFloat(stop.lng)
          : parseFloat((baseLng + (sIdx * 0.005)).toFixed(6))
        const stopImage = stop.image && typeof stop.image === 'string' && stop.image.trim()
          ? stop.image.trim()
          : '/casbah.jpeg'

        dayStops.push({
          title: stopTitle,
          time: stopTime,
          description: stopDesc,
          lat: stopLat,
          lng: stopLng,
          image: stopImage
        })
      })
    }

    // Ensure day has at least 2 stops
    if (dayStops.length === 0) {
      dayStops.push({
        title: `Morning Heritage Discovery - ${defaultCityName}`,
        time: '09:30',
        description: `Explore central monuments and cultural landmarks of ${defaultCityName}.`,
        lat: baseLat,
        lng: baseLng,
        image: '/casbah.jpeg'
      })
      dayStops.push({
        title: `Afternoon Cultural Walk & Local Gastronomy`,
        time: '14:30',
        description: `Traditional regional hospitality, artisanal markets, and local flavors.`,
        lat: parseFloat((baseLat + 0.008).toFixed(6)),
        lng: parseFloat((baseLng + 0.008).toFixed(6)),
        image: '/monumentMartyrs.jpg'
      })
    }

    normalizedItems.push({
      day: d,
      items: dayStops
    })
  }

  // 6. Pricing Normalization
  let priceStr = '18 000 DZD'
  if (raw?.price) {
    if (typeof raw.price === 'number') {
      priceStr = `${Math.round(raw.price).toLocaleString('fr-DZ')} DZD`
    } else if (typeof raw.price === 'string') {
      priceStr = raw.price.includes('DZD') || raw.price.includes('DA')
        ? raw.price.trim()
        : `${raw.price.trim()} DZD`
    }
  } else {
    // Sensible estimate based on duration and budget
    const baseDailyRate = budget === 'high' ? 25000 : budget === 'low' ? 9000 : 15000
    priceStr = `${(duration * baseDailyRate).toLocaleString('fr-DZ')} DZD`
  }

  // 7. Inclusions & Exclusions
  const defaultInclusions = [
    'Certified English & French Speaking Guide',
    'Private Ground Transportation with Driver',
    'Historical Monument & Landmark Entry Passes',
    'Curated Regional Culinary Experiences'
  ]
  const defaultExclusions = [
    'Personal Souvenirs & Discretionary Expenses',
    'International & Domestic Flights',
    'Optional High-Adventure Excursions',
    'Comprehensive Travel Insurance'
  ]

  const inclusions = Array.isArray(raw?.inclusions) && raw.inclusions.length > 0
    ? raw.inclusions.map(i => String(i).trim()).filter(Boolean)
    : defaultInclusions

  const exclusions = Array.isArray(raw?.exclusions) && raw.exclusions.length > 0
    ? raw.exclusions.map(e => String(e).trim()).filter(Boolean)
    : defaultExclusions

  // 8. Cover and Gallery Images
  const coverImage = (raw?.image && typeof raw.image === 'string' && raw.image.trim())
    ? raw.image.trim()
    : '/casbah.jpeg'

  const photos = Array.isArray(raw?.photos) && raw.photos.length > 0
    ? raw.photos.filter(p => typeof p === 'string' && p.trim())
    : ['/casbah.jpeg', '/monumentMartyrs.jpg', '/grandMosquee.webp', '/fortTamentfoust.webp']

  return {
    name: tripName,
    description: tripDescription,
    creator: creator,
    destination: destinationId,
    image: coverImage,
    photos: photos,
    price: priceStr,
    rating: typeof raw?.rating === 'number' && raw.rating >= 1 && raw.rating <= 5 ? raw.rating : 4.8,
    durationDays: duration,
    theme: raw?.theme || theme || 'Circuit & Découverte',
    inclusions: inclusions,
    exclusions: exclusions,
    cancellationPolicy: raw?.cancellationPolicy || 'Annulation gratuite jusqu’à 48 heures avant le départ.',
    meetingPoint: raw?.meetingPoint || `Centre-ville de ${defaultCityName}`,
    days: daysArray,
    items: normalizedItems,
    status: 'created',
    published: false
  }
}

module.exports = {
  normalizeTripData
}
