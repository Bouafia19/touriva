<template>
  <v-container 
    fluid 
    :class="[platform === 'web' ? 'px-0 main-container' : '']"
  >
    <h1 
        class="d-flex justify-start py-2"
    >
        {{ $t('Trips') }}
    </h1>

    <v-row>
      <!-- LEFT FILTER SIDEBAR (ONLY WHEN TRIPS EXIST) -->
      <v-col
        cols="12"
        md="3"
        v-if="!tripStore.isLoading && filteredTrips.length"
      >
        <v-card class="pa-4 sticky-filter" elevation="1">
          <h3 class="mb-4">{{ $t('filters') }}</h3>

          <v-select
            v-model="selectedCities"
            :items="cities"
            :label="$t('cities')"
            multiple
            clearable
            chips
            variant="outlined"
            density="compact"
          />

          <div class="mt-6">
            <div class="text-subtitle-2 mb-2">
              {{ $t('priceRange') }}
            </div>

            <v-range-slider
              v-model="priceRange"
              :min="minPrice"
              :max="maxPrice"
              step="500"
              thumb-label
            >
              <template #thumb-label="{ value }">
                {{ formatPrice(value) }}
              </template>
            </v-range-slider>

            <div class="d-flex justify-space-between text-caption">
              <span>{{ formatPrice(priceRange[0]) }}</span>
              <span>{{ formatPrice(priceRange[1]) }}</span>
            </div>
          </div>

          <v-btn
            variant="text"
            class="mt-4"
            color="red"
            @click="resetFilters"
          >
            {{ $t('resetFilters') }}
          </v-btn>
        </v-card>
      </v-col>

      <!-- RIGHT CONTENT -->
      <v-col
        :cols="12"
        :md="filteredTrips.length ? 9 : 12"
      >

        <!-- LOADING SKELETON -->
        <v-row v-if="tripStore.isLoading">
          <v-col
            v-for="n in 6"
            :key="n"
            cols="12"
            sm="6"
            md="4"
          >
            <v-card class="mx-2">
              <v-skeleton-loader
                type="image, heading, subtitle, chip"
                boilerplate
              />
            </v-card>
          </v-col>
        </v-row>

        <!-- EMPTY STATE (AFTER LOAD) -->
        <v-alert
          v-else-if="!filteredTrips.length"
          type="info"
          variant="tonal"
          border="start"
          prominent
          class="ma-4"
        >
          <div class="text-h6 mb-2">
            {{ $t('noTripsTitle') }}
          </div>
          <div>
            {{ $t('noTripsDescription') }}
          </div>
        </v-alert>

        <!-- TRIPS GRID -->
        <v-row v-else>
          <v-col
            v-for="trip in filteredTrips"
            :key="trip._id"
            cols="12"
            sm="6"
            md="4"
          >
            <v-card class="hoverable mx-2" @click="goToTrip(trip)">
              <v-img :src="trip.image || defaultImage" height="200" cover />
              <v-card-title>{{ trip.name }}</v-card-title>
              <v-card-subtitle>
                By {{ trip.creator?.firstName }} {{ trip.creator?.lastName }}
              </v-card-subtitle>
              <v-card-text class="d-flex justify-space-between align-center">
                <span>{{ trip.days.length }} {{ $t('days') }}</span>
                <v-rating 
                  v-model="trip.rating" 
                  readonly 
                  color="amber" 
                  size="x-small"
                />
              </v-card-text>
              <div class="px-4 mb-2" v-if="trip.price">
                <v-chip class="text-red font-weight-bold">
                  {{ formatPrice(trip.price) }}
                </v-chip>
              </div>
            </v-card>
          </v-col>
        </v-row>

      </v-col>

    </v-row>
  </v-container>
</template>
  
<script setup>
  import { Capacitor } from '@capacitor/core'
  import { ref, onMounted, computed, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useTripsStore } from '@/stores/trips'

  const tripStore = useTripsStore()

  const router = useRouter()

  const platform = ref(null)
  const selectedCities = ref([])
  const priceRange = ref([0, 50000])

  // const minPrice = 0
  // const maxPrice = 50000

// Extract cities dynamically from trips
const cities = computed(() => {
  const allCities = tripStore.getTrips.map(t => t.destination?.name).filter(Boolean)
  return [...new Set(allCities)]
})

const minPrice = computed(() => {
  if (!tripStore.getTrips.length) return 0
  return Math.min(
    ...tripStore.getTrips.map(t => Number(t.price) || 0)
  )
})

const maxPrice = computed(() => {
  if (!tripStore.getTrips.length) return 0
  return Math.max(
    ...tripStore.getTrips.map(t => Number(t.price) || 0)
  )
})

// watch(
//   () => tripStore.getTrips,
//   (trips) => {
//     if (trips.length) {
//       priceRange.value = [minPrice.value, maxPrice.value]
//     }
//   },
//   { immediate: true }
// )

watch(
  () => [minPrice.value, maxPrice.value],
  ([newMin, newMax]) => {
    if (newMin !== null && newMax !== null) {
      priceRange.value = [newMin, newMax]
    }
  },
  { immediate: true }
)

// Filtered trips
const filteredTrips = computed(() => {
  return tripStore.getTrips.filter(trip => {
    const matchesCity =
      !selectedCities.value.length ||
      selectedCities.value.includes(trip.destination?.name)

    const price = Number(trip.price) || 0
    const matchesPrice =
      price >= priceRange.value[0] &&
      price <= priceRange.value[1]

    return matchesCity && matchesPrice
  })
})

  const resetFilters = () => {
    selectedCities.value = []
    priceRange.value = [minPrice.value, maxPrice.value]
  }
  
  const formatPrice = (price) => {
    if (!price) return ''
    return new Intl.NumberFormat('fr-FR').format(price) + ' DA'
  }

  function goToTrip(trip) {
    tripStore.setTrip(trip)
      router.push({
        name: 'TripSubscription',
        params: { id: trip._id }
      })
  }

  onMounted(async() => {
    tripStore.fetchTrips()
    platform.value = Capacitor.getPlatform()
  })
</script>

<style scoped>
  .sticky-filter {
    position: sticky;
    top: 90px;
  }


    .main-container {
        max-width: 1200px;
        margin-left: auto;
        margin-right: auto;
    }

    .break-word {
        word-break: break-word;
        overflow-wrap: break-word;
        white-space: normal;
    }

    .hover-elevate:hover {
        transform: translateY(-4px);
        transition: 0.2s;
        box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.15);
    }

    .cursor-pointer {
        cursor: pointer;
    }

    .hover-scale {
        transition: transform 0.25s ease, box-shadow 0.25s ease;
    }

    .hover-scale:hover {
        transform: translateY(-4px) scale(1.02);
        box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
    }

    .image-wrapper {
  width: 100%;
}

.image-placeholder {
  height: 200px;
  border: 2px dashed #bdbdbd;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  color: #9e9e9e;
}

.placeholder-text {
  margin-top: 8px;
  font-size: 14px;
}


</style>
  