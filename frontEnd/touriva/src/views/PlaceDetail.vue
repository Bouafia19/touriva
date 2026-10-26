<template>
  <div class="editorial-detail bg-warm-ivory min-vh-100 pb-16">
    <!-- HERO COVER IMAGE -->
    <div class="position-relative detail-hero">
      <v-img
        :src="heroImage"
        height="50vh"
        min-height="380px"
        cover
        class="detail-hero-img"
      >
        <template #placeholder>
          <div class="d-flex fill-height align-center justify-center bg-deep-green">
            <v-progress-circular indeterminate color="#D9B98C" size="40" />
          </div>
        </template>
      </v-img>

      <div class="detail-hero-scrim"></div>

      <!-- Top Back Navigation -->
      <div class="position-absolute top-0 left-0 right-0 pa-4 pa-md-6 z-10">
        <v-container class="max-w-container pa-0">
          <v-btn
            variant="flat"
            color="rgba(16, 45, 39, 0.75)"
            rounded="pill"
            class="text-white text-capitalize backdrop-blur font-weight-medium"
            @click="router.go(-1)"
          >
            <v-icon start size="18">mdi-arrow-left</v-icon>
            {{ $t('Return') || 'Back to Discovery' }}
          </v-btn>
        </v-container>
      </div>

      <!-- Bottom Hero Text -->
      <div class="position-absolute bottom-0 left-0 right-0 pa-6 pa-md-10 text-white z-10">
        <v-container class="max-w-container pa-0">
          <div class="hero-category-chip mb-2">
            <v-icon size="14" color="#D9B98C" class="mr-1">mdi-map-marker-radius</v-icon>
            {{ placeCategory }}
          </div>
          <h1 class="text-h3 font-serif font-weight-bold text-white mb-2">
            {{ placeName }}
          </h1>

          <div class="d-flex align-center flex-wrap ga-4 text-sand-light text-body-2">
            <div class="d-flex align-center">
              <v-icon size="16" color="#D9B98C" class="mr-1">mdi-map-marker</v-icon>
              {{ placeAddress }}
            </div>

            <div v-if="placeRating" class="d-flex align-center">
              <v-icon size="16" color="#D9B98C" class="mr-1">mdi-star</v-icon>
              <span class="font-weight-bold text-white mr-1">{{ placeRating }}</span>
              <span class="text-caption text-sand">({{ placeReviews }} reviews)</span>
            </div>
          </div>
        </v-container>
      </div>
    </div>

    <!-- MAIN BODY CONTENT -->
    <v-container class="max-w-container mt-8">
      <v-row>
        <!-- LEFT COLUMN: ABOUT, DETAILS & GALLERY -->
        <v-col cols="12" md="8">
          <!-- Overview Card -->
          <v-card class="editorial-card pa-6 pa-md-8 mb-6" elevation="0">
            <h2 class="text-h5 font-serif font-weight-bold text-forest mb-4">
              Overview & Cultural Significance
            </h2>
            <p class="text-body-1 text-secondary-editorial line-height-relaxed mb-6">
              {{ placeDescription }}
            </p>

            <v-divider class="my-6 border-subtle"></v-divider>

            <!-- Key Amenities & Information -->
            <h3 class="text-h6 font-weight-bold text-forest mb-4">Information & Location Details</h3>
            <v-row dense>
              <v-col cols="12" sm="6" class="d-flex align-center mb-3">
                <v-icon color="#21866B" class="mr-3" size="22">mdi-map-marker-check</v-icon>
                <div>
                  <div class="text-caption font-weight-bold text-forest">LOCATION</div>
                  <div class="text-body-2 text-secondary-editorial">{{ placeAddress }}</div>
                </div>
              </v-col>
              <v-col cols="12" sm="6" class="d-flex align-center mb-3" v-if="placePhone">
                <v-icon color="#21866B" class="mr-3" size="22">mdi-phone</v-icon>
                <div>
                  <div class="text-caption font-weight-bold text-forest">PHONE CONTACT</div>
                  <div class="text-body-2 text-secondary-editorial">{{ placePhone }}</div>
                </div>
              </v-col>
              <v-col cols="12" sm="6" class="d-flex align-center mb-3">
                <v-icon color="#21866B" class="mr-3" size="22">mdi-check-decagram</v-icon>
                <div>
                  <div class="text-caption font-weight-bold text-forest">VERIFIED STATUS</div>
                  <div class="text-body-2 text-secondary-editorial">Official Touriva Tourism Listing</div>
                </div>
              </v-col>
              <v-col cols="12" sm="6" class="d-flex align-center mb-3">
                <v-icon color="#21866B" class="mr-3" size="22">mdi-translate</v-icon>
                <div>
                  <div class="text-caption font-weight-bold text-forest">LANGUAGES</div>
                  <div class="text-body-2 text-secondary-editorial">Arabic, French, English</div>
                </div>
              </v-col>
            </v-row>
          </v-card>

          <!-- PHOTO GALLERY -->
          <v-card class="editorial-card pa-6 pa-md-8 mb-6" elevation="0">
            <h2 class="text-h5 font-serif font-weight-bold text-forest mb-4">
              Curated Photo Gallery
            </h2>
            <v-row dense>
              <v-col
                v-for="(img, idx) in galleryImages"
                :key="idx"
                cols="6"
                sm="4"
              >
                <v-img
                  :src="img"
                  height="180"
                  cover
                  class="rounded-lg cursor-pointer img-editorial-zoom"
                >
                  <template #placeholder>
                    <div class="d-flex fill-height align-center justify-center bg-grey-lighten-4">
                      <v-progress-circular indeterminate color="#21866B" size="24" />
                    </div>
                  </template>
                </v-img>
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <!-- RIGHT COLUMN: ACTION & CONTACT CARD -->
        <v-col cols="12" md="4">
          <v-card class="editorial-card pa-6 sticky-card" elevation="0">
            <h3 class="text-h6 font-serif font-weight-bold text-forest mb-2">
              Plan Your Visit
            </h3>
            <p class="text-caption text-secondary-editorial mb-6">
              Connect with local operators, verified certified guides, and check live opening availability.
            </p>

            <div class="mb-4" v-if="placePhone">
              <v-btn
                block
                color="#173F35"
                size="large"
                rounded="pill"
                class="btn-editorial-primary font-weight-bold mb-3"
                :href="`tel:${placePhone}`"
              >
                <v-icon start size="18">mdi-phone</v-icon>
                {{ $t('CallNow') || 'Call Operator' }}
              </v-btn>
            </div>

            <div class="mb-4" v-if="placeWebsite">
              <v-btn
                block
                variant="outlined"
                color="#173F35"
                size="large"
                rounded="pill"
                class="btn-editorial-outline font-weight-bold mb-3"
                :href="placeWebsite"
                target="_blank"
              >
                <v-icon start size="18">mdi-earth</v-icon>
                Official Website
              </v-btn>
            </div>

            <v-btn
              block
              color="#D9B98C"
              size="large"
              rounded="pill"
              class="btn-editorial-sand font-weight-bold mb-3"
              @click="router.push('/trips')"
            >
              <v-icon start size="18">mdi-compass-outline</v-icon>
              View Guided Excursions
            </v-btn>

            <v-divider class="my-6 border-subtle"></v-divider>

            <div class="text-center text-caption text-secondary-editorial">
              <v-icon size="16" color="#21866B" class="mr-1">mdi-shield-check</v-icon>
              Guaranteed Authentic Algerian Experience
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePlacesStore } from '@/stores/places'
import { useSitesStore } from '@/stores/sites'
import { useHotelsStore } from '@/stores/hotels'
import { useRestaurantsStore } from '@/stores/restaurants'
import { getResolvedImage, CURATED_PHOTOGRAPHY } from '@/config/curatedImages'

