import { defineStore } from 'pinia';
import axios from 'axios'

export const useAdsSettingsStore = defineStore('adsSettings', {
    
    state: () => ({
        adsSettings: []
    }),

    getters: {
        getAdsSettings: (state) => state.adsSettings
    },

    actions: {
        //adsSettings 
        async fetchAdsSettings(){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get('api/adsSettings', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            this.adsSettings = response.data[0]
        },

        // edit adsSettings
        async editAdsSettings(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.patch(`api/adsSettings/${params._id}`, params, {
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