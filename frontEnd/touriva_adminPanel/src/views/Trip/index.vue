<template>
  <v-container fluid class="pa-6 trip-management-page">
    <!-- Editorial Page Header -->
    <div class="editorial-section-header d-flex flex-wrap align-center justify-space-between mb-6">
      <div>
        <span class="editorial-tag">{{ $t('Tourism') }} • {{ $t('Trips') }}</span>
        <h1 class="editorial-title">{{ $t('Trips') }}</h1>
        <p class="editorial-subtitle">
          Curated multi-day journeys, regional tours and guided expeditions
        </p>
      </div>

      <div class="d-flex align-center mt-3 mt-sm-0">
        <v-btn
          class="btn-editorial-primary"
          prepend-icon="mdi-plus-circle"
          @click="openCreateDialog"
        >
          {{ $t('AddNewTrip') }}
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
            :label="$t('Search') + ' ' + $t('Trips') + '...'"
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
            {{ trips.getTrips?.length || 0 }} {{ $t('Trips') }}
          </v-chip>
          <v-btn
            icon="mdi-refresh"
            size="small"
            variant="text"
            color="primary"
            @click="initialize"
            :loading="!trips.getTrips"
            title="Refresh trips"
          ></v-btn>
        </div>
      </div>

      <!-- Trips Data Table -->
      <v-data-table
        :headers="headers"
        :items="trips.getTrips || []"
        :loading="!trips.getTrips"
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

        <!-- Trip Name & Image -->
        <template v-slot:[`item.name`]="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar size="44" rounded="lg" color="sandLight" class="mr-3 overflow-hidden border-editorial">
              <v-img v-if="item.image" :src="item.image" cover></v-img>
              <v-icon v-else icon="mdi-compass-outline" color="sandDark" size="22"></v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-bold text-forest text-body-2">{{ item.name }}</div>
              <div class="text-caption text-secondary-editorial">
                {{ item.destination?.name || 'Algeria' }} • {{ item.items?.length || 0 }} days
              </div>
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

        <!-- Price Column -->
        <template v-slot:[`item.price`]="{ item }">
          <span class="font-weight-bold text-forest text-body-2">
            {{ formatPrice(item.price) }}
          </span>
        </template>

        <!-- Status Column -->
        <template v-slot:[`item.status`]="{ item }">
          <span
            class="status-badge"
            :class="{
              'success': item.status === 'published' || item.published,
              'warning': item.status === 'pending',
              'info': item.status === 'created'
            }"
          >
            <v-icon
              :icon="item.status === 'published' || item.published ? 'mdi-check-circle' : 'mdi-clock-outline'"
              size="12"
            ></v-icon>
            {{ (item.status === 'published' || item.published) ? $t('published') : (item.status === 'pending' ? $t('pending') : $t('not published')) }}
          </span>
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
              title="Edit Trip"
            ></v-btn>
            <v-btn
              icon="mdi-delete-outline"
              size="small"
              variant="text"
              color="error"
              @click="deleteItem(item)"
              title="Delete Trip"
            ></v-btn>
          </div>
        </template>

        <!-- Empty State -->
        <template v-slot:no-data>
          <div class="text-center py-10">
            <v-avatar size="56" color="sandLight" class="mb-3">
              <v-icon icon="mdi-compass-off-outline" color="sandDark" size="28"></v-icon>
            </v-avatar>
            <div class="font-serif font-weight-bold text-forest text-body-1 mb-1">No trips found</div>
            <div class="text-caption text-secondary-editorial mb-4">No trips currently listed or matching your filter.</div>
            <v-btn class="btn-editorial-primary px-5" size="small" @click="initialize">
              {{ $t('Reset') }}
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create / Edit Trip Dialog -->
    <v-dialog v-model="dialog" max-width="720px" persistent scrollable>
      <v-card class="editorial-card rounded-xl overflow-hidden">
        <!-- Dialog Header -->
        <div class="px-6 py-4 bg-forest-green text-white d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-avatar size="34" color="rgba(255,255,255,0.15)" class="mr-3">
              <v-icon icon="mdi-compass-outline" color="sand" size="18"></v-icon>
            </v-avatar>
            <div>
              <div class="font-serif text-h6 font-weight-bold">{{ formTitle }}</div>
              <div class="text-caption text-sand">{{ editedItem.name || 'Trip Details' }}</div>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" color="white" @click="close"></v-btn>
        </div>

        <!-- Dialog Body -->
        <v-card-text class="pa-6 bg-white" style="max-height: 70vh;">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="editedItem.name"
                label="Trip Name"
                variant="outlined"
                density="comfortable"
                color="primary"
                class="mb-3"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                :model-value="editedItem.creator?.companyName || editedItem.creator?.lastName || 'Touriva'"
                label="Organizer / Guide"
                variant="outlined"
                density="comfortable"
                color="primary"
                class="mb-3"
                readonly
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                :model-value="editedItem.destination?.name"
                label="Destination"
                variant="outlined"
                density="comfortable"
                color="primary"
                class="mb-3"
                readonly
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                :model-value="formatPrice(editedItem.price)"
                label="Price (DZD)"
                variant="outlined"
                density="comfortable"
                color="primary"
                class="mb-3"
                readonly
              ></v-text-field>
            </v-col>

            <!-- Trip Cover Image -->
            <v-col cols="12">
              <div class="border-editorial rounded-lg overflow-hidden mb-4">
                <div class="px-4 py-2 bg-warm-ivory border-bottom text-caption font-weight-bold text-forest">
                  Trip Cover Visual
                </div>
                <v-img
                  v-if="editedItem.image"
                  :src="editedItem.image"
                  height="220"
                  cover
                ></v-img>
                <div v-else class="text-center py-8 bg-warm-ivory">
                  <v-icon icon="mdi-image-outline" size="40" color="sandDark"></v-icon>
                  <div class="text-caption text-secondary-editorial mt-1">No cover image available</div>
                </div>
              </div>
            </v-col>

            <!-- Day-by-day Itinerary -->
            <v-col cols="12" v-if="editedItem.items?.length">
              <div class="editorial-tag text-sand-dark mb-2">Detailed Itinerary</div>
              <v-timeline side="end" density="compact" class="mb-4">
                <v-timeline-item
                  v-for="day in editedItem.items"
                  :key="day.day"
                  dot-color="primary"
                  size="small"
                >
                  <template v-slot:icon>
                    <span class="text-caption font-weight-bold text-white">{{ day.day }}</span>
                  </template>
                  <v-card class="pa-3 bg-warm-ivory border-editorial rounded-lg">
                    <div class="font-weight-bold text-forest text-body-2 mb-2">Day {{ day.day }}</div>
                    <div v-for="elem in day.items" :key="elem.id" class="mb-2">
                      <div class="font-weight-medium text-caption text-forest">{{ elem.title }}</div>
                      <div class="text-caption text-secondary-editorial">{{ elem.description }}</div>
                    </div>
                  </v-card>
                </v-timeline-item>
              </v-timeline>
            </v-col>

            <!-- Published Toggle -->
            <v-col cols="12">
              <v-switch
                v-model="editedItem.published"
                color="success"
                label="Publish trip immediately to catalog"
                inset
                density="compact"
              ></v-switch>
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
          This operation will remove the trip listing and cannot be undone.
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
import { useTripsStore } from '@/stores/trips'
import { useWilayasStore } from '@/stores/wilaya'
import { useDairasStore } from '@/stores/daira'
import { useCommunesStore } from '@/stores/commune'

