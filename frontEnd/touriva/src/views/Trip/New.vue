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
          <v-radio :label="$t('program')" value="program" />
          <v-radio :label="$t('map')" value="map" />
        </v-radio-group>
      </v-col>

      <!-- PROGRAM COLUMN -->
      <v-col
        cols="12"
        md="4"
        class="pa-4 program-col"
        v-show="mobileView === 'program' || isDesktop"
      >
        <v-row class="mb-4"  v-if="days.length > 0">
          <v-col>
            <h1 class="ma-0">{{ tripsStore.currentTrip?.name }}</h1>
            <div class="subtitle">{{ $t('createTripSubtitle') }}</div>
          </v-col>
          
        </v-row>
        

        <v-row align="center" class="mb-3">
          <v-col>
            <h2 class="ma-0">{{ $t('tripProgram') }}</h2>
            <div class="subtitle">{{ $t('tripProgramSubtitle') }}</div>

            <div class="d-flex justify-end mt-2">
              <v-btn
                color="next"
                @click="dialogDays = true"
              >
                + {{ $t('addDatesDays') }}
              </v-btn>
            </div>
          </v-col>
          
        </v-row>

        <div v-for="day in days" :key="day.day" class="mb-6">
          <div class="d-flex align-center justify-space-between mb-2">
          <!-- Left: Day avatar + text -->
          <div class="d-flex align-center">
            <v-avatar size="32" class="mr-3" color="next">
              <span class="white--text">{{ day.day }}</span>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ $t('day') }} {{ day.day }}</div>
              <!-- <div class="text-caption">
                {{ $t('start') }}: {{ dayStartTime(day) }} — {{ $t('end') }}: {{ dayEndTime(day) }}
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
                <template v-slot:prepend>
                  <v-icon start>mdi-map-search</v-icon>
                </template>
                <v-list-item-title>{{ $t('showAllOnMap') }}</v-list-item-title>
              </v-list-item>

              <v-list-item @click="addStopForDay(day.day)">
                <template v-slot:prepend>
                  <v-icon start>mdi-plus</v-icon>
                </template>
                
                <v-list-item-title>{{ $t('addStop') }}</v-list-item-title>
              </v-list-item>

              <v-list-item @click="removeDay(day.day)" color="red">
                <template v-slot:prepend>
                  <v-icon start color="red">mdi-delete</v-icon>
                </template>
                <v-list-item-title class="text-red">{{ $t('deleteDay') }}</v-list-item-title>
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
                class="mb-3 stop-card"
                :elevation="activeStopId === element.id ? 8 : 1"
                :border="activeStopId === element.id ? 'primary' : false"
                :color="activeStopId === element.id ? 'blue-lighten-5' : undefined"
                @click="selectStop(element)"
              >
                <v-row no-gutters>
                
                  <v-col cols="4">
                    <v-img :src="element.image" height="100px" cover />
                  </v-col>

                  <v-col cols="8" class="pa-3">

                  
                    <div class="d-flex justify-space-between align-start">

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
                            <template v-slot:prepend>
                              <v-icon>mdi-map-marker</v-icon>
                            </template>
                            
                            <v-list-item-title>{{ $t('viewOnMap') }}</v-list-item-title>
                          </v-list-item>

                          <!-- <v-list-item @click="openEditDialog(element)">
                            <template v-slot:prepend>
                              <v-icon>mdi-pencil</v-icon>
                            </template>
                            
                            <v-list-item-title>{{ $t('editStop') }}</v-list-item-title>
                          </v-list-item> -->

                          <v-list-item @click="deleteStop(day, element)" color="red">
                            <template v-slot:prepend>
                              <v-icon color="red">mdi-delete</v-icon>
                            </template>
                            
                            <v-list-item-title class="text-red">{{ $t('delete') }}</v-list-item-title>
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
                  :placeholder="$t('search')"
                  prepend-icon="mdi-map-marker"
                  persistent-placeholder
                  :label="$t('search')"
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
                          <v-card-title class="text-su">{{ item.displayName?.text || item.name }}</v-card-title>
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

    <v-dialog v-model="dialogDays" max-width="500">
      <v-card>
        <v-card-title>{{ $t('addDays') }}</v-card-title>

        <v-tabs v-model="tab" grow>
          <v-tab value="dates">{{ $t('byDates') }}</v-tab>
          <v-tab value="number">{{ $t('byNumber') }}</v-tab>
        </v-tabs>

        <v-card-text>
          <v-window v-model="tab">

            <!-- TAB 1: Dates -->
            <v-window-item value="dates">
              <v-text-field
                v-model="startDate"
                :label="$t('startDate')"
                type="date"
                class="mt-3"
              />

              <v-text-field
                v-model="endDate"
                :label="$t('endDate')"
                type="date"
              />

              <div v-if="calculatedDays > 0" class="text-caption mt-2">
                {{ $t('numberOfDays') }}: <strong>{{ calculatedDays }}</strong>
              </div>
            </v-window-item>

            <!-- TAB 2: Number of days -->
            <v-window-item value="number">
              <v-text-field
                v-model.number="manualDays"
                :label="$t('numberOfDays')"
                type="number"
                min="1"
                class="mt-3"
              />
            </v-window-item>

          </v-window>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogDays = false">{{ $t('cancel') }}</v-btn>
          <v-btn
            color="next"
            :disabled="!canConfirm"
            @click="confirmAddDays"
          >
            {{ $t('confirm') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch, onBeforeUnmount } from 'vue'
import { Capacitor } from '@capacitor/core'
import { Geolocation } from '@capacitor/geolocation'
// import draggable from 'vuedraggable'
import { Map, NavigationControl, Marker, Popup, LngLatBounds } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  MAP_STYLES,
  OSM_RASTER_FALLBACK,
  DAY_ROUTE_COLORS,
  createTourivaMarkerElement,
  buildStopPopupHtml
} from '@/utils/osmMap'
import { useHotelsStore } from '@/stores/hotels'
import { useRestaurantsStore } from '@/stores/restaurants'
import { useSitesStore } from '@/stores/sites'
import { useTripsStore } from '@/stores/trips'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const hotelsStore = useHotelsStore()
const restaurantsStore = useRestaurantsStore()
const sitesStore = useSitesStore()
const tripsStore = useTripsStore()
const authStore = useAuthStore()
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
let popup = null
const markers = new Map()
const platform = ref(null)
const autocompleteRef = ref(null)

