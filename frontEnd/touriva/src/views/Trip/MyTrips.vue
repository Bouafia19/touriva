<template>
  <div class="editorial-catalog bg-warm-ivory min-vh-100 pb-16">
    <!-- Header Banner -->
    <div class="catalog-hero py-10 px-4 border-b border-subtle bg-white">
      <v-container class="max-w-container">
        <div class="d-flex flex-column flex-md-row justify-space-between align-start align-md-center">
          <div>
            <div class="editorial-tag mb-1">{{ $t('planYourTrip') || 'TRIP MANAGEMENT' }}</div>
            <h1 class="text-h3 font-serif font-weight-bold text-forest mb-2">
              {{ $t('Trips') || 'My Excursions' }}
            </h1>
            <p class="text-secondary-editorial max-w-prose mb-0">
              {{ $t('startFromScratch') || 'Create and customize your trip itinerary' }}
            </p>
          </div>
        </div>
      </v-container>
    </div>

    <!-- Trip Creation Options -->
    <v-container class="max-w-container py-8">
      <v-row justify="center" align="stretch" class="mb-8">
        <!-- Create a new trip -->
        <v-col cols="12" sm="6" md="4" class="d-flex justify-center">
          <v-card
            class="editorial-card pa-6 text-center cursor-pointer h-100 w-100"
            elevation="0"
            @click.stop="drawer = !drawer"
          >
            <div class="category-icon-box mx-auto mb-4" style="width: 64px; height: 64px; border-radius: 16px;">
              <v-icon size="32" color="#173F35">mdi-plus-circle-outline</v-icon>
            </div>
            <h3 class="text-h6 font-weight-bold text-forest mb-2">
              {{ $t('createNewTrip') }}
            </h3>
            <p class="text-caption text-secondary-editorial mb-0">
              {{ $t('startFromScratch') }}
            </p>
          </v-card>
        </v-col>

        <!-- Build with AI -->
        <v-col cols="12" sm="6" md="4" class="d-flex justify-center">
          <v-card
            class="editorial-card pa-6 text-center cursor-pointer h-100 w-100"
            elevation="0"
            @click="router.push('/tripBuilder')"
          >
            <div class="category-icon-box mx-auto mb-4" style="width: 64px; height: 64px; border-radius: 16px; background: #F0E8F5;">
              <v-icon size="32" color="#6B21A8">mdi-creation</v-icon>
            </div>
            <h3 class="text-h6 font-weight-bold text-forest mb-2">
              {{ $t('buildTripWithAI') }}
            </h3>
            <p class="text-caption text-secondary-editorial mb-0">
              {{ $t('aiDescription') }}
            </p>
          </v-card>
        </v-col>
      </v-row>

      <!-- My Trips Section -->
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <div class="editorial-tag mb-1">{{ $t('Trips') || 'MY ITINERARIES' }}</div>
          <h2 class="text-h5 font-serif font-weight-bold text-forest">
            {{ $t('Trips') || 'Your Created Trips' }}
          </h2>
        </div>
      </div>

      <!-- Empty State -->
      <v-card
        v-if="hasNoTrips"
        class="editorial-card pa-12 text-center"
        elevation="0"
      >
        <v-icon size="56" color="#D9B98C" class="mb-4">mdi-map-search-outline</v-icon>
        <h3 class="text-h5 font-serif font-weight-bold text-forest mb-2">
          {{ $t('noTripsTitle') || 'No trips yet' }}
        </h3>
        <p class="text-secondary-editorial max-w-prose mx-auto mb-6">
          {{ $t('noTripsDescription') || "You haven't created any trips yet. Start by creating one manually or let AI build it for you." }}
        </p>
        <v-btn
          color="#173F35"
          class="btn-editorial-primary px-6"
          rounded="pill"
          @click="drawer = true"
        >
          {{ $t('createNewTrip') || 'Create Your First Trip' }}
        </v-btn>
      </v-card>

      <!-- Loading Skeletons -->
      <v-row v-if="tripStore.isLoading">
        <v-col v-for="n in 6" :key="n" cols="12" sm="6" md="4">
          <v-card class="editorial-card pa-4">
            <v-skeleton-loader type="image, heading, text, button" height="340" />
          </v-card>
        </v-col>
      </v-row>

      <!-- Trip Cards Grid -->
      <v-row v-else-if="!hasNoTrips">
        <v-col
          v-for="trip in tripStore.getTripsByUser"
          :key="trip._id || trip.id"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card
            class="editorial-card h-100 d-flex flex-column"
            elevation="0"
            @click="goToTrip(trip)"
          >
            <!-- Card Media -->
            <div class="position-relative overflow-hidden">
              <v-img
                :src="trip.image || defaultImage"
                height="220"
                cover
                class="img-editorial-zoom cursor-pointer"
              >
                <template #placeholder>
                  <div class="d-flex fill-height align-center justify-center bg-grey-lighten-4">
                    <v-progress-circular indeterminate color="#21866B" size="28" />
                  </div>
                </template>
              </v-img>

              <div class="editorial-scrim"></div>

              <!-- Duration Badge -->
              <div class="position-absolute top-0 left-0 pa-3">
                <span class="editorial-badge">
                  <v-icon size="14" class="mr-1">mdi-clock-outline</v-icon>
                  {{ trip.days?.length || 0 }} {{ $t('days') || 'days' }}
                </span>
              </div>

              <!-- Status Badge -->
              <div class="position-absolute top-0 right-0 pa-3">
                <span
                  class="editorial-status-badge"
                  :class="{
                    'status-pending': trip.status === 'pending',
                    'status-published': trip.status === 'published' || trip.published,
                    'status-draft': !trip.status || trip.status === 'created'
                  }"
                >
                  {{ trip.status === 'pending' ? 'Pending' : (trip.published ? 'Published' : 'Draft') }}
                </span>
              </div>

              <!-- Destination Overlay -->
              <div class="position-absolute bottom-0 left-0 right-0 pa-3 text-white">
                <div class="text-caption text-uppercase font-weight-bold text-sand-light letter-spacing-wide">
                  <v-icon size="13" color="#D9B98C" class="mr-1">mdi-map-marker</v-icon>
                  {{ trip.destination?.name || trip.destination || 'Algeria' }}
                </div>
              </div>
            </div>

            <!-- Card Body -->
            <div class="pa-4 flex-grow-1 d-flex flex-column justify-space-between">
              <div>
                <h3 class="text-h6 font-weight-bold text-forest mb-1 line-clamp-2">
                  {{ trip.name }}
                </h3>
                <div class="d-flex align-center text-caption text-secondary-editorial mb-2">
                  <v-icon size="14" color="#21866B" class="mr-1">mdi-account-tie</v-icon>
                  {{ $t('By') }} {{ trip.creator?.firstName }} {{ trip.creator?.lastName }} {{ trip.creator?.companyName || '' }}
                </div>
              </div>

              <div>
                <v-divider class="my-3 border-subtle"></v-divider>

                <div class="d-flex align-center justify-space-between">
                  <!-- Price -->
                  <div v-if="trip.price">
                    <div class="text-caption text-secondary-editorial" style="font-size: 0.7rem !important;">
                      {{ $t('Price') || 'Price' }}
                    </div>
                    <div class="text-body-1 font-weight-bold text-forest">
                      {{ formatPrice(trip.price) }}
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="d-flex align-center ga-1">
                    <v-btn
                      v-if="trip.status !== 'pending'"
                      :icon="trip.published ? 'mdi-eye' : 'mdi-eye-off'"
                      :color="trip.published ? '#21866B' : '#69736E'"
                      variant="text"
                      size="small"
                      @click.stop="onPublishChange(trip, !trip.published)"
                    ></v-btn>
                    <v-btn
                      icon="mdi-delete-outline"
                      color="#C24545"
                      variant="text"
                      size="small"
                      @click.stop="confirmDelete(trip)"
                    ></v-btn>
                  </div>
                </div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Create Trip Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      temporary
      location="right"
      :width="platform === 'web' ? '500' : ''"
      class="pa-0"
    >
      <div class="pa-6 bg-deep-green d-flex justify-space-between align-center">
        <div>
          <div class="editorial-tag text-sand mb-1">NEW ITINERARY</div>
          <h3 class="text-h6 font-weight-bold text-white ma-0">
            {{ $t('createNewTrip') }}
          </h3>
        </div>
        <v-btn icon="mdi-close" variant="text" color="white" size="small" @click="drawer = false"></v-btn>
      </div>

      <div class="pa-6">
        <!-- Trip Name -->
        <div class="mb-4">
          <div class="text-caption font-weight-bold text-forest mb-1">{{ $t('tripName') || 'Trip Name' }} *</div>
          <v-text-field
            v-model="trip.name"
            :placeholder="$t('tripName') || 'e.g. Saharan Adventure'"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            color="#173F35"
            hide-details
          />
        </div>

        <!-- Destination -->
        <div class="mb-4">
          <div class="text-caption font-weight-bold text-forest mb-1">{{ $t('destination') || 'Destination' }} *</div>
          <v-autocomplete
            v-model="trip.destination"
            :items="wilayaStore.getWilayas"
            item-title="name"
            item-value="_id"
            :placeholder="$t('destination') || 'Select a destination'"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            color="#173F35"
            hide-details
          ></v-autocomplete>
        </div>

        <!-- Price -->
        <div class="mb-4">
          <div class="text-caption font-weight-bold text-forest mb-1">{{ $t('price') || 'Price (DZD)' }}</div>
          <v-text-field
            v-model="trip.price"
            :placeholder="$t('price') || 'e.g. 15000'"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            color="#173F35"
            type="number"
            hide-details
          />
        </div>

        <!-- Image upload -->
        <div class="mb-4">
          <div class="text-caption font-weight-bold text-forest mb-1">{{ $t('photo') || 'Cover Photo' }}</div>
          <v-file-input
            v-model="mainImg"
            :label="$t('Photo')"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            prepend-icon="mdi-camera"
            @change="onImageChange"
            ref="fileInput"
            color="#173F35"
            hide-details
          />
        </div>

        <!-- Preview -->
        <div class="image-wrapper mt-3" v-if="trip.image">
          <v-img
            :src="trip.image"
            max-height="200"
            cover
            class="rounded-lg"
          />
        </div>
        <div
          v-else
          class="image-placeholder rounded-lg"
          @click="$refs.fileInput?.click()"
        >
          <v-icon size="40" color="#D9B98C">mdi-camera-outline</v-icon>
          <span class="text-caption text-secondary-editorial mt-2">
            {{ $t('clickToUploadImage') || 'Click to upload image' }}
          </span>
        </div>
      </div>

      <template v-slot:append>
        <v-divider></v-divider>
        <div class="pa-4 d-flex ga-3">
          <v-btn
            variant="outlined"
            rounded="pill"
            class="flex-grow-1"
            @click="drawer = false"
          >
            {{ $t('cancel') }}
          </v-btn>
          <v-btn
            color="#173F35"
            class="btn-editorial-primary flex-grow-1 font-weight-bold"
            rounded="pill"
            :loading="tripStore.isLoading"
            @click="createTrip()"
          >
            {{ $t('create') }}
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Billing Dialog -->
    <v-dialog v-model="dialog" max-width="460" persistent>
      <v-card class="editorial-card pa-6">
        <div class="d-flex align-center mb-4">
          <v-icon color="#D9943B" class="mr-3" size="28">mdi-alert-circle-outline</v-icon>
          <h3 class="text-h6 font-weight-bold text-forest ma-0">
            {{ $t('BillingTitle') || 'Billing Required' }}
          </h3>
        </div>
        <p class="text-body-2 text-secondary-editorial mb-6">
          {{ $t('BillingText') || 'Your subscription has expired. Please update your billing to continue.' }}
        </p>
        <div class="d-flex ga-3">
          <v-btn variant="outlined" rounded="pill" class="flex-grow-1" @click="dialog = false">
            {{ $t('cancel') }}
          </v-btn>
          <v-btn
            color="#173F35"
            class="btn-editorial-primary flex-grow-1 font-weight-bold"
            rounded="pill"
            @click="$router.push(`/billing/`)"
          >
            {{ $t('agree') || 'Update Billing' }}
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card class="editorial-card pa-6">
        <div class="d-flex align-center mb-4">
          <v-icon color="#C24545" class="mr-3" size="28">mdi-alert-circle-outline</v-icon>
          <h3 class="text-h6 font-weight-bold text-forest ma-0">Delete Trip</h3>
        </div>
        <p class="text-body-2 text-secondary-editorial mb-6">
          Are you sure you want to delete "{{ tripToDelete?.name }}"? This action cannot be undone.
        </p>
        <div class="d-flex ga-3">
          <v-btn variant="outlined" rounded="pill" class="flex-grow-1" @click="deleteDialog = false">
            {{ $t('cancel') || 'Cancel' }}
          </v-btn>
          <v-btn
            color="#C24545"
            class="flex-grow-1 font-weight-bold"
            rounded="pill"
            @click="deleteTrip(tripToDelete)"
          >
            {{ $t('delete') || 'Delete' }}
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Success/Error Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" location="top" rounded="pill" :timeout="3000">
      <div class="d-flex align-center">
        <v-icon :color="snackbarColor === '#173F35' ? '#D9B98C' : 'white'" class="mr-2">
          {{ snackbarColor === '#173F35' ? 'mdi-check-decagram' : 'mdi-alert-circle' }}
        </v-icon>
        <span class="font-weight-bold">{{ snackbarText }}</span>
      </div>
    </v-snackbar>
  </div>
