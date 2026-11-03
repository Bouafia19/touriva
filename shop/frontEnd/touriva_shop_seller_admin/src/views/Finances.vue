<template>
  <v-container fluid class="px-4 px-md-8 py-6">
    <!-- Editorial Page Header -->
    <div class="editorial-page-header">
      <div>
        <div class="editorial-tag mb-1">Financial Settlement</div>
        <h1 class="editorial-page-title">Earnings & Commissions</h1>
        <p class="editorial-page-subtitle">Track your marketplace revenue, platform commissions, and disbursement history.</p>
      </div>

      <div class="d-flex align-center gap-2">
        <v-btn
          variant="outlined"
          class="btn-editorial-outline px-4"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="loadFinances"
        >
          Refresh Ledger
        </v-btn>
      </div>
    </div>

    <!-- Alert Message -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      closable
      class="mb-4 rounded-lg"
      @click:close="error = null"
    >
      {{ error }}
    </v-alert>

    <!-- KPI Metric Cards Grid -->
    <v-row class="mb-6">
      <!-- KPI 1: Gross Sales -->
      <v-col cols="12" sm="6" lg="3">
        <div class="editorial-stat-card">
          <div class="d-flex justify-space-between align-start">
            <div>
              <span class="editorial-tag">Gross Volume</span>
              <div class="text-h4 font-serif font-weight-bold text-deep-green mt-1">
                {{ formatCurrency(finances.kpis.grossSalesDZD) }}
              </div>
              <div class="text-caption text-editorial-secondary mt-1">
                Total marketplace orders
              </div>
            </div>
            <div class="stat-icon-wrapper bg-sand-light">
              <v-icon icon="mdi-cash-multiple" color="#B89564" size="24"></v-icon>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t text-caption text-editorial-secondary">
            Customer order item total
          </div>
        </div>
      </v-col>

      <!-- KPI 2: Platform Commission -->
      <v-col cols="12" sm="6" lg="3">
        <div class="editorial-stat-card">
          <div class="d-flex justify-space-between align-start">
            <div>
              <span class="editorial-tag">Commission Deducted</span>
              <div class="text-h4 font-serif font-weight-bold text-sand-dark mt-1">
                {{ formatCurrency(finances.kpis.totalCommissionDZD) }}
              </div>
              <div class="text-caption text-editorial-secondary mt-1">
                Touriva platform fee
              </div>
            </div>
            <div class="stat-icon-wrapper bg-sand-light">
              <v-icon icon="mdi-percent" color="#B89564" size="24"></v-icon>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t text-caption text-editorial-secondary">
            Standard platform rate
          </div>
        </div>
      </v-col>

      <!-- KPI 3: Net Earnings -->
      <v-col cols="12" sm="6" lg="3">
        <div class="editorial-stat-card">
          <div class="d-flex justify-space-between align-start">
            <div>
              <span class="editorial-tag">Net Seller Payout</span>
              <div class="text-h4 font-serif font-weight-bold text-forest mt-1">
                {{ formatCurrency(finances.kpis.netEarningsDZD) }}
              </div>
              <div class="text-caption text-editorial-secondary mt-1">
                Your accumulated earnings
              </div>
            </div>
            <div class="stat-icon-wrapper bg-sand-light">
              <v-icon icon="mdi-wallet-outline" color="#21866B" size="24"></v-icon>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t text-caption font-weight-bold text-forest">
            Ready for bank transfer
          </div>
        </div>
      </v-col>

      <!-- KPI 4: Pending Payout -->
      <v-col cols="12" sm="6" lg="3">
        <div class="editorial-stat-card">
          <div class="d-flex justify-space-between align-start">
            <div>
              <span class="editorial-tag">Pending Settlement</span>
              <div class="text-h4 font-serif font-weight-bold text-deep-green mt-1">
                {{ formatCurrency(finances.kpis.pendingPayoutDZD) }}
              </div>
              <div class="text-caption text-editorial-secondary mt-1">
                In settlement process
              </div>
            </div>
            <div class="stat-icon-wrapper bg-sand-light">
              <v-icon icon="mdi-clock-outline" color="#B89564" size="24"></v-icon>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t text-caption text-editorial-secondary">
            Disbursed via CCP / BaridiMob
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Commissions Breakdown Table -->
    <div class="editorial-table-container">
      <div class="pa-4 bg-white d-flex align-center justify-space-between flex-wrap gap-3 border-b">
        <div>
          <h2 class="text-subtitle-1 font-weight-bold text-deep-green">Order Settlement History</h2>
          <div class="text-caption text-editorial-secondary">Transparent per-item commission and payout ledger</div>
        </div>
        <div class="text-caption text-editorial-secondary font-weight-medium">
          Total Transactions: {{ commissions.length }}
        </div>
      </div>

      <v-data-table
        :headers="headers"
        :items="commissions"
        :loading="loading"
        class="editorial-table"
      >
        <!-- Order Ref -->
        <template v-slot:[`item.orderRef`]="{ item }">
          <span class="font-weight-bold text-deep-green">
            {{ item.orderId?.orderNumber || (item.orderId ? '#' + item.orderId._id?.slice(-6).toUpperCase() : 'N/A') }}
          </span>
        </template>

        <!-- Product Name -->
        <template v-slot:[`item.product`]="{ item }">
          <div class="font-weight-semibold text-deep-green">
            {{ item.orderItemId?.productTitle || 'Marketplace Item' }}
          </div>
        </template>

        <!-- Gross Amount -->
        <template v-slot:[`item.grossAmountDZD`]="{ item }">
          <span class="font-weight-bold text-deep-green">
            {{ formatCurrency(item.grossAmountDZD) }}
          </span>
        </template>

        <!-- Platform Rate & Fee -->
        <template v-slot:[`item.commission`]="{ item }">
          <div>
            <span class="font-weight-bold text-sand-dark">-{{ formatCurrency(item.commissionAmountDZD) }}</span>
            <span class="text-caption text-editorial-secondary ms-1">({{ item.ratePercentage }}%)</span>
          </div>
        </template>

        <!-- Net Payout -->
        <template v-slot:[`item.netSellerAmountDZD`]="{ item }">
          <span class="font-weight-bold text-forest">
            {{ formatCurrency(item.netSellerAmountDZD) }}
          </span>
        </template>

        <!-- Settlement Status -->
        <template v-slot:[`item.settlementStatus`]="{ item }">
          <span :class="['status-badge', item.settlementStatus === 'settled' ? 'status-badge-success' : 'status-badge-warning']">
            <span class="status-badge-dot"></span>
            {{ item.settlementStatus === 'settled' ? 'Settled' : 'Accrued' }}
          </span>
        </template>

        <!-- Date -->
        <template v-slot:[`item.createdAt`]="{ item }">
          <span class="text-caption font-weight-medium">
            {{ formatDate(item.createdAt) }}
          </span>
        </template>

        <!-- Empty State -->
        <template v-slot:no-data>
          <div class="text-center py-12 px-4">
            <v-icon icon="mdi-file-chart-outline" size="48" color="sand" class="mb-2"></v-icon>
            <div class="text-subtitle-1 font-weight-medium text-deep-green">No Commission Records Yet</div>
            <p class="text-caption text-editorial-secondary mb-3">Once customer orders are paid and verified, earnings and commissions will automatically record here.</p>
          </div>
        </template>
      </v-data-table>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useSellerStore } from '@/stores/seller'

const sellerStore = useSellerStore()

const loading = ref(false)
const error = ref(null)

const finances = computed(() => sellerStore.getFinances)
const commissions = computed(() => finances.value.commissions || [])

const headers = ref([
  { title: 'Order Ref', key: 'orderRef', sortable: true },
  { title: 'Item', key: 'product', sortable: false },
  { title: 'Gross Sale', key: 'grossAmountDZD', sortable: true },
  { title: 'Platform Fee', key: 'commission', sortable: true },
  { title: 'Net Payout', key: 'netSellerAmountDZD', sortable: true },
  { title: 'Status', key: 'settlementStatus', sortable: true },
  { title: 'Date', key: 'createdAt', sortable: true }
])

const formatCurrency = (val) => {
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

const loadFinances = async () => {
  loading.value = true
  error.value = null
  try {
    await sellerStore.fetchFinances()
  } catch (err) {
    error.value = err.response?.data?.message || err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadFinances()
})
</script>
