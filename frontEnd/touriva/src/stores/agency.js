import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

export const useAgencyStore = defineStore('agency', {
  state: () => ({
    profile: null,
    metrics: {
      packagesCount: 0,
      publishedPackagesCount: 0,
      activeDeparturesCount: 0,
      totalBookedTravelers: 0
    },
    packages: [],
    departures: [],
    currentPackage: null,
    bookings: [],
    totalBookings: 0,
    currentBooking: null,
    enquiries: [],
    currentManifest: null,
    financialDashboard: null,
    payments: [],
    totalPayments: 0,
    refunds: [],
    totalRefunds: 0,
    bookingFinancials: null,
    loading: false,
    error: null
  }),

  getters: {
    isVerified: (state) => state.profile?.fileStatus === 'confirmed',
    fileStatus: (state) => state.profile?.fileStatus || 'created',
    rejectionReason: (state) => state.profile?.rejectionReason || null,
    getPackages: (state) => state.packages,
    getDepartures: (state) => state.departures,
    getBookings: (state) => state.bookings,
    getEnquiries: (state) => state.enquiries,
    pendingBookingsCount: (state) => state.metrics?.pendingBookingsCount || 0,
    pendingEnquiriesCount: (state) => state.metrics?.pendingEnquiriesCount || 0,
    isLoading: (state) => state.loading
  },

  actions: {
    getAuthHeaders(ls) {
      return {
        headers: {
          Authorization: `Bearer ${ls.token}`
        }
      }
    },

    async fetchProfile() {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        this.loading = false
        throw new Error('Unauthenticated')
      }

      try {
        const res = await axios.get('/api/agency/profile', this.getAuthHeaders(ls))
        this.profile = res.data.agency
        this.metrics = res.data.metrics
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('fetchProfile error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchPackages(status = null) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        this.loading = false
        throw new Error('Unauthenticated')
      }

      try {
        const url = status ? `/api/agency/packages?status=${status}` : '/api/agency/packages'
        const res = await axios.get(url, this.getAuthHeaders(ls))
        this.packages = res.data
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('fetchPackages error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchPackageById(id) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        this.loading = false
        throw new Error('Unauthenticated')
      }

      try {
        const res = await axios.get(`/api/agency/packages/${id}`, this.getAuthHeaders(ls))
        this.currentPackage = res.data.package
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('fetchPackageById error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async createPackage(payload) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        this.loading = false
        throw new Error('Unauthenticated')
      }

      try {
        const res = await axios.post('/api/agency/packages', payload, this.getAuthHeaders(ls))
        this.packages.unshift(res.data)
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('createPackage error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async updatePackage(id, payload) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        this.loading = false
        throw new Error('Unauthenticated')
      }

      try {
        const res = await axios.patch(`/api/agency/packages/${id}`, payload, this.getAuthHeaders(ls))
        const idx = this.packages.findIndex(p => p._id === id)
        if (idx !== -1) {
          this.packages[idx] = { ...this.packages[idx], ...res.data }
        }
        if (this.currentPackage && this.currentPackage._id === id) {
          this.currentPackage = res.data
        }
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('updatePackage error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async deletePackage(id) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        this.loading = false
        throw new Error('Unauthenticated')
      }

      try {
        await axios.delete(`/api/agency/packages/${id}`, this.getAuthHeaders(ls))
        this.packages = this.packages.filter(p => p._id !== id)
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('deletePackage error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchDepartures(params = {}) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        this.loading = false
        throw new Error('Unauthenticated')
      }

      try {
        const query = new URLSearchParams()
        if (params.trip) query.append('trip', params.trip)
        if (params.status) query.append('status', params.status)
        if (params.upcoming) query.append('upcoming', 'true')

        const qs = query.toString() ? `?${query.toString()}` : ''
        const res = await axios.get(`/api/agency/departures${qs}`, this.getAuthHeaders(ls))
        this.departures = res.data
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('fetchDepartures error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async createDeparture(payload) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        this.loading = false
        throw new Error('Unauthenticated')
      }

      try {
        const res = await axios.post('/api/agency/departures', payload, this.getAuthHeaders(ls))
        this.departures.unshift(res.data)
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('createDeparture error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateDeparture(id, payload) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        this.loading = false
        throw new Error('Unauthenticated')
      }

      try {
        const res = await axios.patch(`/api/agency/departures/${id}`, payload, this.getAuthHeaders(ls))
        const idx = this.departures.findIndex(d => d._id === id)
        if (idx !== -1) {
          this.departures[idx] = res.data
        }
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('updateDeparture error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async cancelDeparture(id, cancellationReason) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        this.loading = false
        throw new Error('Unauthenticated')
      }

      try {
        const res = await axios.patch(`/api/agency/departures/${id}/cancel`, { cancellationReason }, this.getAuthHeaders(ls))
        const idx = this.departures.findIndex(d => d._id === id)
        if (idx !== -1) {
          this.departures[idx] = res.data.departure
        }
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('cancelDeparture error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteDeparture(id) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        this.loading = false
        throw new Error('Unauthenticated')
      }

      try {
        await axios.delete(`/api/agency/departures/${id}`, this.getAuthHeaders(ls))
        this.departures = this.departures.filter(d => d._id !== id)
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('deleteDeparture error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    // ==========================================
    // PHASE 3: BOOKINGS ACTIONS
    // ==========================================
    async fetchBookings({ status = null, departure = null, search = '', page = 1, limit = 20 } = {}) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        this.loading = false
        throw new Error('Unauthenticated')
      }

      try {
        const params = new URLSearchParams()
        if (status) params.append('status', status)
        if (departure) params.append('departure', departure)
        if (search) params.append('search', search)
        params.append('page', page)
        params.append('limit', limit)

        const res = await axios.get(`/api/agency/bookings?${params.toString()}`, this.getAuthHeaders(ls))
        this.bookings = res.data.bookings || []
        this.totalBookings = res.data.pagination?.total || 0
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('fetchBookings error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchBookingById(id) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        this.loading = false
        throw new Error('Unauthenticated')
      }

      try {
        const res = await axios.get(`/api/agency/bookings/${id}`, this.getAuthHeaders(ls))
        this.currentBooking = res.data
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('fetchBookingById error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async confirmBooking(id, note = '') {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        this.loading = false
        throw new Error('Unauthenticated')
      }

      try {
        const res = await axios.patch(`/api/agency/bookings/${id}/confirm`, { note }, this.getAuthHeaders(ls))
        const idx = this.bookings.findIndex(b => b._id === id)
        if (idx !== -1) {
          this.bookings[idx] = res.data.booking
        }
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('confirmBooking error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async rejectBooking(id, rejectionReason) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        this.loading = false
        throw new Error('Unauthenticated')
      }

      try {
        const res = await axios.patch(`/api/agency/bookings/${id}/reject`, { rejectionReason }, this.getAuthHeaders(ls))
        const idx = this.bookings.findIndex(b => b._id === id)
        if (idx !== -1) {
          this.bookings[idx] = res.data.booking
        }
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('rejectBooking error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async cancelBooking(id, cancellationReason) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        this.loading = false
        throw new Error('Unauthenticated')
      }

      try {
        const res = await axios.patch(`/api/agency/bookings/${id}/cancel`, { cancellationReason }, this.getAuthHeaders(ls))
        const idx = this.bookings.findIndex(b => b._id === id)
        if (idx !== -1) {
          this.bookings[idx] = res.data.booking
        }
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('cancelBooking error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchManifest(departureId) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        this.loading = false
        throw new Error('Unauthenticated')
      }

      try {
        const res = await axios.get(`/api/agency/departures/${departureId}/manifest`, this.getAuthHeaders(ls))
        this.currentManifest = res.data
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('fetchManifest error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchManifestHtml(departureId) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        this.loading = false
        throw new Error('Unauthenticated')
      }

      try {
        const res = await axios.get(`/api/agency/departures/${departureId}/manifest?format=html`, {
          ...this.getAuthHeaders(ls),
          responseType: 'text'
        })
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('fetchManifestHtml error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    // ==========================================
    // PHASE 3: CUSTOM ENQUIRIES ACTIONS
    // ==========================================
    async fetchEnquiries(status = null) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        this.loading = false
        throw new Error('Unauthenticated')
      }

      try {
        const url = status ? `/api/agency/enquiries?status=${status}` : '/api/agency/enquiries'
        const res = await axios.get(url, this.getAuthHeaders(ls))
        this.enquiries = res.data || []
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('fetchEnquiries error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async quoteEnquiry(id, quotationData) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        this.loading = false
        throw new Error('Unauthenticated')
      }

      try {
        const res = await axios.post(`/api/agency/enquiries/${id}/quote`, quotationData, this.getAuthHeaders(ls))
        const idx = this.enquiries.findIndex(e => e._id === id)
        if (idx !== -1) {
          this.enquiries[idx] = res.data.enquiry
        }
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('quoteEnquiry error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async declineEnquiry(id, reason = '') {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        this.loading = false
        throw new Error('Unauthenticated')
      }

      try {
        const res = await axios.patch(`/api/agency/enquiries/${id}/decline`, { reason }, this.getAuthHeaders(ls))
        const idx = this.enquiries.findIndex(e => e._id === id)
        if (idx !== -1) {
          this.enquiries[idx] = res.data.enquiry
        }
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('declineEnquiry error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchFinancialDashboard(params = {}) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        this.loading = false
        throw new Error('Unauthenticated')
      }
      try {
        const res = await axios.get('/api/agency/financials/dashboard', {
          ...this.getAuthHeaders(ls),
          params
        })
        this.financialDashboard = res.data
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('fetchFinancialDashboard error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchPayments(params = {}) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        this.loading = false
        throw new Error('Unauthenticated')
      }
      try {
        const res = await axios.get('/api/agency/payments', {
          ...this.getAuthHeaders(ls),
          params
        })
        this.payments = res.data.payments || []
        this.totalPayments = res.data.total || 0
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('fetchPayments error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async recordPayment(bookingId, paymentData) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        this.loading = false
        throw new Error('Unauthenticated')
      }
      try {
        const res = await axios.post(`/api/agency/bookings/${bookingId}/payments`, paymentData, this.getAuthHeaders(ls))
        if (res.data.payment) {
          this.payments.unshift(res.data.payment)
        }
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('recordPayment error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async verifyPayment(paymentId, data = {}) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        this.loading = false
        throw new Error('Unauthenticated')
      }
      try {
        const res = await axios.patch(`/api/agency/payments/${paymentId}/verify`, data, this.getAuthHeaders(ls))
        const idx = this.payments.findIndex(p => p._id === paymentId)
        if (idx !== -1) {
          this.payments[idx] = res.data.payment
        }
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('verifyPayment error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async rejectPayment(paymentId, data = {}) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        this.loading = false
        throw new Error('Unauthenticated')
      }
      try {
        const res = await axios.patch(`/api/agency/payments/${paymentId}/reject`, data, this.getAuthHeaders(ls))
        const idx = this.payments.findIndex(p => p._id === paymentId)
        if (idx !== -1) {
          this.payments[idx] = res.data.payment
        }
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('rejectPayment error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchPaymentProofBlob(paymentId) {
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        throw new Error('Unauthenticated')
      }

      const res = await axios.get(`/api/agency/payments/${paymentId}/proof`, {
        ...this.getAuthHeaders(ls),
        responseType: 'blob'
      })
      const mimeType = res.headers['content-type'] || 'application/octet-stream'
      const url = URL.createObjectURL(res.data)
      return {
        blob: res.data,
        mimeType,
        url
      }
    },

    async fetchRefunds(params = {}) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        this.loading = false
        throw new Error('Unauthenticated')
      }
      try {
        const res = await axios.get('/api/agency/refunds', {
          ...this.getAuthHeaders(ls),
          params
        })
        this.refunds = res.data.refunds || []
        this.totalRefunds = res.data.total || 0
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('fetchRefunds error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async approveRefund(refundId, data = {}) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        this.loading = false
        throw new Error('Unauthenticated')
      }
      try {
        const res = await axios.patch(`/api/agency/refunds/${refundId}/approve`, data, this.getAuthHeaders(ls))
        const idx = this.refunds.findIndex(r => r._id === refundId)
        if (idx !== -1) {
          this.refunds[idx] = res.data.refund
        }
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('approveRefund error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async completeRefund(refundId, data = {}) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        this.loading = false
        throw new Error('Unauthenticated')
      }
      try {
        const res = await axios.patch(`/api/agency/refunds/${refundId}/complete`, data, this.getAuthHeaders(ls))
        const idx = this.refunds.findIndex(r => r._id === refundId)
        if (idx !== -1) {
          this.refunds[idx] = res.data.refund
        }
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('completeRefund error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async rejectRefund(refundId, data = {}) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        this.loading = false
        throw new Error('Unauthenticated')
      }
      try {
        const res = await axios.patch(`/api/agency/refunds/${refundId}/reject`, data, this.getAuthHeaders(ls))
        const idx = this.refunds.findIndex(r => r._id === refundId)
        if (idx !== -1) {
          this.refunds[idx] = res.data.refund
        }
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('rejectRefund error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchBookingFinancials(bookingId, phone = '') {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      const config = ls && ls.token ? this.getAuthHeaders(ls) : {}
      if (phone) {
        config.params = { phone }
      }
      try {
        const res = await axios.get(`/api/bookings/${bookingId}/financials`, config)
        this.bookingFinancials = res.data
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('fetchBookingFinancials error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async submitCustomerPaymentProof(bookingId, paymentData) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      const config = ls && ls.token ? this.getAuthHeaders(ls) : {}
      try {
        const res = await axios.post(`/api/bookings/${bookingId}/payments/submit`, paymentData, config)
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('submitCustomerPaymentProof error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async requestBookingRefund(bookingId, refundData) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const ls = await auth.getLSUserInfo()
      if (!ls || !ls.token) {
        this.loading = false
        throw new Error('Unauthenticated')
      }
      try {
        const res = await axios.post(`/api/bookings/${bookingId}/refunds/request`, refundData, this.getAuthHeaders(ls))
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
        console.error('requestBookingRefund error:', err)
        throw err
      } finally {
        this.loading = false
      }
    }
  }
})
