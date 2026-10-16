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
        
        async fetchSites(lat, lng) {
            this.loading = true
            this.error = null

            try {
            
                const response = await axios.post(
                    'https://places.googleapis.com/v1/places:searchNearby',
                    {
                        "includedTypes": ["tourist_attraction"],
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
                            'X-Goog-FieldMask': 'places.name,places.displayName,places.photos,places.location,places.rating,places.formattedAddress,places.types'
                        }
                    }
                )

                //
                const googleSites = response.data.places || []

                // 2️⃣ Local sites from MongoDB
                const localResponse = await axios.post('/api/sites/localSites', { lat, lng })
                let localSites = localResponse.data || []

                localResponse.data.forEach(s => {
                    s.location = { latitude: s.latitude, longitude: s.longitude }
                })

                console.log('Local sites:', localSites)

                // 3️⃣ Merge both
                this.sites = [...localSites, ...googleSites]

                const res = await axios.post('/api/sites/import', {
                    sites: googleSites
                })
                this.normalizeSitesForIA = this.normalizeSites(response.data.places || [])
            } catch (err) {
                console.error(err)
                this.error = 'Failed to load sites'
                this.sites = []
            } finally {
                this.loading = false
            }
        },

        async addSites(params){
            const auth = useAuthStore()
            const ls = await auth.getLSUserInfo()
            try {
                const response = await axios.post('api/sites', params, {
                    headers: {
                        'Authorization': `Bearer ${ls?.token}`
                    }
                })
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        normalizeSites(places) {
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