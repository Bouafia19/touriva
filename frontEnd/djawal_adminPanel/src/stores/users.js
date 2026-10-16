import { defineStore } from 'pinia';
import axios from 'axios'

export const useUsersStore = defineStore('users', {
    
    state: () => ({
        users: undefined,
        userInfo: [],
        partners: undefined,
        pendingPartners: undefined
    }),

    getters: {
        getUsers: (state) => state.users,
        getUserInfo: (state) => state.userInfo,
        getPartners: (state) => state.partners,
        getPendingPartners: (state) => state.pendingPartners,
    },

    actions: {
        //Users component
        async fetchUsers(){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get('api/users', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            this.users = response.data
            this.partners = response.data.filter(i => i.role === 'partner')
            this.pendingPartners = response.data.filter(i => i.role === 'partner' && i.fileStatus === 'pending')
        },

        // add users
        async addUsers(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.post('api/users', params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                });
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        //fetch single User
        async fetchUser(id){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get(`api/users/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            this.userInfo = response.data
        },

        // edit users
        async editUsers(params){
            return new Promise(async (resolve, reject) => {
                const user = JSON.parse(localStorage.getItem('userInfo'))
                try {
                    const response = await axios.patch(`api/users/${params._id}`, params, {
                        headers: {
                            'Authorization': `Bearer ${user.token}`
                        },
                    })
                    if(response.status === 200){
                        resolve()
                    }
                } catch (error) {
                    reject()
                    throw new Error(`${error}`)
                }
            })
        },

        // delete users
        async deleteUsers(id){
            return new Promise(async (resolve, reject) => {
                const user = JSON.parse(localStorage.getItem('userInfo'))
                try {
                    const response = await axios.delete(`api/users/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${user.token}`
                        },
                    })
                    if(response.status === 200){
                        resolve()
                    }
                } catch (error) {
                    reject()
                    throw new Error(`${error}`)
                }
            })
        },

        // update existing user
        async updateExistingUser(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.patch(`api/users/update_existing_user/${params._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error}`)
            }
        },
    }
})