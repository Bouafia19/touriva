import { defineStore } from 'pinia';
import axios from 'axios'
import { useAuthStore } from './auth'

export const useBillingsStore = defineStore('billings', {
    
    state: () => ({
        billings: undefined,
        pendingBillings: undefined
    }),

    getters: {
        getBillings: (state) => state.billings,
        getPendingBilling: (state) => state.pendingBillings
    },

    actions: {
        //billings component
        async fetchBillings(){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get('api/billings', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            if(response.status === 200){
                console.log('billings', response.data)
                this.billings = response.data
                this.pendingBillings = response.data.filter(e => e.status === "pending")
            }
        },

        // add billings
        async addBillings(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.post('api/billings', params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                });
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // edit billings
        async editBillings(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.patch(`api/billings/${params._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // delete billings
        async deleteBillings(id){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.delete(`api/billings/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
            })
        },

        async fetchBillingsByUserId(id){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get(`api/billings/getBillingsByUserId/${id}`,{
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            if(response.status === 200){
                this.billings = response.data
            }
        }
    }
})