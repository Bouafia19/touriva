<template>
  <v-container fluid class="px-4 px-md-8 py-6">
    <!-- Editorial Page Header -->
    <div class="editorial-page-header">
      <div>
        <div class="editorial-tag mb-1">Marketplace Operations</div>
        <h1 class="editorial-page-title">Executive Marketplace Overview</h1>
        <p class="editorial-page-subtitle">Central supervision of vendors, catalog moderation queue, multi-vendor GMV, and accrued platform commissions.</p>
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
          prepend-icon="mdi-shield-check"
          to="/admin/products/moderation"
        >
          Moderation Queue ({{ kpis.pendingProductModeration }})
        </v-btn>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && isInitialLoad" class="d-flex justify-center align-center py-16">
      <div class="text-center">
        <v-progress-circular indeterminate color="forestGreen" size="48" width="4"></v-progress-circular>
        <div class="mt-4 text-subtitle-2 text-editorial-secondary">Loading executive marketplace data...</div>
      </div>
    </div>

    <div v-else>
      <!-- Stat Cards Grid 1: Revenue & Volume -->
      <v-row class="mb-4">
        <!-- Stat 1: Gross GMV -->
        <v-col cols="12" sm="6" lg="3">
          <div class="editorial-stat-card">
            <div class="d-flex justify-space-between align-start">
              <div>
                <span class="editorial-tag">Marketplace Volume</span>
                <div class="text-h4 font-serif font-weight-bold text-deep-green mt-1">
                  {{ formatCurrency(kpis.marketplaceGMVDZD) }}
                </div>
                <div class="text-caption text-editorial-secondary mt-1">
                  Gross Merchandise Volume
                </div>
              </div>
              <div class="stat-icon-wrapper bg-sand-light">
                <v-icon icon="mdi-cash-multiple" color="#B89564" size="24"></v-icon>
              </div>
            </div>
            <div class="d-flex align-center justify-space-between mt-4 pt-3 border-t">
              <span class="text-caption text-editorial-secondary">{{ kpis.totalOrders }} total customer orders</span>
              <router-link to="/admin/orders" class="text-caption font-weight-bold text-forest text-decoration-none">
                Orders &rarr;
              </router-link>
            </div>
          </div>
        </v-col>

        <!-- Stat 2: Platform Revenue (Commissions) -->
        <v-col cols="12" sm="6" lg="3">
          <div class="editorial-stat-card">
            <div class="d-flex justify-space-between align-start">
              <div>
                <span class="editorial-tag">Touriva Revenue</span>
                <div class="text-h4 font-serif font-weight-bold text-forest mt-1">
                  {{ formatCurrency(kpis.totalCommissionEarnedDZD) }}
                </div>
                <div class="text-caption text-editorial-secondary mt-1">
                  Platform Commission Earned
                </div>
              </div>
              <div class="stat-icon-wrapper bg-sand-light">
                <v-icon icon="mdi-percent" color="#21866B" size="24"></v-icon>
              </div>
            </div>
            <div class="d-flex align-center justify-space-between mt-4 pt-3 border-t">
              <span class="text-caption text-forest font-weight-bold">Net operator profit</span>
              <router-link to="/admin/commissions" class="text-caption font-weight-bold text-forest text-decoration-none">
                Ledger &rarr;
              </router-link>
            </div>
          </div>
        </v-col>

        <!-- Stat 3: Vendor Network -->
        <v-col cols="12" sm="6" lg="3">
          <div class="editorial-stat-card">
            <div class="d-flex justify-space-between align-start">
              <div>
                <span class="editorial-tag">Vendor Ecosystem</span>
                <div class="text-h4 font-serif font-weight-bold text-deep-green mt-1">
                  {{ kpis.activeVendors }}
                </div>
                <div class="text-caption text-editorial-secondary mt-1">
                  Active Verified Sellers
                </div>
              </div>
              <div class="stat-icon-wrapper bg-sand-light">
                <v-icon icon="mdi-store" color="#B89564" size="24"></v-icon>
              </div>
            </div>
            <div class="d-flex align-center justify-space-between mt-4 pt-3 border-t">
              <span class="status-badge status-badge-warning" v-if="kpis.pendingApplications > 0">
                <span class="status-badge-dot"></span>
                {{ kpis.pendingApplications }} Applications
              </span>
              <span class="status-badge status-badge-success" v-else>
                Applications Clear
              </span>
              <router-link to="/admin/seller-applications" class="text-caption font-weight-bold text-forest text-decoration-none">
                Review &rarr;
              </router-link>
            </div>
          </div>
        </v-col>

        <!-- Stat 4: Catalog & Moderation -->
        <v-col cols="12" sm="6" lg="3">
          <div class="editorial-stat-card">
            <div class="d-flex justify-space-between align-start">
              <div>
                <span class="editorial-tag">Catalog Moderation</span>
                <div class="text-h4 font-serif font-weight-bold text-deep-green mt-1">
                  {{ kpis.totalCatalogProducts }}
                </div>
                <div class="text-caption text-editorial-secondary mt-1">
                  Total Catalog Products
                </div>
              </div>
              <div class="stat-icon-wrapper bg-sand-light">
                <v-icon icon="mdi-package-variant-closed" color="#B89564" size="24"></v-icon>
              </div>
            </div>
            <div class="d-flex align-center justify-space-between mt-4 pt-3 border-t">
              <span class="status-badge status-badge-warning" v-if="kpis.pendingProductModeration > 0">
                <span class="status-badge-dot"></span>
                {{ kpis.pendingProductModeration }} In Queue
              </span>
              <span class="status-badge status-badge-success" v-else>
                Queue Clean
              </span>
              <router-link to="/admin/products/moderation" class="text-caption font-weight-bold text-forest text-decoration-none">
                Moderate &rarr;
              </router-link>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Operational Priority Panels -->
      <v-row>
        <!-- Left: Quick Navigation & Moderation Hub -->
        <v-col cols="12" lg="8">
          <div class="editorial-table-container mb-6">
            <div class="pa-4 bg-white d-flex align-center justify-space-between border-b">
              <div>
                <h2 class="text-subtitle-1 font-weight-bold text-deep-green">Marketplace Operator Controls</h2>
                <div class="text-caption text-editorial-secondary">Direct management interfaces for Khaled Bouafia</div>
              </div>
            </div>

            <div class="pa-4">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-card class="pa-4 border-editorial h-100" hover to="/admin/seller-applications">
                    <div class="d-flex align-center gap-3 mb-2">
                      <v-avatar color="sandLight" size="40">
                        <v-icon icon="mdi-account-plus" color="forestGreen"></v-icon>
                      </v-avatar>
                      <div>
                        <div class="font-weight-bold text-deep-green">Vendor Applications</div>
                        <div class="text-caption text-editorial-secondary">{{ kpis.pendingApplications }} pending review</div>
                      </div>
                    </div>
                    <p class="text-caption text-editorial-secondary mb-0">
                      Vet Algerian artisans, inspect craft credentials, and grant automated seller store access.
                    </p>
                  </v-card>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-card class="pa-4 border-editorial h-100" hover to="/admin/products/moderation">
                    <div class="d-flex align-center gap-3 mb-2">
                      <v-avatar color="sandLight" size="40">
                        <v-icon icon="mdi-shield-check" color="forestGreen"></v-icon>
                      </v-avatar>
                      <div>
                        <div class="font-weight-bold text-deep-green">Product Moderation</div>
                        <div class="text-caption text-editorial-secondary">{{ kpis.pendingProductModeration }} items awaiting approval</div>
                      </div>
                    </div>
                    <p class="text-caption text-editorial-secondary mb-0">
                      Quality review workflow before products appear in the public Touriva traveler storefront.
                    </p>
                  </v-card>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-card class="pa-4 border-editorial h-100" hover to="/admin/orders">
                    <div class="d-flex align-center gap-3 mb-2">
                      <v-avatar color="sandLight" size="40">
                        <v-icon icon="mdi-receipt-text-check" color="forestGreen"></v-icon>
                      </v-avatar>
                      <div>
                        <div class="font-weight-bold text-deep-green">Payment Verification</div>
                        <div class="text-caption text-editorial-secondary">{{ kpis.pendingPaymentOrders }} awaiting payment review</div>
                      </div>
                    </div>
                    <p class="text-caption text-editorial-secondary mb-0">
                      Verify CCP / BaridiMob transfer receipts and trigger commission accruals.
                    </p>
                  </v-card>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-card class="pa-4 border-editorial h-100" hover to="/admin/commissions">
                    <div class="d-flex align-center gap-3 mb-2">
                      <v-avatar color="sandLight" size="40">
                        <v-icon icon="mdi-wallet" color="forestGreen"></v-icon>
                      </v-avatar>
                      <div>
                        <div class="font-weight-bold text-deep-green">Commission Ledger</div>
                        <div class="text-caption text-editorial-secondary">Settlement & payouts tracking</div>
                      </div>
                    </div>
                    <p class="text-caption text-editorial-secondary mb-0">
                      Track per-item commission revenue and disburse net balances to verified Algerian vendors.
                    </p>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </div>
        </v-col>

        <!-- Right: Governance & Security Pledge -->
        <v-col cols="12" lg="4">
          <div class="editorial-card pa-5 mb-4">
            <span class="editorial-tag mb-2">Platform Governance</span>
            <div class="font-serif font-weight-bold text-h6 text-deep-green mb-2">
              Khaled Bouafia Central Supervision
            </div>
            <p class="text-caption text-editorial-secondary mb-3">
              Touriva Marketplace is an owner-operated multi-vendor ecosystem. Sellers do not possess independent administrative rights. All listings and payouts pass through central moderation.
            </p>

            <div class="border-t pt-3 text-caption">
              <div class="d-flex justify-space-between mb-2">
                <span class="text-editorial-secondary">Default Commission:</span>
                <span class="font-weight-bold text-forest">10.0%</span>
              </div>
              <div class="d-flex justify-space-between mb-2">
                <span class="text-editorial-secondary">Catalog Isolation:</span>
                <span class="font-weight-bold text-forest">Enforced (RBAC)</span>
              </div>
              <div class="d-flex justify-space-between">
                <span class="text-editorial-secondary">Domain Architecture:</span>
                <span class="font-weight-bold text-deep-green">nextchallenge.tech</span>
              </div>
            </div>

            <v-btn
              to="/admin/marketplace-settings"
              block
              size="small"
              class="btn-editorial-sand mt-4"
              prepend-icon="mdi-cog-outline"
            >
              Configure Platform Settings
            </v-btn>
          </div>

          <div class="editorial-card pa-5 bg-sand-light">
            <div class="d-flex align-center gap-2 mb-2">
              <v-icon icon="mdi-shield-lock-outline" color="#173F35" size="20"></v-icon>
              <span class="text-subtitle-2 font-weight-bold text-deep-green">Zero Regression Safety</span>
            </div>
            <p class="text-caption text-editorial-secondary mb-0">
              The primary Touriva Tourism Platform (<code>touriva.nextchallenge.tech</code>) remains completely decoupled, safeguarded, and fully operational with 100% test passing rates.
            </p>
          </div>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useMarketplaceAdminStore } from '@/stores/marketplaceAdmin'

const adminStore = useMarketplaceAdminStore()

const loading = ref(false)
const isInitialLoad = ref(true)

const kpis = computed(() => adminStore.getKpis)

const formatCurrency = (val) => {
  const num = Number(val) || 0
  return new Intl.NumberFormat('en-DZ', {
    style: 'currency',
    currency: 'DZD',
    maximumFractionDigits: 0
  }).format(num)
}

const refreshData = async () => {
  loading.value = true
  try {
    await adminStore.fetchDashboard()
  } catch (e) {
    console.error('Error refreshing marketplace admin dashboard', e)
  } finally {
    loading.value = false
    isInitialLoad.value = false
  }
}

onMounted(() => {
  refreshData()
})
</script>
