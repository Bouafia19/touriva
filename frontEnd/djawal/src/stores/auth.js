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
            console.log('params', params)
            try {
                const response = await axios.post("api/users/login", params, {
                        headers: {
                            // 'Authorization': `Bearer ${ls.token}`
                        }
                    })
                    console.log('response', response)
                if(response){
                    this.user = response.data
                    this.auth_login = true
                    // localStorage.setItem('userInfo', JSON.stringify(response.data))
                    this.setLSUserInfo(response.data).then(() => {
                    //     dispatch('getLSUserInfo').then((ls) => {
                            // if(ls.user.complete === false){
                            //     router.push('/documents')
                            // }else{
                                this.router.push('/tabs')
                            // }
                    //     })
                    })
                }else{
                    throw new Error('could not complete login')
                }
            } catch (error) {
                throw new Error(`${error}`)
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
            console.log('account_update_existing_user', params)
            try {
                const response = await axios.patch(`api/users/update_existing_user/${params.id}`, params)
                if(response.status === 200){
                   console.log('res data', response.data)
                    this.account_sign_in({ 
                        phone: response.data.phone,
                        password: params.password,
                        role: 'partner'
                    })
    
                } else {
                    throw new Error('could not complete signup')
                }
                
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },
    
        // log out user
        account_sign_out () {
            this.removeLSUserInfo()
            this.auth_login = false
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