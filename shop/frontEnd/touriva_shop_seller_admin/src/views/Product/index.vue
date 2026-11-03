<template>
  <v-container fluid class="px-4 px-md-8 py-6">
    <!-- Editorial Page Header -->
    <div class="editorial-page-header">
      <div>
        <div class="editorial-tag mb-1">Catalog Management</div>
        <h1 class="editorial-page-title">My Store Products</h1>
        <p class="editorial-page-subtitle">Manage your merchandise catalog, track moderation review status, and update inventory.</p>
      </div>

      <div class="d-flex align-center gap-2 flex-wrap">
        <v-btn
          class="btn-editorial-primary px-5"
          prepend-icon="mdi-plus"
          @click="openNewDialog"
        >
          Add Product
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
      <!-- Table Controls Toolbar -->
      <div class="pa-4 bg-white d-flex align-center justify-space-between flex-wrap gap-3 border-b">
        <div class="d-flex align-center gap-3 flex-wrap">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search products by title or code..."
            variant="outlined"
            density="compact"
            hide-details
            rounded="pill"
            style="min-width: 260px; max-width: 360px;"
            class="editorial-search-input"
          ></v-text-field>

          <v-chip-group
            v-model="statusFilter"
            selected-class="chip-active-editorial"
            density="compact"
          >
            <v-chip value="all" filter variant="tonal" rounded="pill">All ({{ productsList.length }})</v-chip>
            <v-chip value="approved" filter variant="tonal" rounded="pill">Approved</v-chip>
            <v-chip value="pending_review" filter variant="tonal" rounded="pill">In Review</v-chip>
            <v-chip value="rejected" filter variant="tonal" rounded="pill">Rejected</v-chip>
          </v-chip-group>
        </div>

        <div class="d-flex align-center gap-2">
          <v-btn
            icon="mdi-refresh"
            variant="text"
            density="comfortable"
            color="forestGreen"
            @click="initialize"
            title="Refresh"
          ></v-btn>
        </div>
      </div>

      <!-- V-Data-Table -->
      <v-data-table
        :headers="headers"
        :items="filteredProducts"
        :loading="loading"
        class="editorial-table"
      >
        <!-- Product Image Preview -->
        <template v-slot:[`item.img`]="{ item }">
          <v-avatar rounded="lg" size="48" class="my-1 bg-sand-light border-editorial flex-shrink-0">
            <v-img v-if="item.img" :src="item.img" cover></v-img>
            <v-icon v-else icon="mdi-image-outline" color="sandDark" size="24"></v-icon>
          </v-avatar>
        </template>

        <!-- Product Name & Description -->
        <template v-slot:[`item.name`]="{ item }">
          <div>
            <div class="font-weight-bold text-deep-green">{{ item.name }}</div>
            <div class="text-caption text-editorial-secondary text-truncate" style="max-width: 240px;">
              {{ item.description || '' }}
            </div>
          </div>
        </template>

        <!-- Price & Discount -->
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

        <!-- Stock Quantity -->
        <template v-slot:[`item.stockQuantity`]="{ item }">
          <span :class="['font-weight-medium', (item.stockQuantity ?? 10) < 5 ? 'text-error font-weight-bold' : 'text-deep-green']">
            {{ item.stockQuantity ?? 10 }} in stock
          </span>
        </template>

        <!-- Moderation Status Badge -->
        <template v-slot:[`item.status`]="{ item }">
          <div>
            <span :class="['status-badge', getStatusBadgeClass(item.status || (item.published ? 'approved' : 'draft'))]">
              <span class="status-badge-dot"></span>
              {{ formatStatus(item.status || (item.published ? 'approved' : 'draft')) }}
            </span>
            <div v-if="item.status === 'rejected' && item.rejectionReason" class="text-caption text-error mt-1" style="max-width: 200px;">
              Reason: {{ item.rejectionReason }}
            </div>
          </div>
        </template>

        <!-- Action Buttons -->
        <template v-slot:[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-end gap-1">
            <v-btn
              icon="mdi-pencil-outline"
              size="small"
              variant="text"
              color="forestGreen"
              @click="editItem(item)"
              title="Edit product"
            ></v-btn>
            <v-btn
              icon="mdi-delete-outline"
              size="small"
              variant="text"
              color="error"
              @click="deleteItem(item)"
              title="Delete product"
            ></v-btn>
          </div>
        </template>

        <!-- Empty State -->
        <template v-slot:no-data>
          <div class="text-center py-12 px-4">
            <v-icon icon="mdi-package-variant-closed" size="48" color="sand" class="mb-2"></v-icon>
            <div class="text-subtitle-1 font-weight-medium text-deep-green">No Products in Catalog</div>
            <p class="text-caption text-editorial-secondary mb-4">Start creating merchandise items to sell to Touriva travelers.</p>
            <v-btn class="btn-editorial-primary px-5" size="small" @click="openNewDialog">
              Add First Product
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Product Create/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="720px">
      <v-card class="editorial-dialog-card">
        <div class="editorial-dialog-header">
          <span class="dialog-title font-serif">{{ editedIndex > -1 ? 'Edit Product' : 'New Marketplace Product' }}</span>
          <v-btn icon="mdi-close" variant="text" density="compact" color="white" @click="close"></v-btn>
        </div>

        <v-card-text class="pa-5">
          <v-row>
            <!-- Product Name -->
            <v-col cols="12">
              <label class="input-label">Product Title *</label>
              <v-text-field
                v-model="editedItem.name"
                placeholder="e.g. Traditional Hand-Woven Touareg Blanket"
                variant="outlined"
                density="comfortable"
                class="editorial-input"
                required
              ></v-text-field>
            </v-col>

            <!-- Price -->
            <v-col cols="12" sm="6">
              <label class="input-label">Price (DZD) *</label>
              <v-text-field
                v-model="editedItem.price"
                type="number"
                placeholder="4500"
                variant="outlined"
                density="comfortable"
                class="editorial-input"
                suffix="DZD"
                required
              ></v-text-field>
            </v-col>

            <!-- Discount Price -->
            <v-col cols="12" sm="6">
              <label class="input-label">Promotional Price (DZD) (Optional)</label>
              <v-text-field
                v-model="editedItem.discountPrice"
                type="number"
                placeholder="3900"
                variant="outlined"
                density="comfortable"
                class="editorial-input"
                suffix="DZD"
              ></v-text-field>
            </v-col>

            <!-- Stock Quantity -->
            <v-col cols="12" sm="6">
              <label class="input-label">Available Stock Quantity *</label>
              <v-text-field
                v-model="editedItem.stockQuantity"
                type="number"
                placeholder="15"
                variant="outlined"
                density="comfortable"
                class="editorial-input"
                required
              ></v-text-field>
            </v-col>

            <!-- Main Image URL -->
            <v-col cols="12" sm="6">
              <label class="input-label">Image URL</label>
              <v-text-field
                v-model="editedItem.img"
                placeholder="https://..."
                variant="outlined"
                density="comfortable"
                class="editorial-input"
                prepend-inner-icon="mdi-image-outline"
              ></v-text-field>
            </v-col>

            <!-- Description -->
            <v-col cols="12">
              <label class="input-label">Detailed Product Description *</label>
              <v-textarea
                v-model="editedItem.description"
                placeholder="Describe material, dimensions, regional provenance, care instructions..."
                variant="outlined"
                density="comfortable"
                rows="4"
                class="editorial-input"
                required
              ></v-textarea>
            </v-col>

            <v-col cols="12">
              <div class="text-caption text-editorial-secondary bg-sand-light pa-3 rounded-lg">
                <v-icon icon="mdi-information-outline" size="16" class="me-1"></v-icon>
                <strong>Moderation Notice:</strong> New and modified listings are placed in <strong>Pending Review</strong> status for compliance verification by Touriva administration prior to being shown to public travelers.
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <div class="editorial-dialog-actions d-flex justify-end gap-2 pa-4 border-t">
          <v-btn variant="text" class="btn-editorial-sand px-4" @click="close">Cancel</v-btn>
          <v-btn class="btn-editorial-primary px-6" :loading="saving" @click="save">
            Submit for Review
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Modal -->
    <v-dialog v-model="dialogDelete" max-width="450px">
      <v-card class="editorial-dialog-card pa-6 text-center">
        <v-icon icon="mdi-alert-circle-outline" size="56" color="error" class="mb-3"></v-icon>
        <h3 class="text-h6 font-serif font-weight-bold text-deep-green mb-2">Delete Product</h3>
        <p class="text-caption text-editorial-secondary mb-6">
          Are you sure you want to permanently remove this product from your inventory? This action cannot be undone.
        </p>
        <div class="d-flex justify-center gap-3">
          <v-btn variant="outlined" class="btn-editorial-outline px-5" @click="dialogDelete = false">Cancel</v-btn>
          <v-btn color="error" class="px-5 font-weight-bold" :loading="loadingDelete" @click="deleteItemConfirm">Delete</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useSellerStore } from '@/stores/seller'

