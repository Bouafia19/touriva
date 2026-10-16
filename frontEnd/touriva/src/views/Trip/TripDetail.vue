<template>
  <v-container fluid>
    <v-row>
      <v-col class="d-flex justify-start">
        <v-btn 
          color="next"
          @click="returnTo"
          variant="text"
          prepend-icon="mdi-arrow-left"
        >
          {{ $t('Return') }}
        </v-btn>
      </v-col>
    </v-row>

    <v-row no-gutters>
      <!-- MOBILE TOGGLE -->
      <v-col cols="12" class="d-md-none mb-2">
        <v-radio-group v-model="mobileView" row>
          <v-radio label="Program" value="program" />
          <v-radio label="Map" value="map" />
        </v-radio-group>
      </v-col>

      <!-- PROGRAM COLUMN -->
      <v-col
        cols="12"
        md="4"
        class="pa-4 program-col"
        v-show="mobileView === 'program' || isDesktop"
      >
        <v-row align="center" class="mb-3">
          <v-col>
            <h2 class="ma-0">{{ tripsStore.getCurrentTrip?.name }}</h2>
            <div class="subtitle">Manage days, reorder stops, add or edit points</div>
          </v-col>
          <v-col class="d-flex justify-end" cols="auto">
            <v-btn color="primary" @click="addDay">Add Day</v-btn>
          </v-col>
        </v-row>

        <div v-for="day in tripsStore.getCurrentTrip?.items" :key="day.day" class="mb-6">
          <div class="d-flex align-center justify-space-between mb-2">
          <!-- Left: Day avatar + text -->
            <div class="d-flex align-center">
              <v-avatar size="32" class="mr-3" color="primary">
                <span class="white--text">{{ day.day }}</span>
              </v-avatar>
              <div>
                <div class="font-weight-medium">Day {{ day.day }}</div>
                <!-- <div class="text-caption">
                  Start: {{ dayStartTime(day) }} — End: {{ dayEndTime(day) }}
                </div> -->
              </div>
            </div>

          <!-- Right: 3-dots menu -->
          <v-menu location="bottom-end">
            <template #activator="{ props }">
              <v-btn icon variant="text" v-bind="props">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>

            <v-list density="compact">
              <v-list-item @click="fitBoundsForDay(day)">
                <v-icon start>mdi-map-search</v-icon>
                <v-list-item-title>Show All on Map</v-list-item-title>
              </v-list-item>

              <v-list-item @click="addStopForDay(day.day)">
                <v-icon start>mdi-plus</v-icon>
                <v-list-item-title>Add Stop</v-list-item-title>
              </v-list-item>

              <v-list-item @click="removeDay(day.day)" color="red">
                <v-icon start color="red">mdi-delete</v-icon>
                <v-list-item-title class="text-red">Delete Day</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>


          <!-- draggable stops for this day -->
          <!-- <draggable
            v-model="day.items"
            item-key="id"
            animation="180"
            @end="onReorder"
            handle=".drag-handle"
          >
            <template #item="{ element }"> -->
              <v-card 
                v-for="element in day.items"
                :key="element.id"
                :elevation="activeStopId === element.id ? 6 : 1" 
                class="mb-3"
              >
                <v-row no-gutters>
                  <!-- Left: Image -->
                  <v-col cols="4">
                    <v-img :src="element.image" height="100px" cover />
                  </v-col>

                  <!-- Right: Info + Actions -->
                  <v-col cols="8" class="pa-3">

                    <!-- Title, Time, Menu -->
                    <div class="d-flex justify-space-between align-start">

                      <!-- Text info -->
                      <div>
                        <div class="font-weight-medium">{{ element.title }}</div>
                        <!-- <div class="text-caption">{{ element.time }}</div> -->
                      </div>

                      <!-- Three-dots menu -->
                      <v-menu location="bottom-end">
                        <template #activator="{ props }">
                          <v-btn icon variant="text" v-bind="props">
                            <v-icon>mdi-dots-vertical</v-icon>
                          </v-btn>
                        </template>

                        <v-list density="compact">
                          <v-list-item @click="focusStop(element)">
                            <v-icon start>mdi-map-marker</v-icon>
                            <v-list-item-title>View on Map</v-list-item-title>
                          </v-list-item>

                          <!-- <v-list-item @click="openEditDialog(element)">
                            <v-icon start>mdi-pencil</v-icon>
                            <v-list-item-title>Edit Stop</v-list-item-title>
                          </v-list-item> -->

                          <v-list-item @click="deleteStop(day, element)" color="red">
                            <v-icon start color="red">mdi-delete</v-icon>
                            <v-list-item-title class="text-red">Delete</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </div>

                    <!-- Description -->
                    <div class="mt-2 text-body-2">{{ element.description }}</div>

                    <!-- Drag handle -->
                    <!-- <div class="mt-1 text-right">
                      <span class="drag-handle" style="cursor:grab; font-size:18px; opacity:0.6;">
                        <v-icon>mdi-drag</v-icon>
                      </span>
                    </div> -->

                  </v-col>
                </v-row>
              </v-card>
            <!-- </template>
          </draggable> -->


          <div class="mt-2" v-if="days.length > 0">
            <!-- BUTTON -->
            <v-btn
              v-if="activeDay !== day.day"
              variant="text"
              size="small"
              @click="toggleAdd(day.day)"
            >
              <v-icon start>mdi-plus</v-icon>
              {{ $t('addStopToDay') }} {{ day.day }}
            </v-btn>

            <!-- ICONS -->
            <div
              v-else
              class="d-flex align-center ga-3"
            >
              <v-btn
                icon
                variant="outlined"
                color="next"
                @click="addPlace('hotel', day.day)"
              >
                <v-icon>mdi-bed</v-icon>
              </v-btn>

              <v-btn
                icon
                variant="outlined"
                color="next"
                @click="addPlace('restaurant', day.day)"
              >
                <v-icon>mdi-silverware-fork-knife</v-icon>
              </v-btn>

              <v-btn
                icon
                variant="outlined"
                color="next"
                @click="addPlace('site', day.day)"
              >
                <v-icon>mdi-map-marker</v-icon>
              </v-btn>

              <!-- CLOSE -->
              <v-btn
                icon
                variant="text"
                color="error"
                @click="toggleAdd(day.day)"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
          </div>
        </div>

        <v-row class="mb-4"  v-if="days.length > 0">
          <v-spacer></v-spacer>
          <v-col class="d-flex justify-end" cols="auto">
            <v-btn 
              color="success" 
              :loading="tripsStore.isLoading"
              @click="saveTripToDB"
            >
              {{ $t('saveTrip') }}
            </v-btn>
          </v-col>
        </v-row>
        
      </v-col>

      <!-- MAP COLUMN -->
      <v-col
        cols="12"
        md="8"
        class="pa-0"
        v-show="mobileView === 'map' || isDesktop"
      >
        <div id="map" class="map-container"></div>
      </v-col>
    </v-row>

    <!-- ADD / EDIT STOP DIALOG -->
    <v-navigation-drawer
      v-model="dialog.show"
      temporary
      location="right"
      :width="platform === 'web' ? '500' : ''"
    >
          <v-card class="pa-4" flat>
            <v-card-title class="text-h6 font-weight-bold">
              {{ dialog.edit ? $t('editStop') : $t('addStop') }}
            </v-card-title>
            
            <v-card-text>
              <v-row>
                <v-autocomplete
                  v-model="city"
                  :items="cities"
                  item-title="name"
                  rounded
                  variant="solo"
                  prepend-icon="mdi-map-marker"
                  :placeholder="$t('search')"
                  return-object
                  hide-details
                />
                
                <v-col cols="12">
                  <div class="scroll-cards">
                    <v-row dense>
                      <v-col
                        v-for="item in itemsForSelectedType"
                        :key="item.name"
                        cols="12"
                        sm="6"
                        md="6"
                      >
                        <v-card
                          :elevation="dialog.data.selectedItem?.name === item.name ? 6 : 2"
                          class="cursor-pointer"
                          :class="{ 'selected-card': dialog.data.selectedItem?.name === item.name }"
                          @click="selectItem(item)"
                        >
                          <v-img :src="getPhotoUrl(item)" height="120px" cover />
                          <v-card-title class="text-su">{{ item.displayName?.text }}</v-card-title>
                        </v-card>
                      </v-col>
                    </v-row>
                  </div>
                </v-col>

                <!-- <v-col cols="12">
                  <v-text-field v-model="dialog.data.time" label="Time (e.g. 10:00 AM)" />
                </v-col> -->
                <v-col cols="12">
                  <v-textarea v-model="dialog.data.description" label="Description" rows="3" />
                </v-col>
                <!-- <v-col cols="12">
                  <v-select
                    v-model="dialog.data.day"
                    :items="dayNumbers"
                    label="Day"
                  />
                </v-col> -->
              </v-row>

            </v-card-text>
          </v-card>
          <template v-slot:append>
            <v-divider></v-divider>
            <div class="pa-4">
              
              <v-row justify="end" no-gutters>
                <v-col cols="auto">
                  <v-btn 
                    text 
                    @click="closeDialog"
                  >
                    {{ $t('cancel') }}
                  </v-btn>
                </v-col>
                <v-spacer></v-spacer>
                <v-col cols="auto">
                  <v-btn 
                    color="next" 
                    @click="saveDialog"
                  >
                    Save
                  </v-btn>
                </v-col>
              </v-row>
            </div>
          </template>
        </v-navigation-drawer>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { Capacitor } from '@capacitor/core'