// Watch mobileView to resize MapLibre canvas when switching to map tab
watch(mobileView, (val) => {
  if (val === 'map' && map) {
    nextTick(() => {
      map.resize()
    })
  }
})

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
}),
dialogDays = ref(false)
const formRef = ref(null)
const tab = ref('dates')

const startDate = ref(null)
const endDate = ref(null)
const manualDays = ref(null)

const activeDay = ref(null)

const city = ref('')
const cityInputRef = ref(null)
let autocomplete = null
let autocompleteListener = null

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

watch(city, (val) => {
  if (!val || !val.lat || !val.lng) return
  getCoordinatesAndFetch(val.lat, val.lng)
})

const getCoordinatesAndFetch = async (lat, lng) => {
  await hotelsStore.fetchHotels(lat, lng)
  await restaurantsStore.fetchRestaurants(lat, lng)
  await sitesStore.fetchSites(lat, lng)
}

function toggleAdd(day) {
  activeDay.value = activeDay.value === day ? null : day
}

const addPlace = async (type, day) => {
  console.log('Add', type, 'to day', day)
  openAddDialog(day, type)
  activeDay.value = null
}
// const mainImg = ref(null)

// const trip = ref({
//   name: '',
//   creator: '',
//   price: '',
//   image: null
// })

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


const getPhotoUrl = (restaurant) => {
  if (restaurant?.photo) {
    return restaurant.photo
  }
  if (restaurant?.image) {
    return restaurant.image
  }
  if (restaurant?.photos?.length && typeof restaurant.photos[0]?.name === 'string' && restaurant.photos[0].name.startsWith('http')) {
    return restaurant.photos[0].name
  }
  return "/no-image.png"
}

function addStopForDay(dayNum) {
  openAddDialog(dayNum)
}

/* Calculate days from dates */
const calculatedDays = computed(() => {
  if (!startDate.value || !endDate.value) return 0

  const start = new Date(startDate.value)
  const end = new Date(endDate.value)

  if (start > end) return 0

  return Math.floor(
    (end - start) / (1000 * 60 * 60 * 24)
  ) + 1
})

/* Enable confirm button */
const canConfirm = computed(() => {
  if (tab.value === 'dates') return calculatedDays.value > 0
  if (tab.value === 'number') return manualDays.value > 0
  return false
})

/* Add days to main array */
const confirmAddDays = () => {
  let count =
    tab.value === 'dates'
      ? calculatedDays.value
      : manualDays.value

  const startDay =
    days.value.length
      ? Math.max(...days.value.map(d => d.day)) + 1
      : 1

  for (let i = 0; i < count; i++) {
    days.value.push({
      day: startDay + i,
      items: []
    })
  }

  // reset + close
  startDate.value = null
  endDate.value = null
  manualDays.value = null
  dialogDays.value = false
}

const returnTo = () => {
  router.go(-1)
}

const selectStop = (stop) => {
  console.log('Select stop', stop)
  activeStopId.value = stop.id
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
  console.log('Select item', item)
  dialog.data.selectedItem = item
}
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
    title: item.displayName?.text || item.name,
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
      console.log('Current position:', coordinates.coords.latitude, coordinates.coords.longitude)
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
  platform.value = Capacitor.getPlatform()
  requestGps().then(() => {
    
    currentPosition()
    
  })
  await nextTick()
  initMap()
  
  const tripId = router.currentRoute.value.params.id
  if(!tripsStore.getCurrentTrip) {
    await tripsStore.fetchTripById(tripId)
  }

  const ls = await authStore.getLSUserInfo()
  tripsStore.currentTrip.creator = ls?.user
})

