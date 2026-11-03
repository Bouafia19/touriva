import { defineStore } from 'pinia'
import axios from 'axios'

export const useSellerStore = defineStore('seller', {
  state: () => ({
    profile: null,
    kpis: {
      totalProducts: 0,
      approvedProducts: 0,
      pendingProducts: 0,
      totalOrders: 0,
      pendingFulfillment: 0,
      grossSalesDZD: 0,
      netEarningsDZD: 0
    },
    recentOrders: [],
    products: [],
    orders: [],
    finances: {
      kpis: {
        grossSalesDZD: 0,
        totalCommissionDZD: 0,
        netEarningsDZD: 0,
        pendingPayoutDZD: 0
      },
      commissions: []
    },
    loading: false,
    error: null
  }),

  getters: {
    getProfile: (state) => state.profile,
    getKpis: (state) => state.kpis,
    getRecentOrders: (state) => state.recentOrders,
    getProducts: (state) => state.products,
    getOrders: (state) => state.orders,
    getFinances: (state) => state.finances,
    isLoading: (state) => state.loading
  },

  actions: {
    async fetchDashboard() {
      this.loading = true
      this.error = null
      try {
        const res = await axios.get('api/seller/dashboard')
        if (res.data?.success) {
          this.profile = res.data.profile || null
          this.kpis = res.data.kpis || this.kpis
          this.recentOrders = res.data.recentOrders || []
        }
        return res.data
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchProducts() {
      this.loading = true
      this.error = null
      try {
        const res = await axios.get('api/seller/products')
        if (res.data?.success) {
          this.products = res.data.products || []
        }
        return this.products
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async addProduct(payload) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.post('api/seller/products', payload)
        await this.fetchProducts()
        return res.data
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateProduct(id, payload) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.put(`api/seller/products/${id}`, payload)
        await this.fetchProducts()
        return res.data
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteProduct(id) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.delete(`api/seller/products/${id}`)
        this.products = this.products.filter(p => p._id !== id)
        return res.data
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchOrders() {
      this.loading = true
      this.error = null
      try {
        const res = await axios.get('api/seller/orders')
        if (res.data?.success) {
          this.orders = res.data.orders || []
        }
        return this.orders
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateFulfillment(orderItemId, payload) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.put(`api/seller/orders/${orderItemId}/fulfillment`, payload)
        await this.fetchOrders()
        return res.data
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchFinances() {
      this.loading = true
      this.error = null
      try {
        const res = await axios.get('api/seller/finances')
        if (res.data?.success) {
          this.finances = {
            kpis: res.data.kpis || this.finances.kpis,
            commissions: res.data.commissions || []
          }
        }
        return this.finances
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchProfile() {
      this.loading = true
      this.error = null
      try {
        const res = await axios.get('api/seller/profile')
        if (res.data?.success) {
          this.profile = res.data.profile || null
        }
        return this.profile
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateProfile(payload) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.put('api/seller/profile', payload)
        if (res.data?.success) {
          this.profile = res.data.profile
        }
        return res.data
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    }
  }
})
