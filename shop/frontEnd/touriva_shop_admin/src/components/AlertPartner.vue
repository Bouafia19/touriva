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
            :items="users"
            :item-class="itemRowBackground"
            :loading="!users"
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

            <template v-slot:[`item.name`]="{ item }">
                {{ item.firstName + ' ' + item.lastName }}
            </template>

            <template v-slot:top>
            <v-toolbar
                flat
            >
                <v-toolbar-title>{{ $t('Users') }}</v-toolbar-title>
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
                                    v-model="editedItem.email"
                                    label="Email"
                                    type="text"
                                ></v-text-field>

                                <v-text-field
                                    v-model="editedItem.companyName"
                                    label="RaisonSocial"
                                    type="text"
                                ></v-text-field>
                    
                                <v-text-field
                                    v-model="editedItem.firstName"
                                    label="firstName"
                                    type="text"
                                    v-if="editedItem.role === 'client'"
                                ></v-text-field>

                                <v-text-field
                                    v-model="editedItem.lastName"
                                    label="lastName"
                                    type="text"
                                    v-if="editedItem.role === 'client'"
                                ></v-text-field>

                                <v-text-field
                                    v-model="editedItem.phone"
                                    label="phone"
                                    type="text"
                                    disabled
                                    v-if="editedItem.role != 'administrator'"
                                ></v-text-field>

                                <v-select
                                    :items="items"
                                    v-model="editedItem.role"
                                    item-value="value"
                                    item-title="label"
                                    :label="$t('roles')"
                                    disabled
                                ></v-select>

                                <v-select
                                    :items="roles"
                                    v-model="editedItem.authorizationIds"
                                    item-value="_id"
                                    item-text="name"
                                    :label="$t('authorization')"
                                    multiple
                                    chips
                                    attach
                                    v-if="editedItem.role === 'administrator'"
                                ></v-select>

                                <!-- <v-select
                                    :items="vehicles"
                                    :label="$t('Vehicles')"
                                    item-value="_id"
                                    item-text="name"
                                    v-model="editedItem.vehicleId"
                                    v-if="editedItem.role === 'partner'"
                                >
                                    <template slot="selection" slot-scope="data">
                                        <v-avatar rounded="lg">
                                            <v-img class="mr-2" contain :src="data.item.photo"></v-img>
                                        </v-avatar> 
                                        {{ data.item.name }}
                                    </template>

                                    <template slot="item" slot-scope="data">
                                        <v-avatar rounded="lg">
                                            <v-img class="mr-2" contain :src="data.item.photo"></v-img>
                                        </v-avatar> 
                                        {{ data.item.name }}
                                    </template>
                                </v-select> -->

                                <v-checkbox
                                    v-model="editedItem.status"
                                    :label="$t('actif')"
                                    v-if="editedItem.typeAccount != 'ordinary' && editedItem.role != 'administrator'"
                                ></v-checkbox>

                                <v-select
                                    :items="fileStatus"
                                    :label="$t('fileStatus')"
                                    item-value="name"
                                    item-title="name"
                                    v-model="editedItem.fileStatus"
                                    v-if="editedItem.typeAccount != 'ordinary'"
                                >
                                    <template slot="selection" slot-scope="data">
                                        {{ $t(data.item.name) }}
                                    </template>

                                    <template slot="item" slot-scope="data">
                                        {{ $t(data.item.name) }}
                                    </template>
                                </v-select>


                                <!-- <v-text-field
                                    v-model="editedItem.code"
                                    label="Code"
                                    append-icon="mdi-calculator-variant"
                                    @click:append="generateCode"
                                    :disabled="editedItem.code != '' ? true : false"
                                    v-if="editedItem.role === 'partner'"
                                ></v-text-field> -->
                        
                                <!-- <v-text-field
                                    v-model="editedItem.password"
                                    label="Password"
                                    type="password"
                                    outlined
                                    dense
                                    rounded
                                ></v-text-field> -->
                            </v-col>
                            <v-col
                                cols="8"
                                v-if="editedItem.typeAccount != 'ordinary' && editedItem.role != 'administrator'"
                            >
                                <v-card>
                                    <v-toolbar
                                        flat
                                        color="next"
                                        dark
                                    >
                                        <v-toolbar-title>{{ $t('Documents') }}</v-toolbar-title>
                                    </v-toolbar>

                                    <v-tabs
                                        v-model="tab"
                                        
                                        
                                    >
                                        <v-tab
                                            v-for="(item, index) in documents"
                                            :key="index"
                                            :value="index"
                                        >
                                            {{ item.title }}
                                            <v-icon :color="item.done ? 'success': 'error'">{{ item.done ? 'mdi-checkbox-marked-circle' : 'mdi-minus-circle' }}</v-icon>
                                        </v-tab>
                                    </v-tabs>

                                    <v-card-text>
                                    <v-tabs-window 
                                        v-model="tab"
                                    >
                                        
                                        <v-tabs-window-item 
                                            v-for="(item, index) in documents"
                                            :key="index"
                                            :value="index"
                                        >
                                            <v-img
                                                :src="editedItem[item.title]"
                                                height="400"
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
    import { useUsersStore } from '@/stores/users'
    import { mapState, mapActions } from "pinia"

    export default {
        name: "AlertPartner",
        props: ['users'],

        data: () => ({
            search: '',
            dialog: false,
            dialogDelete: false,
            headers: [
                {
                text: 'Email',
                align: 'start',
                sortable: false,
                value: 'email',
                },
                { text: 'Name', value: 'name' },
                { text: 'Phone', value: 'phone' },
                { text: 'role', value: 'role' },
                // { text: 'Vehicles', value: 'vehicleId.name' },
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
            documents: [
                { id: 1, title: 'nisDoc', done: false },
                { id: 2, title: 'commercialRegister', done: false },
                { id: 3, title: 'nifDoc', done: false },
                { id: 4, title: 'id', done: false },
            ],
            loadingTab: true,
            firstLoad: true,
            transporters: [],
            fileStatus: [
                { name: 'created' },
                { name: 'pending' },
                { name: 'confirmed' },
                
            ]
        }),

        computed: {
            ...mapState(useUsersStore, ["users", "vehicles", "roles", "loading", "pendingTransportersFiles"]),
            // ...mapGetters(['vehicles', 'roles']),
            formTitle () {
                return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
            },
            filterHeaders(){
                // if(!this.$can('update', 'Users') && !this.$can('delete', 'Users')){
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
            ...mapActions(useUsersStore, ["fetchUsers", "addUser", "editUsers", "deleteUser"]),
            // ...mapActions(['fetchUsers', 'addUsers', 'editUsers', 'deleteUsers', 'fetchVehicles', 'fetchRoles']),

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
                this.transporters = this.users.filter((item) => item.role === 'partner')
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
                await Promise.all([this.fetchUsers()])
                this.loading = false
                // this.fetchUsers()
                // this.fetchVehicles()
                // this.fetchRoles()
            },

            editItem (e, {item}) {
                console.log('item', item)
                this.editedIndex = this.users.indexOf(item)
                this.editedItem = Object.assign({}, item)
                const userKeys = Object.keys(item)
                    userKeys.forEach(key => {
                        this.documents.forEach(e => {
                            if(key === e.title){
                                e.done = true
                            }
                        });
                    });
                this.dialog = true
            },

            async activateItem (item) {
                this.loading = true
                item.activated = !item.activated
                try {
                    await this.editUsers(item)
                } catch (error) {
                    this.err = error
                    console.log('error update user', error)
                }
                this.loading = false
            },

            deleteItem (item) {
                // this.editedIndex = this.users.indexOf(item)
                this.editedIndex = item._id
                this.editedItem = Object.assign({}, item)
                this.dialogDelete = true
            },

            deleteItemConfirm () {
                // this.users.splice(this.editedIndex, 1)
                this.deleteUsers(this.editedIndex)
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

            async createUser(){
                try {
                    await this.addUsers(this.editedItem)
                } catch (error) {
                    this.err = error
                    console.log('error create user', error)
                }
            },

            save () {
                this.loading = true
                if (this.editedIndex > -1) {
                    // Object.assign(this.users[this.editedIndex], this.editedItem)
                    // if(this.editedItem.complete && this.editedItem.fileStatus != 'confirmed'){
                    //     this.editedItem.fileStatus = 'confirmed'
                    // }else if(!this.editedItem.complete && this.editedItem.fileStatus === 'confirmed'){
                    //     this.editedItem.fileStatus = 'created'
                    // }
                    switch (this.editedItem.fileStatus) {
                        case 'confirmed':
                            this.editedItem.complete = true
                            break;
                        case 'created':
                            this.editedItem.complete = false
                            break;
                        case 'pending':
                            this.editedItem.complete = false
                            break;
                    
                        default:
                            break;
                    }
                    let updatedItem = {
                        _id: this.editedItem._id,
                        complete: this.editedItem.complete,
                        fileStatus: this.editedItem.fileStatus
                    }
                    this.editUsers(updatedItem).then(() => {
                        Object.assign(this.users[this.editedIndex], this.editedItem)
                        // this.$store.commit('getPendingTransportersFiles', this.users)
                        this.loading = false
                        this.close()
                        this.initialize()
                    })
                } else {
                    this.createUser().then(() => {
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