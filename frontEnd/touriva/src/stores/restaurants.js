import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

export const useRestaurantsStore = defineStore('restaurants', {
    
    state: () => ({
        restaurants: [],
        loading: false,
        normalizeRestaurantsForIA: []
    }),

    getters: {
        getRestaurants: (state) => state.restaurants,
        isLoading: (state) => state.loading,
        getNormalizedRestaurantsForIA: (state) => state.normalizeRestaurantsForIA   
    },

    actions: {
        async fetchCatalogRestaurants() {
            this.loading = true
            this.error = null
            try {
                const res = await axios.get('/api/restaurants')
                if (Array.isArray(res.data) && res.data.length > 0) {
                    this.restaurants = res.data.map(r => ({
                        ...r,
                        displayName: { text: r.name },
                        formattedAddress: r.address,
                        rating: r.rating || 4.4,
                        reviews: r.reviews || 32,
                        photo: r.photo || r.image || null
                    }))
                }
            } catch (err) {
                console.error('Failed to load catalog restaurants:', err)
            } finally {
                this.loading = false
            }
        },
        async fetchRestaurants(lat, lng) {
            this.loading = true
            this.error = null

            try {
            
                const response = await axios.post(
                    'https://places.googleapis.com/v1/places:searchNearby',
                    {
                        "includedTypes": ["restaurant"],
                        "maxResultCount": 20,
                        "locationRestriction": {
                            "circle": {
                                "center": { "latitude": lat, "longitude": lng },
                                "radius": 2000
                            }
                        }
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Goog-Api-Key': 'AIzaSyDxFsMTjS-UsZgkJXcAPbtLQFHmNrg7wN4',
                            'X-Goog-FieldMask': 'places.name,places.displayName,places.photos,places.location,places.rating,places.formattedAddress'
                        }
                    }
                )

                //
                const googleRestaurants = response.data.places || []

                // 2️⃣ Local restaurants from MongoDB
                const localResponse = await axios.post('/api/restaurants/localRestaurants', { lat, lng })
                let localRestaurants = localResponse.data || []

                localResponse.data.forEach(r => {
                    r.location = { latitude: r.latitude, longitude: r.longitude }
                })

                console.log('Local restaurants:', localRestaurants)

                // 3️⃣ Merge both
                this.restaurants = [...localRestaurants, ...googleRestaurants]

                const res = await axios.post('/api/restaurants/import', {
                    restaurants: googleRestaurants
                })
                this.normalizeRestaurantsForIA = this.normalizeRestaurants(response.data.places || [])
    
            } catch (err) {
                console.error(err)
                this.error = 'Failed to load restaurants'
                this.restaurants = []
            } finally {
                this.loading = false
            }
        },

        async addRestaurants(params){
            const auth = useAuthStore()
            const ls = await auth.getLSUserInfo()
            try {
                const response = await axios.post('api/restaurants', params, {
                    headers: {
                        'Authorization': `Bearer ${ls?.token}`
                    }
                })
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        normalizeRestaurants(places) {
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