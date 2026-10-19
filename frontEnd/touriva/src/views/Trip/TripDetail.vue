<template>
  <div class="editorial-trip-detail bg-warm-ivory min-vh-100 pb-16">
    <!-- HERO SECTION -->
    <div class="position-relative trip-hero">
      <v-img
        :src="heroImage"
        height="55vh"
        min-height="420px"
        cover
        class="trip-hero-img"
      >
        <template #placeholder>
          <div class="d-flex fill-height align-center justify-center bg-deep-green">
            <v-progress-circular indeterminate color="#D9B98C" size="48" />
          </div>
        </template>
      </v-img>

      <div class="trip-hero-scrim"></div>

      <!-- Top Back Navigation -->
      <div class="position-absolute top-0 left-0 right-0 pa-4 pa-md-6 z-10">
        <v-container class="max-w-container pa-0">
          <v-btn
            variant="flat"
            color="rgba(16, 45, 39, 0.75)"
            rounded="pill"
            class="text-white text-capitalize backdrop-blur font-weight-medium"
            @click="router.push('/trips')"
          >
            <v-icon start size="18">mdi-arrow-left</v-icon>
            {{ $t('Return') || 'Back to Excursions' }}
          </v-btn>
        </v-container>
      </div>

      <!-- Hero Header Info -->
      <div class="position-absolute bottom-0 left-0 right-0 pa-6 pa-md-10 text-white z-10">
        <v-container class="max-w-container pa-0">
          <div class="d-flex align-center ga-2 mb-3">
            <span class="trip-tag-pill">
              <v-icon size="14" color="#D9B98C" class="mr-1">mdi-clock-outline</v-icon>
              {{ tripDays.length }} Days Itinerary
            </span>
            <span class="trip-tag-pill bg-emerald text-white">
              <v-icon size="14" color="white" class="mr-1">mdi-compass</v-icon>
              Guided Expedition
            </span>
          </div>

          <h1 class="text-h3 font-serif font-weight-bold text-white mb-2">
            {{ tripTitle }}
          </h1>

          <div class="d-flex align-center flex-wrap ga-4 text-sand-light text-body-2">
            <div class="d-flex align-center">
              <v-icon size="16" color="#D9B98C" class="mr-1">mdi-map-marker</v-icon>
              {{ destinationText }}
            </div>
            <div class="d-flex align-center">
              <v-icon size="16" color="#D9B98C" class="mr-1">mdi-account-tie</v-icon>
              Led by {{ guideName }}
            </div>
          </div>
        </v-container>
      </div>
    </div>

    <!-- MAIN BODY CONTENT -->
    <v-container class="max-w-container mt-8">
      <v-row>
        <!-- LEFT COLUMN: ITINERARY TIMELINE & INCLUSIONS -->
        <v-col cols="12" md="8">
          <!-- Overview Card -->
          <v-card class="editorial-card pa-6 pa-md-8 mb-6" elevation="0">
            <h2 class="text-h5 font-serif font-weight-bold text-forest mb-4">
              Journey Overview
            </h2>
            <p class="text-body-1 text-secondary-editorial line-height-relaxed mb-6">
              {{ tripDescription }}
            </p>

            <v-divider class="my-6 border-subtle"></v-divider>

            <h3 class="text-h6 font-weight-bold text-forest mb-4">Included in This Expedition</h3>
            <v-row dense>
              <v-col cols="12" sm="6" class="d-flex align-center mb-3">
                <v-icon color="#21866B" class="mr-3" size="22">mdi-account-check</v-icon>
                <div>
                  <div class="text-caption font-weight-bold text-forest">CERTIFIED LOCAL GUIDE</div>
                  <div class="text-caption text-secondary-editorial">Full-time licensed cultural escort</div>
                </div>
              </v-col>
              <v-col cols="12" sm="6" class="d-flex align-center mb-3">
                <v-icon color="#21866B" class="mr-3" size="22">mdi-bus</v-icon>
                <div>
                  <div class="text-caption font-weight-bold text-forest">GROUND TRANSPORTATION</div>
                  <div class="text-caption text-secondary-editorial">4x4 desert or comfortable private coach</div>
                </div>
              </v-col>
              <v-col cols="12" sm="6" class="d-flex align-center mb-3">
                <v-icon color="#21866B" class="mr-3" size="22">mdi-food-fork-drink</v-icon>
                <div>
                  <div class="text-caption font-weight-bold text-forest">AUTHENTIC MEALS</div>
                  <div class="text-caption text-secondary-editorial">Traditional regional breakfast & dinner</div>
                </div>
              </v-col>
              <v-col cols="12" sm="6" class="d-flex align-center mb-3">
                <v-icon color="#21866B" class="mr-3" size="22">mdi-ticket-percent</v-icon>
                <div>
                  <div class="text-caption font-weight-bold text-forest">LANDMARK ACCESS</div>
                  <div class="text-caption text-secondary-editorial">All national park and museum entries included</div>
                </div>
              </v-col>
            </v-row>
          </v-card>

          <!-- DAY-BY-DAY ITINERARY TIMELINE -->
          <v-card class="editorial-card pa-6 pa-md-8 mb-6" elevation="0">
            <h2 class="text-h5 font-serif font-weight-bold text-forest mb-6">
              Day-by-Day Program
            </h2>

            <div v-if="tripDays.length > 0">
              <div
                v-for="(day, dIdx) in tripDays"
                :key="dIdx"
                class="itinerary-day-block mb-6 pa-5 rounded-lg border-subtle bg-warm-ivory"
              >
                <div class="d-flex align-center justify-space-between mb-3">
                  <div class="d-flex align-center">
                    <v-avatar color="#173F35" size="36" class="mr-3 text-white font-weight-bold">
                      {{ day.day || (dIdx + 1) }}
                    </v-avatar>
                    <div>
                      <div class="text-subtitle-1 font-weight-bold text-forest">
                        Day {{ day.day || (dIdx + 1) }}: {{ day.title || 'Exploration & Cultural Immersion' }}
                      </div>
                      <div class="text-caption text-secondary-editorial" v-if="day.date">
                        {{ day.date }}
                      </div>
                    </div>
                  </div>
                  <v-chip size="x-small" color="#21866B" variant="tonal" class="font-weight-bold">
                    {{ day.items?.length || 2 }} Scheduled Stops
                  </v-chip>
                </div>

                <!-- Stops List -->
                <div v-if="day.items && day.items.length > 0" class="pl-4 border-s-timeline">
                  <div v-for="(stop, sIdx) in day.items" :key="sIdx" class="timeline-stop py-2">
                    <div class="d-flex align-center font-weight-medium text-body-2 text-forest">
                      <v-icon size="14" color="#21866B" class="mr-2">mdi-circle-medium</v-icon>
                      <span class="mr-2">{{ stop.title || stop.name || 'Sightseeing Discovery' }}</span>
                      <span v-if="stop.time" class="text-caption text-sand-dark font-weight-bold">({{ stop.time }})</span>
                    </div>
                    <p v-if="stop.description" class="text-caption text-secondary-editorial ml-5 mb-0">
                      {{ stop.description }}
                    </p>
                  </div>
                </div>
                <div v-else class="text-caption text-secondary-editorial pl-2">
                  Full day excursion program, scenic viewpoints, guided cultural narratives, and local encounters.
                </div>
              </div>
            </div>

            <!-- Fallback day items if empty -->
            <div v-else class="text-body-2 text-secondary-editorial">
              This journey features an intensive 3-day itinerary with daily desert hikes, historical walks, and authentic hospitality stops.
            </div>
          </v-card>
        </v-col>

        <!-- RIGHT COLUMN: STICKY RESERVATION CARD -->
        <v-col cols="12" md="4">
          <v-card class="editorial-card pa-6 sticky-card" elevation="0">
            <div class="text-caption text-secondary-editorial mb-1">RESERVATION & PRICING</div>
            <div class="text-h4 font-weight-bold text-forest mb-1">
              {{ formatPrice(tripPrice) }}
            </div>
            <div class="text-caption text-sand-dark font-weight-bold mb-4">
              Per Traveler • All Taxes Included
            </div>

            <v-divider class="my-4 border-subtle"></v-divider>

            <!-- Guide Details -->
            <div class="d-flex align-center mb-6">
              <v-avatar size="48" color="#F5EDE0" class="mr-3 border-sand">
                <v-icon size="28" color="#173F35">mdi-account</v-icon>
              </v-avatar>
              <div>
                <div class="text-subtitle-2 font-weight-bold text-forest">
                  {{ guideName }}
                </div>
                <div class="text-caption text-emerald font-weight-medium">
                  <v-icon size="14" color="#21866B">mdi-check-circle</v-icon>
                  Certified Tourism Guide
                </div>
              </div>
            </div>

            <!-- Action Button -->
            <v-btn
              block
              color="#173F35"
              size="large"
              rounded="pill"
              class="btn-editorial-primary font-weight-bold mb-3"
              @click="openReservationDialog"
            >
              <v-icon start size="20">mdi-ticket-confirmation-outline</v-icon>
              {{ $t('Subscribe') || 'Reserve Excursion' }}
            </v-btn>

            <div class="text-center text-caption text-secondary-editorial mt-3">
              <v-icon size="16" color="#21866B" class="mr-1">mdi-lock-outline</v-icon>
              Instant verified reservation confirmation
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- RESERVATION DIALOG MODAL -->
    <v-dialog v-model="reservationDialog" max-width="520" persistent>
      <v-card class="editorial-card pa-6">
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <div class="editorial-tag text-sand mb-1">CONFIRM RESERVATION</div>
            <h3 class="text-h6 font-serif font-weight-bold text-forest">
              {{ tripTitle }}
            </h3>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="reservationDialog = false"></v-btn>
        </div>

        <p class="text-caption text-secondary-editorial mb-4">
          Please provide your contact information to reserve your seats on this excursion. The organizer will reach out to confirm your itinerary schedule.
        </p>

        <v-alert v-if="reservationError" type="error" variant="tonal" class="mb-4" density="compact">
          {{ reservationError }}
        </v-alert>

        <v-form @submit.prevent="submitReservation">
          <div class="mb-3">
            <div class="text-caption font-weight-bold text-forest mb-1">FULL NAME *</div>
            <v-text-field
              v-model="bookingForm.fullName"
              placeholder="e.g. Amina Benali"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              required
              color="#173F35"
              hide-details
            />
          </div>

          <div class="mb-3">
            <div class="text-caption font-weight-bold text-forest mb-1">PHONE NUMBER *</div>
            <v-text-field
              v-model="bookingForm.phone"
              placeholder="e.g. 0550 12 34 56"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              type="tel"
              required
              color="#173F35"
              hide-details
            />
          </div>

          <div class="mb-4">
            <div class="text-caption font-weight-bold text-forest mb-1">NUMBER OF TRAVELERS</div>
            <v-select
              v-model="bookingForm.seats"
              :items="[1, 2, 3, 4, 5, 6, 8, 10]"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              color="#173F35"
              hide-details
            />
          </div>

          <div class="d-flex ga-3 mt-6">
            <v-btn
              variant="outlined"
              rounded="pill"
              class="flex-grow-1"
              @click="reservationDialog = false"
            >
              Cancel
            </v-btn>
            <v-btn
              type="submit"
              color="#173F35"
              class="btn-editorial-primary flex-grow-1 font-weight-bold"
              rounded="pill"
              :loading="submitting"
            >
              Confirm Booking
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- SUCCESS NOTIFICATION SNACKBAR -->
    <v-snackbar
      v-model="showSuccessSnackbar"
      color="#173F35"
      location="top"
      rounded="pill"
      :timeout="4000"
    >
      <div class="d-flex align-center">
        <v-icon color="#D9B98C" class="mr-2">mdi-check-decagram</v-icon>
        <span class="font-weight-bold">Reservation confirmed successfully! View in My Reservations.</span>
      </div>
    </v-snackbar>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { useTripsStore } from '@/stores/trips'
