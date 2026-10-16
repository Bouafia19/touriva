import { defineStore } from 'pinia';
import axios from 'axios'

export const useNotificationsStore = defineStore('notifications', {
    
    state: () => ({
        notifications: []
    }),

    getters: {
        getNotifications: (state) => state.notifications
    },

    actions: {
        //Notifications component
        async sendNotifications(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.post('api/notifications/topics', params, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            this.notifications = response.data
        }
    }
})