import { nextTick } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { Preferences } from '@capacitor/preferences'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        userInfo: [],
        auth_login: false,
        token: null,
        user: undefined,
        loading: false,
        error: null
    }),

    getters: {
        authenticated(state){
            return state.auth_login && state.userInfo
        },
        getUser(state){
            return state.userInfo
        },
        getLoading: (state) => {
            return state.loading
        },
        getError: (state) => {
            return state.error
        }
    },

    actions: {
        async setLSUserInfo(data){
            await Preferences.set({
                key: 'userInfo',
                value: JSON.stringify(data),
            })
            try {
                localStorage.setItem('userInfo', JSON.stringify(data))
            } catch (e) {}
        },
        async getLSUserInfo(){
            try {
                const { value } = await Preferences.get({ key: 'userInfo' })
                if (value) return JSON.parse(value)
            } catch (e) {}
            try {
                const stored = localStorage.getItem('userInfo')
                if (stored) return JSON.parse(stored)
            } catch (e) {}
            return null
        },
        async removeLSUserInfo(){
            await Preferences.remove({ key: 'userInfo' })
            try {
                localStorage.removeItem('userInfo')
            } catch (e) {}
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

        async account_verify_OTP (params) {
            try {
                const response = await axios.post("api/users/checkOTP", params)
                if(response.status === 200){
                    this.user = response.data
                    console.log('response.data', response.data)
                    this.router.push({ name: 'ForgotPassword' })
                }
            } catch (error) {
                console.log('error account_verify_OTP', error.response?.data?.error)
                this.error = error.response?.data?.error || 'Something went wrong'
                throw new Error('could not complete verification')
            }
        },
        
        // login to user account 
        async account_sign_in (params) {
            this.loading = true
            this.error = null
            try {
                const response = await axios.post("api/users/login", params)
                if (response && response.data && response.data.token) {
                    this.user = response.data.user
                    this.token = response.data.token
                    this.auth_login = true
                    await this.setLSUserInfo(response.data)
                    this.router.push('/tabs')
                    return response.data
                } else {
                    throw new Error('Invalid response from server')
                }
            } catch (error) {
                const apiError = error.response?.data?.error || error.message || 'Login failed'
                this.error = apiError
                throw new Error(apiError)
            } finally {
                this.loading = false
            }
        },
    
        // sign up new user
        async account_sign_up (params) {
            console.log('params', params)
            if(params.typeAccount != 'visitor'){
                params.complete = false
                params.fileStatus = 'created'
            }
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
                console.log('error auth store', error.response?.data?.error)
                this.error = error.response?.data?.error || 'Something went wrong'
                throw new Error(`${error}`)
            }
            
        },
    
        async checkPhone(params){
            try {
                const response = await axios.post(`api/users/verifyUser`, params)
                   
                if(response.status === 200){
                    this.user = response.data
                    this.checkOTP({ email: this.user.email })
                    // this.router.push({ name: 'ForgotPassword' })
                }
                
            } catch (error) {
                throw new Error(`${error}`)
            }
        },

        async checkOTP(params){
            try {
                const response = await axios.post(`api/users/verifyOTP`, params)
                   
                if(response.status === 200){
                    this.router.push({ name: 'CodeVerification', params: { phonenumber: this.user.phone } })
                }
    
            } catch (error) {
                this.error = error.response?.data?.error || 'Something went wrong'
                throw new Error(`${error}`)
            }   finally {
                this.loading = false
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
                        role: response.data.role || 'partner'
                    })
    
                } else {
                    throw new Error('could not complete signup')
                }
                
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },
    
        // log out user
        async account_sign_out () {
            await this.removeLSUserInfo()
            this.auth_login = false
            this.token = null
            this.user = undefined
            this.router.replace('/').then(() => {
                window.location.reload()
            })
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