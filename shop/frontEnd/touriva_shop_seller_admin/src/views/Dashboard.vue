<template>
  <v-container fluid class="px-4 px-md-8 py-6">
    <!-- Editorial Page Header -->
    <div class="editorial-page-header">
      <div>
        <div class="editorial-tag mb-1">Partner Portal</div>
        <h1 class="editorial-page-title">{{ sellerStore.profile?.storeName || 'Merchant Dashboard' }}</h1>
        <p class="editorial-page-subtitle">Track your marketplace catalog moderation, customer orders, and net payouts.</p>
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

    <!-- Alert / Suspension Notice -->
    <v-alert
      v-if="sellerStore.profile?.isSuspended"
      type="error"
      variant="tonal"
      class="mb-6 rounded-lg"
      prominent
    >
      <div class="font-weight-bold">Store Temporarily Suspended</div>
      <div>Your store has been paused by marketplace administration. Products are temporarily hidden from public view. Please contact Touriva support.</div>
    </v-alert>

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
                  {{ kpis.totalOrders }}
                </div>
                <div class="text-caption text-editorial-secondary mt-1">
                  Customer Items Ordered
                </div>
              </div>
              <div class="stat-icon-wrapper bg-sand-light">
                <v-icon icon="mdi-receipt-text-outline" color="#B89564" size="24"></v-icon>
              </div>
            </div>
            <div class="d-flex align-center justify-space-between mt-4 pt-3 border-t">
              <span class="status-badge status-badge-warning">
                <span class="status-badge-dot"></span>
                {{ kpis.pendingFulfillment }} Pending
              </span>
              <router-link to="/orders" class="text-caption font-weight-bold text-forest text-decoration-none">
                Fulfill items &rarr;
              </router-link>
            </div>
          </div>
        </v-col>

        <!-- Stat 2: Gross Revenue -->
        <v-col cols="12" sm="6" lg="3">
          <div class="editorial-stat-card">
            <div class="d-flex justify-space-between align-start">
              <div>
                <span class="editorial-tag">Gross Sales</span>
                <div class="text-h4 font-serif font-weight-bold text-deep-green mt-1">
                  {{ formatCurrency(kpis.grossSalesDZD) }}
                </div>
                <div class="text-caption text-editorial-secondary mt-1">
                  Total Order Value
                </div>
              </div>
              <div class="stat-icon-wrapper bg-sand-light">
                <v-icon icon="mdi-cash-multiple" color="#B89564" size="24"></v-icon>
              </div>
            </div>
            <div class="d-flex align-center justify-space-between mt-4 pt-3 border-t">
              <span class="text-caption text-editorial-secondary">Commission deducted at payout</span>
            </div>
          </div>
        </v-col>

        <!-- Stat 3: Net Earnings -->
        <v-col cols="12" sm="6" lg="3">
          <div class="editorial-stat-card">
            <div class="d-flex justify-space-between align-start">
              <div>
                <span class="editorial-tag">Net Earnings</span>
                <div class="text-h4 font-serif font-weight-bold text-forest mt-1">
                  {{ formatCurrency(kpis.netEarningsDZD) }}
                </div>
                <div class="text-caption text-editorial-secondary mt-1">
                  Seller Payout Balance
                </div>
              </div>
              <div class="stat-icon-wrapper bg-sand-light">
                <v-icon icon="mdi-wallet-outline" color="#21866B" size="24"></v-icon>
              </div>
            </div>
            <div class="d-flex align-center justify-space-between mt-4 pt-3 border-t">
              <router-link to="/finances" class="text-caption font-weight-bold text-forest text-decoration-none">
                View Ledger &rarr;
              </router-link>
            </div>
          </div>
        </v-col>

        <!-- Stat 4: Catalog & Moderation -->
        <v-col cols="12" sm="6" lg="3">
          <div class="editorial-stat-card">
            <div class="d-flex justify-space-between align-start">
              <div>
                <span class="editorial-tag">Catalog Items</span>
                <div class="text-h4 font-serif font-weight-bold text-deep-green mt-1">
                  {{ kpis.totalProducts }}
                </div>
                <div class="text-caption text-editorial-secondary mt-1">
                  {{ kpis.approvedProducts }} Live & Approved
                </div>
              </div>
              <div class="stat-icon-wrapper bg-sand-light">
                <v-icon icon="mdi-package-variant-closed" color="#B89564" size="24"></v-icon>
              </div>
            </div>
            <div class="d-flex align-center justify-space-between mt-4 pt-3 border-t">
              <span class="status-badge status-badge-warning" v-if="kpis.pendingProducts > 0">
                <span class="status-badge-dot"></span>
                {{ kpis.pendingProducts }} in Review
              </span>
              <span class="status-badge status-badge-success" v-else>
                All Approved
              </span>
              <router-link to="/products" class="text-caption font-weight-bold text-forest text-decoration-none">
                Manage &rarr;
              </router-link>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Main Layout Rows -->
      <v-row>
        <!-- Recent Orders to Fulfill -->
        <v-col cols="12" lg="8">
          <div class="editorial-table-container">
            <div class="pa-4 bg-white d-flex align-center justify-space-between border-b">
              <div>
                <h2 class="text-subtitle-1 font-weight-bold text-deep-green">Recent Customer Order Items</h2>
                <div class="text-caption text-editorial-secondary">Items requiring preparation and shipment</div>
              </div>
              <v-btn to="/orders" variant="text" size="small" class="text-forest font-weight-bold">
                View all &rarr;
              </v-btn>
            </div>

            <v-data-table
              :headers="orderHeaders"
              :items="recentOrders"
              :loading="loading"
              class="editorial-table"
              density="comfortable"
            >
              <template v-slot:[`item.orderNumber`]="{ item }">
                <span class="font-weight-bold text-deep-green">
                  {{ item.orderId?.orderNumber || 'TRV-MKT' }}
                </span>
              </template>

              <template v-slot:[`item.productTitle`]="{ item }">
                <div class="font-weight-medium text-deep-green">
                  {{ item.productTitle }}
                </div>
                <div class="text-caption text-editorial-secondary">
                  Qty: {{ item.quantity }} &times; {{ formatCurrency(item.unitPriceDZD) }}
                </div>
              </template>

              <template v-slot:[`item.customer`]="{ item }">
                <div>
                  <div class="font-weight-medium text-deep-green">
                    {{ item.orderId?.customerInfo?.fullName || 'Customer' }}
                  </div>
                  <div class="text-caption text-editorial-secondary">
                    {{ item.orderId?.customerInfo?.wilaya || 'Algeria' }}
                  </div>
                </div>
              </template>

              <template v-slot:[`item.fulfillmentStatus`]="{ item }">
                <span :class="['status-badge', getFulfillmentBadge(item.fulfillmentStatus)]">
                  <span class="status-badge-dot"></span>
                  {{ item.fulfillmentStatus || 'pending' }}
                </span>
              </template>

              <template v-slot:[`item.actions`]="{ item }">
                <v-btn
                  to="/orders"
                  size="x-small"
                  variant="outlined"
                  class="btn-editorial-outline px-2"
                >
                  Fulfill
                </v-btn>
              </template>

              <template v-slot:no-data>
                <div class="text-center py-8 text-editorial-secondary">
                  <v-icon icon="mdi-package-check" size="36" color="sand" class="mb-2"></v-icon>
                  <div>No pending orders at this moment.</div>
                </div>
              </template>
            </v-data-table>
          </div>
        </v-col>

        <!-- Right Side: Store Summary -->
        <v-col cols="12" lg="4">
          <div class="editorial-card pa-5 mb-4">
            <span class="editorial-tag mb-2">Artisan Profile</span>
            <div class="d-flex align-center gap-3 my-3">
              <v-avatar size="48" class="bg-sand-light border-editorial">
                <v-img v-if="sellerStore.profile?.logoUrl" :src="sellerStore.profile.logoUrl" cover></v-img>
                <v-icon v-else icon="mdi-store" color="forestGreen" size="24"></v-icon>
              </v-avatar>
              <div>
                <div class="font-weight-bold text-deep-green text-subtitle-1">
                  {{ sellerStore.profile?.storeName || 'My Touriva Store' }}
                </div>
                <div class="text-caption text-editorial-secondary">
                  {{ sellerStore.profile?.wilaya || 'Algeria' }}
                </div>
              </div>
            </div>

            <div class="border-t pt-3 mt-2 text-caption">
              <div class="d-flex justify-space-between mb-2">
                <span class="text-editorial-secondary">Seller Rating:</span>
                <span class="font-weight-bold text-deep-green">
                  ★ {{ sellerStore.profile?.rating || 5.0 }} / 5.0
                </span>
              </div>
              <div class="d-flex justify-space-between mb-2">
                <span class="text-editorial-secondary">Commission Tier:</span>
                <span class="font-weight-bold text-forest">
                  {{ sellerStore.profile?.commissionRate || 10 }}%
                </span>
              </div>
              <div class="d-flex justify-space-between">
                <span class="text-editorial-secondary">Store Status:</span>
                <span class="font-weight-bold text-forest">Verified Partner</span>
              </div>
            </div>

            <v-btn
              to="/store-profile"
              block
              size="small"
              class="btn-editorial-sand mt-4"
              prepend-icon="mdi-store-edit-outline"
            >
              Edit Store Profile
            </v-btn>
          </div>

          <div class="editorial-card pa-5 bg-sand-light">
            <div class="d-flex align-center gap-2 mb-2">
              <v-icon icon="mdi-truck-delivery-outline" color="#173F35" size="20"></v-icon>
              <span class="text-subtitle-2 font-weight-bold text-deep-green">National Delivery SLA</span>
            </div>
            <p class="text-caption text-editorial-secondary mb-0">
              Orders must be packaged and transferred to Yalidine, Procolis, or designated courier within 48 hours to maintain your Premier Artisan rating.
            </p>
          </div>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useSellerStore } from '@/stores/seller'

