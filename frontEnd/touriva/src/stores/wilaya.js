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
            if (!ls || !ls.token) throw new Error('Unauthenticated')
            try {
                await axios.post('api/wilayas', params);
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },

        // edit wilayas
        async editWilayas(params){
            const auth = useAuthStore()
            const ls = await auth.getLSUserInfo()
            if (!ls || !ls.token) throw new Error('Unauthenticated')
            try {
                await axios.patch(`api/wilayas/${params._id}`, params)
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },

        // delete wilayas
        async deleteWilayas(id){
            const auth = useAuthStore()
            const ls = await auth.getLSUserInfo()
            if (!ls || !ls.token) throw new Error('Unauthenticated')
            await axios.delete(`api/wilayas/${id}`)
        },

        // add wilayas
        async addMultWilayas(params){
            const auth = useAuthStore()
            const ls = await auth.getLSUserInfo()
            if (!ls || !ls.token) throw new Error('Unauthenticated')
            try {
                await axios.post('api/wilayas/multi', params);
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