<template>
    <v-container 
        fluid 
        :class="[platform === 'web' ? 'px-0 main-container' : '']"
    >
        <!-- <v-row>
            <v-col class="d-flex justify-start">
                <v-btn 
                    color="next"
                    @click="returnTo"
                    variant="text"
                    prepend-icon="mdi-arrow-left" 
                >
                    {{ $t('Return') }}
                </v-btn>
            </v-col>
        </v-row> -->

        <v-row class="align-center px-4 mb-2">
            <v-col class="d-flex align-center justify-space-between">
                
                <h1 class="ma-0">
                    {{ $t('Hotels') }}
                </h1>

                <PlaceDialog 
                    type="hotel" 
                    v-if="isAgency || isGuide || isAssociation"
                />

            </v-col>
        </v-row>

        <v-row class="d-flex justify-center mt-2">
            <v-col
                md="4"
                class="pt-0"
            >
                <v-text-field
                    v-model="city"
                    rounded
                    variant="solo"
                    id="cityInput"
                    :placeholder="$t('search')"
                    style="margin-left: 24px;margin-top: 24px;"
                    prepend-icon="mdi-map-marker"
                    hide-details
                    class="ma-2"
                ></v-text-field>
                
            </v-col>
        </v-row>

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

        <v-row>

            <!-- LOADING SKELETONS -->
            <template v-if="hotels.isLoading">
                <v-col
                v-for="n in 6"
                :key="n"
                cols="12"
                sm="6"
                md="4"
                >
                <v-card elevation="1">
                    <v-skeleton-loader
                    type="image, heading, text, text"
                    height="300"
                    />
                </v-card>
                </v-col>
            </template>

            <!-- EMPTY STATE (AFTER LOAD) -->
            <template v-else-if="!hotels.getHotels.length">
                <v-col cols="12">
                <v-alert
                    type="info"
                    variant="tonal"
                    border="start"
                    prominent
                >
                    {{ $t('noHotelsFound') }}
                </v-alert>
                </v-col>
            </template>

            <!-- REAL CONTENT -->
            <template v-else>
                <v-col
                v-for="hotel in hotels.getHotels"
                :key="hotel.id"
                cols="12"
                sm="6"
                md="4"
                >
                <HotelCard :hotel="hotel" />
                </v-col>
            </template>
        </v-row>

    </v-container>
</template>

<script setup>
    import { Capacitor } from '@capacitor/core'
    import { Geolocation } from '@capacitor/geolocation'
    import { ref, onMounted, computed } from 'vue'
    import { useRouter } from 'vue-router'
    import HotelCard from '@/components/HotelCard.vue'
    import PlaceDialog from '@/components/DialogAdd.vue'
    import { useHotelsStore } from '@/stores/hotels'
    import { useAuthStore } from '@/stores/auth'

    const hotels = useHotelsStore()
    const router = useRouter()
    const auth = useAuthStore()

    const platform = ref(null),
            city = ref(''),
            dialog = ref(false),
            typeAccount = ref("")

    const popularCities = [
        { name: 'Algiers', lat: 36.7538, lng: 3.0588 },
        { name: 'Oran', lat: 35.6971, lng: -0.6308 },
        { name: 'Constantine', lat: 36.3650, lng: 6.6147 },
        { name: 'Annaba', lat: 36.9040, lng: 7.7550 }
    ]

    const isAgency = computed(() => typeAccount.value === 'touristAgencies')
    const isGuide = computed(() => typeAccount.value === 'touristGuide')
    const isAssociation = computed(() => typeAccount.value === 'associations')

    const selectCity = (c) => {
        city.value = c.name
        hotels.fetchHotels(c.lat, c.lng)
    }

    const returnTo = () => {
        router.go(-1)
    }

    const goToCreate = () => {
        dialog.value = true
    }

    const requestGps = async () => {
        try {
          await Geolocation.requestPermissions()
        } catch (error) {
          
        }
    }

    const currentPosition = async () => {
        try {
          const coordinates = await Geolocation.getCurrentPosition({
                                        enableHighAccuracy: true
                                    })
          if(coordinates.coords){
            console.log('Current position:', coordinates.coords.latitude, coordinates.coords.longitude)
            hotels.fetchHotels(coordinates.coords.latitude, coordinates.coords.longitude)
          }
        } catch (error) {
          console.log('error', error)
        }
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
            console.log('Selected city:', place.name, location.lat(), location.lng())
            hotels.fetchHotels(location.lat(), location.lng())
        })
    }

    onMounted(async() => {
        platform.value = Capacitor.getPlatform()
        const ls = await auth.getLSUserInfo()
        if(ls?.user?.typeAccount){
            typeAccount.value = ls.user.typeAccount
        }
        setupAutocomplete()
        requestGps().then(() => {
            currentPosition()
        })
    })
</script>

<style scoped>

    .main-container {
        max-width: 1200px;
        margin-left: auto;
        margin-right: auto;
    }

</style>