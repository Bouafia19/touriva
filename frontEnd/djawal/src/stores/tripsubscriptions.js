import { defineStore } from 'pinia'
import axios from 'axios'

export const useTripSubscriptionsStore = defineStore('tripSubscriptionSubscriptions', {
  state: () => ({
    userSubscriptionsList: [],
    currentTripSubscription: null,
    loading: false,
    error: null
  }),

  getters: {
    getUserSubscriptionsList: (state) => state.userSubscriptionsList,
    getCurrentTripSubscription: (state) => state.currentTripSubscription,
    isLoading: (state) => state.loading
  },

  actions: {
    // 🔹 Fetch all tripSubscriptionSubscriptions
    async fetchSubscriptionsByTrip(tripId) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.get(`/api/tripSubscriptions/subscriptionByTrip/${tripId}`)
        if(res.status === 200){
            if(res.data.subscriptions.length > 0){
                this.userSubscriptionsList.push(res.data)
            }
        }
      } catch (err) {
        this.error = 'Failed to fetch tripSubscriptions'
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    // 🔹 Set tripSubscription locally (used by goToTripSubscription)
    setTripSubscription(tripSubscription) {
      this.currentTripSubscription = tripSubscription
    },

    // 🔹 Clear selected tripSubscription (optional)
    clearCurrentTripSubscription() {
      this.currentTripSubscription = null
    }

  }
})
