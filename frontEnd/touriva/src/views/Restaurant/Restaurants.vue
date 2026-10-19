<template>
  <div class="editorial-catalog bg-warm-ivory min-vh-100">
    <!-- Header Banner -->
    <div class="catalog-hero py-10 px-4 border-b border-subtle">
      <v-container class="max-w-container">
        <div class="d-flex flex-column flex-md-row justify-space-between align-start align-md-center">
          <div>
            <div class="editorial-tag mb-1">{{ $t('Gastronomy') || 'DINING & CULINARY TRADITIONS' }}</div>
            <h1 class="text-h3 font-serif font-weight-bold text-forest mb-2">
              {{ $t('Restaurants') || 'Dining & Gastronomy' }}
            </h1>
            <p class="text-secondary-editorial mb-0 max-w-prose">
              Savor authentic Algerian hospitality, time-honored Berber recipes, Ottoman-era street flavors, and Mediterranean seafood.
            </p>
          </div>

          <!-- Add Restaurant Dialog (for Authorized Users) -->
          <div class="mt-4 mt-md-0 d-flex align-center ga-3">
            <PlaceDialog 
              type="restaurant" 
              v-if="isAgency || isGuide || isAssociation"
            />
            <v-chip class="editorial-chip px-3 py-1 font-weight-bold">
              <v-icon start size="16">mdi-silverware-fork-knife</v-icon>
              {{ filteredRestaurants.length }} {{ $t('Eateries') || 'Eateries' }}
            </v-chip>
          </div>
        </div>

        <!-- Search Bar and Regional Filter Chips -->
        <div class="mt-6">
          <v-row dense align="center">
            <v-col cols="12" md="5">
              <v-text-field
                v-model="searchQuery"
                :placeholder="$t('SearchRestaurants') || 'Search restaurants by name or city...'"
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
              <span class="text-caption font-weight-bold text-forest mr-1">REGIONS:</span>
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
                Clear Region
              </v-chip>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </div>

    <!-- Main Restaurants Grid -->
    <v-container class="max-w-container py-8">
      <!-- LOADING SKELETONS -->
      <v-row v-if="restaurantsStore.isLoading">
        <v-col v-for="n in 6" :key="n" cols="12" sm="6" md="4">
          <v-card class="editorial-card pa-4">
            <v-skeleton-loader type="image, heading, text, button" height="340" />
          </v-card>
        </v-col>
      </v-row>

      <!-- EMPTY STATE -->
      <v-card
        v-else-if="!filteredRestaurants.length"
        class="editorial-card pa-12 text-center my-6"
        elevation="0"
      >
        <v-icon size="56" color="#D9B98C" class="mb-4">mdi-silverware-clean</v-icon>
        <h3 class="text-h5 font-serif font-weight-bold text-forest mb-2">
          No Restaurants Found
        </h3>
        <p class="text-secondary-editorial max-w-prose mx-auto mb-6">
          We could not find any culinary listings matching your current search. Try resetting your query or exploring other cities.
        </p>
        <v-btn
          color="#173F35"
          class="btn-editorial-primary px-6"
          rounded="pill"
          @click="resetSearch"
        >
          View All Restaurants
        </v-btn>
      </v-card>

      <!-- RESTAURANTS GRID -->
      <v-row v-else>
        <v-col
          v-for="resto in filteredRestaurants"
          :key="resto._id || resto.name"
          cols="12"
          sm="6"
          md="4"
        >
          <RestaurantCard :restaurant="resto" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useRestaurantsStore } from '@/stores/restaurants'
import { useAuthStore } from '@/stores/auth'
import RestaurantCard from '@/components/RestaurantCard.vue'
import PlaceDialog from '@/components/DialogAdd.vue'

const route = useRoute()
const restaurantsStore = useRestaurantsStore()
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
    restaurantsStore.fetchCatalogRestaurants()
  } else {
    selectedCity.value = c.name
    restaurantsStore.fetchRestaurants(c.lat, c.lng)
  }
}

const clearCity = () => {
  selectedCity.value = ''
  restaurantsStore.fetchCatalogRestaurants()
}

const resetSearch = () => {
  searchQuery.value = ''
  selectedCity.value = ''
  restaurantsStore.fetchCatalogRestaurants()
}

const filteredRestaurants = computed(() => {
  const query = (searchQuery.value || '').toLowerCase().trim()
  return (restaurantsStore.getRestaurants || []).filter(r => {
    if (!query) return true
    const name = (r.displayName?.text || r.name || '').toLowerCase()
    const addr = (r.formattedAddress || r.address || '').toLowerCase()
    const desc = (r.description || '').toLowerCase()
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

  restaurantsStore.fetchCatalogRestaurants()
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