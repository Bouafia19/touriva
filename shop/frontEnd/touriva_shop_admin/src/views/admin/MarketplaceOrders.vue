<template>
  <v-container fluid class="px-4 px-md-8 py-6">
    <!-- Editorial Page Header -->
    <div class="editorial-page-header">
      <div>
        <div class="editorial-tag mb-1">Financial Operations</div>
        <h1 class="editorial-page-title">Marketplace Orders & Payments</h1>
        <p class="editorial-page-subtitle">Verify customer bank/postal transfer receipts, approve orders, and track fulfillment across multi-vendor purchases.</p>
      </div>

      <div class="d-flex align-center gap-2">
        <v-btn
          variant="outlined"
          class="btn-editorial-outline px-4"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="loadOrders"
        >
          Refresh Orders
        </v-btn>
      </div>
    </div>

    <!-- Alert Messages -->
    <v-alert
      v-if="errorMsg"
      type="error"
      variant="tonal"
      closable
      class="mb-4 rounded-lg"
      @click:close="errorMsg = null"
    >
      {{ errorMsg }}
    </v-alert>

    <v-alert
      v-if="successMsg"
      type="success"
      variant="tonal"
      closable
      class="mb-4 rounded-lg"
      @click:close="successMsg = null"
    >
      {{ successMsg }}
    </v-alert>

    <!-- Orders Table Container -->
    <div class="editorial-table-container">
      <div class="pa-4 bg-white d-flex align-center justify-space-between flex-wrap gap-3 border-b">
        <div class="d-flex align-center gap-3 flex-wrap">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search orders by number or customer name..."
            variant="outlined"
            density="compact"
            hide-details
            rounded="pill"
            style="min-width: 260px; max-width: 360px;"
            class="editorial-search-input"
          ></v-text-field>

          <v-chip-group
            v-model="selectedPaymentStatus"
            selected-class="chip-active-editorial"
            density="compact"
          >
            <v-chip value="all" filter variant="tonal" rounded="pill">All ({{ orders.length }})</v-chip>
            <v-chip value="payment_submitted" filter variant="tonal" rounded="pill">Proof Uploaded</v-chip>
            <v-chip value="pending_payment" filter variant="tonal" rounded="pill">Awaiting Payment</v-chip>
            <v-chip value="paid" filter variant="tonal" rounded="pill">Paid & Verified</v-chip>
          </v-chip-group>
        </div>

        <div class="text-caption text-editorial-secondary font-weight-medium">
          Total Orders: {{ filteredOrders.length }}
        </div>
      </div>

      <v-data-table
        :headers="headers"
        :items="filteredOrders"
        :loading="loading"
        class="editorial-table"
      >
        <!-- Order Number & Date -->
        <template v-slot:[`item.orderNumber`]="{ item }">
          <div>
            <span class="font-weight-bold text-deep-green">{{ item.orderNumber || 'TRV-MKT' }}</span>
            <div class="text-caption text-editorial-secondary">{{ formatDate(item.createdAt) }}</div>
          </div>
        </template>

        <!-- Customer & Destination -->
        <template v-slot:[`item.customer`]="{ item }">
          <div>
            <div class="font-weight-medium text-deep-green">{{ item.customerInfo?.fullName || 'Customer' }}</div>
            <div class="text-caption text-editorial-secondary">
              <v-icon icon="mdi-phone" size="12" class="me-1"></v-icon>
              {{ item.customerInfo?.phone }}
            </div>
            <div class="text-caption text-editorial-secondary">
              <v-icon icon="mdi-map-marker-outline" size="12" class="me-1"></v-icon>
              {{ item.customerInfo?.wilaya }}, Algeria
            </div>
          </div>
        </template>

        <!-- Items Summary -->
        <template v-slot:[`item.items`]="{ item }">
          <div>
            <div class="font-weight-medium text-deep-green">{{ item.items?.length || 1 }} item(s)</div>
            <div class="text-caption text-editorial-secondary text-truncate" style="max-width: 200px;">
              {{ item.items?.map(i => i.productTitle).join(', ') }}
            </div>
          </div>
        </template>

        <!-- Amount & Method -->
        <template v-slot:[`item.amount`]="{ item }">
          <div>
            <div class="font-weight-bold text-forest">{{ formatPrice(item.totalAmountDZD) }}</div>
            <div class="text-caption text-editorial-secondary text-uppercase">{{ item.paymentMethod }}</div>
          </div>
        </template>

        <!-- Payment Status & Proof -->
        <template v-slot:[`item.paymentStatus`]="{ item }">
          <div>
            <span :class="['status-badge', getPaymentBadgeClass(item.paymentStatus)]">
              <span class="status-badge-dot"></span>
              {{ formatPaymentStatus(item.paymentStatus) }}
            </span>
            <div v-if="item.paymentProof?.imageUrl" class="mt-1">
              <v-btn
                size="x-small"
                variant="text"
                color="forestGreen"
                prepend-icon="mdi-attachment"
                @click="viewProof(item)"
              >
                View Proof
              </v-btn>
            </div>
          </div>
        </template>

        <!-- Actions -->
        <template v-slot:[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-end gap-1">
            <v-btn
              v-if="item.paymentStatus !== 'paid'"
              size="small"
              class="btn-editorial-primary px-3"
              @click="openVerifyDialog(item)"
            >
              Verify Payment
            </v-btn>
            <span v-else class="text-caption text-forest font-weight-bold">
              ✓ Verified
            </span>
          </div>
        </template>

        <!-- Empty State -->
        <template v-slot:no-data>
          <div class="text-center py-12 px-4">
            <v-icon icon="mdi-receipt-text-check-outline" size="48" color="sand" class="mb-2"></v-icon>
            <div class="text-subtitle-1 font-weight-medium text-deep-green">No Orders Found</div>
            <p class="text-caption text-editorial-secondary mb-3">Customer checkout orders will display here for payment verification.</p>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Payment Proof Modal -->
    <v-dialog v-model="proofDialog" max-width="600px">
      <v-card class="editorial-dialog-card pa-6 text-center">
        <h3 class="text-h6 font-serif font-weight-bold text-deep-green mb-2">Customer Payment Proof Receipt</h3>
        <p class="text-caption text-editorial-secondary mb-4">
          Order <strong>{{ currentOrder?.orderNumber }}</strong> &bull; Amount: <strong>{{ formatPrice(currentOrder?.totalAmountDZD) }}</strong>
        </p>

        <div class="mb-4 bg-sand-light pa-2 rounded-lg border-editorial">
          <v-img :src="currentOrder?.paymentProof?.imageUrl" max-height="400" contain></v-img>
        </div>

        <div v-if="currentOrder?.paymentProof?.transactionRef" class="text-caption text-editorial-secondary mb-4">
          Reference / Bordereau: <code>{{ currentOrder?.paymentProof?.transactionRef }}</code>
        </div>

        <div class="d-flex justify-end gap-2">
          <v-btn variant="text" class="btn-editorial-sand px-4" @click="proofDialog = false">Close</v-btn>
          <v-btn
            v-if="currentOrder?.paymentStatus !== 'paid'"
            class="btn-editorial-primary px-5"
            @click="verifyFromModal"
          >
            Confirm & Verify Payment
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Payment Verification Confirmation Modal -->
    <v-dialog v-model="verifyDialog" max-width="500px">
      <v-card class="editorial-dialog-card pa-6">
        <h3 class="text-h6 font-serif font-weight-bold text-deep-green mb-2">Verify Customer Payment</h3>
        <p class="text-caption text-editorial-secondary mb-4">
          Confirm that payment of <strong>{{ formatPrice(currentOrder?.totalAmountDZD) }}</strong> has been verified for order <strong>{{ currentOrder?.orderNumber }}</strong>. This will automatically accrue Touriva platform commissions in the financial ledger.
        </p>

        <div class="d-flex justify-end gap-2 pt-2 border-t">
          <v-btn variant="text" class="btn-editorial-sand px-4" @click="verifyDialog = false">Cancel</v-btn>
          <v-btn class="btn-editorial-primary px-5" :loading="processingVerify" @click="confirmPaymentVerification">
            Confirm Payment
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useMarketplaceAdminStore } from '@/stores/marketplaceAdmin'

