<template>
  <v-container fluid class="pa-6 user-management-page">
    <!-- Editorial Page Header -->
    <div class="editorial-section-header d-flex flex-wrap align-center justify-space-between mb-6">
      <div>
        <span class="editorial-tag">{{ $t('Management') }} • {{ $t('Users') }}</span>
        <h1 class="editorial-title">{{ $t('Users') }}</h1>
        <p class="editorial-subtitle">
          Manage travelers, tourism partners, guides, and platform administrators
        </p>
      </div>

      <div class="d-flex align-center mt-3 mt-sm-0">
        <v-btn
          class="btn-editorial-primary"
          prepend-icon="mdi-account-plus"
          @click="openCreateDialog"
        >
          {{ $t('New') }} {{ $t('User') }}
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
            :label="$t('Search') + '...'"
            single-line
            hide-details
            density="compact"
            variant="outlined"
            rounded="pill"
            color="primary"
            bg-color="warmIvory"
            class="editorial-search-input"
            clearable
          ></v-text-field>
        </div>

        <div class="d-flex align-center gap-2">
          <v-chip size="small" color="primary" variant="tonal" class="font-weight-bold">
            {{ users.getUsers?.length || 0 }} {{ $t('Users') }}
          </v-chip>
          <v-btn
            icon="mdi-refresh"
            size="small"
            variant="text"
            color="primary"
            @click="initialize"
            :loading="!users.getUsers"
            title="Refresh list"
          ></v-btn>
        </div>
      </div>

      <!-- Users Data Table -->
      <v-data-table
        :headers="headers"
        :items="users.getUsers || []"
        :loading="!users.getUsers"
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

        <!-- Name column -->
        <template v-slot:[`item.name`]="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar size="34" color="sandLight" class="mr-3 font-weight-bold text-forest">
              {{ (item.firstName?.[0] || item.email?.[0] || 'U').toUpperCase() }}
            </v-avatar>
            <div>
              <div class="font-weight-semibold text-forest text-body-2">
                {{ (item.firstName ? (item.firstName + ' ' + (item.lastName || '')) : (item.companyName || '—')) }}
              </div>
              <div class="text-caption text-secondary-editorial">{{ item.email }}</div>
            </div>
          </div>
        </template>

        <!-- Email column -->
        <template v-slot:[`item.email`]="{ item }">
          <span class="font-weight-medium text-body-2 text-forest">{{ item.email }}</span>
        </template>

        <!-- Role Badge -->
        <template v-slot:[`item.role`]="{ item }">
          <span
            class="status-badge"
            :class="{
              'success': item.role === 'client',
              'warning': item.role === 'partner',
              'info': item.role === 'administrator'
            }"
          >
            {{ $t(item.role || 'client') }}
          </span>
        </template>

        <!-- Account Type Badge -->
        <template v-slot:[`item.typeAccount`]="{ item }">
          <v-chip size="x-small" variant="outlined" color="primary" class="font-weight-medium" v-if="item.typeAccount">
            {{ item.typeAccount }}
          </v-chip>
          <span v-else class="text-caption text-secondary-editorial">—</span>
        </template>

        <!-- Authorizations Column -->
        <template v-slot:[`item.authorizationIds`]="{ item }">
          <v-chip-group column v-if="item.authorizationIds?.length > 0">
            <v-chip
              v-for="(auth, index) in item.authorizationIds"
              :key="index"
              size="x-small"
              color="primary"
              variant="flat"
            >
              {{ auth.name }}
            </v-chip>
          </v-chip-group>
          <span v-else class="text-caption text-secondary-editorial">—</span>
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
              title="Edit User"
            ></v-btn>

            <v-btn
              :icon="item.activated ? 'mdi-lock-open-outline' : 'mdi-lock-outline'"
              size="small"
              variant="text"
              :color="item.activated ? 'success' : 'warning'"
              :loading="loading && editedIndex === users.getUsers.indexOf(item)"
              @click="activateItem(item)"
              :title="item.activated ? 'Active (Click to lock)' : 'Inactive (Click to activate)'"
            ></v-btn>

            <v-btn
              icon="mdi-delete-outline"
              size="small"
              variant="text"
              color="error"
              @click="deleteItem(item)"
              title="Delete User"
            ></v-btn>
          </div>
        </template>

        <!-- Empty State -->
        <template v-slot:no-data>
          <div class="text-center py-10">
            <v-avatar size="56" color="sandLight" class="mb-3">
              <v-icon icon="mdi-account-search-outline" color="sandDark" size="28"></v-icon>
            </v-avatar>
            <div class="font-serif font-weight-bold text-forest text-body-1 mb-1">No users found</div>
            <div class="text-caption text-secondary-editorial mb-4">No matching records match your filter criteria.</div>
            <v-btn class="btn-editorial-primary px-5" size="small" @click="initialize">
              {{ $t('Reset') }}
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create / Edit User Dialog -->
    <v-dialog
      v-model="dialog"
      :max-width="editedItem.typeAccount != 'ordinary' && editedItem.role != 'administrator' ? '920px' : '560px'"
      persistent
      scrollable
    >
      <v-card class="editorial-card rounded-xl overflow-hidden">
        <!-- Dialog Header -->
        <div class="px-6 py-4 bg-forest-green text-white d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-avatar size="34" color="rgba(255,255,255,0.15)" class="mr-3">
              <v-icon icon="mdi-account-edit-outline" color="sand" size="18"></v-icon>
            </v-avatar>
            <div>
              <div class="font-serif text-h6 font-weight-bold">{{ formTitle }}</div>
              <div class="text-caption text-sand">{{ editedItem.email || 'Account Details' }}</div>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" color="white" @click="close"></v-btn>
        </div>

        <!-- Dialog Body -->
        <v-card-text class="pa-6 bg-white" style="max-height: 70vh;">
          <v-row>
            <v-col :cols="editedItem.typeAccount != 'ordinary' && editedItem.role != 'administrator' ? '5' : '12'">
              <v-text-field
                v-model="editedItem.email"
                label="Email"
                type="email"
                variant="outlined"
                density="comfortable"
                color="primary"
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model="editedItem.companyName"
                label="Company / Raison Sociale"
                type="text"
                variant="outlined"
                density="comfortable"
                color="primary"
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model="editedItem.firstName"
                label="First Name"
                type="text"
                variant="outlined"
                density="comfortable"
                color="primary"
                class="mb-3"
                v-if="editedItem.role === 'client'"
              ></v-text-field>

              <v-text-field
                v-model="editedItem.lastName"
                label="Last Name"
                type="text"
                variant="outlined"
                density="comfortable"
                color="primary"
                class="mb-3"
                v-if="editedItem.role === 'client'"
              ></v-text-field>

              <v-text-field
                v-model="editedItem.phone"
                label="Phone Number"
                type="text"
                variant="outlined"
                density="comfortable"
                color="primary"
                class="mb-3"
                disabled
                v-if="editedItem.role != 'administrator'"
              ></v-text-field>

              <v-select
                :items="items"
                v-model="editedItem.role"
                item-value="value"
                item-title="label"
                label="Role"
                variant="outlined"
                density="comfortable"
                color="primary"
                class="mb-3"
                disabled
              ></v-select>

              <v-select
                :items="items"
                v-model="editedItem.typeAccount"
                item-value="value"
                item-title="label"
                label="Account Type"
                variant="outlined"
                density="comfortable"
                color="primary"
                class="mb-3"
                disabled
              ></v-select>

              <v-select
                :items="roles"
                v-model="editedItem.authorizationIds"
                item-value="_id"
                item-title="name"
                label="Authorizations"
                multiple
                chips
                variant="outlined"
                density="comfortable"
                color="primary"
                class="mb-3"
                v-if="editedItem.role === 'administrator'"
              ></v-select>

              <v-select
                :items="fileStatus"
                label="Verification Status"
                item-value="name"
                item-title="name"
                v-model="editedItem.fileStatus"
                variant="outlined"
                density="comfortable"
                color="primary"
                class="mb-3"
                v-if="editedItem.typeAccount != 'ordinary'"
              ></v-select>

              <v-checkbox
                v-model="editedItem.status"
                label="Active Status"
                color="primary"
                density="compact"
                v-if="editedItem.typeAccount != 'ordinary' && editedItem.role != 'administrator'"
              ></v-checkbox>
            </v-col>

            <!-- Verification Documents Preview -->
            <v-col
              cols="7"
              v-if="editedItem.typeAccount != 'ordinary' && editedItem.role != 'administrator'"
            >
              <v-card class="border-editorial rounded-lg overflow-hidden fill-height">
                <div class="px-4 py-3 bg-warm-ivory border-bottom d-flex align-center">
                  <v-icon icon="mdi-file-document-outline" size="18" color="forestGreen" class="mr-2"></v-icon>
                  <span class="font-weight-bold text-forest text-body-2">{{ $t('Documents') }}</span>
                </div>

                <v-tabs v-model="tab" density="compact" color="primary" class="border-bottom">
                  <v-tab v-for="(doc, index) in documents" :key="index" :value="index">
                    {{ $t(doc.title) }}
                    <v-icon
                      :icon="doc.done ? 'mdi-check-circle' : 'mdi-minus-circle'"
                      size="14"
                      :color="doc.done ? 'success' : 'error'"
                      class="ml-1"
                    ></v-icon>
                  </v-tab>
                </v-tabs>

                <div class="pa-4 bg-warm-ivory">
                  <v-tabs-window v-model="tab">
                    <v-tabs-window-item
                      v-for="(doc, index) in documents"
                      :key="index"
                      :value="index"
                    >
                      <div v-if="editedItem[doc.title]" class="rounded-lg overflow-hidden border-editorial">
                        <v-img :src="editedItem[doc.title]" height="320" cover></v-img>
                      </div>
                      <div v-else class="text-center py-12">
                        <v-icon icon="mdi-file-image-outline" size="48" color="sandDark" class="mb-2"></v-icon>
                        <div class="text-caption text-secondary-editorial">No document image uploaded</div>
                      </div>
                    </v-tabs-window-item>
                  </v-tabs-window>
                </div>
              </v-card>
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
          This operation cannot be undone. User records and linked data will be deleted.
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
import { useUsersStore } from '@/stores/users'

