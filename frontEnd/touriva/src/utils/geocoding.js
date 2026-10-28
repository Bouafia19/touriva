import axios from 'axios'

/**
 * Curated database of Algerian wilayas and major tourism destinations
 * Instant zero-network lookup for instant suggestions.
 */
export const ALGERIAN_DESTINATIONS = [
  { name: 'Algiers', nameAr: 'الجزائر العاصمة', wilaya: 'Algiers (16)', lat: 36.7538, lng: 3.0588 },
  { name: 'Oran', nameAr: 'وهران', wilaya: 'Oran (31)', lat: 35.6971, lng: -0.6308 },
  { name: 'Constantine', nameAr: 'قسنطينة', wilaya: 'Constantine (25)', lat: 36.3650, lng: 6.6147 },
  { name: 'Annaba', nameAr: 'عنابة', wilaya: 'Annaba (23)', lat: 36.9000, lng: 7.7667 },
  { name: 'Tlemcen', nameAr: 'تلمسان', wilaya: 'Tlemcen (13)', lat: 34.8783, lng: -1.3150 },
  { name: 'Djanet', nameAr: 'جانت', wilaya: 'Djanet (56)', lat: 24.5533, lng: 9.4853 },
  { name: 'Taghit', nameAr: 'تاغيت', wilaya: 'Béchar (08)', lat: 30.9167, lng: -2.0333 },
  { name: 'Ghardaïa', nameAr: 'غرداية', wilaya: 'Ghardaïa (47)', lat: 32.4833, lng: 3.6667 },
  { name: 'Tipaza', nameAr: 'تيبازة', wilaya: 'Tipaza (42)', lat: 36.5918, lng: 2.4483 },
  { name: 'Timimoun', nameAr: 'تيميمون', wilaya: 'Timimoun (49)', lat: 29.2639, lng: 0.2311 },
  { name: 'Béjaïa', nameAr: 'بجاية', wilaya: 'Béjaïa (06)', lat: 36.7559, lng: 5.0843 },
  { name: 'Sétif', nameAr: 'سطيف', wilaya: 'Sétif (19)', lat: 36.1911, lng: 5.4137 },
  { name: 'Batna', nameAr: 'باتنة', wilaya: 'Batna (05)', lat: 35.5559, lng: 6.1741 },
  { name: 'Biskra', nameAr: 'بسكرة', wilaya: 'Biskra (07)', lat: 34.8500, lng: 5.7333 },
  { name: 'Tamanrasset', nameAr: 'تمنراست', wilaya: 'Tamanrasset (11)', lat: 22.7850, lng: 5.5228 },
  { name: 'Mostaganem', nameAr: 'مستغانم', wilaya: 'Mostaganem (27)', lat: 35.9311, lng: 0.0892 },
  { name: 'Jijel', nameAr: 'جيجل', wilaya: 'Jijel (18)', lat: 36.8206, lng: 5.7667 },
  { name: 'Tizi Ouzou', nameAr: 'تيزي وزو', wilaya: 'Tizi Ouzou (15)', lat: 36.7118, lng: 4.0459 },
  { name: 'Blida', nameAr: 'البليدة', wilaya: 'Blida (09)', lat: 36.4700, lng: 2.8300 },
  { name: 'El Oued', nameAr: 'الوادي', wilaya: 'El Oued (39)', lat: 33.3683, lng: 6.8674 },
  { name: 'Béni Abbès', nameAr: 'بني عباس', wilaya: 'Béni Abbès (52)', lat: 30.1333, lng: -2.1667 },
  { name: 'Skikda', nameAr: 'سكيكدة', wilaya: 'Skikda (21)', lat: 36.8792, lng: 6.9075 },
  { name: 'Médéa', nameAr: 'المدية', wilaya: 'Médéa (26)', lat: 36.2642, lng: 2.7539 },
  { name: 'Ouargla', nameAr: 'ورقلة', wilaya: 'Ouargla (30)', lat: 31.9493, lng: 5.3250 },
  { name: 'Tindouf', nameAr: 'تندوف', wilaya: 'Tindouf (37)', lat: 27.6711, lng: -8.1478 },
  { name: 'Touggourt', nameAr: 'تقرت', wilaya: 'Touggourt (55)', lat: 33.1072, lng: 6.0594 }
]

// Simple in-memory cache to prevent repeated requests
const geocodingCache = new Map()

/**
 * Normalizes text for accent-insensitive and case-insensitive matching
 */
function normalize(str = '') {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/**
 * Searches destinations with instant local match + debounced OSM Nominatim query
 * @param {string} query
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array<{ name: string, displayName: string, lat: number, lng: number }>>}
 */
export async function searchDestinations(query, signal) {
  if (!query || query.trim().length < 2) {
    return []
  }

  const cleanQuery = query.trim()
  const norm = normalize(cleanQuery)

  // 1. Check local cache
  if (geocodingCache.has(norm)) {
    return geocodingCache.get(norm)
  }

  // 2. Filter local curated list
  const localMatches = ALGERIAN_DESTINATIONS.filter(item => {
    return (
      normalize(item.name).includes(norm) ||
      normalize(item.wilaya).includes(norm) ||
      item.nameAr.includes(cleanQuery)
    )
  }).map(item => ({
    name: item.name,
    displayName: `${item.name} (${item.nameAr}) - ${item.wilaya}`,
    lat: item.lat,
    lng: item.lng,
    source: 'local'
  }))

  // If we found exact or good local matches and query is short, return local immediately
  if (localMatches.length >= 3 || cleanQuery.length < 3) {
    geocodingCache.set(norm, localMatches)
    return localMatches
  }

  // 3. Query OpenStreetMap Nominatim for Algeria
  try {
    const url = 'https://nominatim.openstreetmap.org/search'
    const res = await axios.get(url, {
      signal,
      params: {
        q: cleanQuery,
        format: 'json',
        countrycodes: 'dz',
        addressdetails: 1,
        limit: 6
      },
      headers: {
        'Accept': 'application/json'
      }
    })

    const osmResults = (res.data || []).map(p => ({
      name: p.name || p.display_name.split(',')[0],
      displayName: p.display_name,
      lat: parseFloat(p.lat),
      lng: parseFloat(p.lon),
      source: 'osm'
    }))

    // Combine local matches + OSM results, deduplicating by approximate coordinates
    const combined = [...localMatches]
    for (const osmItem of osmResults) {
      const exists = combined.some(
        c => Math.abs(c.lat - osmItem.lat) < 0.05 && Math.abs(c.lng - osmItem.lng) < 0.05
      )
      if (!exists) {
        combined.push(osmItem)
      }
    }

    const finalResults = combined.slice(0, 8)
    geocodingCache.set(norm, finalResults)
    return finalResults
  } catch (err) {
    // Return local matches if network or Nominatim request fails or is aborted
    if (axios.isCancel(err) || err.name === 'CanceledError' || err.name === 'AbortError') {
      return localMatches
    }
    console.warn('Nominatim geocoding fallback to local:', err.message)
    return localMatches
  }
}

/**
 * Creates a debounced version of a function
 */
export function debounce(fn, delay = 350) {
  let timer = null
  return function (...args) {
    return new Promise((resolve) => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        resolve(fn.apply(this, args))
      }, delay)
    })
  }
}
