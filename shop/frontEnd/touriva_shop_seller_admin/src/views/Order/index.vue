<template>
  <v-container fluid class="px-4 px-md-8 py-6">
    <!-- Editorial Page Header -->
    <div class="editorial-page-header">
      <div>
        <div class="editorial-tag mb-1">Commerce Fulfillment</div>
        <h1 class="editorial-page-title">Customer Order Items</h1>
        <p class="editorial-page-subtitle">Track incoming purchase orders for your items, update shipping fulfillment, and add tracking details.</p>
      </div>

      <div class="d-flex align-center gap-2">
        <v-btn
          variant="outlined"
          class="btn-editorial-outline px-4"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="initialize"
        >
          Refresh Orders
        </v-btn>
      </div>
    </div>

    <!-- Alert Message -->
    <v-alert
      v-if="err"
      type="error"
      variant="tonal"
      closable
      class="mb-4 rounded-lg"
      @click:close="err = ''"
    >
      {{ err }}
    </v-alert>

    <v-alert
      v-if="successMsg"
      type="success"
      variant="tonal"
      closable
      class="mb-4 rounded-lg"
      @click:close="successMsg = ''"
    >
      {{ successMsg }}
    </v-alert>

    <!-- Table Container -->
    <div class="editorial-table-container">
      <!-- Search & Filters Bar -->
      <div class="pa-4 bg-white d-flex align-center justify-space-between flex-wrap gap-3 border-b">
        <div class="d-flex align-center gap-3 flex-wrap flex-grow-1">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search by order number or customer name..."
            variant="outlined"
            density="compact"
            hide-details
            rounded="pill"
            style="min-width: 260px; max-width: 360px;"
            class="editorial-search-input"
          ></v-text-field>

          <!-- Status Filter Tabs -->
          <v-chip-group
            v-model="selectedStatus"
            selected-class="chip-active-editorial"
            density="compact"
          >
            <v-chip value="all" filter variant="tonal" rounded="pill">All ({{ ordersList.length }})</v-chip>
            <v-chip value="pending" filter variant="tonal" rounded="pill">Pending</v-chip>
            <v-chip value="preparing" filter variant="tonal" rounded="pill">Preparing</v-chip>
            <v-chip value="shipped" filter variant="tonal" rounded="pill">Shipped</v-chip>
            <v-chip value="delivered" filter variant="tonal" rounded="pill">Delivered</v-chip>
          </v-chip-group>
        </div>

        <div class="text-caption text-editorial-secondary font-weight-medium">
          Total Items: {{ filteredOrders.length }}
        </div>
      </div>

      <!-- Orders Data Table -->
      <v-data-table
        :headers="headers"
        :items="filteredOrders"
        :loading="loading"
        class="editorial-table"
      >
        <!-- Order Ref -->
        <template v-slot:[`item.orderNumber`]="{ item }">
          <div>
            <span class="font-weight-bold text-deep-green">
              {{ item.orderId?.orderNumber || 'TRV-MKT' }}
            </span>
            <div class="text-caption text-editorial-secondary">
              {{ formatDate(item.createdAt) }}
            </div>
          </div>
        </template>

        <!-- Product Item -->
        <template v-slot:[`item.productTitle`]="{ item }">
          <div>
            <div class="font-weight-semibold text-deep-green">{{ item.productTitle }}</div>
            <div class="text-caption text-editorial-secondary">
              Qty: <strong>{{ item.quantity }}</strong> &times; {{ formatPrice(item.unitPriceDZD) }}
            </div>
          </div>
        </template>

        <!-- Customer & Destination -->
        <template v-slot:[`item.customer`]="{ item }">
          <div>
            <div class="font-weight-medium text-deep-green">
              {{ item.orderId?.customerInfo?.fullName || 'Customer' }}
            </div>
            <div class="text-caption text-editorial-secondary">
              <v-icon icon="mdi-phone" size="12" class="me-1"></v-icon>
              {{ item.orderId?.customerInfo?.phone || '—' }}
            </div>
            <div class="text-caption text-editorial-secondary">
              <v-icon icon="mdi-map-marker-outline" size="12" class="me-1"></v-icon>
              {{ item.orderId?.customerInfo?.wilaya || 'Algeria' }}
            </div>
          </div>
        </template>

        <!-- Item Total Price -->
        <template v-slot:[`item.totalPriceDZD`]="{ item }">
          <span class="font-weight-bold text-forest">
            {{ formatPrice(item.totalPriceDZD) }}
          </span>
        </template>

        <!-- Fulfillment Status Chip -->
        <template v-slot:[`item.fulfillmentStatus`]="{ item }">
          <div>
            <span :class="['status-badge', getFulfillmentBadgeClass(item.fulfillmentStatus)]">
              <span class="status-badge-dot"></span>
              {{ formatFulfillment(item.fulfillmentStatus) }}
            </span>
            <div v-if="item.carrier || item.trackingNumber" class="text-caption text-editorial-secondary mt-1">
              {{ item.carrier || 'Courier' }}: {{ item.trackingNumber || '—' }}
            </div>
          </div>
        </template>

        <!-- Actions -->
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn
            class="btn-editorial-outline px-3"
            size="small"
            append-icon="mdi-pencil-outline"
            @click="openFulfillmentDialog(item)"
          >
            Update
          </v-btn>
        </template>

        <!-- Empty State -->
        <template v-slot:no-data>
          <div class="text-center py-12 px-4">
            <v-icon icon="mdi-receipt-text-outline" size="48" color="sand" class="mb-2"></v-icon>
            <div class="text-subtitle-1 font-weight-medium text-deep-green">No Orders Yet</div>
            <p class="text-caption text-editorial-secondary mb-3">Customer orders for your catalog items will appear here automatically.</p>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Fulfillment Update Dialog -->
    <v-dialog v-model="fulfillmentDialog" max-width="500px">
      <v-card class="editorial-dialog-card">
        <div class="editorial-dialog-header">
          <span class="dialog-title font-serif">Update Fulfillment</span>
          <v-btn icon="mdi-close" variant="text" density="compact" color="white" @click="fulfillmentDialog = false"></v-btn>
        </div>

        <v-card-text class="pa-5">
          <div class="mb-4">
            <div class="text-caption text-editorial-secondary">Item</div>
            <div class="text-subtitle-2 font-weight-bold text-deep-green">{{ currentItem?.productTitle }}</div>
            <div class="text-caption text-editorial-secondary mt-1">
              Destination: {{ currentItem?.orderId?.customerInfo?.wilaya }} — {{ currentItem?.orderId?.customerInfo?.address }}
            </div>
          </div>

          <label class="input-label">Fulfillment Status *</label>
          <v-select
            v-model="fulfillmentForm.fulfillmentStatus"
            :items="statusOptions"
            item-title="title"
            item-value="value"
            variant="outlined"
            density="comfortable"
            class="editorial-input mb-3"
          ></v-select>

          <label class="input-label">Courier / Logistics Carrier</label>
          <v-text-field
            v-model="fulfillmentForm.carrier"
            placeholder="e.g. Yalidine, Procolis, Express Mail"
            variant="outlined"
            density="comfortable"
            class="editorial-input mb-3"
          ></v-text-field>

          <label class="input-label">Tracking Number / Bordereau</label>
          <v-text-field
            v-model="fulfillmentForm.trackingNumber"
            placeholder="e.g. YAL-84920492"
            variant="outlined"
            density="comfortable"
            class="editorial-input"
          ></v-text-field>
        </v-card-text>

        <div class="editorial-dialog-actions d-flex justify-end gap-2 pa-4 border-t">
          <v-btn variant="text" class="btn-editorial-sand px-4" @click="fulfillmentDialog = false">Cancel</v-btn>
          <v-btn class="btn-editorial-primary px-6" :loading="updatingFulfillment" @click="saveFulfillment">
            Save Status
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useSellerStore } from '@/stores/seller'

