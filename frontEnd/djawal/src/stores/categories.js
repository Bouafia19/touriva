import { defineStore } from 'pinia';
import axios from 'axios'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { useAuthStore } from './auth'

export const useCategoriesStore = defineStore('categories', {
    
    state: () => ({
        categories: [],
        categoriesSeller: [],
        categoryId: null,
        categoriesLocal: [],
        originCategories: [],
        categoriesSellerLocal: [],
        originCategoriesSeller: [],
        loading: false,
        categoryName: '',
        breadcrumbs: [],
        childs: [],
        childsLocal: []
    }),

    getters: {
        getCategories: (state) => state.categories,
        getCategoriesSeller: (state) => state.categoriesSeller,
        getAnnouncementId: (state) => state.categoryId,
        getCategoriesLocal: (state) => state.categoriesLocal,
        getOriginCategories : (state) => state.originCategories,
        getCategoriesSellerLocal: (state) => state.categoriesSellerLocal,
        getOriginCategoriesSeller : (state) => state.originCategoriesSeller,
        getLoading: (state) => state.loading,
        getCategoryName: (state) => state.categoryName,
        getBreadcrumbs: (state) => state.breadcrumbs,
        getChilds: (state) => state.childs,
        getChildsLocal: (state) => state.childsLocal
    },

    actions: {
        //categories component
        async fetchCategories(params){
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await axios.post('/api/categories', params, {
                        headers: {
                            // 'Authorization': `Bearer ${ls.token}`
                        }
                    })
                    if(response.status === 200){
                        this.categoriesLocal = response.data
                        this.categoriesLocal.map((cat) => {
                            this.cacheImage(cat.img, cat._id)
                        })
                        resolve()
                    }
                } catch (error) {
                    throw new Error(`${error}`)
                }
            })
        },

        async fetchCategoriesSeller(params){
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await axios.post('/api/categories', params, {
                        headers: {
                            // 'Authorization': `Bearer ${ls.token}`
                        }
                    })
                    if(response.status === 200){
                        this.categoriesSellerLocal = response.data
                        this.categoriesSellerLocal.map((cat) => {
                            this.cacheImage(cat.img, cat._id)
                        })
                        resolve()
                    }
                } catch (error) {
                    throw new Error(`${error}`)
                }
            })
        },

        async fetchCategoriesNoImages(params){
            this.loading = true
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await axios.post('/api/categories/noImages', params, {
                        headers: {
                            // 'Authorization': `Bearer ${ls.token}`
                        }
                    })
                    if(response.status === 200){
                        this.categoriesLocal = response.data
                        let counter = 0
                        for (const e of this.categoriesLocal) {
                            e.img = await this.loadCachedImage(e._id)
                            if(!e.img){
                                counter++
                            }
                        }
                        if(counter > 0){
                            this.fetchCategories(params)
                        }
                        this.loading = false
                        resolve()
                    }
                } catch (error) {
                    throw new Error(`${error}`)
                }
            })
        },

        async fetchCategoriesSellerNoImages(params){
            this.loading = true
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await axios.post('/api/categories/noImages', params, {
                        headers: {
                            // 'Authorization': `Bearer ${ls.token}`
                        }
                    })
                    if(response.status === 200){
                        this.categoriesSellerLocal = response.data
                        let counter = 0
                        for (const e of this.categoriesSellerLocal) {
                            e.img = await this.loadCachedImage(e._id)
                            if(!e.img){
                                counter++
                            }
                        }
                        if(counter > 0){
                            this.fetchCategoriesSeller(params)
                        }
                        this.loading = false
                        resolve()
                    }
                } catch (error) {
                    throw new Error(`${error}`)
                }
            })
        },

        async fetchChild(params){
            try {
                    const response = await axios.post('/api/categories/getChild', params, {
                        headers: {
                            // 'Authorization': `Bearer ${ls.token}`,
                            'Cache-Control': 'no-cache',
                            'Pragma': 'no-cache',
                            'Expires': '0'
                        }
                    })
                   
                    if(response.status === 200){
                        this.childsLocal = response.data
                        this.childsLocal.map((cat) => {
                            this.cacheImage(cat.img, cat._id)
                            cat.hasChild = cat.children.length > 0
                        })
                    }
                } catch (error) {
                    throw new Error(`${error}`)
                }
        },

        async fetchChildNoImages(params){
            this.loading = true
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await axios.post('/api/categories/getChild/noImages', params, {
                        headers: {
                            // 'Authorization': `Bearer ${ls.token}`,
                            'Cache-Control': 'no-cache',
                            'Pragma': 'no-cache',
                            'Expires': '0'
                        }
                    })
                    
                    if(response.status === 200){
                        this.childsLocal = response.data
                        let counter = 0
                        for (const e of this.childsLocal) {
                            e.img = await this.loadCachedImage(e._id)
                            e.hasChild = e.children.length > 0
                            if(!e.img){
                                counter++
                            }
                        }
                        if(counter > 0){
                            this.fetchChild(params)
                        }
                        this.loading = false
                        resolve()
                    }
                } catch (error) {
                    throw new Error(`${error}`)
                }
            })
        },

        async cacheImage(base64Data, fileName) {
            await Filesystem.writeFile({
                path: `categories/${fileName}`,
                data: base64Data,
                directory: Directory.Data,
                recursive: true,
            });
        },

        async loadCachedImage(fileName) {
            try {
                const result = await Filesystem.readFile({
                    path: `categories/${fileName}`,
                    directory: Directory.Data,
                })
                return `data:image/jpeg;base64,${result.data}`
            } catch (error) {
                return null
            }
        }
    }
})