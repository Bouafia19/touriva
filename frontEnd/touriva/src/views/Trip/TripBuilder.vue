<template>
    
    <v-container class="main-container">
        <h1 class="d-flex justify-center">{{ $t('poweredByAI') }}</h1>
        <v-stepper
            v-model="step"
            :items="items"
            mobile
            flat
        >
            <template #actions="{ prev, next }">
                <div class="d-flex align-center w-100">
                    
                    <v-btn
                        v-if="step > 1 && !isSubmitting"
                        variant="text"
                        @click="prev"
                    >
                        {{ $t('previous') }}
                    </v-btn>

                    <v-spacer />

                    <v-btn
                        v-if="step < 4"
                        color="primary"
                        :disabled="isNextDisabled"
                        @click="next"
                    >
                        {{ $t('next') }}
                    </v-btn>
                </div>
            </template>
            
            <template v-slot:item.1>
                <v-container>
                    <h3 class="d-flex justify-center">{{ $t('whereDoYouWantToGo') }}</h3>
                    <h6 class="d-flex justify-center">{{ $t('customRecommendations') }}</h6>
                    <v-row :class="[platform === 'web' ? 'my-2 d-flex justify-center' : 'my-1 d-flex justify-center']">
                        <v-col
                            cols="12" 
                            sm="6" 
                            md="6"
                        >
                            <v-text-field
                                v-model="selectedState"
                                rounded
                                variant="solo"
                                ref="cityInputRef"
                                id="cityInput"
                                :placeholder="$t('search')"
                                style="margin-left: 24px;margin-top: 24px;"
                                prepend-icon="mdi-map-marker"
                                hide-details
                                class="ma-0"
                            ></v-text-field>
                            <!-- <v-autocomplete
                                v-model="selectedState"
                                :items="wilayaStore.getWilayas"
                                item-title="name"
                                return-object
                                :label="$t('destination')"
                                required
                            ></v-autocomplete> -->
                        </v-col>
                    </v-row>
                    <h4 class="d-flex justify-center">{{ $t('orPopularDestination') }}</h4>
                    <v-row>
                        <v-col cols="12" class="text-center">
                            <div class="text-subtitle-1 mb-4">
                                {{ $t('popularCities') }}
                            </div>

                            <v-chip
                                v-for="c in popularCities"
                                :key="c.name"
                                class="ma-1"
                                color="next"
                                variant="outlined"
                                @click="selectCity(c)"
                            >
                                {{ c.name }}
                            </v-chip>
                        </v-col>
                    </v-row>
                </v-container>
            </template>

            <template v-slot:item.2>
                <v-container class="py-8">
                    <v-row class="mb-8">
                        <v-col cols="12">
                            <h2 class="text-h5 font-weight-bold mb-2">Select Your Travel Dates</h2>
                            <p class="text-subtitle-2 text-medium-emphasis">Choose start and end dates from either calendar</p>
                        </v-col>
                    </v-row>

                   
                    <v-row>
                        
                        <v-col cols="12" md="6">
                            <v-card>
                                <v-card-item>
                                    <v-card-title class="text-h6">
                                        {{ new Date(today).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }}
                                    </v-card-title>
                                </v-card-item>
                                <v-card-text>
                                    <v-date-picker
                                        :day-props="getDayProps"
                                        v-model="pickerOneDate"
                                        :min="today"
                                        @update:model-value="handlePickerOneSelection"
                                    />
                                </v-card-text>
                            </v-card>
                        </v-col>

                       
                        <v-col cols="12" md="6">
                            <v-card>
                                <v-card-item>
                                    <v-card-title class="text-h6">
                                        {{ new Date(now.getFullYear(), nextMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }}
                                    </v-card-title>
                                </v-card-item>
                                <v-card-text>
                                    <v-date-picker
                                        :day-props="getDayProps"
                                        v-model="pickerTwoDate"
                                        :min="today"
                                        :month="nextMonth"
                                        :year="nextYear"
                                        @update:model-value="handlePickerTwoSelection"
                                    />
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>

                    
                    <v-row v-if="debutDate || endDate" class="mt-8">
                        <v-col cols="12">
                            <v-card color="info">
                                <v-card-text class="text-white">
                                    <v-row align="center">
                                        <v-col cols="12" sm="4">
                                            <div class="text-caption">Start Date</div>
                                            <div class="text-h6 font-weight-bold">
                                                {{ debutDate ? new Date(debutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—' }}
                                            </div>
                                        </v-col>
                                        <v-col cols="12" sm="4">
                                            <div class="text-caption">End Date</div>
                                            <div class="text-h6 font-weight-bold">
                                                {{ endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—' }}
                                            </div>
                                        </v-col>
                                        <v-col cols="12" sm="4" class="text-right">
                                            <div class="text-caption">Duration</div>
                                            <div class="text-h5 font-weight-bold">
                                                {{ numberOfDays }} {{ numberOfDays === 1 ? 'day' : 'days' }}
                                            </div>
                                        </v-col>
                                    </v-row>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>

                   
                    <v-row v-if="debutDate && endDate && endDate <= debutDate" class="mt-6">
                        <v-col cols="12">
                            <v-alert type="error" icon="mdi-alert-circle-outline">
                                End date must be after start date
                            </v-alert>
                        </v-col>
                    </v-row>
                </v-container>
            </template>

            <template v-slot:item.3>
                <v-container>
                    <h3 class="text-h6 mb-4">{{ $t('selectOne') }}</h3>

                    <v-sheet rounded border class="pa-6">
                    <v-row>
                        <v-col cols="12" md="6">
                        <v-radio-group
                            v-model="tripType"
                            row
                            :label="$t('selectTripType')"
                        >
                        <v-radio
                            v-for="trip in trips"
                            :key="trip.value"
                            :label="trip.label"
                            :value="trip.value"
                        >
                            <template #label>
                            <div class="d-flex align-center">
                                <v-icon class="me-2">{{ trip.icon }}</v-icon>
                                <span>{{ trip.label }}</span>
                            </div>
                            </template>
                        </v-radio>
                        </v-radio-group>
                        </v-col>
                    </v-row>
                    </v-sheet>

                </v-container>
            </template>

            <template v-slot:item.4>
                <v-container>
                    <h3 class="text-h6 mb-4">{{ $t('tellUsYourInterests') }}</h3>
                    <v-sheet rounded border class="pa-6">
                        <v-row>
                            <v-col cols="12">
                                <label>{{ $t('selectActivities') }}</label>
                                <v-row>
                                <v-col cols="12" sm="6" v-for="activity in activities" :key="activity.value">
                                    <v-checkbox
                                    v-model="selectedActivities"
                                    :value="activity.value"
                                    >
                                    <template #label>
                                        <div class="d-flex align-center">
                                        <span v-if="activity.icon" class="me-2">
                                            <v-icon>{{ activity.icon }}</v-icon>
                                        </span>
                                        {{ activity.label }}
                                        </div>
                                    </template>
                                    </v-checkbox>
                                </v-col>
                                </v-row>
                            </v-col>
                        </v-row>
                    </v-sheet>

                    <div class="text-center mt-6">
                        <v-btn 
                            color="next" 
                            @click="submitTrip" 
                            rounded 
                            :loading="tripStore.isLoading"
                        >
                            {{ $t('confirmAndSubmit') }}
                        </v-btn>
                    </div>
                </v-container>
            </template>
        </v-stepper>
   
    </v-container>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import { useTripsStore } from '@/stores/trips'
    import { useRestaurantsStore } from '@/stores/restaurants'
    import { useHotelsStore } from '@/stores/hotels'
    import { useSitesStore } from '@/stores/sites'
    import { useAuthStore } from '@/stores/auth'
    import { useWilayasStore } from '@/stores/wilaya'
    
    const router = useRouter()
    const tripStore = useTripsStore()
    const restaurants = useRestaurantsStore()
    const hotels = useHotelsStore()
    const sites = useSitesStore()
    const auth = useAuthStore()
    const wilayaStore = useWilayasStore()

    const step = ref(1)
    const isSubmitting = ref(false)

    //
    const debutDate = ref(null)
    const endDate = ref(null)
    const pickerOneDate = ref(null)
    const pickerTwoDate = ref(null)

    const now = new Date()

    // TODAY (YYYY-MM-DD)
    const today = ref(now.toISOString().split('T')[0])

    // current month/year
    const currentMonth = ref(now.getMonth())
    const currentYear = ref(now.getFullYear())

    // next month/year
    const nextMonth = ref((now.getMonth() + 1) % 12)
    const nextYear = ref(
        now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear()
    )

    // Calculate number of days between debut and end dates
    const numberOfDays = computed(() => {
        if (!debutDate.value || !endDate.value) return 0
        
        const start = new Date(debutDate.value)
        const end = new Date(endDate.value)
        
        if (end <= start) return 0
        
        const diffTime = Math.abs(end - start)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    })

    // Generate array of dates between debut and end date for highlighting
    const highlightedDates = computed(() => {
        if (!debutDate.value || !endDate.value) {
            return debutDate.value ? [debutDate.value] : []
        }

        const dates = []
        const start = new Date(debutDate.value)
        const end = new Date(endDate.value)
        
        // Ensure start is before end
        const actualStart = start < end ? start : end
        const actualEnd = start < end ? end : start

        // Generate all dates in range
        for (let d = new Date(actualStart); d <= actualEnd; d.setDate(d.getDate() + 1)) {
            dates.push(d.toISOString().split('T')[0])
        }
        
        return dates
    })

    // Validate that both dates are selected and end > debut
    const selectedDates = computed(() => {
        return debutDate.value && endDate.value && endDate.value > debutDate.value
            ? [debutDate.value, endDate.value]
            : []
    })

    //
    const items = ref([
            'State',
            'Dates',
            'Trip Type',
            'Activities'
        ])

    const selectedState = ref('')

    // const today = new Date().toISOString().slice(0, 10)

    // const dateRange = ref([])

    const tripType = ref('')

    const trips = [
        { label: 'Solo trip', value: 'SOLO', icon: 'mdi-account' },
        { label: 'Friends trip', value: 'FRIENDS', icon: 'mdi-account-group' },
        { label: 'Family trip', value: 'FAMILY', icon: 'mdi-account-multiple' }
    ]

    const selectedActivities = ref([])

    const activities = [
        { label: 'Must-see Attractions', value: '1366e1065346f7a8a7105c81378fc5a2' },
        { label: 'Great Food', value: 'bfcd861aa8f74bf6b2091502e6a2c050' },
        { label: 'Hidden Gems', value: '3357cca0e7092e7e4fcd42d9001d7958' },
        { label: 'Tours & Experiences', value: '7569fb4bae5e6d0513eb4c4ee3f428e9' },
        { label: 'Historical Landmarks', value: 'cb0a104a22264b1019fdd3fa088f47d2' },
        { label: 'Art Galleries', value: '4dfbcb53b37dd9392568ae020ba1d6b5' },
        { label: 'Algerian Cuisine', value: 'f91a11406a71931e93d1e5932ab102fb' },
        { label: 'Family-friendly Museums', value: 'ecce9b7d8c1950db6c115f54f8d2c26a' },
        { label: 'Luxury Shopping', value: '2e453480292d139cffc7e37cb15ac30a' },
        { label: 'Adventure and Sports', value: '7cbcefac00b8ca2b54fcb738d1a28760' },
        { label: 'Arts & Theatre', value: '4f1e0103a9a182f97b7b8d9d21b4c6be' },
        { label: 'Culture', value: '1a86474175f886c1f1a6945d5e19923d' },
        { label: 'Other', value: 'OTHER', icon: 'mdi-plus' }
    ]

    
    const platform = ref('')
    const user = ref(null)

    // Validations
    const isStep1Valid = computed(() => selectedState.value)
    
    // const isStep2Valid = computed(() => dateRange.value.length > 1)
    // const isStep2Valid = computed(() => selectedDates.value.length > 0)
    const isStep2Valid = computed(() => selectedDates.value.length > 1)

    const isStep3Valid = computed(() => {
        return tripType.value
    })

    
    const isNextDisabled = computed(() => {
        if (step.value === 1) return !isStep1Valid.value
        if (step.value === 2) return !isStep2Valid.value
        if (step.value === 3) return !isStep3Valid.value
        if (step.value === 4) return true 
        return false
    })

    const dateRange = computed(() => {
        return selectedDates.value.length === 2 ? selectedDates.value : []
    })

    const getDayProps = (date) => {
        const d = new Date(date).toISOString().split('T')[0]
        if (d === debutDate.value) return { class: 'range-start' }
        if (d === endDate.value) return { class: 'range-end' }
        if (highlightedDates.value.includes(d)) return { class: 'range-middle' }
        return {}
    }


    const submitTrip = async () => {
        isSubmitting.value = true
        await tripStore.generateTripWithAI({
            creator: user.value._id,
            city: selectedState.value,
            days: numberOfDays.value,
            startDate: debutDate.value,
            endDate: endDate.value,
            budget: 'medium',
            preferences: ['hotels', 'restaurants', 'tourist sites'],
            destination: selectedState.value,
            hotels: hotels.normalizeHotelsForIA.slice(0, 5),
            restaurants: restaurants.normalizeRestaurantsForIA.slice(0, 5),
            sites: sites.normalizeSitesForIA.slice(0, 5)
        })

        router.push({
            name: 'TripDetail',
            params: {
                id: tripStore.getCurrentTrip._id
            }
        })

    }

    const setupAutocomplete = async () => {
  
        const input = document.getElementById('cityInput')
        
        const options = {
            types: ['(cities)'],
            componentRestrictions: { country: 'dz' }
        }

        const autocomplete = new google.maps.places.Autocomplete(input, options)

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace()
            if (!place.geometry) {
            alert("No details available for input: '" + place.name + "'")
            return
            }
            const location = place.geometry.location
            restaurants.fetchRestaurants(location.lat(), location.lng())
            hotels.fetchHotels(location.lat(), location.lng())
            sites.fetchSites(location.lat(), location.lng())
        })
    }

    const popularCities = [
        { name: 'Algiers', lat: 36.7538, lng: 3.0588 },
        { name: 'Oran', lat: 35.6971, lng: -0.6308 },
        { name: 'Constantine', lat: 36.3650, lng: 6.6147 },
        { name: 'Annaba', lat: 36.9040, lng: 7.7550 }
    ]

    const selectCity = (c) => {
        selectedState.value = c.name
        restaurants.fetchRestaurants(c.lat, c.lng)
        hotels.fetchHotels(c.lat, c.lng)
        sites.fetchSites(c.lat, c.lng)
    }

    // Handle date selection from picker one
    const handlePickerOneSelection = (date) => {
        if (!date) return
        
        // If both dates are already selected, reset and start new selection
        if (debutDate.value && endDate.value) {
            debutDate.value = date
            endDate.value = null
        }
        // If no debut date yet, set it as debut
        else if (!debutDate.value) {
            debutDate.value = date
        }
        // If debut exists and this date is after it, set as end date
        else if (date > debutDate.value) {
            endDate.value = date
        }
        // If this date is before debut, swap them
        else if (date < debutDate.value) {
            endDate.value = debutDate.value
            debutDate.value = date
        }
        // Clear picker for next selection
        pickerOneDate.value = null
    }

    // Handle date selection from picker two
    const handlePickerTwoSelection = (date) => {
        if (!date) return
        
        // If both dates are already selected, reset and start new selection
        if (debutDate.value && endDate.value) {
            debutDate.value = date
            endDate.value = null
        }
        // If no debut date yet, set it as debut
        else if (!debutDate.value) {
            debutDate.value = date
        }
        // If debut exists and this date is after it, set as end date
        else if (date > debutDate.value) {
            endDate.value = date
        }
        // If this date is before debut, swap them
        else if (date < debutDate.value) {
            endDate.value = debutDate.value
            debutDate.value = date
        }
        // Clear picker for next selection
        pickerTwoDate.value = null
    }

    onMounted(async () => {
        platform.value = Capacitor.getPlatform()
        const ls = await auth.getLSUserInfo()
        user.value = ls?.user
        wilayaStore.fetchWilayas()
        setupAutocomplete()
    })
    
</script>

<style scoped>
    /* Constrain the container's maximum width */
    .main-container {
        max-width: 1200px;
        margin-left: auto;
        margin-right: auto;
    }

    .border-placeholder {
        border: 2px dashed #ccc;
        min-height: 200px;
        background-color: #f9f9f9;
    }

    /* targets Vuetify 3 header classes and forces zero height */
    :v-deep .v-stepper-header,
    :v-deep .v-stepper__header,
    :v-deep .v-stepper-header[role="tablist"] {
        display: none !important;
        height: 0 !important;
        min-height: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
    }

    /* also remove any leftover top margin from the stepper root */
    :v-deep .v-stepper {
        margin-top: 0 !important;
    }

   /* ================================ */
/* VUETIFY 3 RANGE PICKER STYLING   */
/* CSS ONLY – NO LOGIC CHANGES      */
/* ================================ */
::deep(.range-start .v-btn),
::deep(.range-end .v-btn) {
  background-color: #1976d2 !important;
  color: white !important;
  border-radius: 50%;
}

::deep(.range-middle .v-btn) {
  background-color: rgba(25, 118, 210, 0.25) !important;
  color: #1976d2 !important;
  border-radius: 0;
}


</style>