import { Geolocation } from '@capacitor/geolocation'
// import draggable from 'vuedraggable'
import { useHotelsStore } from '@/stores/hotels'
import { useRestaurantsStore } from '@/stores/restaurants'
import { useSitesStore } from '@/stores/sites'
import { useTripsStore } from '@/stores/trips'
import { useRouter } from 'vue-router'

const hotelsStore = useHotelsStore()
const restaurantsStore = useRestaurantsStore()
const sitesStore = useSitesStore()
const tripsStore = useTripsStore()
const router = useRouter()

// MOBILE TOGGLE
const mobileView = ref('program')
const isDesktop = ref(window.innerWidth >= 960)
window.addEventListener('resize', () => isDesktop.value = window.innerWidth >= 960)

// DAYS & STOPS
function genId() { return 's_' + Math.random().toString(36).slice(2, 9) }
// const days = ref([])
const activeStopId = ref(null)
let map = null
const markers = reactive(new Map())
const polylines = reactive(new Map())
let infoWindow = null
const platform = ref(null)
const city = ref('')

const days = computed({
  get: () => tripsStore.getCurrentTrip?.items || [],
  set: (val) => {
    tripsStore.getCurrentTrip.items = val
  }
})

const cities = [
  { "code": 1, "name": "Adrar", "lat": 27.8743, "lng": -0.2930 },
  { "code": 2, "name": "Chlef", "lat": 36.1739, "lng": 1.3366 },
  { "code": 3, "name": "Laghouat", "lat": 33.8000, "lng": 2.8667 },
  { "code": 4, "name": "Oum El Bouaghi", "lat": 35.8750, "lng": 7.1167 },
  { "code": 5, "name": "Batna", "lat": 35.5550, "lng": 6.1667 },
  { "code": 6, "name": "Béjaïa", "lat": 36.7500, "lng": 5.0597 },
  { "code": 7, "name": "Biskra", "lat": 34.8500, "lng": 5.7333 },
  { "code": 8, "name": "Béchar", "lat": 31.6167, "lng": -2.2167 },
  { "code": 9, "name": "Blida", "lat": 36.4667, "lng": 2.8333 },
  { "code": 10, "name": "Bouira", "lat": 36.3833, "lng": 3.9000 },
  { "code": 11, "name": "Tamanrasset", "lat": 22.7850, "lng": 5.5228 },
  { "code": 12, "name": "Tébessa", "lat": 35.4167, "lng": 8.1167 },
  { "code": 13, "name": "Tlemcen", "lat": 34.8833, "lng": -1.3167 },
  { "code": 14, "name": "Tiaret", "lat": 35.3667, "lng": 1.3167 },
  { "code": 15, "name": "Tizi Ouzou", "lat": 36.7167, "lng": 4.0500 },
  { "code": 16, "name": "Alger", "lat": 36.7538, "lng": 3.0588 },
  { "code": 17, "name": "Djelfa", "lat": 34.6667, "lng": 3.2500 },
  { "code": 18, "name": "Jijel", "lat": 36.8167, "lng": 5.7667 },
  { "code": 19, "name": "Sétif", "lat": 36.1900, "lng": 5.4100 },
  { "code": 20, "name": "Saïda", "lat": 34.8333, "lng": 0.1500 },
  { "code": 21, "name": "Skikda", "lat": 36.8667, "lng": 6.9167 },
  { "code": 22, "name": "Sidi Bel Abbès", "lat": 35.2000, "lng": -0.6333 },
  { "code": 23, "name": "Annaba", "lat": 36.9000, "lng": 7.7667 },
  { "code": 24, "name": "Guelma", "lat": 36.4500, "lng": 7.4333 },
  { "code": 25, "name": "Constantine", "lat": 36.3500, "lng": 6.6000 },
  { "code": 26, "name": "Médéa", "lat": 36.2667, "lng": 2.7500 },
  { "code": 27, "name": "Mostaganem", "lat": 35.9333, "lng": 0.1000 },
  { "code": 28, "name": "M'Sila", "lat": 35.7078, "lng": 4.5419 },
  { "code": 29, "name": "Mascara", "lat": 35.4000, "lng": 0.1500 },
  { "code": 30, "name": "Ouargla", "lat": 31.9500, "lng": 5.3167 },
  { "code": 31, "name": "Oran", "lat": 35.6997, "lng": -0.6308 },
  { "code": 32, "name": "El Bayadh", "lat": 33.6833, "lng": 1.0167 },
  { "code": 33, "name": "Illizi", "lat": 26.4833, "lng": 8.4667 },
  { "code": 34, "name": "Bordj Bou Arréridj", "lat": 36.0667, "lng": 4.6667 },
  { "code": 35, "name": "Boumerdès", "lat": 36.7500, "lng": 3.4833 },
  { "code": 36, "name": "El Tarf", "lat": 36.7667, "lng": 8.3167 },
  { "code": 37, "name": "Tindouf", "lat": 27.7000, "lng": -8.1300 },
  { "code": 38, "name": "Tissemsilt", "lat": 35.6000, "lng": 1.8167 },
  { "code": 39, "name": "El Oued", "lat": 33.3667, "lng": 6.8667 },
  { "code": 40, "name": "Khenchela", "lat": 35.4167, "lng": 7.1333 },
  { "code": 41, "name": "Souk Ahras", "lat": 36.2667, "lng": 7.9500 },
  { "code": 42, "name": "Tipaza", "lat": 36.5833, "lng": 2.4500 },
  { "code": 43, "name": "Mila", "lat": 36.4500, "lng": 6.2667 },
  { "code": 44, "name": "Aïn Defla", "lat": 36.2500, "lng": 1.9667 },
  { "code": 45, "name": "Naâma", "lat": 33.2667, "lng": -0.2167 },
  { "code": 46, "name": "Aïn Témouchent", "lat": 35.2994, "lng": -1.1447 },
  { "code": 47, "name": "Ghardaïa", "lat": 32.4892, "lng": 3.6700 },
  { "code": 48, "name": "Relizane", "lat": 35.7374, "lng": 0.5550 }
]


