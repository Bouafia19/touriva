import { defineStore } from 'pinia';
import axios from 'axios'
import { useAuthStore } from './auth'

export const useAnnouncementsStore = defineStore('announcements', {
    
    state: () => ({
        announcements: undefined,
        announcementsByTransporterId: undefined,
        announcementId: null
    }),

    getters: {
        getAnnouncements: (state) => state.announcements,
        getAnnouncementsByTransporterId: (state) => state.announcementsByTransporterId,
        getAnnouncementId: (state) => state.announcementId
    },

    actions: {
        //announcements component
        async fetchAnnouncements(){
            const auth = useAuthStore()

            auth.getLSUserInfo().then(async (ls) => {
                try {
                    const response = await axios.get('api/announcements/getAnnouncementsByRole/transporter', {
                        headers: {
                            'Authorization': `Bearer ${ls.token}`
                        }
                    })
                    if(response.status === 200){
                        this.announcements = response.data
                    }
                } catch (error) {
                    throw new Error(`${error}`)
                }
            })
        },

        //
        async fetchAnnouncementsByTransporterId(){

            const auth = useAuthStore()

            auth.getLSUserInfo().then(async (ls) => {
                try {
                    const response = await axios.get(`api/announcements/getAnnouncementsByTransporterId/${ls.user._id}`, {
                        headers: {
                            'Authorization': `Bearer ${ls.token}`
                        }
                    })
                    if(response.status === 200){
                        response.data.forEach(element => {
                            element.messages = []
                            element.messages[0] = {
                                location: element.data.start,
                                color: 'success'
                            }
                            element.messages[1] = {
                                location: element.data.to,
                                color: 'orange'
                            }
                        })
                        this.announcementsByTransporterId = response.data
                    }
                } catch (error) {
                    throw new Error(`${error}`)
                }
            })
        },

        // delete
        async deleteAnnouncements(id){

            const auth = useAuthStore()
            
            return new Promise((resolve, reject) => {

                try {
                    auth.getLSUserInfo().then(async (ls) => {
                        const response = await axios.delete(`api/announcements/${id}`, {
                            headers: {
                                'Authorization': `Bearer ${ls.token}`
                            }
                        })
                        if(response.status === 200){
                            resolve()
                        }
                    })
                } catch (error) {
                    reject()
                    throw new Error(`${error}`)
                }

            })
        }
    }
})