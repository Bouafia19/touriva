<template>
  <div>
        <v-container>

            <!-- <invoice
                :trips="trips"
                ref="report"
                v-show="false"
                :transporter="transporter"
                :company="company"
            /> -->

            <!--<v-row>
                <v-col class="d-inline-flex align-center">
                    <v-spacer></v-spacer>
                    <v-btn
                        outlined
                        rounded
                        text
                        color="primary"
                        @click="orderForSellerAccount"
                        :loading="loadingNewOrder"
                    >
                        <v-icon>
                          mdi-plus
                        </v-icon>
                    </v-btn>
                </v-col>
            </v-row>-->

            <!--<NewOrder 
                v-on:reloadProducts="confirmOrder" 
                v-model="sheet" 
                :id="id"
                :total="total"
                :products="products.getProductsByOwnerIdNotPaid"
                class="mb-1"
            />-->

            <!--<NewPlan 
                @updateSheet="planSheet = !planSheet"
                @selectPlan="selectPlan($event)"
                v-model="planSheet" 
                :plans="plans"
                class="mb-1"
            />-->

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
                    </v-list-item-content>
                </v-list-item>
            </v-card> -->

            

            <v-data-table
                :headers="headers"
                :items="orders.getOrders"
                :loading="!orders.getOrders"
                :search="search"
                class="mt-4"
                disable-sort
                hide-default-footer
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

                <!-- <template v-slot:[`item.name`]="{ item }">
                    {{ item.firstName + ' ' + item.lastName }}
                </template> -->

                <template v-slot:[`item.amount`]="{ item }">
                    {{ formatNumber(item.amount) }}
                </template>

                <template v-slot:[`item.date`]="{ item }">
                    {{ formatDate(item.date) }}
                </template>

                <template v-slot:[`item.status`]="{ item }">
                    <v-chip
                        :color="getColor(item)"
                        dark
                    >
                        <div v-if="item.status == 'pending'">
                            {{ $t('pendingOrder') }}
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
                        <v-toolbar-title>{{ $t('Orders')}}</v-toolbar-title>

                        <!-- <v-divider
                            class="mx-4"
                            inset
                            vertical
                        ></v-divider> -->

                        <!-- <v-text-field
                            v-model="search"
                            append-icon="mdi-magnify"
                            :label="$t('Search')"
                            single-line
                            hide-details
                            class="shrink mx-4"
                            rounded
                            outlined
                            dense
                        ></v-text-field> -->

                        <!-- <v-spacer></v-spacer> -->
                    </v-toolbar>
                </template>
                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn
                        small
                        class="mr-2"
                        @click="printItem(item)"
                        color="primary"
                        text
                        :loading="loading"
                    >
                        {{ $t('Download')}}
                    </v-btn>
                </template>
                <template v-slot:no-data>
                    <v-btn
                        color="primary"
                        @click="initialize"
                        text
                    >
                        {{ $t('noRecords')}}
                    </v-btn>
                </template>
            </v-data-table>
        </v-container>
  </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { useOrdersStore } from '@/stores/orders'
    import { useAuthStore } from '@/stores/auth'
    import { useUsersStore } from '@/stores/users'
    import { useProductsStore } from '@/stores/products'
    import { useI18n } from 'vue-i18n'
    import axios from 'axios'
    // import NewOrder from '@/components/NewOrder.vue'
    // import NewPlan from '@/components/NewPlan.vue'

    const orders = useOrdersStore()
    const auth = useAuthStore()
    const users = useUsersStore()
    const products = useProductsStore()
    
    const { locale } = useI18n()

    let headers = ref([
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
            { text: 'Status', value: 'status' }
            // { text: '', value: 'actions', sortable: false }
        ]),
        productByUserIdheaders = ref([
            {
                text: 'Name',
                align: 'start',
                sortable: false,
                value: 'name',
            },
            // {
            //     text: 'from',
            //     align: 'start',
            //     sortable: false,
            //     value: 'from',
            // },
            // { text: 'to', value: 'to' },
            // { text: 'Price', value: 'price' },
            { text: 'Published', value: 'published' }
            
        ]),
        search = ref(''),
        searchTripsByUserId = ref(''),
        total = ref(null),
        transporter = ref(undefined),
        loading = ref(false),
        loadingNewOrder = ref(false),
        subTotal = ref(0),
        id = ref(undefined),
        sheet = ref(false),
        user = ref(undefined),
        plans = ref([]),
        planSheet = ref(false),
        plan = ref({})

        onMounted(() => {
            initialize()
        })

        const confirmOrder = async () => {
            products.fetchProductsByOwner(user.value._id)
            await users.updateUserProfile(user.value)
            
        }

        const selectPlan = async (plan) =>{
            const currentDate = new Date();
            currentDate.setMonth(currentDate.getMonth() + plan.duration); 
            currentDate.toISOString().split("T")[0]; 

            products.getProductsByOwnerIdNotPaid.forEach((item) => {
                item.planId = plan._id
                item.expirationOfSubscription = currentDate
            })
            total.value = item.plan.price
            sheet.value = true
            user.value.expirationOfSubscription = currentDate
        }

        // const updated = () => {
        //     if(trips.tripsByUserId){

        //         subTotal.value = trips.tripsByUserId.reduce((prev, cur) => {
        //             return prev + cur.price;
        //         }, 0)

        //         total.value = parseFloat(subTotal.value * 5 / 100).toFixed(2)
        //     }
        // }

        /*const fetchPlans = async () => {
            try {
                const response = await axios.get('/api/plans');
                plans.value = response.data
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        }*/

        const initialize = () => {
            auth.getLSUserInfo().then((ls) => {
                user.value = ls.user
                id.value = ls.user._id
                orders.fetchOrdersByUserId()
                //products.fetchProductsByOwner()
                
            })
            //fetchPlans()
        }

        const orderForSellerAccount = () => {
            const inputTimestamp = new Date(user.value.expirationOfSubscription).getTime()
            const currentTimestamp = new Date().getTime()
            if(currentTimestamp >= inputTimestamp){
                planSheet.value = true
            }else if (currentTimestamp < inputTimestamp){
                console.log('Your Plan is valid to: ', user.value.expirationOfSubscription)
            }
        }

        const newOrder = (e, {item, index}) => {
            console.log('item order', item)
            if(user.value.typeAccount === 'seller'){
                orderForSellerAccount()
                return
            }
            loadingNewOrder.value = true
            sheet.value = true
            loadingNewOrder.value = false
            total.value = item.planId.price
            products.productsByOwnerIdNotPaid = [item]
        }

        const formatNumber = (value) => {
            return new Intl.NumberFormat(locale.value, { style: 'currency', currency: 'DZD' }).format(value)
        }

        const formatDate = (date) => {
            return new Date(date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            })
        }

        const sheetUpdate = (value) => {
            sheet.value = value
        }

        const getColor = (valeur) => {
            if (valeur.status == 'pending') return '#FF8C00'
            else if (valeur.status == 'confirmed') return '#28a74580'
        }

        const getPublishedColor = (valeur) => {
            if (valeur.published) return '#28a74580'
            else return '#FF8C00'
        }
</script>