import { defineStore } from 'pinia';
import axios from 'axios'
import { useAuthStore } from './auth'

export const useOrdersStore = defineStore('orders', {
    
    state: () => ({
        orders: undefined,
        pendingOrders: undefined
    }),

    getters: {
        getOrders: (state) => state.orders,
        getPendingOrder: (state) => state.pendingOrders
    },

    actions: {
        //orders component
        async fetchOrders(){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get('api/orders', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            if(response.status === 200){
               
                this.orders = response.data
                this.pendingOrders = response.data.filter(e => e.status === "pending")
                console.log('pending orders', this.pendingOrders)
            }
        },

        // add orders
        async addOrders(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.post('api/orders', params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                });
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // edit orders
        async editOrders(params){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.patch(`api/orders/${params._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
        },

        // delete orders
        async deleteOrders(id){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.delete(`api/orders/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
            })
        },

        async fetchOrdersByUserId(id){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get(`api/orders/getOrdersByUserId/${id}`,{
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            if(response.status === 200){
                console.log('orders', response.data)
                this.orders = response.data
            }
        }
    }
})