const wilaya = useWilayasStore()
const daira = useDairasStore()
const commune = useCommunesStore()
const trips = useTripsStore()

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
  { text: 'Price', value: 'price' },
  { text: 'Rating', value: 'rating' },
  { text: 'Status', value: 'status' },
  { text: 'Actions', value: 'actions', sortable: false, align: 'end' }
])

const editedItem = ref({
  name: '',
  creator: '',
  destination: '',
  price: '',
  image: '',
  items: [],
  status: '',
  published: false
})

const defaultItem = ref({
  name: '',
  creator: '',
  destination: '',
  price: '',
  image: '',
  items: [],
  status: '',
  published: false
})

const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'New Trip' : 'Edit Trip'
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
  trips.fetchTrips()
  wilaya.fetchWilayas()
  daira.fetchDairas()
  commune.fetchCommunes()
}

const formatPrice = (price) => {
  if (!price) return '—'
  return new Intl.NumberFormat('fr-FR').format(price) + ' DA'
}

const editItem = (item) => {
  editedIndex.value = trips.getTrips.indexOf(item)
  editedItem.value = Object.assign({}, item)
  dialog.value = true
}

const deleteItem = (item) => {
  editedIndex.value = trips.getTrips.indexOf(item)
  deleteId.value = item._id
  editedItem.value = Object.assign({}, item)
  dialogDelete.value = true
}

const deleteItemConfirm = () => {
  loadingDelete.value = true
  trips.deleteTrips(deleteId.value).then(() => {
    trips.getTrips.splice(editedIndex.value, 1)
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
  if (editedItem.value.published) {
    editedItem.value.status = 'published'
  }

  if (editedIndex.value > -1) {
    trips.editTrips(editedItem.value).then(() => {
      Object.assign(trips.trips[editedIndex.value], editedItem.value)
      loading.value = false
      close()
      initialize()
    })
  } else {
    trips.addTrips(editedItem.value).then(() => {
      close()
      loading.value = false
      initialize()
    })
  }
}
</script>

<style scoped>
.trip-management-page {
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