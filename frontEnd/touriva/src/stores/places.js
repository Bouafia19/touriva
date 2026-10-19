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
        p => p.name === `places/${placeId}`
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
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || 'AIzaSyDxFsMTjS-UsZgkJXcAPbtLQFHmNrg7wN4'
        const res = await axios.post(
          'https://places.googleapis.com/v1/places:searchNearby',
          {
            includedTypes: [type],
            maxResultCount: 20,
            locationRestriction: {
              circle: {
                center: { latitude: lat, longitude: lng },
                radius: 2000
              }
            }
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': apiKey,
              'X-Goog-FieldMask': `
                places.name,
                places.displayName,
                places.formattedAddress,
                places.rating,
                places.photos,
                places.location
              `
            }
          }
        )

        this.places = res.data.places || []
      } finally {
        this.loading = false
      }
    }
  }
})
