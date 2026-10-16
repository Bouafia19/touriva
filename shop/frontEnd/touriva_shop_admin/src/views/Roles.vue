<template>
        <v-container>
        <v-data-table
            :headers="filterHeaders"
            :items="roles"
            sort-by="name"
            class="elevation-1"
        >
            <template v-slot:item.actions.read="{ item }">
                <v-simple-checkbox
                    v-model="item.actions.read"
                    disabled
                ></v-simple-checkbox>
            </template>

            <template v-slot:item.actions.create="{ item }">
                <v-simple-checkbox
                    v-model="item.actions.create"
                    disabled
                ></v-simple-checkbox>
            </template>

            <template v-slot:item.actions.update="{ item }">
                <v-simple-checkbox
                    v-model="item.actions.update"
                    disabled
                ></v-simple-checkbox>
            </template>

            <template v-slot:item.actions.delete="{ item }">
                <v-simple-checkbox
                    v-model="item.actions.delete"
                    disabled
                ></v-simple-checkbox>
            </template>

            <template v-slot:top>
            <v-toolbar
                flat
            >
                <v-toolbar-title>{{ $t('Roles')}}</v-toolbar-title>
                <v-divider
                class="mx-4"
                inset
                vertical
                ></v-divider>
                <v-spacer></v-spacer>
                <v-dialog
                v-model="dialog"
                max-width="700px"
                >
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                    color="next"
                    dark
                    class="mb-2"
                    v-bind="attrs"
                    v-on="on"
                    icon
                    >
                        <v-icon large>
                            mdi-plus-circle
                        </v-icon>
                    </v-btn>
                </template>
                <v-card>
                    <v-card-title>
                    <span class="text-h5">{{ formTitle }}</span>
                    </v-card-title>

                    <v-card-text>
                    <v-container>
                        <v-row>
                        <v-col
                            cols="auto"
                        >
                            <v-text-field
                                v-model="editedItem.name"
                                label="Name"
                            ></v-text-field>

                            <v-select
                                :items="items"
                                v-model="editedItem.subject"
                                item-value="title"
                                :label="$t('Subject')"
                            >
                                <template v-slot:selection="data">
                                    <!-- HTML that describe how select should render items when the select is open -->
                                    {{ $t(data.item.title) }}
                                </template>
                                <template v-slot:item="data">
                                    <!-- HTML that describe how select should render items when the select is open -->
                                    {{ $t(data.item.title) }}
                                </template>
                            </v-select>
                        
                            <!-- <v-text-field
                                v-model="editedItem.subject"
                                label="Subject"
                            ></v-text-field> -->
                        </v-col>
                        <v-col
                            cols="auto"
                        >
                            <v-checkbox
                                v-model="editedItem.actions.read"
                                label="Read"
                            ></v-checkbox>
                       
                            <v-checkbox
                                v-model="editedItem.actions.create"
                                label="Create"
                            ></v-checkbox>
                       
                            <v-checkbox
                                v-model="editedItem.actions.update"
                                label="Update"
                            ></v-checkbox>
        
                            <v-checkbox
                                v-model="editedItem.actions.delete"
                                label="Delete"
                            ></v-checkbox>
                        </v-col>
            
                        </v-row>
                    </v-container>
                    </v-card-text>

                    <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="error"
                        text
                        @click="close"
                    >
                        Cancel
                    </v-btn>
                    <v-btn
                        color="success"
                        text
                        @click="save"
                    >
                        Save
                    </v-btn>
                    </v-card-actions>
                </v-card>
                </v-dialog>
                <v-dialog v-model="dialogDelete" max-width="500px">
                <v-card>
                    <v-card-title class="text-h5">Are you sure you want to delete this item?</v-card-title>
                    <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="error" text @click="closeDelete">Cancel</v-btn>
                    <v-btn color="success" text @click="deleteItemConfirm">OK</v-btn>
                    <v-spacer></v-spacer>
                    </v-card-actions>
                </v-card>
                </v-dialog>
            </v-toolbar>
            </template>
            <template v-slot:item.actions="{ item }">
            <v-icon
                small
                class="mr-2"
                color="primary"
                @click="editItem(item)"
            >
                mdi-pencil
            </v-icon>
            <!-- <v-icon
                small
                color="error"
                @click="deleteItem(item)"
            >
                mdi-delete
            </v-icon> -->
            </template>
            <template v-slot:no-data>
                <v-btn
                    color="primary"
                    text
                >
                    {{ $t('noRecords')}}
                </v-btn>
            </template>
        </v-data-table>
        </v-container>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { useRolesStore } from '@/stores/roles'

    const roles = useRolesStore()

    let dialog = ref(false),
        dialogDelete = ref(false),
        headers = ref([
            {
            text: 'Role',
            align: 'start',
            sortable: false,
            value: 'name',
            },
            { text: 'Subject', value: 'subject' },
            { text: 'Read', value: 'actions.read' },
            { text: 'Create', value: 'actions.create' },
            { text: 'Update', value: 'actions.update' },
            { text: 'Delete', value: 'actions.delete' },
            { text: 'Actions', value: 'actions', sortable: false },
        ]),
        editedIndex = ref(-1),
        editedItem = ref({
            name: '',
            subject: '',
            actions: {
                read: false,    
                create: false,
                update: false,
                delete: false
            }
        }),
        defaultItem = ref({
            name: '',
            subject: '',
            actions: {
                read: false,    
                create: false,
                update: false,
                delete: false
            }
        }),
        items = ref([
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
            return editedIndex.value === -1 ? 'New Item' : 'Edit Item'
        })

        watch(dialog, (diaNew, diaOld) => {
            diaNew || close()
        })

        watch(dialogDelete, (dialogDelNew, dialogDelOld) => {
            dialogDelNew || closeDelete()
        })

        onMounted(()=>{
            initialize()
        })
    

        const initialize = () => {
            roles.fetchRoles()
        }

        const editItem  = (item) => {
            editedIndex.value = roles.getRoles.indexOf(item)
            editedItem.value = Object.assign({}, item)
            dialog.value = true
        }

        const deleteItem = (item) => {
            editedIndex.value = item._id
            dialogDelete.value = true
        }

        const deleteItemConfirm = () => {
            roles.deleteRoles(this.editedIndex)
            this.closeDelete()
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
            if (editedIndex.value > -1) {
                roles.editRoles(editedItem.value)
            } else {
            roles.addRoles(editedItem.value)
            }
            close()
        }
</script>