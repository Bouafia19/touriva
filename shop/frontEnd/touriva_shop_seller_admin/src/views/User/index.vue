<template>
  <v-container fluid class="px-4 px-md-8 py-6">
    <!-- Editorial Page Header -->
    <div class="editorial-page-header">
      <div>
        <div class="editorial-tag mb-1">Access & Identity</div>
        <h1 class="editorial-page-title">User Accounts</h1>
        <p class="editorial-page-subtitle">Manage system administrators, merchant partners, and registered client accounts.</p>
      </div>

      <div class="d-flex align-center gap-2 flex-wrap">
        <v-btn
          class="btn-editorial-primary px-5"
          prepend-icon="mdi-account-plus"
          @click="openNewDialog"
        >
          {{ $t('New') || 'New User' }}
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
      <!-- Search & Role Filter Bar -->
      <div class="pa-4 bg-white d-flex align-center justify-space-between flex-wrap gap-3 border-b">
        <div class="d-flex align-center gap-3 flex-wrap flex-grow-1">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            :placeholder="$t('Search') + ' users by email, name or company...'"
            variant="outlined"
            density="compact"
            hide-details
            rounded="pill"
            style="min-width: 280px; max-width: 380px;"
            class="editorial-search-input"
          ></v-text-field>

          <v-chip-group
            v-model="selectedRole"
            selected-class="chip-active-editorial"
            density="compact"
          >
            <v-chip value="all" filter variant="tonal" rounded="pill">All Users</v-chip>
            <v-chip value="administrator" filter variant="tonal" rounded="pill">Admins</v-chip>
            <v-chip value="partner" filter variant="tonal" rounded="pill">Partners</v-chip>
            <v-chip value="client" filter variant="tonal" rounded="pill">Clients</v-chip>
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
        :items="filteredUsers"
        :loading="!users.getUsers"
        class="editorial-table"
      >
        <!-- User Identity / Name -->
        <template v-slot:[`item.name`]="{ item }">
          <div class="d-flex align-center py-1">
            <v-avatar size="36" class="me-2 bg-sand-light border-editorial flex-shrink-0">
              <v-icon :icon="getUserIcon(item.role)" color="forestGreen" size="18"></v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-semibold text-deep-green">{{ getUserDisplayName(item) }}</div>
              <div class="text-caption text-editorial-secondary">{{ item.email }}</div>
            </div>
          </div>
        </template>

        <!-- Company Name -->
        <template v-slot:[`item.companyName`]="{ item }">
          <span class="text-caption font-weight-medium">
            {{ item.companyName || '—' }}
          </span>
        </template>

        <!-- Phone -->
        <template v-slot:[`item.phone`]="{ item }">
          <span class="text-caption">
            {{ item.phone || '—' }}
          </span>
        </template>

        <!-- Role Badge -->
        <template v-slot:[`item.role`]="{ item }">
          <span :class="['status-badge', getRoleBadgeClass(item.role)]">
            <span class="status-badge-dot"></span>
            {{ item.role || 'client' }}
          </span>
        </template>

        <!-- Account Status / Activation -->
        <template v-slot:[`item.activated`]="{ item }">
          <span :class="['status-badge', item.activated !== false ? 'status-badge-success' : 'status-badge-error']">
            <span class="status-badge-dot"></span>
            {{ item.activated !== false ? 'Active' : 'Locked' }}
          </span>
        </template>

        <!-- Actions -->
        <template v-slot:[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-end gap-1">
            <v-btn
              icon="mdi-pencil-outline"
              size="small"
              variant="text"
              color="forestGreen"
              @click="editItem(item)"
              title="Edit account"
            ></v-btn>
            <v-btn
              :icon="item.activated !== false ? 'mdi-lock-outline' : 'mdi-lock-open-variant-outline'"
              size="small"
              variant="text"
              :color="item.activated !== false ? 'warning' : 'success'"
              :loading="loadingToggleId === item._id"
              @click="activateItem(item)"
              :title="item.activated !== false ? 'Lock account' : 'Unlock account'"
            ></v-btn>
            <v-btn
              icon="mdi-delete-outline"
              size="small"
              variant="text"
              color="error"
              @click="deleteItem(item)"
              title="Delete account"
            ></v-btn>
          </div>
        </template>

        <!-- Empty State -->
        <template v-slot:no-data>
          <div class="text-center py-12 px-4">
            <v-icon icon="mdi-account-group-outline" size="48" color="sand" class="mb-2"></v-icon>
            <div class="text-subtitle-1 font-weight-medium text-deep-green">No User Accounts Found</div>
            <p class="text-caption text-editorial-secondary mb-3">Add team members or client accounts to get started.</p>
            <v-btn class="btn-editorial-primary px-4" size="small" @click="openNewDialog">
              Create New User
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- User Create / Edit Dialog -->
    <v-dialog v-model="dialog" max-width="650px">
      <v-card class="editorial-dialog-card">
        <div class="editorial-dialog-header">
          <span class="dialog-title font-serif">{{ formTitle }}</span>
          <v-btn icon="mdi-close" variant="text" density="compact" color="white" @click="close"></v-btn>
        </div>

        <v-card-text class="pa-5">
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editedItem.email"
                label="Email Address"
                type="email"
                variant="outlined"
                density="comfortable"
                class="editorial-input"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-select
                v-model="editedItem.role"
                :items="roleOptions"
                label="Account Role"
                variant="outlined"
                density="comfortable"
                class="editorial-input"
              ></v-select>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editedItem.firstName"
                label="First Name"
                variant="outlined"
                density="comfortable"
                class="editorial-input"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editedItem.lastName"
                label="Last Name"
                variant="outlined"
                density="comfortable"
                class="editorial-input"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editedItem.companyName"
                label="Company / Raison Sociale"
                variant="outlined"
                density="comfortable"
                class="editorial-input"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editedItem.phone"
                label="Phone Number"
                variant="outlined"
                density="comfortable"
                class="editorial-input"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6" v-if="editedIndex === -1">
              <v-text-field
                v-model="editedItem.password"
                label="Initial Password"
                type="password"
                variant="outlined"
                density="comfortable"
                class="editorial-input"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-switch
                v-model="editedItem.activated"
                color="forestGreen"
                label="Account Activated"
                hide-details
                inset
              ></v-switch>
            </v-col>
          </v-row>
        </v-card-text>

        <div class="editorial-dialog-actions d-flex justify-end gap-2">
          <v-btn class="btn-editorial-ghost px-4" @click="close">Cancel</v-btn>
          <v-btn class="btn-editorial-primary px-6" :loading="loading" @click="save">Save User</v-btn>
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
          <div class="text-body-1 font-weight-medium">Are you sure you want to delete this user?</div>
          <div class="text-caption text-editorial-secondary mt-1">This user will lose access to the portal.</div>
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
import { useUsersStore } from '@/stores/users'

const users = useUsersStore()

const search = ref('')
const selectedRole = ref('all')
const dialog = ref(false)
const dialogDelete = ref(false)
const loading = ref(false)
const loadingDelete = ref(false)
const loadingToggleId = ref(null)
const err = ref('')
const editedIndex = ref(-1)
const deleteId = ref(null)

const roleOptions = ref(['administrator', 'partner', 'client'])

const headers = ref([
  { title: 'User / Identity', key: 'name', sortable: true },
  { title: 'Company / Business', key: 'companyName', sortable: true },
  { title: 'Phone', key: 'phone', sortable: false },
  { title: 'Role', key: 'role', sortable: true },
  { title: 'Status', key: 'activated', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
])

const defaultItem = {
  email: '',
  firstName: '',
  lastName: '',
  companyName: '',
  phone: '',
  password: 'Password123!',
  role: 'client',
  activated: true
}

const editedItem = ref(Object.assign({}, defaultItem))

const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'Create User Account' : 'Edit User Account'
})

