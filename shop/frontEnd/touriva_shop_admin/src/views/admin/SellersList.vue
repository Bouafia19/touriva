<template>
  <v-container fluid class="px-4 px-md-8 py-6">
    <!-- Editorial Page Header -->
    <div class="editorial-page-header">
      <div>
        <div class="editorial-tag mb-1">Partner Governance</div>
        <h1 class="editorial-page-title">Marketplace Vendors & Sellers</h1>
        <p class="editorial-page-subtitle">Oversee registered merchant accounts, monitor performance metrics, and enforce quality standards.</p>
      </div>

      <div class="d-flex align-center gap-2">
        <v-btn
          variant="outlined"
          class="btn-editorial-outline px-4"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="loadSellers"
        >
          Refresh Vendors
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

    <!-- Table Container -->
    <div class="editorial-table-container">
      <div class="pa-4 bg-white d-flex align-center justify-space-between flex-wrap gap-3 border-b">
        <div class="d-flex align-center gap-3 flex-wrap">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search sellers by store, owner email, or wilaya..."
            variant="outlined"
            density="compact"
            hide-details
            rounded="pill"
            style="min-width: 260px; max-width: 360px;"
            class="editorial-search-input"
          ></v-text-field>
        </div>

        <div class="text-caption text-editorial-secondary font-weight-medium">
          Active Sellers: {{ filteredSellers.length }}
        </div>
      </div>

      <v-data-table
        :headers="headers"
        :items="filteredSellers"
        :loading="loading"
        class="editorial-table"
      >
        <!-- Store Name & Logo -->
        <template v-slot:[`item.storeName`]="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar size="40" class="me-3 bg-sand-light border-editorial flex-shrink-0">
              <v-img v-if="item.logoUrl" :src="item.logoUrl" cover></v-img>
              <v-icon v-else icon="mdi-store" color="forestGreen" size="20"></v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-bold text-deep-green">{{ item.storeName }}</div>
              <div class="text-caption text-editorial-secondary">
                slug: <code>/store/{{ item.storeSlug }}</code>
              </div>
            </div>
          </div>
        </template>

        <!-- User / Email -->
        <template v-slot:[`item.user`]="{ item }">
          <div>
            <div class="font-weight-medium text-deep-green">{{ item.userId?.email || 'N/A' }}</div>
            <div class="text-caption text-editorial-secondary">{{ item.phone }}</div>
          </div>
        </template>

        <!-- Wilaya -->
        <template v-slot:[`item.wilaya`]="{ item }">
          <span class="font-weight-medium text-deep-green">{{ item.wilaya || 'Algeria' }}</span>
        </template>

        <!-- Commission Rate -->
        <template v-slot:[`item.commissionRate`]="{ item }">
          <span class="font-weight-bold text-forest">{{ item.commissionRate || 10 }}%</span>
        </template>

        <!-- Rating -->
        <template v-slot:[`item.rating`]="{ item }">
          <div class="d-flex align-center gap-1">
            <v-icon icon="mdi-star" color="#D9943B" size="16"></v-icon>
            <span class="font-weight-bold text-deep-green">{{ item.rating || 5.0 }}</span>
          </div>
        </template>

        <!-- Status -->
        <template v-slot:[`item.status`]="{ item }">
          <span :class="['status-badge', item.isSuspended ? 'status-badge-error' : 'status-badge-success']">
            <span class="status-badge-dot"></span>
            {{ item.isSuspended ? 'Suspended' : 'Active' }}
          </span>
        </template>

        <!-- Actions -->
        <template v-slot:[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-end">
            <v-btn
              size="small"
              variant="outlined"
              :color="item.isSuspended ? 'success' : 'error'"
              class="px-3"
              @click="toggleSuspension(item)"
            >
              {{ item.isSuspended ? 'Reactivate' : 'Suspend' }}
            </v-btn>
          </div>
        </template>

        <!-- Empty State -->
        <template v-slot:no-data>
          <div class="text-center py-12 px-4">
            <v-icon icon="mdi-store-off-outline" size="48" color="sand" class="mb-2"></v-icon>
            <div class="text-subtitle-1 font-weight-medium text-deep-green">No Sellers Registered Yet</div>
            <p class="text-caption text-editorial-secondary mb-3">Approved vendor applications will create active sellers here.</p>
          </div>
        </template>
      </v-data-table>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useMarketplaceAdminStore } from '@/stores/marketplaceAdmin'

const adminStore = useMarketplaceAdminStore()

const search = ref('')
const loading = ref(false)
const errorMsg = ref(null)
const successMsg = ref(null)

const headers = [
  { title: 'Store', key: 'storeName', sortable: true },
  { title: 'Owner / Contact', key: 'user', sortable: false },
  { title: 'Wilaya', key: 'wilaya', sortable: true },
  { title: 'Commission', key: 'commissionRate', sortable: true },
  { title: 'Rating', key: 'rating', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Governance', key: 'actions', sortable: false, align: 'end' }
]

const sellers = computed(() => adminStore.getSellers || [])

const filteredSellers = computed(() => {
  let list = sellers.value
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(s => {
      const store = (s.storeName || '').toLowerCase()
      const email = (s.userId?.email || '').toLowerCase()
      const wilaya = (s.wilaya || '').toLowerCase()
      return store.includes(q) || email.includes(q) || wilaya.includes(q)
    })
  }
  return list
})

const toggleSuspension = async (seller) => {
  const newStatus = !seller.isSuspended
  loading.value = true
  errorMsg.value = null
  successMsg.value = null
  try {
    await adminStore.toggleSellerSuspension(seller._id, newStatus)
    successMsg.value = `Vendor "${seller.storeName}" has been ${newStatus ? 'suspended' : 'reactivated'}.`
  } catch (err) {
    errorMsg.value = err.response?.data?.message || err.message
  } finally {
    loading.value = false
  }
}

const loadSellers = async () => {
  loading.value = true
  try {
    await adminStore.fetchSellers()
  } catch (err) {
    errorMsg.value = err.response?.data?.message || err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSellers()
})
</script>
