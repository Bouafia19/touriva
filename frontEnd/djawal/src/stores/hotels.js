import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

export const useHotelsStore = defineStore('hotels', {
    
    state: () => ({
        hotels: [],
        loading: false,
        normalizeHotelsForIA: []
    }),

    getters: {
        getHotels: (state) => state.hotels,
        isLoading: (state) => state.loading,
        getNormalizedHotelsForIA: (state) => state.normalizeHotelsForIA
    },

    actions: {
        
        async fetchHotels(lat, lng) {
            this.loading = true
            this.error = null

            try {
                const response = await axios.post(
                'https://places.googleapis.com/v1/places:searchNearby',
                {
                    includedTypes: ['lodging'],
                    maxResultCount: 20,
                    locationRestriction: {
                    circle: {
                        center: { latitude: lat, longitude: lng },
                        radius: 2000,
                    },
                    },
                },
                {
                    headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': 'AIzaSyDxFsMTjS-UsZgkJXcAPbtLQFHmNrg7wN4',
                    'X-Goog-FieldMask':
                        'places.name,places.displayName,places.photos,places.location,places.rating,places.formattedAddress',
                    },
                }
                )

                //
                const googleHotels = response.data.places || []
                console.log('Google hotels:', googleHotels)
                // 2️⃣ Local hotels from MongoDB
                let localResponse = await axios.post('/api/hotels/localHotels', { lat, lng })

                localResponse.data.forEach(h => {
                    h.location = { latitude: h.latitude, longitude: h.longitude }
                })
                
                const localHotels = localResponse.data || []

                console.log('Local hotels:', localHotels)

                // 3️⃣ Merge both
                this.hotels = [...localHotels, ...googleHotels]
                // this.hotels = response.data.places || []

                const res = await axios.post('/api/hotels/import', {
                    hotels: googleHotels
                })
                this.normalizeHotelsForIA = this.normalizeHotels(googleHotels)
            } catch (err) {
                console.error(err)
                this.error = 'Failed to load hotels'
                this.hotels = []
            } finally {
                this.loading = false
            }
        },

        async addHotels(params){
            const auth = useAuthStore()
            const ls = await auth.getLSUserInfo()

            try {
                const response = await axios.post('api/hotels', params, {
                    headers: {
                        'Authorization': `Bearer ${ls?.token}`
                    }
                })
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        normalizeHotels(places) {
            return places.map(p => ({
                name: p.displayName?.text || 'Unknown hotel',
                lat: p.location?.latitude,
                lng: p.location?.longitude,
                rating: p.rating || null,
                address: p.formattedAddress || '',
                image: p.photos?.length
                ? `https://places.googleapis.com/v1/${p.photos[0].name}/media?maxWidthPx=800&key=AIzaSyDxFsMTjS-UsZgkJXcAPbtLQFHmNrg7wN4`
                : ''
            }))
        }
    }
})