import { getResolvedImage } from '@/config/curatedImages'

const router = useRouter()
const route = useRoute()
const tripsStore = useTripsStore()

const reservationDialog = ref(false)
const submitting = ref(false)
const reservationError = ref('')
const showSuccessSnackbar = ref(false)

const bookingForm = ref({
  fullName: '',
  phone: '',
  seats: 1
})

const trip = computed(() => tripsStore.getCurrentTrip)

const tripTitle = computed(() => {
  return trip.value?.name || trip.value?.title || 'Algerian Excursion'
})

const tripDescription = computed(() => {
  return trip.value?.description || 
    'An extraordinary journey exploring the natural grandeur, architectural heritage, and hospitable communities of Algeria with curated daily excursions.'
})

const tripDays = computed(() => {
  return trip.value?.days || trip.value?.items || []
})

const tripPrice = computed(() => {
  return trip.value?.price || 15000
})

const destinationText = computed(() => {
  return trip.value?.destination?.name || trip.value?.destination || trip.value?.wilaya?.name || 'Algeria'
})

const guideName = computed(() => {
  if (trip.value?.creator?.firstName) {
    return `${trip.value.creator.firstName} ${trip.value.creator.lastName || ''}`.trim()
  }
  return 'Certified Algerian Guide'
})

const heroImage = computed(() => {
  return getResolvedImage(trip.value, 'trip')
})

