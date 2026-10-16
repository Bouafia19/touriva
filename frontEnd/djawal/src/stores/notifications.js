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
            auth.getLSUserInfo().then(async (ls) => {
                try {
                    const response = await axios.post('/api/notifications/subscribe',params, {
                        headers: {
                            'Authorization': `Bearer ${ls.token}`
                        }
                    })
                    if(response.status === 200){
                        
                    }
                } catch (error) {
                    throw new Error(`${error}`)
                }
            })
        }
    }
})