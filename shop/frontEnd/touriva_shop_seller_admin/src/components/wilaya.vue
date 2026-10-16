<template>
    <v-container>
        <div class="ma-2">
            <v-alert
                dense
                outlined
                type="error"
                v-if="err"
            >
                {{ $t(err) }}
            </v-alert>
        </div>
        
        <v-data-table
            :headers="headers"
            :items="wilayas.getWilayas"
            :loading="!wilayas.getWilayas"
            :search="search"
        >
            <template v-slot:headers="{ columns, isSorted, getSortIcon, toggleSort }">
                <tr style="color: #00366f;">
                <template v-for="column in columns" :key="column.key">
                    <td>
                    {{ $t(column.text) }}
                    </td>
                </template>
                </tr>
            </template>

            <template v-slot:top>
            <v-toolbar
                flat
            >
                <v-toolbar-title>{{ $t('Wilayas') }}</v-toolbar-title>
                <v-divider
                class="mx-4"
                inset
                vertical
                ></v-divider>

                 <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    :label="$t('Search')"
                    single-line
                    hide-details
                    class="shrink mx-4"
                    
                    dense
                ></v-text-field>
                
                <v-spacer></v-spacer>
                <v-dialog
                    v-model="dialog"
                    :max-width="'800px'"
                >

                
                <template v-slot:activator="{ props: activatorProps }">
                    <v-btn
                        color="next"
                        dark
                        class="mb-2"
                        v-bind="activatorProps"
                        icon
                        size="x-large"
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
                            <v-row align="center" justify="center">
                                <v-col
                                    
                                >
                                    <v-text-field
                                        v-model="editedItem.name"
                                        label="Name"
                                        type="text"
                                    ></v-text-field>

                                    <daira :dairasArray="dairaItems"/>
                        
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
                        :loading="loading"
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
                    <v-btn 
                        color="success" 
                        text 
                        @click="deleteItemConfirm"
                        :loading="loadingDelete"
                    >
                        OK
                    </v-btn>
                    <v-spacer></v-spacer>
                    </v-card-actions>
                </v-card>
                </v-dialog>
            </v-toolbar>
            </template>
            <template v-slot:[`item.actions`]="{ item }">
            <v-icon
                small
                class="mr-2"
                @click="editItem(item)"
                color="primary"
                
            >
                mdi-pencil
            </v-icon>
           
            <v-icon
                small
                @click="deleteItem(item)"
                color="error"
               
            >
                mdi-delete
            </v-icon> 
            </template>
            <template v-slot:no-data>
            <v-btn
                color="primary"
                @click="initialize"
            >
                Reset
            </v-btn>
            </template>
        </v-data-table>
    </v-container>
</template>

<script setup>
    import { ref, onMounted, nextTick, computed, watch } from 'vue'
    import { useWilayasStore } from '@/stores/wilaya'
    import { useDairasStore } from '@/stores/daira'
    import daira from '@/components/daira.vue'

    const wilayas = useWilayasStore()
    const dairas = useDairasStore()

    let search = ref(''),
        dialog = ref(false),
        dialogDelete = ref(false),
        loadingDelete = ref(false),
        headers = ref([
            { text: 'Name', value: 'name' },
            { text: 'Actions', value: 'actions', sortable: false },
        ]),
        loading = ref(false),
        err = ref(''),
        editedIndex = ref(-1),
        deleteId = ref(-1),
        editedItem = ref({
            name: '',   
        }),
        defaultItem = ref({
            name: '',
        }),
        loadingTab = ref(true),
        firstLoad = ref(true),
        dairaItems = ref([])
        
        const formTitle = computed(() => {
            return editedIndex.value === -1 ? 'New Item' : 'Edit Item'
        })

        const filterHeaders = computed(() => {
           
                return headers.value
           
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
            wilayas.fetchWilayas()
        }

        const editItem = (item) => {
            dairaItems.value = dairas.getDairas.filter(e => e.wilayaId === item._id)
            editedIndex.value = wilayas.getWilayas.indexOf(item)
            editedItem.value = Object.assign({}, item)
            dialog.value = true
        }

        const deleteItem = (item) => {
            editedIndex.value = wilayas.getWilayas.indexOf(item)
            deleteId.value = item._id
            editedItem.value = Object.assign({}, item)
            dialogDelete.value = true
        }

        const deleteItemConfirm = () => {
            loadingDelete.value = true
            wilayas.deleteUsers(deleteId.value).then(() => {
                wilayas.splice(editedIndex.value, 1)
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
                
                wilayas.editUsers(editedItem.value).then(() => {
                    Object.assign(wilayas.wilayas[editedIndex.value], editedItem.value)
                    loading.value = false
                    close()
                    initialize()
                })

            } else {

                wilayas.createUser().then(() => {
                    close()
                    loading.value = false
                    initialize()
                })
            }   
        }
</script>

<style scoped>
:deep(.v-card .v-card-title) {
    background-color: #00366f;
    color: white;
}
:deep(.v-card-actions) {
    background-color: #00366f;
}
</style>