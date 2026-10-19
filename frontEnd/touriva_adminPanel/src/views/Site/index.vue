<template>
  <v-container fluid class="pa-6 site-management-page">
    <!-- Editorial Page Header -->
    <div class="editorial-section-header d-flex flex-wrap align-center justify-space-between mb-6">
      <div>
        <span class="editorial-tag">{{ $t('Tourism') }} • {{ $t('Sites') }}</span>
        <h1 class="editorial-title">{{ $t('Sites') }}</h1>
        <p class="editorial-subtitle">
          Heritage landmarks, archaeological ruins, nature reserves and cultural attractions
        </p>
      </div>

      <div class="d-flex align-center mt-3 mt-sm-0">
        <v-btn
          class="btn-editorial-primary"
          prepend-icon="mdi-plus-circle"
          @click="openCreateDialog"
        >
          {{ $t('NewSite') }}
        </v-btn>
      </div>
    </div>

    <!-- Error Alert -->
    <v-alert
      v-if="err"
      type="error"
      variant="tonal"
      closable
      class="mb-4 rounded-lg"
      @click:close="err = ''"
    >
      {{ $t(err) }}
    </v-alert>

    <!-- Data Table Card Container -->
    <v-card class="admin-card overflow-hidden">
      <!-- Table Controls Bar -->
      <div class="pa-4 pa-sm-5 border-bottom d-flex flex-wrap align-center justify-space-between gap-3">
        <div style="max-width: 380px; width: 100%;">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            :label="$t('Search') + ' ' + $t('Sites') + '...'"
            single-line
            hide-details
            density="compact"
            variant="outlined"
            rounded="pill"
            color="primary"
            bg-color="warmIvory"
            clearable
          ></v-text-field>
        </div>

        <div class="d-flex align-center gap-2">
          <v-chip size="small" color="primary" variant="tonal" class="font-weight-bold">
            {{ sites.getSites?.length || 0 }} {{ $t('Sites') }}
          </v-chip>
          <v-btn
            icon="mdi-refresh"
            size="small"
            variant="text"
            color="primary"
            @click="initialize"
            :loading="!sites.getSites"
            title="Refresh sites"
          ></v-btn>
        </div>
      </div>

      <!-- Sites Data Table -->
      <v-data-table
        :headers="headers"
        :items="sites.getSites || []"
        :loading="!sites.getSites"
        :search="search"
        hover
        class="editorial-data-table"
      >
        <!-- Custom Table Headers -->
        <template v-slot:headers="{ columns, isSorted, getSortIcon, toggleSort }">
          <tr class="table-header-row">
            <template v-for="column in columns" :key="column.key">
              <th class="table-header-cell">
                {{ $t(column.text) }}
              </th>
            </template>
          </tr>
        </template>

        <!-- Site Name & Photo -->
        <template v-slot:[`item.name`]="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar size="44" rounded="lg" color="sandLight" class="mr-3 overflow-hidden border-editorial">
              <v-img v-if="isValidPhoto(item.photo)" :src="item.photo" cover></v-img>
              <v-icon v-else icon="mdi-pillar" color="forestGreen" size="22"></v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-bold text-forest text-body-2">{{ item.name }}</div>
              <div class="text-caption text-secondary-editorial">{{ item.address || 'Algeria' }}</div>
            </div>
          </div>
        </template>

        <!-- Rating Column -->
        <template v-slot:[`item.rating`]="{ item }">
          <div class="d-flex align-center">
            <v-icon icon="mdi-star" size="16" color="warning" class="mr-1"></v-icon>
            <span class="font-weight-semibold text-body-2 text-forest">
              {{ item.rating ? Number(item.rating).toFixed(1) : '5.0' }}
            </span>
          </div>
        </template>

        <!-- Status Column -->
        <template v-slot:[`item.status`]="{ item }">
          <span
            v-if="!item.googleId"
            class="status-badge"
            :class="{
              'success': item.status === 'published',
              'warning': item.status === 'pending',
              'error': item.status === 'rejected'
            }"
          >
            <v-icon
              :icon="item.status === 'published' ? 'mdi-check-circle' : (item.status === 'pending' ? 'mdi-clock-outline' : 'mdi-close-circle')"
              size="12"
            ></v-icon>
            {{ item.status === 'published' ? $t('published') : (item.status === 'pending' ? $t('pendingStatus') : $t('rejected')) }}
          </span>
          <v-chip v-else size="x-small" variant="outlined" color="info">Google Verified</v-chip>
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
              title="Edit Site"
            ></v-btn>
            <v-btn
              icon="mdi-delete-outline"
              size="small"
              variant="text"
              color="error"
              @click="deleteItem(item)"
              title="Delete Site"
            ></v-btn>
          </div>
        </template>

        <!-- Empty State -->
        <template v-slot:no-data>
          <div class="text-center py-10">
            <v-avatar size="56" color="sandLight" class="mb-3">
              <v-icon icon="mdi-map-marker-off-outline" color="sandDark" size="28"></v-icon>
            </v-avatar>
            <div class="font-serif font-weight-bold text-forest text-body-1 mb-1">No sites found</div>
            <div class="text-caption text-secondary-editorial mb-4">No tourism sites registered or matching your filter.</div>
            <v-btn class="btn-editorial-primary px-5" size="small" @click="initialize">
              {{ $t('Reset') }}
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create / Edit Site Dialog -->
    <v-dialog v-model="dialog" max-width="680px" persistent scrollable>
      <v-card class="editorial-card rounded-xl overflow-hidden">
        <!-- Dialog Header -->
        <div class="px-6 py-4 bg-forest-green text-white d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-avatar size="34" color="rgba(255,255,255,0.15)" class="mr-3">
              <v-icon icon="mdi-map-marker-radius-outline" color="sand" size="18"></v-icon>
            </v-avatar>
            <div>
              <div class="font-serif text-h6 font-weight-bold">{{ formTitle }}</div>
              <div class="text-caption text-sand">{{ editedItem.name || 'Site Registry' }}</div>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" color="white" @click="close"></v-btn>
        </div>

        <!-- Dialog Body -->
        <v-card-text class="pa-6 bg-white" style="max-height: 70vh;">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="editedItem.name"
                label="Site Name"
                variant="outlined"
                density="comfortable"
                color="primary"
                required
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="4">
              <v-autocomplete
                v-model="editedItem.wilayaId"
                :items="wilaya.getWilayas || []"
                label="Wilaya"
                item-title="name"
                item-value="_id"
                variant="outlined"
                density="comfortable"
                color="primary"
                @update:modelValue="updateDaira"
              ></v-autocomplete>
            </v-col>

            <v-col cols="12" md="4">
              <v-autocomplete
                v-model="editedItem.dairaId"
                :items="dairaItems"
                label="Daira"
                item-title="name"
                item-value="_id"
                variant="outlined"
                density="comfortable"
                color="primary"
                @update:modelValue="updateCommune"
              ></v-autocomplete>
            </v-col>

            <v-col cols="12" md="4">
              <v-autocomplete
                v-model="editedItem.communeId"
                :items="communeItems"
                label="Commune"
                item-title="name"
                item-value="_id"
                variant="outlined"
                density="comfortable"
                color="primary"
                @update:modelValue="getCommuneId"
              ></v-autocomplete>
            </v-col>

            <v-col cols="12" md="8">
              <v-text-field
                v-model="editedItem.address"
                label="Address / Location"
                variant="outlined"
                density="comfortable"
                color="primary"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="editedItem.phone"
                label="Contact Phone"
                prepend-inner-icon="mdi-phone"
                variant="outlined"
                density="comfortable"
                color="primary"
              ></v-text-field>
            </v-col>

            <v-col cols="6">
              <v-text-field
                v-model.number="editedItem.latitude"
                label="Latitude"
                type="number"
                variant="outlined"
                density="comfortable"
                color="primary"
              ></v-text-field>
            </v-col>

            <v-col cols="6">
              <v-text-field
                v-model.number="editedItem.longitude"
                label="Longitude"
                type="number"
                variant="outlined"
                density="comfortable"
                color="primary"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="editedItem.description"
                label="Description & Historical Overview"
                rows="3"
                variant="outlined"
                density="comfortable"
                color="primary"
              ></v-textarea>
            </v-col>

            <v-col cols="12">
              <v-file-input
                v-model="mainImg"
                :label="$t('Photo')"
                prepend-icon="mdi-camera"
                variant="outlined"
                density="comfortable"
                color="primary"
                @change="onImageChange"
              ></v-file-input>

              <div v-if="editedItem.photo" class="mt-3 border-editorial rounded-lg overflow-hidden">
                <v-img :src="editedItem.photo" max-height="200" cover></v-img>
              </div>
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
    <v-dialog v-model="dialogDelete" max-width="480px" persistent>
      <v-card class="editorial-card rounded-xl pa-6 text-center">
        <v-avatar size="56" color="#FBEBEB" class="mb-4 mx-auto">
          <v-icon icon="mdi-alert-outline" color="error" size="28"></v-icon>
        </v-avatar>
        <h3 class="font-serif text-h6 font-weight-bold text-forest mb-2">
          {{ $t('AreYouSureYouWantToDeleteThisItem') }}
        </h3>
        <p class="text-caption text-secondary-editorial mb-6">
          This operation will remove the site listing and cannot be undone.
        </p>
        <div class="d-flex justify-center gap-3">
          <v-btn variant="text" rounded="pill" class="px-5 mr-2" @click="closeDelete">
            {{ $t('Cancel') }}
          </v-btn>
          <v-btn
            color="error"
            class="px-6 font-weight-semibold"
            rounded="pill"
            @click="deleteItemConfirm"
            :loading="loadingDelete"
          >
            {{ $t('OK') }}
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch } from 'vue'
import { useSitesStore } from '@/stores/sites'
import { useWilayasStore } from '@/stores/wilaya'
import { useDairasStore } from '@/stores/daira'
import { useCommunesStore } from '@/stores/commune'

