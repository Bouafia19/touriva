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
            const response = await axios.get('api/communes', {
            })
            this.communes = response.data.filter(e => e.name != "")
        },

        // add communes
        async addCommunes(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.post('api/communes', params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                });
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // edit communes
        async editCommunes(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.patch(`api/communes/${params._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // delete communes
        async deleteCommunes(id){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.delete(`api/communes/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
            })
        },
    }
})