<template>
  <div class="wilaya-manager">
    <!-- Error Alert -->
    <v-alert
      v-if="err"
      type="error"
      variant="tonal"
      density="comfortable"
      closable
      class="mb-4 rounded-lg"
      @click:close="err = ''"
    >
      {{ $t(err) }}
    </v-alert>

    <!-- Wilayas Card Container -->
    <v-card class="editorial-card overflow-hidden">
      <!-- Toolbar Header -->
      <div class="px-6 py-4 d-flex flex-wrap align-center justify-space-between border-b-editorial bg-white gap-3">
        <div class="d-flex align-center">
          <v-avatar size="38" color="sandLight" class="mr-3">
            <v-icon icon="mdi-map-marker-multiple-outline" color="sandDark" size="20"></v-icon>
          </v-avatar>
          <div>
            <h3 class="font-serif text-h6 font-weight-bold text-forest mb-0">
              {{ $t('Wilayas') }}
            </h3>
            <span class="text-caption text-secondary-editorial">
              {{ wilayas.getWilayas?.length || 0 }} {{ $t('provinces registered') }}
            </span>
          </div>
        </div>

        <div class="d-flex align-center gap-3">
          <!-- Search Field -->
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            :placeholder="$t('Search')"
            variant="outlined"
            density="compact"
            hide-details
            rounded="pill"
            color="primary"
            class="search-input"
            style="min-width: 220px;"
          ></v-text-field>

          <!-- Add Wilaya Button -->
          <v-btn
            class="btn-editorial-primary"
            rounded="pill"
            prepend-icon="mdi-plus"
            @click="openNewDialog"
          >
            {{ $t('Add Wilaya') }}
          </v-btn>
        </div>
      </div>

      <!-- Wilayas Data Table -->
      <v-data-table
        :headers="headers"
        :items="wilayas.getWilayas || []"
        :loading="!wilayas.getWilayas"
        :search="search"
        hover
        class="editorial-data-table"
      >
        <!-- Custom Table Headers -->
        <template v-slot:headers="{ columns }">
          <tr class="table-header-row">
            <template v-for="column in columns" :key="column.key">
              <th class="table-header-cell">
                {{ $t(column.text || column.title) }}
              </th>
            </template>
          </tr>
        </template>

        <!-- Wilaya Name Slot -->
        <template v-slot:[`item.name`]="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar size="32" color="sandLight" class="mr-3">
              <v-icon icon="mdi-map-marker-outline" color="forest" size="18"></v-icon>
            </v-avatar>
            <span class="font-weight-semibold text-forest text-body-2">{{ item.name }}</span>
          </div>
        </template>

        <!-- Actions Column -->
        <template v-slot:[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-end">
            <v-btn
              icon="mdi-pencil-outline"
              size="small"
              variant="text"
              color="primary"
              @click="editItem(item)"
              title="Edit Wilaya & Manage Daïras"
            ></v-btn>
            <v-btn
              icon="mdi-delete-outline"
              size="small"
              variant="text"
              color="error"
              @click="deleteItem(item)"
              title="Delete Wilaya"
            ></v-btn>
          </div>
        </template>

        <!-- Empty State -->
        <template v-slot:no-data>
          <div class="text-center py-10">
            <v-avatar size="56" color="sandLight" class="mb-3">
              <v-icon icon="mdi-map-marker-off-outline" color="sandDark" size="28"></v-icon>
            </v-avatar>
            <div class="font-serif font-weight-bold text-forest text-body-1 mb-1">{{ $t('No wilayas found') }}</div>
            <div class="text-caption text-secondary-editorial mb-4">{{ $t('No provinces registered or matching your filter.') }}</div>
            <v-btn
              variant="outlined"
              color="primary"
              rounded="pill"
              size="small"
              prepend-icon="mdi-refresh"
              @click="initialize"
            >
              {{ $t('Reset') }}
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create / Edit Wilaya Dialog -->
    <v-dialog v-model="dialog" max-width="900px" persistent scrollable>
      <v-card class="editorial-card overflow-hidden">
        <!-- Dialog Header -->
        <div class="dialog-header-editorial d-flex align-center justify-space-between px-6 py-4">
          <div class="d-flex align-center">
            <v-avatar size="36" color="sandLight" class="mr-3">
              <v-icon icon="mdi-map-marker" color="forest" size="20"></v-icon>
            </v-avatar>
            <h3 class="font-serif text-h6 font-weight-bold text-forest mb-0">
              {{ formTitle }}
            </h3>
          </div>
          <v-btn icon="mdi-close" variant="text" density="compact" @click="close"></v-btn>
        </div>

        <v-divider></v-divider>

        <!-- Dialog Body -->
        <v-card-text class="pa-6 bg-white" style="max-height: 75vh;">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="editedItem.name"
                :label="$t('Wilaya Name')"
                variant="outlined"
                density="comfortable"
                color="primary"
                required
              ></v-text-field>
            </v-col>

            <!-- Nested Daïra Management (in edit mode or with valid wilaya) -->
            <v-col cols="12" v-if="editedIndex > -1">
              <v-divider class="my-3"></v-divider>
              <div class="d-flex align-center mb-3">
                <span class="editorial-tag text-sand-dark mr-2">SUBDIVISIONS</span>
                <span class="font-serif font-weight-bold text-forest text-subtitle-1">Daïras in {{ editedItem.name }}</span>
              </div>
              <daira :dairasArray="dairaItems" :wilayaId="editedItem._id" />
            </v-col>
          </v-row>
        </v-card-text>

        <!-- Dialog Actions -->
        <v-divider></v-divider>
        <v-card-actions class="px-6 py-3 bg-white">
          <v-spacer></v-spacer>
          <v-btn variant="text" rounded="pill" class="px-5 font-weight-medium" @click="close">
            {{ $t('Cancel') }}
          </v-btn>
          <v-btn
            class="btn-editorial-primary px-6"
            rounded="pill"
            @click="save"
            :loading="loading"
          >
            {{ $t('Save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="dialogDelete" max-width="480px">
      <v-card class="editorial-card pa-6 text-center">
        <v-avatar size="56" color="sandLight" class="mb-4 mx-auto">
          <v-icon icon="mdi-alert-circle-outline" color="error" size="32"></v-icon>
        </v-avatar>
        <h3 class="font-serif text-h6 font-weight-bold text-forest mb-2">
          {{ $t('Confirm Deletion') }}
        </h3>
        <p class="text-caption text-secondary-editorial mb-6">
          {{ $t('Are you sure you want to delete this wilaya? All associated daïras and communes may be affected.') }}
        </p>
        <div class="d-flex justify-center gap-3">
          <v-btn variant="text" rounded="pill" class="px-5" @click="closeDelete">
            {{ $t('Cancel') }}
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            rounded="pill"
            class="px-6"
            @click="deleteItemConfirm"
            :loading="loadingDelete"
          >
            {{ $t('Delete') }}
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch } from 'vue'
import { useWilayasStore } from '@/stores/wilaya'
import { useDairasStore } from '@/stores/daira'
import daira from '@/components/daira.vue'

const wilayas = useWilayasStore()
const dairas = useDairasStore()

const search = ref('')
const dialog = ref(false)
const dialogDelete = ref(false)
const loadingDelete = ref(false)
const loading = ref(false)
const err = ref('')
const editedIndex = ref(-1)
const deleteId = ref(-1)

const headers = ref([
  { text: 'Name', value: 'name', align: 'start' },
  { text: 'Actions', value: 'actions', sortable: false, align: 'end' }
])

const editedItem = ref({
  name: ''
})

const defaultItem = ref({
  name: ''
})

const dairaItems = ref([])

const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'New Wilaya' : 'Edit Wilaya'
})

watch(dialog, (diaNew) => {
  if (!diaNew) close()
})

watch(dialogDelete, (dialogDelNew) => {
  if (!dialogDelNew) closeDelete()
})

onMounted(() => {
  initialize()
})

const initialize = () => {
  wilayas.fetchWilayas()
  dairas.fetchDairas()
}

const openNewDialog = () => {
  editedIndex.value = -1
  editedItem.value = Object.assign({}, defaultItem.value)
  dairaItems.value = []
  dialog.value = true
}

const editItem = (item) => {
  dairaItems.value = (dairas.getDairas || []).filter(e => e.wilayaId === item._id)
  editedIndex.value = (wilayas.getWilayas || []).indexOf(item)
  editedItem.value = Object.assign({}, item)
  dialog.value = true
}

const deleteItem = (item) => {
  editedIndex.value = (wilayas.getWilayas || []).indexOf(item)
  deleteId.value = item._id
  editedItem.value = Object.assign({}, item)
  dialogDelete.value = true
}

const deleteItemConfirm = async () => {
  loadingDelete.value = true
  try {
    await wilayas.deleteWilayas(deleteId.value)
    if (Array.isArray(wilayas.wilayas) && editedIndex.value > -1) {
      wilayas.wilayas.splice(editedIndex.value, 1)
    }
    await initialize()
    closeDelete()
  } catch (e) {
    err.value = e?.message || 'Error deleting wilaya'
  } finally {
    loadingDelete.value = false
  }
}

const close = () => {
  dialog.value = false
  nextTick(() => {
    editedItem.value = Object.assign({}, defaultItem.value)
    editedIndex.value = -1
    dairaItems.value = []
  })
}

const closeDelete = () => {
  dialogDelete.value = false
  nextTick(() => {
    editedItem.value = Object.assign({}, defaultItem.value)
    editedIndex.value = -1
  })
}

const save = async () => {
  if (!editedItem.value.name) return
  loading.value = true
  err.value = ''
  try {
    if (editedIndex.value > -1) {
      // Edit wilaya - Audit Item 7 fix: call editWilayas instead of editUsers
      await wilayas.editWilayas(editedItem.value)
      if (Array.isArray(wilayas.wilayas) && wilayas.wilayas[editedIndex.value]) {
        Object.assign(wilayas.wilayas[editedIndex.value], editedItem.value)
      }
    } else {
      // Create wilaya - Audit Item 7 fix: call addWilayas instead of createUser
      await wilayas.addWilayas(editedItem.value)
    }
    await initialize()
    close()
  } catch (e) {
    err.value = e?.message || 'Error saving wilaya'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}

.dialog-header-editorial {
  background-color: var(--color-warm-ivory);
  border-bottom: 1px solid var(--color-border);
}

.table-header-row {
  background-color: var(--color-warm-ivory) !important;
}

.table-header-cell {
  color: var(--color-forest) !important;
  font-family: var(--font-body);
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 14px 16px !important;
  border-bottom: 1px solid var(--color-border) !important;
}
</style>