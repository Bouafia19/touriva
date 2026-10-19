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
            try {
                const response = await axios.get(`/api/announcements/getAnnouncementsByCategory/${id}`)
                if(response.status === 200){
                    this.publicationsLocal = response.data
                    this.publicationsLocal.map((pub) => {
                        this.cacheImage(pub.img, pub._id)
                    })
                }
            } catch (error) {
                console.error(error)
            }
        },

        async fetchAnnouncementsSeller(id){
            try {
                const response = await axios.get(`/api/announcements/getAnnouncementsByCategory/${id}`)
                if(response.status === 200){
                    this.publicationsSeller = response.data
                    this.publicationsSeller.map((pub) => {
                        this.cacheImage(pub.img, pub._id)
                    })
                }
            } catch (error) {
                console.error(error)
            }
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
            this.loading = true
            try {
                const response = await axios.get(`/api/announcements/getAnnouncementsByCategory/${id}`)
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
                }
            } catch (error) {
                console.error(error)
            } finally {
                this.loading = false
            }
        },

        async fetchAnnouncementsByOwner(){
            const auth = useAuthStore()
            const ls = await auth.getLSUserInfo()
            if (!ls || !ls.token || !ls.user?._id) return

            try {
                const response = await axios.get(`/api/announcements/getAnnouncementsByOwnerId/${ls.user._id}`)
                if(response.status === 200){
                    response.data.forEach(i => {
                        i.loading = false
                    })
                    this.publicationsByOwnerId = response.data
                    this.publicationsByOwnerIdNotPaid = response.data.filter((item) => !item.paid)
                }
            } catch (error) {
                console.error(error)
            }
        },

        async updateAnnouncements(params) {
            try {
                const auth = useAuthStore()
                const ls = await auth.getLSUserInfo()
                if (!ls || !ls.token) throw new Error('Unauthenticated')

                const response = await axios.patch(`/api/announcements/${params._id}`, params)

                if (response.status === 200) {
                    console.log('✅ updateAnnouncements success:', response.data)
                    return response.data
                } else {
                    throw new Error(`Unexpected status: ${response.status}`)
                }
            } catch (error) {
                console.error('❌ Error Updating announcement:', error)
                throw error
            }
        },

        async deleteAnnouncements(announcementId){
            const auth = useAuthStore()
            const ls = await auth.getLSUserInfo()
            if (!ls || !ls.token) throw new Error('Unauthenticated')
            try {
                const response = await axios.delete(`/api/announcements/${announcementId}`)
                return response.data
            } catch (error) {
                console.error('Error deleting announcement:', error)
                throw error
            }
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