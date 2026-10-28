import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import {
  MAP_STYLES,
  OSM_RASTER_FALLBACK,
  DAY_ROUTE_COLORS,
  createTourivaMarkerElement,
  buildStopPopupHtml
} from '../utils/osmMap'
import {
  ALGERIAN_DESTINATIONS,
  filterLocalDestinations,
  searchNominatimExternal,
  searchDestinations,
  sanitizeSearchQuery,
  normalizeText
} from '../utils/geocoding'

describe('Touriva OpenStreetMap Free Mapping Stack', () => {
  it('configures OpenFreeMap vector styles and OSM raster style without API keys or credentials', () => {
    expect(MAP_STYLES.liberty).toContain('tiles.openfreemap.org/styles/liberty')
    expect(MAP_STYLES.bright).toContain('tiles.openfreemap.org/styles/bright')
    expect(MAP_STYLES.positron).toContain('tiles.openfreemap.org/styles/positron')
    expect(MAP_STYLES.liberty).not.toContain('key=')
    expect(MAP_STYLES.liberty).not.toContain('token=')
    expect(OSM_RASTER_FALLBACK.sources['osm-raster-source'].tiles[0]).toContain('tile.openstreetmap.org')
    expect(OSM_RASTER_FALLBACK.sources['osm-raster-source'].attribution).toContain('OpenStreetMap')
  })

  it('defines Touriva day route brand colors', () => {
    expect(DAY_ROUTE_COLORS.length).toBeGreaterThanOrEqual(5)
    expect(DAY_ROUTE_COLORS[0]).toBe('#173F35') // Forest green
    expect(DAY_ROUTE_COLORS[1]).toBe('#21866B') // Emerald
  })

  it('generates Touriva-branded DOM marker elements with custom color and title', () => {
    const markerEl = createTourivaMarkerElement('Casbah of Algiers', 1, '#173F35')
    expect(markerEl).toBeInstanceOf(HTMLElement)
    expect(markerEl.className).toBe('touriva-map-marker')
    expect(markerEl.title).toBe('Casbah of Algiers')
    expect(markerEl.innerHTML).toContain('#173F35')
    expect(markerEl.innerHTML).toContain('1')
  })

  it('formats clean stop popup HTML with Touriva styling', () => {
    const stop = {
      title: 'Botanical Garden Hamma',
      time: '10:00 AM',
      description: 'Historical lush botanical sanctuary',
      image: 'https://example.com/hamma.jpg'
    }
    const html = buildStopPopupHtml(stop)
    expect(html).toContain('Botanical Garden Hamma')
    expect(html).toContain('10:00 AM')
    expect(html).toContain('Historical lush botanical sanctuary')
    expect(html).toContain('https://example.com/hamma.jpg')
  })

  it('provides all 58 Algerian wilayas + tourism hubs for instant zero-network search', () => {
    expect(ALGERIAN_DESTINATIONS.length).toBeGreaterThanOrEqual(58)
    const algiers = ALGERIAN_DESTINATIONS.find(d => d.name === 'Algiers')
    expect(algiers).toBeDefined()
    expect(algiers.lat).toBeCloseTo(36.7538, 2)
    expect(algiers.lng).toBeCloseTo(3.0588, 2)

    // Check newly created southern wilayas are included
    const djanet = ALGERIAN_DESTINATIONS.find(d => d.name === 'Djanet')
    expect(djanet).toBeDefined()
    expect(djanet.code).toBe(56)

    const timimoun = ALGERIAN_DESTINATIONS.find(d => d.name === 'Timimoun')
    expect(timimoun).toBeDefined()
    expect(timimoun.code).toBe(49)
  })

  describe('Local Multilingual Destination Filtering (Zero Network Keystrokes)', () => {
    it('matches destination in English without network calls', () => {
      const results = filterLocalDestinations('Oran')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].name).toBe('Oran')
      expect(results[0].source).toBe('local')
    })

    it('matches destination in French with accent insensitivity', () => {
      const results = filterLocalDestinations('bejaia')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].name).toBe('Béjaïa')
    })

    it('matches destination in Arabic script', () => {
      const results = filterLocalDestinations('وهران')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].name).toBe('Oran')
    })

    it('returns popular destinations when query is empty', () => {
      const results = filterLocalDestinations('')
      expect(results.length).toBe(8)
      expect(results[0].name).toBe('Adrar')
    })
  })

  describe('Strict Nominatim Policy Compliance & Rate Limiting', () => {
    beforeEach(() => {
      vi.restoreAllMocks()
    })

    it('PROVES typing keystrokes NEVER triggers external Nominatim network requests', async () => {
      const axiosGetSpy = vi.spyOn(axios, 'get')

      // Simulate rapid user typing "Constantine" character by character
      const simulatedKeystrokes = ['C', 'Co', 'Con', 'Const', 'Consta', 'Constan', 'Constantine']
      for (const stroke of simulatedKeystrokes) {
        const results = filterLocalDestinations(stroke)
        expect(Array.isArray(results)).toBe(true)
      }

      // Assert ZERO network calls were made during typing
      expect(axiosGetSpy).not.toHaveBeenCalled()
    })

    it('PROVES searchDestinations without explicit flag returns only local results and 0 network calls', async () => {
      const axiosGetSpy = vi.spyOn(axios, 'get')

      const results = await searchDestinations('Tlemcen')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].name).toBe('Tlemcen')
      expect(axiosGetSpy).not.toHaveBeenCalled()
    })

    it('sanitizes queries to protect user privacy and remove forbidden characters', () => {
      const dirty = '<script>alert("hack")</script> user@example.com Algiers 123'
      const clean = sanitizeSearchQuery(dirty)
      expect(clean).not.toContain('<script>')
      expect(clean).not.toContain('user@example.com')
      expect(clean).toContain('Algiers')
    })

    it('identifies Touriva with valid User-Agent when explicit search is triggered', async () => {
      const mockOsmResponse = {
        data: [
          {
            place_id: 12345,
            lat: '36.75',
            lon: '3.05',
            display_name: 'Algiers Port, Algeria',
            name: 'Algiers Port'
          }
        ]
      }
      const axiosGetSpy = vi.spyOn(axios, 'get').mockResolvedValue(mockOsmResponse)

      const results = await searchNominatimExternal('Algiers Port Explicit')
      expect(axiosGetSpy).toHaveBeenCalledTimes(1)
      const callArgs = axiosGetSpy.mock.calls[0]
      expect(callArgs[0]).toBe('https://nominatim.openstreetmap.org/search')
      expect(callArgs[1].headers['User-Agent']).toContain('Touriva')
      expect(callArgs[1].headers['Accept']).toBe('application/json')
      expect(callArgs[1].params.countrycodes).toBe('dz')

      expect(results[0].source).toBe('nominatim')
      expect(results[0].attribution).toContain('OpenStreetMap contributors')
    })

    it('caches external Nominatim results to prevent repeated network requests', async () => {
      const mockOsmResponse = {
        data: [
          {
            place_id: 99999,
            lat: '35.70',
            lon: '-0.63',
            display_name: 'Santa Cruz Fort, Oran, Algeria',
            name: 'Santa Cruz Fort'
          }
        ]
      }
      const axiosGetSpy = vi.spyOn(axios, 'get').mockResolvedValue(mockOsmResponse)

      // First call -> hits mock network
      const results1 = await searchNominatimExternal('Santa Cruz Fort Oran')
      expect(axiosGetSpy).toHaveBeenCalledTimes(1)
      expect(results1[0].name).toBe('Santa Cruz Fort')

      // Second identical call -> hits cache immediately, 0 additional network calls
      const results2 = await searchNominatimExternal('Santa Cruz Fort Oran')
      expect(axiosGetSpy).toHaveBeenCalledTimes(1)
      expect(results2).toEqual(results1)
    })

    it('handles HTTP 429 Too Many Requests gracefully without throwing unhandled exceptions', async () => {
      const rateLimitError = new Error('Request failed with status code 429')
      rateLimitError.response = { status: 429, data: 'Too Many Requests' }
      vi.spyOn(axios, 'get').mockRejectedValue(rateLimitError)

      const results = await searchNominatimExternal('High Frequency Query')
      expect(results).toEqual([])
    })
  })
})
