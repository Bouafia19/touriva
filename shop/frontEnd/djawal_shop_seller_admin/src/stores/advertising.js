import { defineStore } from 'pinia';
import axios from 'axios'

export const useAdsStore = defineStore('ads', {
    
    state: () => ({
        ads: [],
        alertAds: []
    }),

    getters: {
        getAds: (state) => state.ads,
        getAlertAds: (state) => state.alertAds
    },

    actions: {
        //ads component
        async fetchAds(){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get('api/advertising', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            this.ads = response.data
            this.alertAds = response.data.filter(ad => ad.billingStatus === "pending")
        },

        // add ads
        async addAds(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.post('api/advertising', params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                });
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // edit ads
        async editAds(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.patch(`api/advertising/${params._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // delete ads
        async deleteAds(id){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.delete(`api/advertising/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
            })
        },
    }
})