// DIALOG
const dialog = reactive({
  show: false,
  edit: false,
  data: {
    id: null,
    type: 'hotel',
    selectedItem: null,
    day: 1,
    time: '',
    description: ''
  }
})
const formRef = ref(null)
const activeDay = ref(null)

// DAY NUMBERS
const dayNumbers = computed(() => days.value.map(d => d.day))

const itemsForSelectedType = computed(() => {
  switch (dialog.data.type) {
    case 'hotel': return hotelsStore.getHotels
    case 'restaurant': return restaurantsStore.getRestaurants
    case 'site': return sitesStore.getSites
    default: return []
  }
})

const API_KEY = "AIzaSyDxFsMTjS-UsZgkJXcAPbtLQFHmNrg7wN4"

const getPhotoUrl = (restaurant) => {
  if (!restaurant || !restaurant.photos || restaurant.photos.length === 0) {
    return "/no-image.png"
  }

  const photoName = restaurant.photos[0].name // e.g. "places/xxxx/photos/yyyy"

  return `https://places.googleapis.com/v1/${photoName}/media?key=${API_KEY}&maxWidthPx=800`
}

function addStopForDay(dayNum) {
  openAddDialog(dayNum)
}

function toggleAdd(day) {
  activeDay.value = activeDay.value === day ? null : day
}