const filteredUsers = computed(() => {
  let list = users.getUsers || []
  if (selectedRole.value && selectedRole.value !== 'all') {
    list = list.filter(u => u.role === selectedRole.value)
  }
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(u => {
      const email = String(u.email || '').toLowerCase()
      const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase()
      const comp = String(u.companyName || '').toLowerCase()
      return email.includes(q) || name.includes(q) || comp.includes(q)
    })
  }
  return list
})

watch(dialog, (val) => {
  if (!val) close()
})

watch(dialogDelete, (val) => {
  if (!val) closeDelete()
})

const getUserDisplayName = (u) => {
  if (u.firstName || u.lastName) {
    return `${u.firstName || ''} ${u.lastName || ''}`.trim()
  }
  if (u.companyName) return u.companyName
  return u.email?.split('@')[0] || 'User'
}

const getUserIcon = (role) => {
  if (role === 'administrator') return 'mdi-shield-crown-outline'
  if (role === 'partner') return 'mdi-store-outline'
  return 'mdi-account-outline'
}

const getRoleBadgeClass = (role) => {
  if (role === 'administrator') return 'status-badge-success'
  if (role === 'partner') return 'status-badge-sand'
  return 'status-badge-info'
}

const initialize = () => {
  users.fetchUsers()
}

const openNewDialog = () => {
  editedIndex.value = -1
  editedItem.value = Object.assign({}, defaultItem)
  dialog.value = true
}

const editItem = (item) => {
  const list = users.getUsers || []
  editedIndex.value = list.indexOf(item)
  editedItem.value = JSON.parse(JSON.stringify(item))
  dialog.value = true
}

const activateItem = async (item) => {
  loadingToggleId.value = item._id
  const updatedStatus = item.activated === false ? true : false
  try {
    await users.editUsers({
      _id: item._id,
      activated: updatedStatus
    })
    item.activated = updatedStatus
  } catch (error) {
    err.value = error.message || 'Error updating user status'
  } finally {
    loadingToggleId.value = null
  }
}

const deleteItem = (item) => {
  const list = users.getUsers || []
  editedIndex.value = list.indexOf(item)
  deleteId.value = item._id
  dialogDelete.value = true
}

const deleteItemConfirm = () => {
  loadingDelete.value = true
  users.deleteUsers(deleteId.value).then(() => {
    initialize()
    loadingDelete.value = false
    closeDelete()
  }).catch((e) => {
    loadingDelete.value = false
    err.value = e.message || 'Error deleting user'
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
    users.editUsers(editedItem.value).then(() => {
      loading.value = false
      close()
      initialize()
    }).catch((e) => {
      loading.value = false
      err.value = e.message || 'Error updating user'
    })
  } else {
    // Audit fix: Call users.addUsers() instead of non-existent users.createUser()
    users.addUsers(editedItem.value).then(() => {
      loading.value = false
      close()
      initialize()
    }).catch((e) => {
      loading.value = false
      err.value = e.message || 'Error creating user'
    })
  }
}

onMounted(() => {
  initialize()
})
</script>

<style scoped>
.chip-active-editorial {
  background-color: var(--color-forest-green) !important;
  color: #FFFFFF !important;
}
</style>