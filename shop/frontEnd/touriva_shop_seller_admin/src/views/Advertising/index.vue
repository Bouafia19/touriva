<template>
  <v-container fluid class="px-4 px-md-8 py-6">
    <!-- Editorial Page Header -->
    <div class="editorial-page-header">
      <div>
        <div class="editorial-tag mb-1">Marketing & Promotions</div>
        <h1 class="editorial-page-title">Advertising Campaigns</h1>
        <p class="editorial-page-subtitle">Oversee promotional placements, merchant sponsorships, and campaign billing statuses.</p>
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

    <!-- Alert Message -->
    <v-alert
      v-if="err"
      type="error"
      variant="tonal"
      closable
      class="mb-4 rounded-lg"
      @click:close="err = ''"
    >
      {{ $t(err) || err }}
    </v-alert>

    <!-- Table Container -->
    <div class="editorial-table-container">
      <!-- Search & Filters Toolbar -->
      <div class="pa-4 bg-white d-flex align-center justify-space-between flex-wrap gap-3 border-b">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          :placeholder="$t('Search') + ' campaigns by partner or page...'"
          variant="outlined"
          density="compact"
          hide-details
          rounded="pill"
          style="min-width: 280px; max-width: 400px;"
          class="editorial-search-input"
        ></v-text-field>

        <div class="text-caption text-editorial-secondary font-weight-medium">
          Total Campaigns: {{ (ads.getAds || []).length }}
        </div>
      </div>

      <!-- V-Data-Table -->
      <v-data-table
        :headers="headers"
        :items="ads.getAds || []"
        :loading="!ads.getAds"
        :search="search"
        class="editorial-table"
      >
        <!-- Campaign Owner / Partner -->
        <template v-slot:[`item.ownerId`]="{ item }">
          <div class="d-flex align-center py-1">
            <v-avatar size="36" class="me-2 bg-sand-light border-editorial flex-shrink-0">
              <v-icon icon="mdi-bullhorn-outline" color="forestGreen" size="18"></v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-semibold text-deep-green">{{ getOwnerDisplayName(item.ownerId) }}</div>
              <div class="text-caption text-editorial-secondary">{{ item.page || 'Home Placement' }} · {{ item.space || 'Banner' }}</div>
            </div>
          </div>
        </template>

        <!-- Price -->
        <template v-slot:[`item.price`]="{ item }">
          <span class="font-weight-bold text-forest">
            {{ formatPrice(item.price) }}
          </span>
        </template>

        <!-- Dates -->
        <template v-slot:[`item.dates`]="{ item }">
          <div class="text-caption">
            <div><span class="text-editorial-secondary">Start:</span> {{ formatDate(item.startDate) }}</div>
            <div><span class="text-editorial-secondary">End:</span> {{ formatDate(item.endDate) }}</div>
          </div>
        </template>

        <!-- Duration -->
        <template v-slot:[`item.duration`]="{ item }">
          <span class="text-caption font-weight-medium">
            {{ item.duration || '—' }} days
          </span>
        </template>

        <!-- Published Chip -->
        <template v-slot:[`item.published`]="{ item }">
          <span :class="['status-badge', item.published ? 'status-badge-success' : 'status-badge-neutral']">
            <span class="status-badge-dot"></span>
            {{ item.published ? 'Live' : 'Draft' }}
          </span>
        </template>

        <!-- Billing Status Chip -->
        <template v-slot:[`item.billingStatus`]="{ item }">
          <span :class="['status-badge', getBillingStatusBadgeClass(item.billingStatus)]">
            <span class="status-badge-dot"></span>
            {{ item.billingStatus || 'pending' }}
          </span>
        </template>

        <!-- Actions -->
        <template v-slot:[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-end gap-1">
            <v-btn
              icon="mdi-pencil-outline"
              size="small"
              variant="text"
              color="forestGreen"
              @click="editItem(item)"
              title="Review & Edit"
            ></v-btn>
            <v-btn
              icon="mdi-delete-outline"
              size="small"
              variant="text"
              color="error"
              @click="deleteItem(item)"
              title="Delete campaign"
            ></v-btn>
          </div>
        </template>

        <!-- Empty State -->
        <template v-slot:no-data>
          <div class="text-center py-12 px-4">
            <v-icon icon="mdi-bullhorn-outline" size="48" color="sand" class="mb-2"></v-icon>
            <div class="text-subtitle-1 font-weight-medium text-deep-green">No Advertising Campaigns Found</div>
            <p class="text-caption text-editorial-secondary mb-3">Merchant campaign bookings will appear here for billing approval.</p>
            <v-btn class="btn-editorial-primary px-4" size="small" @click="initialize">
              Refresh Campaigns
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Edit Campaign Dialog -->
    <v-dialog v-model="dialog" max-width="850px">
      <v-card class="editorial-dialog-card">
        <div class="editorial-dialog-header">
          <span class="dialog-title font-serif">{{ formTitle }}</span>
          <v-btn icon="mdi-close" variant="text" density="compact" color="white" @click="close"></v-btn>
        </div>

        <v-card-text class="pa-5">
          <v-row>
            <v-col cols="12" sm="6">
              <v-select
                :items="billingStatusItems"
                v-model="editedItem.billingStatus"
                label="Billing Status"
                variant="outlined"
                density="comfortable"
                class="editorial-input"
                @update:modelValue="onPayedChange"
              ></v-select>
            </v-col>

            <v-col cols="12" sm="6" class="d-flex align-center">
              <v-switch
                v-model="editedItem.published"
                color="forestGreen"
                label="Publish Campaign Banner"
                hide-details
                inset
              ></v-switch>
            </v-col>

            <!-- Campaign Visual Asset Preview -->
            <v-col cols="12" sm="6">
              <label class="text-caption font-weight-bold text-deep-green d-block mb-2">Campaign Banner Visual</label>
              <div class="campaign-asset-preview pa-2 text-center">
                <v-img
                  v-if="editedItem.img"
                  :src="editedItem.img"
                  height="180"
                  contain
                  class="rounded-lg"
                ></v-img>
                <div v-else class="py-8 text-caption text-editorial-secondary">
                  <v-icon icon="mdi-image-outline" size="32" color="sand"></v-icon>
                  <div>No visual uploaded</div>
                </div>
              </div>
            </v-col>

            <!-- Billing Receipt Asset Preview -->
            <v-col cols="12" sm="6">
              <label class="text-caption font-weight-bold text-deep-green d-block mb-2">Merchant Payment Receipt</label>
              <div class="campaign-asset-preview pa-2 text-center">
                <v-img
                  v-if="editedItem.billingImg"
                  :src="editedItem.billingImg"
                  height="180"
                  contain
                  class="rounded-lg"
                ></v-img>
                <div v-else class="py-8 text-caption text-editorial-secondary">
                  <v-icon icon="mdi-receipt-text-outline" size="32" color="sand"></v-icon>
                  <div>No receipt submitted</div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <div class="editorial-dialog-actions d-flex justify-end gap-2">
          <v-btn class="btn-editorial-ghost px-4" @click="close">Cancel</v-btn>
          <v-btn class="btn-editorial-primary px-6" :loading="loading" @click="save">Update Campaign</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Modal -->
    <v-dialog v-model="dialogDelete" max-width="450px">
      <v-card class="editorial-dialog-card">
        <div class="editorial-dialog-header">
          <span class="dialog-title font-serif">Confirm Deletion</span>
          <v-btn icon="mdi-close" variant="text" density="compact" color="white" @click="closeDelete"></v-btn>
        </div>
        <v-card-text class="pa-5 text-center">
          <v-icon icon="mdi-alert-circle-outline" color="warning" size="48" class="mb-3"></v-icon>
          <div class="text-body-1 font-weight-medium">Are you sure you want to delete this ad campaign?</div>
          <div class="text-caption text-editorial-secondary mt-1">The placement will be removed immediately.</div>
        </v-card-text>
        <div class="editorial-dialog-actions d-flex justify-end gap-2">
          <v-btn class="btn-editorial-ghost px-4" @click="closeDelete">Cancel</v-btn>
          <v-btn color="error" variant="flat" rounded="pill" class="px-5" :loading="loadingDelete" @click="deleteItemConfirm">
            Delete
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch } from 'vue'
import { useAdsStore } from '@/stores/advertising'