const sellerStore = useSellerStore()

const search = ref('')
const statusFilter = ref('all')
const loading = ref(false)
const saving = ref(false)
const loadingDelete = ref(false)
const dialog = ref(false)
const dialogDelete = ref(false)
const deleteId = ref(null)
const err = ref('')
const successMsg = ref('')

const editedIndex = ref(-1)
const defaultItem = {
  name: '',
  description: '',
  price: 0,
  discountPrice: null,
  stockQuantity: 10,
  img: ''
}
const editedItem = ref({ ...defaultItem })

const headers = ref([
  { title: 'Image', key: 'img', sortable: false, width: '70px' },
  { title: 'Product', key: 'name', sortable: true },
  { title: 'Price', key: 'price', sortable: true },
  { title: 'Stock', key: 'stockQuantity', sortable: true },
  { title: 'Moderation Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
])

const productsList = computed(() => sellerStore.getProducts || [])

const filteredProducts = computed(() => {
  let list = productsList.value
  if (statusFilter.value && statusFilter.value !== 'all') {
    list = list.filter(p => {
      const s = p.status || (p.published ? 'approved' : 'draft')
      return s === statusFilter.value
    })
  }
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(p => {
      const name = (p.name || '').toLowerCase()
      const desc = (p.description || '').toLowerCase()
      return name.includes(q) || desc.includes(q)
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

const getStatusBadgeClass = (status) => {
  const s = String(status).toLowerCase()
  if (s === 'approved') return 'status-badge-success'
  if (s === 'pending_review') return 'status-badge-warning'
  if (s === 'rejected' || s === 'suspended') return 'status-badge-error'
  return 'status-badge-sand'
}

const formatStatus = (status) => {
  const s = String(status).toLowerCase()
  if (s === 'approved') return 'Approved & Live'
  if (s === 'pending_review') return 'In Review'
  if (s === 'rejected') return 'Rejected'
  if (s === 'suspended') return 'Suspended'
  return 'Draft'
}

const openNewDialog = () => {
  editedIndex.value = -1
  editedItem.value = { ...defaultItem }
  dialog.value = true
}

const editItem = (item) => {
  const list = productsList.value
  editedIndex.value = list.indexOf(item)
  editedItem.value = {
    _id: item._id,
    name: item.name,
    description: item.description,
    price: item.price,
    discountPrice: item.discountPrice,
    stockQuantity: item.stockQuantity ?? 10,
    img: item.img || ''
  }
  dialog.value = true
}

const deleteItem = (item) => {
  deleteId.value = item._id
  dialogDelete.value = true
}

const deleteItemConfirm = async () => {
  loadingDelete.value = true
  try {
    await sellerStore.deleteProduct(deleteId.value)
    successMsg.value = 'Product deleted successfully'
    dialogDelete.value = false
  } catch (e) {
    err.value = e.message || 'Error deleting product'
  } finally {
    loadingDelete.value = false
  }
}

const close = () => {
  dialog.value = false
  nextTick(() => {
    editedItem.value = { ...defaultItem }
    editedIndex.value = -1
  })
}

const save = async () => {
  saving.value = true
  err.value = ''
  successMsg.value = ''
  try {
    const payload = {
      name: editedItem.value.name,
      description: editedItem.value.description,
      price: Number(editedItem.value.price),
      discountPrice: editedItem.value.discountPrice ? Number(editedItem.value.discountPrice) : undefined,
      stockQuantity: Number(editedItem.value.stockQuantity),
      img: editedItem.value.img
    }

    if (editedIndex.value > -1 && editedItem.value._id) {
      await sellerStore.updateProduct(editedItem.value._id, payload)
      successMsg.value = 'Product updated and submitted for moderation review!'
    } else {
      await sellerStore.addProduct(payload)
      successMsg.value = 'Product created and submitted for moderation review!'
    }
    close()
  } catch (e) {
    err.value = e.response?.data?.message || e.message || 'Error saving product'
  } finally {
    saving.value = false
  }
}

const initialize = async () => {
  loading.value = true
  try {
    await sellerStore.fetchProducts()
  } catch (e) {
    err.value = e.message || 'Error fetching products'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  initialize()
})
</script>