const sellerStore = useSellerStore()

const search = ref('')
const loading = ref(false)
const updatingFulfillment = ref(false)
const selectedStatus = ref('all')
const err = ref('')
const successMsg = ref('')

const fulfillmentDialog = ref(false)
const currentItem = ref(null)
const fulfillmentForm = ref({
  fulfillmentStatus: 'pending',
  carrier: '',
  trackingNumber: ''
})

const statusOptions = [
  { title: 'Pending (Not started)', value: 'pending' },
  { title: 'Preparing (Packaging order)', value: 'preparing' },
  { title: 'Shipped (Handed to courier)', value: 'shipped' },
  { title: 'Delivered (Customer received)', value: 'delivered' },
  { title: 'Cancelled', value: 'cancelled' }
]

const headers = ref([
  { title: 'Order Ref & Date', key: 'orderNumber', sortable: true },
  { title: 'Product & Qty', key: 'productTitle', sortable: false },
  { title: 'Customer & Wilaya', key: 'customer', sortable: false },
  { title: 'Total', key: 'totalPriceDZD', sortable: true },
  { title: 'Fulfillment Status', key: 'fulfillmentStatus', sortable: true },
  { title: 'Action', key: 'actions', sortable: false, align: 'end' }
])

const ordersList = computed(() => sellerStore.getOrders || [])

