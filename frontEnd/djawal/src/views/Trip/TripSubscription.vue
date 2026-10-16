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
            <v-btn color="next" @click="openSubscribeDialog(tripsStore.getCurrentTrip)">
              {{ $t('Subscribe') }}
            </v-btn>
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
          <!-- <v-menu location="bottom-end">
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
          </v-menu> -->
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
                      <!-- <v-menu location="bottom-end">
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

                          <v-list-item @click="openEditDialog(element)">
                            <v-icon start>mdi-pencil</v-icon>
                            <v-list-item-title>Edit Stop</v-list-item-title>
                          </v-list-item>

                          <v-list-item @click="deleteStop(day, element)" color="red">
                            <v-icon start color="red">mdi-delete</v-icon>
                            <v-list-item-title class="text-red">Delete</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>-->
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


          <!-- <div class="mt-2" v-if="days.length > 0">
            <v-btn text small @click="openAddDialog(day.day)">
              <v-icon left>mdi-plus</v-icon>Add Stop to Day {{ day.day }}
            </v-btn>
          </div> -->
        </div>
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
    <!-- <v-dialog v-model="dialog.show" max-width="800">
      <v-card>
        <v-card-title>{{ dialog.edit ? 'Edit Stop' : 'Add Stop' }}</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-radio-group v-model="dialog.data.type" row>
                <v-radio label="Hotel" value="hotel" />
                <v-radio label="Restaurant" value="restaurant" />
                <v-radio label="Site" value="site" />
              </v-radio-group>
            </v-col>

            <v-col cols="12">
              <div class="scroll-cards">
                <v-row dense>
                  <v-col
                    v-for="item in itemsForSelectedType"
                    :key="item.id"
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-card
                      :elevation="dialog.data.selectedItem?.id === item.id ? 6 : 2"
                      class="cursor-pointer"
                      @click="selectItem(item)"
                    >
                      <v-img :src="getPhotoUrl(item)" height="120px" cover />
                      <v-card-title class="text-h6">{{ item.displayName?.text }}</v-card-title>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </v-col>

            <v-col cols="12">
              <v-text-field v-model="dialog.data.time" label="Time (e.g. 10:00 AM)" />
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="dialog.data.description" label="Description" rows="3" />
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="dialog.data.day"
                :items="dayNumbers"
                label="Day"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" @click="saveDialog">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog> -->

    <v-dialog v-model="subscribeDialog" max-width="420">
      <v-card>
        <v-card-title class="text-h6">
          {{ $t('ConfirmSubscription') }}
        </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="form.fullName"
            :label="$t('FullName')"
            required
          />

          <v-text-field
            v-model="form.phone"
            :label="$t('Phone')"
            required
            type="tel"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="subscribeDialog = false">
            {{ $t('Cancel') }}
          </v-btn>
          <v-btn color="next" @click="confirmSubscription">
            {{ $t('Confirm') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import draggable from 'vuedraggable'
import { useHotelsStore } from '@/stores/hotels'
import { useRestaurantsStore } from '@/stores/restaurants'
import { useSitesStore } from '@/stores/sites'
import { useTripsStore } from '@/stores/trips'
import { useRouter } from 'vue-router'
import axios from 'axios'

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
const days = ref([])
const activeStopId = ref(null)
let map = null
const markers = reactive(new Map())
const polylines = reactive(new Map())
let infoWindow = null

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

// DAY NUMBERS
const dayNumbers = computed(() => days.value.map(d => d.day))

// COMPUTED: ITEMS FOR SELECTED TYPE
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

  const subscribeDialog = ref(false)
  const selectedTrip = ref(null)

  const form = ref({
    fullName: '',
    phone: ''
  })

  const openSubscribeDialog = (trip) => {
    selectedTrip.value = trip
    subscribeDialog.value = true
  }

  const confirmSubscription = async () => {
    try {
      await axios.post('/api/tripSubscriptions', {
        tripId: selectedTrip.value._id,
        fullName: form.value.fullName,
        phone: form.value.phone
      })

      subscribeDialog.value = false
      form.value = { fullName: '', phone: '' }

      alert('Subscription successful!')
    } catch (e) {
      console.error(e)
      alert('Subscription failed')
    }
  }

  function addStopForDay(dayNum) {
    openAddDialog(dayNum)
  }

const returnTo = () => {
  router.go(-1)
}

// DIALOG ACTIONS
const openAddDialog = (dayNum = null) => {
  if (!days.value.length) return
  dialog.edit = false
  dialog.data = {
    id: genId(),
    type: 'hotel',
    selectedItem: null,
    day: dayNum || days.value[0].day,
    time: '',
    description: ''
  }
  dialog.show = true
}

const selectItem = (item) => dialog.data.selectedItem = item
const closeDialog = () => dialog.show = false

const saveDialog = () => {
  if (!dialog.data.selectedItem) return alert('Please select an item')
  const dayNum = Number(dialog.data.day)
  let dayObj = days.value.find(d => d.day === dayNum)
  if (!dayObj) {
    dayObj = { day: dayNum, items: [] }
    days.value.push(dayObj)
  }
  const item = dialog.data.selectedItem
  const stop = {
    id: dialog.data.id,
    title: item.displayName?.text,
    time: dialog.data.time,
    description: dialog.data.description,
    lat: item.location?.latitude,
    lng: item.location?.longitude,
    image: getPhotoUrl(item)
  }
  dayObj.items.push(stop)
  drawAll()
  closeDialog()
}

// MAP INIT
onMounted(async () => {
   const tripId = router.currentRoute.value.params.id
  if(!tripsStore.getCurrentTrip) {
    await tripsStore.fetchTripById(tripId)
  }

  if (tripsStore.currentTrip?.items?.length) {
    days.value = tripsStore.currentTrip.items.map(day => ({
      day: day.day,
      items: day.items.map(item => ({
        id: item._id || genId(),
        title: item.title,
        time: item.time,
        description: item.description,
        lat: item.lat,
        lng: item.lng,
        image: item.image
      }))
    }))
  }

  await nextTick()
  initMap()
})

function initMap() {
  if (!window.google || !window.google.maps) return
  const firstStop = days.value[0]?.items[0]
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
      if (stop.lat == null || stop.lng == null) return
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
function addDay() { days.value.push({ day: days.value.length ? Math.max(...days.value.map(d=>d.day))+1 : 1, items: [] }) }
function removeDay(dayNum) { 
  const dayObj = days.value.find(d => d.day===dayNum)
  dayObj?.items.forEach(s => markers.get(s.id)?.setMap(null))
  days.value = days.value.filter(d=>d.day!==dayNum) 
}
function focusStop(stop) { openInfo(stop) }
function onReorder() { drawAll() }
function fitBoundsForDay(dayObj) {
  const bounds = new google.maps.LatLngBounds()
  dayObj.items.forEach(i => bounds.extend({ lat: i.lat, lng: i.lng }))
  if (!bounds.isEmpty()) map.fitBounds(bounds, 60)
}

const dayStartTime = (day) => day.items.length ? day.items.map(i => i.time||'').sort()[0] : '-'
const dayEndTime = (day) => day.items.length ? day.items.map(i => i.time||'').sort().reverse()[0] : '-'
</script>

<style scoped>
.program-col { max-height: 100vh; overflow-y: auto; border-right: 1px solid rgba(0,0,0,0.06); }
.subtitle { color: rgba(0,0,0,0.6); font-size: 13px; }
.map-container { width: 100%; height: 100vh; }
.scroll-cards { max-height: 300px; overflow-y: auto; }
.cursor-pointer { cursor: pointer; }
@media (max-width: 959px) {
  .map-container { height: 50vh; }
  .program-col { max-height: 50vh; }
}
</style>
