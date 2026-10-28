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
                let localHotels = []
                try {
                    const localResponse = await axios.post('/api/hotels/localHotels', { lat, lng })
                    localHotels = localResponse.data || []
                } catch (e) {
                    console.warn('Local hotels query failed, falling back to catalog:', e.message)
                }

                if (!localHotels.length) {
                    try {
                        const catalogRes = await axios.get('/api/hotels')
                        localHotels = catalogRes.data || []
                    } catch (e) {
                        console.warn('Catalog hotels query failed:', e.message)
                    }
                }

                localHotels.forEach(h => {
                    h.location = { latitude: h.latitude, longitude: h.longitude }
                    if (!h.displayName) {
                        h.displayName = { text: h.name }
                    }
                })
                
                this.hotels = localHotels
                this.normalizeHotelsForIA = this.normalizeHotels(localHotels)
            } catch (err) {
                console.error('Failed to load hotels:', err)
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
            return (places || []).map(p => ({
                name: p.displayName?.text || p.name || 'Hotel',
                lat: p.location?.latitude || p.latitude,
                lng: p.location?.longitude || p.longitude,
                rating: p.rating || 4.2,
                address: p.formattedAddress || p.address || '',
                image: p.photo || p.image || '/no-image.png'
            }))
        }
    }
})