import axios from 'axios'

/**
 * Curated database of Algerian wilayas (all 58 wilayas) and major tourism destinations.
 * Provides instant zero-network lookup for instant suggestions in English, French, and Arabic.
 */
export const ALGERIAN_DESTINATIONS = [
  // 58 Algerian Wilayas
  { code: 1, name: 'Adrar', nameFr: 'Adrar', nameAr: 'أدرار', wilaya: 'Adrar (01)', lat: 27.8743, lng: -0.2930 },
  { code: 2, name: 'Chlef', nameFr: 'Chlef', nameAr: 'الشلف', wilaya: 'Chlef (02)', lat: 36.1739, lng: 1.3366 },
  { code: 3, name: 'Laghouat', nameFr: 'Laghouat', nameAr: 'الأغواط', wilaya: 'Laghouat (03)', lat: 33.8000, lng: 2.8667 },
  { code: 4, name: 'Oum El Bouaghi', nameFr: 'Oum El Bouaghi', nameAr: 'أم البواقي', wilaya: 'Oum El Bouaghi (04)', lat: 35.8750, lng: 7.1167 },
  { code: 5, name: 'Batna', nameFr: 'Batna', nameAr: 'باتنة', wilaya: 'Batna (05)', lat: 35.5550, lng: 6.1667 },
  { code: 6, name: 'Béjaïa', nameFr: 'Béjaïa', nameAr: 'بجاية', wilaya: 'Béjaïa (06)', lat: 36.7500, lng: 5.0597 },
  { code: 7, name: 'Biskra', nameFr: 'Biskra', nameAr: 'بسكرة', wilaya: 'Biskra (07)', lat: 34.8500, lng: 5.7333 },
  { code: 8, name: 'Béchar', nameFr: 'Béchar', nameAr: 'بشار', wilaya: 'Béchar (08)', lat: 31.6167, lng: -2.2167 },
  { code: 9, name: 'Blida', nameFr: 'Blida', nameAr: 'البليدة', wilaya: 'Blida (09)', lat: 36.4667, lng: 2.8333 },
  { code: 10, name: 'Bouira', nameFr: 'Bouira', nameAr: 'البويرة', wilaya: 'Bouira (10)', lat: 36.3833, lng: 3.9000 },
  { code: 11, name: 'Tamanrasset', nameFr: 'Tamanrasset', nameAr: 'تمنراست', wilaya: 'Tamanrasset (11)', lat: 22.7850, lng: 5.5228 },
  { code: 12, name: 'Tébessa', nameFr: 'Tébessa', nameAr: 'تبسة', wilaya: 'Tébessa (12)', lat: 35.4167, lng: 8.1167 },
  { code: 13, name: 'Tlemcen', nameFr: 'Tlemcen', nameAr: 'تلمسان', wilaya: 'Tlemcen (13)', lat: 34.8833, lng: -1.3167 },
  { code: 14, name: 'Tiaret', nameFr: 'Tiaret', nameAr: 'تيارت', wilaya: 'Tiaret (14)', lat: 35.3667, lng: 1.3167 },
  { code: 15, name: 'Tizi Ouzou', nameFr: 'Tizi Ouzou', nameAr: 'تيزي وزو', wilaya: 'Tizi Ouzou (15)', lat: 36.7167, lng: 4.0500 },
  { code: 16, name: 'Algiers', nameFr: 'Alger', nameAr: 'الجزائر العاصمة', wilaya: 'Algiers (16)', lat: 36.7538, lng: 3.0588 },
  { code: 17, name: 'Djelfa', nameFr: 'Djelfa', nameAr: 'الجلفة', wilaya: 'Djelfa (17)', lat: 34.6667, lng: 3.2500 },
  { code: 18, name: 'Jijel', nameFr: 'Jijel', nameAr: 'جيجل', wilaya: 'Jijel (18)', lat: 36.8167, lng: 5.7667 },
  { code: 19, name: 'Sétif', nameFr: 'Sétif', nameAr: 'سطيف', wilaya: 'Sétif (19)', lat: 36.1900, lng: 5.4100 },
  { code: 20, name: 'Saïda', nameFr: 'Saïda', nameAr: 'سعيدة', wilaya: 'Saïda (20)', lat: 34.8333, lng: 0.1500 },
  { code: 21, name: 'Skikda', nameFr: 'Skikda', nameAr: 'سكيكدة', wilaya: 'Skikda (21)', lat: 36.8667, lng: 6.9167 },
  { code: 22, name: 'Sidi Bel Abbès', nameFr: 'Sidi Bel Abbès', nameAr: 'سيدي بلعباس', wilaya: 'Sidi Bel Abbès (22)', lat: 35.2000, lng: -0.6333 },
  { code: 23, name: 'Annaba', nameFr: 'Annaba', nameAr: 'عنابة', wilaya: 'Annaba (23)', lat: 36.9000, lng: 7.7667 },
  { code: 24, name: 'Guelma', nameFr: 'Guelma', nameAr: 'قالمة', wilaya: 'Guelma (24)', lat: 36.4500, lng: 7.4333 },
  { code: 25, name: 'Constantine', nameFr: 'Constantine', nameAr: 'قسنطينة', wilaya: 'Constantine (25)', lat: 36.3500, lng: 6.6000 },
  { code: 26, name: 'Médéa', nameFr: 'Médéa', nameAr: 'المدية', wilaya: 'Médéa (26)', lat: 36.2667, lng: 2.7500 },
  { code: 27, name: 'Mostaganem', nameFr: 'Mostaganem', nameAr: 'مستغانم', wilaya: 'Mostaganem (27)', lat: 35.9333, lng: 0.1000 },
  { code: 28, name: "M'Sila", nameFr: "M'Sila", nameAr: 'المسيلة', wilaya: "M'Sila (28)", lat: 35.7078, lng: 4.5419 },
  { code: 29, name: 'Mascara', nameFr: 'Mascara', nameAr: 'معسكر', wilaya: 'Mascara (29)', lat: 35.4000, lng: 0.1500 },
  { code: 30, name: 'Ouargla', nameFr: 'Ouargla', nameAr: 'ورقلة', wilaya: 'Ouargla (30)', lat: 31.9500, lng: 5.3167 },
  { code: 31, name: 'Oran', nameFr: 'Oran', nameAr: 'وهران', wilaya: 'Oran (31)', lat: 35.6997, lng: -0.6308 },
  { code: 32, name: 'El Bayadh', nameFr: 'El Bayadh', nameAr: 'البيض', wilaya: 'El Bayadh (32)', lat: 33.6833, lng: 1.0167 },
  { code: 33, name: 'Illizi', nameFr: 'Illizi', nameAr: 'إليزي', wilaya: 'Illizi (33)', lat: 26.4833, lng: 8.4667 },
  { code: 34, name: 'Bordj Bou Arréridj', nameFr: 'Bordj Bou Arréridj', nameAr: 'برج بوعريريج', wilaya: 'Bordj Bou Arréridj (34)', lat: 36.0667, lng: 4.6667 },
  { code: 35, name: 'Boumerdès', nameFr: 'Boumerdès', nameAr: 'بومرداس', wilaya: 'Boumerdès (35)', lat: 36.7500, lng: 3.4833 },
  { code: 36, name: 'El Tarf', nameFr: 'El Tarf', nameAr: 'الطارف', wilaya: 'El Tarf (36)', lat: 36.7667, lng: 8.3167 },
  { code: 37, name: 'Tindouf', nameFr: 'Tindouf', nameAr: 'تندوف', wilaya: 'Tindouf (37)', lat: 27.7000, lng: -8.1300 },
  { code: 38, name: 'Tissemsilt', nameFr: 'Tissemsilt', nameAr: 'تيسمسيلت', wilaya: 'Tissemsilt (38)', lat: 35.6000, lng: 1.8167 },
  { code: 39, name: 'El Oued', nameFr: 'El Oued', nameAr: 'الوادي', wilaya: 'El Oued (39)', lat: 33.3667, lng: 6.8667 },
  { code: 40, name: 'Khenchela', nameFr: 'Khenchela', nameAr: 'خنشلة', wilaya: 'Khenchela (40)', lat: 35.4167, lng: 7.1333 },
  { code: 41, name: 'Souk Ahras', nameFr: 'Souk Ahras', nameAr: 'سوق أهراس', wilaya: 'Souk Ahras (41)', lat: 36.2667, lng: 7.9500 },
  { code: 42, name: 'Tipaza', nameFr: 'Tipaza', nameAr: 'تيبازة', wilaya: 'Tipaza (42)', lat: 36.5833, lng: 2.4500 },
  { code: 43, name: 'Mila', nameFr: 'Mila', nameAr: 'ميلة', wilaya: 'Mila (43)', lat: 36.4500, lng: 6.2667 },
  { code: 44, name: 'Aïn Defla', nameFr: 'Aïn Defla', nameAr: 'عين الدفلى', wilaya: 'Aïn Defla (44)', lat: 36.2500, lng: 1.9667 },
  { code: 45, name: 'Naâma', nameFr: 'Naâma', nameAr: 'النعامة', wilaya: 'Naâma (45)', lat: 33.2667, lng: -0.2167 },
  { code: 46, name: 'Aïn Témouchent', nameFr: 'Aïn Témouchent', nameAr: 'عين تموشنت', wilaya: 'Aïn Témouchent (46)', lat: 35.2994, lng: -1.1447 },
  { code: 47, name: 'Ghardaïa', nameFr: 'Ghardaïa', nameAr: 'غرداية', wilaya: 'Ghardaïa (47)', lat: 32.4892, lng: 3.6700 },
  { code: 48, name: 'Relizane', nameFr: 'Relizane', nameAr: 'غليزان', wilaya: 'Relizane (48)', lat: 35.7374, lng: 0.5550 },
  { code: 49, name: 'Timimoun', nameFr: 'Timimoun', nameAr: 'تيميمون', wilaya: 'Timimoun (49)', lat: 29.2639, lng: 0.2311 },
  { code: 50, name: 'Bordj Badji Mokhtar', nameFr: 'Bordj Badji Mokhtar', nameAr: 'برج باجي مختار', wilaya: 'Bordj Badji Mokhtar (50)', lat: 21.3283, lng: 0.9547 },
  { code: 51, name: 'Ouled Djellal', nameFr: 'Ouled Djellal', nameAr: 'أولاد جلال', wilaya: 'Ouled Djellal (51)', lat: 34.4258, lng: 5.0667 },
  { code: 52, name: 'Béni Abbès', nameFr: 'Béni Abbès', nameAr: 'بني عباس', wilaya: 'Béni Abbès (52)', lat: 30.1333, lng: -2.1667 },
  { code: 53, name: 'In Salah', nameFr: 'In Salah', nameAr: 'عين صالح', wilaya: 'In Salah (53)', lat: 27.1935, lng: 2.4607 },
  { code: 54, name: 'In Guezzam', nameFr: 'In Guezzam', nameAr: 'عين قزام', wilaya: 'In Guezzam (54)', lat: 19.5714, lng: 5.7697 },
  { code: 55, name: 'Touggourt', nameFr: 'Touggourt', nameAr: 'تقرت', wilaya: 'Touggourt (55)', lat: 33.1072, lng: 6.0594 },
  { code: 56, name: 'Djanet', nameFr: 'Djanet', nameAr: 'جانت', wilaya: 'Djanet (56)', lat: 24.5533, lng: 9.4853 },
  { code: 57, name: "El M'Ghair", nameFr: "El M'Ghair", nameAr: 'المغير', wilaya: "El M'Ghair (57)", lat: 33.9500, lng: 5.9167 },
  { code: 58, name: 'El Meniaa', nameFr: 'El Meniaa', nameAr: 'المنيعة', wilaya: 'El Meniaa (58)', lat: 30.5833, lng: 2.8833 },

  // Key Tourism Oasis & Historic Hubs
  { name: 'Taghit', nameFr: 'Taghit', nameAr: 'تاغيت', wilaya: 'Béchar (08)', lat: 30.9167, lng: -2.0333 },
  { name: 'Djemila', nameFr: 'Djemila', nameAr: 'جميلة', wilaya: 'Sétif (19)', lat: 36.3194, lng: 5.7361 },
  { name: 'Timgad', nameFr: 'Timgad', nameAr: 'تيمقاد', wilaya: 'Batna (05)', lat: 35.4844, lng: 6.4678 },
  { name: 'Casbah of Algiers', nameFr: 'Casbah d\'Alger', nameAr: 'قصبة الجزائر', wilaya: 'Algiers (16)', lat: 36.7850, lng: 3.0600 },
  { name: 'Tassili n\'Ajjer', nameFr: 'Tassili n\'Ajjer', nameAr: 'طاسيلي ناجر', wilaya: 'Djanet (56)', lat: 25.8000, lng: 9.2000 }
]

