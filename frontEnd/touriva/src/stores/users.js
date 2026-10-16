import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

export const useUsersStore = defineStore('users', {

    state: () => ({
        user: undefined,
        images: undefined,
        photo: null,
        title: ''
     }),

    getters: {
        getUser: (state) => state.user,
        getImages: (state) => state.images,
        getPhoto: (state) => state.photo,
        getTitle: (state) => state.title
    },

    actions: {
        async loadUser(){
            const auth = useAuthStore()
            return new Promise((resolve, reject) => {
                try {
                    auth.getLSUserInfo().then(async (ls) => {
                        this.user = ls?.user
                        
                        if(ls?.user.complete === false){
                            if(ls?.user.fileStatus === 'created'){
                                this.router.push({ name: 'Documents' })
                            }else if(ls?.user.fileStatus === 'pending'){
                                this.router.push({ name: 'Pending' })
                            }
                        }else{
                            resolve(false)
                        }
                    })
                } catch (error) {
                    reject()
                    throw new Error(`${error}`)
                }
            })
        },
        //fetch single User
        async fetchUser(){
            const auth = useAuthStore()
            return new Promise((resolve, reject) => {
                auth.getLSUserInfo().then(async (ls) => {
                    try {
                        if(ls){
                            const response = await axios.get(`api/users/${ls.user._id}`, {
                                headers: {
                                    'Authorization': `Bearer ${ls.token}`
                                }
                            })
                            if(response.status === 200){
                                if(response.data.complete != ls.user.complete || response.data.fileStatus != ls.user.fileStatus || response.data.status != ls.user.status || response.data.expirationOfSubscription != ls.user.expirationOfSubscription){
                                
                                    auth.removeLSUserInfo()
                                    auth.setLSUserInfo({
                                        token: ls.token, 
                                        user: response.data
                                    })
                                    
                                    resolve()
                                } 
                            }

                        }
                       
                    } catch (error) {
                        reject()
                        throw new Error(`${error}`)
                    }
                })
            })
        },
        // edit users
        async editUsers(params){
            const auth = useAuthStore()
            return new Promise((resolve, reject) => {
            
                auth.getLSUserInfo().then(async (ls) => {
                    try {
                        const response = await axios.patch(`api/users/${ls.user._id}`, params, {
                            headers: {
                                'Authorization': `Bearer ${ls.token}`
                            }
                        })
                        if(response.status === 200){
                            
                            resolve()
                        }
                    } catch (error) {
                        reject()
                        throw new Error(`${error}`)
                    }
                })
    
            })
        },
    
        async updateUserProfile(params){
            const auth = useAuthStore()
            return new Promise((resolve, reject) => {
    
                auth.getLSUserInfo().then(async (ls) => {
                    try {
                        const response = await axios.patch(`api/users/${ls.user._id}`, params, {
                            headers: {
                                'Authorization': `Bearer ${ls.token}`
                            }
                        })
                        if(response.status === 200){
                            auth.removeLSUserInfo()
                            auth.setLSUserInfo({
                                token: ls.token, 
                                user: response.data
                            })
                            this.user = response.data
                            
                            resolve(response.data)
                        }
                    } catch (error) {
                        reject()
                    }     
                })
            })
        },
    
        // upload images
        async uploadPartnerImages(params){
            const auth = useAuthStore()
            return new Promise((resolve, reject) => {
            
                auth.getLSUserInfo().then(async (ls) => {
                    try {
                        const response = await axios.patch(`api/users/uploadPartnerImages/${ls.user._id}`, params, {
                            headers: {
                                'Authorization': `Bearer ${ls.token}`
                            }
                        })
                    
                        if(response.status === 200){
                            resolve()
                        }
                    } catch (error) {
                        reject()
                        throw new Error(`${error}`)
                    }
                })
    
            })
        },
    
        // load Partner Photos
        async loadPartnerPhotos(){
            const auth = useAuthStore()
            return new Promise((resolve, reject) => {
                auth.getLSUserInfo().then(async (ls) => {
                    try {
                        const response = await axios.get(`api/users/loadPartnerPhotos/${ls.user._id}`, {
                            headers: {
                                'Authorization': `Bearer ${ls.token}`
                            }
                        })
            
                        if(response.status === 200){
                            this.images = response.data
                            resolve(response.data)
                        }
                    } catch (error) {
                        reject()
                        throw new Error(`${error}`)
                    }
                })
            })
        },
    }
})