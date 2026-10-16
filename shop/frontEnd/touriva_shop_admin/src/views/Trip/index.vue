<template>
    <base-layout>
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
        <v-skeleton-loader v-if="firstLoad" :loading="loadingTab" type="table" height="100%"></v-skeleton-loader>
        <v-data-table
            :headers="headers"
            :items="trips"
            sort-by="email"
            :item-class="itemRowBackground"
            :search="search"
            v-show="!firstLoad"
            :loading="loadingTab"
        >
            <template v-for="header in headers" v-slot:[`header.${header.value}`]="{ header }">
                {{ $t(header.text) }}
            </template>

            <template v-slot:[`item.transporterId`]="{ item }">
                <div v-if="item.transporterId">
                    {{ item.transporterId.firstName + ' ' + item.transporterId.lastName }}
                </div>
                <div v-else>
                    {{ '  ****  ' }}
                </div>
            </template>

            <template v-slot:[`item.clientId`]="{ item }">
                <div v-if="item.clientId">
                    {{ item.clientId.firstName + ' ' + item.clientId.lastName }}
                </div>
                <div v-else>
                    {{ '  ****  ' }}
                </div>
            </template>
            
            <template v-slot:[`item.vehicleId`]="{ item }">
                <div v-if="item.vehicleId">
                    {{ item.vehicleId.name }}
                </div>
                <div v-else>
                    {{ '  ****  ' }}
                </div>
            </template>

            <template v-slot:[`item.price`]="{ item }">
                {{ formatNumber(item.price) }}
            </template>

            <template v-slot:[`item.status`]="{ item }">
                <v-chip
                    :color="getColor(item)"
                    dark
                >
                    <div v-if="item.status == 'started'">
                        {{ $t('InProgress') }}
                    </div>

                    <div v-if="item.status == 'accepted'">
                        {{ $t('Accepted') }}
                    </div>

                    <div v-else-if="item.status == 'canceled'">
                        {{ $t('Canceled') }}
                    </div>

                    <div v-else-if="item.status == 'planned'">
                        {{ $t('Planned') }}
                    </div>

                    <div v-else-if="item.status == 'finished'">
                        {{ $t('Finished') }}
                    </div>
                </v-chip>
            </template>

            <template v-slot:[`item.cancellation`]="{ item }">
                <div v-if="item.cancellation.by">
                    {{ $t('By') + ': ' + item.cancellation.by }}
                </div>

                <div v-if="item.cancellation.reason">
                    {{ $t('Reason') + ': ' + item.cancellation.reason }}
                </div>
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
                   rounded
                   outlined
                   dense
                ></v-text-field>
                
                <v-spacer></v-spacer>

                <v-dialog
                v-model="dialog"
                max-width="700px"
                >
                
                <v-card>
                    <v-card-title>
                    <span class="text-h5">{{ formTitle }}</span>
                    </v-card-title>

                    <v-card-text>
                    <v-container>
                        <v-row>
                        <v-col
                            cols="12"
                            sm="6"
                            md="4"
                        >
                            <v-text-field
                            v-model="editedItem.transporterFullName"
                            label="Transporter"
                            readonly
                            >
                            </v-text-field>
                        </v-col>
                        <v-col
                            cols="12"
                            sm="6"
                            md="4"
                        >
                            <v-text-field
                            v-model="editedItem.clientFullName"
                            label="Client"
                            readonly
                            ></v-text-field>
                        </v-col>
                        <v-col
                            cols="12"
                            sm="6"
                            md="4"
                        >
                            <v-text-field
                            v-model="editedItem.vehicleName"
                            label="Vehicle"
                            readonly
                            ></v-text-field>
                        </v-col>
                        <v-col
                            cols="12"
                            sm="6"
                            md="4"
                        >
                            <v-text-field
                            v-model="editedItem.from"
                            label="From"
                            readonly
                            ></v-text-field>
                        </v-col>
                        <v-col
                            cols="12"
                            sm="6"
                            md="4"
                        >
                            <v-text-field
                            v-model="editedItem.to"
                            label="To"
                            readonly
                            ></v-text-field>
                        </v-col>
                        <v-col
                            cols="12"
                            sm="6"
                            md="4"
                        >
                            <v-text-field
                            v-model="editedItem.price"
                            label="Price"
                            readonly
                            ></v-text-field>
                        </v-col>
                        <v-col
                            cols="12"
                            sm="6"
                            md="4"
                        >
                            <v-select
                                :items="status"
                                v-model="editedItem.status"
                                label="Status"
                                @change="showReason($event)"
                                :disabled="editedItem.status === 'finished' || editedItem.status === 'canceled' ? true : false"
                            ></v-select>
                        </v-col>
                       
                        <v-textarea
                            v-model="editedItem.cancellationReason"
                            label="cancellationReason"
                            v-show="showCR || editedItem.status === 'canceled'"
                            auto-grow
                            filled
                            rows="3"
                            shaped
                            
                        ></v-textarea>
                       
                       
                        </v-row>
                    </v-container>
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
            <template v-slot:[`item.actions`]="{ item }">
            <v-icon
                small
                class="mr-2"
                @click="editItem(item)"
                color="primary"
            >
                mdi-pencil
            </v-icon>
            <!-- <v-icon
                small
                @click="deleteItem(item)"
                color="error"
            >
                mdi-delete
            </v-icon> -->
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
    </base-layout>