/**
 * Normalizes text for accent-insensitive, case-insensitive, and trimmed matching
 */
export function normalizeText(str = '') {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/**
 * Synchronous, zero-network destination filter.
 * Used while user types into search inputs or comboboxes.
 * This guarantees 100% compliance with Nominatim Acceptable Use Policy (no search-as-you-type).
 *
 * @param {string} query
 * @param {number} [limit=8]
 * @returns {Array<{ name: string, displayName: string, lat: number, lng: number, source: string }>}
 */
export function filterLocalDestinations(query, limit = 8) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    // Return top popular destinations
    return ALGERIAN_DESTINATIONS.slice(0, limit).map(item => ({
      name: item.name,
      displayName: `${item.name} (${item.nameAr}) - ${item.wilaya}`,
      lat: item.lat,
      lng: item.lng,
      source: 'local'
    }))
  }

  const clean = query.trim()
  const norm = normalizeText(clean)

  const matches = ALGERIAN_DESTINATIONS.filter(item => {
    return (
      normalizeText(item.name).includes(norm) ||
      normalizeText(item.nameFr || '').includes(norm) ||
      normalizeText(item.wilaya).includes(norm) ||
      (item.nameAr && item.nameAr.includes(clean))
    )
  })

  return matches.slice(0, limit).map(item => ({
    name: item.name,
    displayName: `${item.name} (${item.nameAr}) - ${item.wilaya}`,
    lat: item.lat,
    lng: item.lng,
    source: 'local'
  }))
}

