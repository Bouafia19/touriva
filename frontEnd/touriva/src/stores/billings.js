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
            const ls = await auth.getLSUserInfo()
            if (!ls || !ls.token) return
            try {
                const response = await axios.get('api/billings')
                this.billings = response.data
            } catch (error) {
                console.error(error)
            }
        },

        // add billings
        async addBillings(params){
            const auth = useAuthStore()
            const ls = await auth.getLSUserInfo()
            if (!ls || !ls.token) throw new Error('Unauthenticated')
            try {
                const response = await axios.post('api/billings', params);
                return response.data
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },

        // edit billings
        async editBillings(params){
            const auth = useAuthStore()
            const ls = await auth.getLSUserInfo()
            if (!ls || !ls.token) throw new Error('Unauthenticated')
            try {
                const response = await axios.patch(`api/billings/${params._id}`, params)
                return response.data
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },

        // delete billings
        async deleteBillings(id){
            const auth = useAuthStore()
            const ls = await auth.getLSUserInfo()
            if (!ls || !ls.token) throw new Error('Unauthenticated')
            try {
                const response = await axios.delete(`api/billings/${id}`)
                return response.data
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },

        async fetchBillingsByUserId(){
            const auth = useAuthStore()
            const ls = await auth.getLSUserInfo()
            if (!ls || !ls.token || !ls.user?._id) return
            try {
                const response = await axios.get(`api/billings/getBillingsByUserId/${ls.user._id}`)
                if(response.status === 200){
                    this.billings = response.data
                }
            } catch (error) {
                console.error(error)
            }
        }
    }
})