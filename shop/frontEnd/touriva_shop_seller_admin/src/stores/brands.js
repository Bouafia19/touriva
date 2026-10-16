import { defineStore } from 'pinia';
import axios from 'axios'

export const useBrandsStore = defineStore('brands', {
    
    state: () => ({
        brands: []
    }),

    getters: {
        getBrands: (state) => state.brands
    },

    actions: {
        //brands component
        async fetchBrands(){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get('api/brands', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            this.brands = response.data
        },

        // add brands
        async addBrands(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.post('api/brands', params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                });
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // edit brands
        async editBrands(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.patch(`api/brands/${params._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // delete brands
        async deleteBrands(id){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.delete(`api/brands/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
            })
        },
    }
})