// Global in-memory cache for external Nominatim results
const externalGeocodeCache = new Map()

// Global throttle state enforcing the OSM Foundation limit of maximum 1 request per second
let lastExternalRequestTime = 0
const MIN_REQUEST_INTERVAL_MS = 1000

/**
 * Sanitizes input query string before sending to external services.
 * Strips personal data, special injection characters, and caps query length.
 *
 * @param {string} raw
 * @returns {string}
 */
export function sanitizeSearchQuery(raw = '') {
  if (typeof raw !== 'string') return ''
  // Strip email addresses (PII), control characters, and injection symbols
  return raw
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, ' ')
    .replace(/[<>%$#&*{}()\[\]\\\/+=~`"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)
}

/**
 * Issues an explicit, user-triggered geocoding request to OpenStreetMap Nominatim.
 * Strictly compliant with Nominatim Acceptable Use Policy:
 * 1. Called ONLY upon explicit user submission (click search button or press Enter).
 * 2. Shared global throttle ensures >= 1000ms interval between calls.
 * 3. In-memory cache returns duplicate queries instantly without network requests.
 * 4. Transparent User-Agent and referrer identification.
 * 5. Clear OpenStreetMap attribution attached to results.
 *
 * @param {string} rawQuery
 * @param {object} [options]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<Array<{ name: string, displayName: string, lat: number, lng: number, source: string, attribution: string }>>}
 */
export async function searchNominatimExternal(rawQuery, options = {}) {
  const cleanQuery = sanitizeSearchQuery(rawQuery)
  if (!cleanQuery || cleanQuery.length < 2) {
    return []
  }

  const cacheKey = normalizeText(cleanQuery)
  if (externalGeocodeCache.has(cacheKey)) {
    return externalGeocodeCache.get(cacheKey)
  }

  // Enforce shared global throttle (maximum 1 request per second across the application)
  const now = Date.now()
  const timeSinceLast = now - lastExternalRequestTime
  if (timeSinceLast < MIN_REQUEST_INTERVAL_MS) {
    const delayNeeded = MIN_REQUEST_INTERVAL_MS - timeSinceLast
    await new Promise(resolve => setTimeout(resolve, delayNeeded))
  }
  lastExternalRequestTime = Date.now()

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      signal: options.signal,
      timeout: 6000,
      params: {
        q: cleanQuery,
        format: 'json',
        countrycodes: 'dz',
        addressdetails: 1,
        limit: 6
      },
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Touriva-Algeria-Platform/1.0 (https://touriva-web.onrender.com; contact: contact@touriva.dz)'
      }
    })

    const results = (response.data || []).map(p => ({
      name: p.name || (p.display_name ? p.display_name.split(',')[0].trim() : cleanQuery),
      displayName: p.display_name || cleanQuery,
      lat: parseFloat(p.lat),
      lng: parseFloat(p.lon),
      source: 'nominatim',
      attribution: '© OpenStreetMap contributors, ODbL 1.0'
    })).filter(r => !isNaN(r.lat) && !isNaN(r.lng))

    externalGeocodeCache.set(cacheKey, results)
    return results
  } catch (err) {
    if (axios.isCancel(err) || err.name === 'CanceledError' || err.name === 'AbortError') {
      return []
    }
    // Handle HTTP 429 Too Many Requests or network downtime gracefully
    if (err.response?.status === 429) {
      console.warn('Nominatim rate limit encountered (HTTP 429). Falling back to local database.')
    } else {
      console.warn('Nominatim search request failed:', err.message)
    }
    return []
  }
}

