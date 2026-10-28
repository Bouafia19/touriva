import { defineStore } from 'pinia'
import axios from 'axios'

export const usePlacesStore = defineStore('places', {
  state: () => ({
    places: [],
    loading: false,
    currentPlace: null,
  }),

  getters: {
    getPlaces: (state) => state.places,

    getPlaceById: (state) => (placeId) => {
      return state.places.find(
        p => p._id === placeId || p.id === placeId || p.name === placeId
      )
    },
    getCurrentPlace: (state) => state.currentPlace,
    getCuurrentPlace: (state) => state.currentPlace
  },

  actions: {
    setTrip(place) {
      this.currentPlace = place
    },

    async fetchNearby(type, lat, lng) {
      this.loading = true
      try {
        let endpoint = '/api/sites/localSites'
        if (type === 'restaurant' || type === 'restaurants') {
          endpoint = '/api/restaurants/localRestaurants'
        } else if (type === 'hotel' || type === 'lodging') {
          endpoint = '/api/hotels/localHotels'
        }

        const res = await axios.post(endpoint, { lat, lng })
        this.places = res.data || []
      } catch (err) {
        console.warn('Failed to fetch nearby places locally:', err.message)
        this.places = []
      } finally {
        this.loading = false
      }
    }
  }
})
