<template>
  <v-container class="py-8 max-w-1200">
    <!-- Page Header -->
    <div class="mb-6">
      <span class="editorial-tag text-sand-dark d-block mb-1">CUSTOMER ACCOUNT • TRANSACTIONS</span>
      <h1 class="editorial-heading text-h4 text-md-h3 font-weight-bold text-forest">
        {{ $t('Orders') || 'My Orders & Purchases' }}
      </h1>
      <p class="text-body-2 text-secondary-editorial mt-1">
        Track your recent purchases, order fulfillment, and transaction history.
      </p>
    </div>

    <!-- Summary Metrics Cards -->
    <v-row class="mb-6" v-if="ordersList && ordersList.length > 0">
      <v-col cols="12" sm="4">
        <v-card class="editorial-card pa-4 d-flex align-center">
          <v-avatar color="sandLight" size="48" class="mr-4">
            <v-icon color="deepGreen" size="24">mdi-package-variant</v-icon>
          </v-avatar>
          <div>
            <div class="text-caption text-secondary-editorial font-weight-bold text-uppercase">Total Orders</div>
            <div class="editorial-heading text-h5 font-weight-bold text-forest">
              {{ ordersList.length }}
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card class="editorial-card pa-4 d-flex align-center">
          <v-avatar color="sandLight" size="48" class="mr-4">
            <v-icon color="warning" size="24">mdi-clock-outline</v-icon>
          </v-avatar>
          <div>
            <div class="text-caption text-secondary-editorial font-weight-bold text-uppercase">Pending</div>
            <div class="editorial-heading text-h5 font-weight-bold text-forest">
              {{ pendingCount }}
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card class="editorial-card pa-4 d-flex align-center">
          <v-avatar color="sandLight" size="48" class="mr-4">
            <v-icon color="emerald" size="24">mdi-check-circle-outline</v-icon>
          </v-avatar>
          <div>
            <div class="text-caption text-secondary-editorial font-weight-bold text-uppercase">Confirmed</div>
            <div class="editorial-heading text-h5 font-weight-bold text-forest">
              {{ confirmedCount }}
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Orders Data Table Card -->
    <v-card class="editorial-card overflow-hidden">
      <v-data-table
        :headers="headers"
        :items="ordersList"
        :loading="loadingOrders"
        :search="search"
        class="shop-orders-table"
        disable-sort
        hide-default-footer
      >
        <!-- Table Top Header -->
        <template #top>
          <div class="pa-4 pa-sm-6 d-flex align-center justify-space-between flex-wrap ga-3 border-b-editorial">
            <div class="d-flex align-center">
              <v-icon color="forestGreen" size="24" class="mr-2">mdi-receipt-text-outline</v-icon>
              <h2 class="editorial-heading text-h6 font-weight-bold text-forest">
                Order Activity
              </h2>
            </div>

            <v-text-field
              v-if="ordersList && ordersList.length > 3"
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              placeholder="Search orders..."
              variant="outlined"
              density="compact"
              hide-details
              rounded="pill"
              style="max-width: 260px;"
            />
          </div>
        </template>

        <!-- Custom Table Header Row -->
        <template #headers="{ columns }">
          <tr class="table-header-row bg-warm-ivory">
            <th
              v-for="col in columns"
              :key="col.key || col.value"
              class="editorial-tag text-sand-dark py-3 px-4 font-weight-bold"
            >
              {{ col.text || col.title }}
            </th>
          </tr>
        </template>

        <!-- Product / Item Code Column -->
        <template #item.productId.code="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar size="40" rounded="lg" color="sandLight" class="mr-3 border-editorial">
              <v-icon color="deepGreen" size="20">mdi-tag-outline</v-icon>
            </v-avatar>
            <div>
              <span class="editorial-chip px-2 py-0-5 text-caption font-weight-bold">
                {{ item.productId?.code || item.productId || 'TOU-ITEM' }}
              </span>
            </div>
          </div>
        </template>

        <!-- Date Column -->
        <template #item.date="{ item }">
          <span class="text-body-2 text-secondary-editorial font-weight-medium">
            {{ formatDate(item.date) }}
          </span>
        </template>

        <!-- Description Column -->
        <template #item.description="{ item }">
          <span class="text-body-2 text-forest">
            {{ item.description || 'Standard Order Purchase' }}
          </span>
        </template>

        <!-- Amount Column -->
        <template #item.amount="{ item }">
          <span class="shop-price-tag font-weight-bold">
            {{ formatNumber(item.amount) }}
          </span>
        </template>

        <!-- Status Column -->
        <template #item.status="{ item }">
          <v-chip
            size="small"
            rounded="pill"
            class="font-weight-bold px-3"
            :color="item.status === 'confirmed' ? 'emerald' : 'warning'"
            variant="tonal"
          >
            <v-icon start size="14">
              {{ item.status === 'confirmed' ? 'mdi-check-circle' : 'mdi-clock-outline' }}
            </v-icon>
            <span class="text-capitalize">{{ item.status || 'pending' }}</span>
          </v-chip>
        </template>

        <!-- Empty State -->
        <template #no-data>
          <div class="shop-empty-state my-6 pa-8">
            <v-avatar size="64" color="sandLight" class="mb-3">
              <v-icon size="32" color="deepGreen">mdi-package-variant-closed</v-icon>
            </v-avatar>
            <h3 class="editorial-heading text-h6 font-weight-bold text-forest mb-2">
              {{ $t('noRecords') || 'No Orders Placed Yet' }}
            </h3>
            <p class="text-body-2 text-secondary-editorial mb-4 max-w-400 mx-auto">
              You haven't placed any orders yet. Discover our curated collection of artisan goods and travel essentials.
            </p>
            <v-btn
              class="btn-editorial-primary px-6"
              size="default"
              rounded="pill"
              @click="$router.push('/products')"
            >
              <v-icon start size="18">mdi-shopping-outline</v-icon>
              Explore Shop
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useOrdersStore } from '@/stores/orders'
  import { useAuthStore } from '@/stores/auth'
  import { useUsersStore } from '@/stores/users'
  import { useProductsStore } from '@/stores/products'
  import { useI18n } from 'vue-i18n'

  const orders = useOrdersStore()
  const auth = useAuthStore()
  const users = useUsersStore()
  const products = useProductsStore()
  const { locale } = useI18n()

  const headers = ref([
    { text: 'Reference', title: 'Reference', align: 'start', sortable: false, value: 'productId.code', key: 'productId.code' },
    { text: 'Date', title: 'Date', align: 'start', sortable: false, value: 'date', key: 'date' },
    { text: 'Description', title: 'Description', value: 'description', key: 'description' },
    { text: 'Amount', title: 'Amount', value: 'amount', key: 'amount' },
    { text: 'Status', title: 'Status', value: 'status', key: 'status' }
  ])

  const search = ref('')
  const loadingOrders = ref(false)
  const user = ref(undefined)
  const id = ref(undefined)
  const total = ref(null)
  const sheet = ref(false)
  const plans = ref([])
  const planSheet = ref(false)
  const loadingNewOrder = ref(false)

  const ordersList = computed(() => {
    return Array.isArray(orders.getOrders) ? orders.getOrders : []
  })

  const pendingCount = computed(() => {
    return ordersList.value.filter((o) => o.status === 'pending').length
  })

  const confirmedCount = computed(() => {
    return ordersList.value.filter((o) => o.status === 'confirmed').length
  })

  const initialize = () => {
    loadingOrders.value = true
    auth.getLSUserInfo().then((ls) => {
      if (ls && ls.user) {
        user.value = ls.user
        id.value = ls.user._id
        orders.fetchOrdersByUserId().finally(() => {
          loadingOrders.value = false
        })
      } else {
        loadingOrders.value = false
      }
    }).catch(() => {
      loadingOrders.value = false
    })
  }

  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0 DZD'
    return new Intl.NumberFormat(locale.value || 'en', {
      style: 'currency',
      currency: 'DZD'
    }).format(value)
  }

  const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const confirmOrder = async () => {
    if (user.value?._id) {
      products.fetchProductsByOwner(user.value._id)
      await users.updateUserProfile(user.value)
    }
  }

  const selectPlan = async (plan) => {
    const currentDate = new Date()
    currentDate.setMonth(currentDate.getMonth() + plan.duration)

    products.getProductsByOwnerIdNotPaid.forEach((item) => {
      item.planId = plan._id
      item.expirationOfSubscription = currentDate
    })
    total.value = plan.price
    sheet.value = true
    if (user.value) {
      user.value.expirationOfSubscription = currentDate
    }
  }

  const orderForSellerAccount = () => {
    if (!user.value?.expirationOfSubscription) {
      planSheet.value = true
      return
    }
    const inputTimestamp = new Date(user.value.expirationOfSubscription).getTime()
    const currentTimestamp = new Date().getTime()
    if (currentTimestamp >= inputTimestamp) {
      planSheet.value = true
    }
  }

  const newOrder = (e, { item }) => {
    if (user.value?.typeAccount === 'seller') {
      orderForSellerAccount()
      return
    }
    loadingNewOrder.value = true
    sheet.value = true
    loadingNewOrder.value = false
    total.value = item.planId?.price || 0
    products.productsByOwnerIdNotPaid = [item]
  }

  const getColor = (valeur) => {
    if (valeur.status === 'pending') return '#D9943B'
    else if (valeur.status === 'confirmed') return '#21866B'
    return '#173F35'
  }

  const getPublishedColor = (valeur) => {
    if (valeur.published) return '#21866B'
    else return '#D9943B'
  }

  onMounted(() => {
    initialize()
  })
</script>

<style scoped>
  .max-w-1200 {
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
  }

  .max-w-400 {
    max-width: 400px;
  }

  .border-b-editorial {
    border-bottom: 1px solid var(--color-border);
  }

  .shop-orders-table {
    border-collapse: separate;
    border-spacing: 0;
  }

  .table-header-row th {
    border-bottom: 1px solid var(--color-border) !important;
  }
</style>