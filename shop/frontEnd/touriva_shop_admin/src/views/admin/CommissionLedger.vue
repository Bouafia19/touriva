<template>
  <v-container fluid class="px-4 px-md-8 py-6">
    <!-- Editorial Page Header -->
    <div class="editorial-page-header">
      <div>
        <div class="editorial-tag mb-1">Financial Oversight</div>
        <h1 class="editorial-page-title">Marketplace Commission Ledger</h1>
        <p class="editorial-page-subtitle">Track Touriva platform earnings, monitor vendor payout balances, and record disbursement settlements.</p>
      </div>

      <div class="d-flex align-center gap-2">
        <v-btn
          variant="outlined"
          class="btn-editorial-outline px-4"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="loadCommissions"
        >
          Refresh Ledger
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

    <!-- Ledger Metrics -->
    <v-row class="mb-6">
      <v-col cols="12" sm="4">
        <div class="editorial-stat-card">
          <span class="editorial-tag">Platform Revenue</span>
          <div class="text-h4 font-serif font-weight-bold text-forest mt-1">
            {{ formatPrice(totalCommissionEarned) }}
          </div>
          <div class="text-caption text-editorial-secondary mt-1">
            Total Touriva commissions earned
          </div>
        </div>
      </v-col>

      <v-col cols="12" sm="4">
        <div class="editorial-stat-card">
          <span class="editorial-tag">Pending Vendor Payouts</span>
          <div class="text-h4 font-serif font-weight-bold text-sand-dark mt-1">
            {{ formatPrice(totalPendingPayout) }}
          </div>
          <div class="text-caption text-editorial-secondary mt-1">
            Payable to sellers (Accrued)
          </div>
        </div>
      </v-col>

      <v-col cols="12" sm="4">
        <div class="editorial-stat-card">
          <span class="editorial-tag">Settled to Vendors</span>
          <div class="text-h4 font-serif font-weight-bold text-deep-green mt-1">
            {{ formatPrice(totalSettledPayout) }}
          </div>
          <div class="text-caption text-editorial-secondary mt-1">
            Disbursed via CCP / BaridiMob
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Commissions Table Container -->
    <div class="editorial-table-container">
      <div class="pa-4 bg-white d-flex align-center justify-space-between flex-wrap gap-3 border-b">
        <div class="d-flex align-center gap-3 flex-wrap">
          <v-chip-group
            v-model="selectedStatus"
            selected-class="chip-active-editorial"
            density="compact"
          >
            <v-chip value="all" filter variant="tonal" rounded="pill">All ({{ commissions.length }})</v-chip>
            <v-chip value="accrued" filter variant="tonal" rounded="pill">Pending Payout</v-chip>
            <v-chip value="settled" filter variant="tonal" rounded="pill">Settled</v-chip>
          </v-chip-group>
        </div>

        <div class="text-caption text-editorial-secondary font-weight-medium">
          Transactions: {{ filteredCommissions.length }}
        </div>
      </div>

      <v-data-table
        :headers="headers"
        :items="filteredCommissions"
        :loading="loading"
        class="editorial-table"
      >
        <!-- Order Ref -->
        <template v-slot:[`item.orderRef`]="{ item }">
          <span class="font-weight-bold text-deep-green">
            {{ item.orderId?.orderNumber || 'TRV-MKT' }}
          </span>
        </template>

        <!-- Vendor Store -->
        <template v-slot:[`item.seller`]="{ item }">
          <div>
            <div class="font-weight-bold text-deep-green">{{ item.sellerId?.storeName || 'Vendor' }}</div>
            <div class="text-caption text-editorial-secondary">{{ item.sellerId?.wilaya || 'Algeria' }}</div>
          </div>
        </template>

        <!-- Product Item -->
        <template v-slot:[`item.product`]="{ item }">
          <div class="font-weight-medium text-deep-green text-truncate" style="max-width: 200px;">
            {{ item.orderItemId?.productTitle || 'Item' }}
          </div>
        </template>

        <!-- Gross Sale -->
        <template v-slot:[`item.grossAmountDZD`]="{ item }">
          <span class="font-weight-bold text-deep-green">{{ formatPrice(item.grossAmountDZD) }}</span>
        </template>

        <!-- Touriva Commission Fee -->
        <template v-slot:[`item.commission`]="{ item }">
          <div>
            <span class="font-weight-bold text-forest">+{{ formatPrice(item.commissionAmountDZD) }}</span>
            <span class="text-caption text-editorial-secondary ms-1">({{ item.ratePercentage }}%)</span>
          </div>
        </template>

        <!-- Net Vendor Payout -->
        <template v-slot:[`item.netSellerAmountDZD`]="{ item }">
          <span class="font-weight-bold text-deep-green">{{ formatPrice(item.netSellerAmountDZD) }}</span>
        </template>

        <!-- Settlement Status -->
        <template v-slot:[`item.settlementStatus`]="{ item }">
          <span :class="['status-badge', item.settlementStatus === 'settled' ? 'status-badge-success' : 'status-badge-warning']">
            <span class="status-badge-dot"></span>
            {{ item.settlementStatus === 'settled' ? 'Settled' : 'Pending' }}
          </span>
        </template>

        <!-- Actions -->
        <template v-slot:[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-end">
            <v-btn
              v-if="item.settlementStatus !== 'settled'"
              size="small"
              class="btn-editorial-primary px-3"
              @click="openSettleDialog(item)"
            >
              Settle Payout
            </v-btn>
            <span v-else class="text-caption text-forest font-weight-bold">
              ✓ Settled
            </span>
          </div>
        </template>

        <!-- Empty State -->
        <template v-slot:no-data>
          <div class="text-center py-12 px-4">
            <v-icon icon="mdi-scale-balance" size="48" color="sand" class="mb-2"></v-icon>
            <div class="text-subtitle-1 font-weight-medium text-deep-green">Ledger Empty</div>
            <p class="text-caption text-editorial-secondary mb-3">Commissions accrue automatically as customer orders are verified.</p>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Settlement Confirmation Dialog -->
    <v-dialog v-model="settleDialog" max-width="500px">
      <v-card class="editorial-dialog-card pa-6">
        <h3 class="text-h6 font-serif font-weight-bold text-deep-green mb-2">Record Vendor Payout Settlement</h3>
        <p class="text-caption text-editorial-secondary mb-4">
          Marking payout of <strong>{{ formatPrice(currentCommission?.netSellerAmountDZD) }}</strong> to <strong>{{ currentCommission?.sellerId?.storeName }}</strong> as disbursed.
        </p>

        <label class="input-label">Disbursement Reference / Transaction ID</label>
        <v-text-field
          v-model="settlementRef"
          placeholder="e.g. CCP-TRF-982341 / BM-09284"
          variant="outlined"
          density="comfortable"
          class="editorial-input mb-4"
        ></v-text-field>

        <div class="d-flex justify-end gap-2 pt-2 border-t">
          <v-btn variant="text" class="btn-editorial-sand px-4" @click="settleDialog = false">Cancel</v-btn>
          <v-btn class="btn-editorial-primary px-5" :loading="processingSettle" @click="confirmSettlement">
            Confirm Disbursement
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

const selectedStatus = ref('all')
const loading = ref(false)
const processingSettle = ref(false)
const errorMsg = ref(null)
const successMsg = ref(null)

const settleDialog = ref(false)
const currentCommission = ref(null)
const settlementRef = ref('')

const headers = [
  { title: 'Order Ref', key: 'orderRef', sortable: true },
  { title: 'Vendor', key: 'seller', sortable: false },
  { title: 'Item', key: 'product', sortable: false },
  { title: 'Gross Sale', key: 'grossAmountDZD', sortable: true },
  { title: 'Touriva Fee', key: 'commission', sortable: true },
  { title: 'Seller Net', key: 'netSellerAmountDZD', sortable: true },
  { title: 'Status', key: 'settlementStatus', sortable: true },
  { title: 'Settlement', key: 'actions', sortable: false, align: 'end' }
]

const commissions = computed(() => adminStore.getCommissions || [])

const filteredCommissions = computed(() => {
  let list = commissions.value
  if (selectedStatus.value && selectedStatus.value !== 'all') {
    list = list.filter(c => c.settlementStatus === selectedStatus.value)
  }
  return list
})

const totalCommissionEarned = computed(() => {
  return commissions.value.reduce((sum, c) => sum + (c.commissionAmountDZD || 0), 0)
})

const totalPendingPayout = computed(() => {
  return commissions.value
    .filter(c => c.settlementStatus === 'accrued')
    .reduce((sum, c) => sum + (c.netSellerAmountDZD || 0), 0)
})

const totalSettledPayout = computed(() => {
  return commissions.value
    .filter(c => c.settlementStatus === 'settled')
    .reduce((sum, c) => sum + (c.netSellerAmountDZD || 0), 0)
})

const formatPrice = (val) => {
  const num = Number(val) || 0
  return new Intl.NumberFormat('en-DZ', {
    style: 'currency',
    currency: 'DZD',
    maximumFractionDigits: 0
  }).format(num)
}

const openSettleDialog = (item) => {
  currentCommission.value = item
  settlementRef.value = ''
  settleDialog.value = true
}

const confirmSettlement = async () => {
  if (!currentCommission.value?._id) return
  processingSettle.value = true
  errorMsg.value = null
  successMsg.value = null
  try {
    await adminStore.settleCommission(currentCommission.value._id, {
      settlementReference: settlementRef.value
    })
    successMsg.value = `Payout of ${formatPrice(currentCommission.value.netSellerAmountDZD)} recorded as settled!`
    settleDialog.value = false
  } catch (err) {
    errorMsg.value = err.response?.data?.message || err.message
  } finally {
    processingSettle.value = false
  }
}

const loadCommissions = async () => {
  loading.value = true
  try {
    await adminStore.fetchCommissions()
  } catch (err) {
    errorMsg.value = err.response?.data?.message || err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCommissions()
})
</script>
