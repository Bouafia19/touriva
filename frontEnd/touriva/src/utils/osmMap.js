import { Map, NavigationControl, Marker, Popup, LngLatBounds } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

/**
 * OpenFreeMap styles (100% free, no token, zero billing)
 * https://openfreemap.org
 */
export const MAP_STYLES = {
  liberty: 'https://tiles.openfreemap.org/styles/liberty',
  bright: 'https://tiles.openfreemap.org/styles/bright',
  positron: 'https://tiles.openfreemap.org/styles/positron'
}

/**
 * Fallback OSM standard raster style in case vector tiles cannot be reached
 */
export const OSM_RASTER_FALLBACK = {
  version: 8,
  sources: {
    'osm-raster-source': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
    }
  },
  layers: [
    {
      id: 'osm-raster-layer',
      type: 'raster',
      source: 'osm-raster-source',
      minzoom: 0,
      maxzoom: 19
    }
  ]
}

/**
 * Brand color palette for Touriva day routes
 */
export const DAY_ROUTE_COLORS = [
  '#173F35', // Touriva Forest Green
  '#21866B', // Touriva Emerald
  '#D9B98C', // Touriva Desert Sand / Gold
  '#2B6CB0', // Deep Blue
  '#805AD5', // Purple
  '#DD6B20', // Terracotta Orange
  '#319795', // Teal
  '#E53E3E'  // Crimson
]

/**
 * Initializes a MapLibre GL map instance with graceful fallback
 */
export function initTourivaMap(container, options = {}) {
  const defaultCenter = [3.0588, 36.7538] // Algiers [lng, lat]
  const center = options.center || defaultCenter
  const zoom = options.zoom !== undefined ? options.zoom : 12

  const map = new Map({
    container,
    style: options.style || MAP_STYLES.liberty,
    center,
    zoom,
    attributionControl: true
  })

  // Add zoom and rotation controls
  map.addControl(new NavigationControl({ visualizePitch: false }), 'top-right')

  // Handle tile load errors by falling back to standard OSM raster
  let fallbackApplied = false
  map.on('error', (e) => {
    if (!fallbackApplied && e && e.error && e.error.status >= 400) {
      console.warn('OpenFreeMap style load warning, falling back to OSM raster:', e.error)
      fallbackApplied = true
      try {
        map.setStyle(OSM_RASTER_FALLBACK)
      } catch (err) {
        console.error('Error applying raster fallback:', err)
      }
    }
  })

  return map
}

/**
 * Creates a Touriva-branded DOM marker element
 */
export function createTourivaMarkerElement(title = '', number = null, color = '#173F35') {
  const el = document.createElement('div')
  el.className = 'touriva-map-marker'
  el.title = title
  el.style.width = '32px'
  el.style.height = '40px'
  el.style.cursor = 'pointer'
  el.style.display = 'flex'
  el.style.flexDirection = 'column'
  el.style.alignItems = 'center'
  el.style.filter = 'drop-shadow(0 3px 6px rgba(0,0,0,0.35))'
  el.style.transition = 'transform 0.2s ease'

  const pinSvg = `
    <svg viewBox="0 0 32 40" width="32" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10.5 13.5 22.5 15.1 23.8.5.4 1.3.4 1.8 0C18.5 38.5 32 26.5 32 16 32 7.163 24.837 0 16 0z" fill="${color}"/>
      <circle cx="16" cy="15" r="7" fill="#FFFFFF"/>
      ${number ? `<text x="16" y="19" text-anchor="middle" font-size="11" font-weight="bold" fill="${color}" font-family="system-ui, sans-serif">${number}</text>` : `<circle cx="16" cy="15" r="4" fill="${color}"/>`}
    </svg>
  `
  el.innerHTML = pinSvg

  el.addEventListener('mouseenter', () => {
    el.style.transform = 'scale(1.15) translateY(-2px)'
  })
  el.addEventListener('mouseleave', () => {
    el.style.transform = 'scale(1)'
  })

  return el
}

/**
 * Formats a clean popup HTML for a trip stop
 */
export function buildStopPopupHtml(stop) {
  const title = stop.title || 'Stop'
  const time = stop.time ? `<div style="font-size: 11px; color: #21866B; font-weight: 600; margin-bottom: 4px;">⏰ ${stop.time}</div>` : ''
  const desc = stop.description ? `<div style="font-size: 12px; color: #4A5568; line-height: 1.4; margin-bottom: 6px;">${stop.description}</div>` : ''
  const img = stop.image && !stop.image.includes('no-image')
    ? `<img src="${stop.image}" alt="${title}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 6px; margin-top: 6px; display: block;" onerror="this.style.display='none'" />`
    : ''

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 180px; max-width: 240px; padding: 4px 2px;">
      <div style="font-size: 14px; font-weight: 700; color: #173F35; margin-bottom: 3px;">${title}</div>
      ${time}
      ${desc}
      ${img}
    </div>
  `
}
