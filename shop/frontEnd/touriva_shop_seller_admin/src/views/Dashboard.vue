<template>
  <v-container fluid class="px-4 px-md-8 py-6">
    <!-- Editorial Page Header -->
    <div class="editorial-page-header">
      <div>
        <div class="editorial-tag mb-1">Partner Portal</div>
        <h1 class="editorial-page-title">Merchant Dashboard</h1>
        <p class="editorial-page-subtitle">Track sales volume, inventory performance, client orders, and partner campaigns.</p>
      </div>

      <div class="d-flex align-center gap-2 flex-wrap">
        <v-btn
          variant="outlined"
          class="btn-editorial-outline px-4 me-2"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="refreshData"
        >
          {{ $t('Refresh') || 'Refresh' }}
        </v-btn>
        <v-btn
          class="btn-editorial-primary px-5"
          prepend-icon="mdi-plus"
          to="/products"
        >
          {{ $t('New') || 'Add Product' }}
        </v-btn>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && isInitialLoad" class="d-flex justify-center align-center py-16">
      <div class="text-center">
        <v-progress-circular indeterminate color="forestGreen" size="48" width="4"></v-progress-circular>
        <div class="mt-4 text-subtitle-2 text-editorial-secondary">Loading merchant overview...</div>
      </div>
    </div>

    <div v-else>
      <!-- Stat Cards Grid -->
      <v-row class="mb-6">
        <!-- Stat 1: Total Orders -->
        <v-col cols="12" sm="6" lg="3">
          <div class="editorial-stat-card">
            <div class="d-flex justify-space-between align-start">
              <div>
                <span class="editorial-tag">Orders</span>
                <div class="text-h4 font-serif font-weight-bold text-deep-green mt-1">
                  {{ orderStats.totalOrders }}
                </div>
                <div class="text-caption text-editorial-secondary mt-1">
                  Merchant Orders Fulfilled
                </div>
              </div>
              <div class="stat-icon-wrapper bg-sand-light">
                <v-icon icon="mdi-receipt-text-outline" color="#B89564" size="24"></v-icon>
              </div>
            </div>
            <div class="d-flex align-center justify-space-between mt-4 pt-3 border-t">
              <span class="status-badge status-badge-warning">
                <span class="status-badge-dot"></span>
                {{ orderStats.pendingOrders }} Pending
              </span>
              <router-link to="/orders" class="text-caption font-weight-bold text-forest text-decoration-none">
                Process orders &rarr;
              </router-link>
            </div>
          </div>
        </v-col>

        <!-- Stat 2: Gross Revenue / Volume -->
        <v-col cols="12" sm="6" lg="3">
          <div class="editorial-stat-card">
            <div class="d-flex justify-space-between align-start">
              <div>
                <span class="editorial-tag">Earnings</span>
                <div class="text-h4 font-serif font-weight-bold text-forest mt-1">
                  {{ formatCurrency(orderStats.totalVolume) }}
                </div>
                <div class="text-caption text-editorial-secondary mt-1">
                  Total Order Value
                </div>
              </div>
              <div class="stat-icon-wrapper" style="background-color: rgba(33, 134, 107, 0.12);">
                <v-icon icon="mdi-cash-multiple" color="#21866B" size="24"></v-icon>
              </div>
            </div>
            <div class="d-flex align-center justify-space-between mt-4 pt-3 border-t">
              <span class="status-badge status-badge-success">
                <span class="status-badge-dot"></span>
                Active Merchant
              </span>
              <router-link to="/billing" class="text-caption font-weight-bold text-forest text-decoration-none">
                Statements &rarr;
              </router-link>
            </div>
          </div>
        </v-col>

        <!-- Stat 3: Products Catalog -->
        <v-col cols="12" sm="6" lg="3">
          <div class="editorial-stat-card">
            <div class="d-flex justify-space-between align-start">
              <div>
                <span class="editorial-tag">Inventory</span>
                <div class="text-h4 font-serif font-weight-bold text-deep-green mt-1">
                  {{ productStats.total }}
                </div>
                <div class="text-caption text-editorial-secondary mt-1">
                  Products in Store
                </div>
              </div>
              <div class="stat-icon-wrapper" style="background-color: rgba(23, 63, 53, 0.1);">
                <v-icon icon="mdi-package-variant-closed" color="#173F35" size="24"></v-icon>
              </div>
            </div>
            <div class="d-flex align-center justify-space-between mt-4 pt-3 border-t">
              <span class="status-badge status-badge-sand">
                <span class="status-badge-dot"></span>
                {{ productStats.published }} Live in Store
              </span>
              <router-link to="/products" class="text-caption font-weight-bold text-forest text-decoration-none">
                Inventory &rarr;
              </router-link>
            </div>
          </div>
        </v-col>

        <!-- Stat 4: Community & Users -->
        <v-col cols="12" sm="6" lg="3">
          <div class="editorial-stat-card">
            <div class="d-flex justify-space-between align-start">
              <div>
                <span class="editorial-tag">Client Reach</span>
                <div class="text-h4 font-serif font-weight-bold text-deep-green mt-1">
                  {{ userStats.clients }}
                </div>
                <div class="text-caption text-editorial-secondary mt-1">
                  Active Shoppers
                </div>
              </div>
              <div class="stat-icon-wrapper" style="background-color: rgba(42, 111, 133, 0.12);">
                <v-icon icon="mdi-account-group-outline" color="#2A6F85" size="24"></v-icon>
              </div>
            </div>
            <div class="d-flex align-center justify-space-between mt-4 pt-3 border-t">
              <span class="status-badge status-badge-info">
                <span class="status-badge-dot"></span>
                {{ userStats.total }} Accounts
              </span>
              <router-link to="/users" class="text-caption font-weight-bold text-forest text-decoration-none">
                Client directory &rarr;
              </router-link>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Quick Actions Banner -->
      <v-card class="editorial-card mb-6 pa-4 pa-md-5">
        <div class="d-flex flex-wrap align-center justify-space-between gap-3">
          <div>
            <h3 class="font-serif text-h6 font-weight-bold text-deep-green mb-1">Store Actions & Quick Links</h3>
            <p class="text-caption text-editorial-secondary mb-0">Frequently accessed tools for managing merchant catalog and fulfillment.</p>
          </div>
          <div class="d-flex flex-wrap gap-2">
            <v-btn
              to="/products"
              class="btn-editorial-primary text-none px-4 me-2 my-1"
              size="small"
              prepend-icon="mdi-plus-box-outline"
            >
              Add New Product
            </v-btn>
            <v-btn
              to="/orders"
              class="btn-editorial-sand text-none px-4 me-2 my-1"
              size="small"
              prepend-icon="mdi-receipt"
            >
              Process Orders
            </v-btn>
            <v-btn
              to="/admin/categories"
              class="btn-editorial-outline text-none px-4 me-2 my-1"
              size="small"
              prepend-icon="mdi-shape-outline"
            >
              Browse Categories
            </v-btn>
            <v-btn
              to="/ads"
              variant="text"
              class="btn-editorial-ghost text-none px-3 my-1"
              size="small"
              prepend-icon="mdi-bullhorn-outline"
            >
              Promotions
            </v-btn>
          </div>
        </div>
      </v-card>

      <!-- Two-Column Main Content: Recent Orders & Catalog Highlights -->
      <v-row>
        <!-- Left: Recent Orders / Transactions -->
        <v-col cols="12" lg="8">
          <div class="editorial-card">
            <div class="editorial-card-header">
              <div class="d-flex align-center">
                <v-icon icon="mdi-history" color="forestGreen" class="me-2"></v-icon>
                <div>
                  <h2 class="text-subtitle-1 font-weight-bold text-deep-green mb-0 font-serif">Recent Merchant Orders</h2>
                  <span class="text-caption text-editorial-secondary">Client orders awaiting fulfillment and status updates</span>
                </div>
              </div>
              <v-btn
                to="/orders"
                variant="text"
                size="small"
                class="btn-editorial-ghost"
              >
                View all &rarr;
              </v-btn>
            </div>

            <!-- Table or Empty State -->
            <div v-if="recentOrders.length > 0" class="table-responsive">
              <v-table density="comfortable" class="editorial-table">
                <thead>
                  <tr>
                    <th>Order Ref / Code</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="ord in recentOrders" :key="ord._id || ord.id">
                    <td class="font-weight-medium text-deep-green">
                      {{ ord.code || (ord._id ? '#' + ord._id.slice(-6).toUpperCase() : 'N/A') }}
                    </td>
                    <td>
                      <div class="font-weight-medium">{{ getCustomerName(ord) }}</div>
                      <div class="text-caption text-editorial-secondary">{{ ord.client?.email || ord.customerEmail || '' }}</div>
                    </td>
                    <td class="text-caption">
                      {{ formatDate(ord.createdAt || ord.date) }}
                    </td>
                    <td class="font-weight-bold text-forest">
                      {{ formatCurrency(ord.totalAmount || ord.total || ord.price || 0) }}
                    </td>
                    <td>
                      <span :class="['status-badge', getOrderStatusBadgeClass(ord.status)]">
                        <span class="status-badge-dot"></span>
                        {{ ord.status || 'pending' }}
                      </span>
                    </td>
                    <td class="text-end">
                      <v-btn
                        icon="mdi-arrow-right"
                        size="x-small"
                        variant="tonal"
                        color="forestGreen"
                        @click="viewOrder(ord)"
                        title="View order details"
                      ></v-btn>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>

            <div v-else class="text-center py-10 px-4">
              <v-icon icon="mdi-basket-outline" size="48" color="sand" class="mb-2"></v-icon>
              <div class="text-subtitle-2 font-weight-medium text-deep-green">No Orders Yet</div>
              <p class="text-caption text-editorial-secondary mb-4">When customers purchase items from your catalog, orders will appear here.</p>
              <v-btn to="/products" size="small" class="btn-editorial-primary px-4">
                Manage Product Listings
              </v-btn>
            </div>
          </div>
        </v-col>

        <!-- Right: Catalog Snapshot & Platform Status -->
        <v-col cols="12" lg="4">
          <!-- Catalog Highlights -->
          <div class="editorial-card mb-6">
            <div class="editorial-card-header">
              <div class="d-flex align-center">
                <v-icon icon="mdi-tag-outline" color="sandDark" class="me-2"></v-icon>
                <h2 class="text-subtitle-1 font-weight-bold text-deep-green mb-0 font-serif">Top Products</h2>
              </div>
              <router-link to="/products" class="text-caption font-weight-bold text-forest text-decoration-none">
                All ({{ productStats.total }})
              </router-link>
            </div>

            <div v-if="recentProducts.length > 0" class="pa-3">
              <div
                v-for="prod in recentProducts"
                :key="prod._id"
                class="product-preview-row d-flex align-center py-2 px-2 border-b"
              >
                <v-avatar rounded="lg" size="44" class="me-3 bg-sand-light border-editorial flex-shrink-0">
                  <v-img v-if="prod.img" :src="prod.img" cover></v-img>
                  <v-icon v-else icon="mdi-package-variant" color="forestGreen" size="22"></v-icon>
                </v-avatar>
                <div class="overflow-hidden flex-grow-1">
                  <div class="text-subtitle-2 font-weight-semibold text-truncate text-deep-green">{{ prod.name }}</div>
                  <div class="d-flex align-center gap-2 mt-1">
                    <span class="text-caption font-weight-bold text-forest">{{ formatCurrency(prod.price) }}</span>
                    <span class="text-caption text-editorial-secondary ms-2">Code: {{ prod.code || 'N/A' }}</span>
                  </div>
                </div>
                <span :class="['status-badge ms-2', prod.published ? 'status-badge-success' : 'status-badge-neutral']" style="font-size: 0.65rem; padding: 2px 8px;">
                  {{ prod.published ? 'Live' : 'Draft' }}
                </span>
              </div>
            </div>

            <div v-else class="text-center py-8 px-4">
              <v-icon icon="mdi-package-variant-closed" size="36" color="sand" class="mb-2"></v-icon>
              <div class="text-caption text-editorial-secondary">No items in your merchant inventory yet.</div>
              <v-btn to="/products" size="x-small" class="btn-editorial-sand px-3 mt-3">
                Add First Product
              </v-btn>
            </div>
          </div>

          <!-- Editorial Platform Health Card -->
          <div class="editorial-card pa-4">
            <div class="d-flex align-center justify-space-between mb-3">
              <span class="editorial-tag">Merchant Status</span>
              <span class="status-badge status-badge-success">
                <span class="status-badge-dot"></span> Verified
              </span>
            </div>
            <div class="mb-3">
              <div class="d-flex justify-space-between text-caption mb-1">
                <span class="text-editorial-secondary">Live Catalog Ratio</span>
                <span class="font-weight-bold text-deep-green">{{ publishedRatio }}%</span>
              </div>
              <v-progress-linear
                :model-value="publishedRatio"
                color="forestGreen"
                height="6"
                rounded
                bg-color="sandLight"
              ></v-progress-linear>
            </div>

            <div class="pt-2 border-t d-flex justify-space-between align-center text-caption">
              <span class="text-editorial-secondary">Active Campaigns:</span>
              <span class="font-weight-bold text-deep-green">{{ activeAdsCount }} running</span>
            </div>
            <div class="pt-2 border-t d-flex justify-space-between align-center text-caption mt-2">
              <span class="text-editorial-secondary">Pending Orders:</span>
              <span class="font-weight-bold text-sand-dark">{{ orderStats.pendingOrders }} action required</span>
            </div>
          </div>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOrdersStore } from '@/stores/orders'
