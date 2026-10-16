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
            :items="announcements"
            :item-class="itemRowBackground"
            :loading="!announcements"
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

            <template v-slot:[`item.ownerId`]="{ item }">
                <div v-if="item.ownerId?.lastName || item.ownerId?.firstName">
                    {{ item.ownerId.firstName + ' ' + item.ownerId.lastName }}
                </div>
                <div v-else>
                    {{ item.ownerId?.companyName }}
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
                <v-toolbar-title>{{ $t('Publications') }}</v-toolbar-title>
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
                                    v-if="editedItem.category?.name"
                                ></v-text-field>

                                <v-text-field
                                    v-model="editedItem.brandId.name"
                                    label="brandName"
                                    type="text"
                                    readonly
                                    v-if="editedItem.brandId?.name"
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
    import { useAnnouncementsStore } from '@/stores/announcements'
    import { mapState, mapActions } from "pinia"

    export default {
        name: "AlertAnnouncements",
        props: ['announcements'],

        data: () => ({
            search: '',
            dialog: false,
            dialogDelete: false,
            headers: [
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
            // ...mapState(useAnnouncementsStore, ["vehicles", "]),
            // ...mapGetters(['vehicles', 'roles']),
            formTitle () {
                return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
            },
            filterHeaders(){
                // if(!this.$can('update', 'Announcements') && !this.$can('delete', 'Announcements')){
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
            ...mapActions(useAnnouncementsStore, ["fetchAnnouncements", "addAnnouncement", "editAnnouncements", "deleteAnnouncement"]),

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

            checkId(id) {
                this.transporters = this.announcements.filter((item) => item.role === 'partner')
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
                await Promise.all([this.fetchAnnouncements()])
                this.loading = false
            },

            editItem (e, {item}) {
                this.editedIndex = this.announcements.indexOf(item)
                this.editedItem = Object.assign({}, item)
                this.dialog = true
            },

            async activateItem (item) {
                this.loading = true
                item.activated = !item.activated
                try {
                    await this.editAnnouncements(item)
                } catch (error) {
                    this.err = error
                    console.log('error update announcement', error)
                }
                this.loading = false
            },

            deleteItem (item) {
                // this.editedIndex = this.announcements.indexOf(item)
                this.editedIndex = item._id
                this.editedItem = Object.assign({}, item)
                this.dialogDelete = true
            },

            deleteItemConfirm () {
                // this.announcements.splice(this.editedIndex, 1)
                this.deleteAnnouncements(this.editedIndex)
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

            async createAnnouncement(){
                try {
                    await this.addAnnouncements(this.editedItem)
                } catch (error) {
                    this.err = error
                    console.log('error create announcement', error)
                }
            },

            save () {
                this.loading = true
                if (this.editedIndex > -1) {
                    console.log('', this.editedItem)
                    this.editAnnouncements(this.editedItem).then(() => {
                        Object.assign(this.announcements[this.editedIndex], this.editedItem)
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