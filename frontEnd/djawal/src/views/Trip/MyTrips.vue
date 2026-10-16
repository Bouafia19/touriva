<template>
    <v-container 
        fluid 
        :class="[platform === 'web' ? 'px-0 main-container' : '']"
    >
        <!-- <v-row>
            <v-col class="d-flex justify-start py-2">
                <v-btn 
                    class="px-0"
                    color="next"
                    @click="returnTo"
                    variant="text"
                    prepend-icon="mdi-arrow-left"
                >
                    {{ $t('Return') }}
                </v-btn>
            </v-col>
        </v-row> -->

        <v-navigation-drawer
          v-model="drawer"
          temporary
          location="right"
          :width="platform === 'web' ? '500' : ''"
        >
          <v-card class="pa-4" flat>
            <v-card-title class="text-h6 font-weight-bold">
              {{ $t('createNewTrip') }}
            </v-card-title>
            
            <v-card-text>
              <!-- Trip Name -->
              <v-text-field
                v-model="trip.name"
                :label="$t('tripName')"
                required
              />

              <v-autocomplete
                v-model="trip.destination"
                :items="wilayaStore.getWilayas"
                item-title="name"
                item-value="_id"
                :label="$t('destination')"
                required
              ></v-autocomplete>

              <!-- Price -->
              <v-text-field
                v-model="trip.price"
                :label="$t('price')"
                type="number"
                required
              />

              <!-- Image upload -->
              <v-file-input 
                v-model="mainImg" 
                :label="$t('Photo')"
                outlined
                prepend-icon="mdi-camera"
                dense
                @change="onImageChange"
                class="mt-4"
                ref="fileInput"
              />

              <!-- Preview / Placeholder -->
              <div class="image-wrapper mt-3">
                <v-img
                  v-if="trip.image"
                  :src="trip.image"
                  max-height="200"
                  cover
                />

                <div 
                  v-else
                  class="image-placeholder"
                  @click="$refs.fileInput.click()"
                >
                  <v-icon size="48" color="grey">
                    mdi-camera
                  </v-icon>
                  <span class="placeholder-text">
                    {{ $t('clickToUploadImage') }}
                  </span>
                </div>
              </div>

            </v-card-text>
          </v-card>
          <template v-slot:append>
            <v-divider></v-divider>
            <div class="pa-4">
              
              <v-row justify="end" no-gutters>
                <v-col cols="auto">
                  <v-btn variant="text" color="error" @click="drawer = false">{{ $t('cancel') }}</v-btn>
                </v-col>
                <v-spacer></v-spacer>
                <v-col cols="auto">
                  <v-btn 
                    color="next" 
                    class="ml-2"
                    :loading="tripStore.isLoading"
                    @click="createTrip()"
                  >
                    {{ $t('create') }}
                  </v-btn>
                </v-col>
              </v-row>
            </div>
          </template>
        </v-navigation-drawer>
            
        <h2 class="text-h5 mb-6 font-weight-bold">{{ $t('planYourTrip') }}</h2>

        <v-row justify="center" align="stretch" class="gap-4">
            <!-- Create a new trip -->
            <v-col cols="12" sm="6" md="4" class="d-flex justify-center">
                <v-card
                    class="pa-6 text-center cursor-pointer hover-elevate"
                    max-width="344"
                    rounded="lg"
                    elevation="2"
                    @click.stop="drawer = !drawer"
                >
                    <v-icon 
                        size="48" 
                        color="primary" 
                        class="mb-4"
                    >
                        mdi-plus-circle-outline
                    </v-icon>

                    <v-card-title 
                        class="text-h6 font-weight-bold justify-center"
                    >
                        {{ $t('createNewTrip') }}
                    </v-card-title>

                    <v-card-text>
                        {{ $t('startFromScratch') }}
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- Build with AI -->
            <v-col cols="12" sm="6" md="4" class="d-flex justify-center">
                <v-card
                    class="pa-6 text-center cursor-pointer hover-elevate"
                    max-width="344"
                    rounded="lg"
                    elevation="2"
                    @click="router.push('/tripBuilder')"
                >
                    <v-icon 
                        size="48" 
                        color="deep-purple-accent-4" 
                        class="mb-4"
                    >
                        mdi-robot-outline
                    </v-icon>

                    <v-card-title 
                        class="text-h6 font-weight-bold justify-center wrap-text"
                    >
                        {{ $t('buildTripWithAI') }}
                    </v-card-title>

                    <v-card-text>
                        {{ $t('aiDescription') }}
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>


        <!-- <v-row
            class="ma-2 d-flex justify-center" 
            v-if="!publications.getPublicationsByOwnerId"
        >
            <v-col 
                cols="12"
                sm="6"
                md="4"
            >
                <v-skeleton-loader
                v-for="(cat, index) in 5" 
                :key="index"
                class="mx-auto"
                type="list-item"
                ></v-skeleton-loader>
            </v-col>
        </v-row>

        <v-row 
            class="ma-2 d-flex justify-center"
            v-if="!publications.getPublicationsByOwnerId === 0">
            <v-alert type="info">{{ $t('Npf') }}</v-alert>
        </v-row> -->

        <h1 
            class="d-flex justify-start py-2"
        >
            {{ $t('Trips') }}
        </h1>

      <v-row v-if="hasNoTrips" justify="center" class="my-10">
        <v-col cols="12" md="8">
          <v-alert
            type="info"
            variant="tonal"
            border="start"
            prominent
            icon="mdi-map-search-outline"
          >
            <div class="text-h6 mb-2">
              {{ $t('noTripsTitle') }}
            </div>

            <div class="mb-4">
              {{ $t('noTripsDescription') }}
            </div>
          </v-alert>
        </v-col>
      </v-row>


      <v-row>
        <!-- Skeletons -->
            <template v-if="tripStore.isLoading">
                <v-col
                    v-for="n in 6"
                    :key="n"
                    cols="12"
                    sm="6"
                    md="4"
                >
                    <v-skeleton-loader
                        type="card"
                        elevation="1"
                    />
                </v-col>
            </template>

            <!-- Real content -->
            <template v-else>
              <v-col
                v-for="trip in tripStore.getTripsByUser"
                :key="trip.id"
                cols="12"
                sm="6"
                md="4"
              >
                <v-card class="hoverable mx-2" @click="goToTrip(trip)">
                  <v-img
                    :src="trip.image || defaultImage"
                    height="200px"
                    cover
                  ></v-img>
                  <v-card-title>{{ trip.name }}</v-card-title>

                  

                  <v-card-subtitle>By {{ trip.creator?.firstName }} {{ trip.creator?.lastName }} {{ trip.creator?.companyName }}</v-card-subtitle>
                  <v-card-text class="d-flex justify-space-between align-center">
                    <span>{{ $t('Days') }}: {{ trip.days.length }}</span>
                    <v-rating
                      v-model="trip.rating"
                      color="amber"
                      dense
                      half-increments
                      readonly
                    ></v-rating>
                  </v-card-text>
                  <div class="px-4 mb-2" v-if="trip.price">
                    <v-chip-group>
                      <v-chip class="text-red font-weight-bold px-6" size="large">
                        {{ formatPrice(trip.price) }}
                      </v-chip>
                    </v-chip-group>
                  </div>
                  <v-card-actions
                    
                  >
                    <v-btn
                      icon
                      color="error"
                      @click.stop="deleteTrip(trip)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-switch
                      v-model="trip.published"
                      :label="trip.published ? $t('Published') : $t('Unpublished')"
                      hide-details
                      inset
                      v-if="trip.status !== 'pending'"
                      :color="trip.published ? 'green' : 'blue'"
                      @click.stop
                      @update:modelValue="onPublishChange(trip, $event)"
                    ></v-switch>
                    <v-chip 
                      class="text-orange font-weight-bold px-6" 
                      size="large"
                      v-if="trip.status === 'pending'"
                    >
                      {{ 'Pending ...' }}
                    </v-chip>
                    <!-- <v-chip 
                      class="text-green font-weight-bold px-6" 
                      size="large"
                      v-if="trip.status === 'published'"
                    >
                      {{ 'Published' }}
                    </v-chip> -->
                  </v-card-actions>
                </v-card>
              </v-col>
        </template>
      </v-row>

    <div class="text-center pa-4">
      <v-dialog
        v-model="dialog"
        max-width="400"
        persistent
      >
        <v-card
          prepend-icon="mdi-alert"
          :text="$t('BillingText')"
          :title="$t('BillingTitle')"
        >
          <template v-slot:actions>
            <v-spacer></v-spacer>

            <v-btn @click="dialog = false">
              {{ $t('cancel') }}
            </v-btn>

            <v-btn @click="$router.push(`/billing/`)">
              {{ $t('agree') }}
            </v-btn>
          </template>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