import { useProductsStore } from '@/stores/products'
import { useUsersStore } from '@/stores/users'
import { useAdsStore } from '@/stores/advertising'

const orders = useOrdersStore()
const products = useProductsStore()
const users = useUsersStore()
const ads = useAdsStore()
const router = useRouter()

const loading = ref(false)
const isInitialLoad = ref(true)

const orderStats = computed(() => {
  const ords = orders.getOrders || []
  const pending = orders.getPendingOrder || []
  let volume = 0
  ords.forEach(o => {
    const val = Number(o.totalAmount || o.total || o.price || 0)
    if (!isNaN(val)) volume += val
  })
  return {
    totalOrders: ords.length,
    pendingOrders: pending.length,
    totalVolume: volume
  }
})

const productStats = computed(() => {
  const prods = products.getProducts || []
  const published = prods.filter(p => p.published).length
  return {
    total: prods.length,
    published
  }
})

const userStats = computed(() => {
  const us = users.getUsers || []
  const clients = users.getClients || []
  const partners = users.getPartners || []
  const pendingPartners = users.getPendingPartners || []
  return {
    total: us.length,
    clients: clients.length,
    partners: partners.length,
    pendingPartners: pendingPartners.length
  }
})

const activeAdsCount = computed(() => {
  return ads.getAds?.length || 0
})

