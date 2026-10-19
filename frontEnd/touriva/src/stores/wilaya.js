import { defineStore } from 'pinia';
import axios from 'axios'
import { useAuthStore } from './auth'

export const useWilayasStore = defineStore('wilayas', {
    
    state: () => ({
        wilayas: []
    }),

    getters: {
        getWilayas: (state) => state.wilayas
    },

    actions: {
        //wilayas component
        async fetchWilayas(){
            const response = await axios.get('api/wilayas')
            this.wilayas = (response.data || []).filter(e => e.name != "")
        },

        // add wilayas
        async addWilayas(params){
            const auth = useAuthStore()
            const ls = await auth.getLSUserInfo()
            const token = ls?.token || ''
            try {
                await axios.post('api/wilayas', params, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },

        // edit wilayas
        async editWilayas(params){
            const auth = useAuthStore()
            const ls = await auth.getLSUserInfo()
            const token = ls?.token || ''
            try {
                await axios.patch(`api/wilayas/${params._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },

        // delete wilayas
        async deleteWilayas(id){
            const auth = useAuthStore()
            const ls = await auth.getLSUserInfo()
            const token = ls?.token || ''
            await axios.delete(`api/wilayas/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            })
        },

        // add wilayas
        async addMultWilayas(params){
            const auth = useAuthStore()
            const ls = await auth.getLSUserInfo()
            const token = ls?.token || ''
            try {
                await axios.post('api/wilayas/multi', params, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },

        // delete wilayas
        async deleteMultWilayas(){
            await axios.post('api/wilayas/delete')
        },
    }
})