</template>
  
<script setup>
  import { Capacitor } from '@capacitor/core'
  import { ref, onMounted, computed } from 'vue'
  import { usePublicationsStore } from '@/stores/publications'
  import { useAuthStore } from '@/stores/auth'
  import { useRouter } from 'vue-router'
  import { useTripsStore } from '@/stores/trips'
  import { useWilayasStore } from '@/stores/wilaya'


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
    return new Intl.NumberFormat('fr-FR').format(price) + ' DA'
  }


  const createTrip = async () => {
    trip.value.creator = user.value
    // Reset form
    trip.value = {
      name: trip.value.name,              // 🔧 replace later with form input
      creator: trip.value.creator,
      destination: trip.value.destination, // 🔧 from auth later
      image: trip.value.image,      // optional
      price: trip.value.price
    }

    try {
      const createdTrip = await tripStore.createTrip(trip.value)
      console.log('✅ Trip saved to DB:', createdTrip)
      tripStore.setTrip(createTrip)
      alert('Trip created successfully!')
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
      alert('Failed to save trip')
    }
    
  }

  function goToTrip(trip) {
    console.log("Navigating to trip:", trip)
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

  const deleteTrip = async (trip) => {
    if (confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      try {
        await tripStore.deleteTrip(trip._id)
        alert('Trip deleted successfully!')
        tripStore.fetchTripsByUser(user.value._id)
      } catch (err) {
        console.error('❌ Failed to delete trip', err)
        alert('Failed to delete trip')
      }
    }
  }

  const onPublishChange = async (newValue) => {
    console.log('Publish status changed to:', newValue)
    if (newValue.published) {
      newValue.status = 'pending'
    }else{
      newValue.status = 'created'
    }

    newValue.published = false
    
    try {
      const updatedTrip = await tripStore.updateTrip(newValue._id, newValue)
      console.log('✅ Trip updated successfully:')
      tripStore.setTrip(updatedTrip)
      alert('Trip created successfully!')
    }catch (err) {
        console.error('❌ Failed to save trip', err)
        alert('Failed to save trip')
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

.wrap-text {
  white-space: normal; /* allow wrapping */
  word-break: break-word; /* break long words if needed */
  text-align: center; /* keep centered */
}


</style>
  