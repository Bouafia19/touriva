import { defineStore } from 'pinia';
import axios from 'axios'

export const useDairasStore = defineStore('dairas', {
    
    state: () => ({
        dairas: []
    }),

    getters: {
        getDairas: (state) => state.dairas
    },

    actions: {
        //dairas component
        async fetchDairas(){
            const response = await axios.get('api/dairas')
            this.dairas = (response.data || []).filter(e => e.name != "")
        },

        // add dairas
        async addDairas(params){
            try {
                const response = await axios.post('api/dairas', params);
                return response.data
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },

        // edit dairas
        async editDairas(params){
            try {
                const response = await axios.patch(`api/dairas/${params._id}`, params)
                return response.data
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },

        // delete dairas
        async deleteDairas(id){
            try {
                const response = await axios.delete(`api/dairas/${id}`)
                return response.data
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },
    }
})