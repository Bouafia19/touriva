<template>
  <v-container fluid class="pa-6">
    <invoice
      :announcements="announcements"
      ref="report"
      v-show="false"
      :partner="partner"
      :company="company.getCompany"
      :billing="billing"
    />

    <div class="editorial-section-header d-flex flex-wrap align-center justify-space-between mb-6">
      <div>
        <span class="editorial-tag">{{ $t('Management') }} • {{ $t('Billing') }}</span>
        <h1 class="editorial-title">{{ $t('Billing') }}</h1>
        <p class="editorial-subtitle">User invoices, subscription history, and payment processing</p>
      </div>

      <div class="d-flex align-center mt-3 mt-sm-0" v-if="total > 0">
        <v-btn
          class="btn-editorial-primary"
          @click="newBilling"
          :loading="loadingNewBilling"
        >
          {{ $t('makePayment') }}
        </v-btn>
      </div>
    </div>

    <v-card class="admin-card overflow-hidden">
      <div class="pa-4 pa-sm-5 border-bottom d-flex flex-wrap align-center justify-space-between gap-3">
        <div style="max-width: 380px; width: 100%;">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            :label="$t('Search') + '...'"
            single-line
            hide-details
            density="compact"
            variant="outlined"
            rounded="pill"
            color="primary"
            bg-color="warmIvory"
            clearable
          ></v-text-field>
        </div>

        <div class="d-flex align-center gap-2">
          <v-chip size="small" color="primary" variant="tonal" class="font-weight-bold">
            {{ billings.getBillings?.length || 0 }} Records
          </v-chip>
        </div>
      </div>

      <v-data-table
        :headers="headers"
        :items="billings.getBillings || []"
        :loading="!billings.getBillings"
        :search="search"
        hover
        class="editorial-data-table"
      >
        <template v-slot:headers="{ columns }">
          <tr class="table-header-row">
            <template v-for="column in columns" :key="column.key">
              <th class="table-header-cell">
                {{ column.text }}
              </th>
            </template>
          </tr>
        </template>

        <template v-slot:[`item.date`]="{ item }">
          <span class="text-body-2 font-weight-medium text-forest">{{ formatDate(item.date) }}</span>
        </template>

        <template v-slot:[`item.amount`]="{ item }">
          <span class="text-body-2 font-weight-bold text-forest">{{ formatNumber(item.amount) }}</span>
        </template>

        <template v-slot:[`item.status`]="{ item }">
          <span
            class="status-badge"
            :class="{
              'success': item.status === 'confirmed',
              'warning': item.status === 'pending'
            }"
          >
            {{ item.status == 'pending' ? $t('pending') : $t('confirmed') }}
          </span>
        </template>

        <template v-slot:[`item.detail`]="{ item }">
          <v-btn
            size="small"
            class="btn-editorial-sand"
            @click="getDetail(item)"
          >
            {{ $t('More') }}
          </v-btn>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-btn
            size="small"
            class="btn-editorial-outline"
            @click="printItem(item)"
            :loading="item.createloading"
            v-if="item.status === 'confirmed'"
          >
            {{ $t('Download') }}
          </v-btn>
        </template>

        <template v-slot:no-data>
          <div class="text-center py-10">
            <div class="text-caption text-secondary-editorial">{{ $t('noRecords') }}</div>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog Details -->
    <v-dialog v-model="dialog" max-width="840px" persistent>
      <v-card class="editorial-card rounded-xl overflow-hidden">
        <div class="px-6 py-4 bg-forest-green text-white d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-avatar size="34" color="rgba(255,255,255,0.15)" class="mr-3">
              <v-icon icon="mdi-receipt-text-outline" color="sand" size="18"></v-icon>
            </v-avatar>
            <div class="font-serif text-h6 font-weight-bold">Billing Details</div>
          </div>
          <v-btn icon="mdi-close" variant="text" color="white" @click="close"></v-btn>
        </div>

        <v-card-text class="pa-6 bg-white">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="computedDateFormatted"
                prepend-inner-icon="mdi-calendar"
                :label="$t('Date')"
                readonly
                variant="outlined"
                density="comfortable"
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model="editedItem.amount"
                prepend-inner-icon="mdi-cash"
                :label="$t('Amount')"
                readonly
                variant="outlined"
                density="comfortable"
                class="mb-3"
              ></v-text-field>

              <v-textarea
                v-model="editedItem.description"
                :label="$t('Description')"
                rows="4"
                variant="outlined"
                density="comfortable"
                color="primary"
                :disabled="editedIndex > -1"
              ></v-textarea>
            </v-col>

            <v-col cols="12" md="6" v-if="editedIndex > -1">
              <div v-if="editedItem.photo" class="border-editorial rounded-lg overflow-hidden">
                <v-img :src="editedItem.photo" height="260" cover></v-img>
              </div>
              <div v-else class="text-center py-12 bg-warm-ivory rounded-lg border-editorial">
                <v-icon icon="mdi-receipt" size="48" color="sandDark"></v-icon>
                <div class="text-caption text-secondary-editorial mt-2">No receipt document attached</div>
              </div>
            </v-col>
          </v-row>

          <v-row v-if="announcements?.length">
            <v-col cols="12">
              <AnnouncementsDataTable
                :data="announcements"
                :headers="announcementByUserIdheaders"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="px-6 py-3 bg-white">
          <v-spacer></v-spacer>
          <v-btn variant="text" rounded="pill" class="px-5 font-weight-medium" @click="close">
            {{ $t('Cancel') }}
          </v-btn>
          <v-btn
            class="btn-editorial-primary px-6"
            rounded="pill"
            @click="confirm"
            :loading="loading"
          >
            {{ $t('OK') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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

const headers = ref([
  { text: 'Date', align: 'start', sortable: false, value: 'date' },
  { text: 'Description', value: 'description' },
  { text: 'Amount', value: 'amount' },
  { text: 'Status', value: 'status' },
  { text: '', value: 'detail', sortable: false },
  { text: '', value: 'actions', sortable: false }
])

const announcementByUserIdheaders = ref([
  { text: 'Name', align: 'start', sortable: false, value: 'name' },
  { text: 'Paid', value: 'paid' },
  { text: 'Published', value: 'published' }
])

const search = ref('')
const total = ref(null)
const partner = ref(undefined)
const announcements = ref([])
const loading = ref(false)
const loadingNewBilling = ref(false)
const subTotal = ref(0)
const dialog = ref(false)
const editedIndex = ref(-1)
const editedItem = ref({})
const defaultItem = ref({
  photo: '',
  billingMethod: '',
  amount: null,
  date: null,
  description: ''
})
const billing = ref(undefined)
const report = ref(null)

const computedDateFormatted = computed(() => {
  return editedItem.value.date ? moment(editedItem.value.date).format('dddd, MMMM Do YYYY') : ''
})

const fetchAnnouncements = async () => {
  try {
    const response = await axios.get(`/api/announcements/getAnnouncementsByOwnerId/${props.id}`)
    announcements.value = response.data || []
  } catch (error) {
    console.error('Error fetching announcements:', error)
  }
}

onMounted(() => {
  initialize()
})

const initialize = () => {
  billings.fetchBillingsByUserId(props.id)
  if (props.typeAccount === 'seller') {
    fetchAnnouncements()
  }
  company.fetchCompany()
}

const newBilling = () => {
  editedIndex.value = -1
  defaultItem.value.amount = total.value
  defaultItem.value.brutAmount = subTotal.value
  defaultItem.value.date = Date.now()
  defaultItem.value.partnerId = props.id
  Object.assign(editedItem.value, defaultItem.value)
  dialog.value = true
}

const formatNumber = (value) => {
  return new Intl.NumberFormat(locale.value, { style: 'currency', currency: 'DZD' }).format(value || 0)
}

const formatDate = (value) => {
  return value ? moment(value).format('dddd, MMMM Do YYYY') : ''
}

const printItem = (item) => {
  item.createloading = true
  billing.value = item
  partner.value = item.userId
  setTimeout(() => {
    report.value?.generateReport()
    item.createloading = false
    editedIndex.value = (billings.getBillings || []).indexOf(item)
    if (editedIndex.value > -1 && billings.getBillings) {
      Object.assign(billings.getBillings[editedIndex.value], item)
    }
  }, 3000)
}

const getDetail = (item) => {
  if (props.typeAccount === 'rented') {
    announcements.value = [item.pubId]
  }
  editedIndex.value = (billings.getBillings || []).indexOf(item)
  editedItem.value = Object.assign({}, item)
  dialog.value = true
}

const close = () => {
  dialog.value = false
}

const confirm = async () => {
  loading.value = true
  for (const e of (announcements.value || [])) {
    e.paid = true
    await pub.editAnnouncements(e)
  }

  editedItem.value.status = 'confirmed'
  if (editedIndex.value > -1) {
    await billings.editBillings(editedItem.value)
  } else {
    await billings.addBillings(editedItem.value)
  }
  loading.value = false
  billings.fetchBillingsByUserId(props.id)
  dialog.value = false
}
</script>

<style scoped>
.table-header-row {
  background-color: var(--color-warm-ivory);
}

.table-header-cell {
  color: var(--color-forest-green) !important;
  font-weight: 700 !important;
  font-size: 0.8125rem !important;
  text-transform: uppercase !important;
  letter-spacing: 0.04em !important;
  padding: 14px 16px !important;
  border-bottom: 2px solid var(--color-border) !important;
}

.border-bottom {
  border-bottom: 1px solid var(--color-border);
}
</style>