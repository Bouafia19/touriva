<template>
  <v-container fluid class="px-4 px-md-8 py-6">
    <!-- Editorial Page Header -->
    <div class="editorial-page-header">
      <div>
        <div class="editorial-tag mb-1">Catalog Structure</div>
        <h1 class="editorial-page-title">Brand Directory</h1>
        <p class="editorial-page-subtitle">Manage partner labels, manufacturer brands, and vendor collections.</p>
      </div>

      <div class="d-flex align-center gap-2">
        <v-btn
          class="btn-editorial-primary px-5"
          prepend-icon="mdi-plus"
          @click="openNewDialog"
        >
          {{ $t('New') || 'New Brand' }}
        </v-btn>
      </div>
    </div>

    <!-- Alert -->
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
      <div class="pa-4 bg-white d-flex align-center justify-space-between flex-wrap gap-3 border-b">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          :placeholder="$t('Search') + ' brands...'"
          variant="outlined"
          density="compact"
          hide-details
          rounded="pill"
          style="min-width: 280px; max-width: 400px;"
          class="editorial-search-input"
        ></v-text-field>

        <v-btn
          icon="mdi-refresh"
          variant="text"
          density="comfortable"
          color="forestGreen"
          @click="initialize"
          title="Refresh"
        ></v-btn>
      </div>

      <v-data-table
        :headers="headers"
        :items="brands.getBrands || []"
        :loading="!brands.getBrands"
        :search="search"
        class="editorial-table"
      >
        <template v-slot:[`item.name`]="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar size="36" class="me-3 bg-sand-light border-editorial flex-shrink-0">
              <v-icon icon="mdi-tag-outline" color="forestGreen" size="18"></v-icon>
            </v-avatar>
            <span class="font-weight-bold text-deep-green">{{ item.name }}</span>
          </div>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-end gap-1">
            <v-btn
              icon="mdi-pencil-outline"
              size="small"
              variant="text"
              color="forestGreen"
              @click="editItem(item)"
              title="Edit brand"
            ></v-btn>
            <v-btn
              icon="mdi-delete-outline"
              size="small"
              variant="text"
              color="error"
              @click="deleteItem(item)"
              title="Delete brand"
            ></v-btn>
          </div>
        </template>

        <template v-slot:no-data>
          <div class="text-center py-12 px-4">
            <v-icon icon="mdi-tag-outline" size="48" color="sand" class="mb-2"></v-icon>
            <div class="text-subtitle-1 font-weight-medium text-deep-green">No Brands Configured</div>
            <p class="text-caption text-editorial-secondary mb-3">Add merchandise labels to associate with catalog items.</p>
            <v-btn class="btn-editorial-primary px-4" size="small" @click="openNewDialog">
              Add First Brand
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Edit / Add Brand Modal -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card class="editorial-dialog-card">
        <div class="editorial-dialog-header">
          <span class="dialog-title font-serif">{{ formTitle }}</span>
          <v-btn icon="mdi-close" variant="text" density="compact" color="white" @click="close"></v-btn>
        </div>

        <v-card-text class="pa-5">
          <div class="mb-3">
            <label class="text-caption font-weight-bold text-deep-green d-block mb-1">Brand Name</label>
            <v-text-field
              v-model="editedItem.name"
              placeholder="e.g. Saharan Heritage, Atlas Crafts"
              variant="outlined"
              density="comfortable"
              class="editorial-input"
              required
            ></v-text-field>
          </div>
        </v-card-text>

        <div class="editorial-dialog-actions d-flex justify-end gap-2">
          <v-btn class="btn-editorial-ghost px-4" @click="close">Cancel</v-btn>
          <v-btn class="btn-editorial-primary px-6" :loading="loading" @click="save">Save Brand</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Delete Modal -->
    <v-dialog v-model="dialogDelete" max-width="450px">
      <v-card class="editorial-dialog-card">
        <div class="editorial-dialog-header">
          <span class="dialog-title font-serif">Confirm Deletion</span>
          <v-btn icon="mdi-close" variant="text" density="compact" color="white" @click="closeDelete"></v-btn>
        </div>
        <v-card-text class="pa-5 text-center">
          <v-icon icon="mdi-alert-circle-outline" color="warning" size="48" class="mb-3"></v-icon>
          <div class="text-body-1 font-weight-medium">Are you sure you want to delete this brand?</div>
          <div class="text-caption text-editorial-secondary mt-1">Products linked to this brand will need reassignment.</div>
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
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useBrandsStore } from '@/stores/brands'

const brands = useBrandsStore()

const search = ref('')
const dialog = ref(false)
const dialogDelete = ref(false)
const loading = ref(false)
const loadingDelete = ref(false)
const err = ref('')
const editedIndex = ref(-1)
const deleteId = ref(null)

const headers = ref([
  { title: 'Brand Name', key: 'name', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
])

const defaultItem = {
  name: ''
}

const editedItem = ref(Object.assign({}, defaultItem))

const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'Add New Brand' : 'Edit Brand'
})

watch(dialog, (val) => {
  if (!val) close()
})

watch(dialogDelete, (val) => {
  if (!val) closeDelete()
})

const initialize = () => {
  brands.fetchBrands()
}

const openNewDialog = () => {
  editedIndex.value = -1
  editedItem.value = Object.assign({}, defaultItem)
  dialog.value = true
}

const editItem = (item) => {
  const list = brands.getBrands || []
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
  brands.deleteBrands(deleteId.value).then(() => {
    initialize()
    loadingDelete.value = false
    closeDelete()
  }).catch((e) => {
    loadingDelete.value = false
    err.value = e.message || 'Error deleting brand'
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
    brands.editBrands(editedItem.value).then(() => {
      loading.value = false
      close()
      initialize()
    }).catch((e) => {
      loading.value = false
      err.value = e.message || 'Error updating brand'
    })
  } else {
    brands.addBrands(editedItem.value).then(() => {
      loading.value = false
      close()
      initialize()
    }).catch((e) => {
      loading.value = false
      err.value = e.message || 'Error adding brand'
    })
  }
}

onMounted(() => {
  initialize()
})
</script>