</template>

<script setup>
  import { Capacitor } from '@capacitor/core'
  import { ref, onMounted, computed } from 'vue'
  import { usePublicationsStore } from '@/stores/publications'
  import { useAuthStore } from '@/stores/auth'
  import { useRouter } from 'vue-router'
  import { useTripsStore } from '@/stores/trips'
  import { useWilayasStore } from '@/stores/wilaya'
  import { CURATED_PHOTOGRAPHY } from '@/config/curatedImages'

  const publications = usePublicationsStore()
  const auth = useAuthStore()
  const tripStore = useTripsStore()
  const wilayaStore = useWilayasStore()
  const router = useRouter()

  const user = ref(null),
        dialog = ref(false),
        sheet = ref(false),
        plans = ref([]),
        platform = ref(null)

  const drawer = ref(null)
  const mainImg = ref(null)
  const deleteDialog = ref(false)
  const tripToDelete = ref(null)
  const snackbar = ref(false)
  const snackbarText = ref('')
  const snackbarColor = ref('#173F35')
  const defaultImage = CURATED_PHOTOGRAPHY.fallbacks.trip

  const trip = ref({
    name: '',
    creator: '',
    price: '',
    image: null,
    destination: ''
  })

  const hasNoTrips = computed(() => {
    return !tripStore.isLoading && tripStore.getTripsByUser.length === 0
  })


  /* Convert image to base64 */
  const onImageChange = () => {
    const reader = new FileReader()
    reader.onload = (e) => {
      trip.value.image = e.target.result
    }
    reader.readAsDataURL(mainImg.value)
  }

  const formatPrice = (price) => {
    if (!price) return ''
    return new Intl.NumberFormat('fr-FR').format(price) + ' DZD'
  }


  const createTrip = async () => {
    trip.value.creator = user.value
    // Reset form
    trip.value = {
      name: trip.value.name,
      creator: trip.value.creator,
      destination: trip.value.destination,
      image: trip.value.image,
      price: trip.value.price
    }

    try {
      const createdTrip = await tripStore.createTrip(trip.value)
      console.log('✅ Trip saved to DB:', createdTrip)
      tripStore.setTrip(createTrip)
      snackbarText.value = 'Trip created successfully!'
      snackbarColor.value = '#173F35'
      snackbar.value = true
      drawer.value = false
      tripStore.fetchTripsByUser(user.value._id)
      trip.value = {
        name: '',
        creator: '',
        destination: '',
        image: null,
        price: ''
      }
    } catch (err) {
      console.error('❌ Failed to save trip', err)
      snackbarText.value = 'Failed to save trip. Please try again.'
      snackbarColor.value = '#C24545'
      snackbar.value = true
    }

  }

  function goToTrip(trip) {
    tripStore.setTrip(trip)

    if (!trip.days || trip.days.length === 0) {
      // No days → go to create/edit trip
      router.push({
        name: 'NewTrip',
        params: { id: trip._id }
      })
    } else {
      // Has days → go to trip details
      router.push({
        name: 'TripDetail',
        params: { id: trip._id }
      })
    }
  }

  const confirmDelete = (t) => {
    tripToDelete.value = t
    deleteDialog.value = true
  }

  const deleteTrip = async (trip) => {
    try {
      await tripStore.deleteTrip(trip._id)
      snackbarText.value = 'Trip deleted successfully!'
      snackbarColor.value = '#173F35'
      snackbar.value = true
      deleteDialog.value = false
      tripStore.fetchTripsByUser(user.value._id)
    } catch (err) {
      console.error('❌ Failed to delete trip', err)
      snackbarText.value = 'Failed to delete trip. Please try again.'
      snackbarColor.value = '#C24545'
      snackbar.value = true
    }
  }

  const onPublishChange = async (newValue) => {
    if (newValue.published) {
      newValue.status = 'pending'
    }else{
      newValue.status = 'created'
    }

    newValue.published = false

    try {
      const updatedTrip = await tripStore.updateTrip(newValue._id, newValue)
      tripStore.setTrip(updatedTrip)
      snackbarText.value = 'Trip status updated successfully!'
      snackbarColor.value = '#173F35'
      snackbar.value = true
    }catch (err) {
        console.error('❌ Failed to save trip', err)
        snackbarText.value = 'Failed to update trip status.'
        snackbarColor.value = '#C24545'
        snackbar.value = true
    }
  }

  onMounted(async() => {
    platform.value = Capacitor.getPlatform()
    const ls = await auth.getLSUserInfo()
    user.value = ls?.user
    tripStore.fetchTripsByUser(user.value._id)
    wilayaStore.fetchWilayas()
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

.category-icon-box {
  background: #F5EDE0;
  display: flex;
  align-items: center;
  justify-content: center;
}

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

.editorial-badge {
  background: rgba(16, 45, 39, 0.85);
  backdrop-filter: blur(6px);
  color: #FAF8F2;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 9999px;
  border: 1px solid rgba(217, 185, 140, 0.3);
  display: inline-flex;
  align-items: center;
}

.editorial-status-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
}

.status-pending {
  background: rgba(217, 148, 59, 0.9);
  color: #FFFFFF;
}

.status-published {
  background: rgba(33, 134, 107, 0.9);
  color: #FFFFFF;
}

.status-draft {
  background: rgba(105, 115, 110, 0.85);
  color: #FFFFFF;
}

.letter-spacing-wide {
  letter-spacing: 0.08em;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.bg-deep-green {
  background-color: #102D27 !important;
}

.image-placeholder {
  height: 180px;
  border: 2px dashed #E7E8E1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #FAF8F2;
  cursor: pointer;
  transition: all 0.2s ease;
}

.image-placeholder:hover {
  border-color: #D9B98C;
  background-color: #F5EDE0;
}
</style>