function initMap() {
  const container = document.getElementById('map')
  if (!container) return

  const firstStop = days.value[0]?.items[0]
  const center = firstStop && firstStop.lng && firstStop.lat
    ? [Number(firstStop.lng), Number(firstStop.lat)]
    : [3.0588, 36.7538] // [lng, lat] (Algiers)

  map = new Map({
    container: 'map',
    style: MAP_STYLES.liberty,
    center,
    zoom: 12,
    attributionControl: true
  })

  map.addControl(new NavigationControl({ visualizePitch: false }), 'top-right')

  let fallbackStep = 0
  map.on('error', (e) => {
    if (fallbackStep === 0 && e?.error?.status >= 400) {
      fallbackStep = 1
      console.warn('MapLibre Liberty style warning, trying Bright style:', e.error)
      try {
        map.setStyle(MAP_STYLES.bright)
      } catch (err) {
        fallbackStep = 2
        map.setStyle(OSM_RASTER_FALLBACK)
      }
    } else if (fallbackStep === 1 && e?.error?.status >= 400) {
      fallbackStep = 2
      console.warn('MapLibre Bright style warning, switching to OSM raster fallback:', e.error)
      try {
        map.setStyle(OSM_RASTER_FALLBACK)
      } catch (err) {
        console.error('Failed to set fallback raster:', err)
      }
    }
  })

  map.on('load', () => {
    drawAll()
  })
}

function drawAll() {
  if (!map) return

  markers.forEach(m => m.remove())
  markers.clear()

  if (!map.isStyleLoaded()) {
    map.once('style.load', () => drawAll())
    return
  }

  days.value.forEach((day, dayIndex) => {
    const color = DAY_ROUTE_COLORS[dayIndex % DAY_ROUTE_COLORS.length]
    const path = []

    day.items.forEach((stop, stopIndex) => {
      if (!stop.lat || !stop.lng) return
      const lng = Number(stop.lng)
      const lat = Number(stop.lat)
      path.push([lng, lat])

      const el = createTourivaMarkerElement(stop.title, stopIndex + 1, color)
      el.addEventListener('click', () => openInfo(stop))

      const marker = new Marker({ element: el, anchor: 'bottom' })
        .setLngLat([lng, lat])
        .addTo(map)

      markers.set(stop.id, marker)
    })

    const sourceId = `route-source-${day.day}`
    const layerId = `route-layer-${day.day}`

    const lineGeoJson = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: path
      }
    }

    if (map.getSource(sourceId)) {
      map.getSource(sourceId).setData(lineGeoJson)
    } else if (path.length >= 2) {
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
}

function openInfo(stop) {
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

  activeStopId.value = stop.id
}

// CRUD
function addDay() { 
  days.value.push({ day: days.value.length ? Math.max(...days.value.map(d=>d.day))+1 : 1, items: [] }) 
}

function removeDay(dayNum) { 
  const dayObj = days.value.find(d => d.day===dayNum)
  dayObj?.items.forEach(s => {
    markers.get(s.id)?.remove()
    markers.delete(s.id)
  })
  if (map) {
    const layerId = `route-layer-${dayNum}`
    const sourceId = `route-source-${dayNum}`
    if (map.getLayer(layerId)) map.removeLayer(layerId)
    if (map.getSource(sourceId)) map.removeSource(sourceId)
  }
  days.value = days.value.filter(d=>d.day!==dayNum) 
}
function focusStop(stop) { openInfo(stop) }
function onReorder() { drawAll() }
function fitBoundsForDay(dayObj) {
  if (!map) return
  const bounds = new LngLatBounds()
  let hasPoints = false
  dayObj.items.forEach(i => {
    if (i.lat && i.lng) {
      bounds.extend([Number(i.lng), Number(i.lat)])
      hasPoints = true
    }
  })
  if (hasPoints && !bounds.isEmpty()) {
    map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 800 })
  }
}

onBeforeUnmount(() => {
  markers.forEach(m => m.remove())
  markers.clear()
  if (popup) popup.remove()
  if (map) {
    map.remove()
    map = null
  }
})

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

<style>
  .program-col { max-height: 100vh; overflow-y: auto; border-right: 1px solid rgba(0,0,0,0.06); }
  .subtitle { color: rgba(0,0,0,0.6); font-size: 13px; }
  .map-container { width: 100%; height: 100vh; }
  .scroll-cards { max-height: 300px; overflow-y: auto; }
  .cursor-pointer { cursor: pointer; }
  
 .selected-card {
    border: 2px solid #0f766e; /* Touriva primary */
    background-color: rgba(25, 118, 210, 0.08);
  }

  .full-height {
    height: calc(100vh - 64px);
  }

  .program-col {
    height: calc(100vh - 64px);
    overflow-y: auto;
  }

  .map-container {
    height: calc(100vh - 64px);
  }

</style>
