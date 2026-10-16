import { defineStore } from 'pinia';
import axios from 'axios'

export const useRolesStore = defineStore('roles', {
    
    state: () => ({
        roles: []
    }),

    getters: {
        getRoles: (state) => state.roles
    },

    actions: {
        //roles component
        async fetchRoles(){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get('api/roles', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            this.roles = response.data
        },

        // add roles
        async addRoles(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.post('api/roles', params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                });
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // edit roles
        async editRoles(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.patch(`api/roles/${params._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // delete roles
        async deleteRoles(id){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.delete(`api/roles/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
            });
        },
    }
})