import { defineStore } from 'pinia';
import axios from 'axios'
import { Preferences } from '@capacitor/preferences'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        userInfo: [],
        auth_login: false,
        token: null,
        user: undefined
    }),

    getters: {
        authenticated(state){
            return state.auth_login && state.userInfo
        },
        getUser(state){
            return state.userInfo
        }
    },

    actions: {
        async setLSUserInfo(data){

            // delete data.user.grayCard;
            // delete data.user.commercialRegister;
            // delete data.user.transportCard;
            // delete data.user.trafficPermit;
            // delete data.user.id;
           
            await Preferences.set({
                key: 'userInfo',
                value: JSON.stringify(data),
            })
        },
        async getLSUserInfo(){
            const { value } = await Preferences.get({ key: 'userInfo' })
            return JSON.parse(value)
        },
        async removeLSUserInfo(){
            await Preferences.remove({ key: 'userInfo' })
        },
        // verify phone
        async account_verify_phone (params) {
            const response = await axios.post("api/users/verifyPhone", params)
            
            if(response.status === 200){
                // router.push({ path: `/codeVerification/${response.data.phonenumber}` })
                this.router.push({ path: `/userInformation/${params.phonenumber}` })
            } else {
                throw new Error('could not complete verification')
            }
        },
    
        // verify code
        async account_verify_code (params) {
            const response = await axios.post("api/users/verifyCode", params)
            if(response){
                this.router.push({ path: `/userInformation/${response.data.data.to}` })
            } else {
                throw new Error('could not complete verification')
            }
        },
        
        // 1-Click Demo Sign In for Marketplace Buyers (via standard password authentication)
        async demoSignIn (demoType) {
            try {
                const buyerCreds = {
                    customer: { email: 'customer@touriva.test', password: 'Password123!' },
                    traveler: { email: 'traveler2@touriva.test', password: 'Password123!' },
                    buyer1: { email: 'demo.buyer1@touriva.example', password: 'Buyer#Yasmine2026!Alg' },
                    buyer2: { email: 'demo.buyer2@touriva.example', password: 'Buyer#Rachid2026!Orn' },
                    buyer3: { email: 'demo.buyer3@touriva.example', password: 'Buyer#Amina2026!Cst' },
                    buyer4: { email: 'demo.buyer4@touriva.example', password: 'Buyer#Sofiane2026!Set' },
                    buyer5: { email: 'demo.buyer5@touriva.example', password: 'Buyer#Nour2026!Ann' }
                }
                const cred = buyerCreds[demoType] || buyerCreds.buyer1
                return await this.account_sign_in({
                    email: cred.email,
                    password: cred.password,
                    role: 'client'
                })
            } catch (error) {
                const err = error.response?.data?.error || error.message || 'Demo login failed'
                throw new Error(err)
            }
        },

        // login to user account 
        async account_sign_in (params) {
            try {
                const response = await axios.post("api/users/login", params)
                if(response){
                    this.user = response.data
                    this.auth_login = true
                    try {
                        localStorage.setItem('userInfo', JSON.stringify(response.data))
                    } catch (e) {}
                    this.setLSUserInfo(response.data).then(() => {
                        this.router.push('/tabs')
                    })
                }else{
                    throw new Error('could not complete login')
                }
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },
    
        // sign up new user
        async account_sign_up (params) {
            try {
                const response = await axios.post("api/users/signup", params)
                if(response){
                    this.user = response.data
                    this.auth_login = true
                    
                    this.setLSUserInfo(response.data).then(() => {
                        this.router.push('/tabs')
                    })
                } else {
                    throw new Error('could not complete signup')
                }
                
            } catch (error) {
                throw new Error(`${error}`)
            }
            
        },
    
        async checkPhone(params){
            try {
                const response = await axios.post(`api/users/verifyUser`, params)
                   
                if(response.status === 200){
                    this.user = response.data
                    this.router.push({ name: 'ForgotPassword' })
                }
                
            } catch (error) {
                throw new Error(`${error}`)
            }
        },
    
        // update existing user
        async account_update_existing_user (params) {
            try {
                const ls = await this.getLSUserInfo()
                const token = this.user?.token || this.token || ls?.token
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
                const response = await axios.patch(`api/users/update_existing_user/${params.id}`, params, { headers })
                if(response.status === 200){
                   
                    this.account_sign_in({ 
                        phone: response.data.phone,
                        password: params.password,
                        role: response.data.role || 'client'
                    })
    
                } else {
                    throw new Error('could not complete signup')
                }
                
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },
    
        // log out user
        account_sign_out () {
            this.removeLSUserInfo()
            this.auth_login = false
            this.router.push('/tabs')
        },
    
        async attempt(token){
            if (token){
                this.user = token
                this.auth_login = true
                return true
            }
            if (!token) {
                this.user = ''
                this.auth_login = false
                return false
            }
        },
    },
})