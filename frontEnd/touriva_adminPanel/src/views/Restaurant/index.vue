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
            :items="restaurants.getRestaurants"
            :loading="!restaurants.getRestaurants"
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

            <template v-slot:[`item.status`]="{ item }">
                <v-chip
                    v-if="!item.googleId"
                    :color="getColor(item)"
                    dark
                >
                    <div v-if="item.status == 'rejected'">
                        {{ $t('rejected') }}
                    </div>
                    <div v-if="item.status == 'pending'">
                        {{ $t('pendingStatus') }}
                    </div>
                    <div v-else-if="item.status == 'published'">
                        {{ $t('published') }}
                    </div>
                </v-chip>
                <span v-else>google</span>
            </template>

            <template v-slot:top>
            <v-toolbar
                flat
            >
                <v-toolbar-title>{{ $t('Restaurants') }}</v-toolbar-title>
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
                    :max-width="'500px'"
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
                        <v-row justify="center">
                            <v-col cols="12" md="12">
                                <v-text-field
                                    v-model="editedItem.name"
                                    label="Hotel Name"
                                    type="text"
                                    required
                                    />
                                </v-col>


                                <v-col cols="12" md="12">
                                    <v-autocomplete
                                        v-model="editedItem.wilayaId"
                                        :items="wilaya.getWilayas"
                                        label="Wilaya"
                                        item-title="name"
                                        item-value="_id"
                                        @update:modelValue="updateDaira()"
                                    ></v-autocomplete>
                                </v-col>

                                <v-col cols="12" md="12">
                                    <v-autocomplete
                                        v-model="editedItem.dairaId"
                                        :items="dairaItems"
                                        label="daira"
                                        item-title="name"
                                        item-value="_id"
                                        @update:modelValue="updateCommune()"
                                    ></v-autocomplete>
                                </v-col>

                                <v-col cols="12" md="12">
                                    <v-autocomplete
                                        v-model="editedItem.communeId"
                                        :items="communeItems"
                                        label="commune"
                                        item-title="name"
                                        item-value="_id"
                                        @update:modelValue="getCommuneId()"
                                    ></v-autocomplete>
                                </v-col>

                                <!-- Address -->
                                <v-col cols="12" md="12">
                                    <v-text-field
                                    v-model="editedItem.address"
                                    label="Address"
                                    type="text"
                                    />
                                </v-col>

                                <!-- Rating -->
                                <!-- <v-col cols="12" md="4">
                                    <v-text-field
                                    v-model.number="editedItem.rating"
                                    label="Rating"
                                    type="number"
                                    min="0"
                                    max="5"
                                    step="0.1"
                                    />
                                </v-col> -->

                                <!-- Latitude -->
                                <v-col cols="6" md="6">
                                    <v-text-field
                                        v-model.number="editedItem.latitude"
                                        label="Latitude"
                                        type="number"
                                    />
                                </v-col>

                                <!-- Longitude -->
                                <v-col cols="6" md="6">
                                    <v-text-field
                                        v-model.number="editedItem.longitude"
                                        label="Longitude"
                                        type="number"
                                    />
                                </v-col>

                                <!-- Phone -->
                                <v-col cols="12" md="8">
                                    <v-text-field
                                        v-model="editedItem.phone"
                                        label="Phone number"
                                        type="tel"
                                        placeholder="+213 555 123 456"
                                        prepend-inner-icon="mdi-phone"
                                        clearable
                                    />
                                </v-col>

                                <!-- Description -->
                                <v-col cols="12">
                                    <v-textarea
                                    v-model="editedItem.description"
                                    label="Description"
                                    rows="3"
                                    />
                                </v-col>

                                <!-- Image upload -->
                                 <v-col cols="12">
                                    <v-file-input 
                                        v-model="mainImg" 
                                        :label="$t('Photo')"
                                        outlined
                                        prepend-icon="mdi-camera"
                                        dense
                                        @change="onImageChange"
                                        class="mt-4"
                                    />
                                 </v-col>
                                
                                <v-col cols="12">
                                    <!-- Preview -->
                                    <v-img
                                        v-if="editedItem.photo"
                                        :src="editedItem.photo"
                                        max-height="200"
                                        class="mt-3"
                                        cover
                                    />
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
    import { useRestaurantsStore } from '@/stores/restaurants'
    import { useWilayasStore } from '@/stores/wilaya'
    import { useDairasStore } from '@/stores/daira'
    import { useCommunesStore } from '@/stores/commune'

    const wilaya = useWilayasStore()
    const daira = useDairasStore()
    const commune = useCommunesStore()

    const restaurants = useRestaurantsStore()

    let search = ref(''),
        dialog = ref(false),
        dialogDelete = ref(false),
        loadingDelete = ref(false),
        headers = ref([
            {
                text: 'Name',
                align: 'start',
                sortable: false,
                value: 'name',
            },
            { text: 'Address', value: 'address' },
            { text: 'Rating', value: 'rating' },
            { text: 'Phone', value: 'phone' },
            { text: 'Status', value: 'status' },
            { text: 'Actions', value: 'actions', sortable: false },
        ]),
        loading = ref(false),
        err = ref(''),
        editedIndex = ref(-1),
        deleteId = ref(-1),
        editedItem = ref({
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
        }),
        defaultItem = ref({
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
        }),
        mainImg = ref(null),
        wilayaId = ref(""),
        dairaItems = ref([]),
        dairaId = ref(""),
        communeItems = ref([]),
        communeId = ref(""),
        tab = ref(null),
        loadingTab = ref(true),
        firstLoad = ref(true)

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
            restaurants.fetchRestaurants()
            wilaya.fetchWilayas()
            daira.fetchDairas()
            commune.fetchCommunes()
        }

        const updateDaira = () => {
            dairaItems.value = daira.getDairas.filter(e => e.wilayaId === editedItem.value.wilayaId)
        }

        const updateCommune = () => {
            communeItems.value = commune.getCommunes.filter(e => e.dairaId === editedItem.value.dairaId)
        }

        const getCommuneId = () => {
        }

        const getColor = (valeur) => {
            if (valeur.status == 'pending') return '#FF8C00'
            else if (valeur.status == 'published') return '#28a74580'
            else if (valeur.status == 'rejected') return '#dc3545'
        }

        /* Convert image to base64 */
        const onImageChange = () => {
            const reader = new FileReader()
            reader.onload = (e) => {
                editedItem.value.photo = e.target.result
            }
            reader.readAsDataURL(mainImg.value)
        }

        const editItem = (item) => {
            editedIndex.value = restaurants.getRestaurants.indexOf(item)
            editedItem.value = Object.assign({}, item)
            dialog.value = true
        }

        const deleteItem = (item) => {
            editedIndex.value = restaurants.getRestaurants.indexOf(item)
            deleteId.value = item._id
            editedItem.value = Object.assign({}, item)
            dialogDelete.value = true
        }

        const deleteItemConfirm = () => {
            loadingDelete.value = true
            restaurants.deleteRestaurants(deleteId.value).then(() => {
                restaurants.getRestaurants.splice(editedIndex.value, 1)
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
            console.log('editedItem', editedItem.value)
            loading.value = true
            if (editedIndex.value > -1) {
                
                restaurants.editRestaurants(editedItem.value).then(() => {
                    Object.assign(restaurants.restaurants[editedIndex.value], editedItem.value)
                   
                    loading.value = false
                    close()
                    initialize()
                })
            } else {
                restaurants.addRestaurants(editedItem.value).then(() => {
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