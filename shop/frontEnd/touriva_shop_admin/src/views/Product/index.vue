<template>
  <v-container fluid class="px-4 px-md-8 py-6">
    <!-- Editorial Page Header -->
    <div class="editorial-page-header">
      <div>
        <div class="editorial-tag mb-1">Catalog Management</div>
        <h1 class="editorial-page-title">Products Catalog</h1>
        <p class="editorial-page-subtitle">Curate and manage your merchandise inventory, pricing, and visual assets.</p>
      </div>

      <div class="d-flex align-center gap-2 flex-wrap">
        <v-btn
          class="btn-editorial-primary px-5"
          prepend-icon="mdi-plus"
          @click="openNewDialog"
        >
          {{ $t('New') || 'Add Product' }}
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
      <!-- Table Controls Toolbar -->
      <div class="pa-4 bg-white d-flex align-center justify-space-between flex-wrap gap-3 border-b">
        <div class="d-flex align-center">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            :placeholder="$t('Search') + ' products by title or code...'"
            variant="outlined"
            density="compact"
            hide-details
            rounded="pill"
            style="min-width: 280px; max-width: 400px;"
            class="editorial-search-input"
          ></v-text-field>
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
        :items="products.getProducts || []"
        :loading="products.loading"
        :search="search"
        class="editorial-table"
      >
        <!-- Product Image Preview -->
        <template v-slot:[`item.img`]="{ item }">
          <v-avatar rounded="lg" size="48" class="my-1 bg-sand-light border-editorial flex-shrink-0">
            <v-img v-if="item.img" :src="item.img" cover></v-img>
            <v-icon v-else icon="mdi-image-outline" color="sandDark" size="24"></v-icon>
          </v-avatar>
        </template>

        <!-- Product Code -->
        <template v-slot:[`item.code`]="{ item }">
          <span class="font-weight-medium text-deep-green">{{ item.code || '—' }}</span>
        </template>

        <!-- Product Name & Description -->
        <template v-slot:[`item.name`]="{ item }">
          <div>
            <div class="font-weight-bold text-deep-green">{{ item.name }}</div>
            <div class="text-caption text-editorial-secondary text-truncate" style="max-width: 280px;">
              {{ item.description || '' }}
            </div>
          </div>
        </template>

        <!-- Price -->
        <template v-slot:[`item.price`]="{ item }">
          <span class="font-weight-bold text-forest">
            {{ formatPrice(item.price) }}
          </span>
        </template>

        <!-- Brand -->
        <template v-slot:[`item.brandId`]="{ item }">
          <span class="text-caption font-weight-medium">
            {{ getBrandName(item.brandId) }}
          </span>
        </template>

        <!-- Category -->
        <template v-slot:[`item.categoryId`]="{ item }">
          <span class="text-caption font-weight-medium">
            {{ getCategoryName(item.categoryId) }}
          </span>
        </template>

        <!-- Published Status Badge -->
        <template v-slot:[`item.published`]="{ item }">
          <span :class="['status-badge', item.published ? 'status-badge-success' : 'status-badge-neutral']">
            <span class="status-badge-dot"></span>
            {{ item.published ? 'Published' : 'Draft' }}
          </span>
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
            <div class="text-subtitle-1 font-weight-medium text-deep-green">No Products Found</div>
            <p class="text-caption text-editorial-secondary mb-4">Start creating merchandise items to populate your shop catalog.</p>
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
          <span class="dialog-title font-serif">{{ formTitle }}</span>
          <v-btn icon="mdi-close" variant="text" density="compact" color="white" @click="close"></v-btn>
        </div>

        <v-card-text class="pa-5">
          <v-row>
            <!-- Code Generator -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editedItem.code"
                :label="$t('Code') || 'Product Code'"
                variant="outlined"
                density="comfortable"
                class="editorial-input"
                append-inner-icon="mdi-qrcode-scan"
                @click:append-inner="generateCode"
                hint="Click icon to auto-generate code"
                persistent-hint
              ></v-text-field>
            </v-col>

            <!-- Product Name -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editedItem.name"
                :label="$t('Name') || 'Product Title'"
                variant="outlined"
                density="comfortable"
                class="editorial-input"
              ></v-text-field>
            </v-col>

            <!-- Price -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editedItem.price"
                :label="$t('Price') || 'Price (DZD)'"
                type="number"
                variant="outlined"
                density="comfortable"
                class="editorial-input"
              ></v-text-field>
            </v-col>

            <!-- Brand Selection -->
            <v-col cols="12" sm="6">
              <v-autocomplete
                v-model="editedItem.brandId"
                :items="brands.getBrands || []"
                item-title="name"
                item-value="_id"
                :label="$t('Brands') || 'Brand'"
                variant="outlined"
                density="comfortable"
                class="editorial-input"
                clearable
              ></v-autocomplete>
            </v-col>

            <!-- Description -->
            <v-col cols="12">
              <v-textarea
                v-model="editedItem.description"
                :label="$t('Description') || 'Product Description'"
                rows="3"
                variant="outlined"
                density="comfortable"
                class="editorial-input"
              ></v-textarea>
            </v-col>

            <!-- Category Selector -->
            <v-col cols="12" sm="6">
              <label class="text-caption font-weight-bold text-deep-green d-block mb-1">Product Category</label>
              <select v-model="editedItem.categoryId" class="editorial-select-box">
                <option :value="null">Root Category</option>
                <CategoryOption v-for="cat in categories" :key="cat._id" :category="cat" />
              </select>
            </v-col>

            <!-- Published Switch -->
            <v-col cols="12" sm="6" class="d-flex align-center">
              <v-switch
                v-model="editedItem.published"
                color="forestGreen"
                :label="editedItem.published ? 'Live in Store' : 'Draft / Unpublished'"
                hide-details
                inset
              ></v-switch>
            </v-col>

            <!-- Main Image Upload & Preview -->
            <v-col cols="12" sm="6">
              <v-file-input
                v-model="imageFile"
                accept="image/*"
                :label="$t('Photo') || 'Main Product Image'"
                variant="outlined"
                density="comfortable"
                prepend-icon=""
                prepend-inner-icon="mdi-camera"
                class="editorial-input"
                @change="onImageFileChange"
              ></v-file-input>

              <div class="mt-2 text-center" v-if="editedItem.img">
                <div class="image-preview-container">
                  <v-img :src="editedItem.img" height="150" contain class="rounded-lg"></v-img>
                </div>
              </div>
            </v-col>

            <!-- Thumbnails Upload & Gallery -->
            <v-col cols="12" sm="6">
              <v-file-input
                v-model="thumbnailFile"
                accept="image/*"
                :label="$t('UploadThumbnails') || 'Add Gallery Thumbnail'"
                variant="outlined"
                density="comfortable"
                prepend-icon=""
                prepend-inner-icon="mdi-image-multiple"
                class="editorial-input"
                @change="handleThumbnailUpload"
              ></v-file-input>

              <div class="d-flex flex-wrap gap-2 mt-2" v-if="editedItem.thumbnails?.length">
                <div
                  v-for="(thumb, idx) in editedItem.thumbnails"
                  :key="idx"
                  class="thumbnail-wrapper"
                  @click="removeThumbnail(idx)"
                  title="Click to remove"
                >
                  <v-img :src="thumb" width="48" height="48" cover class="rounded"></v-img>
                  <v-icon icon="mdi-close" size="14" class="thumbnail-remove-icon"></v-icon>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <div class="editorial-dialog-actions d-flex justify-end gap-2">
          <v-btn class="btn-editorial-ghost px-4" @click="close">
            {{ $t('Cancel') || 'Cancel' }}
          </v-btn>
          <v-btn class="btn-editorial-primary px-6" :loading="loading" @click="save">
            {{ $t('Save') || 'Save Product' }}
          </v-btn>
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
          <div class="text-body-1 font-weight-medium">Are you sure you want to delete this product?</div>
          <div class="text-caption text-editorial-secondary mt-1">This catalog item will be removed from store listings.</div>
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
import { useProductsStore } from '@/stores/products'
import { useBrandsStore } from '@/stores/brands'
import CategoryOption from '@/components/CategoryOption.vue'
import axios from 'axios'

