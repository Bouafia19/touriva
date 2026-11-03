<template>
  <v-container fluid class="px-4 px-md-8 py-6">
    <!-- Editorial Page Header -->
    <div class="editorial-page-header">
      <div>
        <div class="editorial-tag mb-1">Vendor Onboarding</div>
        <h1 class="editorial-page-title">Seller Applications Queue</h1>
        <p class="editorial-page-subtitle">Review, evaluate, and approve prospective artisan & merchant partner applications for Touriva Marketplace.</p>
      </div>

      <div class="d-flex align-center gap-2">
        <v-btn
          variant="outlined"
          class="btn-editorial-outline px-4"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="loadApplications"
        >
          Refresh Queue
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

    <!-- Filter & Table Container -->
    <div class="editorial-table-container">
      <div class="pa-4 bg-white d-flex align-center justify-space-between flex-wrap gap-3 border-b">
        <div class="d-flex align-center gap-3 flex-wrap">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search by store, contact, or wilaya..."
            variant="outlined"
            density="compact"
            hide-details
            rounded="pill"
            style="min-width: 260px; max-width: 360px;"
            class="editorial-search-input"
          ></v-text-field>

          <v-chip-group
            v-model="selectedStatus"
            selected-class="chip-active-editorial"
            density="compact"
          >
            <v-chip value="all" filter variant="tonal" rounded="pill">All ({{ applications.length }})</v-chip>
            <v-chip value="pending" filter variant="tonal" rounded="pill">Pending Review</v-chip>
            <v-chip value="approved" filter variant="tonal" rounded="pill">Approved</v-chip>
            <v-chip value="rejected" filter variant="tonal" rounded="pill">Rejected</v-chip>
          </v-chip-group>
        </div>

        <div class="text-caption text-editorial-secondary font-weight-medium">
          Applications: {{ filteredApplications.length }}
        </div>
      </div>

      <v-data-table
        :headers="headers"
        :items="filteredApplications"
        :loading="loading"
        class="editorial-table"
      >
        <!-- Store Name & Category -->
        <template v-slot:[`item.storeName`]="{ item }">
          <div>
            <div class="font-weight-bold text-deep-green">{{ item.storeName }}</div>
            <div class="text-caption text-editorial-secondary">
              {{ item.businessCategory }} &bull; {{ item.wilaya }}
            </div>
          </div>
        </template>

        <!-- Contact Person -->
        <template v-slot:[`item.contact`]="{ item }">
          <div>
            <div class="font-weight-medium text-deep-green">{{ item.applicantName }}</div>
            <div class="text-caption text-editorial-secondary">{{ item.applicantEmail }}</div>
            <div class="text-caption text-editorial-secondary">{{ item.applicantPhone }}</div>
          </div>
        </template>

        <!-- Description -->
        <template v-slot:[`item.businessDescription`]="{ item }">
          <div class="text-caption text-editorial-secondary text-truncate" style="max-width: 250px;">
            {{ item.businessDescription }}
          </div>
        </template>

        <!-- Status -->
        <template v-slot:[`item.status`]="{ item }">
          <span :class="['status-badge', getStatusBadgeClass(item.status)]">
            <span class="status-badge-dot"></span>
            {{ formatStatus(item.status) }}
          </span>
        </template>

        <!-- Date -->
        <template v-slot:[`item.createdAt`]="{ item }">
          <span class="text-caption font-weight-medium">
            {{ formatDate(item.createdAt) }}
          </span>
        </template>

        <!-- Actions -->
        <template v-slot:[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-end gap-1">
            <template v-if="item.status === 'pending' || item.status === 'under_review'">
              <v-btn
                size="small"
                variant="outlined"
                class="btn-editorial-outline px-3"
                color="forestGreen"
                @click="openApproveDialog(item)"
              >
                Approve
              </v-btn>
              <v-btn
                size="small"
                variant="text"
                color="error"
                @click="openRejectDialog(item)"
              >
                Reject
              </v-btn>
            </template>
            <span v-else class="text-caption text-editorial-secondary font-weight-medium">
              Completed
            </span>
          </div>
        </template>

        <!-- Empty State -->
        <template v-slot:no-data>
          <div class="text-center py-12 px-4">
            <v-icon icon="mdi-account-clock-outline" size="48" color="sand" class="mb-2"></v-icon>
            <div class="text-subtitle-1 font-weight-medium text-deep-green">No Applications Found</div>
            <p class="text-caption text-editorial-secondary mb-3">Prospective vendor applications submitted via the storefront will appear here.</p>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Approve Dialog -->
    <v-dialog v-model="approveDialog" max-width="500px">
      <v-card class="editorial-dialog-card pa-6">
        <h3 class="text-h6 font-serif font-weight-bold text-deep-green mb-2">Approve Vendor Application</h3>
        <p class="text-caption text-editorial-secondary mb-4">
          Approving <strong>{{ currentApp?.storeName }}</strong> will automatically create their seller user account and vendor profile with active status.
        </p>

        <label class="input-label">Initial Commission Rate (%)</label>
        <v-text-field
          v-model="commissionRate"
          type="number"
          variant="outlined"
          density="comfortable"
          class="editorial-input mb-4"
          suffix="%"
        ></v-text-field>

        <label class="input-label">Internal Approval Note</label>
        <v-textarea
          v-model="reviewNotes"
          placeholder="Verified artisan credentials and commercial register..."
          variant="outlined"
          density="comfortable"
          rows="3"
          class="editorial-input mb-4"
        ></v-textarea>

        <div class="d-flex justify-end gap-2 pt-2 border-t">
          <v-btn variant="text" class="btn-editorial-sand px-4" @click="approveDialog = false">Cancel</v-btn>
          <v-btn class="btn-editorial-primary px-5" :loading="processingAction" @click="confirmApproval">
            Confirm Approval
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Reject Dialog -->
    <v-dialog v-model="rejectDialog" max-width="500px">
      <v-card class="editorial-dialog-card pa-6">
        <h3 class="text-h6 font-serif font-weight-bold text-deep-green mb-2">Reject Application</h3>
        <p class="text-caption text-editorial-secondary mb-4">
          Please provide a clear reason for declining <strong>{{ currentApp?.storeName }}</strong>.
        </p>

        <label class="input-label">Rejection Reason *</label>
        <v-textarea
          v-model="rejectionReason"
          placeholder="Missing craft certification or products outside travel & cultural merchandise scope..."
          variant="outlined"
          density="comfortable"
          rows="3"
          class="editorial-input mb-4"
        ></v-textarea>

        <div class="d-flex justify-end gap-2 pt-2 border-t">
          <v-btn variant="text" class="btn-editorial-sand px-4" @click="rejectDialog = false">Cancel</v-btn>
          <v-btn color="error" class="px-5 font-weight-bold" :loading="processingAction" @click="confirmRejection">
            Decline Application
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
const selectedStatus = ref('all')
const loading = ref(false)
const processingAction = ref(false)
const errorMsg = ref(null)
const successMsg = ref(null)

const approveDialog = ref(false)
const rejectDialog = ref(false)
const currentApp = ref(null)
const commissionRate = ref(10)
const reviewNotes = ref('')
const rejectionReason = ref('')

const headers = [
  { title: 'Store & Wilaya', key: 'storeName', sortable: true },
  { title: 'Contact Person', key: 'contact', sortable: false },
  { title: 'Business Profile', key: 'businessDescription', sortable: false },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Date Applied', key: 'createdAt', sortable: true },
  { title: 'Decision', key: 'actions', sortable: false, align: 'end' }
]

const applications = computed(() => adminStore.getApplications || [])

const filteredApplications = computed(() => {
  let list = applications.value
  if (selectedStatus.value && selectedStatus.value !== 'all') {
    list = list.filter(a => a.status === selectedStatus.value)
  }
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(a => {
      const store = (a.storeName || '').toLowerCase()
      const contact = (a.applicantName || '').toLowerCase()
      const wilaya = (a.wilaya || '').toLowerCase()
      return store.includes(q) || contact.includes(q) || wilaya.includes(q)
    })
  }
  return list
})

