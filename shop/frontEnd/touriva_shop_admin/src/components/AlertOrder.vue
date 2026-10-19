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
            :headers="filterHeaders"
            :items="orders"
            :item-class="itemRowBackground"
            :loading="!orders"
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

            <template v-slot:[`item.userId`]="{ item }">
                <div v-if="item.userId.lastName || item.userId.firstName">
                    {{ item.userId.firstName + ' ' + item.userId.lastName }}
                </div>
                <div v-else>
                    {{ item.userId.companyName }}
                </div>
            </template>

            <template v-slot:[`item.date`]="{ item }">
                <div v-if="item.date">
                    {{ formatDate(item.date) }}
                </div>
            </template>

            <template v-slot:[`item.amount`]="{ item }">
                <div v-if="item.amount">
                    {{ formatPrice(item.amount) }}
                </div>
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
                        <v-toolbar-title>{{ $t('Order')}}</v-toolbar-title>

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
        </v-data-table>
    </v-container>
</template>

<script>
    import { useOrdersStore } from '@/stores/orders'
    import { mapState, mapActions } from "pinia"

    export default {
        name: "AlertOrders",
        props: {
            orders: {
                type: Array,
                default: () => []
            },
            modelValue: {
                type: Boolean,
                required: true
            }
        },

        data: () => ({
            search: '',
            dialog: false,
            dialogDelete: false,
            headers: [
                {
                    text: 'Client',
                    align: 'start',
                    sortable: false,
                    value: 'userId',
                },
                {
                    text: 'Phone',
                    align: 'start',
                    sortable: false,
                    value: 'userId.phone',
                },
                {
                    text: 'Code',
                    align: 'start',
                    sortable: false,
                    value: 'productId.code',
                },
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
            ],
            announcementByUserIdheaders: [
                {
                    text: 'Name',
                    align: 'start',
                    sortable: false,
                    value: 'name',
                },
                { text: 'Paid', value: 'paid' },
                { text: 'Published', value: 'published' }
            ],
            loading: false,
            err: '',
            editedIndex: -1,
            editedItem: {
               
            },
            defaultItem: {
              
            },
            tab: null,
            loadingTab: true,
            firstLoad: true,
            typeAccount: null,
            announcements: []
            
        }),

        computed: {
            // ...mapState(useOrdersStore, ["orders", "vehicles", "roles", "loading", "pendingTransportersFiles"]),
            // ...mapGetters(['vehicles', 'roles']),
            formTitle () {
                return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
            },
            filterHeaders(){
                // if(!this.$can('update', 'Orders') && !this.$can('delete', 'Orders')){
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

        methods: {
            ...mapActions(useOrdersStore, ["fetchOrders", "addOrder", "editOrders", "deleteOrder"]),
            // ...mapActions(['fetchOrders', 'addOrders', 'editOrders', 'deleteOrders', 'fetchVehicles', 'fetchRoles']),

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

            getColor(valeur){
                if (valeur.status == 'pending') return '#FF8C00'
                else if (valeur.status == 'confirmed') return '#28a74580'
            },

            async fetchAnnouncements(id){
                try {
                    const response = await axios.get(`/api/announcements/getAnnouncementsByOwnerId/${id}`);
                    announcements.value = response.data
                } catch (error) {
                    console.error('Error fetching announcements:', error)
                }
            },

            itemRowBackground(item) {
                return item.activated === false ? 'style-1' : 'style-2'
            },

            editItem (e, {item}) {
                this.$emit("update:modelValue", false)
                this.$router.push({ name: 'OrderDetail', params: { id: item.userId._id, client: `${item.userId.firstName} ${item.userId.lastName}` }})
                
            },

            closeParentComponentDialog() {
                this.$emit("update:modelValue", false)
            },

            deleteItem (item) {
                // this.editedIndex = this.orders.indexOf(item)
                this.editedIndex = item._id
                this.editedItem = Object.assign({}, item)
                this.dialogDelete = true
            },

            deleteItemConfirm () {
                // this.orders.splice(this.editedIndex, 1)
                this.deleteOrders(this.editedIndex)
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

            async createOrder(){
                try {
                    await this.addOrders(this.editedItem)
                } catch (error) {
                    this.err = error
                    console.log('error create ad', error)
                }
            },

            save () {
                this.loading = true
                if (this.editedIndex > -1) {
                    
                    this.editOrders(updatedItem).then(() => {
                        Object.assign(this.orders[this.editedIndex], this.editedItem)
                        // this.$store.commit('getPendingTransportersFiles', this.orders)
                        this.loading = false
                        this.close()
                        this.initialize()
                    })
                } else {
                    this.createOrder().then(() => {
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