import { defineStore } from 'pinia';
import axios from 'axios'
import { useAuthStore } from './auth'

export const useNotificationsStore = defineStore('notifications', {

    state: () => ({ 
        notification: null,
        userNotifications: [],
        loading: false,
        error: null
    }),

    getters: {
        getNotification: (state) => state.notification,
        notificationsList: (state) => state.userNotifications,
        unreadCount: (state) => state.userNotifications.filter(n => n.status === 'unread').length
    },

    actions: {
        async fetchUserNotifications() {
            this.loading = true
            this.error = null
            try {
                const res = await axios.get('/api/users/me/notifications')
                this.userNotifications = res.data?.notifications || []
                return this.userNotifications
            } catch (err) {
                this.error = err.response?.data?.error || err.message
                return []
            } finally {
                this.loading = false
            }
        },

        async markAsRead(notifId) {
            try {
                await axios.patch(`/api/users/me/notifications/${notifId}/read`)
                const target = this.userNotifications.find(n => n._id === notifId)
                if (target) target.status = 'read'
            } catch (err) {
                console.error('Failed to mark notification as read:', err)
            }
        },

        // Legacy FCM subscribe
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