const wilaya = useWilayasStore()
const daira = useDairasStore()
const commune = useCommunesStore()
const sites = useSitesStore()

const isValidPhoto = (photo) => {
  return photo && typeof photo === 'string' && (photo.startsWith('http://') || photo.startsWith('https://')) && !photo.includes('truck') && !photo.includes('accident')
}

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
  { text: 'Address', value: 'address' },
  { text: 'Rating', value: 'rating' },
  { text: 'Phone', value: 'phone' },
  { text: 'Status', value: 'status' },
  { text: 'Actions', value: 'actions', sortable: false, align: 'end' }
])

const editedItem = ref({
  name: '',
  address: '',
  rating: 0,
  latitude: null,
  longitude: null,
  description: '',
  phone: '',
  photo: '',
  status: 'published',
  wilayaId: '',
  dairaId: '',
  communeId: ''
})

const defaultItem = ref({
  name: '',
  address: '',
  rating: 0,
  latitude: null,
  longitude: null,
  description: '',
  phone: '',
  photo: '',
  status: 'published',
  wilayaId: '',
  dairaId: '',
  communeId: ''
})

const mainImg = ref(null)
const dairaItems = ref([])
const communeItems = ref([])

const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'New Site' : 'Edit Site'
})

watch(dialog, (diaNew) => {
  diaNew || close()
})

