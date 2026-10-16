import { defineStore } from 'pinia';
import axios from 'axios'

export const useTermsStore = defineStore('terms', {

    state: () => ({ 
        terms: [],
        loadingTerms: true
    }),

    getters: {
        getTerms: (state) => state.terms,
        getLoadingTerms: (state) => state.loadingTerms
    },

    actions: {
        //terms component
        async fetchTerms(){
            this.loadingTerms = true
            try {
                const response = await axios.get('api/terms', {
                    // headers: {
                    //     'Authorization': `Bearer ${user.token}`
                    // }
                });
                if(response.status === 200){
                    this.terms = response.data
                    this.loadingTerms = false
                }
            } catch (error) {
                throw new Error(`${error}`)
            }
        }
    }
})