const ads = useAdsStore()

const search = ref('')
const dialog = ref(false)
const dialogDelete = ref(false)
const loading = ref(false)
const loadingDelete = ref(false)
const err = ref('')
const editedIndex = ref(-1)
const deleteId = ref(null)

const billingStatusItems = ref(['paid', 'pending', 'rejected', 'draft'])

const headers = ref([
  { title: 'Partner / Placement', key: 'ownerId', sortable: true },
  { title: 'Price', key: 'price', sortable: true },
  { title: 'Duration', key: 'duration', sortable: true },
  { title: 'Schedule', key: 'dates', sortable: false },
  { title: 'Status', key: 'published', sortable: true },
  { title: 'Billing', key: 'billingStatus', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
])

const defaultItem = {
  billingStatus: 'pending',
  published: false,
  img: '',
  billingImg: ''
}

const editedItem = ref(Object.assign({}, defaultItem))

const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'Review Campaign' : 'Edit Campaign Details'
})

watch(dialog, (val) => {
  if (!val) close()
})

watch(dialogDelete, (val) => {
  if (!val) closeDelete()
})

const getOwnerDisplayName = (owner) => {
  if (!owner) return 'Campaign Partner'
  if (typeof owner === 'object') {
    if (owner.companyName) return owner.companyName
    if (owner.firstName || owner.lastName) return `${owner.firstName || ''} ${owner.lastName || ''}`.trim()
    return owner.email || 'Partner'
  }
  return String(owner)
}

