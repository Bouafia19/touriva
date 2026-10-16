import { defineStore } from 'pinia';
import axios from 'axios'
import { useAuthStore } from './auth'

export const useOrdersStore = defineStore('orders', {

    state: () => ({ 
        orders: undefined
    }),

    getters: {
        getOrders: (state) => state.orders
    },

    actions: {
        //orders component
        async fetchOrders(){
            const auth = useAuthStore()
            auth.getLSUserInfo().then(async (ls) => {
                const response = await axios.get('api/orders', {
                    headers: {
                        'Authorization': `Bearer ${ls.token}`
                    }
                })
                
                this.orders = response.data
            })
        },

        // add orders
        async addOrders(params){
            console.log('params', params)
            const auth = useAuthStore()
            auth.getLSUserInfo().then(async (ls) => {
                try {
                    const response = await axios.post('api/orders', params, {
                        headers: {
                            'Authorization': `Bearer ${ls.token}`
                        },
                    });
                } catch (error) {
                    throw new Error(`${error.response.data.error}`)
                }
            })
        },

        // edit orders
        async editOrders(params){
            const auth = useAuthStore()
            auth.getLSUserInfo().then(async (ls) => {
                try {
                    const response = await axios.patch(`api/orders/${params._id}`, params, {
                        headers: {
                            'Authorization': `Bearer ${ls.token}`
                        },
                    })
                } catch (error) {
                    throw new Error(`${error.response.data.error}`)
                }
            })
        },

        // delete orders
        async deleteOrders(id){
            const auth = useAuthStore()
            auth.getLSUserInfo().then(async (ls) => {
                const response = await axios.delete(`api/orders/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${ls.token}`
                    },
                })
            })
        },

        async fetchOrdersByUserId(){
            const auth = useAuthStore()
            auth.getLSUserInfo().then(async (ls) => {
                const response = await axios.get(`api/orders/getOrdersByUserId/${ls.user._id}`,{
                    headers: {
                        'Authorization': `Bearer ${ls.token}`
                    }
                })
                if(response.status === 200){
                    console.log('Orders', response.data)
                    this.orders = response.data
                }
            })
        }
    }
})