const products = useProductsStore()
const brands = useBrandsStore()

const search = ref('')
const dialog = ref(false)
const dialogDelete = ref(false)
const loading = ref(false)
const loadingDelete = ref(false)
const err = ref('')
const editedIndex = ref(-1)
const deleteId = ref(null)
const imageFile = ref(null)
const thumbnailFile = ref(null)
const categories = ref([])

const headers = ref([
  { title: 'Image', key: 'img', sortable: false, width: '70px' },
  { title: 'Code', key: 'code', align: 'start', sortable: true },
  { title: 'Title & Details', key: 'name', align: 'start', sortable: true },
  { title: 'Price', key: 'price', sortable: true },
  { title: 'Brand', key: 'brandId', sortable: false },
  { title: 'Category', key: 'categoryId', sortable: false },
  { title: 'Status', key: 'published', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
])

const defaultItem = {
  code: '',
  name: '',
  price: '',
  description: '',
  img: '',
  categoryId: null,
  brandId: null,
  published: true,
  thumbnails: []
}

const editedItem = ref(Object.assign({}, defaultItem))

const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'Add New Product' : 'Edit Product'
})

watch(dialog, (val) => {
  if (!val) close()
})

watch(dialogDelete, (val) => {
  if (!val) closeDelete()
})

const initialize = () => {
  products.fetchProducts()
  brands.fetchBrands()
  fetchCategories()
}

