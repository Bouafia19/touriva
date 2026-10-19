<template>
  <div class="editorial-catalog bg-warm-ivory min-vh-100">
    <!-- Header Banner -->
    <div class="catalog-hero py-10 px-4 border-b border-subtle">
      <v-container class="max-w-container">
        <div class="d-flex flex-column flex-md-row justify-space-between align-start align-md-center">
          <div>
            <div class="editorial-tag mb-1">{{ $t('CuratedJourneys') || 'EXPEDITIONS & ITINERARIES' }}</div>
            <h1 class="text-h3 font-serif font-weight-bold text-forest mb-2">
              {{ $t('Trips') || 'Guided Excursions' }}
            </h1>
            <p class="text-secondary-editorial mb-0 max-w-prose">
              Discover expertly planned, multi-day journeys and guided day trips led by certified Algerian tourism professionals.
            </p>
          </div>

          <!-- Quick Action / Count -->
          <div class="mt-4 mt-md-0 d-flex align-center ga-3">
            <v-chip class="editorial-chip px-3 py-1 font-weight-bold" size="default">
              <v-icon start size="16">mdi-compass</v-icon>
              {{ filteredTrips.length }} {{ $t('AvailableTrips') || 'Journeys Available' }}
            </v-chip>

            <!-- Mobile Filter Trigger -->
            <v-btn
              class="d-md-none"
              variant="outlined"
              color="#173F35"
              rounded="pill"
              @click="mobileFilterDrawer = true"
            >
              <v-icon start>mdi-filter-variant</v-icon>
              {{ $t('filters') || 'Filters' }}
            </v-btn>
          </div>
        </div>
      </v-container>
    </div>

    <!-- Main Content & Filter Area -->
    <v-container class="max-w-container py-8">
      <v-row>
        <!-- LEFT FILTER SIDEBAR (DESKTOP) -->
        <v-col cols="12" md="3" class="d-none d-md-block">
          <v-card class="editorial-card pa-5 sticky-filter" elevation="0">
            <div class="d-flex justify-space-between align-center mb-4">
              <h3 class="text-h6 font-weight-bold text-forest ma-0">
                <v-icon size="20" color="#21866B" class="mr-1">mdi-filter-outline</v-icon>
                {{ $t('filters') || 'Refine Search' }}
              </h3>
              <v-btn
                variant="text"
                size="small"
                color="error"
                class="font-weight-bold px-1"
                @click="resetFilters"
              >
                {{ $t('resetFilters') || 'Clear All' }}
              </v-btn>
            </div>

            <!-- Search Keyword -->
            <div class="mb-5">
              <div class="text-caption font-weight-bold text-forest mb-2">{{ $t('keywords') || 'MOTS-CLÉS' }}</div>
              <v-text-field
                v-model="searchKeyword"
                :placeholder="$t('SearchPlaceholder') || 'Rechercher un voyage ou un guide...'"
                density="compact"
                variant="outlined"
                prepend-inner-icon="mdi-magnify"
                rounded="lg"
                hide-details
                color="#173F35"
              />
            </div>

            <!-- City / Destination Filter -->
            <div class="mb-5" v-if="cities.length">
              <div class="text-caption font-weight-bold text-forest mb-2">{{ $t('Destinations') || 'DESTINATIONS' }}</div>
              <v-select
                v-model="selectedCities"
                :items="cities"
                :label="$t('AllDestinations') || 'Toutes les destinations'"
                multiple
                clearable
                chips
                closable-chips
                variant="outlined"
                density="compact"
                rounded="lg"
                hide-details
                color="#173F35"
              />
            </div>

            <!-- Price Range Filter -->
            <div class="mb-5">
              <div class="d-flex justify-space-between align-center mb-2">
                <div class="text-caption font-weight-bold text-forest">{{ $t('priceRange') || 'FOURCHETTE DE PRIX' }}</div>
                <div class="text-caption font-weight-bold text-emerald">
                  {{ formatPrice(priceRange[0]) }} – {{ formatPrice(priceRange[1]) }}
                </div>
              </div>

              <v-range-slider
                v-model="priceRange"
                :min="minPrice"
                :max="maxPrice"
                step="500"
                color="#173F35"
                track-color="#E7E8E1"
                thumb-color="#21866B"
                hide-details
              />
            </div>

            <!-- Sort By -->
            <div>
              <div class="text-caption font-weight-bold text-forest mb-2">{{ $t('sortBy') || 'TRIER PAR' }}</div>
              <v-select
                v-model="sortBy"
                :items="sortOptions"
                item-title="title"
                item-value="value"
                variant="outlined"
                density="compact"
                rounded="lg"
                hide-details
                color="#173F35"
              />
            </div>
          </v-card>
        </v-col>

        <!-- RIGHT TRIPS GRID -->
        <v-col cols="12" md="9">
          <!-- LOADING SKELETONS -->
          <v-row v-if="tripStore.isLoading">
            <v-col v-for="n in 6" :key="n" cols="12" sm="6" md="4">
              <v-card class="editorial-card pa-4">
                <v-skeleton-loader type="image, heading, text, button" height="340" />
              </v-card>
            </v-col>
          </v-row>

          <!-- EMPTY STATE WITH RECOVERY -->
          <v-card
            v-else-if="!filteredTrips.length"
            class="editorial-card pa-12 text-center my-6"
            elevation="0"
          >
            <v-icon size="56" color="#D9B98C" class="mb-4">mdi-map-search-outline</v-icon>
            <h3 class="text-h5 font-serif font-weight-bold text-forest mb-2">
              No Excursions Match Your Filters
            </h3>
            <p class="text-secondary-editorial max-w-prose mx-auto mb-6">
              We couldn't find any trips matching your current filter criteria. Try expanding your price range or clearing destination filters.
            </p>
            <v-btn
              color="#173F35"
              class="btn-editorial-primary px-6"
              rounded="pill"
              @click="resetFilters"
            >
              Reset All Filters
            </v-btn>
          </v-card>

          <!-- TRIPS GRID USING REDESIGNED TripCard -->
          <v-row v-else>
            <v-col
              v-for="trip in filteredTrips"
              :key="trip._id"
              cols="12"
              sm="6"
              md="4"
            >
              <TripCard :trip="trip" />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>

    <!-- MOBILE FILTERS DRAWER -->
    <v-navigation-drawer
      v-if="mobileFilterDrawer"
      v-model="mobileFilterDrawer"
      location="bottom"
      temporary
      height="80vh"
      class="pa-4 bg-white rounded-t-xl"
    >
      <div class="d-flex justify-space-between align-center mb-4">
        <h3 class="text-h6 font-weight-bold text-forest ma-0">Filter Journeys</h3>
        <v-btn icon="mdi-close" variant="text" size="small" @click="mobileFilterDrawer = false" />
      </div>

      <div class="mb-4">
        <v-text-field
          v-model="searchKeyword"
          placeholder="Keyword search..."
          variant="outlined"
          density="compact"
          rounded="lg"
          hide-details
        />
      </div>

      <div class="mb-4" v-if="cities.length">
        <v-select
          v-model="selectedCities"
          :items="cities"
          label="Destinations"
          multiple
          chips
          variant="outlined"
          density="compact"
          rounded="lg"
          hide-details
        />
      </div>

      <div class="mb-4">
        <div class="text-caption font-weight-bold mb-1">
          Price Range: {{ formatPrice(priceRange[0]) }} – {{ formatPrice(priceRange[1]) }}
        </div>
        <v-range-slider
          v-model="priceRange"
          :min="minPrice"
          :max="maxPrice"
          step="500"
          color="#173F35"
          hide-details
        />
      </div>

      <div class="d-flex ga-2 mt-6">
        <v-btn variant="outlined" color="error" class="flex-grow-1" rounded="pill" @click="resetFilters">
          Reset
        </v-btn>
        <v-btn color="#173F35" class="btn-editorial-primary flex-grow-1" rounded="pill" @click="mobileFilterDrawer = false">
          Show ({{ filteredTrips.length }})
        </v-btn>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTripsStore } from '@/stores/trips'
