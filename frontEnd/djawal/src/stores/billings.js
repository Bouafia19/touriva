import { defineStore } from 'pinia';
import axios from 'axios'
import { useAuthStore } from './auth'

export const useBillingsStore = defineStore('billings', {

    state: () => ({ 
        billings: undefined
    }),

    getters: {
        getBillings: (state) => state.billings
    },

    actions: {
        //billings component
        async fetchBillings(){
            const auth = useAuthStore()
            auth.getLSUserInfo().then(async (ls) => {
                const response = await axios.get('api/billings', {
                    headers: {
                        'Authorization': `Bearer ${ls.token}`
                    }
                })

                this.billings = response.data
            })
        },

        // add billings
        async addBillings(params){
            const auth = useAuthStore()
            auth.getLSUserInfo().then(async (ls) => {
                try {
                    const response = await axios.post('api/billings', params, {
                        headers: {
                            'Authorization': `Bearer ${ls.token}`
                        },
                    });
                } catch (error) {
                    throw new Error(`${error.response.data.error}`)
                }
            })
        },

        // edit billings
        async editBillings(params){
            const auth = useAuthStore()
            auth.getLSUserInfo().then(async (ls) => {
                try {
                    const response = await axios.patch(`api/billings/${params._id}`, params, {
                        headers: {
                            'Authorization': `Bearer ${ls.token}`
                        },
                    })
                } catch (error) {
                    throw new Error(`${error.response.data.error}`)
                }
            })
        },

        // delete billings
        async deleteBillings(id){
            const auth = useAuthStore()
            auth.getLSUserInfo().then(async (ls) => {
                const response = await axios.delete(`api/billings/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${ls.token}`
                    },
                })
            })
        },

        async fetchBillingsByUserId(){
            const auth = useAuthStore()
            auth.getLSUserInfo().then(async (ls) => {
                const response = await axios.get(`api/billings/getBillingsByUserId/${ls.user._id}`,{
                    headers: {
                        'Authorization': `Bearer ${ls.token}`
                    }
                })
                if(response.status === 200){
                    this.billings = response.data
                }
            })
        }
    }
})