const returnTo = () => {
  router.go(-1)
}

const addPlace = async (type, day) => {
  console.log('Add', type, 'to day', day)
  openAddDialog(day, type)
  activeDay.value = null
}

// DIALOG ACTIONS
const openAddDialog = (dayNum = null, type = 'hotel') => {
  if (!days.value.length) return
  dialog.edit = false
  dialog.data = {
    id: genId(),
    type: type,
    selectedItem: null,
    day: dayNum || days.value[0].day,
    time: '',
    description: ''
  }
  dialog.show = true
}

const selectItem = (item) => {
  console.log('Selected item', item)
  dialog.data.selectedItem = item
}

const closeDialog = () => dialog.show = false

const saveDialog = () => {
  const dayNum = Number(dialog.data.day)

  let targetDay = days.value.find(d => d.day === dayNum)
  if (!targetDay) {
    targetDay = { day: dayNum, items: [] }
    days.value.push(targetDay)
  }

  // 🔍 Find existing stop across ALL days
  let existingStop = null
  let sourceDay = null

  for (const d of days.value) {
    const found = d.items.find(i => i.id === dialog.data.id)
    if (found) {
      existingStop = found
      sourceDay = d
      break
    }
  }

  const item = dialog.data.selectedItem

  const stop = {
    id: dialog.data.id,
    title: item?.displayName?.text ?? existingStop?.title,
    time: dialog.data.time,
    description: dialog.data.description,
    lat: item?.location?.latitude ?? existingStop?.lat,
    lng: item?.location?.longitude ?? existingStop?.lng,
    image: item ? getPhotoUrl(item) : existingStop?.image
  }

  // ✏️ EDIT MODE
  if (dialog.edit && existingStop) {
    // Move to another day
    if (sourceDay.day !== dayNum) {
      sourceDay.items = sourceDay.items.filter(i => i.id !== stop.id)
      targetDay.items.push(stop)
    } else {
      const idx = sourceDay.items.findIndex(i => i.id === stop.id)
      sourceDay.items[idx] = stop
    }
  } else {
    // ➕ ADD MODE
    targetDay.items.push(stop)
  }

  drawAll()
  closeDialog()
}




