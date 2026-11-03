<template>
  <v-container fluid class="px-4 px-md-8 py-6">
    <!-- Editorial Page Header -->
    <div class="editorial-page-header">
      <div>
        <div class="editorial-tag mb-1">Catalog Quality Control</div>
        <h1 class="editorial-page-title">Product Moderation Queue</h1>
        <p class="editorial-page-subtitle">Inspect vendor product submissions, verify quality & cultural integrity, and approve items for the public storefront.</p>
      </div>

      <div class="d-flex align-center gap-2">
        <v-btn
          variant="outlined"
          class="btn-editorial-outline px-4"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="loadQueue"
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

    <!-- Queue Table Container -->
    <div class="editorial-table-container">
      <div class="pa-4 bg-white d-flex align-center justify-space-between flex-wrap gap-3 border-b">
        <div class="d-flex align-center gap-3 flex-wrap">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search pending products or sellers..."
            variant="outlined"
            density="compact"
            hide-details
            rounded="pill"
            style="min-width: 260px; max-width: 360px;"
            class="editorial-search-input"
          ></v-text-field>
        </div>

        <div class="text-caption text-editorial-secondary font-weight-medium">
          Pending Moderation: {{ queue.length }} items
        </div>
      </div>

      <v-data-table
        :headers="headers"
        :items="filteredQueue"
        :loading="loading"
        class="editorial-table"
      >
        <!-- Product Thumbnail -->
        <template v-slot:[`item.img`]="{ item }">
          <v-avatar rounded="lg" size="52" class="my-1 bg-sand-light border-editorial flex-shrink-0">
            <v-img v-if="item.img" :src="item.img" cover></v-img>
            <v-icon v-else icon="mdi-image-outline" color="sandDark" size="24"></v-icon>
          </v-avatar>
        </template>

        <!-- Product Name & Description -->
        <template v-slot:[`item.name`]="{ item }">
          <div>
            <div class="font-weight-bold text-deep-green">{{ item.name }}</div>
            <div class="text-caption text-editorial-secondary text-truncate" style="max-width: 260px;">
              {{ item.description || 'No description provided' }}
            </div>
          </div>
        </template>

        <!-- Seller Store -->
        <template v-slot:[`item.seller`]="{ item }">
          <div>
            <div class="font-weight-medium text-deep-green">{{ item.sellerId?.storeName || 'Vendor' }}</div>
            <div class="text-caption text-editorial-secondary">{{ item.sellerId?.wilaya || 'Algeria' }}</div>
          </div>
        </template>

        <!-- Price -->
        <template v-slot:[`item.price`]="{ item }">
          <div>
            <span class="font-weight-bold text-forest">
              {{ formatPrice(item.discountPrice || item.price) }}
            </span>
            <div v-if="item.discountPrice && item.discountPrice < item.price" class="text-caption text-decoration-line-through text-editorial-secondary">
              {{ formatPrice(item.price) }}
            </div>
          </div>
        </template>

        <!-- Stock -->
        <template v-slot:[`item.stockQuantity`]="{ item }">
          <span class="font-weight-medium text-deep-green">{{ item.stockQuantity ?? 10 }} units</span>
        </template>

        <!-- Moderation Actions -->
        <template v-slot:[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-end gap-1">
            <v-btn
              size="small"
              class="btn-editorial-primary px-3"
              @click="approveProduct(item)"
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
          </div>
        </template>

        <!-- Empty State -->
        <template v-slot:no-data>
          <div class="text-center py-12 px-4">
            <v-icon icon="mdi-check-decagram-outline" size="48" color="forestGreen" class="mb-2"></v-icon>
            <div class="text-subtitle-1 font-weight-medium text-deep-green">Moderation Queue is Clean!</div>
            <p class="text-caption text-editorial-secondary mb-3">All vendor product submissions have been reviewed and approved.</p>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Reject Dialog -->
    <v-dialog v-model="rejectDialog" max-width="500px">
      <v-card class="editorial-dialog-card pa-6">
        <h3 class="text-h6 font-serif font-weight-bold text-deep-green mb-2">Reject Product Submission</h3>
        <p class="text-caption text-editorial-secondary mb-4">
          Please provide feedback to <strong>{{ currentProduct?.sellerId?.storeName }}</strong> regarding why <strong>{{ currentProduct?.name }}</strong> was rejected.
        </p>

        <label class="input-label">Rejection Reason *</label>
        <v-textarea
          v-model="rejectionReason"
          placeholder="e.g. Unclear product image, inaccurate pricing, or item does not conform to authentic travel merchandise guidelines..."
          variant="outlined"
          density="comfortable"
          rows="3"
          class="editorial-input mb-4"
        ></v-textarea>

        <div class="d-flex justify-end gap-2 pt-2 border-t">
          <v-btn variant="text" class="btn-editorial-sand px-4" @click="rejectDialog = false">Cancel</v-btn>
          <v-btn color="error" class="px-5 font-weight-bold" :loading="processingAction" @click="confirmRejection">
            Decline Product
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
const loading = ref(false)
const processingAction = ref(false)
const errorMsg = ref(null)
const successMsg = ref(null)

const rejectDialog = ref(false)
const currentProduct = ref(null)
const rejectionReason = ref('')

const headers = [
  { title: 'Image', key: 'img', sortable: false, width: '70px' },
  { title: 'Product Title', key: 'name', sortable: true },
  { title: 'Seller Store', key: 'seller', sortable: false },
  { title: 'Price (DZD)', key: 'price', sortable: true },
  { title: 'Stock', key: 'stockQuantity', sortable: true },
  { title: 'Moderation', key: 'actions', sortable: false, align: 'end' }
]

const queue = computed(() => adminStore.getModerationQueue || [])

const filteredQueue = computed(() => {
  let list = queue.value
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(p => {
      const name = (p.name || '').toLowerCase()
      const seller = (p.sellerId?.storeName || '').toLowerCase()
      return name.includes(q) || seller.includes(q)
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

const approveProduct = async (product) => {
  loading.value = true
  errorMsg.value = null
  successMsg.value = null
  try {
    await adminStore.moderateProduct(product._id, {
      status: 'approved',
      moderationNotes: 'Approved by marketplace administrator'
    })
    successMsg.value = `"${product.name}" has been approved and is now live on Touriva Marketplace!`
  } catch (err) {
    errorMsg.value = err.response?.data?.message || err.message
  } finally {
    loading.value = false
  }
}

const openRejectDialog = (product) => {
  currentProduct.value = product
  rejectionReason.value = ''
  rejectDialog.value = true
}

const confirmRejection = async () => {
  if (!currentProduct.value?._id) return
  if (!rejectionReason.value.trim()) {
    errorMsg.value = 'Please provide a reason for rejection.'
    return
  }
  processingAction.value = true
  errorMsg.value = null
  successMsg.value = null
  try {
    await adminStore.moderateProduct(currentProduct.value._id, {
      status: 'rejected',
      rejectionReason: rejectionReason.value
    })
    successMsg.value = `"${currentProduct.value.name}" rejected.`
    rejectDialog.value = false
  } catch (err) {
    errorMsg.value = err.response?.data?.message || err.message
  } finally {
    processingAction.value = false
  }
}

const loadQueue = async () => {
  loading.value = true
  try {
    await adminStore.fetchModerationQueue()
  } catch (err) {
    errorMsg.value = err.response?.data?.message || err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadQueue()
})
</script>
