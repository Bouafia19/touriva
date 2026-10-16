import { defineStore } from 'pinia';
import axios from 'axios'

export const useSitesStore = defineStore('sites', {
    
    state: () => ({
        sites: [],
        alertSites: []
    }),

    getters: {
        getSites: (state) => state.sites,
        getAlertSites: (state) => state.alertSites
    },

    actions: {
        //sites component
        async fetchSites(){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get('api/sites', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            this.sites = response.data
            this.alertSites = response.data.filter(site => site.status === "pending")
        },

        // add sites
        async addSites(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.post('api/sites', params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                });
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // edit sites
        async editSites(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.patch(`api/sites/${params._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // delete sites
        async deleteSites(id){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.delete(`api/sites/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
            })
        },
    }
})