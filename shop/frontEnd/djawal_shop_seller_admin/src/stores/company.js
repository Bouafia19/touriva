import { defineStore } from 'pinia';
import axios from 'axios'
import { useAuthStore } from './auth'

export const useCompanyStore = defineStore('company', {
    
    state: () => ({
        company: []
    }),

    getters: {
        getCompany: (state) => state.company
    },

    actions: {
        //company 
        async fetchCompany(){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get('api/company', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            this.company = response.data[0]
        },

        // edit company
        async editCompany(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.patch(`api/company/${params._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        }
    }
})