<template>
  <v-container fluid class="px-4 px-md-8 py-6">
    <!-- Editorial Page Header -->
    <div class="editorial-page-header">
      <div>
        <div class="editorial-tag mb-1">Access Control</div>
        <h1 class="editorial-page-title">Roles & Permissions</h1>
        <p class="editorial-page-subtitle">Configure administrative roles and granular authorization permissions.</p>
      </div>

      <div class="d-flex align-center gap-2">
        <v-btn
          class="btn-editorial-primary px-5"
          prepend-icon="mdi-plus"
          @click="dialog = true"
        >
          {{ $t('New') || 'New Role' }}
        </v-btn>
      </div>
    </div>

    <!-- Data Table Container -->
    <div class="editorial-table-container">
      <v-data-table
        :headers="headers"
        :items="roles.getRoles || []"
        :loading="!roles.getRoles"
        sort-by="name"
        class="editorial-table"
      >
        <template v-slot:[`item.actions.read`]="{ item }">
          <v-checkbox
            :model-value="item.actions?.read"
            disabled
            density="compact"
            hide-details
            color="forestGreen"
          ></v-checkbox>
        </template>

        <template v-slot:[`item.actions.create`]="{ item }">
          <v-checkbox
            :model-value="item.actions?.create"
            disabled
            density="compact"
            hide-details
            color="forestGreen"
          ></v-checkbox>
        </template>

        <template v-slot:[`item.actions.update`]="{ item }">
          <v-checkbox
            :model-value="item.actions?.update"
            disabled
            density="compact"
            hide-details
            color="forestGreen"
          ></v-checkbox>
        </template>

        <template v-slot:[`item.actions.delete`]="{ item }">
          <v-checkbox
            :model-value="item.actions?.delete"
            disabled
            density="compact"
            hide-details
            color="forestGreen"
          ></v-checkbox>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-btn
            icon="mdi-pencil-outline"
            size="small"
            variant="text"
            color="forestGreen"
            @click="editItem(item)"
            title="Edit role"
          ></v-btn>
        </template>

        <template v-slot:no-data>
          <div class="text-center py-8">
            <v-icon icon="mdi-shield-account-outline" size="40" color="sand" class="mb-2"></v-icon>
            <div class="text-subtitle-2 text-editorial-secondary">No roles configured yet</div>
            <v-btn class="btn-editorial-primary px-4 mt-3" size="small" @click="initialize">
              {{ $t('Refresh') || 'Refresh' }}
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Edit / Add Role Dialog -->
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
                v-model="editedItem.name"
                label="Role Name"
                variant="outlined"
                density="comfortable"
                class="editorial-input mb-3"
              ></v-text-field>

              <v-select
                :items="items"
                v-model="editedItem.subject"
                item-title="title"
                item-value="title"
                label="Module Subject"
                variant="outlined"
                density="comfortable"
                class="editorial-input"
              ></v-select>
            </v-col>

            <v-col cols="12" sm="6">
              <div class="text-subtitle-2 font-weight-bold text-deep-green mb-2">Permissions Matrix</div>
              <v-checkbox
                v-model="editedItem.actions.read"
                label="Read Permission"
                color="forestGreen"
                density="compact"
                hide-details
                class="mb-2"
              ></v-checkbox>
              <v-checkbox
                v-model="editedItem.actions.create"
                label="Create Permission"
                color="forestGreen"
                density="compact"
                hide-details
                class="mb-2"
              ></v-checkbox>
              <v-checkbox
                v-model="editedItem.actions.update"
                label="Update Permission"
                color="forestGreen"
                density="compact"
                hide-details
                class="mb-2"
              ></v-checkbox>
              <v-checkbox
                v-model="editedItem.actions.delete"
                label="Delete Permission"
                color="forestGreen"
                density="compact"
                hide-details
              ></v-checkbox>
            </v-col>
          </v-row>
        </v-card-text>

        <div class="editorial-dialog-actions d-flex justify-end gap-2">
          <v-btn class="btn-editorial-ghost px-4" @click="close">Cancel</v-btn>
          <v-btn class="btn-editorial-primary px-6" @click="save">Save Role</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="dialogDelete" max-width="450px">
      <v-card class="editorial-dialog-card">
        <div class="editorial-dialog-header">
          <span class="dialog-title font-serif">Confirm Deletion</span>
          <v-btn icon="mdi-close" variant="text" density="compact" color="white" @click="closeDelete"></v-btn>
        </div>
        <v-card-text class="pa-5 text-center">
          <v-icon icon="mdi-alert-circle-outline" color="warning" size="48" class="mb-3"></v-icon>
          <div class="text-body-1 font-weight-medium">Are you sure you want to delete this role?</div>
          <div class="text-caption text-editorial-secondary mt-1">This action cannot be undone.</div>
        </v-card-text>
        <div class="editorial-dialog-actions d-flex justify-end gap-2">
          <v-btn class="btn-editorial-ghost px-4" @click="closeDelete">Cancel</v-btn>
          <v-btn color="error" variant="flat" rounded="pill" class="px-5" @click="deleteItemConfirm">Delete</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRolesStore } from '@/stores/roles'

const roles = useRolesStore()

const dialog = ref(false)
const dialogDelete = ref(false)
const headers = ref([
  { title: 'Role', key: 'name', align: 'start', sortable: true },
  { title: 'Subject', key: 'subject' },
  { title: 'Read', key: 'actions.read', sortable: false },
  { title: 'Create', key: 'actions.create', sortable: false },
  { title: 'Update', key: 'actions.update', sortable: false },
  { title: 'Delete', key: 'actions.delete', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
])

const editedIndex = ref(-1)
const deleteId = ref(null)
const editedItem = ref({
  name: '',
  subject: '',
  actions: {
    read: false,
    create: false,
    update: false,
    delete: false
  }
})

const defaultItem = ref({
  name: '',
  subject: '',
  actions: {
    read: false,
    create: false,
    update: false,
    delete: false
  }
})

const items = ref([
  { title: 'Dashboard' },
  { title: 'Products' },
  { title: 'Categories' },
  { title: 'Orders' },
  { title: 'Brands' },
  { title: 'Users' },
  { title: 'Billing' },
  { title: 'Advertising' },
  { title: 'Notifications' },
  { title: 'TermsConditions' },
  { title: 'Roles' },
  { title: 'Settings' }
])

const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'New Role' : 'Edit Role'
})

watch(dialog, (val) => {
  if (!val) close()
})

watch(dialogDelete, (val) => {
  if (!val) closeDelete()
})

const initialize = () => {
  roles.fetchRoles()
}

const editItem = (item) => {
  const list = roles.getRoles || []
  editedIndex.value = list.indexOf(item)
  editedItem.value = JSON.parse(JSON.stringify(item))
  dialog.value = true
}

const deleteItem = (item) => {
  deleteId.value = item._id
  dialogDelete.value = true
}

const deleteItemConfirm = () => {
  if (deleteId.value) {
    roles.deleteRoles(deleteId.value).then(() => {
      initialize()
      closeDelete()
    })
  } else {
    closeDelete()
  }
}

const close = () => {
  dialog.value = false
  nextTick(() => {
    editedItem.value = JSON.parse(JSON.stringify(defaultItem.value))
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
  if (editedIndex.value > -1) {
    roles.editRoles(editedItem.value).then(() => {
      initialize()
      close()
    })
  } else {
    roles.addRoles(editedItem.value).then(() => {
      initialize()
      close()
    })
  }
}

onMounted(() => {
  initialize()
})
</script>