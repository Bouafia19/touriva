<template>
  <v-card
    class="rounded-xl overflow-hidden hover:scale-105 transition-transform duration-200 mx-2"
    elevation="4"
  >
    <!-- Hotel image -->
    <v-img
      :src="getPhotoUrl(hotel)"
      height="200"
      cover
      class="cursor-pointer"
    >
      <template #placeholder>
        <v-row class="fill-height ma-0 align-center justify-center">
          <v-progress-circular indeterminate color="primary" />
        </v-row>
      </template>
    </v-img>

    <!-- Card content -->
    <v-card-title class="text-h6 font-weight-bold">
      {{ hotel.displayName?.text || hotel.name }}
    </v-card-title>

    <v-card-subtitle>
      <v-icon icon="mdi-map-marker" size="small" color="primary" />
      {{ hotel.formattedAddress || hotel.address }}
    </v-card-subtitle>

    <v-card-text class="text-body-2">
      <div class="d-flex align-center mb-1">
        <v-icon icon="mdi-star" color="amber" size="small" />
        <span class="ml-1">{{ hotel.rating }}</span>
        <span class="ml-2 text-grey">({{ hotel.reviews }} reviews)</span>
      </div>
      <p class="text-grey mt-2">{{ hotel.description }}</p>
    </v-card-text>

    <!-- Action -->
    <v-card-actions class="justify-center">
      <v-btn
        color="next"
        variant="flat"
        @click="goToDetails"
      >
        Details
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { usePlacesStore } from '@/stores/places'
  const placesStore = usePlacesStore()
const router = useRouter()

const props = defineProps({
  hotel: {
    type: Object,
    required: true,
  },
})

const goToDetails = () => {
  console.log("Navigating to place:", props.hotel);
  placesStore.setTrip(props.hotel)
  router.push({
    name: 'PlaceDetail',
    params: {
      placeId: props.hotel.name.replace('places/', '')
    }
  })
}

const API_KEY = "AIzaSyDxFsMTjS-UsZgkJXcAPbtLQFHmNrg7wN4"

  const getPhotoUrl = (hotel) => {
    // local image from your database
    if (hotel.photo) {
      return hotel.photo
    }

    if (!hotel || !hotel.photos || hotel.photos.length === 0) {
      return "/no-image.png"
    }

    const photoName = hotel.photos[0].name // e.g. "places/xxxx/photos/yyyy"

    return `https://places.googleapis.com/v1/${photoName}/media?key=${API_KEY}&maxWidthPx=800`
  }
</script>
