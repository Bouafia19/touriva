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
        async fetchCatalogHotels() {
            this.loading = true
            this.error = null
            try {
                const res = await axios.get('/api/hotels')
                if (Array.isArray(res.data) && res.data.length > 0) {
                    this.hotels = res.data.map(h => ({
                        ...h,
                        displayName: { text: h.name },
                        formattedAddress: h.address,
                        rating: h.rating || 4.2,
                        reviews: h.reviews || 18,
                        photo: h.photo || h.image || null
                    }))
                }
            } catch (err) {
                console.error('Failed to load catalog hotels:', err)
            } finally {
                this.loading = false
            }
        },
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
            if (!ls || !ls.token) throw new Error('Unauthenticated')
            try {
                const response = await axios.post('api/hotels', params)
                return response.data
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
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