import { defineStore } from 'pinia';
import axios from 'axios'

export const useActivitiesStore = defineStore('activities', {
    
    state: () => ({
        activities: []
    }),

    getters: {
        getActivities: (state) => state.activities
    },

    actions: {
        //activities component
        async fetchActivities(){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get('api/activities', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            this.activities = response.data
        },

        // add activities
        async addActivities(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.post('api/activities', params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                });
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // edit activities
        async editActivities(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.patch(`api/activities/${params._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // delete activities
        async deleteActivities(id){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.delete(`api/activities/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
            })
        },
    }
})