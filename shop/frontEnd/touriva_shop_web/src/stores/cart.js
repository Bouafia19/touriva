import { defineStore } from 'pinia'

const STORAGE_KEY = 'touriva_shop_cart'

const loadInitialCart = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error('Failed to parse cart from localStorage:', e)
    return []
  }
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: loadInitialCart(),
    isDrawerOpen: false,
  }),

  getters: {
    getItems: (state) => state.items,
    itemCount: (state) => state.items.reduce((acc, item) => acc + (item.quantity || 1), 0),
    subtotal: (state) => state.items.reduce((acc, item) => acc + ((item.product?.price || 0) * (item.quantity || 1)), 0),
    total: (state) => state.items.reduce((acc, item) => acc + ((item.product?.price || 0) * (item.quantity || 1)), 0),
  },

  actions: {
    saveToStorage() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items))
      } catch (e) {
        console.error('Failed to save cart to localStorage:', e)
      }
    },

    addToCart(product, quantity = 1) {
      if (!product || !product._id) return

      const existingIndex = this.items.findIndex((item) => item.product._id === product._id)
      if (existingIndex > -1) {
        this.items[existingIndex].quantity += quantity
      } else {
        this.items.push({
          product,
          quantity: Math.max(1, quantity)
        })
      }
      this.saveToStorage()
      this.isDrawerOpen = true
    },

    removeFromCart(productId) {
      this.items = this.items.filter((item) => item.product._id !== productId)
      this.saveToStorage()
    },

    updateQuantity(productId, quantity) {
      const target = this.items.find((item) => item.product._id === productId)
      if (target) {
        if (quantity <= 0) {
          this.removeFromCart(productId)
        } else {
          target.quantity = quantity
          this.saveToStorage()
        }
      }
    },

    clearCart() {
      this.items = []
      this.saveToStorage()
    },

    toggleDrawer() {
      this.isDrawerOpen = !this.isDrawerOpen
    },

    openDrawer() {
      this.isDrawerOpen = true
    },

    closeDrawer() {
      this.isDrawerOpen = false
    }
  }
})
