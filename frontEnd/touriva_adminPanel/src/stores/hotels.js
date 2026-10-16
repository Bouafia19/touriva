import { defineStore } from 'pinia';
import axios from 'axios'

export const useHotelsStore = defineStore('hotels', {
    
    state: () => ({
        hotels: [],
        alertHotels: []
    }),

    getters: {
        getHotels: (state) => state.hotels,
        getAlertHotels: (state) => state.alertHotels
    },

    actions: {
        //hotels component
        async fetchHotels(){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get('api/hotels', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            this.hotels = response.data
            this.alertHotels = response.data.filter(hotel => hotel.status === "pending")
            
        },

        // add hotels
        async addHotels(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.post('api/hotels', params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                });
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // edit hotels
        async editHotels(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.patch(`api/hotels/${params._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // delete hotels
        async deleteHotels(id){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.delete(`api/hotels/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
            })
        },
    }
})