const fetchCategories = async () => {
  try {
    const response = await axios.post('/api/categories/nested')
    categories.value = response.data || []
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

const getBrandName = (brandId) => {
  if (!brandId) return '—'
  if (typeof brandId === 'object' && brandId.name) return brandId.name
  const found = (brands.getBrands || []).find(b => b._id === brandId)
  return found ? found.name : '—'
}

const getCategoryName = (catId) => {
  if (!catId) return '—'
  if (typeof catId === 'object' && catId.name) return catId.name
  return 'Category'
}

const formatPrice = (val) => {
  const num = Number(val) || 0
  return new Intl.NumberFormat('en-DZ', {
    style: 'currency',
    currency: 'DZD',
    maximumFractionDigits: 0
  }).format(num)
}

const generateCode = () => {
  const count = (products.getProducts || []).length + 1
  const str = String(count).padStart(5, '0')
  editedItem.value.code = 'PRD-' + str
}

const onImageFileChange = (e) => {
  const file = imageFile.value?.[0] || imageFile.value
  if (!file) return
  const reader = new FileReader()
  reader.onload = (event) => {
    editedItem.value.img = event.target.result
  }
  reader.readAsDataURL(file)
}

const handleThumbnailUpload = (e) => {
  const file = thumbnailFile.value?.[0] || thumbnailFile.value
  if (!file) return
  const reader = new FileReader()
  reader.onload = (event) => {
    if (!editedItem.value.thumbnails) editedItem.value.thumbnails = []
    editedItem.value.thumbnails.push(event.target.result)
    thumbnailFile.value = null
  }
  reader.readAsDataURL(file)
}

const removeThumbnail = (index) => {
  if (editedItem.value.thumbnails) {
    editedItem.value.thumbnails.splice(index, 1)
  }
}

const openNewDialog = () => {
  editedIndex.value = -1
  editedItem.value = Object.assign({}, defaultItem)
  editedItem.value.thumbnails = []
  imageFile.value = null
  thumbnailFile.value = null
  dialog.value = true
}

const editItem = (item) => {
  const list = products.getProducts || []
  editedIndex.value = list.indexOf(item)
  editedItem.value = JSON.parse(JSON.stringify(item))
  if (!editedItem.value.thumbnails) editedItem.value.thumbnails = []
  imageFile.value = null
  thumbnailFile.value = null
  dialog.value = true
}

const deleteItem = (item) => {
  const list = products.getProducts || []
  editedIndex.value = list.indexOf(item)
  deleteId.value = item._id
  dialogDelete.value = true
}

const deleteItemConfirm = () => {
  loadingDelete.value = true
  products.deleteProducts(deleteId.value).then(() => {
    initialize()
    loadingDelete.value = false
    closeDelete()
  }).catch((e) => {
    loadingDelete.value = false
    err.value = e.message
    closeDelete()
  })
}

const close = () => {
  dialog.value = false
  nextTick(() => {
    editedItem.value = Object.assign({}, defaultItem)
    editedItem.value.thumbnails = []
    editedIndex.value = -1
    imageFile.value = null
    thumbnailFile.value = null
  })
}

const closeDelete = () => {
  dialogDelete.value = false
  nextTick(() => {
    deleteId.value = null
    editedIndex.value = -1
  })
}

const save = () => {
  loading.value = true
  err.value = ''
  if (editedIndex.value > -1) {
    products.editProducts(editedItem.value).then(() => {
      loading.value = false
      close()
      initialize()
    }).catch((e) => {
      loading.value = false
      err.value = e.message || 'Error updating product'
    })
  } else {
    products.addProducts(editedItem.value).then(() => {
      loading.value = false
      close()
      initialize()
    }).catch((e) => {
      loading.value = false
      err.value = e.message || 'Error creating product'
    })
  }
}

onMounted(() => {
  initialize()
})
</script>

<style scoped>
.editorial-select-box {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: #FFFFFF;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 0.88rem;
  color: var(--color-text-primary);
  width: 100%;
  height: 48px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s ease;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23173F35'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 18px;
}

.editorial-select-box:focus {
  border-color: var(--color-emerald);
}

.image-preview-container {
  padding: 8px;
  background-color: var(--color-warm-ivory);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.thumbnail-wrapper {
  position: relative;
  cursor: pointer;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  overflow: hidden;
}

.thumbnail-wrapper:hover {
  border-color: var(--color-error);
}

.thumbnail-remove-icon {
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(194, 69, 69, 0.85);
  color: white;
  border-radius: 50%;
  padding: 1px;
}
</style>