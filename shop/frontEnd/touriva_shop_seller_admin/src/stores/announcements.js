import { defineStore } from 'pinia';
import axios from 'axios'

export const useAnnouncementsStore = defineStore('announcements', {
    
    state: () => ({
        announcements: [],
        alertAnnouncements: []
    }),

    getters: {
        getAnnouncements: (state) => state.announcements,
        getAlertAnnouncements: (state) => state.alertAnnouncements
    },

    actions: {
         //announcements component
        async fetchAnnouncements(){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get('api/announcements', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            this.announcements = response.data
            this.alertAnnouncements = response.data.filter(pub => pub.published === false && pub.paid === true)
        },

        // add announcements
        async addAnnouncements(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.post('api/announcements', params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                });
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // edit announcements
        async editAnnouncements(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.patch(`api/announcements/${params._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // delete announcements
        async deleteAnnouncements(id){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.delete(`api/announcements/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
            })
        },
    }
})