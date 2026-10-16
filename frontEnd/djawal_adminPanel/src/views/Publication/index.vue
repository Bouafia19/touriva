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
            :items="announcements.getAnnouncements"
            :loading="!announcements.getAnnouncements"
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

            <template v-slot:[`item.ownerId`]="{ item }">
                <div v-if="item.ownerId?.lastName || item.ownerId?.firstName">
                    {{ item.ownerId.firstName + ' ' + item.ownerId.lastName }}
                </div>
                <div v-else>
                    {{ item.ownerId?.companyName }}
                </div>
            </template>

            <template v-slot:[`item.startDate`]="{ item }">
                <div v-if="item.startDate">
                    {{ formatDate(item.startDate) }}
                </div>
            </template>

            <template v-slot:[`item.endDate`]="{ item }">
                <div v-if="item.endDate">
                    {{ formatDate(item.endDate) }}
                </div>
            </template>

            <template v-slot:[`item.price`]="{ item }">
                <div v-if="item.price">
                    {{ formatPrice(item.price) }}
                </div>
            </template>

            <template v-slot:[`item.published`]="{ item }">
                <v-chip
                    :color="item.published ? 'success' : 'error'"
                    text-color="white"
                    small
                    class="ma-1"
                    variant="flat"
                >
                    {{ item.published ? 'Yes' : 'No' }}
                </v-chip>
            </template>

            <template v-slot:[`item.billingStatus`]="{ item }">
                <v-chip
                    :color="getBillingColor(item.billingStatus)"
                    text-color="white"
                    small
                    class="ma-1"
                    variant="flat"
                >
                    {{ item.billingStatus }}
                </v-chip>
            </template>

            <template v-slot:top>
            <v-toolbar
                flat
            >
                <v-toolbar-title>{{ $t('Announcements') }}</v-toolbar-title>
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
                    :max-width="'900px'"
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
                            <v-col
                                :cols="editedItem.typeAccount != 'ordinary' ? '4' : ''"
                            >
                                <v-text-field
                                    v-model="editedItem.name"
                                    label="Name"
                                    type="text"
                                    readonly
                                ></v-text-field>

                                <v-text-field
                                    v-model="editedItem.description"
                                    label="description"
                                    type="text"
                                    readonly
                                ></v-text-field>

                                <v-text-field
                                    v-model="editedItem.category.name"
                                    label="categoryName"
                                    type="text"
                                    readonly
                                    v-if="editedItem.category"
                                ></v-text-field>

                                <v-text-field
                                    v-model="editedItem.brandId.name"
                                    label="brandName"
                                    type="text"
                                    readonly
                                    v-if="editedItem.brandId"
                                ></v-text-field>

                                <v-list two-line>
                                    <v-list-subheader>{{ $t('features') }}</v-list-subheader>
                                    <v-list-item
                                        v-for="(feature, index) in editedItem.features"
                                        :key="index"
                                    >
                                        <v-list-item-title>
                                        {{ feature.key }}: {{ feature.value }}
                                        </v-list-item-title>
                                    </v-list-item>
                                </v-list>

                                <v-text-field
                                    v-model="editedItem.ownerId.companyName"
                                    label="RaisonSocial"
                                    type="text"
                                    v-if="editedItem.ownerId?.companyName"
                                    readonly
                                ></v-text-field>
                    
                                <v-text-field
                                    v-model="editedItem.ownerId.firstName"
                                    label="firstName"
                                    type="text"
                                    readonly
                                    v-if="editedItem.ownerId?.firstName"
                                ></v-text-field>

                                <v-text-field
                                    v-model="editedItem.ownerId.lastName"
                                    label="lastName"
                                    type="text"
                                    readonly
                                    v-if="editedItem.ownerId?.lastName"
                                ></v-text-field>

                                <v-text-field
                                    v-model="editedItem.ownerId.phone"
                                    label="phone"
                                    type="text"
                                    readonly
                                    v-if="editedItem.ownerId?.phone"
                                ></v-text-field>

                                 <v-text-field
                                    v-model="editedItem.price"
                                    label="price"
                                    type="text"
                                    readonly
                                    v-if="editedItem.price"
                                ></v-text-field>

                                <v-checkbox
                                    v-model="editedItem.paid"
                                    :label="$t('paid')"
                                    readonly
                                ></v-checkbox>

                                <v-checkbox
                                    v-model="editedItem.published"
                                    :label="$t('published')"
                                ></v-checkbox>

                            </v-col>
                            <v-col
                                cols="8"
                            >
                                <v-card
                                    class="mb-2"
                                >
                                    <v-toolbar
                                        flat
                                        color="next"
                                        dark
                                    >
                                        <v-toolbar-title>{{ $t('photo') }}</v-toolbar-title>
                                    </v-toolbar>

                                    <v-card-text>
                                        <v-img
                                            :src="editedItem.img"
                                            height="300"
                                            cover
                                        ></v-img>

                                    </v-card-text>

                                </v-card>
                                <v-card>
                                    <v-toolbar
                                        flat
                                        color="next"
                                        dark
                                    >
                                        <v-toolbar-title>{{ $t('thumbnails') }}</v-toolbar-title>
                                    </v-toolbar>

                                    <v-tabs
                                        v-model="tab"
                                    >
                                        <v-tab
                                            v-for="(item, index) in editedItem.thumbnails"
                                            :key="index"
                                            :value="index"
                                        >
                                            {{ index }}
                                        </v-tab>
                                    </v-tabs>

                                    <v-card-text>
                                        <v-tabs-window 
                                            v-model="tab"
                                        > 
                                            <v-tabs-window-item 
                                                v-for="(item, index) in editedItem.thumbnails"
                                                :key="index"
                                                :value="index"
                                            >
                                                <v-img
                                                    :src="editedItem.thumbnails[index]"
                                                    height="300"
                                                    cover
                                                ></v-img>
                                            </v-tabs-window-item>
                                        </v-tabs-window>
                                    </v-card-text>
                                </v-card>
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
    import { useAnnouncementsStore } from '@/stores/announcements'

    const announcements = useAnnouncementsStore()

    let search = ref(''),
        dialog = ref(false),
        dialogDelete = ref(false),
        loadingDelete = ref(false),
        headers = ref([
            {
                text: 'Owner',
                align: 'start',
                sortable: false,
                value: 'ownerId',
            },
            { text: 'price', value: 'price' },
            { text: 'name', value: 'name' },
            { text: 'description', value: 'description' },
            { text: 'category', value: 'category.name' },
            //{ text: 'duration', value: 'duration' },
            //{ text: 'startDate', value: 'startDate' },
            //{ text: 'endDate', value: 'endDate'},
            { text: 'published', value: 'published'},
            //{ text: 'billingStatus', value: 'billingStatus' },
            { text: 'Actions', value: 'actions', sortable: false },
        ]),
        loading = ref(false),
        err = ref(''),
        editedIndex = ref(-1),
        deleteId = ref(-1),
        editedItem = ref({
            name: '',
            category: {
                _id: '',
                name: ''
            }
        }),
        defaultItem = ref({
            name: '',
            category: {
                _id: '',
                name: ''
            }
        }),
        tab = ref(null),
        loadingTab = ref(true),
        firstLoad = ref(true),
        items = ref(['paid', 'rejected'])
    const selected = ref(null)

        const formatPrice = (price) => {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'dzd',
            }).format(price)
        }

        const formatDate = (date) => {
            return new Date(date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            })
        }

        function getBillingColor(status) {
            switch (status) {
                case 'draft':
                return '#9E9E9E'; // Grey
                case 'pending':
                return '#2196F3'; // Blue
                case 'paid':
                return '#17a2b8'; // Teal
                case 'cancelled':
                return '#DC143C'; // Crimson
                default:
                return '#BDBDBD'; // Light Grey fallback
            }
        }

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
            announcements.fetchAnnouncements()
        }

        const onPayedChange = () => {
            console.log('Selected:', editedItem.value.billingStatus)
            if (editedItem.value.billingStatus === 'paid') {
                editedItem.value.payed = true
            }
        }

        const editItem = (item) => {
            editedIndex.value = announcements.getAnnouncements.indexOf(item)
            editedItem.value = Object.assign({}, item)
            dialog.value = true
        }

        const deleteItem = (item) => {
            editedIndex.value = announcements.getAnnouncements.indexOf(item)
            deleteId.value = item._id
            editedItem.value = Object.assign({}, item)
            dialogDelete.value = true
        }

        const deleteItemConfirm = () => {
            loadingDelete.value = true
            announcements.deleteAnnouncements(deleteId.value).then(() => {
                announcements.getAnnouncements.splice(editedIndex.value, 1)
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
                
                announcements.editAnnouncements(editedItem.value).then(() => {
                    Object.assign(announcements.announcements[editedIndex.value], editedItem.value)
                   
                    loading.value = false
                    close()
                    initialize()
                })
            } else {
                announcements.addAnnouncements(editedItem.value).then(() => {
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