/**
 * Backward-compatible search function.
 * If called without explicit flag, returns ONLY local matches (0 network calls).
 * If isExplicit is true, falls back to throttled Nominatim search when local matches are sparse.
 *
 * @param {string} query
 * @param {object|AbortSignal} [opts]
 * @returns {Promise<Array<{ name: string, displayName: string, lat: number, lng: number, source: string }>>}
 */
export async function searchDestinations(query, opts = {}) {
  // Support passing AbortSignal directly for backward compatibility
  const options = (opts instanceof AbortSignal || (opts && opts.aborted !== undefined))
    ? { signal: opts, isExplicit: false }
    : (opts || {})

  const localMatches = filterLocalDestinations(query)

  // Strict compliance: if not explicitly submitted by user, return local matches only!
  if (!options.isExplicit) {
    return localMatches
  }

  // If explicit and user requested search, check external Nominatim if local matches are limited
  if (localMatches.length < 3 && query && query.trim().length >= 3) {
    const external = await searchNominatimExternal(query, { signal: options.signal })
    if (external && external.length > 0) {
      // Deduplicate against local matches
      const combined = [...localMatches]
      for (const item of external) {
        const duplicate = combined.some(c => Math.abs(c.lat - item.lat) < 0.05 && Math.abs(c.lng - item.lng) < 0.05)
        if (!duplicate) {
          combined.push(item)
        }
      }
      return combined.slice(0, 8)
    }
  }

  return localMatches
}

/**
 * Creates a debounced version of a function (for local operations only)
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
