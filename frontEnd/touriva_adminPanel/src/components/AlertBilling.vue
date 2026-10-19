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
            :items="billings"
            :item-class="itemRowBackground"
            :loading="!billings"
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

            <template v-slot:[`item.userId`]="{ item }">
                <div v-if="item.userId?.lastName || item.userId?.firstName">
                    {{ item.userId?.firstName + ' ' + item.userId?.lastName }}
                </div>
                <div v-else>
                    {{ item.userId?.companyName }}
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
                        <v-toolbar-title>{{ $t('Billing')}}</v-toolbar-title>

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
    import axios from 'axios'
    import { useBillingsStore } from '@/stores/billings'
    import { mapState, mapActions } from "pinia"

    export default {
        name: "AlertBillings",
        props: {
            billings: {
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
            editedItem: {},
            defaultItem: {},
            tab: null,
            loadingTab: true,
            firstLoad: true,
            typeAccount: null,
            announcements: []
        }),

        computed: {
            formTitle () {
                return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
            },
            filterHeaders(){
                return this.headers
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
            ...mapActions(useBillingsStore, ["fetchBillings", "addBillings", "editBillings", "deleteBillings"]),

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
                if (valeur.status == 'pending') return '#D9943B'
                else if (valeur.status == 'confirmed') return '#21866B'
            },

            async fetchAnnouncements(id){
                try {
                    const response = await axios.get(`/api/announcements/getAnnouncementsByOwnerId/${id}`);
                    this.announcements = response.data
                } catch (error) {
                    console.error('Error fetching announcements:', error)
                }
            },

            itemRowBackground(item) {
                return item.activated === false ? 'style-1' : 'style-2'
            },

            editItem (e, {item}) {
                this.$emit("update:modelValue", false)
                this.$router.push({ name: 'Detail', params: { id: item.userId._id, typeAccount: item.userId.typeAccount }})
            },

            closeParentComponentDialog() {
                this.$emit("update:modelValue", false)
            },

            deleteItem (item) {
                this.editedIndex = item._id
                this.editedItem = Object.assign({}, item)
                this.dialogDelete = true
            },

            deleteItemConfirm () {
                this.deleteBillings(this.editedIndex)
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

            async createBilling(){
                try {
                    await this.addBillings(this.editedItem)
                } catch (error) {
                    this.err = error
                    console.log('error create billing', error)
                }
            },

            save () {
                this.loading = true
                if (this.editedIndex > -1) {
                    this.editBillings(this.editedItem).then(() => {
                        Object.assign(this.billings[this.editedIndex], this.editedItem)
                        this.loading = false
                        this.close()
                    })
                } else {
                    this.createBilling().then(() => {
                        this.close()
                        this.loading = false
                    })
                }
            },
        }
    }
</script>

<style scoped>
    .v-data-table {
        border: 1px solid var(--color-border);
        border-radius: 8px;
    }
    :deep(table > thead > tr:last-child > th) {
        color: var(--color-forest-green) !important;
        background-color: var(--color-warm-ivory) !important;
        font-weight: 700;
    }
    .v-card__title {
        background-color: var(--color-forest-green);
        color: white;
    }
    .v-card__actions {
        background-color: var(--color-forest-green);
    }
</style>