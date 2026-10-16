import { defineStore } from 'pinia';
import axios from 'axios'
import { useAuthStore } from './auth'

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
            return new Promise(async (resolve, reject) => {      
                const auth = useAuthStore()
                auth.getLSUserInfo().then(async (ls) => {
                    try {
                        if(!ls || !ls.token) {
                            // reject('No token found')
                            return
                        }
                        const response = await axios.get('api/adsSettings', {
                            headers: {
                                'Authorization': `Bearer ${ls.token}`
                            }
                        })
                        if(response.status == 200) {
                            
                            this.adsSettings = response.data[0]
                            resolve()
                        }
                        
                    } catch (error) {
                        reject(error)
                    }
                })
            })
        }
    }
})