import { defineStore } from 'pinia';
import axios from 'axios'

export const useActivitiesStore = defineStore('activities', {

    state: () => ({ 
        activities: [],
        loadingActivities: true
    }),

    getters: {
        getActivities: (state) => state.activities,
        getLoadingActivities: (state) => state.loadingActivities
    },

    actions: {
        //activities component
        async fetchActivities(){
            this.loadingActivities = true
            try {
                const response = await axios.get('api/activities', {
                    // headers: {
                    //     'Authorization': `Bearer ${user.token}`
                    // }
                });
                if(response.status === 200){
                    this.activities = response.data
                    this.loadingActivities = false
                }
            } catch (error) {
                throw new Error(`${error}`)
            }
        }
    }
})