const filteredOrders = computed(() => {
  let list = ordersList.value
  if (selectedStatus.value && selectedStatus.value !== 'all') {
    list = list.filter(o => String(o.fulfillmentStatus).toLowerCase() === selectedStatus.value.toLowerCase())
  }
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(o => {
      const num = String(o.orderId?.orderNumber || '').toLowerCase()
      const title = String(o.productTitle || '').toLowerCase()
      const cust = String(o.orderId?.customerInfo?.fullName || '').toLowerCase()
      return num.includes(q) || title.includes(q) || cust.includes(q)
    })
  }
  return list
})

const formatPrice = (val) => {
  const num = Number(val) || 0
  return new Intl.NumberFormat('en-DZ', {
    style: 'currency',
    currency: 'DZD',
    maximumFractionDigits: 0
  }).format(num)
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

const getFulfillmentBadgeClass = (status) => {
  const s = String(status).toLowerCase()
  if (s === 'delivered') return 'status-badge-success'
  if (s === 'shipped') return 'status-badge-sand'
  if (s === 'preparing') return 'status-badge-warning'
  if (s === 'cancelled') return 'status-badge-error'
  return 'status-badge-neutral'
}

const formatFulfillment = (status) => {
  const s = String(status).toLowerCase()
  if (s === 'delivered') return 'Delivered'
  if (s === 'shipped') return 'Shipped'
  if (s === 'preparing') return 'Preparing'
  if (s === 'cancelled') return 'Cancelled'
  return 'Pending'
}

const openFulfillmentDialog = (item) => {
  currentItem.value = item
  fulfillmentForm.value = {
    fulfillmentStatus: item.fulfillmentStatus || 'pending',
    carrier: item.carrier || '',
    trackingNumber: item.trackingNumber || ''
  }
  fulfillmentDialog.value = true
}

const saveFulfillment = async () => {
  if (!currentItem.value?._id) return
  updatingFulfillment.value = true
  err.value = ''
  successMsg.value = ''
  try {
    await sellerStore.updateFulfillment(currentItem.value._id, fulfillmentForm.value)
    successMsg.value = 'Fulfillment status updated successfully!'
    fulfillmentDialog.value = false
  } catch (e) {
    err.value = e.response?.data?.message || e.message || 'Error updating fulfillment'
  } finally {
    updatingFulfillment.value = false
  }
}

const initialize = async () => {
  loading.value = true
  try {
    await sellerStore.fetchOrders()
  } catch (e) {
    err.value = e.message || 'Error fetching orders'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  initialize()
})
</script>
