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
            const response = await axios.post("api/users/verifyPhone", params, {
                        headers: {
                            'Cache-Control': 'no-cache',
                            'Pragma': 'no-cache',
                            'Expires': '0'
                            // 'Authorization': `Bearer ${ls.token}`
                        }
                    })
            
            if(response.status === 200){
                // router.push({ path: `/codeVerification/${response.data.phonenumber}` })
                this.router.push({ path: `/userInformation/${params.phonenumber}` })
            } else {
                throw new Error('could not complete verification')
            }
        },
    
        // verify code
        async account_verify_code (params) {
            const response = await axios.post("api/users/verifyCode", params, {
                        headers: {
                            'Cache-Control': 'no-cache',
                            'Pragma': 'no-cache',
                            'Expires': '0'
                            // 'Authorization': `Bearer ${ls.token}`
                        }
                    })
            if(response){
                this.router.push({ path: `/userInformation/${response.data.data.to}` })
            } else {
                throw new Error('could not complete verification')
            }
        },
        
        // login to user account 
        async account_sign_in (params) {
            try {
                const response = await axios.post("api/users/login", params, {
                        headers: {
                            'Cache-Control': 'no-cache',
                            'Pragma': 'no-cache',
                            'Expires': '0'
                            // 'Authorization': `Bearer ${ls.token}`
                        }
                    })
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
                throw new Error(`${error.response.data.error}`)
            }
        },
    
        // sign up new user
        async account_sign_up (params) {
            try {
                const response = await axios.post("api/users/signup", params, {
                        headers: {
                            'Cache-Control': 'no-cache',
                            'Pragma': 'no-cache',
                            'Expires': '0'
                            // 'Authorization': `Bearer ${ls.token}`
                        }
                    })
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
                const response = await axios.post(`api/users/verifyUser`, params, {
                        headers: {
                            'Cache-Control': 'no-cache',
                            'Pragma': 'no-cache',
                            'Expires': '0'
                            // 'Authorization': `Bearer ${ls.token}`
                        }
                    })
                   
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
                const response = await axios.patch(`api/users/update_existing_user/${params.id}`, params)
                if(response.status === 200){
                   
                    this.account_sign_in({ 
                        phone: response.data.phone,
                        password: params.password,
                        role: 'client'
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