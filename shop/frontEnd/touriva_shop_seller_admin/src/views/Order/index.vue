<template>
  <v-container fluid class="px-4 px-md-8 py-6">
    <!-- Editorial Page Header -->
    <div class="editorial-page-header">
      <div>
        <div class="editorial-tag mb-1">Commerce Fulfillment</div>
        <h1 class="editorial-page-title">Orders Management</h1>
        <p class="editorial-page-subtitle">Track, filter, and process customer purchases, order statuses, and transaction details.</p>
      </div>

      <div class="d-flex align-center gap-2">
        <v-btn
          variant="outlined"
          class="btn-editorial-outline px-4"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="initialize"
        >
          {{ $t('Refresh') || 'Refresh' }}
        </v-btn>
      </div>
    </div>

    <!-- Table Container -->
    <div class="editorial-table-container">
      <!-- Search & Filters Bar -->
      <div class="pa-4 bg-white d-flex align-center justify-space-between flex-wrap gap-3 border-b">
        <div class="d-flex align-center gap-3 flex-wrap flex-grow-1">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            :placeholder="$t('Search') + ' orders by customer name or code...'"
            variant="outlined"
            density="compact"
            hide-details
            rounded="pill"
            style="min-width: 280px; max-width: 380px;"
            class="editorial-search-input"
          ></v-text-field>

          <!-- Status Filter Tabs -->
          <v-chip-group
            v-model="selectedStatus"
            selected-class="chip-active-editorial"
            density="compact"
          >
            <v-chip value="all" filter variant="tonal" rounded="pill">All</v-chip>
            <v-chip value="pending" filter variant="tonal" rounded="pill">Pending</v-chip>
            <v-chip value="confirmed" filter variant="tonal" rounded="pill">Confirmed</v-chip>
            <v-chip value="cancelled" filter variant="tonal" rounded="pill">Cancelled</v-chip>
          </v-chip-group>
        </div>

        <div class="text-caption text-editorial-secondary font-weight-medium">
          Total: {{ filteredOrders.length }} orders
        </div>
      </div>

      <!-- Orders Data Table -->
      <v-data-table
        :headers="headers"
        :items="filteredOrders"
        :loading="loading || !orders.getOrders"
        class="editorial-table"
        hover
        @click:row="handleRowClick"
      >
        <!-- Order Ref / Code -->
        <template v-slot:[`item.code`]="{ item }">
          <span class="font-weight-bold text-deep-green">
            {{ item.code || (item._id ? '#' + item._id.slice(-6).toUpperCase() : 'N/A') }}
          </span>
        </template>

        <!-- Customer -->
        <template v-slot:[`item.customer`]="{ item }">
          <div class="d-flex align-center py-1">
            <v-avatar size="34" class="me-2 bg-sand-light border-editorial flex-shrink-0">
              <v-icon icon="mdi-account" color="forestGreen" size="18"></v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-semibold text-deep-green">{{ getCustomerName(item) }}</div>
              <div class="text-caption text-editorial-secondary">{{ getCustomerEmail(item) }}</div>
            </div>
          </div>
        </template>

        <!-- Date -->
        <template v-slot:[`item.date`]="{ item }">
          <span class="text-caption font-weight-medium">
            {{ formatDate(item.createdAt || item.date) }}
          </span>
        </template>

        <!-- Items Count -->
        <template v-slot:[`item.itemsCount`]="{ item }">
          <span class="text-caption font-weight-medium">
            {{ item.products?.length || item.items?.length || 1 }} item(s)
          </span>
        </template>

        <!-- Total Amount -->
        <template v-slot:[`item.amount`]="{ item }">
          <span class="font-weight-bold text-forest">
            {{ formatPrice(item.totalAmount || item.total || item.amount || item.price || 0) }}
          </span>
        </template>

        <!-- Status Chip -->
        <template v-slot:[`item.status`]="{ item }">
          <span :class="['status-badge', getOrderStatusBadgeClass(item.status)]">
            <span class="status-badge-dot"></span>
            {{ item.status || 'pending' }}
          </span>
        </template>

        <!-- Actions -->
        <template v-slot:[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-end" @click.stop>
            <v-btn
              class="btn-editorial-outline px-3"
              size="x-small"
              append-icon="mdi-arrow-right"
              @click="goToDetail(item)"
            >
              Details
            </v-btn>
          </div>
        </template>

        <!-- Empty State -->
        <template v-slot:no-data>
          <div class="text-center py-12 px-4">
            <v-icon icon="mdi-receipt-text-outline" size="48" color="sand" class="mb-2"></v-icon>
            <div class="text-subtitle-1 font-weight-medium text-deep-green">No Orders Found</div>
            <p class="text-caption text-editorial-secondary mb-3">Customer orders will appear here automatically when checked out.</p>
            <v-btn class="btn-editorial-primary px-4" size="small" @click="initialize">
              Refresh Orders
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOrdersStore } from '@/stores/orders'

const orders = useOrdersStore()
const router = useRouter()

const search = ref('')
const loading = ref(false)
const selectedStatus = ref('all')

const headers = ref([
  { title: 'Order Ref', key: 'code', sortable: true, width: '130px' },
  { title: 'Customer', key: 'customer', sortable: true },
  { title: 'Date', key: 'date', sortable: true },
  { title: 'Items', key: 'itemsCount', sortable: false },
  { title: 'Total Amount', key: 'amount', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
])

const filteredOrders = computed(() => {
  let list = orders.getOrders || []
  if (selectedStatus.value && selectedStatus.value !== 'all') {
    list = list.filter(o => String(o.status).toLowerCase() === selectedStatus.value.toLowerCase())
  }
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(o => {
      const code = String(o.code || o._id || '').toLowerCase()
      const name = getCustomerName(o).toLowerCase()
      const email = getCustomerEmail(o).toLowerCase()
      return code.includes(q) || name.includes(q) || email.includes(q)
    })
  }
  return list
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
  return 'Customer #' + (ord.userId || ord.clientId || 'Client')
}

const getCustomerEmail = (ord) => {
  if (ord.client?.email) return ord.client.email
  if (ord.customerEmail) return ord.customerEmail
  if (ord.email) return ord.email
  return ord.phone || ''
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
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

const formatPrice = (val) => {
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

const goToDetail = (item) => {
  const clientName = getCustomerName(item)
  router.push({ name: 'OrderDetail', params: { id: item._id, client: clientName } })
}

const handleRowClick = (e, { item }) => {
  if (item && item._id) {
    goToDetail(item)
  }
}

const initialize = async () => {
  loading.value = true
  try {
    await orders.fetchOrders()
  } catch (e) {
    console.error('Error fetching orders:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  initialize()
})
</script>

<style scoped>
.chip-active-editorial {
  background-color: var(--color-forest-green) !important;
  color: #FFFFFF !important;
}
</style>