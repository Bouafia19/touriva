import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

export const useSitesStore = defineStore('sites', {
    
    state: () => ({
        sites: [],
        loading: false,
        normalizeSitesForIA: []
    }),

    getters: {
        getSites: (state) => state.sites,
        isLoading: (state) => state.loading,
        getNormalizedSitesForIA: (state) => state.normalizeSitesForIA   
    },

    actions: {
        async fetchCatalogSites() {
            this.loading = true
            this.error = null
            try {
                const res = await axios.get('/api/sites')
                if (Array.isArray(res.data) && res.data.length > 0) {
                    this.sites = res.data.map(s => ({
                        ...s,
                        displayName: { text: s.name },
                        formattedAddress: s.address,
                        rating: s.rating || 4.5,
                        reviews: s.reviews || 24,
                        photo: s.photo || s.image || null
                    }))
                }
            } catch (err) {
                console.error('Failed to load catalog sites:', err)
            } finally {
                this.loading = false
            }
        },
        async fetchSites(lat, lng) {
            this.loading = true
            this.error = null
            try {
                let localSites = []
                try {
                    const localResponse = await axios.post('/api/sites/localSites', { lat, lng })
                    localSites = localResponse.data || []
                } catch (e) {
                    console.warn('Local sites query failed, falling back to catalog:', e.message)
                }

                if (!localSites.length) {
                    try {
                        const catalogRes = await axios.get('/api/sites')
                        localSites = catalogRes.data || []
                    } catch (e) {
                        console.warn('Catalog sites query failed:', e.message)
                    }
                }

                localSites.forEach(s => {
                    s.location = { latitude: s.latitude, longitude: s.longitude }
                    if (!s.displayName) {
                        s.displayName = { text: s.name }
                    }
                })

                this.sites = localSites
                this.normalizeSitesForIA = this.normalizeSites(localSites)
            } catch (err) {
                console.error('Failed to load sites:', err)
                this.error = 'Failed to load sites'
                this.sites = []
            } finally {
                this.loading = false
            }
        },

        async addSites(params){
            const auth = useAuthStore()
            const ls = await auth.getLSUserInfo()
            if (!ls || !ls.token) throw new Error('Unauthenticated')
            try {
                const response = await axios.post('api/sites', params)
                return response.data
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },

        normalizeSites(places) {
            return (places || []).map(p => ({
                name: p.displayName?.text || p.name || 'Tourism Site',
                lat: p.location?.latitude || p.latitude,
                lng: p.location?.longitude || p.longitude,
                rating: p.rating || 4.5,
                address: p.formattedAddress || p.address || '',
                image: p.photo || p.image || '/no-image.png'
            }))
        }

    }
})