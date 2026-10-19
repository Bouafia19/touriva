<template>
  <v-container fluid class="px-4 px-md-8 py-6">
    <!-- Editorial Page Header -->
    <div class="editorial-page-header">
      <div>
        <div class="editorial-tag mb-1">Financial Management</div>
        <h1 class="editorial-page-title">Billing & Accounts</h1>
        <p class="editorial-page-subtitle">Track merchant partner billing profiles, subscription accounts, and statements.</p>
      </div>

      <div class="d-flex align-center gap-2">
        <v-btn
          variant="outlined"
          class="btn-editorial-outline px-4"
          prepend-icon="mdi-refresh"
          :loading="!users.getPartners"
          @click="initialize"
        >
          {{ $t('Refresh') || 'Refresh' }}
        </v-btn>
      </div>
    </div>

    <!-- Table Container -->
    <div class="editorial-table-container">
      <!-- Search Toolbar -->
      <div class="pa-4 bg-white d-flex align-center justify-space-between flex-wrap gap-3 border-b">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          :placeholder="$t('Search') + ' partners by name, company or email...'"
          variant="outlined"
          density="compact"
          hide-details
          rounded="pill"
          style="min-width: 280px; max-width: 400px;"
          class="editorial-search-input"
        ></v-text-field>

        <div class="text-caption text-editorial-secondary font-weight-medium">
          Total Partners: {{ (users.getPartners || []).length }}
        </div>
      </div>

      <!-- V-Data-Table -->
      <v-data-table
        :headers="headers"
        :items="users.getPartners || []"
        :loading="!users.getPartners"
        :search="search"
        class="editorial-table"
        hover
        @click:row="handleRowClick"
      >
        <!-- Partner Name / Company -->
        <template v-slot:[`item.name`]="{ item }">
          <div class="d-flex align-center py-1">
            <v-avatar size="36" class="me-2 bg-sand-light border-editorial flex-shrink-0">
              <v-icon icon="mdi-store-outline" color="forestGreen" size="18"></v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-semibold text-deep-green">
                {{ item.companyName || `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Partner' }}
              </div>
              <div class="text-caption text-editorial-secondary">{{ item.email }}</div>
            </div>
          </div>
        </template>

        <!-- Phone -->
        <template v-slot:[`item.phone`]="{ item }">
          <span class="text-caption">{{ item.phone || '—' }}</span>
        </template>

        <!-- Account Type -->
        <template v-slot:[`item.typeAccount`]="{ item }">
          <span class="status-badge status-badge-sand">
            <span class="status-badge-dot"></span>
            {{ item.typeAccount || 'Merchant' }}
          </span>
        </template>

        <!-- Role -->
        <template v-slot:[`item.role`]="{ item }">
          <span class="status-badge status-badge-info">
            {{ item.role }}
          </span>
        </template>

        <!-- Actions -->
        <template v-slot:[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-end" @click.stop>
            <v-btn
              class="btn-editorial-outline px-3"
              size="x-small"
              append-icon="mdi-arrow-right"
              @click="getDetails(item)"
            >
              Statement
            </v-btn>
          </div>
        </template>

        <!-- Empty State -->
        <template v-slot:no-data>
          <div class="text-center py-12 px-4">
            <v-icon icon="mdi-credit-card-outline" size="48" color="sand" class="mb-2"></v-icon>
            <div class="text-subtitle-1 font-weight-medium text-deep-green">No Partner Accounts Found</div>
            <p class="text-caption text-editorial-secondary mb-3">Partner billing records will appear once merchant accounts are onboarded.</p>
            <v-btn class="btn-editorial-primary px-4" size="small" @click="initialize">
              Refresh
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUsersStore } from '@/stores/users'
import { useRouter } from 'vue-router'

const users = useUsersStore()
const router = useRouter()

const search = ref('')

const headers = ref([
  { title: 'Partner / Company', key: 'name', sortable: true },
  { title: 'Phone Number', key: 'phone', sortable: false },
  { title: 'Account Type', key: 'typeAccount', sortable: true },
  { title: 'Role', key: 'role', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
])

const getDetails = (item) => {
  router.push({
    name: 'Detail',
    params: {
      id: item._id,
      typeAccount: item.typeAccount || 'seller'
    }
  })
}

const handleRowClick = (e, { item }) => {
  if (item && item._id) {
    getDetails(item)
  }
}

const initialize = () => {
  users.fetchUsers()
}

onMounted(() => {
  initialize()
})
</script>