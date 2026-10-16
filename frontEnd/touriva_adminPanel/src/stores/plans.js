import { defineStore } from 'pinia';
import axios from 'axios'

export const usePlansStore = defineStore('plans', {
    
    state: () => ({
        plans: []
    }),

    getters: {
        getPlans: (state) => state.plans
    },

    actions: {
        //plans component
        async fetchPlans(){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get('api/plans', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            this.plans = response.data
        },

        // add plans
        async addPlans(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.post('api/plans', params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                });
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // edit plans
        async editPlans(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.patch(`api/plans/${params._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // delete plans
        async deletePlans(id){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.delete(`api/plans/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
            })
        },
    }
})