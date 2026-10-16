import { defineStore } from 'pinia';
import axios from 'axios'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { useAuthStore } from './auth'

export const useCategoriesStore = defineStore('categories', {
    
    state: () => ({
        categories: [],
        categoryId: null,
        categoriesLocal: [],
        loading: false,
        categoryName: '',
        breadcrumbs: [],
        childs: [],
        childsLocal: [],
        categoriesNested: []
    }),

    getters: {
        getCategories: (state) => state.categories,
        getAnnouncementId: (state) => state.categoryId,
        getCategoriesLocal: (state) => state.categoriesLocal,
        getLoading: (state) => state.loading,
        getCategoryName: (state) => state.categoryName,
        getBreadcrumbs: (state) => state.breadcrumbs,
        getChilds: (state) => state.childs,
        getChildsLocal: (state) => state.childsLocal,
        getCategoriesNested: (state) => state.categoriesNested
    },

    actions: {
        async fetchCategories(){
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await axios.post('/api/categories', {
                        headers: {
                            // 'Authorization': `Bearer ${ls.token}`
                        }
                    })
                    
                    if(response.status === 200){
                        console.log('res', response.data)
                        this.categoriesLocal = response.data
                        this.categories = response.data
                        this.categories.map((cat) => {
                            this.cacheImage(cat.img, cat._id)
                        })
                        resolve()
                    }
                } catch (error) {
                    throw new Error(`${error}`)
                }
            })
            
        },

        async fetchCategoriesNoImages(){
            this.loading = true
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await axios.post('/api/categories/noImages', {
                        headers: {
                            // 'Authorization': `Bearer ${ls.token}`
                        }
                    })
                    if(response.status === 200){
                        console.log('s', response.data)
                        this.categoriesLocal = response.data
                        let counter = 0
                        for (const e of this.categoriesLocal) {
                            e.img = await this.loadCachedImage(e._id)
                            if(!e.img){
                                counter++
                            }
                        }
                        if(counter > 0){
                            this.fetchCategories()
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

        async fetchNestedCategories(params){
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await axios.post(`/api/categories/nested/${params.parentId}`, {
                        headers: {
                            // 'Authorization': `Bearer ${ls.token}`
                        }
                    })
                    
                    if(response.status === 200){
                        this.categoriesNested = response.data
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