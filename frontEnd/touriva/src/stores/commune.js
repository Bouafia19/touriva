import { defineStore } from 'pinia';
import axios from 'axios'

export const useCommunesStore = defineStore('communes', {
    
    state: () => ({
        communes: []
    }),

    getters: {
        getCommunes: (state) => state.communes
    },

    actions: {
        //communes component
        async fetchCommunes(){
            const response = await axios.get('api/communes')
            this.communes = (response.data || []).filter(e => e.name != "")
        },

        // add communes
        async addCommunes(params){
            try {
                const response = await axios.post('api/communes', params);
                return response.data
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },

        // edit communes
        async editCommunes(params){
            try {
                const response = await axios.patch(`api/communes/${params._id}`, params)
                return response.data
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },

        // delete communes
        async deleteCommunes(id){
            try {
                const response = await axios.delete(`api/communes/${id}`)
                return response.data
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },
    }
})