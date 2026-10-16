<template>
  <v-container
    v-if="place"
    fluid
    class="pa-0"
  >
    <!-- HERO IMAGE -->
    <v-img
      :src="heroImage"
      height="320"
      cover
      class="hero-image"
    >
      <div class="hero-overlay">
        <h1 class="hero-title">
          {{ place.displayName?.text }}
        </h1>

        <div class="d-flex align-center mt-2" v-if="place.rating">
          <v-rating
            :model-value="place.rating"
            color="amber"
            half-increments
            readonly
            size="20"
          />
          <span class="ml-2 text-white">
            {{ place.rating }}
          </span>
        </div>
      </div>
    </v-img>

    <!-- CONTENT -->
    <v-container class="mt-6">
      <!-- ADDRESS -->
      <v-card class="mb-6" elevation="1">
        <v-card-text class="d-flex align-start">
          <v-icon color="primary" class="mr-2">
            mdi-map-marker
          </v-icon>
          <span>
            {{ place.formattedAddress }}
          </span>
        </v-card-text>
      </v-card>

      <!-- ACTION BUTTONS -->
      <v-row class="mb-6" dense>
        <!-- <v-col cols="12" sm="4">
          <v-btn color="primary" block size="large">
            Book now
          </v-btn>
        </v-col> -->

        <v-col cols="12" sm="4" v-if="place.internationalPhoneNumber">
          <v-btn
            color="secondary"
            variant="outlined"
            block
            size="large"
            :href="`tel:${place.internationalPhoneNumber}`"
          >
            Call
          </v-btn>
        </v-col>

        <v-col cols="12" sm="4" v-if="place.websiteUri">
          <v-btn
            color="black"
            variant="outlined"
            block
            size="large"
            :href="place.websiteUri"
            target="_blank"
          >
            Website
          </v-btn>
        </v-col>
      </v-row>

      <!-- PHOTO GALLERY -->
      <div v-if="galleryImages.length">
        <h2 class="text-h6 mb-3">Gallery</h2>

        <v-row dense>
          <v-col
            v-for="(img, index) in galleryImages"
            :key="index"
            cols="6"
            md="3"
          >
            <v-img
              :src="img"
              aspect-ratio="1"
              cover
              class="rounded-lg"
            />
          </v-col>
        </v-row>
      </div>
    </v-container>
  </v-container>

  <!-- FALLBACK -->
  <v-container v-else>
    <v-alert type="warning">
      Place not found (reload nearby data)
    </v-alert>
  </v-container>
</template>

<script setup>
import { computed } from 'vue'
import { usePlacesStore } from '@/stores/places'

const placesStore = usePlacesStore()

const API_KEY = "AIzaSyDxFsMTjS-UsZgkJXcAPbtLQFHmNrg7wN4"

const place = computed(() => placesStore.getCuurrentPlace)

const heroImage = computed(() => {
  const photo = place.value?.photos?.[0]
  return photo
    ? `https://places.googleapis.com/v1/${photo.name}/media?key=${API_KEY}&maxWidthPx=1200`
    : 'https://via.placeholder.com/1200x600?text=No+Image'
})

const galleryImages = computed(() => {
  if (!place.value?.photos) return []
  return place.value.photos.slice(1, 8).map(
    p =>
      `https://places.googleapis.com/v1/${p.name}/media?key=${API_KEY}&maxWidthPx=600`
  )
})

</script>

<style scoped>
.hero-image {
  position: relative;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.7),
    rgba(0, 0, 0, 0.2)
  );
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 24px;
}

.hero-title {
  color: white;
  font-size: 28px;
  font-weight: 700;
}
</style>
