import { defineStore } from 'pinia';
import axios from 'axios'

export const useCompanyStore = defineStore('company', {

    state: () => ({ 
        homeImage: undefined
    }),

    getters: {
        getHomeImage: (state) => state.homeImage
    },

    actions: {
        //company 
        async fetchAppImage(){
            const response = await axios.get('/api/company/getAppImage')
            this.homeImage = response.data[0].appImage
        }
    }
})