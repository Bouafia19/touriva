import { defineStore } from 'pinia'
import axios from 'axios'

export const useTermsStore = defineStore('terms', {
    
    state: () => ({
        terms: []
    }),

    getters: {
        getTerms: (state) => state.terms
    },

    actions: {
        //terms component
        async fetchTerms(){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get('api/terms', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            this.terms = response.data
        },

        // add terms
        async addTerms(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.post('api/terms', params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                });
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // edit terms
        async editTerms(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.patch(`api/terms/${params._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // delete terms
        async deleteTerms(id){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.delete(`api/terms/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
            })
        },
    }
})