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
            :items="trips"
            :item-class="itemRowBackground"
            :loading="!trips"
            :search="search"
            @click:row="editItem"
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

            <template v-slot:[`item.creator`]="{ item }">
                <div v-if="item.creator?.lastName || item.creator?.firstName">
                    {{ item.creator.firstName + ' ' + item.creator.lastName }}
                </div>
                <div v-else>
                    {{ item.creator?.companyName }}
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
    import { useTripsStore } from '@/stores/trips'
    import { mapState, mapActions } from "pinia"

    export default {
        name: "AlertTrips",
        props: ['trips'],

        data: () => ({
            search: '',
            dialog: false,
            dialogDelete: false,
            headers: [
                {
                    text: 'Owner',
                    align: 'start',
                    sortable: false,
                    value: 'creator',
                },
                { text: 'price', value: 'price' },
                { text: 'name', value: 'name' },
                { text: 'description', value: 'description' },
                // { text: 'category', value: 'category.name' },
                { text: 'published', value: 'published'}
            ],
            loading: false,
            err: '',
            editedIndex: -1,
            editedItem: {},
            defaultItem: {},
            tab: null,
            loadingTab: true,
            firstLoad: true,
            transporters: []
        }),

        computed: {
            // ...mapState(useTripsStore, ["vehicles", "]),
            // ...mapGetters(['vehicles', 'roles']),
            formTitle () {
                return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
            },
            filterHeaders(){
                // if(!this.$can('update', 'Trips') && !this.$can('delete', 'Trips')){
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
            ...mapActions(useTripsStore, ["fetchTrips", "addTrip", "editTrips", "deleteTrip"]),

            generateCode(){
                this.editedItem.code = this.getId()
            },

            // generate a unique id
            getId() {
                const limit = 100; // max tries to create unique id
                let attempts = 0; // how many attempts
                let id = false;
                while(!id && attempts < limit) {
                    id = this.randomId(); // create id
                    if(!this.checkId(id)) { // check unique
                        id = false; // reset id
                        attempts++; // record failed attempt
                    }
                }
                return id; // the id or false if did not get unique after max attempts
            },

            formatPrice(price){
                if (!price) return ''
                return new Intl.NumberFormat('fr-FR').format(price) + ' DA'
            },

            checkId(id) {
                this.transporters = this.trips.filter((item) => item.role === 'partner')
                let match = this.transporters.find((item) => {
                    console.log('code', item.code)
                    return item.code === id;
                });
                return match ? false : true;
            },

            // short random string for ids - not guaranteed to be unique
            randomId() {
                return Math.random().toString(36).substring(2, 6 + 2)
            },

            itemRowBackground(item) {
                return item.activated === false ? 'style-1' : 'style-2'
            },

            async initialize () {
                this.loading = true
                await Promise.all([this.fetchTrips()])
                this.loading = false
            },

            editItem (e, {item}) {
                this.editedIndex = this.trips.indexOf(item)
                this.editedItem = Object.assign({}, item)
                this.dialog = true
            },

            async activateItem (item) {
                this.loading = true
                item.activated = !item.activated
                try {
                    await this.editTrips(item)
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

            async createTrip(){
                try {
                    await this.addTrips(this.editedItem)
                } catch (error) {
                    this.err = error
                    console.log('error create trip', error)
                }
            },

            save () {
                this.loading = true

                if(this.editedItem.published){
                    this.editedItem.status = 'published'
                }

                if (this.editedIndex > -1) {
                    console.log('', this.editedItem)
                    this.editTrips(this.editedItem).then(() => {
                        Object.assign(this.trips[this.editedIndex], this.editedItem)
                        this.loading = false
                        this.close()
                        this.initialize()
                    })
                }
            }
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
    :deep(.mdi-calculator-variant::before) {
        color: #00366f !important;
    }
</style>