import TripCard from '@/components/TripCard.vue'

const { t } = useI18n()
const route = useRoute()
const tripStore = useTripsStore()

const mobileFilterDrawer = ref(false)
const searchKeyword = ref('')
const selectedCities = ref([])
const priceRange = ref([0, 100000])
const sortBy = ref('default')

const sortOptions = computed(() => [
  { title: t('FeaturedAndPopular') || 'Featured & Popular', value: 'default' },
  { title: t('PriceLowToHigh') || 'Price: Low to High', value: 'price_asc' },
  { title: t('PriceHighToLow') || 'Price: High to Low', value: 'price_desc' },
  { title: t('DurationLongestFirst') || 'Duration: Longest First', value: 'duration_desc' }
])

// Extract unique cities
const cities = computed(() => {
  const allCities = (tripStore.getTrips || [])
    .map(t => t.destination?.name || t.destination || t.wilaya?.name)
    .filter(Boolean)
  return [...new Set(allCities)]
})

const minPrice = computed(() => {
  if (!tripStore.getTrips?.length) return 0
  const prices = tripStore.getTrips.map(t => Number(t.price) || 0).filter(p => p > 0)
  return prices.length ? Math.min(...prices) : 0
})

const maxPrice = computed(() => {
  if (!tripStore.getTrips?.length) return 100000
  const prices = tripStore.getTrips.map(t => Number(t.price) || 0)
  return prices.length ? Math.max(...prices) : 100000
})

