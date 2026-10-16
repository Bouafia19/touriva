import { defineStore } from 'pinia';
import axios from 'axios'

export const useTripsStore = defineStore('trips', {
    
    state: () => ({
        trips: [],
        alertTrips: []
    }),

    getters: {
        getTrips: (state) => state.trips,
        getAlertTrips: (state) => state.alertTrips
    },

    actions: {
        //trips component
        async fetchTrips(){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get('api/trips', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            this.trips = response.data
            this.alertTrips = response.data.filter(trip => trip.status === "pending")
        },

        // add trips
        async addTrips(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.post('api/trips', params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                });
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // edit trips
        async editTrips(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.put(`api/trips/${params._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // delete trips
        async deleteTrips(id){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.delete(`api/trips/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
            })
        },
    }
})