import { defineStore } from 'pinia';
import axios from 'axios'

export const useDairasStore = defineStore('dairas', {
    
    state: () => ({
        dairas: []
    }),

    getters: {
        getDairas: (state) => state.dairas
    },

    actions: {
        //dairas component
        async fetchDairas(){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get('api/dairas', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            this.dairas = response.data
        },

        // add dairas
        async addDairas(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.post('api/dairas', params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                });
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // edit dairas
        async editDairas(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.patch(`api/dairas/${params._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // delete dairas
        async deleteDairas(id){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.delete(`api/dairas/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
            })
        },
    }
})