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
                let localRestaurants = []
                try {
                    const localResponse = await axios.post('/api/restaurants/localRestaurants', { lat, lng })
                    localRestaurants = localResponse.data || []
                } catch (e) {
                    console.warn('Local restaurants query failed, falling back to catalog:', e.message)
                }

                if (!localRestaurants.length) {
                    try {
                        const catalogRes = await axios.get('/api/restaurants')
                        localRestaurants = catalogRes.data || []
                    } catch (e) {
                        console.warn('Catalog restaurants query failed:', e.message)
                    }
                }

                localRestaurants.forEach(r => {
                    r.location = { latitude: r.latitude, longitude: r.longitude }
                    if (!r.displayName) {
                        r.displayName = { text: r.name }
                    }
                })

                this.restaurants = localRestaurants
                this.normalizeRestaurantsForIA = this.normalizeRestaurants(localRestaurants)
    
            } catch (err) {
                console.error('Failed to load restaurants:', err)
                this.error = 'Failed to load restaurants'
                this.restaurants = []
            } finally {
                this.loading = false
            }
        },

        async addRestaurants(params){
            const auth = useAuthStore()
            const ls = await auth.getLSUserInfo()
            if (!ls || !ls.token) throw new Error('Unauthenticated')
            try {
                const response = await axios.post('api/restaurants', params)
                return response.data
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },

        normalizeRestaurants(places) {
            return (places || []).map(p => ({
                name: p.displayName?.text || p.name || 'Restaurant',
                lat: p.location?.latitude || p.latitude,
                lng: p.location?.longitude || p.longitude,
                rating: p.rating || 4.4,
                address: p.formattedAddress || p.address || '',
                image: p.photo || p.image || '/no-image.png'
            }))
        }
    }
})