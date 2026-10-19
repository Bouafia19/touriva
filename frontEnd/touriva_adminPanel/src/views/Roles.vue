<template>
  <v-container fluid class="pa-6">
    <div class="editorial-section-header d-flex flex-wrap align-center justify-space-between mb-6">
      <div>
        <span class="editorial-tag">{{ $t('Management') }} • {{ $t('Roles') }}</span>
        <h1 class="editorial-title">{{ $t('Roles') }}</h1>
        <p class="editorial-subtitle">Role permissions and access control management</p>
      </div>

      <div class="d-flex align-center mt-3 mt-sm-0">
        <v-btn
          class="btn-editorial-primary"
          prepend-icon="mdi-plus-circle"
          @click="openCreateDialog"
        >
          {{ $t('New') }} {{ $t('Roles') }}
        </v-btn>
      </div>
    </div>

    <v-card class="admin-card overflow-hidden">
      <v-data-table
        :headers="headers"
        :items="roles.getRoles || []"
        sort-by="name"
        hover
        class="editorial-data-table"
      >
        <template v-slot:headers="{ columns }">
          <tr class="table-header-row">
            <template v-for="column in columns" :key="column.key">
              <th class="table-header-cell">
                {{ $t(column.text) }}
              </th>
            </template>
          </tr>
        </template>

        <template v-slot:[`item.actions.read`]="{ item }">
          <v-icon :icon="item.actions?.read ? 'mdi-check-circle' : 'mdi-close-circle'" :color="item.actions?.read ? 'success' : 'error'" size="20"></v-icon>
        </template>

        <template v-slot:[`item.actions.create`]="{ item }">
          <v-icon :icon="item.actions?.create ? 'mdi-check-circle' : 'mdi-close-circle'" :color="item.actions?.create ? 'success' : 'error'" size="20"></v-icon>
        </template>

        <template v-slot:[`item.actions.update`]="{ item }">
          <v-icon :icon="item.actions?.update ? 'mdi-check-circle' : 'mdi-close-circle'" :color="item.actions?.update ? 'success' : 'error'" size="20"></v-icon>
        </template>

        <template v-slot:[`item.actions.delete`]="{ item }">
          <v-icon :icon="item.actions?.delete ? 'mdi-check-circle' : 'mdi-close-circle'" :color="item.actions?.delete ? 'success' : 'error'" size="20"></v-icon>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-end">
            <v-btn
              icon="mdi-pencil-outline"
              size="small"
              variant="text"
              color="primary"
              @click="editItem(item)"
              title="Edit Role"
            ></v-btn>
            <v-btn
              icon="mdi-delete-outline"
              size="small"
              variant="text"
              color="error"
              @click="deleteItem(item)"
              title="Delete Role"
            ></v-btn>
          </div>
        </template>

        <template v-slot:no-data>
          <div class="text-center py-10">
            <v-avatar size="56" color="sandLight" class="mb-3">
              <v-icon icon="mdi-shield-lock-outline" color="sandDark" size="28"></v-icon>
            </v-avatar>
            <div class="font-serif font-weight-bold text-forest text-body-1 mb-1">{{ $t('noRecords') }}</div>
            <v-btn class="btn-editorial-primary px-5 mt-2" size="small" @click="initialize">
              {{ $t('Reset') }}
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog Create / Edit Role -->
    <v-dialog v-model="dialog" max-width="640px" persistent>
      <v-card class="editorial-card rounded-xl overflow-hidden">
        <div class="px-6 py-4 bg-forest-green text-white d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-avatar size="34" color="rgba(255,255,255,0.15)" class="mr-3">
              <v-icon icon="mdi-shield-account-outline" color="sand" size="18"></v-icon>
            </v-avatar>
            <div class="font-serif text-h6 font-weight-bold">{{ formTitle }}</div>
          </div>
          <v-btn icon="mdi-close" variant="text" color="white" @click="close"></v-btn>
        </div>

        <v-card-text class="pa-6 bg-white">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="editedItem.name"
                label="Role Name"
                variant="outlined"
                density="comfortable"
                color="primary"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                :items="items"
                v-model="editedItem.subject"
                item-title="title"
                item-value="title"
                :label="$t('Subject')"
                variant="outlined"
                density="comfortable"
                color="primary"
              ></v-select>
            </v-col>

            <v-col cols="12">
              <div class="editorial-tag text-sand-dark mb-2">Role Permissions</div>
              <div class="d-flex flex-wrap gap-4 pa-4 bg-warm-ivory rounded-lg border-editorial">
                <v-checkbox v-model="editedItem.actions.read" label="Read" color="primary" density="compact" hide-details class="mr-4"></v-checkbox>
                <v-checkbox v-model="editedItem.actions.create" label="Create" color="primary" density="compact" hide-details class="mr-4"></v-checkbox>
                <v-checkbox v-model="editedItem.actions.update" label="Update" color="primary" density="compact" hide-details class="mr-4"></v-checkbox>
                <v-checkbox v-model="editedItem.actions.delete" label="Delete" color="primary" density="compact" hide-details></v-checkbox>
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="px-6 py-3 bg-white">
          <v-spacer></v-spacer>
          <v-btn variant="text" rounded="pill" class="px-5 font-weight-medium" @click="close">
            {{ $t('Cancel') }}
          </v-btn>
          <v-btn class="btn-editorial-primary px-6" rounded="pill" @click="save">
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
          This operation will delete this role permission and cannot be undone.
        </p>
        <div class="d-flex justify-center gap-3">
          <v-btn variant="text" rounded="pill" class="px-5 mr-2" @click="closeDelete">
            {{ $t('Cancel') }}
          </v-btn>
          <v-btn color="error" class="px-6 font-weight-semibold" rounded="pill" @click="deleteItemConfirm">
            {{ $t('OK') }}
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRolesStore } from '@/stores/roles'

const roles = useRolesStore()

const dialog = ref(false)
const dialogDelete = ref(false)
const editedIndex = ref(-1)
const deleteId = ref(-1)

const headers = ref([
  { text: 'Role', value: 'name', align: 'start' },
  { text: 'Subject', value: 'subject' },
  { text: 'Read', value: 'actions.read' },
  { text: 'Create', value: 'actions.create' },
  { text: 'Update', value: 'actions.update' },
  { text: 'Delete', value: 'actions.delete' },
  { text: 'Actions', value: 'actions', sortable: false, align: 'end' }
])

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
  { title: 'Trips' },
  { title: 'Vehicles' },
  { title: 'Users' },
  { title: 'Billing' },
  { title: 'Notifications' },
  { title: 'TermsConditions' },
  { title: 'Roles' },
  { title: 'Settings' }
])

const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'New Role' : 'Edit Role'
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

const initialize = () => {
  roles.fetchRoles()
}

const openCreateDialog = () => {
  editedItem.value = JSON.parse(JSON.stringify(defaultItem.value))
  editedIndex.value = -1
  dialog.value = true
}

const editItem = (item) => {
  editedIndex.value = (roles.getRoles || []).indexOf(item)
  editedItem.value = JSON.parse(JSON.stringify(item))
  dialog.value = true
}

const deleteItem = (item) => {
  deleteId.value = item._id
  dialogDelete.value = true
}

const deleteItemConfirm = () => {
  roles.deleteRoles(deleteId.value)
  closeDelete()
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
    deleteId.value = -1
  })
}

const save = () => {
  if (editedIndex.value > -1) {
    roles.editRoles(editedItem.value)
  } else {
    roles.addRoles(editedItem.value)
  }
  close()
}
</script>

<style scoped>
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
</style>