const sellerStore = useSellerStore()

const loading = ref(false)
const isInitialLoad = ref(true)

const kpis = computed(() => sellerStore.getKpis)
const recentOrders = computed(() => sellerStore.getRecentOrders)

const orderHeaders = [
  { title: 'Order Ref', key: 'orderNumber', sortable: false },
  { title: 'Item', key: 'productTitle', sortable: false },
  { title: 'Customer', key: 'customer', sortable: false },
  { title: 'Status', key: 'fulfillmentStatus', sortable: false },
  { title: 'Action', key: 'actions', sortable: false, align: 'end' }
]

const formatCurrency = (val) => {
  const num = Number(val) || 0
  return new Intl.NumberFormat('en-DZ', {
    style: 'currency',
    currency: 'DZD',
    maximumFractionDigits: 0
  }).format(num)
}

const getFulfillmentBadge = (status) => {
  const s = String(status).toLowerCase()
  if (s === 'delivered') return 'status-badge-success'
  if (s === 'shipped') return 'status-badge-sand'
  if (s === 'preparing') return 'status-badge-warning'
  return 'status-badge-warning'
}

const refreshData = async () => {
  loading.value = true
  try {
    await sellerStore.fetchDashboard()
  } catch (err) {
    console.error('Error refreshing seller dashboard', err)
  } finally {
    loading.value = false
    isInitialLoad.value = false
  }
}

onMounted(() => {
  refreshData()
})
</script>
