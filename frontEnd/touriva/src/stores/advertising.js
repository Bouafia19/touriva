import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'
import { Preferences } from '@capacitor/preferences'

export const useAdvertisingStore = defineStore('advertising', {

    state: () => ({ 
        ads: undefined,
        headerAdsHome: [],
        interstitialAdsHome: [],
        headerAdsDetail: [],
        interstitialAdsDetail: [],
        advertising: undefined,
        lsIntAdHome: undefined
    }),

    getters: {
        getAds: (state) => state.ads,
        getHeaderAdsHome: (state) => state.headerAdsHome,
        getInterstitialAdsHome: (state) => state.interstitialAdsHome,
        getHeaderAdsDetail: (state) => state.headerAdsDetail,
        getInterstitialAdsDetail: (state) => state.interstitialAdsDetail,
        getAdvertising: (state) => state.advertising,
        getLSIntAdHome: (state) => state.lsIntAdHome
    },

    actions: {
        //advertising component
        async fetchAdvertising(){
            const auth = useAuthStore()
            // auth.getLSUserInfo().then(async (ls) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await axios.get('api/advertising', {
                        // headers: {
                        //     'Authorization': `Bearer ${ls.token}`
                        // }
                    })
                    if(response.status === 200){
                        auth.getLSUserInfo().then(async (ls) => {
                            this.ads = response.data.filter(ad => ad.published && ad.payed && ad.sector === ls.user.sectorActivity && Date.parse(ad.startDate) <= Date.parse(new Date()) && Date.parse(ad.endDate) >= Date.parse(new Date()))

                            this.headerAdsHome = this.ads.filter(ad => ad.space === 'header' && ad.page === 'home')
                            this.interstitialAdsHome = this.ads.filter(ad => ad.space === 'interstitial' && ad.page === 'home')

                            this.headerAdsDetail = this.ads.filter(ad => ad.space === 'header' && ad.page === 'detail')
                            this.interstitialAdsDetail = this.ads.filter(ad => ad.space === 'interstitial' && ad.page === 'detail')
                            
                          

                            let lsAds = await this.getLSAdvertising()
                            
                            if(!lsAds || lsAds.length === 0){
                                
                                let ads = this.interstitialAdsHome.map(ad => {
                                    ad.counterView = 0
                                    return {
                                        _id: ad._id,
                                        counterView: 0,
                                        counter24h: Date.now(),
                                        published: true
                                    }
                                })
                                this.setLSAdvertising(ads)
                            }else{
                                lsAds = lsAds.filter(ad => ad != null)
                                //
                                this.interstitialAdsHome = this.interstitialAdsHome.map(ad => {
                                    let lsAd = lsAds.find(lsAd => lsAd._id === ad._id)
                                    if(lsAd){
                                    
                                        if(Date.now() - lsAd.counter24h > 24 * 60 * 60 * 1000){
                                            
                                            lsAd.published = true
                                            ad.counterView = lsAd.counterView
                                        }else{
                                            
                                            lsAd.published = false
                                            ad.published = false
                                        }
                                    }else{
                                        
                                        // lsAds = lsAds.filter(lsAd => lsAd._id !== ad._id)  
                                        lsAds.push({
                                            _id: ad._id,
                                            counterView: 0,
                                            counter24h: Date.now(),
                                            published: true
                                        })
                                    }
                                    return ad
                                })

                                //
                                lsAds = lsAds.map(ad => {
                                    let lsAd = this.interstitialAdsHome.find(lsAd => lsAd._id === ad._id)
                                    if(lsAd){
                                        
                                        return ad // Keep ad in lsAds if it is in interstitialAdsHome
                                    }
                                })
                                //
                                lsAds = lsAds.filter(ad => ad != null)
                                this.removeLSAdvertising()
                                this.setLSAdvertising(lsAds)
                            }
                            this.interstitialAdsHome = this.interstitialAdsHome.filter(ad => ad.published) // Filter out ads that are not published
                            this.interstitialAdsHome.sort((a, b) => a.counterView - b.counterView)
                            this.lsIntAdHome = this.interstitialAdsHome[0] // Set the first ad as the LS ad
                            
                            resolve()
                        })
                    }
                } catch (error) {
                    reject()
                    throw new Error(`${error}`)
                }
            })
            // })
        },

        // add advertising
        async addAdvertising(params){
            return new Promise(async (resolve, reject) => {
                
                const auth = useAuthStore()
                auth.getLSUserInfo().then(async (ls) => {
                    params.ownerId = ls.user._id
                    try {
                        const response = await axios.post('api/advertising', params, {
                            headers: {
                                'Authorization': `Bearer ${ls.token}`
                            },
                        });
                        if(response.status === 200){
                            resolve(response.data)
                        }
                    } catch (error) {
                        reject()
                        throw new Error(`${error}`)
                    }
                })
            })
        },

        // edit advertising
        async editAdvertising(params){
            return new Promise(async (resolve, reject) => {
                
                const auth = useAuthStore()
                auth.getLSUserInfo().then(async (ls) => {
                    try {
                        const response = await axios.patch(`api/advertising/${params._id}`, params, {
                            headers: {
                                'Authorization': `Bearer ${ls.token}`
                            },
                        })
                        if(response.status === 200){
                            resolve(response.data)
                        }
                    } catch (error) {
                        reject()
                        throw new Error(`${error.response.data.error}`)
                    }
                })
            })
        },

        // delete advertising
        async deleteAdvertising(id){
            const auth = useAuthStore()
            auth.getLSUserInfo().then(async (ls) => {
                const response = await axios.delete(`api/advertising/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${ls.token}`
                    },
                })
            })
        },

        async fetchAdvertisingByUserId(){
            return new Promise(async (resolve, reject) => {
                const auth = useAuthStore()
                auth.getLSUserInfo().then(async (ls) => {
                    const response = await axios.get(`api/advertising/getAdvertisingByOwnerId/${ls.user._id}`,{
                        headers: {
                            'Authorization': `Bearer ${ls.token}`
                        }
                    })
                    if(response.status === 200){
                        
                        this.advertising = response.data
                        resolve(response.data)
                    }
                })
            })
        },

        async setLSAdvertising(data){
            await Preferences.set({
                key: 'advertising',
                value: JSON.stringify(data),
            })
        },

        async getLSAdvertising(){
            const { value } = await Preferences.get({ key: 'advertising' })
            return JSON.parse(value)
        },

        async removeLSAdvertising(){
            await Preferences.remove({ key: 'advertising' })
        },

        async updateLSIntAdHomeCounter(){
            if(this.lsIntAdHome){
                this.lsIntAdHome.counterView++
                let lsAds = await this.getLSAdvertising()
                let ads = lsAds.map(ad => {
                    if(ad._id === this.lsIntAdHome._id){
                        ad.counterView = this.lsIntAdHome.counterView
                        ad.counter24h = Date.now()
                        ad.published = false
                    }
                    return ad
                })
                this.removeLSAdvertising()
                this.setLSAdvertising(ads)
            }
        }
    }
})