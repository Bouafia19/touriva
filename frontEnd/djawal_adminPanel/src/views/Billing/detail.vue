<template>
        <v-container>

            <invoice
                :announcements="announcements"
                ref="report"
                v-show="false"
                :partner="partner"
                :company="company.getCompany"
                :billing="billing"
            />

            <v-row>
                <v-col class="d-inline-flex">
                    <h1>{{ $t('Billing') }}</h1>
                    <v-spacer></v-spacer>
                    <v-btn
                        outlined
                        rounded
                        text
                        color="primary"
                        @click="newBilling"
                        :loading="loadingNewBilling"
                        v-show="total > 0"
                    >
                        {{ $t('makePayment') }}
                    </v-btn>
                </v-col>
            </v-row>

            <!-- <v-card
                class="mx-auto"
                outlined
            >
                <v-list-item three-line>
                    <v-list-item-content>
                        <div class="text-overline mb-4">
                            {{ $t('total') + ': ' + formatNumber(subTotal) }}
                        </div>
                        <v-list-item-title class="text-h5 mb-1">
                            {{ $t('net') + ': ' + formatNumber(total) }}
                        </v-list-item-title>
                        <v-list-item-subtitle>Greyhound divisely hello coldly fonwderfully</v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>
            </v-card> -->

            <!-- <v-data-table
                :headers="announcementByUserIdheaders"
                :items="announcements"
                :loading="!announcements"
                :search="searchTripsByTransporterId"
                class="mt-4"
                hide-default-footer
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

                <template v-slot:[`item.clientId`]="{ item }">
                    {{ item.clientId.firstName + ' ' + item.clientId.lastName }}
                </template>

                <template v-slot:[`item.price`]="{ item }">
                    {{ formatNumber(item.price) }}
                </template>

                <template v-slot:top>
                    <v-toolbar
                        flat
                    >
                        <v-toolbar-title>{{ $t('Announcements')}}</v-toolbar-title>

                        <v-divider
                            class="mx-4"
                            inset
                            vertical
                        ></v-divider>

                        

                        <v-spacer></v-spacer>
                    </v-toolbar>
                </template>
                <template v-slot:no-data>
                    <v-btn
                        color="primary"
                        text
                    >
                        {{ $t('noRecords')}}
                    </v-btn>
                </template>
            </v-data-table> -->

            

            <v-data-table
                :headers="headers"
                :items="billings.getBillings"
                
                :loading="!billings.getBillings"
                :search="search"
                class="mt-4"
            >
                <template v-slot:headers="{ columns, isSorted, getSortIcon, toggleSort }">
                    <tr style="color: #00366f;">
                        <template v-for="column in columns" :key="column.key">
                            <td>
                                {{ column.text }}
                            </td>
                        </template>
                    </tr>
                </template>

                <template v-slot:[`item.date`]="{ item }">
                    {{ formatDate(item.date) }}
                </template>

                <template v-slot:[`item.amount`]="{ item }">
                    {{ formatNumber(item.amount) }}
                </template>

                <template v-slot:[`item.status`]="{ item }">
                    <v-chip
                        :color="getColor(item)"
                        dark
                    >
                        <div v-if="item.status == 'pending'">
                            {{ $t('pending') }}
                        </div>
                        <div v-else-if="item.status == 'confirmed'">
                            {{ $t('confirmed') }}
                        </div>
                    </v-chip>
                </template>

                <template v-slot:top>
                    <v-toolbar
                        flat
                    >
                        <v-toolbar-title>{{ $t('BillingHistory')}}</v-toolbar-title>

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
                        <v-dialog v-model="dialog" max-width="900px">
                            <v-card>
                                <v-card-title class="text-h5">Details</v-card-title>
                                <v-card-text>
                                    <v-container>
                                        <v-row
                                            
                                        >
                                            <v-col
                                                cols="5"
                                            >
                                                <!-- <v-menu
                                                    v-model="date_of_billing"
                                                    :close-on-content-click="false"
                                                    max-width="290"
                                                >
                                                    <template v-slot:activator="{ on, attrs }">
                                                        <v-text-field
                                                            :value="computedDateFormatted"
                                                            append-icon="mdi-calendar"
                                                            clearable
                                                            :label="$t('Date')"
                                                            readonly
                                                            outlined
                                                            dense
                                                            v-bind="attrs"
                                                            v-on="on"
                                                            @click="editedItem.date = null"
                                                            @click:clear="editedItem.date = null"
                                                            disabled
                                                        ></v-text-field>
                                                    </template>
                                                    <v-date-picker
                                                        v-model="editedItem.date"
                                                        @change="date_of_billing = false"
                                                    ></v-date-picker>
                                                </v-menu> -->
                                                    <v-text-field
                                                        v-model="computedDateFormatted"
                                                        append-icon="mdi-calendar"
                                                        clearable
                                                        :label="$t('Date')"
                                                        readonly
                                                        outlined
                                                        rounded
                                                        disabled
                                                    ></v-text-field>
                                               
                                                    <v-text-field
                                                        v-model="editedItem.amount"
                                                        append-icon="mdi-cash"
                                                        :label="$t('Amount')"
                                                        readonly
                                                        outlined
                                                        rounded
                                                        disabled
                                                    ></v-text-field>

                                                    <v-textarea
                                                        v-model="editedItem.description"
                                                        :label="$t('Description')"
                                                        required
                                                        auto-grow
                                                        rows="4"
                                                        filled
                                                        color="next"
                                                        :disabled="editedIndex > -1"
                                                    ></v-textarea>
                                                
                                            </v-col>

                                            <v-col
                                                cols="7"
                                            >
                                                <v-avatar 
                                                    size="100%"
                                                    rounded="lg"
                                                    v-show="editedIndex > -1"
                                                > 
                                                    <v-img 
                                                        :src="editedItem.photo"
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

                                        <v-row>
                                            <v-col>
                                                <AnnouncementsDataTable 
                                                    :data="announcements"
                                                    :headers="announcementByUserIdheaders"
                                                />
                                            </v-col>
                                        </v-row>
                                         
                                    </v-container>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="error" text @click="close">Cancel</v-btn>
                                    <v-btn 
                                        color="success" 
                                        text 
                                        @click="confirm"
                                        :loading="loading"
                                    >OK</v-btn>
                                    <v-spacer></v-spacer>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>

                    </v-toolbar>
                </template>
                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn
                        small
                        class="mr-2"
                        @click="printItem(item)"
                        color="primary"
                        text
                        :loading="item.createloading"
                        v-if="item.status === 'confirmed'"
                    >
                        {{ $t('Download')}}
                    </v-btn>
                </template>
                <template v-slot:[`item.detail`]="{ item }">
                    <v-btn
                        small
                        class="mr-2"
                        @click="getDetail(item)"
                        color="success"
                        text
                    >
                        {{ $t('More')}}
                    </v-btn>
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
    import moment from 'moment'
    import Invoice from '@/components/reports/Invoice.vue'
    import axios from 'axios'
    import { ref, computed, onMounted } from 'vue'
    import { useBillingsStore } from '@/stores/billings'
    import { useCompanyStore } from '@/stores/company'
    import { useUsersStore } from '@/stores/users'
    import { useAnnouncementsStore } from '@/stores/announcements'
    import { useI18n } from 'vue-i18n'
    import AnnouncementsDataTable from '@/components/AnnouncementsDataTable.vue'

    const props = defineProps(['id', 'typeAccount'])
    const billings = useBillingsStore()
    const company = useCompanyStore()
    const users = useUsersStore()
    const pub = useAnnouncementsStore()
    const { locale } = useI18n()
         
    let headers = ref([
            {
                text: 'Date',
                align: 'start',
                sortable: false,
                value: 'date',
            },
            { text: 'Description', value: 'description' },
            { text: 'Amount', value: 'amount' },
            { text: 'Status', value: 'status' },
            { text: '', value: 'detail', sortable: false },
            { text: '', value: 'actions', sortable: false }
        ]),

        announcementByUserIdheaders = ref([
            {
                text: 'Name',
                align: 'start',
                sortable: false,
                value: 'name',
            },
            { text: 'Paid', value: 'paid' },
            { text: 'Published', value: 'published' }
        ]),
        search = ref(''),
        searchTripsByTransporterId = ref(''),
        total = ref(null),
        partner = ref(undefined),
        announcements = ref(undefined),
        loading = ref(false),
        loadingNewBilling = ref(false),
        subTotal = ref(0),
        createloading = ref(false),
        dialog = ref(false),
        editedIndex = ref(-1),
        editedItem = ref({}),
        newdialog = ref(false),
        defaultItem = ref({
            photo: '',
            billingMethod: '',
            amount: null,
            date: null,
            description: ''
        }),
        date_of_billing = ref(''),
        billing = ref(undefined),
        report = ref(null)
        
        const computedDateFormatted = computed(() => {
            return editedItem.value.date ? moment(editedItem.value.date).format('dddd, MMMM Do YYYY') : ''
        })

        const fetchAnnouncements = async () => {
            try {
                const response = await axios.get(`/api/announcements/getAnnouncementsByOwnerId/${props.id}`);
                announcements.value = response.data
            } catch (error) {
                console.error('Error fetching announcements:', error)
            }
        }

        onMounted(() => {
            initialize()
        })

        const initialize = () => {
            billings.fetchBillingsByUserId(props.id)
            console.log('typeAccount', props)
            if(props.typeAccount === 'seller'){
                fetchAnnouncements()
            }
            
            company.fetchCompany()
        }


            const newBilling = () => {
                this.editedIndex = -1
                this.defaultItem.amount = total.value
                this.defaultItem.brutAmount = subTotal.value
                this.defaultItem.date = Date.now()
                this.defaultItem.partnerId = this.id
                Object.assign(editedItem.value, defaultItem.value)
                this.dialog = true
                // this.$router.push('/billing/new')
                // this.loadingNewBilling = true
                // let currentBilling = {
                //     partnerId: this.id,
                //     photo: '',
                //     billingMethod: '',
                //     amount: this.total,
                //     date: Date.now(),
                //     description: 'payment for frettic',
                // }

                // this.tripsByTransporterId.forEach(e => {
                //     e.paid = true
                //     this.updateTrip(e)
                // })

                // this.addBillings(currentBilling).then(() => {
                //     this.fetchBillingsByTransporterId(this.id)
                //     this.fetchtripsByTransporterId(this.id)
                // })

                // this.loadingNewBilling = false
            }

            // generatePdf() {
            //     this.trips = this.tripsByTransporterId
            //     this.$refs.report.generateReport()
            // },

            const formatNumber = (value) => {
                return new Intl.NumberFormat(locale.value, { style: 'currency', currency: 'DZD' }).format(value)
            }

            const formatDate = (value) => {
                return value ? moment(value).format('dddd, MMMM Do YYYY') : ''
            }

            const printItem = (item) => {
                item.createloading = true
                billing.value = item
                console.log('item', item)
                partner.value = item.userId
                setTimeout(() => {
                    report.value.generateReport()
                    item.createloading = false
                    editedIndex.value = billings.getBillings.indexOf(item)
                    Object.assign(billings.getBillings[this.editedIndex], item)
                }, "3000")

            }

            const getColor = (valeur) => {
                if (valeur.status == 'pending') return '#FF8C00'
                else if (valeur.status == 'confirmed') return '#28a74580'
            }

            const getDetail = (item) => {
                console.log('item', item)
                console.log('', props.typeAccount)
                if(props.typeAccount === 'rented'){
                    announcements.value = [item.pubId]
                }
                editedIndex.value = billings.getBillings.indexOf(item)
                editedItem.value = Object.assign({}, item)
                dialog.value = true
            }

            const close = () => {
                dialog.value = false
            }

            const confirm = async () => {
                loading.value = true
                console.log('editedItem.value', editedItem.value)
                console.log('announ', announcements.value)
                
               for (const e of announcements.value) {
                    e.paid = true
                    await pub.editAnnouncements(e) 
                }
                
                editedItem.value.status = 'confirmed'
                if(editedIndex.value > -1){
                    await billings.editBillings(editedItem.value)
                }else{
                    await billings.addBillings(editedItem.value)
                }
                loading.value = false
                billings.fetchBillingsByUserId(props.id)
                dialog.value = false
                
            }
</script>

<style scoped>
    .v-data-table {
        border: 1px solid black;
    }
    :deep(table > thead > tr:last-child > th) {
        color: white !important;
        background-color: #00366f !important;
    }
    :deep(.mdi-arrow-up::before) {
        color: white !important;
    }
    .v-card__title {
        background-color: #00366f;
        color: white;
    }
    .v-card__actions {
        background-color: #00366f;
    }
</style>