watch(dialogDelete, (dialogDelNew) => {
  dialogDelNew || closeDelete()
})

onMounted(() => {
  initialize()
})

const openCreateDialog = () => {
  editedItem.value = Object.assign({}, defaultItem.value)
  editedIndex.value = -1
  dialog.value = true
}

const initialize = () => {
  sites.fetchSites()
  wilaya.fetchWilayas()
  daira.fetchDairas()
  commune.fetchCommunes()
}

const updateDaira = () => {
  dairaItems.value = (daira.getDairas || []).filter((e) => e.wilayaId === editedItem.value.wilayaId)
}

const updateCommune = () => {
  communeItems.value = (commune.getCommunes || []).filter((e) => e.dairaId === editedItem.value.dairaId)
}

const getCommuneId = () => {}

const onImageChange = () => {
  if (!mainImg.value) return
  const reader = new FileReader()
  reader.onload = (e) => {
    editedItem.value.photo = e.target.result
  }
  reader.readAsDataURL(mainImg.value)
}

const editItem = (item) => {
  editedIndex.value = sites.getSites.indexOf(item)
  editedItem.value = Object.assign({}, item)
  if (editedItem.value.wilayaId) updateDaira()
  if (editedItem.value.dairaId) updateCommune()
  dialog.value = true
}

const deleteItem = (item) => {
  editedIndex.value = sites.getSites.indexOf(item)
  deleteId.value = item._id
  editedItem.value = Object.assign({}, item)
  dialogDelete.value = true
}

const deleteItemConfirm = () => {
  loadingDelete.value = true
  sites.deleteSites(deleteId.value).then(() => {
    sites.getSites.splice(editedIndex.value, 1)
    initialize()
    loadingDelete.value = false
    closeDelete()
  })
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

const save = () => {
  loading.value = true
  if (editedIndex.value > -1) {
    sites.editSites(editedItem.value).then(() => {
      Object.assign(sites.sites[editedIndex.value], editedItem.value)
      loading.value = false
      close()
      initialize()
    })
  } else {
    sites.addSites(editedItem.value).then(() => {
      close()
      loading.value = false
      initialize()
    })
  }
}
</script>

<style scoped>
.site-management-page {
  max-width: 1600px;
  margin: 0 auto;
}

.table-header-row {
  background-color: var(--color-warm-ivory);
}

.table-header-cell {
  color: var(--color-forest-green) !important;
  font-weight: 700 !important;
  font-size: 0.8125rem !important;
  text-transform: uppercase !important;
  letter-spacing: 0.04em !important;
  padding: 14px 16px !important;
  border-bottom: 2px solid var(--color-border) !important;
}

.border-bottom {
  border-bottom: 1px solid var(--color-border);
}
</style>