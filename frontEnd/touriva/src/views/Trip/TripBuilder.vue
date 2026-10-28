<template>
  <div class="editorial-trip-builder bg-warm-ivory min-vh-100 pb-16">
    <!-- Header Banner -->
    <div class="catalog-hero py-10 px-4 border-b border-subtle bg-white">
      <v-container class="max-w-container">
        <div class="text-center max-w-content mx-auto">
          <div class="editorial-tag mb-1">
            <v-icon size="14" color="#D9B98C" class="mr-1">mdi-creation</v-icon>
            {{ $t('poweredByAI') || 'AI TRIP CONCIERGE' }}
          </div>
          <h1 class="text-h3 font-serif font-weight-bold text-forest mb-2">
            Design Your Bespoke Algerian Journey
          </h1>
          <p class="text-secondary-editorial mb-0">
            {{ $t('customRecommendations') || "Tell us your preferences and let our AI concierge curate an authentic, multi-day itinerary across Algeria's finest heritage and natural landmarks." }}
          </p>
        </div>
      </v-container>
    </div>

    <!-- Main Stepper Wizard -->
    <v-container class="max-w-container py-8">
      <!-- Step Indicator Bar -->
      <div class="stepper-indicator-bar mb-8 d-flex justify-center align-center">
        <div
          v-for="(stName, stIdx) in items"
          :key="stIdx"
          class="step-node d-flex align-center"
          :class="{ 'step-active': step === stIdx + 1, 'step-completed': step > stIdx + 1 }"
        >
          <div class="step-circle" @click="step > stIdx + 1 ? step = stIdx + 1 : null">
            <v-icon size="16" v-if="step > stIdx + 1">mdi-check</v-icon>
            <span v-else>{{ stIdx + 1 }}</span>
          </div>
          <span class="step-label d-none d-sm-inline-block ml-2">{{ stName }}</span>
          <div v-if="stIdx < items.length - 1" class="step-connector mx-3"></div>
        </div>
      </div>

      <v-card class="editorial-card pa-6 pa-md-10" elevation="0">
        <!-- ================= STEP 1: DESTINATION ================= -->
        <div v-if="step === 1" class="step-content">
          <div class="text-center mb-8">
            <div class="editorial-tag text-sand mb-1">STEP 1 OF 4</div>
            <h2 class="text-h4 font-serif font-weight-bold text-forest mb-2">
              {{ $t('whereDoYouWantToGo') || 'Where would you like to explore?' }}
            </h2>
            <p class="text-secondary-editorial max-w-prose mx-auto">
              Select an Algerian wilaya or city to begin crafting your itinerary with local verified spots.
            </p>
          </div>

          <v-row justify="center">
            <v-col cols="12" md="8">
              <v-combobox
                v-model="selectedState"
                v-model:search="citySearchQuery"
                :items="citySuggestions"
                item-title="name"
                item-value="name"
                :loading="isSearchingCity"
                :placeholder="$t('search') || 'Enter city or destination (e.g. Algiers, Djanet, Oran)...'"
                prepend-inner-icon="mdi-map-marker-outline"
                append-inner-icon="mdi-magnify"
                variant="outlined"
                density="comfortable"
                rounded="pill"
                color="#173F35"
                class="bg-white elevation-1"
                clearable
                no-filter
                @click:append-inner="triggerExplicitExternalSearch"
                @keydown.enter.prevent="triggerExplicitExternalSearch"
                @update:model-value="onDestinationSelected"
              >
                <template #item="{ props: itemProps, item }">
                  <v-list-item v-bind="itemProps" :title="item.raw.name" :subtitle="item.raw.displayName">
                    <template #prepend>
                      <v-icon :color="item.raw.source === 'nominatim' ? '#2B6CB0' : '#21866B'" size="20">
                        {{ item.raw.source === 'nominatim' ? 'mdi-earth' : 'mdi-map-marker' }}
                      </v-icon>
                    </template>
                    <template v-if="item.raw.source === 'nominatim'" #append>
                      <v-chip size="x-small" color="primary" variant="tonal" class="text-caption">OSM</v-chip>
                    </template>
                  </v-list-item>
                </template>
              </v-combobox>
              <div class="text-caption text-secondary-editorial mt-1 px-2 text-center">
                <span>Instant curated destinations. Press Enter or click</span>
                <v-icon size="14" class="mx-1" color="#173F35">mdi-magnify</v-icon>
                <span>to query OpenStreetMap.</span>
              </div>
            </v-col>
          </v-row>

          <div class="text-center mt-6">
            <div class="editorial-tag text-secondary-editorial mb-3">
              {{ $t('orPopularDestination') || 'POPULAR FEATURED DESTINATIONS' }}
            </div>
            <div class="d-flex flex-wrap justify-center ga-2 max-w-prose mx-auto">
              <v-chip
                v-for="c in popularCities"
                :key="c.name"
                :color="selectedState === c.name ? '#173F35' : 'default'"
                :variant="selectedState === c.name ? 'flat' : 'outlined'"
                class="cursor-pointer font-weight-medium px-4 py-2"
                size="default"
                @click="selectCity(c)"
              >
                <v-icon start size="16">mdi-compass</v-icon>
                {{ c.name }}
              </v-chip>
            </div>
          </div>
        </div>

        <!-- ================= STEP 2: DATES ================= -->
        <div v-else-if="step === 2" class="step-content">
          <div class="text-center mb-8">
            <div class="editorial-tag text-sand mb-1">STEP 2 OF 4</div>
            <h2 class="text-h4 font-serif font-weight-bold text-forest mb-2">
              {{ $t('selectTripDates') || 'Select Your Journey Window' }}
            </h2>
            <p class="text-secondary-editorial max-w-prose mx-auto">
              Choose your arrival and departure dates to determine your excursion schedule.
            </p>
          </div>

          <v-row justify="center">
            <v-col cols="12" md="6">
              <v-card class="editorial-card pa-4" elevation="0">
                <div class="text-subtitle-1 font-weight-bold text-forest mb-2 text-center">
                  {{ new Date(today).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }}
                </div>
                <v-date-picker
                  v-model="pickerOneDate"
                  :day-props="getDayProps"
                  :min="today"
                  color="#173F35"
                  class="w-100"
                  @update:model-value="handlePickerOneSelection"
                />
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card class="editorial-card pa-4" elevation="0">
                <div class="text-subtitle-1 font-weight-bold text-forest mb-2 text-center">
                  {{ new Date(now.getFullYear(), nextMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }}
                </div>
                <v-date-picker
                  v-model="pickerTwoDate"
                  :day-props="getDayProps"
                  :min="today"
                  :month="nextMonth"
                  :year="nextYear"
                  color="#173F35"
                  class="w-100"
                  @update:model-value="handlePickerTwoSelection"
                />
              </v-card>
            </v-col>
          </v-row>

          <!-- Selected Dates Summary -->
          <v-card v-if="debutDate || endDate" class="editorial-card pa-4 bg-deep-green text-white mt-6" elevation="0">
            <v-row align="center">
              <v-col cols="12" sm="4">
                <div class="editorial-tag text-sand">START DATE</div>
                <div class="text-h6 font-weight-bold text-white">
                  {{ debutDate ? new Date(debutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' }}
                </div>
              </v-col>
              <v-col cols="12" sm="4">
                <div class="editorial-tag text-sand">END DATE</div>
                <div class="text-h6 font-weight-bold text-white">
                  {{ endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' }}
                </div>
              </v-col>
              <v-col cols="12" sm="4" class="text-sm-end">
                <div class="editorial-tag text-sand">DURATION</div>
                <div class="text-h5 font-weight-bold text-sand-light">
                  {{ numberOfDays }} {{ numberOfDays === 1 ? 'day' : 'days' }}
                </div>
              </v-col>
            </v-row>
          </v-card>

          <v-alert v-if="debutDate && endDate && endDate <= debutDate" type="error" variant="tonal" class="mt-4">
            End date must be after the start date.
          </v-alert>
        </div>

        <!-- ================= STEP 3: TRIP TYPE ================= -->
        <div v-else-if="step === 3" class="step-content">
          <div class="text-center mb-8">
            <div class="editorial-tag text-sand mb-1">STEP 3 OF 4</div>
            <h2 class="text-h4 font-serif font-weight-bold text-forest mb-2">
              {{ $t('selectTripType') || 'Who is traveling on this journey?' }}
            </h2>
            <p class="text-secondary-editorial max-w-prose mx-auto">
              We personalize pace, activity selection, and accommodations based on your group dynamics.
            </p>
          </div>

          <v-row justify="center">
            <v-col
              v-for="t in trips"
              :key="t.value"
              cols="12"
              sm="4"
            >
              <v-card
                class="editorial-card pa-6 text-center cursor-pointer h-100 transition-all"
                :class="{ 'card-selected': tripType === t.value }"
                elevation="0"
                @click="tripType = t.value"
              >
                <div
                  class="category-icon-box mx-auto mb-4"
                  :style="{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    backgroundColor: tripType === t.value ? '#173F35' : '#F5EDE0'
                  }"
                >
                  <v-icon
                    size="32"
                    :color="tripType === t.value ? '#FAF8F2' : '#173F35'"
                  >
                    {{ t.icon }}
                  </v-icon>
                </div>
                <h3 class="text-h6 font-weight-bold text-forest mb-1">
                  {{ t.label }}
                </h3>
                <p class="text-caption text-secondary-editorial mb-0">
                  {{ t.value === 'SOLO' ? 'Immersive, independent exploration' : t.value === 'FRIENDS' ? 'Active social adventures and excursions' : 'Comfortable pacing and multigenerational sites' }}
                </p>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- ================= STEP 4: ACTIVITIES & PREFERENCES ================= -->
        <div v-else-if="step === 4" class="step-content">
          <div class="text-center mb-8">
            <div class="editorial-tag text-sand mb-1">STEP 4 OF 4</div>
            <h2 class="text-h4 font-serif font-weight-bold text-forest mb-2">
              {{ $t('tellUsYourInterests') || 'What interests you most?' }}
            </h2>
            <p class="text-secondary-editorial max-w-prose mx-auto">
              Select the experiences, culinary styles, and landmark types you wish to prioritize.
            </p>
          </div>

          <v-row>
            <v-col
              v-for="act in activities"
              :key="act.value"
              cols="12"
              sm="6"
              md="4"
            >
              <v-card
                class="editorial-card pa-4 cursor-pointer d-flex align-center h-100 transition-all"
                :class="{ 'card-selected': selectedActivities.includes(act.value) }"
                elevation="0"
                @click="toggleActivity(act.value)"
              >
                <v-icon
                  size="24"
                  :color="selectedActivities.includes(act.value) ? '#21866B' : '#173F35'"
                  class="mr-3"
                >
                  {{ selectedActivities.includes(act.value) ? 'mdi-checkbox-marked-circle' : 'mdi-checkbox-blank-circle-outline' }}
                </v-icon>
                <span class="font-weight-medium text-forest text-body-2">
                  {{ act.label }}
                </span>
              </v-card>
            </v-col>
          </v-row>

          <div class="text-center mt-10">
            <v-btn
              color="#173F35"
              size="x-large"
              rounded="pill"
              class="btn-editorial-primary font-weight-bold px-10 elevation-3"
              :loading="tripStore.isLoading || isSubmitting"
              @click="submitTrip"
            >
              <v-icon start size="22">mdi-creation</v-icon>
              {{ $t('confirmAndSubmit') || 'Generate My Custom Itinerary' }}
            </v-btn>
            <div class="text-caption text-secondary-editorial mt-3">
              Touriva AI synthesizes verified local sites, opening schedules, and transit times.
            </div>
          </div>
        </div>

        <!-- Stepper Navigation Controls -->
        <v-divider class="my-8 border-subtle"></v-divider>

        <div class="d-flex align-center justify-space-between">
          <v-btn
            v-if="step > 1 && !isSubmitting"
            variant="outlined"
            rounded="pill"
            color="#173F35"
            class="btn-editorial-outline px-6"
            @click="step--"
          >
            <v-icon start size="16">mdi-arrow-left</v-icon>
            {{ $t('previous') || 'Back' }}
          </v-btn>
          <div v-else></div>

          <v-btn
            v-if="step < 4"
            color="#173F35"
            rounded="pill"
            class="btn-editorial-primary px-8 font-weight-bold"
            :disabled="isNextDisabled"
            @click="step++"
          >
            {{ $t('next') || 'Continue' }}
            <v-icon end size="16">mdi-arrow-right</v-icon>
          </v-btn>
        </div>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTripsStore } from '@/stores/trips'
import { useRestaurantsStore } from '@/stores/restaurants'
import { useHotelsStore } from '@/stores/hotels'
import { useSitesStore } from '@/stores/sites'
import { useAuthStore } from '@/stores/auth'
import { useWilayasStore } from '@/stores/wilaya'
import {
  filterLocalDestinations,
  searchNominatimExternal,
  ALGERIAN_DESTINATIONS
} from '@/utils/geocoding'

const router = useRouter()
const tripStore = useTripsStore()
const restaurants = useRestaurantsStore()
const hotels = useHotelsStore()
const sites = useSitesStore()
const auth = useAuthStore()
const wilayaStore = useWilayasStore()

const step = ref(1)
const isSubmitting = ref(false)

const debutDate = ref(null)
const endDate = ref(null)
const pickerOneDate = ref(null)
const pickerTwoDate = ref(null)

const now = new Date()
const today = ref(now.toISOString().split('T')[0])
const currentMonth = ref(now.getMonth())
const currentYear = ref(now.getFullYear())

const nextMonth = ref((now.getMonth() + 1) % 12)
const nextYear = ref(
  now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear()
)

const numberOfDays = computed(() => {
  if (!debutDate.value || !endDate.value) return 0
  const start = new Date(debutDate.value)
  const end = new Date(endDate.value)
  if (end <= start) return 0
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

const highlightedDates = computed(() => {
  if (!debutDate.value || !endDate.value) {
    return debutDate.value ? [debutDate.value] : []
  }
  const dates = []
  const start = new Date(debutDate.value)
  const end = new Date(endDate.value)
  const actualStart = start < end ? start : end
  const actualEnd = start < end ? end : start
  for (let d = new Date(actualStart); d <= actualEnd; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
})

const selectedDates = computed(() => {
  return debutDate.value && endDate.value && endDate.value > debutDate.value
    ? [debutDate.value, endDate.value]
    : []
})

const items = ref(['Destination', 'Dates', 'Party Type', 'Preferences'])

const selectedState = ref('')
const tripType = ref('')

const trips = [
  { label: 'Solo Trip', value: 'SOLO', icon: 'mdi-account' },
  { label: 'Friends Adventure', value: 'FRIENDS', icon: 'mdi-account-group' },
  { label: 'Family Journey', value: 'FAMILY', icon: 'mdi-account-multiple' }
]

const selectedActivities = ref([])

const activities = [
  { label: 'Must-see Cultural Attractions', value: '1366e1065346f7a8a7105c81378fc5a2' },
  { label: 'Great Food & Culinary Encounters', value: 'bfcd861aa8f74bf6b2091502e6a2c050' },
  { label: 'Hidden Desert Gems & Oases', value: '3357cca0e7092e7e4fcd42d9001d7958' },
  { label: 'Guided Expeditions & Hikes', value: '7569fb4bae5e6d0513eb4c4ee3f428e9' },
  { label: 'Historical & Roman Ruins', value: 'cb0a104a22264b1019fdd3fa088f47d2' },
  { label: 'Local Art & Crafts', value: '4dfbcb53b37dd9392568ae020ba1d6b5' },
  { label: 'Traditional Algerian Gastronomy', value: 'f91a11406a71931e93d1e5932ab102fb' },
  { label: 'Family-friendly Heritage Museums', value: 'ecce9b7d8c1950db6c115f54f8d2c26a' },
  { label: 'Artisanal Souks & Markets', value: '2e453480292d139cffc7e37cb15ac30a' },
  { label: 'Outdoor Adventure & 4x4', value: '7cbcefac00b8ca2b54fcb738d1a28760' },
  { label: 'Music & Architectural Walks', value: '4f1e0103a9a182f97b7b8d9d21b4c6be' },
  { label: 'UNESCO World Heritage Exploration', value: '1a86474175f886c1f1a6945d5e19923d' }
]

const user = ref(null)

const isStep1Valid = computed(() => !!selectedState.value)
const isStep2Valid = computed(() => selectedDates.value.length > 1)
const isStep3Valid = computed(() => !!tripType.value)

const isNextDisabled = computed(() => {
  if (step.value === 1) return !isStep1Valid.value
  if (step.value === 2) return !isStep2Valid.value
  if (step.value === 3) return !isStep3Valid.value
  if (step.value === 4) return true
  return false
})

const getDayProps = (date) => {
  const d = new Date(date).toISOString().split('T')[0]
  if (d === debutDate.value) return { class: 'range-start' }
  if (d === endDate.value) return { class: 'range-end' }
  if (highlightedDates.value.includes(d)) return { class: 'range-middle' }
  return {}
}

const toggleActivity = (val) => {
  const idx = selectedActivities.value.indexOf(val)
  if (idx > -1) {
    selectedActivities.value.splice(idx, 1)
  } else {
    selectedActivities.value.push(val)
  }
}

const submitTrip = async () => {
  isSubmitting.value = true
  try {
    await tripStore.generateTripWithAI({
      creator: user.value?._id,
      city: selectedState.value,
      days: numberOfDays.value || 3,
      startDate: debutDate.value,
      endDate: endDate.value,
      budget: 'medium',
      preferences: ['hotels', 'restaurants', 'tourist sites'],
      destination: selectedState.value,
      hotels: (hotels.normalizeHotelsForIA || []).slice(0, 5),
      restaurants: (restaurants.normalizeRestaurantsForIA || []).slice(0, 5),
      sites: (sites.normalizeSitesForIA || []).slice(0, 5)
    })

    if (tripStore.getCurrentTrip?._id) {
      router.push({
        name: 'TripDetail',
        params: { id: tripStore.getCurrentTrip._id }
      })
    } else {
      router.push('/trips')
    }
  } catch (err) {
    console.error('Trip AI generation error:', err)
  } finally {
    isSubmitting.value = false
  }
}

const citySearchQuery = ref('')
const isSearchingCity = ref(false)
const citySuggestions = ref(filterLocalDestinations(''))

// Instant local filtering while typing (100% compliant with OSM Nominatim Acceptable Use Policy: ZERO network requests)
watch(citySearchQuery, (val) => {
  if (val && val !== selectedState.value) {
    citySuggestions.value = filterLocalDestinations(val)
  } else if (!val) {
    citySuggestions.value = filterLocalDestinations('')
  }
})

// Explicit external search triggered strictly upon user demand (Enter key or search icon click)
const triggerExplicitExternalSearch = async () => {
  const query = (citySearchQuery.value || selectedState.value || '').trim()
  if (!query || query.length < 2) return

  isSearchingCity.value = true
  try {
    const externalResults = await searchNominatimExternal(query)
    if (externalResults && externalResults.length > 0) {
      // Merge results with local suggestions, prioritizing external match at the top
      const combined = [...citySuggestions.value]
      for (const ext of externalResults) {
        const duplicate = combined.some(
          c => Math.abs(c.lat - ext.lat) < 0.05 && Math.abs(c.lng - ext.lng) < 0.05
        )
        if (!duplicate) {
          combined.unshift(ext)
        }
      }
      citySuggestions.value = combined
    }
  } catch (err) {
    console.warn('Explicit Nominatim destination search error:', err)
  } finally {
    isSearchingCity.value = false
  }
}

const onDestinationSelected = (val) => {
  if (!val) {
    selectedState.value = ''
    return
  }

  let chosen = null
  if (typeof val === 'object' && val.name) {
    selectedState.value = val.name
    chosen = val
  } else if (typeof val === 'string') {
    selectedState.value = val
    chosen = ALGERIAN_DESTINATIONS.find(
      d => d.name.toLowerCase() === val.toLowerCase()
    )
  }

  if (chosen && chosen.lat && chosen.lng) {
    restaurants.fetchRestaurants(chosen.lat, chosen.lng)
    hotels.fetchHotels(chosen.lat, chosen.lng)
    sites.fetchSites(chosen.lat, chosen.lng)
  }
}

const popularCities = [
  { name: 'Algiers', lat: 36.7538, lng: 3.0588 },
  { name: 'Oran', lat: 35.6971, lng: -0.6308 },
  { name: 'Constantine', lat: 36.3650, lng: 6.6147 },
  { name: 'Djanet', lat: 24.5533, lng: 9.4853 },
  { name: 'Taghit', lat: 30.9167, lng: -2.0333 },
  { name: 'Ghardaïa', lat: 32.4833, lng: 3.6667 }
]

const selectCity = (c) => {
  selectedState.value = c.name
  restaurants.fetchRestaurants(c.lat, c.lng)
  hotels.fetchHotels(c.lat, c.lng)
  sites.fetchSites(c.lat, c.lng)
}

const handlePickerOneSelection = (date) => {
  if (!date) return
  if (debutDate.value && endDate.value) {
    debutDate.value = date
    endDate.value = null
  } else if (!debutDate.value) {
    debutDate.value = date
  } else if (date > debutDate.value) {
    endDate.value = date
  } else if (date < debutDate.value) {
    endDate.value = debutDate.value
    debutDate.value = date
  }
  pickerOneDate.value = null
}

const handlePickerTwoSelection = (date) => {
  if (!date) return
  if (debutDate.value && endDate.value) {
    debutDate.value = date
    endDate.value = null
  } else if (!debutDate.value) {
    debutDate.value = date
  } else if (date > debutDate.value) {
    endDate.value = date
  } else if (date < debutDate.value) {
    endDate.value = debutDate.value
    debutDate.value = date
  }
  pickerTwoDate.value = null
}

onMounted(async () => {
  const ls = await auth.getLSUserInfo()
  user.value = ls?.user
  wilayaStore.fetchWilayas()
})
</script>

<style scoped>
.editorial-trip-builder {
  min-height: 100vh;
}

.max-w-container {
  max-width: 1100px;
}

.max-w-content {
  max-width: 720px;
}

.max-w-prose {
  max-width: 580px;
}

.catalog-hero {
  background: #FFFFFF;
}

.border-subtle {
  border-color: #E7E8E1 !important;
}

.cursor-pointer {
  cursor: pointer;
}

/* Stepper Indicator */
.stepper-indicator-bar {
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-node {
  display: flex;
  align-items: center;
}

.step-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #FFFFFF;
  border: 2px solid #E7E8E1;
  color: #69736E;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  transition: all 0.25s ease;
}

.step-active .step-circle {
  background: #173F35;
  border-color: #173F35;
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(23, 63, 53, 0.25);
}

.step-completed .step-circle {
  background: #21866B;
  border-color: #21866B;
  color: #FFFFFF;
  cursor: pointer;
}

.step-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #69736E;
  letter-spacing: 0.02em;
}

.step-active .step-label {
  color: #173F35;
  font-weight: 700;
}

.step-connector {
  width: 32px;
  height: 2px;
  background-color: #E7E8E1;
}

.step-completed .step-connector {
  background-color: #21866B;
}

/* Card Selection Highlights */
.card-selected {
  border-color: #173F35 !important;
  background-color: #FAF8F2 !important;
  box-shadow: 0 8px 24px -4px rgba(23, 63, 53, 0.15) !important;
}

.category-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.transition-all {
  transition: all 0.25s ease;
}

/* Date Picker Range Highlighting */
:deep(.range-start .v-btn),
:deep(.range-end .v-btn) {
  background-color: #173F35 !important;
  color: #FFFFFF !important;
  border-radius: 50% !important;
}

:deep(.range-middle .v-btn) {
  background-color: rgba(217, 185, 140, 0.35) !important;
  color: #102D27 !important;
  border-radius: 0 !important;
}
</style>