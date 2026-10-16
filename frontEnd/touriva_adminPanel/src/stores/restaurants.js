import { defineStore } from 'pinia';
import axios from 'axios'

export const useRestaurantsStore = defineStore('restaurants', {
    
    state: () => ({
        restaurants: [],
        alertRestaurants: []
    }),

    getters: {
        getRestaurants: (state) => state.restaurants,
        getAlertRestaurants: (state) => state.alertRestaurants
    },

    actions: {
        //restaurants component
        async fetchRestaurants(){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get('api/restaurants', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            this.restaurants = response.data
            this.alertRestaurants = response.data.filter(restaurant => restaurant.status === "pending")
        },

        // add restaurants
        async addRestaurants(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.post('api/restaurants', params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                });
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // edit restaurants
        async editRestaurants(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.patch(`api/restaurants/${params._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // delete restaurants
        async deleteRestaurants(id){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.delete(`api/restaurants/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
            })
        },
    }
})