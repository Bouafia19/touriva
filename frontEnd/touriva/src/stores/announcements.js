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
            try {
                const response = await axios.get('api/announcements/getAnnouncementsByRole/transporter')
                if(response.status === 200){
                    this.announcements = response.data
                }
            } catch (error) {
                console.error(error)
            }
        },

        //
        async fetchAnnouncementsByTransporterId(){
            const auth = useAuthStore()
            const ls = await auth.getLSUserInfo()
            if (!ls || !ls.token || !ls.user?._id) return

            try {
                const response = await axios.get(`api/announcements/getAnnouncementsByTransporterId/${ls.user._id}`)
                if(response.status === 200){
                    response.data.forEach(element => {
                        element.messages = []
                        element.messages[0] = {
                            location: element.data?.start,
                            color: 'success'
                        }
                        element.messages[1] = {
                            location: element.data?.to,
                            color: 'orange'
                        }
                    })
                    this.announcementsByTransporterId = response.data
                }
            } catch (error) {
                console.error(error)
            }
        },

        // delete
        async deleteAnnouncements(id){
            const auth = useAuthStore()
            const ls = await auth.getLSUserInfo()
            if (!ls || !ls.token) throw new Error('Unauthenticated')
            try {
                const response = await axios.delete(`api/announcements/${id}`)
                return response.data
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        }
    }
})