const publishedRatio = computed(() => {
  if (!productStats.value.total) return 0
  return Math.round((productStats.value.published / productStats.value.total) * 100)
})

const recentOrders = computed(() => {
  const ords = orders.getOrders || []
  return [...ords].slice(0, 7)
})

const recentProducts = computed(() => {
  const prods = products.getProducts || []
  return [...prods].slice(0, 5)
})

const getCustomerName = (ord) => {
  if (ord.client) {
    if (ord.client.firstName || ord.client.lastName) {
      return `${ord.client.firstName || ''} ${ord.client.lastName || ''}`.trim()
    }
    if (ord.client.companyName) return ord.client.companyName
  }
  if (ord.customerName) return ord.customerName
  if (ord.firstName || ord.lastName) {
    return `${ord.firstName || ''} ${ord.lastName || ''}`.trim()
  }
  return 'Direct Customer'
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'Recent'
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  } catch (e) {
    return dateStr
  }
}

const formatCurrency = (val) => {
  const num = Number(val) || 0
  return new Intl.NumberFormat('en-DZ', {
    style: 'currency',
    currency: 'DZD',
    maximumFractionDigits: 0
  }).format(num)
}

const getOrderStatusBadgeClass = (status) => {
  const s = String(status).toLowerCase()
  if (s === 'confirmed' || s === 'completed' || s === 'paid' || s === 'delivered') {
    return 'status-badge-success'
  }
  if (s === 'pending' || s === 'processing') {
    return 'status-badge-warning'
  }
  if (s === 'cancelled' || s === 'rejected') {
    return 'status-badge-error'
  }
  return 'status-badge-sand'
}

