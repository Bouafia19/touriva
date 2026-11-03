import { defineStore } from 'pinia'
import axios from 'axios'

export const useMarketplaceAdminStore = defineStore('marketplaceAdmin', {
  state: () => ({
    dashboardKpis: {
      totalVendors: 0,
      activeVendors: 0,
      suspendedVendors: 0,
      pendingApplications: 0,
      totalCatalogProducts: 0,
      pendingProductModeration: 0,
      totalOrders: 0,
      pendingPaymentOrders: 0,
      marketplaceGMVDZD: 0,
      totalCommissionEarnedDZD: 0
    },
    applications: [],
    sellers: [],
    moderationQueue: [],
    orders: [],
    commissions: [],
    settings: {
      defaultCommissionRate: 10,
      supportPhone: '0550 00 00 00',
      supportEmail: 'contact@touriva.dz',
      enableCod: true,
      enableBaridiMob: true,
      enableCcp: true
    },
    loading: false,
    error: null
  }),

  getters: {
    getKpis: (state) => state.dashboardKpis,
    getApplications: (state) => state.applications,
    getSellers: (state) => state.sellers,
    getModerationQueue: (state) => state.moderationQueue,
    getOrders: (state) => state.orders,
    getCommissions: (state) => state.commissions,
    getSettings: (state) => state.settings,
    isLoading: (state) => state.loading
  },

  actions: {
    async fetchDashboard() {
      this.loading = true
      this.error = null
      try {
        const res = await axios.get('api/admin/marketplace/dashboard')
        if (res.data?.success) {
          this.dashboardKpis = res.data.kpis || this.dashboardKpis
        }
        return res.data
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchApplications(status) {
      this.loading = true
      this.error = null
      try {
        const params = status && status !== 'all' ? { status } : {}
        const res = await axios.get('api/admin/marketplace/seller-applications', { params })
        if (res.data?.success) {
          this.applications = res.data.applications || []
        }
        return this.applications
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async reviewApplication(id, payload) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.put(`api/admin/marketplace/seller-applications/${id}`, payload)
        await this.fetchApplications()
        return res.data
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchSellers() {
      this.loading = true
      this.error = null
      try {
        const res = await axios.get('api/admin/marketplace/sellers')
        if (res.data?.success) {
          this.sellers = res.data.sellers || []
        }
        return this.sellers
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async toggleSellerSuspension(sellerId, isSuspended) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.put(`api/admin/marketplace/sellers/${sellerId}/suspension`, { isSuspended })
        await this.fetchSellers()
        return res.data
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchModerationQueue() {
      this.loading = true
      this.error = null
      try {
        const res = await axios.get('api/admin/marketplace/products/moderation')
        if (res.data?.success) {
          this.moderationQueue = res.data.products || []
        }
        return this.moderationQueue
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async moderateProduct(productId, payload) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.put(`api/admin/marketplace/products/${productId}/moderate`, payload)
        await this.fetchModerationQueue()
        return res.data
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchOrders(paymentStatus) {
      this.loading = true
      this.error = null
      try {
        const params = paymentStatus && paymentStatus !== 'all' ? { paymentStatus } : {}
        const res = await axios.get('api/admin/marketplace/orders', { params })
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

    async verifyPayment(orderId, payload) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.put(`api/admin/marketplace/orders/${orderId}/verify-payment`, payload)
        await this.fetchOrders()
        return res.data
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchCommissions(settlementStatus) {
      this.loading = true
      this.error = null
      try {
        const params = settlementStatus && settlementStatus !== 'all' ? { settlementStatus } : {}
        const res = await axios.get('api/admin/marketplace/commissions', { params })
        if (res.data?.success) {
          this.commissions = res.data.commissions || []
        }
        return this.commissions
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async settleCommission(commissionId, payload) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.put(`api/admin/marketplace/commissions/${commissionId}/settle`, payload)
        await this.fetchCommissions()
        return res.data
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchSettings() {
      this.loading = true
      this.error = null
      try {
        const res = await axios.get('api/admin/marketplace/settings')
        if (res.data?.success) {
          this.settings = res.data.settings || this.settings
        }
        return this.settings
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateSettings(payload) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.put('api/admin/marketplace/settings', payload)
        if (res.data?.success) {
          this.settings = res.data.settings
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