watch([minPrice, maxPrice], ([newMin, newMax]) => {
  if (newMin !== null && newMax !== null && newMax > newMin) {
    priceRange.value = [newMin, newMax]
  }
}, { immediate: true })

// Filter and sort trips
const filteredTrips = computed(() => {
  let list = (tripStore.getTrips || []).filter(trip => {
    // City filter
    const destName = trip.destination?.name || trip.destination || trip.wilaya?.name || ''
    const matchesCity = !selectedCities.value.length || selectedCities.value.includes(destName)

    // Price filter
    const price = Number(trip.price) || 0
    const matchesPrice = price >= priceRange.value[0] && price <= priceRange.value[1]

    // Keyword filter
    const title = (trip.name || trip.title || '').toLowerCase()
    const guide = (trip.creator?.firstName || '').toLowerCase()
    const desc = (trip.description || '').toLowerCase()
    const q = searchKeyword.value.toLowerCase()
    const matchesKeyword = !q || title.includes(q) || guide.includes(q) || desc.includes(q) || destName.toLowerCase().includes(q)

    return matchesCity && matchesPrice && matchesKeyword
  })

  // Sort logic
  if (sortBy.value === 'price_asc') {
    list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))
  } else if (sortBy.value === 'price_desc') {
    list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
  } else if (sortBy.value === 'duration_desc') {
    list.sort((a, b) => (b.days?.length || 0) - (a.days?.length || 0))
  }

  return list
})

const resetFilters = () => {
  selectedCities.value = []
  searchKeyword.value = ''
  sortBy.value = 'default'
  priceRange.value = [minPrice.value, maxPrice.value]
}

const formatPrice = (price) => {
  if (!price && price !== 0) return ''
  return new Intl.NumberFormat('fr-FR').format(price) + ' DZD'
}

onMounted(() => {
  tripStore.fetchTrips()

  // Handle route query if directed from homepage search
  if (route.query.q) {
    searchKeyword.value = String(route.query.q)
  }
  if (route.query.destination) {
    selectedCities.value = [String(route.query.destination)]
  }
})
</script>

<style scoped>
.editorial-catalog {
  min-height: 100vh;
}

.max-w-container {
  max-width: 1360px;
}

.max-w-prose {
  max-width: 620px;
}

.catalog-hero {
  background: #FFFFFF;
}

.sticky-filter {
  position: sticky;
  top: 100px;
}

.border-subtle {
  border-color: #E7E8E1 !important;
}
</style>