import { defineStore } from 'pinia'
import axios from 'axios'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { useAuthStore } from './auth'

export const usePublicationsStore = defineStore('publications', {
    
    state: () => ({
        publications: [],
        publicationsSeller: [],
        publicationsByOwnerId: undefined,
        publicationId: null,
        publicationsLocal: [],
        publicationsByOwnerIdNotPaid: undefined
    }),

    getters: {
        getPublications: (state) => state.publications,
        getPublicationsSeller: (state) => state.publicationsSeller,
        getPublicationsByOwnerId: (state) => state.publicationsByOwnerId,
        getPublicationId: (state) => state.publicationId,
        getPublicationsLocal: (state) => state.publicationsLocal,
        getPublicationsByOwnerIdNotPaid: (state) => state.publicationsByOwnerIdNotPaid,

    },

    actions: {
        async fetchAnnouncements(id){
            return new Promise((resolve, reject) => {
                const auth = useAuthStore()
                auth.getLSUserInfo().then(async (ls) => {
                    try {
                        let response = null
                        response = await axios.get(`/api/announcements/getAnnouncementsByCategory/${id}`, {
                            headers: {
                                'Authorization': `Bearer ${ls.token}`
                            }
                        })
                        if(response.status === 200){
                            this.publicationsLocal = response.data
                            this.publicationsLocal.map((pub) => {
                                this.cacheImage(pub.img, pub._id)
                            })
                            resolve()
                        }
                    } catch (error) {
                        throw new Error(`${error}`)
                    }
                })
            })
        },

        async fetchAnnouncementsSeller(id){
            return new Promise((resolve, reject) => {
                const auth = useAuthStore()
                auth.getLSUserInfo().then(async (ls) => {
                    try {
                        let response = null
                        response = await axios.get(`/api/announcements/getAnnouncementsByCategory/${id}`, {
                            headers: {
                                'Authorization': `Bearer ${ls.token}`
                            }
                        })
                        if(response.status === 200){
                            this.publicationsSeller = response.data
                            this.publicationsSeller.map((pub) => {
                                this.cacheImage(pub.img, pub._id)
                            })
                            resolve()
                        }
                    } catch (error) {
                        throw new Error(`${error}`)
                    }
                })
            })
        },

        async fetchAnnouncementsNoImages(id){
            return new Promise(async (resolve, reject) => {
                this.loading = true
                const auth = useAuthStore()
                    try {
                        let response = null
                        response = await axios.get(`/api/announcements/getAnnouncementsByCategoryNoImages/${id}`, {
                            headers: {
                                // 'Authorization': `Bearer ${ls.token}`
                            }
                        })
                        if(response.status === 200){
                            this.publicationsLocal = response.data
                            let counter = 0
                            for (const e of this.publicationsLocal) {
                                e.img = await this.loadCachedImage(e._id)
                                if(!e.img){
                                    counter++
                                }
                            }
                            if(counter > 0){
                                this.fetchAnnouncements(id)
                            }
                            this.loading = false
                            resolve()
                        }
                    } catch (error) {
                        throw new Error(`${error}`)
                    }
                })
        },

        async fetchAnnouncementsSellerNoImages(id){
            return new Promise((resolve, reject) => {
                this.loading = true
                const auth = useAuthStore()
                auth.getLSUserInfo().then(async (ls) => {
                    try {
                        let response = null
                        response = await axios.get(`/api/announcements/getAnnouncementsByCategory/${id}`, {
                            headers: {
                                'Authorization': `Bearer ${ls.token}`
                            }
                        })
                        if(response.status === 200){
                            this.publicationsSeller = response.data
                            let counter = 0
                            for (const e of this.publicationsSeller) {
                                e.img = await this.loadCachedImage(e._id)
                                if(!e.img){
                                    counter++
                                }
                            }
                            if(counter > 0){
                                this.fetchAnnouncementsSeller(id)
                            }
                            this.loading = false
                            resolve()
                        }
                    } catch (error) {
                        throw new Error(`${error}`)
                    }
                })
            })
        },

        async fetchAnnouncementsByOwner(){
            return new Promise(async (resolve, reject) => {
                const auth = useAuthStore()

                const ls = await auth.getLSUserInfo()
                if(ls){
                    try {
                        const response = await axios.get(`/api/announcements/getAnnouncementsByOwnerId/${ls.user._id}`, {
                            headers: {
                                'Authorization': `Bearer ${ls.token}`
                            }
                        })
                        
                        if(response.status === 200){
                            response.data.forEach(i => {
                                i.loading = false
                            })
                            
                            this.publicationsByOwnerId = response.data
                            console.log('', this.publicationsByOwnerId)
                            this.publicationsByOwnerIdNotPaid = response.data.filter((item) => !item.paid)
                            resolve()
                        }
                    } catch (error) {
                        throw new Error(`${error}`)
                    }

                }
                    
            })
        },

        async updateAnnouncements(params) {
            try {
                const auth = useAuthStore()
                const ls = auth.getLSUserInfo()

                const response = await axios.patch(`/api/announcements/${params._id}`, params, {
                headers: {
                    Authorization: `Bearer ${ls.token}`,
                },
                })

                if (response.status === 200) {
                console.log('✅ updateAnnouncements success:', response.data)
                return response.data  // <-- IMPORTANT (resolves the promise)
                } else {
                throw new Error(`Unexpected status: ${response.status}`)
                }
            } catch (error) {
                console.error('❌ Error Updating announcement:', error)
                throw error // <-- IMPORTANT (rejects the promise)
            }
        },

        async deleteAnnouncements(announcementId){
            return new Promise((resolve, reject) => {
                const auth = useAuthStore()

                auth.getLSUserInfo().then(async (ls) => {
                    try {
                        const response = await axios.delete(`/api/announcements/${announcementId}`, {
                            headers: {
                                'Authorization': `Bearer ${user.token}`
                            }
                        })
                    } catch (error) {
                        console.error('Error deleting announcement:', error)
                    }
                })
            })
        },

        async loadCachedImage(fileName) {
            try {
                const result = await Filesystem.readFile({
                    path: `publications/${fileName}`,
                    directory: Directory.Data,
                })
                return `data:image/jpeg;base64,${result.data}`
            } catch (error) {
                return null
            }
        },

        async cacheImage(base64Data, fileName) {
            await Filesystem.writeFile({
                path: `publications/${fileName}`,
                data: base64Data,
                directory: Directory.Data,
                recursive: true,
            });
        }
    }
})