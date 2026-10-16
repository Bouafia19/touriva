import { defineStore } from 'pinia'
import axios from 'axios'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { useAuthStore } from './auth'

export const useProductsStore = defineStore('products', {
    
    state: () => ({
        products: [],
        productId: null,
        loading: false,
        productsLocal: [],
        productsByCategoryLocal: [],
        productsByCategoryChilds: []
    }),

    getters: {
        getProducts: (state) => state.products,
        getProductId: (state) => state.productId,
        getLoading: (state) => state.loading,
        getProductsLocal: (state) => state.productsLocal,
        getProductsByCategoryLocal: (state) => state.productsByCategoryLocal,
        getProductsByCategoryChilds: (state) => state.productsByCategoryChilds
    },

    actions: {
        async fetchProducts(){
            return new Promise((resolve, reject) => {
                const auth = useAuthStore()

                auth.getLSUserInfo().then(async (ls) => {
                    try {
                        
                        const response = await axios.get(`/api/products`, {
                            headers: {
                                // 'Authorization': `Bearer ${ls.token}`
                            }
                        })
                        
                        if(response.status === 200){
                            this.productsLocal = response.data
                            this.productsLocal.map((pub) => {
                                this.cacheImage(pub.img, pub._id)
                            })
                            
                            resolve()
                        }
                    } catch (error) {
                        throw new Error(`${error}`)
                    }
                })
            })
        },

        async fetchProductsNoImages(){
            return new Promise((resolve, reject) => {
                const auth = useAuthStore()

                auth.getLSUserInfo().then(async (ls) => {
                    try {
                        
                        const response = await axios.post(`/api/products/noImages`, {
                            headers: {
                                // 'Authorization': `Bearer ${ls.token}`
                            }
                        })
                        
                        if(response.status === 200){
                            this.productsLocal = response.data
                            let counter = 0
                            for (const e of this.productsLocal) {
                                e.img = await this.loadCachedImage(e._id)
                                if(!e.img){
                                    counter++
                                }
                            }
                            if(counter > 0){
                                this.fetchProducts()
                            }
                            this.loading = false
                            resolve()
                        }
                    } catch (error) {
                        throw new Error(`${error}`)
                    }
                })
            })
        },

        async fetchProductsByCategory(id){
            return new Promise((resolve, reject) => {
                const auth = useAuthStore()

                auth.getLSUserInfo().then(async (ls) => {
                    try {
                        
                        const response = await axios.get(`/api/products/getProductsByCategory/${id}`, {
                            headers: {
                                // 'Authorization': `Bearer ${ls.token}`
                            }
                        })
                        
                        if(response.status === 200){
                            this.productsByCategoryLocal = response.data
                            this.productsByCategoryLocal.map((pub) => {
                                this.cacheImage(pub.img, pub._id)
                            })
                            
                            resolve()
                        }
                    } catch (error) {
                        throw new Error(`${error}`)
                    }
                })
            })
        },

        async fetchProductsByCategoryNoImages(id){
            return new Promise((resolve, reject) => {

                this.loading = true

                const auth = useAuthStore()

                auth.getLSUserInfo().then(async (ls) => {
                    try {
                        
                        const response = await axios.get(`/api/products/getProductsByCategoryNoImages/${id}`, {
                            headers: {
                                // 'Authorization': `Bearer ${ls.token}`
                            }
                        })
                        
                        if(response.status === 200){
                            this.productsByCategoryLocal = response.data
                            let counter = 0
                            for (const e of this.productsByCategoryLocal) {
                                e.img = await this.loadCachedImage(e._id)
                                if(!e.img){
                                    counter++
                                }
                            }
                            if(counter > 0){
                                this.fetchProductsByCategory(id)
                            }
                            this.loading = false
                            resolve()
                        }
                    } catch (error) {
                        throw new Error(`${error}`)
                    }
                })
            })
        },

        async fetchProductsByCategoryChilds(id){
            return new Promise((resolve, reject) => {

                this.loading = true

                const auth = useAuthStore()

                auth.getLSUserInfo().then(async (ls) => {
                    try {
                        
                        const response = await axios.post(`/api/catprod/getProductsByCategoryChilds/${id}`, {
                            headers: {
                                // 'Authorization': `Bearer ${ls.token}`
                            }
                        })
                        
                        if(response.status === 200){
                            this.productsByCategoryChilds = response.data
                            let counter = 0
                            for (const e of this.productsByCategoryChilds) {
                                e.img = await this.loadCachedImage(e._id)
                                if(!e.img){
                                    counter++
                                }
                            }
                            if(counter > 0){
                                this.fetchProductsByCategory(id)
                            }
                            this.loading = false
                            resolve()
                        }
                    } catch (error) {
                        throw new Error(`${error}`)
                    }
                })
            })
        },

        async loadCachedImage(fileName) {
            try {
                const result = await Filesystem.readFile({
                    path: `products/${fileName}`,
                    directory: Directory.Data,
                })
                return `data:image/jpeg;base64,${result.data}`
            } catch (error) {
                return null
            }
        },

        async cacheImage(base64Data, fileName) {
            await Filesystem.writeFile({
                path: `products/${fileName}`,
                data: base64Data,
                directory: Directory.Data,
                recursive: true,
            });
        }
    }
})