const adminStore = useMarketplaceAdminStore()

const search = ref('')
const selectedPaymentStatus = ref('all')
const loading = ref(false)
const processingVerify = ref(false)
const errorMsg = ref(null)
const successMsg = ref(null)

const proofDialog = ref(false)
const verifyDialog = ref(false)
const currentOrder = ref(null)

const headers = [
  { title: 'Order Number', key: 'orderNumber', sortable: true },
  { title: 'Customer & Wilaya', key: 'customer', sortable: false },
  { title: 'Items', key: 'items', sortable: false },
  { title: 'Amount & Method', key: 'amount', sortable: true },
  { title: 'Payment Status', key: 'paymentStatus', sortable: true },
  { title: 'Verification', key: 'actions', sortable: false, align: 'end' }
]

const orders = computed(() => adminStore.getOrders || [])

const filteredOrders = computed(() => {
  let list = orders.value
  if (selectedPaymentStatus.value && selectedPaymentStatus.value !== 'all') {
    list = list.filter(o => o.paymentStatus === selectedPaymentStatus.value)
  }
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(o => {
      const num = (o.orderNumber || '').toLowerCase()
      const cust = (o.customerInfo?.fullName || '').toLowerCase()
      return num.includes(q) || cust.includes(q)
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

const getPaymentBadgeClass = (status) => {
  if (status === 'paid') return 'status-badge-success'
  if (status === 'payment_submitted') return 'status-badge-sand'
  return 'status-badge-warning'
}

const formatPaymentStatus = (status) => {
  if (status === 'paid') return 'Paid & Verified'
  if (status === 'payment_submitted') return 'Proof Uploaded'
  return 'Pending Payment'
}

const viewProof = (order) => {
  currentOrder.value = order
  proofDialog.value = true
}

const openVerifyDialog = (order) => {
  currentOrder.value = order
  verifyDialog.value = true
}

const verifyFromModal = () => {
  proofDialog.value = false
  verifyDialog.value = true
}

const confirmPaymentVerification = async () => {
  if (!currentOrder.value?._id) return
  processingVerify.value = true
  errorMsg.value = null
  successMsg.value = null
  try {
    await adminStore.verifyPayment(currentOrder.value._id, {
      paymentStatus: 'paid',
      verificationNotes: 'Payment verified by administrator'
    })
    successMsg.value = `Order ${currentOrder.value.orderNumber} confirmed as paid! Platform commissions accrued.`
    verifyDialog.value = false
  } catch (err) {
    errorMsg.value = err.response?.data?.message || err.message
  } finally {
    processingVerify.value = false
  }
}

const loadOrders = async () => {
  loading.value = true
  try {
    await adminStore.fetchOrders()
  } catch (err) {
    errorMsg.value = err.response?.data?.message || err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOrders()
})
</script>