function openEditDialog(stop) {
  console.log('Editing stop', stop)
  const dayObj = days.value.find(d =>
    d.items.some(i => i.id === stop.id)
  )

  if (!dayObj) return

  // Find original item source (hotel / restaurant / site)
  let type = 'site'
  let selectedItem =
    hotelsStore.getHotels.find(h => h.displayName?.text === stop.title) ||
    restaurantsStore.getRestaurants.find(r => r.displayName?.text === stop.title) ||
    sitesStore.getSites.find(s => s.displayName?.text === stop.title)

  if (hotelsStore.getHotels.includes(selectedItem)) type = 'hotel'
  if (restaurantsStore.getRestaurants.includes(selectedItem)) type = 'restaurant'
  if (sitesStore.getSites.includes(selectedItem)) type = 'site'

  dialog.edit = true
  dialog.data = {
    id: stop.id,
    type,
    selectedItem,
    day: dayObj.day,
    time: stop.time,
    description: stop.description
  }

  dialog.show = true
}


const requestGps = async () => {
  try {
    await Geolocation.requestPermissions()
  } catch (error) {
    
  }
}

const currentPosition = async () => {
  try {
    const coordinates = await Geolocation.getCurrentPosition({
                                        enableHighAccuracy: true
                                    })
    if(coordinates.coords){
      if (!hotelsStore.getHotels.length) await hotelsStore.fetchHotels(coordinates.coords.latitude, coordinates.coords.longitude)
      if (!restaurantsStore.getRestaurants.length) await restaurantsStore.fetchRestaurants(coordinates.coords.latitude, coordinates.coords.longitude)
      if (!sitesStore.getSites.length) await sitesStore.fetchSites(coordinates.coords.latitude, coordinates.coords.longitude)
    }
  } catch (error) {
    console.log('error', error)
  }
}

