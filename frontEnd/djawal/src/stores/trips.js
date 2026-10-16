import { defineStore } from 'pinia'
import axios from 'axios'
import { useTripSubscriptionsStore } from './tripsubscriptions'

export const useTripsStore = defineStore('trips', {
  state: () => ({
    trips: [],
    tripsByUser: [],
    currentTrip: null,
    loading: false,
    error: null
  }),

  getters: {
    getTrips: (state) => state.trips,
    getTripsByUser: (state) => state.tripsByUser,
    getCurrentTrip: (state) => state.currentTrip,
    isLoading: (state) => state.loading
  },

  actions: {
    // 🔹 Fetch all trips
    async fetchTrips() {
      this.loading = true
      this.error = null
      try {
        const res = await axios.get('/api/trips')
        this.trips = res.data.filter(trip => trip.creator?.typeAccount != 'visitor' && trip.published)
      } catch (err) {
        this.error = 'Failed to fetch trips'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    // 🔹 Fetch single trip by ID
    async fetchTripById(id) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.get(`/api/trips/${id}`)
        this.currentTrip = res.data
      } catch (err) {
        this.error = 'Failed to fetch trip'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    // 🔹 Set trip locally (used by goToTrip)
    setTrip(trip) {
      this.currentTrip = trip
    },

    // 🔹 Create new trip
    async createTrip(tripData) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.post('/api/trips', tripData)
        this.trips.unshift(res.data)
        return res.data
      } catch (err) {
        this.error = 'Failed to create trip'
        console.error(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    // UPDATE
    async updateTrip(tripId, tripData) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.put(`/api/trips/${tripId}`, tripData)

        const index = this.trips.findIndex(t => t._id === tripId)
        if (index !== -1) {
          this.trips[index] = res.data
        }

        return res.data
      } catch (err) {
        this.error = 'Failed to update trip'
        console.error(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchTripsByUser(userId) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.get(`/api/trips/user/${userId}`)
        this.tripsByUser = res.data
        console.log('Fetched trips by user:', this.tripsByUser)
        const tripSubscriptionsStore = useTripSubscriptionsStore()
        tripSubscriptionsStore.userSubscriptionsList = []  // Clear previous subscriptions
        for (let trip of this.tripsByUser) {
          tripSubscriptionsStore.fetchSubscriptionsByTrip(trip._id)
        }
      } catch (err) {
        this.error = 'Failed to fetch trips'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async generateTripWithAI(payload) {
      this.loading = true
      try {
        const res = await axios.post('/api/aiTrips/generate', payload)
        this.currentTrip = res.data
        this.trips.unshift(res.data)
        return res.data
      } finally {
        this.loading = false
      }
    },

    async deleteTrip(tripId) {
      this.loading = true
      this.error = null
      try {
        await axios.delete(`/api/trips/${tripId}`)
        this.trips = this.trips.filter(trip => trip._id !== tripId)
        if (this.currentTrip?._id === tripId) {
          this.currentTrip = null
        }
      } catch (err) {
        this.error = 'Failed to delete trip'
        console.error(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    // 🔹 Clear selected trip (optional)
    clearCurrentTrip() {
      this.currentTrip = null
    }

  }
})
