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
            :items="ads.getAds"
            :loading="!ads.getAds"
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
                    {{ item.ownerId?.firstName + ' ' + item.ownerId?.lastName }}
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
                <v-toolbar-title>{{ $t('Ads') }}</v-toolbar-title>
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
                        <v-row>
                            <v-col
                                cols="4"
                            >
                                <v-checkbox
                                    v-model="editedItem.published"
                                    :label="$t('publish?')"
                                ></v-checkbox>
                            </v-col>

                            <v-col
                                cols="4"
                            >
                                <v-select
                                    :items="items"
                                    v-model="editedItem.billingStatus"
                                    :label="$t('billingStatus')"
                                    @update:modelValue="onPayedChange"
                                ></v-select>
                            </v-col>
                            
                        </v-row>
                        <v-row  justify="center">
                            <v-col
                                cols="6"
                            >
                                <h3>Advertising photo</h3>
                                <v-avatar 
                                    size="100%"
                                    rounded="lg"
                                    v-show="editedIndex > -1"
                                > 
                                    <v-img 
                                        :src="editedItem.img"
                                        contain
                                        width="400"
                                        height="300"
                                        style="float: right; border: 1px solid;"
                                        alt="Image"
                                    >             
                                    </v-img> 
                                </v-avatar>
                            </v-col>
                            <v-col
                                cols="6"
                            >
                                <h3>billing photo</h3>
                                <v-avatar 
                                    size="100%"
                                    rounded="lg"
                                    v-show="editedIndex > -1"
                                > 
                                    <v-img 
                                        :src="editedItem.billingImg"
                                        contain
                                        width="400"
                                        height="300"
                                        style="float: right; border: 1px solid;"
                                        alt="Image"
                                    >             
                                    </v-img> 
                                </v-avatar>
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
    import { useAdsStore } from '@/stores/advertising'

    const ads = useAdsStore()

    let search = ref(''),
        dialog = ref(false),
        dialogDelete = ref(false),
        loadingDelete = ref(false),
        headers = ref([
            {
                text: 'Name',
                align: 'start',
                sortable: false,
                value: 'ownerId',
            },
            { text: 'price', value: 'price' },
            { text: 'page', value: 'page' },
            { text: 'space', value: 'space' },
            { text: 'sector', value: 'sector' },
            { text: 'duration', value: 'duration' },
            { text: 'startDate', value: 'startDate' },
            { text: 'endDate', value: 'endDate'},
            { text: 'published', value: 'published'},
            { text: 'billingStatus', value: 'billingStatus' },
            { text: 'Actions', value: 'actions', sortable: false },
        ]),
        loading = ref(false),
        err = ref(''),
        editedIndex = ref(-1),
        deleteId = ref(-1),
        editedItem = ref({
            name: ''
        }),
        defaultItem = ref({
            name: ''
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
            ads.fetchAds()
        }

        const onPayedChange = () => {
            console.log('Selected:', editedItem.value.billingStatus)
            if (editedItem.value.billingStatus === 'paid') {
                editedItem.value.payed = true
            }
        }

        const editItem = (item) => {
            editedIndex.value = ads.getAds.indexOf(item)
            editedItem.value = Object.assign({}, item)
            dialog.value = true
        }

        const deleteItem = (item) => {
            editedIndex.value = ads.getAds.indexOf(item)
            deleteId.value = item._id
            editedItem.value = Object.assign({}, item)
            dialogDelete.value = true
        }

        const deleteItemConfirm = () => {
            loadingDelete.value = true
            ads.deleteAds(deleteId.value).then(() => {
                ads.getAds.splice(editedIndex.value, 1)
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
                
                ads.editAds(editedItem.value).then(() => {
                    Object.assign(ads.ads[editedIndex.value], editedItem.value)
                   
                    loading.value = false
                    close()
                    initialize()
                })
            } else {
                ads.addAds(editedItem.value).then(() => {
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