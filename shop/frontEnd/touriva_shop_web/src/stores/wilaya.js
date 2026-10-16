import { defineStore } from 'pinia';
import axios from 'axios'

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
                const response = await axios.get('api/wilayas', {
                    
                })
                this.wilayas = response.data.filter(e => e.name != "")
        },

        // add wilayas
        async addWilayas(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.post('api/wilayas', params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                });
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // edit wilayas
        async editWilayas(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.patch(`api/wilayas/${params._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // delete wilayas
        async deleteWilayas(id){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.delete(`api/wilayas/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
            })
        },

        // add wilayas
        async addMultWilayas(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.post('api/wilayas/multi', params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                });
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // delete wilayas
        async deleteMultWilayas(){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.post('api/wilayas/delete')
        },
    }
})