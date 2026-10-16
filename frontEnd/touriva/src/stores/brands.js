import { defineStore } from 'pinia';
import axios from 'axios'

export const useBrandsStore = defineStore('brands', {

    state: () => ({ 
        brands: [],
        loadingBrands: true
    }),

    getters: {
        getBrands: (state) => state.brands,
        getLoadingBrands: (state) => state.loadingBrands
    },

    actions: {
        //brands component
        async fetchBrands(){
            this.loadingBrands = true
            try {
                const response = await axios.get('api/brands', {
                    // headers: {
                    //     'Authorization': `Bearer ${user.token}`
                    // }
                });
                if(response.status === 200){
                    this.brands = response.data
                    this.loadingBrands = false
                }
            } catch (error) {
                throw new Error(`${error}`)
            }
        }
    }
})