import { defineStore } from 'pinia';
import axios from 'axios'
import { useAuthStore } from './auth'

export const useNotificationsStore = defineStore('notifications', {

    state: () => ({ 
        notification: null
     }),

    getters: {
        getNotification: (state) => state.notification 
    },

    actions: {
        //notifications component
        async subscribeToNotifications(params){
            const auth = useAuthStore()
            const ls = await auth.getLSUserInfo()
            if (!ls || !ls.token) return
            try {
                await axios.post('/api/notifications/subscribe', params)
            } catch (error) {
                console.error(error)
            }
        }
    }
})