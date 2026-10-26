<template>
  <v-card
    class="rounded-xl overflow-hidden hover:scale-105 transition-transform duration-200 mx-2"
    elevation="4"
  >
    <!-- Site image -->
    <v-img
      :src="site.image"
      height="200"
      cover
      class="cursor-pointer"
      @click="openDetails"
    >
      <template #placeholder>
        <v-row class="fill-height ma-0 align-center justify-center">
          <v-progress-circular indeterminate color="primary" />
        </v-row>
      </template>
    </v-img>

    <!-- Card content -->
    <v-card-title class="text-h6 font-weight-bold">
      {{ site.name }}
    </v-card-title>

    <v-card-subtitle>
      <v-icon icon="mdi-map-marker" size="small" color="primary" />
      {{ site.address }}
    </v-card-subtitle>

    <v-card-text class="text-body-2">
      <div class="d-flex align-center mb-1">
        <v-icon icon="mdi-star" color="amber" size="small" />
        <span class="ml-1">{{ site.rating }}</span>
        <span class="ml-2 text-grey">({{ site.reviews }} reviews)</span>
      </div>
      <p class="text-grey mt-2">{{ site.description }}</p>
    </v-card-text>

    <!-- Action -->
    <v-card-actions class="justify-center">
      <v-btn
        color="next"
        variant="flat"
        @click="bookSite(site)"
      >
        View 360
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
  import { useRouter } from 'vue-router'
  const router = useRouter()

  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || import.meta.env.VITE_GOOGLE_API_KEY || ''


  const props = defineProps({
    site: {
      type: Object,
      required: true,
    },
  })

  const openDetails = () => {
    router.push(`/site/${props.site.id}`)
  }

  const bookSite = (site) => {
    window.open(site.view360, '_blank')
  }

  const getPhotoUrl = (site) => {
    if (!site || !site.photos || site.photos.length === 0) {
      return "/no-image.png"
    }

    const photoName = site.photos[0].name // e.g. "places/xxxx/photos/yyyy"

    return `https://places.googleapis.com/v1/${photoName}/media?key=${API_KEY}&maxWidthPx=800`
  }
</script>
