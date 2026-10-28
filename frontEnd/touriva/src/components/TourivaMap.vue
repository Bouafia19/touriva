<template>
  <div class="touriva-map-wrapper" :style="{ height: height || '100%', width: '100%' }">
    <div ref="mapContainer" class="touriva-map-container"></div>
    <div v-if="loading" class="touriva-map-loading">
      <v-progress-circular indeterminate color="#173F35" size="36" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { Map, NavigationControl, Marker, Popup, LngLatBounds } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  MAP_STYLES,
  OSM_RASTER_FALLBACK,
  DAY_ROUTE_COLORS,
  createTourivaMarkerElement,
  buildStopPopupHtml
} from '@/utils/osmMap'

const props = defineProps({
  center: {
    type: Array,
    default: () => [3.0588, 36.7538] // [lng, lat] (Algiers)
  },
  zoom: {
    type: Number,
    default: 12
  },
  stops: {
    type: Array,
    default: () => []
  },
  days: {
    type: Array,
    default: () => []
  },
  height: {
    type: String,
    default: '100%'
  },
  interactive: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['stop-click', 'map-load'])

const mapContainer = ref(null)
const loading = ref(true)
let map = null
let popup = null
const markers = new Map()

const initMap = () => {
  if (!mapContainer.value) return

  try {
    map = new Map({
      container: mapContainer.value,
      style: MAP_STYLES.liberty,
      center: props.center,
      zoom: props.zoom,
      interactive: props.interactive,
      attributionControl: true
    })

    if (props.interactive) {
      map.addControl(new NavigationControl({ visualizePitch: false }), 'top-right')
    }

    let fallbackTriggered = false
    map.on('error', (e) => {
      if (!fallbackTriggered && e?.error?.status >= 400) {
        fallbackTriggered = true
        console.warn('OpenFreeMap style issue, switching to OSM raster:', e.error)
        try {
          map.setStyle(OSM_RASTER_FALLBACK)
        } catch (err) {
          console.error('Failed to set fallback style:', err)
        }
      }
    })

    map.on('load', () => {
      loading.value = false
      renderStopsAndRoutes()
      emit('map-load', map)
    })
  } catch (err) {
    console.error('Error initializing Touriva MapLibre instance:', err)
    loading.value = false
  }
}

const clearMarkers = () => {
  markers.forEach(m => m.remove())
  markers.clear()
}

const renderStopsAndRoutes = () => {
  if (!map || !map.isStyleLoaded()) return

  clearMarkers()

  // Collect stops either from props.stops or from props.days
  const allStops = []
  if (props.days && props.days.length > 0) {
    props.days.forEach((day, dayIndex) => {
      const color = DAY_ROUTE_COLORS[dayIndex % DAY_ROUTE_COLORS.length]
      const dayCoordinates = []

      ;(day.items || []).forEach((stop, stopIndex) => {
        if (stop.lat && stop.lng) {
          allStops.push(stop)
          const lng = Number(stop.lng)
          const lat = Number(stop.lat)
          dayCoordinates.push([lng, lat])

          const el = createTourivaMarkerElement(stop.title, stopIndex + 1, color)
          el.addEventListener('click', () => {
            openPopup(stop)
            emit('stop-click', stop)
          })

          const marker = new Marker({ element: el, anchor: 'bottom' })
            .setLngLat([lng, lat])
            .addTo(map)

          markers.set(stop.id || `${day.day}_${stopIndex}`, marker)
        }
      })

      // Add or update route polyline for the day
      const sourceId = `day-route-source-${day.day}`
      const layerId = `day-route-layer-${day.day}`

      const lineGeoJson = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: dayCoordinates
        }
      }

      if (map.getSource(sourceId)) {
        map.getSource(sourceId).setData(lineGeoJson)
      } else if (dayCoordinates.length >= 2) {
        map.addSource(sourceId, {
          type: 'geojson',
          data: lineGeoJson
        })
        map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': color,
            'line-width': 4,
            'line-opacity': 0.85
          }
        })
      }
    })
  } else if (props.stops && props.stops.length > 0) {
    props.stops.forEach((stop, idx) => {
      if (stop.lat && stop.lng) {
        const lng = Number(stop.lng)
        const lat = Number(stop.lat)
        const el = createTourivaMarkerElement(stop.title, idx + 1, '#173F35')
        el.addEventListener('click', () => {
          openPopup(stop)
          emit('stop-click', stop)
        })

        const marker = new Marker({ element: el, anchor: 'bottom' })
          .setLngLat([lng, lat])
          .addTo(map)

        markers.set(stop.id || idx, marker)
      }
    })
  }
}

const openPopup = (stop) => {
  if (!map || !stop.lat || !stop.lng) return
  if (popup) popup.remove()

  popup = new Popup({ offset: 35, closeButton: true, closeOnClick: true })
    .setLngLat([Number(stop.lng), Number(stop.lat)])
    .setHTML(buildStopPopupHtml(stop))
    .addTo(map)

  map.flyTo({
    center: [Number(stop.lng), Number(stop.lat)],
    zoom: Math.max(map.getZoom(), 14),
    duration: 800
  })
}

const fitBounds = (stopsList) => {
  if (!map) return
  const list = stopsList || props.stops
  const bounds = new LngLatBounds()
  let hasPoints = false

  list.forEach(s => {
    if (s.lat && s.lng) {
      bounds.extend([Number(s.lng), Number(s.lat)])
      hasPoints = true
    }
  })

  if (hasPoints && !bounds.isEmpty()) {
    map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 800 })
  }
}

const resize = () => {
  if (map) {
    nextTick(() => {
      map.resize()
    })
  }
}

watch(
  () => [props.stops, props.days],
  () => {
    renderStopsAndRoutes()
  },
  { deep: true }
)

onMounted(() => {
  nextTick(() => {
    initMap()
  })
})

onBeforeUnmount(() => {
  clearMarkers()
  if (popup) popup.remove()
  if (map) {
    map.remove()
    map = null
  }
})

defineExpose({
  resize,
  fitBounds,
  openPopup,
  getMapInstance: () => map
})
</script>

<style scoped>
.touriva-map-wrapper {
  position: relative;
  overflow: hidden;
  background-color: #f7fafc;
}
.touriva-map-container {
  width: 100%;
  height: 100%;
}
.touriva-map-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 10;
}
</style>
