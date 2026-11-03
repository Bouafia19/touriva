import { defineStore } from 'pinia';
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
    
    state: () => ({
        user: [],
        auth_login: false,
        token: null
    }),

    getters: {
        authenticated(state){
            return state.auth_login && state.user
        },

        getUser(state){
            return state.user
        }
    },

    actions: {
        async demoSignIn (demoType) {
            try {
                const response = await axios.post("api/users/demo-login", { demoType, role: 'seller' })
                if (response && response.data) {
                    this.user = response.data
                    localStorage.setItem('userInfo', JSON.stringify(response.data))
                    this.auth_login = true
                    this.router.push('/dashboard')
                    return response.data
                } else {
                    throw new Error('Could not complete demo login')
                }
            } catch (error) {
                const err = error.response?.data?.error || error.message || 'Demo login failed'
                throw new Error(err)
            }
        },

        async account_sign_in (params) {
            const response = await axios.post("api/users/login", params)
            this.user = response.data
            localStorage.setItem('userInfo', JSON.stringify(response.data))
            this.auth_login = true
            this.router.push('/dashboard')
        },
    
        account_sign_out () {
          localStorage.removeItem('userInfo')
          this.auth_login = false
          this.router.push('/login')
        },
    
        async attempt(token){
            if (token){
                this.token = token
                this.auth_login =true
            }
            if (!token) {
                this.user = ''
                this.auth_login = false
                return false
            }
        }
    }
})