const users = useUsersStore()

const DOCUMENTS_BY_TYPE = {
  touristGuide: [
    { title: 'id' },
    { title: 'diploma' },
    { title: 'accreditation' }
  ],
  touristAgencies: [
    { title: 'id' },
    { title: 'commercialRegister' },
    { title: 'accreditation' }
  ],
  associations: [
    { title: 'presidentId' },
    { title: 'accreditation' }
  ],
  others: [
    { title: 'id' },
    { title: 'justification' }
  ]
}

const search = ref('')
const dialog = ref(false)
const dialogDelete = ref(false)
const loadingDelete = ref(false)
const loading = ref(false)
const err = ref('')
const editedIndex = ref(-1)
const deleteId = ref(-1)
const tab = ref(null)
const partners = ref([])

const headers = ref([
  { text: 'Name', value: 'name', align: 'start' },
  { text: 'RaisonSocial', value: 'companyName' },
  { text: 'Phone', value: 'phone' },
  { text: 'role', value: 'role' },
  { text: 'Account Type', value: 'typeAccount' },
  { text: 'Expiration', value: 'expirationOfSubscription' },
  { text: 'Actions', value: 'actions', sortable: false, align: 'end' }
])

const items = ref([
  { label: 'administrator', value: 'administrator' },
  { label: 'client', value: 'client' },
  { label: 'partner', value: 'partner' }
])

