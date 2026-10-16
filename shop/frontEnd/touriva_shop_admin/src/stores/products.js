import { defineStore } from 'pinia';
import axios from 'axios'

export const useProductsStore = defineStore('products', {
    
    state: () => ({
        products: [],
        loading: false
    }),

    getters: {
        getProducts: (state) => state.products,
        getLoading: (state) => state.loading
    },

    actions: {
        //products component
        async fetchProducts(){
            this.loading = true
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get('api/products', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })

            if(response.status === 200){
                this.products = response.data
                this.loading = false
            }
            
        },

        // add products
        async addProducts(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.post('api/products', params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                });
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // edit products
        async editProducts(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.patch(`api/products/${params._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // delete products
        async deleteProducts(id){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.delete(`api/products/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
            })
        },
    }
})