const formatPrice = (val) => {
  const num = Number(val) || 0
  return new Intl.NumberFormat('en-DZ', {
    style: 'currency',
    currency: 'DZD',
    maximumFractionDigits: 0
  }).format(num)
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

const getBillingStatusBadgeClass = (status) => {
  const s = String(status).toLowerCase()
  if (s === 'paid') return 'status-badge-success'
  if (s === 'pending') return 'status-badge-warning'
  if (s === 'rejected' || s === 'cancelled') return 'status-badge-error'
  return 'status-badge-neutral'
}

const onPayedChange = () => {
  if (editedItem.value.billingStatus === 'paid') {
    editedItem.value.payed = true
  }
}

const initialize = async () => {
  loading.value = true
  try {
    await ads.fetchAds()
  } catch (e) {
    console.error('Error fetching ads:', e)
  } finally {
    loading.value = false
  }
}

const editItem = (item) => {
  const list = ads.getAds || []
  editedIndex.value = list.indexOf(item)
  editedItem.value = JSON.parse(JSON.stringify(item))
  dialog.value = true
}

const deleteItem = (item) => {
  deleteId.value = item._id
  dialogDelete.value = true
}

const deleteItemConfirm = () => {
  loadingDelete.value = true
  ads.deleteAds(deleteId.value).then(() => {
    initialize()
    loadingDelete.value = false
    closeDelete()
  }).catch((e) => {
    loadingDelete.value = false
    err.value = e.message || 'Error deleting ad'
    closeDelete()
  })
}

const close = () => {
  dialog.value = false
  nextTick(() => {
    editedItem.value = Object.assign({}, defaultItem)
    editedIndex.value = -1
  })
}

const closeDelete = () => {
  dialogDelete.value = false
  nextTick(() => {
    deleteId.value = null
  })
}

const save = () => {
  loading.value = true
  err.value = ''
  if (editedIndex.value > -1) {
    ads.editAds(editedItem.value).then(() => {
      loading.value = false
      close()
      initialize()
    }).catch((e) => {
      loading.value = false
      err.value = e.message || 'Error updating campaign'
    })
  } else {
    ads.addAds(editedItem.value).then(() => {
      loading.value = false
      close()
      initialize()
    }).catch((e) => {
      loading.value = false
      err.value = e.message || 'Error creating campaign'
    })
  }
}

onMounted(() => {
  initialize()
})
</script>

<style scoped>
.campaign-asset-preview {
  background-color: var(--color-warm-ivory);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>