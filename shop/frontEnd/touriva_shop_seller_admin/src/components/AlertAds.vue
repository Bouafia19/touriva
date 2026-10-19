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
        <!-- <v-skeleton-loader v-if="firstLoad" :loading="loadingTab" type="table" height="100%"></v-skeleton-loader> -->
        <v-data-table
            :headers="filterHeaders"
            :items="ads"
            :item-class="itemRowBackground"
            :loading="!ads"
            :search="search"
            @click:row="editItem"
        >
            <template v-slot:headers="{ columns, isSorted, getSortIcon, toggleSort }">
                <tr style="color: #102D27;">
                    <template v-for="column in columns" :key="column.key">
                        <td>
                            {{ column.text }}
                        </td>
                    </template>
                </tr>
            </template>

            <template v-slot:[`item.ownerId`]="{ item }">
                <div v-if="item.ownerId.lastName || item.ownerId.firstName">
                    {{ item.ownerId.firstName + ' ' + item.ownerId.lastName }}
                </div>
                <div v-else>
                    {{ item.ownerId.companyName }}
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
                    rounded
                    outlined
                    dense
                ></v-text-field>
                
                <v-spacer></v-spacer>
                <v-dialog
                    v-model="dialog"
                    :max-width="editedItem.typeAccount != 'ordinary' ? '60%' : '500px'"
                >

                <!-- <template v-slot:[`item.vehicleId.photo`]="{ item }">
                    <v-img :src="item.vehicleId.photo" style="width: 100px; height: 100px"/>
                </template> -->

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

<script>
    import { useAdsStore } from '@/stores/advertising'
    import { mapState, mapActions } from "pinia"

    export default {
        name: "AlertAds",
        props: ['ads'],

        data: () => ({
            search: '',
            dialog: false,
            dialogDelete: false,
            headers: [
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
                { text: 'billingStatus', value: 'billingStatus' }
            ],
            items: [
                { label: 'administrator', value: 'administrator'},
                { label: 'client', value: 'client'},
                { label: 'partner', value: 'partner'}
            ],
            loading: false,
            err: '',
            editedIndex: -1,
            editedItem: {
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
            },
            defaultItem: {
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
            },
            tab: null,
            items: ['paid', 'rejected'],
            loadingTab: true,
            firstLoad: true,
            
        }),

        computed: {
            // ...mapState(useAdsStore, ["ads", "vehicles", "roles", "loading", "pendingTransportersFiles"]),
            // ...mapGetters(['vehicles', 'roles']),
            formTitle () {
                return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
            },
            filterHeaders(){
                // if(!this.$can('update', 'Ads') && !this.$can('delete', 'Ads')){
                //     return this.headers.filter((e) => e.text != 'Actions')
                // }else{
                    return this.headers
                // }
            }
        },

        watch: {
            dialog (val) {
                val || this.close()
            },
            dialogDelete (val) {
                val || this.closeDelete()
            },
        },

        created () {
            this.initialize()
        },

        methods: {
            ...mapActions(useAdsStore, ["fetchAds", "addAd", "editAds", "deleteAd"]),
            // ...mapActions(['fetchAds', 'addAds', 'editAds', 'deleteAds', 'fetchVehicles', 'fetchRoles']),

            formatPrice(price){
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'dzd',
                }).format(price)
            },

            formatDate(date){
                return new Date(date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                })
            },

            getBillingColor(status) {
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
            },

            itemRowBackground(item) {
                return item.activated === false ? 'style-1' : 'style-2'
            },

            async initialize () {
                this.loading = true
                await Promise.all([this.fetchAds()])
                this.loading = false
                // this.fetchAds()
                // this.fetchVehicles()
                // this.fetchRoles()
            },

            editItem (e, {item}) {
                console.log('item', item)
                this.editedIndex = this.ads.indexOf(item)
                this.editedItem = Object.assign({}, item)
                this.dialog = true
            },

            async activateItem (item) {
                this.loading = true
                item.activated = !item.activated
                try {
                    await this.editAds(item)
                } catch (error) {
                    this.err = error
                    console.log('error update ad', error)
                }
                this.loading = false
            },

            deleteItem (item) {
                // this.editedIndex = this.ads.indexOf(item)
                this.editedIndex = item._id
                this.editedItem = Object.assign({}, item)
                this.dialogDelete = true
            },

            deleteItemConfirm () {
                // this.ads.splice(this.editedIndex, 1)
                this.deleteAds(this.editedIndex)
                this.initialize()
                this.closeDelete()
            },

            close () {
                this.dialog = false
                this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
                })
            },

            closeDelete () {
                this.dialogDelete = false
                this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
                })
            },

            async createAd(){
                try {
                    await this.addAds(this.editedItem)
                } catch (error) {
                    this.err = error
                    console.log('error create ad', error)
                }
            },

            save () {
                this.loading = true
                if (this.editedIndex > -1) {
                   
                    this.editAds(this.editedItem).then(() => {
                        Object.assign(this.ads[this.editedIndex], this.editedItem)
                        this.loading = false
                        this.close()
                        this.initialize()
                    })
                } else {
                    this.createAd().then(() => {
                        this.close()
                        this.loading = false
                        this.initialize()
                    })
                }
                
                
            },
        }
    }
</script>

<style scoped>
    .v-data-table {
        border: 1px solid black;
    }
    :deep(table > thead > tr:last-child > th) {
        color: white !important;
        background-color: #102D27 !important;
    }
    :deep(.mdi-arrow-up::before) {
        color: white !important;
    }
    .v-card__title {
        background-color: #102D27;
        color: white;
    }
    .v-card__actions {
        background-color: #102D27;
    }
    :deep(.style-1) {
        color: white !important;
        background-color: #DC143C !important;
    }
    :deep(.style-2) {
        background-color: white !important;
    }
    :deep(.mdi-calculator-variant::before) {
        color: #102D27 !important;
    }
</style>