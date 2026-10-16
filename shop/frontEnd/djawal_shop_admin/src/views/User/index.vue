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
            :headers="headers"
            :items="users.getUsers"
            :item-class="itemRowBackground"
            :loading="!users.getUsers"
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
            <!-- <template v-for="header in headers" v-slot:[`header.${header.value}`]="{ header }">
                {{ $t(header.text) }}
            </template> -->

            <template v-slot:[`item.name`]="{ item }">
                {{ item.firstName + ' ' + item.lastName }}
            </template>

            <template v-slot:[`item.authorizationIds`]="{ item }">
                <v-chip-group
                    column
                    v-if="item.authorizationIds.length > 0"
                >
                    <v-chip
                        v-for="(auth, index) in item.authorizationIds" :key="index"
                        color="next"
                        dark
                    >
                        {{ auth.name }}
                    </v-chip>
                </v-chip-group>
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
                    
                    dense
                ></v-text-field>
                
                <v-spacer></v-spacer>
                <v-dialog
                    v-model="dialog"
                    :max-width="'500px'"
                >

                <template v-slot:[`group.header`]="{items, isOpen, toggle}">
                    <td :colspan="headers.length">
                    <v-icon color="next" @click="toggle">
                        {{ isOpen ? 'mdi-minus' : 'mdi-plus' }}
                    </v-icon>
                    <span>{{  $t('Role') + ': ' + items[0].role }}</span>
                    </td>
                </template>

                <!-- <template v-slot:[`item.vehicleId.photo`]="{ item }">
                    <v-img :src="item.vehicleId.photo" style="width: 100px; height: 100px"/>
                </template> -->

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
                                :cols="auto"
                            >
                                <v-text-field
                                    v-model="editedItem.email"
                                    label="Email"
                                    type="text"
                                ></v-text-field>

                                <!--<v-text-field
                                    v-model="editedItem.companyName"
                                    label="RaisonSocial"
                                    type="text"
                                ></v-text-field>-->
                    
                                <v-text-field
                                    v-model="editedItem.firstName"
                                    label="firstName"
                                    type="text"
                                    readonly
                                    v-if="editedItem.role === 'client'"
                                ></v-text-field>

                                <v-text-field
                                    v-model="editedItem.lastName"
                                    label="lastName"
                                    type="text"
                                    readonly
                                    v-if="editedItem.role === 'client'"
                                ></v-text-field>

                                <v-text-field
                                    v-model="editedItem.phone"
                                    label="phone"
                                    type="text"
                                    readonly
                                    v-if="editedItem.role != 'administrator'"
                                ></v-text-field>

                                <!--<v-select
                                    :items="items"
                                    v-model="editedItem.role"
                                    item-value="value"
                                    item-title="label"
                                    :label="$t('roles')"
                                    disabled
                                ></v-select>-->

                                <!--<v-select
                                    :items="sectorActivityItems"
                                    v-model="editedItem.sectorActivity"
                                    type="text"
                                    :label="$t('sectorActivity')"
                                    
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
                                ></v-select>-->

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

                                <!--<v-checkbox
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
                                </v-select>-->


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
                            <!--<v-col
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
                                
                            </v-col>-->
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
                class="mr-2"
                @click="activateItem(item)"
                color="warning"
                :loading="loading"
               
            >
                {{ item.activated ? 'mdi-lock-open' : 'mdi-lock' }}
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
    import { useUsersStore } from '@/stores/users'

    const users = useUsersStore()

    let search = ref(''),
        dialog = ref(false),
        dialogDelete = ref(false),
        loadingDelete = ref(false),
        headers = ref([
            {
            text: 'Email',
            align: 'start',
            sortable: false,
            value: 'email',
            },
            { text: 'RaisonSocial', value: 'companyName' },
            // { text: 'lastName', value: 'lastName' },
            { text: 'Phone', value: 'phone' },
            { text: 'role', value: 'role' },
            { text: 'Account Type', value: 'typeAccount' },
            { text: 'Expiration', value: 'expirationOfSubscription' },
           
            { text: 'Actions', value: 'actions', sortable: false },
        ]),
        items = ref([
            { label: 'administrator', value: 'administrator'},
            { label: 'client', value: 'client'},
            { label: 'partner', value: 'partner'}
        ]),
        sectorActivityItems = ref(['BTPH', 'Agricole', 'Industriel', 'Autre']),
        loading = ref(false),
        err = ref(''),
        editedIndex = ref(-1),
        deleteId = ref(-1),
        editedItem = ref({
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
        }),
        defaultItem = ref({
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
        }),
        tab = ref(null),
        documents = ref([
            { id: 1, title: 'nisDoc', done: false },
            { id: 2, title: 'commercialRegister', done: false },
            { id: 3, title: 'nifDoc', done: false },
            { id: 4, title: 'id', done: false },
            // { id: 5, title: 'id', done: false }
        ]),
        loadingTab = ref(true),
        firstLoad = ref(true),
        partners = ref([]),
        fileStatus = ref([
            { name: 'created' },
            { name: 'pending' },
            { name: 'confirmed' },
            
        ])

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

        const generateCode = () => {
            editedItem.value.code = getId()
        }

        // generate a unique id
        const getId = () => {
            const limit = 100; // max tries to create unique id
            let attempts = 0; // how many attempts
            let id = false;
            while(!id && attempts < limit) {
                id = randomId(); // create id
                if(!checkId(id)) { // check unique
                    id = false; // reset id
                    attempts++; // record failed attempt
                }
            }
            return id; // the id or false if did not get unique after max attempts
        }

        const checkId = (id) => {
            partners.value = users.getUsers.filter((item) => item.role === 'partner')
            let match = partners.value.find((item) => {
                console.log('code', item.code)
                return item.code === id;
            });
            return match ? false : true;
        }

        // short random string for ids - not guaranteed to be unique
        const randomId = () => {
            return Math.random().toString(36).substring(2, 6 + 2)
        }

        const itemRowBackground = (item) => {
            return item.activated === false ? 'style-1' : 'style-2'
        }

        const initialize = () => {
            users.fetchUsers()
        }

        const editItem = (item) => {
            editedIndex.value = users.getUsers.indexOf(item)
            editedItem.value = Object.assign({}, item)
            console.log('item', item)
            const userKeys = Object.keys(item)
                userKeys.forEach(key => {
                    documents.value.forEach(e => {
                        if(key === e.title){
                            e.done = true
                        }
                    });
                });
            dialog.value = true
        }

        const activateItem = async (item) => {
            loading.value = true
            item.activated = !item.activated
            try {
                await users.editUsers(item)
            } catch (error) {
                err.value = error
                console.log('error update user', error)
            }
            loading.value = false
        }

        const deleteItem = (item) => {
            editedIndex.value = users.getUsers.indexOf(item)
            deleteId.value = item._id
            editedItem.value = Object.assign({}, item)
            dialogDelete.value = true
        }

        const deleteItemConfirm = () => {
            loadingDelete.value = true
            users.deleteUsers(deleteId.value).then(() => {
                users.users.splice(editedIndex.value, 1)
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

        const createUser = async () => {
            try {
                await users.addUsers(editedItem.value)
            } catch (error) {
                err.value = error
                console.log('error create user', error)
            }
        }

        const fileProcessing = () => {
            editedItem.value.complete = true
            
            let array = documents.value.filter(e => !e.done)
           
            let counter = 0
            array.forEach(e => {
                if(e.title === "commercialRegister" || e.title === "transportCard"){
                    counter = counter + 1
                }
            })
            
            if(counter === 2){
                editedItem.value.legal = false
            }

            if(array.length === 0){
                editedItem.value.legal = true
            }
        }

        const save = () => {
            loading.value = true
            if (editedIndex.value > -1) {
                switch (editedItem.value.fileStatus) {
                    case 'confirmed':
                        fileProcessing()
                        editedItem.value.status = true
                        break;
                    case 'created':
                        editedItem.value.complete = false
                        editedItem.value.status = false
                        break;
                    case 'pending':
                        editedItem.value.complete = false
                        editedItem.value.status = false
                        break;
                    default:
                        break;
                }
                
                let updatedItem = {
                    _id: editedItem.value._id,
                    fileStatus: editedItem.value.fileStatus,
                    vehicleId: editedItem.value.vehicleId,
                    complete: editedItem.value.complete,
                    code: editedItem.value.code,
                    status: editedItem.value.status,
                    legal: editedItem.value.legal,
                    sectorActivity: editedItem.value.sectorActivity
                }
                
                users.editUsers(updatedItem).then(() => {
                    Object.assign(users.users[editedIndex.value], editedItem.value)
                    // this.$store.commit('setUsers', users.users)
                    // this.$store.commit('getPendingTransportersFiles', this.users)
                    loading.value = false
                    close()
                    initialize()
                })
            } else {
                users.createUser().then(() => {
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