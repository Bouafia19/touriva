<template>
  <v-card
    v-if="restaurant"
    class="rounded-xl overflow-hidden hover:scale-105 transition-transform duration-200 mx-2"
    elevation="4"
  >
    <v-img
      :src="getPhotoUrl(restaurant)"
      height="200"
      cover
    >
      <template #placeholder>
        <v-row class="fill-height ma-0 align-center justify-center">
          <v-progress-circular indeterminate color="primary" />
        </v-row>
      </template>
    </v-img>

    <v-card-title>{{ restaurant.displayName?.text || restaurant.name }}</v-card-title>
    <v-card-subtitle>
      <v-icon icon="mdi-map-marker" size="small" color="primary" />
      {{ restaurant.formattedAddress || restaurant.address }}
    </v-card-subtitle>

    <v-card-text>
      <v-rating
        v-model="restaurant.rating"
        readonly
        color="amber"
        density="compact"
      ></v-rating>
      <div class="text-grey">
        {{ restaurant.reviews }} reviews • {{ restaurant.cuisine }}
      </div>
      <div class="mt-2">{{ restaurant.description }}</div>
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

  <v-alert v-else type="error" variant="outlined">
    Missing restaurant data
  </v-alert>
</template>

<script setup>
  import { useRouter } from 'vue-router'
  import { usePlacesStore } from '@/stores/places'
  const placesStore = usePlacesStore()
  const router = useRouter()

  const props = defineProps({
    restaurant: {
      type: Object,
      default: () => ({
        name: 'Unknown Restaurant',
        image: 'https://via.placeholder.com/400x200?text=No+Image',
        city: '',
        country: '',
        cuisine: '',
        rating: 0,
        reviews: 0,
        description: ''
      })
    }
  })

  const API_KEY = "AIzaSyDxFsMTjS-UsZgkJXcAPbtLQFHmNrg7wN4"

  const getPhotoUrl = (restaurant) => {
    // local image from your database
    if (restaurant.photo) {
      return restaurant.photo
    }

    if (!restaurant || !restaurant.photos || restaurant.photos.length === 0) {
      return "/no-image.png"
    }

    const photoName = restaurant.photos[0].name // e.g. "places/xxxx/photos/yyyy"

    return `https://places.googleapis.com/v1/${photoName}/media?key=${API_KEY}&maxWidthPx=800`
  }

  const goToDetails = () => {
    placesStore.setTrip(props.restaurant)
    router.push({
    name: 'PlaceDetail',
    params: {
      placeId: props.restaurant.name.replace('places/', '')
    }
  })
  }
</script>
