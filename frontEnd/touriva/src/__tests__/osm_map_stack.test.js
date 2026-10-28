import { describe, it, expect } from 'vitest'
import { MAP_STYLES, OSM_RASTER_FALLBACK, createTourivaMarkerElement, buildStopPopupHtml } from '../utils/osmMap'
import { ALGERIAN_DESTINATIONS, searchDestinations } from '../utils/geocoding'

describe('Touriva OpenStreetMap Free Mapping Stack', () => {
  it('configures OpenFreeMap and OSM raster styles without API keys or credentials', () => {
    expect(MAP_STYLES.liberty).toContain('tiles.openfreemap.org/styles/liberty')
    expect(MAP_STYLES.liberty).not.toContain('key=')
    expect(OSM_RASTER_FALLBACK.sources['osm-raster-source'].tiles[0]).toContain('tile.openstreetmap.org')
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

  it('provides curated Algerian destinations for instant zero-network search', () => {
    expect(ALGERIAN_DESTINATIONS.length).toBeGreaterThanOrEqual(20)
    const algiers = ALGERIAN_DESTINATIONS.find(d => d.name === 'Algiers')
    expect(algiers).toBeDefined()
    expect(algiers.lat).toBeCloseTo(36.7538, 2)
    expect(algiers.lng).toBeCloseTo(3.0588, 2)
  })

  it('searches destinations locally and matches accurately', async () => {
    const results = await searchDestinations('Oran')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].name).toBe('Oran')
  })
})