const viewOrder = (ord) => {
  if (ord._id) {
    const clientName = getCustomerName(ord)
    router.push({ name: 'OrderDetail', params: { id: ord._id, client: clientName } })
  } else {
    router.push({ name: 'Orders' })
  }
}

const refreshData = async () => {
  loading.value = true
  try {
    await Promise.allSettled([
      orders.fetchOrders(),
      products.fetchProducts(),
      users.fetchUsers(),
      ads.fetchAds()
    ])
  } catch (e) {
    console.error('Error refreshing dashboard data', e)
  } finally {
    loading.value = false
    isInitialLoad.value = false
  }
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.editorial-table {
  background: transparent !important;
}

.editorial-table thead tr th {
  background-color: #102D27 !important;
  color: #FAF8F2 !important;
  font-family: var(--font-sans) !important;
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.06em !important;
  padding: 12px 16px !important;
  border-bottom: 2px solid var(--color-sand) !important;
}

.editorial-table tbody tr td {
  padding: 14px 16px !important;
  border-bottom: 1px solid var(--color-border) !important;
  font-size: 0.88rem !important;
}

.editorial-table tbody tr:hover {
  background-color: #F8F6F0 !important;
}

.product-preview-row:last-child {
  border-bottom: none !important;
}

.table-responsive {
  overflow-x: auto;
}
</style>