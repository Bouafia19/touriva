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
            try {
                const ls = await auth.getLSUserInfo()
                if (!ls || !ls.user) {
                    this.user = undefined
                    return false
                }
                this.user = ls.user
                if (ls.user.complete === false) {
                    if (ls.user.fileStatus === 'created') {
                        this.router.push({ name: 'Documents' })
                    } else if (ls.user.fileStatus === 'pending') {
                        this.router.push({ name: 'Pending' })
                    }
                }
                return false
            } catch (error) {
                return false
            }
        },
        //fetch single User
        async fetchUser(){
            const auth = useAuthStore()
            try {
                const ls = await auth.getLSUserInfo()
                if (!ls || !ls.token || !ls.user?._id) {
                    return null
                }
                const response = await axios.get(`api/users/${ls.user._id}`, {
                    headers: {
                        'Authorization': `Bearer ${ls.token}`
                    }
                })
                if (response.status === 200) {
                    this.user = response.data
                    if (response.data.complete != ls.user.complete || response.data.fileStatus != ls.user.fileStatus || response.data.status != ls.user.status || response.data.expirationOfSubscription != ls.user.expirationOfSubscription) {
                        await auth.setLSUserInfo({
                            token: ls.token, 
                            user: response.data
                        })
                    }
                    return response.data
                }
            } catch (error) {
                if (error.response?.status === 401) {
                    await auth.removeLSUserInfo()
                    this.user = undefined
                }
                return null
            }
        },
        // edit users
        async editUsers(params){
            const auth = useAuthStore()
            const ls = await auth.getLSUserInfo()
            if (!ls || !ls.token || !ls.user?._id) throw new Error('Unauthenticated')
            try {
                const response = await axios.patch(`api/users/${ls.user._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${ls.token}`
                    }
                })
                return response.data
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },
    
        async updateUserProfile(params){
            const auth = useAuthStore()
            const ls = await auth.getLSUserInfo()
            if (!ls || !ls.token || !ls.user?._id) throw new Error('Unauthenticated')
            try {
                const response = await axios.patch(`api/users/${ls.user._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${ls.token}`
                    }
                })
                if (response.status === 200) {
                    await auth.setLSUserInfo({
                        token: ls.token, 
                        user: response.data
                    })
                    this.user = response.data
                    return response.data
                }
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },
    
        // upload images
        async uploadPartnerImages(params){
            const auth = useAuthStore()
            const ls = await auth.getLSUserInfo()
            if (!ls || !ls.token || !ls.user?._id) throw new Error('Unauthenticated')
            try {
                const response = await axios.patch(`api/users/uploadPartnerImages/${ls.user._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${ls.token}`
                    }
                })
                return response.data
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },
    
        // load Partner Photos
        async loadPartnerPhotos(){
            const auth = useAuthStore()
            const ls = await auth.getLSUserInfo()
            if (!ls || !ls.token || !ls.user?._id) return []
            try {
                const response = await axios.get(`api/users/loadPartnerPhotos/${ls.user._id}`, {
                    headers: {
                        'Authorization': `Bearer ${ls.token}`
                    }
                })
                if (response.status === 200) {
                    this.images = response.data
                    return response.data
                }
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },
    }
})