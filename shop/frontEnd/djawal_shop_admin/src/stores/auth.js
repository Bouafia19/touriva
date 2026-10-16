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
        async account_sign_in (params) {
            const response = await axios.post("api/users/login", params)
            this.user = response.data
            localStorage.setItem('userInfo', JSON.stringify(response.data))
            this.auth_login = true
            this.router.push({ name: 'Home' })
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