const router = useRouter()
const route = useRoute()
const placesStore = usePlacesStore()
const sitesStore = useSitesStore()
const hotelsStore = useHotelsStore()
const restaurantsStore = useRestaurantsStore()

const place = computed(() => placesStore.getCuurrentPlace)

const placeName = computed(() => {
  return place.value?.displayName?.text || place.value?.name || 'Historic Cultural Landmark'
})

const placeAddress = computed(() => {
  return place.value?.formattedAddress || place.value?.address || place.value?.wilayaId?.name || 'Algeria'
})

const placeCategory = computed(() => {
  if (place.value?.type) return place.value.type.toUpperCase()
  if (place.value?.types && place.value.types[0]) return place.value.types[0].replace('_', ' ').toUpperCase()
  return 'CULTURAL DESTINATION'
})

const placeRating = computed(() => {
  return place.value?.rating ? Number(place.value.rating).toFixed(1) : '4.6'
})

const placeReviews = computed(() => {
  return place.value?.reviews || 28
})

const placePhone = computed(() => {
  return place.value?.internationalPhoneNumber || place.value?.phone || null
})

const placeWebsite = computed(() => {
  return place.value?.websiteUri || null
})

const placeDescription = computed(() => {
  return place.value?.description || 
    'A revered Algerian landmark noted for its architectural heritage, cultural resonance, and profound historical importance within North African exploration.'
})

const heroImage = computed(() => {
  return getResolvedImage(place.value, 'site')
})

const galleryImages = computed(() => {
  const images = []
  if (place.value?.photos && Array.isArray(place.value.photos)) {
    place.value.photos.slice(0, 6).forEach(p => {
      if (p.name) {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY || import.meta.env.VITE_GOOGLE_API_KEY || ''
        if (apiKey) {
          images.push(`https://places.googleapis.com/v1/${p.name}/media?key=${apiKey}&maxWidthPx=800`)
        }
      }
    })
  }
  if (images.length === 0) {
    images.push(
      'https://images.unsplash.com/photo-1548625361-195fe57871b0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80'
    )
  }
  return images
})

onMounted(async () => {
  // If place was not set in store (e.g. direct page refresh), load from backend
  if (!place.value) {
    const id = route.params.placeId
    if (sitesStore.getSites.length === 0) {
      await sitesStore.fetchCatalogSites()
    }
    const found = sitesStore.getSites.find(s => s._id === id || s.name?.includes(id))
    if (found) {
      placesStore.setTrip(found)
    }
  }
})
</script>

<style scoped>
.editorial-detail {
  min-height: 100vh;
}

.max-w-container {
  max-width: 1280px;
}

.detail-hero {
  position: relative;
  overflow: hidden;
}

.detail-hero-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(16, 45, 39, 0.6) 0%,
    rgba(16, 45, 39, 0.2) 40%,
    rgba(16, 45, 39, 0.95) 100%
  );
  pointer-events: none;
}

.hero-category-chip {
  background: rgba(217, 185, 140, 0.9);
  color: #102D27;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 4px 10px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
}

.backdrop-blur {
  backdrop-filter: blur(8px);
}

.sticky-card {
  position: sticky;
  top: 100px;
}

.border-subtle {
  border-color: #E7E8E1 !important;
}

.line-height-relaxed {
  line-height: 1.8;
}

.z-10 {
  z-index: 10;
}
</style>
