import { defineStore } from 'pinia'
import axios from 'axios'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { useAuthStore } from './auth'

export const usePublicationsStore = defineStore('publications', {
    
    state: () => ({
        publications: [],
        publicationsByTransporterId: undefined,
        publicationId: null,
        loading: false,
        publicationsLocal: [],
    }),

    getters: {
        getPublications: (state) => state.publications,
        getPublicationsByTransporterId: (state) => state.publicationsByTransporterId,
        getPublicationId: (state) => state.publicationId,
        getLoading: (state) => state.loading,
        getPublicationsLocal: (state) => state.publicationsLocal
    },

    actions: {
        //publications component
        async fetchAnnouncements(id){
            return new Promise((resolve, reject) => {
                const auth = useAuthStore()

                auth.getLSUserInfo().then(async (ls) => {
                    try {
                        
                        const response = await axios.get(`/api/announcements/getAnnouncementsByCategory/${id}`, {
                            headers: {
                                // 'Authorization': `Bearer ${ls.token}`
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

        async fetchAnnouncementsNoImages(id){
            return new Promise((resolve, reject) => {

                this.loading = true

                const auth = useAuthStore()

                auth.getLSUserInfo().then(async (ls) => {
                    try {
                        
                        const response = await axios.get(`/api/announcements/getAnnouncementsByCategoryNoImages/${id}`, {
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