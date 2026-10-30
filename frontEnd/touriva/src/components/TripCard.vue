<template>
  <v-card
    class="editorial-card h-100 d-flex flex-column"
    elevation="0"
    @click="navigateToTrip"
  >
    <!-- Card Media with Floating Badges -->
    <div class="position-relative overflow-hidden">
      <v-img
        :src="imageUrl"
        height="230"
        cover
        eager
        class="img-editorial-zoom cursor-pointer"
      >
        <template #placeholder>
          <div class="d-flex fill-height align-center justify-center bg-grey-lighten-4">
            <v-progress-circular indeterminate color="#21866B" size="28" />
          </div>
        </template>
      </v-img>

      <!-- Gradient scrim for text readability -->
      <div class="editorial-scrim"></div>

      <!-- Top Badges -->
      <div class="position-absolute top-0 left-0 right-0 pa-3 d-flex justify-space-between align-center">
        <span class="editorial-duration-badge">
          <v-icon size="14" class="mr-1">mdi-clock-outline</v-icon>
          {{ durationText }}
        </span>
        <span v-if="trip.rating" class="editorial-rating-badge">
          <v-icon size="14" color="#D9B98C" class="mr-1">mdi-star</v-icon>
          {{ Number(trip.rating).toFixed(1) }}
        </span>
      </div>

      <!-- Destination Overlay at bottom of image -->
      <div class="position-absolute bottom-0 left-0 right-0 pa-3 text-white">
        <div class="text-caption text-uppercase font-weight-bold text-sand-light letter-spacing-wide">
          <v-icon size="13" color="#D9B98C" class="mr-1">mdi-map-marker</v-icon>
          {{ destinationText }}
        </div>
      </div>
    </div>

    <!-- Card Body Content -->
    <div class="pa-4 flex-grow-1 d-flex flex-column justify-space-between">
      <div>
        <h3 class="text-h6 font-weight-bold text-forest mb-2 line-clamp-2">
          {{ trip.name || trip.title || 'Curated Algerian Expedition' }}
        </h3>
        <p v-if="trip.description" class="text-caption text-secondary-editorial line-clamp-2 mb-3">
          {{ trip.description }}
        </p>
      </div>

      <div>
        <v-divider class="my-3 border-subtle"></v-divider>

        <div class="d-flex align-center justify-space-between">
          <!-- Guide / Organizer Avatar -->
          <div class="d-flex align-center" style="max-width: 60%;">
            <v-avatar size="32" color="#F5EDE0" class="mr-2 border-sand flex-shrink-0">
              <v-img v-if="trip.creator?.avatar" :src="trip.creator.avatar" cover />
              <v-icon v-else size="18" color="#173F35">
                {{ isAgency ? 'mdi-domain' : 'mdi-account' }}
              </v-icon>
            </v-avatar>
            <div class="text-caption font-weight-medium text-forest text-truncate">
              {{ organizerName }}
              <v-icon v-if="isVerifiedAgency" size="14" color="#21866B" class="ms-1" title="Agence Agréée">
                mdi-check-decagram
              </v-icon>
            </div>
          </div>

          <!-- Price in DZD -->
          <div class="text-end">
            <div class="text-caption text-secondary-editorial" style="font-size: 0.7rem !important;">
              {{ $t('from') || 'From' }}
            </div>
            <div class="text-body-1 font-weight-bold text-forest">
              {{ formatPrice(trip.price) }}
            </div>
          </div>
        </div>

        <div class="mt-3">
          <v-btn
            block
            variant="flat"
            color="#173F35"
            size="small"
            rounded="pill"
            class="text-capitalize font-weight-bold text-white letter-spacing"
          >
            {{ $t('ViewDetails') || 'View Itinerary' }}
            <v-icon end size="16">mdi-arrow-right</v-icon>
          </v-btn>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { getResolvedImage } from '@/config/curatedImages'

const router = useRouter()

const props = defineProps({
  trip: {
    type: Object,
    required: true
  }
})

const tripId = computed(() => props.trip._id || props.trip.id)

const imageUrl = computed(() => {
  return getResolvedImage(props.trip, 'trip')
})

const durationText = computed(() => {
  if (props.trip.days && Array.isArray(props.trip.days)) {
    return `${props.trip.days.length} Days`
  }
  return '3 Days'
})

const destinationText = computed(() => {
  return props.trip.destination?.name || props.trip.destination || (typeof props.trip.wilaya === 'string' ? props.trip.wilaya : props.trip.wilaya?.name) || 'Algeria'
})

const isAgency = computed(() => props.trip.creator?.typeAccount === 'touristAgencies')
const isVerifiedAgency = computed(() => isAgency.value && props.trip.creator?.fileStatus === 'confirmed')

const organizerName = computed(() => {
  if (props.trip.creator?.companyName) {
    return props.trip.creator.companyName
  }
  if (props.trip.creator?.firstName) {
    return `${props.trip.creator.firstName} ${props.trip.creator.lastName || ''}`.trim()
  }
  return 'Certified Guide'
})

const formatPrice = (val) => {
  if (!val) return '15,000 DZD'
  const num = Number(val)
  return isNaN(num) ? `${val} DZD` : `${num.toLocaleString()} DZD`
}

const navigateToTrip = () => {
  if (tripId.value) {
    router.push(`/tripDetail/${tripId.value}`)
  }
}
</script>

<style scoped>
.editorial-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(16, 45, 39, 0.45) 0%,
    transparent 40%,
    rgba(16, 45, 39, 0.8) 100%
  );
  pointer-events: none;
}

.editorial-duration-badge {
  background: rgba(16, 45, 39, 0.85);
  backdrop-filter: blur(6px);
  color: #FAF8F2;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 9999px;
  border: 1px solid rgba(217, 185, 140, 0.3);
  display: inline-flex;
  align-center: center;
}

.editorial-rating-badge {
  background: rgba(16, 45, 39, 0.85);
  backdrop-filter: blur(6px);
  color: #FAF8F2;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 9999px;
  border: 1px solid rgba(217, 185, 140, 0.3);
  display: inline-flex;
  align-center: center;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.letter-spacing-wide {
  letter-spacing: 0.08em;
}

.letter-spacing {
  letter-spacing: 0.03em;
}

.border-subtle {
  border-color: #E7E8E1 !important;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
