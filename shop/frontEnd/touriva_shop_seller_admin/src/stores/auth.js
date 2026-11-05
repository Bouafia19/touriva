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
                const sellerCreds = {
                    seller1: { email: 'demo.seller1@touriva.example', password: 'Atlas#Seller2026!Elc' },
                    seller2: { email: 'demo.seller2@touriva.example', password: 'Artisan#Seller2026!Trad' },
                    seller3: { email: 'demo.seller3@touriva.example', password: 'Bahdja#Seller2026!Deco' },
                    seller4: { email: 'demo.seller4@touriva.example', password: 'Sahara#Seller2026!Exp' },
                    legacy_seller1: { email: 'seller1@touriva.test', password: 'Password123!' }
                }
                const cred = sellerCreds[demoType] || sellerCreds.seller1
                return await this.account_sign_in({
                    email: cred.email,
                    password: cred.password,
                    role: 'seller'
                })
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