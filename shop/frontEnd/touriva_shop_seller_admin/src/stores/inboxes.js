import { defineStore } from 'pinia'
import axios from 'axios'

export const useInboxesStore = defineStore('inboxes', {
    
    state: () => ({
        inboxes: undefined,
        InboxeInfo: []
    }),

    getters: {
        getInboxes: (state) => state.inboxes,
        getInboxeInfo: (state) => state.InboxeInfo
    },

    actions: {
        //Inboxes component
        async fetchInboxes(){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get('api/inboxes', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            this.inboxes = response.data
        },

        // add inboxes
        async addInboxes(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.post('api/inboxes', params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                });
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        //fetch single Inboxe
        async fetchInboxe({ commit }, id){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get(`api/inboxes/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            this.InboxeInfo = response.data
        },

        // edit inboxes
        async editInboxes(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.patch(`api/inboxes/${params._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // delete inboxes
        async deleteInboxes(id){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.delete(`api/inboxes/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
            });
            
        }
    }
})