// MAP INIT
onMounted(async () => {
  const tripId = router.currentRoute.value.params.id
  if(!tripsStore.getCurrentTrip) {
    await tripsStore.fetchTripById(tripId)
  }

  // Ensure items structure exists
  if (!tripsStore.getCurrentTrip?.items) {
    tripsStore.getCurrentTrip.items = []
  }

  platform.value = Capacitor.getPlatform()
  requestGps().then(() => {
   
    currentPosition()
  
  })

  await nextTick()
  initMap()
})

function initMap() {
  if (!window.google || !window.google.maps) return
  const firstStop = days.value[0]?.items[0]
  console.log('Initializing map, first stop:', firstStop)
  const center = firstStop ? { lat: firstStop.lat, lng: firstStop.lng } : { lat: 36.75, lng: 3.05 }
  map = new google.maps.Map(document.getElementById('map'), { center, zoom: 12 })
  infoWindow = new google.maps.InfoWindow()
  drawAll()
}

function drawAll() {
  markers.forEach(m => m.setMap(null))
  markers.clear()
  polylines.forEach(p => p.setMap(null))
  polylines.clear()
  days.value.forEach(day => {
    const path = []
    day.items.forEach(stop => {
      if (!stop.lat || !stop.lng) return
      const marker = new google.maps.Marker({ map, position: { lat: stop.lat, lng: stop.lng }, title: stop.title })
      marker.addListener('click', () => openInfo(stop))
      markers.set(stop.id, marker)
      path.push({ lat: stop.lat, lng: stop.lng })
    })
    if (path.length) {
      const poly = new google.maps.Polyline({ path, geodesic: true, strokeColor: '#1976D2', strokeOpacity: 0.8, strokeWeight: 4, map })
      polylines.set(day.day, poly)
    }
  })
}

function openInfo(stop) {
  if (!infoWindow || !markers.get(stop.id)) return
  infoWindow.setContent(`<strong>${stop.title}</strong><br/><small>${stop.time || ''}</small><div>${stop.description || ''}</div>${stop.image ? `<img src="${stop.image}" style="width:100%; border-radius:6px; margin-top:6px" />` : ''}`)
  infoWindow.open(map, markers.get(stop.id))
  map.panTo({ lat: stop.lat, lng: stop.lng })
  map.setZoom(15)
  activeStopId.value = stop.id
}