const roles = ref([])

const fileStatus = ref([
  { name: 'created' },
  { name: 'pending' },
  { name: 'confirmed' }
])

const editedItem = ref({
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  password: '12345678',
  role: 'administrator',
  vehicleId: null,
  complete: false,
  activated: false,
  code: ''
})

const defaultItem = ref({
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  password: '',
  role: 'administrator',
  vehicleId: null,
  complete: false,
  activated: false,
  code: ''
})

const documents = computed(() => {
  return DOCUMENTS_BY_TYPE[editedItem.value.typeAccount] || []
})

const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'New User' : 'Edit User'
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
  users.fetchUsers()
}

const editItem = (item) => {
  editedIndex.value = users.getUsers.indexOf(item)
  editedItem.value = Object.assign({}, item)
  const userKeys = Object.keys(item)
  userKeys.forEach((key) => {
    documents.value.forEach((e) => {
      if (key === e.title) {
        e.done = true
      }
    })
  })
  dialog.value = true
}

const activateItem = async (item) => {
  loading.value = true
  item.activated = !item.activated
  try {
    await users.editUsers(item)
  } catch (error) {
    err.value = error
    console.error('error update user', error)
  }
  loading.value = false
}

const deleteItem = (item) => {
  editedIndex.value = users.getUsers.indexOf(item)
  deleteId.value = item._id
  editedItem.value = Object.assign({}, item)
  dialogDelete.value = true
}

const deleteItemConfirm = () => {
  loadingDelete.value = true
  users.deleteUsers(deleteId.value).then(() => {
    users.users.splice(editedIndex.value, 1)
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

const fileProcessing = () => {
  editedItem.value.complete = true
  let array = documents.value.filter((e) => !e.done)
  let counter = 0
  array.forEach((e) => {
    if (e.title === 'commercialRegister' || e.title === 'transportCard') {
      counter = counter + 1
    }
  })
  if (counter === 2) {
    editedItem.value.legal = false
  }
  if (array.length === 0) {
    editedItem.value.legal = true
  }
}

const save = () => {
  loading.value = true
  if (editedIndex.value > -1) {
    switch (editedItem.value.fileStatus) {
      case 'confirmed':
        fileProcessing()
        editedItem.value.status = true
        break
      case 'created':
      case 'pending':
        editedItem.value.complete = false
        editedItem.value.status = false
        break
      default:
        break
    }

    let updatedItem = {
      _id: editedItem.value._id,
      fileStatus: editedItem.value.fileStatus,
      vehicleId: editedItem.value.vehicleId,
      complete: editedItem.value.complete,
      code: editedItem.value.code,
      status: editedItem.value.status,
      legal: editedItem.value.legal,
      sectorActivity: editedItem.value.sectorActivity
    }

    users.editUsers(updatedItem).then(() => {
      Object.assign(users.users[editedIndex.value], editedItem.value)
      loading.value = false
      close()
      initialize()
    })
  } else {
    users.addUsers(editedItem.value).then(() => {
      close()
      loading.value = false
      initialize()
    })
  }
}
</script>

<style scoped>
.user-management-page {
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