</template>

<script>
import BaseLayout from '@/components/BaseLayout.vue'
import { mapGetters, mapActions } from 'vuex'
export default {
    components: {
        'base-layout': BaseLayout
    },

     data: () => ({
        loadingTab: true,
        firstLoad: true,
        search: '',
      dialog: false,
      dialogDelete: false,
      headers: [
        {
          text: 'Transporters',
          align: 'start',
          value: 'transporterId',
        },
        {
          text: 'Clients',
          align: 'start',
          value: 'clientId',
        },
        {
          text: 'Vehicles',
          align: 'start',
          value: 'vehicleId',
        },
        { text: 'Marchandise', value: 'marchandise.type' },
        { text: 'from', value: 'from' },
        { text: 'to', value: 'to' },
        { text: 'Price', value: 'price' },
        { text: 'Cancellation', value: 'cancellation' },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      image: undefined,
      loading: false,
      err: '',
      editedIndex: -1,
      editedItem: {},
      defaultItem: {},
      status: ['canceled', 'finished'],
      showCR: false,
      obj: {
        cancellation: {}
      },
      item: {}
    }),

    computed: {
        ...mapGetters(['trips']),
        formTitle () {
            return this.editedIndex === -1 ? 'New' : 'Edit'
        },
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
        ...mapActions(['fetchtrips', 'updateTrip', 'deleteTrips', 'editUsers']),

        showReason(value){
            console.log('value', value)
            if(value === 'canceled'){
                this.showCR = true
            }else{
                this.showCR = false
            }
        },

        getColor (valeur) {
            if (valeur.status == 'started') return '#17a2b880'
            else if (valeur.status == 'canceled') return '#DC143C'
            else if (valeur.status == 'planned') return '#2196F3'
            else if (valeur.status == 'finished') return '#228B22'
            else if (valeur.status == 'accepted') return '#228B22'
        },

        formatNumber(value) {
            return new Intl.NumberFormat(this.$i18n.locale, { style: 'currency', currency: 'DZD' }).format(value)
        },

        itemRowBackground(item) {
            return item.activated === false ? 'style-1' : 'style-2'
        },

        initialize () {
            this.fetchtrips()
            .then(() => {
                if (this.firstLoad) this.firstLoad = false
                this.loadingTab = false
            })
        },

        editItem (item) {
            console.log('item', item)
            this.editedIndex = this.trips.indexOf(item)
            this.item = Object.assign({}, item)
            this.editedItem.transporterFullName = item.transporterId.firstName + ' ' + item.transporterId.lastName
            this.editedItem.clientFullName = item.clientId.firstName + ' ' + item.clientId.lastName
            this.editedItem.vehicleName = item.vehicleId.name
            this.editedItem.price = item.price
            this.editedItem.status = item.status
            this.editedItem.from = item.from
            this.editedItem.to = item.to
            this.editedItem.cancellationBy = item.cancellation.by
            this.editedItem.cancellationReason = item.cancellation.reason
            this.editedItem._id = item._id


            console.log('editedItem', this.editedItem)
            this.dialog = true
        },

        async activateItem (item) {
            this.loading = true
            item.activated = !item.activated
            try {
                await this.editVehicles(item)
            } catch (error) {
                this.err = error
                console.log('error update trip', error)
            }
            this.loading = false
        },

        deleteItem (item) {
            // this.editedIndex = this.trips.indexOf(item)
            this.editedIndex = item._id
            this.editedItem = Object.assign({}, item)
            this.dialogDelete = true
        },

        deleteItemConfirm () {
            // this.trips.splice(this.editedIndex, 1)
            this.deleteTrips(this.editedIndex)
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

        save () {
            this.loading = true
            if (this.editedIndex > -1) {
                this.obj.status = this.editedItem.status
                this.obj._id = this.editedItem._id
                if(this.editedItem.status === "canceled"){
                    this.obj.cancellation.by = "administrator"
                    this.obj.cancellation.reason = this.editedItem.cancellationReason
                }else{
                    this.obj.cancellation.reason = ''
                    this.obj.finished = true
                }

                if(this.editedItem.status === "canceled" && this.editedItem.cancellationReason.length > 0){
                    this.updateTrip(this.obj).then(() => {
                        this.loading = false
                    })
                    let user ={
                        _id: this.item.transporterId._id,
                        status: true
                    }
                    this.editUsers(user).then(() => {
                        this.close()
                        this.initialize()
                    })
                    
                }else if(this.editedItem.status === "canceled" && this.editedItem.cancellationReason.length === 0){
                    this.err = 'reason must be filled'
                    setTimeout(() => {
                        this.err = ''
                    }, "5000")
                }

                if(this.editedItem.status === "finished"){
                    this.editedItem.finished = true
                    this.updateTrip(this.editedItem).then(() => {
                        this.loading = false
                        this.close()
                        this.initialize()
                    })
                }
                
            } else {
                // this.createVehicle()
                // this.loading = false
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
    :deep(.style-1) {
        color: white !important;
        background-color: #DC143C !important;
    }
    :deep(.style-2) {
        background-color: white !important;
    }
</style>