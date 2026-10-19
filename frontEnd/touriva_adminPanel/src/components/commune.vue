<template>
  <div class="commune-manager mt-2">
    <!-- Error Alert -->
    <v-alert
      v-if="err"
      type="error"
      variant="tonal"
      density="comfortable"
      closable
      class="mb-3 rounded-lg"
      @click:close="err = ''"
    >
      {{ $t(err) }}
    </v-alert>

    <!-- Communes Table Card -->
    <v-card class="editorial-card border-editorial overflow-hidden">
      <!-- Toolbar Header -->
      <div class="px-4 py-3 d-flex flex-wrap align-center justify-space-between border-b-editorial bg-white gap-2">
        <div class="d-flex align-center">
          <v-avatar size="32" color="sandLight" class="mr-2">
            <v-icon icon="mdi-home-city-outline" color="sandDark" size="18"></v-icon>
          </v-avatar>
          <span class="font-serif font-weight-bold text-forest text-body-1">{{ $t('Communes') }}</span>
          <v-chip size="x-small" color="sandLight" text-color="sandDark" class="ml-2 font-weight-bold">
            {{ displayItems.length }}
          </v-chip>
        </div>

        <div class="d-flex align-center gap-2">
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
            style="min-width: 180px;"
          ></v-text-field>

          <!-- Add Commune Button -->
          <v-btn
            class="btn-editorial-primary"
            rounded="pill"
            size="small"
            prepend-icon="mdi-plus"
            @click="openNewDialog"
          >
            {{ $t('Add Commune') }}
          </v-btn>
        </div>
      </div>

      <!-- Communes Data Table -->
      <v-data-table
        :headers="headers"
        :items="displayItems"
        :loading="loadingTab"
        :search="search"
        hover
        density="comfortable"
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

        <!-- Commune Name -->
        <template v-slot:[`item.name`]="{ item }">
          <div class="d-flex align-center py-1">
            <v-icon icon="mdi-map-marker-radius-outline" size="16" color="forest" class="mr-2"></v-icon>
            <span class="font-weight-medium text-forest text-body-2">{{ item.name }}</span>
          </div>
        </template>

        <!-- Actions Column -->
        <template v-slot:[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-end">
            <v-btn
              icon="mdi-pencil-outline"
              size="x-small"
              variant="text"
              color="primary"
              @click="editItem(item)"
              title="Edit Commune"
            ></v-btn>
            <v-btn
              icon="mdi-delete-outline"
              size="x-small"
              variant="text"
              color="error"
              @click="deleteItem(item)"
              title="Delete Commune"
            ></v-btn>
          </div>
        </template>

        <!-- Empty State -->
        <template v-slot:no-data>
          <div class="text-center py-6">
            <div class="text-caption text-secondary-editorial mb-2">{{ $t('No communes registered for this daïra.') }}</div>
            <v-btn
              variant="text"
              color="primary"
              size="x-small"
              prepend-icon="mdi-refresh"
              @click="initialize"
            >
              {{ $t('Refresh') }}
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create / Edit Commune Dialog -->
    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card class="editorial-card overflow-hidden">
        <!-- Dialog Header -->
        <div class="dialog-header-editorial d-flex align-center justify-space-between px-6 py-4">
          <div class="d-flex align-center">
            <v-avatar size="36" color="sandLight" class="mr-3">
              <v-icon icon="mdi-home-city" color="forest" size="20"></v-icon>
            </v-avatar>
            <h3 class="font-serif text-h6 font-weight-bold text-forest mb-0">
              {{ formTitle }}
            </h3>
          </div>
          <v-btn icon="mdi-close" variant="text" density="compact" @click="close"></v-btn>
        </div>

        <v-divider></v-divider>

        <!-- Dialog Body -->
        <v-card-text class="pa-6 bg-white">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="editedItem.name"
                :label="$t('Commune Name')"
                variant="outlined"
                density="comfortable"
                color="primary"
                required
              ></v-text-field>
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
    <v-dialog v-model="dialogDelete" max-width="450px">
      <v-card class="editorial-card pa-6 text-center">
        <v-avatar size="52" color="sandLight" class="mb-3 mx-auto">
          <v-icon icon="mdi-alert-circle-outline" color="error" size="28"></v-icon>
        </v-avatar>
        <h3 class="font-serif text-h6 font-weight-bold text-forest mb-2">
          {{ $t('Confirm Deletion') }}
        </h3>
        <p class="text-caption text-secondary-editorial mb-5">
          {{ $t('Are you sure you want to delete this commune?') }}
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
import { useCommunesStore } from '@/stores/commune'

const communes = useCommunesStore()

const props = defineProps({
  communesArray: {
    type: Array,
    default: () => []
  },
  dairaId: {
    type: String,
    default: ''
  }
})

const search = ref('')
const dialog = ref(false)
const dialogDelete = ref(false)
const loadingDelete = ref(false)
const loading = ref(false)
const loadingTab = ref(false)
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

const displayItems = computed(() => {
  if (props.communesArray && props.communesArray.length > 0) {
    return props.communesArray
  }
  if (props.dairaId && communes.getCommunes) {
    return communes.getCommunes.filter(e => e.dairaId === props.dairaId)
  }
  return communes.getCommunes || []
})

const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'New Commune' : 'Edit Commune'
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
  communes.fetchCommunes()
}

const openNewDialog = () => {
  editedIndex.value = -1
  editedItem.value = Object.assign({}, defaultItem.value)
  if (props.dairaId) {
    editedItem.value.dairaId = props.dairaId
  }
  dialog.value = true
}

const editItem = (item) => {
  editedIndex.value = displayItems.value.indexOf(item)
  editedItem.value = Object.assign({}, item)
  dialog.value = true
}

const deleteItem = (item) => {
  editedIndex.value = displayItems.value.indexOf(item)
  deleteId.value = item._id
  editedItem.value = Object.assign({}, item)
  dialogDelete.value = true
}

const deleteItemConfirm = async () => {
  loadingDelete.value = true
  try {
    // Audit Item 7 fix: call deleteCommunes instead of deleteUsers
    await communes.deleteCommunes(deleteId.value)
    if (Array.isArray(communes.communes) && editedIndex.value > -1) {
      const idx = communes.communes.findIndex(c => c._id === deleteId.value)
      if (idx > -1) communes.communes.splice(idx, 1)
    }
    await initialize()
    closeDelete()
  } catch (e) {
    err.value = e?.message || 'Error deleting commune'
  } finally {
    loadingDelete.value = false
  }
}

const close = () => {
  dialog.value = false
  nextTick(() => {
    editedItem.value = Object.assign({}, defaultItem.value)
    editedIndex.value = -1
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
    if (props.dairaId && !editedItem.value.dairaId) {
      editedItem.value.dairaId = props.dairaId
    }

    if (editedIndex.value > -1) {
      // Edit commune - Audit Item 7 fix: call editCommunes instead of editUsers
      await communes.editCommunes(editedItem.value)
      if (Array.isArray(communes.communes)) {
        const idx = communes.communes.findIndex(c => c._id === editedItem.value._id)
        if (idx > -1) Object.assign(communes.communes[idx], editedItem.value)
      }
    } else {
      // Create commune - Audit Item 7 fix: call addCommunes instead of createUser
      await communes.addCommunes(editedItem.value)
    }
    await initialize()
    close()
  } catch (e) {
    err.value = e?.message || 'Error saving commune'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
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
  font-size: 0.72rem !important;
  font-weight: 700 !important;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 10px 14px !important;
  border-bottom: 1px solid var(--color-border) !important;
}
</style>