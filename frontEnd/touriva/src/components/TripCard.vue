<template>
  <v-card
    class="rounded-xl overflow-hidden hover-scale cursor-pointer"
    elevation="3"
    max-width="350"
    @click="router.push(`/trip/${trip.id}`)"
  >
    <!-- Image -->
    <v-img
      :src="trip.image"
      height="220"
      cover
    >
      <template #placeholder>
        <v-row
          class="fill-height ma-0"
          align="center"
          justify="center"
        >
          <v-progress-circular indeterminate color="grey-lighten-3" />
        </v-row>
      </template>
    </v-img>

    <!-- Card Content -->
    <v-card-item>
      <v-card-title class="font-weight-bold text-capitalize">
        {{ trip.title }}
      </v-card-title>
      <v-card-subtitle class="d-flex align-center">
        <v-icon size="20" color="primary" class="mr-1">mdi-map-marker</v-icon>
        {{ trip.destination }}
      </v-card-subtitle>
    </v-card-item>

    <v-divider></v-divider>

    <v-card-text class="py-3">
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-avatar size="32" class="mr-2">
            <v-img :src="trip.avatar" cover />
          </v-avatar>
          <span class="text-body-2">{{ trip.user }}</span>
        </div>
        <v-btn
          icon
          variant="text"
          color="grey-darken-1"
        >
          <v-icon>mdi-dots-horizontal</v-icon>
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps({
  trip: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.hover-scale {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.hover-scale:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
}
.cursor-pointer {
  cursor: pointer;
}
</style>
