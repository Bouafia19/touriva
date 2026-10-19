<template>
  <div class="editorial-catalog bg-warm-ivory min-vh-100">
    <!-- Header Banner -->
    <div class="catalog-hero py-10 px-4 border-b border-subtle">
      <v-container class="max-w-container">
        <div class="d-flex flex-column flex-md-row justify-space-between align-start align-md-center">
          <div>
            <div class="editorial-tag mb-1">{{ $t('HeritageAttractions') || 'HERITAGE & MONUMENTS' }}</div>
            <h1 class="text-h3 font-serif font-weight-bold text-forest mb-2">
              {{ $t('Sites') || 'Cultural Sites & Landmarks' }}
            </h1>
            <p class="text-secondary-editorial mb-0 max-w-prose">
              Explore national monuments, ancient Roman citadels, Ottoman palaces, and natural UNESCO wonders across Algeria.
            </p>
          </div>

          <!-- Add Site Dialog (for Guides / Agencies / Associations) -->
          <div class="mt-4 mt-md-0 d-flex align-center ga-3">
            <PlaceDialog 
              type="site" 
              v-if="isAgency || isGuide || isAssociation"
            />
            <v-chip class="editorial-chip px-3 py-1 font-weight-bold">
              <v-icon start size="16">mdi-pillar</v-icon>
              {{ filteredSites.length }} {{ $t('Attractions') || 'Landmarks' }}
            </v-chip>
          </div>
        </div>

        <!-- Search Bar and Popular City Filter Chips -->
        <div class="mt-6">
          <v-row dense align="center">
            <v-col cols="12" md="5">
              <v-text-field
                v-model="searchQuery"
                :placeholder="$t('SearchSites') || 'Search attraction by name or location...'"
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

    <!-- Main Sites Grid -->
    <v-container class="max-w-container py-8">
      <!-- LOADING SKELETONS -->
      <v-row v-if="sitesStore.isLoading">
        <v-col v-for="n in 6" :key="n" cols="12" sm="6" md="4">
          <v-card class="editorial-card pa-4">
            <v-skeleton-loader type="image, heading, text, button" height="340" />
          </v-card>
        </v-col>
      </v-row>

      <!-- EMPTY STATE -->
      <v-card
        v-else-if="!filteredSites.length"
        class="editorial-card pa-12 text-center my-6"
        elevation="0"
      >
        <v-icon size="56" color="#D9B98C" class="mb-4">mdi-map-marker-off-outline</v-icon>
        <h3 class="text-h5 font-serif font-weight-bold text-forest mb-2">
          No Cultural Sites Found
        </h3>
        <p class="text-secondary-editorial max-w-prose mx-auto mb-6">
          We could not find any historical sites or attractions matching your search. Try resetting your query or viewing all regions.
        </p>
        <v-btn
          color="#173F35"
          class="btn-editorial-primary px-6"
          rounded="pill"
          @click="resetSearch"
        >
          View All Sites
        </v-btn>
      </v-card>

      <!-- SITES GRID -->
      <v-row v-else>
        <v-col
          v-for="site in paginatedSites"
          :key="site._id || site.name"
          cols="12"
          sm="6"
          md="4"
        >
          <SiteCard :site="site" />
        </v-col>
      </v-row>

      <!-- Pagination Controls -->
      <div v-if="totalPages > 1" class="d-flex justify-center mt-10">
        <v-pagination
          v-model="page"
          :length="totalPages"
          :total-visible="7"
          color="#173F35"
          rounded="circle"
        />
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSitesStore } from '@/stores/sites'
import { useAuthStore } from '@/stores/auth'
import SiteCard from '@/components/SiteCard.vue'
import PlaceDialog from '@/components/DialogAdd.vue'

const route = useRoute()
const sitesStore = useSitesStore()
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
    sitesStore.fetchCatalogSites()
  } else {
    selectedCity.value = c.name
    sitesStore.fetchSites(c.lat, c.lng)
  }
}

const clearCity = () => {
  selectedCity.value = ''
  sitesStore.fetchCatalogSites()
}

const resetSearch = () => {
  searchQuery.value = ''
  selectedCity.value = ''
  page.value = 1
  sitesStore.fetchCatalogSites()
}

const page = ref(1)
const itemsPerPage = ref(12)

const filteredSites = computed(() => {
  const query = (searchQuery.value || '').toLowerCase().trim()
  return (sitesStore.getSites || []).filter(site => {
    if (!query) return true
    const name = (site.displayName?.text || site.name || '').toLowerCase()
    const addr = (site.formattedAddress || site.address || '').toLowerCase()
    const desc = (site.description || '').toLowerCase()
    return name.includes(query) || addr.includes(query) || desc.includes(query)
  })
})

const totalPages = computed(() => {
  return Math.ceil(filteredSites.value.length / itemsPerPage.value)
})

const paginatedSites = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  return filteredSites.value.slice(start, start + itemsPerPage.value)
})

onMounted(async () => {
  const ls = await auth.getLSUserInfo()
  if (ls?.user) {
    typeAccount.value = ls.user.typeAccount
  }
  
  if (route.query.q) {
    searchQuery.value = String(route.query.q)
  }

  // Load catalog sites from backend
  sitesStore.fetchCatalogSites()
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