<template>
  <div class="editorial-catalog bg-warm-ivory min-vh-100">
    <!-- Header Banner -->
    <div class="catalog-hero py-10 px-4 border-b border-subtle">
      <v-container class="max-w-container">
        <div class="d-flex flex-column flex-md-row justify-space-between align-start align-md-center">
          <div>
            <div class="editorial-tag mb-1">{{ $t('Stays') || 'HOSPITALITY & LODGING' }}</div>
            <h1 class="text-h3 font-serif font-weight-bold text-forest mb-2">
              {{ $t('Hotels') || 'Accommodations & Resorts' }}
            </h1>
            <p class="text-secondary-editorial mb-0 max-w-prose">
              Discover boutique kasbahs, Mediterranean coastal resorts, and luxury desert camps curated for discerning travelers.
            </p>
          </div>

          <!-- Add Hotel Dialog (for Authorized Users) -->
          <div class="mt-4 mt-md-0 d-flex align-center ga-3">
            <PlaceDialog 
              type="hotel" 
              v-if="isAgency || isGuide || isAssociation"
            />
            <v-chip class="editorial-chip px-3 py-1 font-weight-bold">
              <v-icon start size="16">mdi-bed-outline</v-icon>
              {{ filteredHotels.length }} {{ $t('Properties') || 'Properties' }}
            </v-chip>
          </div>
        </div>

        <!-- Search Bar and Regional Filter Chips -->
        <div class="mt-6">
          <v-row dense align="center">
            <v-col cols="12" md="5">
              <v-text-field
                v-model="searchQuery"
                :placeholder="$t('SearchHotels') || 'Search accommodations by name or city...'"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="comfortable"
                rounded="pill"
                hide-details
                color="#173F35"
                class="bg-white"
                clearable
              />
            </v-col>

            <v-col cols="12" md="7" class="d-flex align-center flex-wrap ga-2 mt-2 mt-md-0">
              <span class="text-caption font-weight-bold text-forest mr-1">DESTINATIONS:</span>
              <v-chip
                v-for="c in popularCities"
                :key="c.name"
                :color="selectedCity === c.name ? '#173F35' : 'default'"
                :variant="selectedCity === c.name ? 'flat' : 'outlined'"
                class="cursor-pointer font-weight-medium"
                size="small"
                @click="toggleCity(c)"
              >
                {{ c.name }}
              </v-chip>
              <v-chip
                v-if="selectedCity"
                color="error"
                variant="text"
                size="small"
                @click="clearCity"
              >
                Clear Destination
              </v-chip>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </div>

    <!-- Main Hotels Grid -->
    <v-container class="max-w-container py-8">
      <!-- LOADING SKELETONS -->
      <v-row v-if="hotelsStore.isLoading">
        <v-col v-for="n in 6" :key="n" cols="12" sm="6" md="4">
          <v-card class="editorial-card pa-4">
            <v-skeleton-loader type="image, heading, text, button" height="340" />
          </v-card>
        </v-col>
      </v-row>

      <!-- EMPTY STATE -->
      <v-card
        v-else-if="!filteredHotels.length"
        class="editorial-card pa-12 text-center my-6"
        elevation="0"
      >
        <v-icon size="56" color="#D9B98C" class="mb-4">mdi-bed-empty</v-icon>
        <h3 class="text-h5 font-serif font-weight-bold text-forest mb-2">
          No Accommodations Found
        </h3>
        <p class="text-secondary-editorial max-w-prose mx-auto mb-6">
          We could not find any hotel listings matching your current search. Try resetting your query or exploring other destinations.
        </p>
        <v-btn
          color="#173F35"
          class="btn-editorial-primary px-6"
          rounded="pill"
          @click="resetSearch"
        >
          View All Hotels
        </v-btn>
      </v-card>

      <!-- HOTELS GRID -->
      <v-row v-else>
        <v-col
          v-for="hotel in filteredHotels"
          :key="hotel._id || hotel.name"
          cols="12"
          sm="6"
          md="4"
        >
          <HotelCard :hotel="hotel" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useHotelsStore } from '@/stores/hotels'
import { useAuthStore } from '@/stores/auth'
import HotelCard from '@/components/HotelCard.vue'
import PlaceDialog from '@/components/DialogAdd.vue'

const route = useRoute()
const hotelsStore = useHotelsStore()
const auth = useAuthStore()

const searchQuery = ref('')
const selectedCity = ref('')
const typeAccount = ref('')

const popularCities = [
  { name: 'Algiers', lat: 36.7538, lng: 3.0588 },
  { name: 'Oran', lat: 35.6971, lng: -0.6308 },
  { name: 'Constantine', lat: 36.3650, lng: 6.6147 },
  { name: 'Annaba', lat: 36.9040, lng: 7.7550 },
  { name: 'Djanet', lat: 24.5533, lng: 9.4853 },
  { name: 'Taghit', lat: 30.9167, lng: -2.0333 },
  { name: 'Ghardaïa', lat: 32.4833, lng: 3.6667 }
]

const isAgency = computed(() => typeAccount.value === 'touristAgencies')
const isGuide = computed(() => typeAccount.value === 'touristGuide')
const isAssociation = computed(() => typeAccount.value === 'associations')

const toggleCity = (c) => {
  if (selectedCity.value === c.name) {
    selectedCity.value = ''
    hotelsStore.fetchCatalogHotels()
  } else {
    selectedCity.value = c.name
    hotelsStore.fetchHotels(c.lat, c.lng)
  }
}

const clearCity = () => {
  selectedCity.value = ''
  hotelsStore.fetchCatalogHotels()
}

const resetSearch = () => {
  searchQuery.value = ''
  selectedCity.value = ''
  hotelsStore.fetchCatalogHotels()
}

const filteredHotels = computed(() => {
  const query = (searchQuery.value || '').toLowerCase().trim()
  return (hotelsStore.getHotels || []).filter(h => {
    if (!query) return true
    const name = (h.displayName?.text || h.name || '').toLowerCase()
    const addr = (h.formattedAddress || h.address || '').toLowerCase()
    const desc = (h.description || '').toLowerCase()
    return name.includes(query) || addr.includes(query) || desc.includes(query)
  })
})

onMounted(async () => {
  const ls = await auth.getLSUserInfo()
  if (ls?.user) {
    typeAccount.value = ls.user.typeAccount
  }

  if (route.query.q) {
    searchQuery.value = String(route.query.q)
  }

  hotelsStore.fetchCatalogHotels()
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

.border-subtle {
  border-color: #E7E8E1 !important;
}

.cursor-pointer {
  cursor: pointer;
}
</style>