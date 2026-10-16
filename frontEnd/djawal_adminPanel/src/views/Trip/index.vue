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
            :items="trips.getTrips"
            :loading="!trips.getTrips"
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
                    :color="getColor(item)"
                    dark
                >
                    <div v-if="item.status == 'created'">
                        {{ $t('not published') }}
                    </div>
                    <div v-if="item.status == 'pending'">
                        {{ $t('pending') }}
                    </div>
                    <div v-else-if="item.status == 'published'">
                        {{ $t('published') }}
                    </div>
                </v-chip>
            </template>

            <template v-slot:top>
            <v-toolbar
                flat
            >
                <v-toolbar-title>{{ $t('Trips') }}</v-toolbar-title>
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
                                        label="Trip Name"
                                        type="text"
                                        required
                                        readonly
                                    />
                                    
                                
                                    <v-text-field
                                        :model-value="editedItem.creator?.companyName || editedItem.creator?.lastName"
                                        label="Trip Creator"
                                        type="text"
                                        required
                                        readonly
                                    />
                                    
                                    <v-text-field
                                        :model-value="editedItem.destination?.name"
                                        label="Trip Destination"
                                        type="text"
                                        required
                                        readonly
                                    />

                                    <v-text-field
                                        :model-value="formatPrice(editedItem.price)"
                                        label="Trip Price"
                                        type="text"
                                        required
                                        readonly
                                    />

                                    <v-card class="pa-4 mb-6" variant="outlined">
                                    <h3 class="mt-6 mb-4">Trip Image</h3>

                                    <v-img
                                        :src="editedItem.image"
                                        height="200"
                                        width="100%"
                                    ></v-img>
                                    
                                    <h3 class="mt-6 mb-4">Trip Itinerary</h3>
                                    
                                    <div v-for="day in editedItem.items" :key="day.day" class="mb-6">
                                        <div class="d-flex align-center justify-space-between mb-2">
                                            <!-- Left: Day avatar + text -->
                                            <div class="d-flex align-center">
                                                <v-avatar size="32" class="mr-3" color="primary">
                                                <span class="white--text">{{ day.day }}</span>
                                                </v-avatar>
                                                
                                                <div class="font-weight-medium">Day {{ day.day }}</div>
                                            </div>
                                        </div>
                                    

                                        <v-card 
                                            v-for="element in day.items"
                                            :key="element.id"
                                            class="mb-3"
                                        >
                                            <v-row no-gutters>
                                            <!-- Left: Image -->
                                            <v-col cols="4">
                                                <v-img :src="element.image" height="100px" cover />
                                            </v-col>

                                            <!-- Right: Info + Actions -->
                                            <v-col cols="8" class="pa-3">

                                                <!-- Title, Time, Menu -->
                                                <div class="d-flex justify-space-between align-start">

                                                <!-- Text info -->
                                                <div>
                                                    <div class="font-weight-medium">{{ element.title }}</div>
                                                    <div class="text-caption">{{ element.time }}</div>
                                                </div>
                                                </div>

                                                <!-- Description -->
                                                <div class="mt-2 text-body-2">{{ element.description }}</div>

                                            </v-col>
                                            </v-row>
                                        </v-card>
                                    </div>
                                    </v-card>

                                    <v-checkbox
                                        v-model="editedItem.published"
                                        label="Status"
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
    import { useTripsStore } from '@/stores/trips'
    import { useWilayasStore } from '@/stores/wilaya'
    import { useDairasStore } from '@/stores/daira'
    import { useCommunesStore } from '@/stores/commune'

    const wilaya = useWilayasStore()
    const daira = useDairasStore()
    const commune = useCommunesStore()

    const trips = useTripsStore()

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
            // { text: 'Address', value: 'address' },
            { text: 'Rating', value: 'rating' },
            { text: 'Status', value: 'status' },
            { text: 'Actions', value: 'actions', sortable: false },
        ]),
        loading = ref(false),
        err = ref(''),
        editedIndex = ref(-1),
        deleteId = ref(-1),
        editedItem = ref({
            name: '',
            creator: '',
            destination: '',
            price: '',
            image: '',
            items: [],
            status: '',
            published: false
        }),
        defaultItem = ref({
            name: '',
            creator: '',
            destination: '',
            price: '',
            image: '',
            items: [],
            status: '',
            published: false
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

        const formatPrice = (price) => {
            if (!price) return ''
            return new Intl.NumberFormat('fr-FR').format(price) + ' DA'
        }

        const getColor = (valeur) => {
            if (valeur.status == 'pending') return '#FF8C00'
            else if (valeur.status == 'published') return '#28a74580'
        }

        onMounted(()=>{
            initialize()
        })

        const initialize = () => {
            trips.fetchTrips()
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

        /* Convert image to base64 */
        const onImageChange = () => {
            const reader = new FileReader()
            reader.onload = (e) => {
                editedItem.value.photo = e.target.result
            }
            reader.readAsDataURL(mainImg.value)
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
            console.log('editedItem', editedItem.value)
            loading.value = true

            if(editedItem.value.published){
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
:deep(.v-card .v-card-title) {
    background-color: #00366f;
    color: white;
}
:deep(.v-card-actions) {
    background-color: #00366f;
}
</style>