const getStatusBadgeClass = (status) => {
  if (status === 'approved') return 'status-badge-success'
  if (status === 'rejected') return 'status-badge-error'
  if (status === 'under_review') return 'status-badge-warning'
  return 'status-badge-sand'
}

const formatStatus = (status) => {
  if (status === 'approved') return 'Approved'
  if (status === 'rejected') return 'Rejected'
  if (status === 'under_review') return 'Under Review'
  return 'Pending'
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

const openApproveDialog = (item) => {
  currentApp.value = item
  commissionRate.value = 10
  reviewNotes.value = ''
  approveDialog.value = true
}

const confirmApproval = async () => {
  if (!currentApp.value?._id) return
  processingAction.value = true
  errorMsg.value = null
  successMsg.value = null
  try {
    await adminStore.reviewApplication(currentApp.value._id, {
      status: 'approved',
      commissionRate: Number(commissionRate.value),
      reviewNotes: reviewNotes.value
    })
    successMsg.value = `Application for "${currentApp.value.storeName}" has been approved. Seller account created!`
    approveDialog.value = false
  } catch (err) {
    errorMsg.value = err.response?.data?.message || err.message
  } finally {
    processingAction.value = false
  }
}

const openRejectDialog = (item) => {
  currentApp.value = item
  rejectionReason.value = ''
  rejectDialog.value = true
}

const confirmRejection = async () => {
  if (!currentApp.value?._id) return
  if (!rejectionReason.value.trim()) {
    errorMsg.value = 'Please provide a reason for rejection.'
    return
  }
  processingAction.value = true
  errorMsg.value = null
  successMsg.value = null
  try {
    await adminStore.reviewApplication(currentApp.value._id, {
      status: 'rejected',
      rejectionReason: rejectionReason.value
    })
    successMsg.value = `Application for "${currentApp.value.storeName}" rejected.`
    rejectDialog.value = false
  } catch (err) {
    errorMsg.value = err.response?.data?.message || err.message
  } finally {
    processingAction.value = false
  }
}

const loadApplications = async () => {
  loading.value = true
  try {
    await adminStore.fetchApplications()
  } catch (err) {
    errorMsg.value = err.response?.data?.message || err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadApplications()
})
</script>