const formatPrice = (price) => {
  const num = Number(price)
  return isNaN(num) ? `${price} DZD` : `${num.toLocaleString()} DZD`
}

const openReservationDialog = () => {
  reservationError.value = ''
  reservationDialog.value = true
}

const submitReservation = async () => {
  if (!bookingForm.value.fullName || !bookingForm.value.phone) {
    reservationError.value = 'Please provide both your full name and phone number.'
    return
  }

  submitting.value = true
  reservationError.value = ''

  try {
    const res = await axios.post('/api/tripSubscriptions', {
      tripId: trip.value?._id || route.params.id,
      fullName: bookingForm.value.fullName,
      phone: bookingForm.value.phone,
      seats: bookingForm.value.seats
    })

    if (res.status === 200 || res.status === 201) {
      reservationDialog.value = false
      showSuccessSnackbar.value = true
      bookingForm.value = { fullName: '', phone: '', seats: 1 }
    }
  } catch (err) {
    console.error('Reservation error:', err)
    reservationError.value = err.response?.data?.error || 'Unable to submit reservation. Please try again.'
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  const id = route.params.id
  if (id) {
    await tripsStore.fetchTripById(id)
  }
})
</script>

<style scoped>
.editorial-trip-detail {
  min-height: 100vh;
}

.max-w-container {
  max-width: 1280px;
}

.trip-hero {
  position: relative;
  overflow: hidden;
}

.trip-hero-scrim {
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

.trip-tag-pill {
  background: rgba(16, 45, 39, 0.85);
  backdrop-filter: blur(6px);
  color: #FAF8F2;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 4px 12px;
  border-radius: 9999px;
  border: 1px solid rgba(217, 185, 140, 0.3);
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

.border-s-timeline {
  border-left: 2px solid #21866B;
}

.line-height-relaxed {
  line-height: 1.8;
}

.z-10 {
  z-index: 10;
}
</style>
