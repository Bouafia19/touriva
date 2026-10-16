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
    getCuurrentPlace: (state) => state.currentPlace
  },

  actions: {
    setTrip(place) {
      this.currentPlace = place
    },

    async fetchNearby(type, lat, lng) {
      this.loading = true
      try {
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
              'X-Goog-Api-Key': process.env.GOOGLE_API_KEY,
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