// CRUD
function addDay() {
  const items = tripsStore.getCurrentTrip.items
  const nextDay =
    items.length ? Math.max(...items.map(d => d.day)) + 1 : 1

  items.push({ day: nextDay, items: [] })
}

function deleteStop(dayObj, stopObj) {
  console.log('Deleting stop', stopObj, 'from day', dayObj)
  if (!dayObj || !stopObj) return

  const index = dayObj.items.findIndex(i => i._id === stopObj._id)
  if (index === -1) return

  // Remove stop from day
  dayObj.items.splice(index, 1)

  // Remove marker from map
  const marker = markers.get(stopObj._id)
  if (marker) {
    marker.setMap(null)
    markers.delete(stopObj._id)
  }

  drawAll()
}




// function removeDay(dayNum) {
//   const index = days.value.findIndex(d => d.day === dayNum)
//   if (index !== -1) days.value.splice(index, 1)
//   drawAll()
// }

function removeDay(dayNum) {
  // 1. Remove markers for that day
  const dayObj = days.value.find(d => d.day === dayNum)
  if (dayObj) {
    dayObj.items.forEach(stop => {
      const marker = markers.get(stop.id)
      if (marker) {
        marker.setMap(null)
        markers.delete(stop.id)
      }
    })
  }

  // 2. Remove the day
  const filteredDays = days.value.filter(d => d.day !== dayNum)

  // 3. Renumber remaining days + keep stops
  const renumberedDays = filteredDays.map((day, index) => ({
    ...day,
    day: index + 1
  }))

  // 4. Apply update
  days.value = renumberedDays

  // 5. Redraw map
  drawAll()
}




function focusStop(stop) { openInfo(stop) }
// function onReorder() { drawAll() }
function fitBoundsForDay(dayObj) {
  const bounds = new google.maps.LatLngBounds()
  dayObj.items.forEach(i => bounds.extend({ lat: i.lat, lng: i.lng }))
  if (!bounds.isEmpty()) map.fitBounds(bounds, 60)
}

const dayStartTime = (day) => day.items.length ? day.items.map(i => i.time||'').sort()[0] : '-'
const dayEndTime = (day) => day.items.length ? day.items.map(i => i.time||'').sort().reverse()[0] : '-'

const saveTripToDB = async () => {
  if (!days.value.length) {
    alert('Add at least one day to the trip')
    return
  }

  const tripPayload = {
    name: tripsStore.getCurrentTrip.name,              
    creator: tripsStore.getCurrentTrip.creator,              
    image: tripsStore.getCurrentTrip.image,      
    price: tripsStore.getCurrentTrip.price,
    rating: 0,
    days: days.value.map(d => d.day),
    items: days.value.map(d => ({
      day: d.day,
      items: d.items.map(i => ({
        title: i.title,
        time: i.time,
        description: i.description,
        lat: i.lat,
        lng: i.lng,
        image: i.image
      }))
    }))
  }

  try {
    const createdTrip = await tripsStore.updateTrip(tripsStore.getCurrentTrip._id, tripPayload)
    console.log('✅ Trip saved to DB:', createdTrip)
    alert('Trip created successfully!')
  } catch (err) {
    console.error('❌ Failed to save trip', err)
    alert('Failed to save trip')
  }
}
</script>

<style scoped>
.program-col { max-height: 100vh; overflow-y: auto; border-right: 1px solid rgba(0,0,0,0.06); }
.subtitle { color: rgba(0,0,0,0.6); font-size: 13px; }
.map-container { width: 100%; height: 100vh; }
.scroll-cards { max-height: 300px; overflow-y: auto; }
.cursor-pointer { cursor: pointer; }
.selected-card {
    border: 2px solid #0f766e; /* Touriva primary */
    background-color: rgba(25, 118, 210, 0.08);
  }
</style>
