<template>
  <div class="agency-bookings-view">
    <!-- Header -->
    <div class="d-flex flex-column flex-md-row justify-space-between align-start align-md-center mb-6 ga-4">
      <div>
        <h1 class="text-h4 font-serif font-weight-bold text-forest mb-1">
          Réservations & Voyageurs
        </h1>
        <p class="text-body-2 text-secondary-editorial mb-0">
          Suivi des réservations d'excursions, validation des demandes et gestion des listes de passagers.
        </p>
      </div>

      <!-- Quick Search -->
      <div style="min-width: 280px;">
        <v-text-field
          v-model="searchQuery"
          density="compact"
          variant="outlined"
          prepend-inner-icon="mdi-magnify"
          placeholder="Réf (ex: TRV-BKG-...), nom, téléphone"
          hide-details
          rounded="lg"
          color="#102D27"
          clearable
          @update:model-value="debouncedSearch"
        />
      </div>
    </div>

    <!-- Alert / Status feedback -->
    <v-alert
      v-if="actionSuccess"
      type="success"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="actionSuccess = ''"
    >
      {{ actionSuccess }}
    </v-alert>

    <v-alert
      v-if="actionError"
      type="error"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="actionError = ''"
    >
      {{ actionError }}
    </v-alert>

    <!-- Filter Tabs -->
    <v-card class="editorial-card pa-2 mb-6" elevation="0">
      <v-tabs
        v-model="activeTab"
        color="#21866B"
        align-tabs="start"
        density="comfortable"
        @update:model-value="onTabChange"
      >
        <v-tab value="all" class="text-capitalize font-weight-bold">
          Toutes
        </v-tab>
        <v-tab value="pending" class="text-capitalize font-weight-bold">
          <v-badge
            v-if="agencyStore.pendingBookingsCount > 0"
            :content="agencyStore.pendingBookingsCount"
            color="warning"
            inline
            class="mr-1"
          />
          En Attente
        </v-tab>
        <v-tab value="confirmed" class="text-capitalize font-weight-bold">
          Confirmées
        </v-tab>
        <v-tab value="cancelled" class="text-capitalize font-weight-bold">
          Annulées
        </v-tab>
        <v-tab value="rejected" class="text-capitalize font-weight-bold">
          Rejetées
        </v-tab>
      </v-tabs>
    </v-card>

    <!-- Bookings Table -->
    <v-card class="editorial-card overflow-hidden" elevation="0">
      <v-table hover>
        <thead>
          <tr class="bg-sand-light">
            <th class="font-weight-bold text-forest">RÉFÉRENCE</th>
            <th class="font-weight-bold text-forest">EXCURSION</th>
            <th class="font-weight-bold text-forest">DÉPART</th>
            <th class="font-weight-bold text-forest">CLIENT & CONTACT</th>
            <th class="font-weight-bold text-forest text-center">PLACES</th>
            <th class="font-weight-bold text-forest text-end">TOTAL (DZD)</th>
            <th class="font-weight-bold text-forest text-center">STATUT</th>
            <th class="font-weight-bold text-forest text-end">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <!-- Loading skeleton -->
          <tr v-if="loading">
            <td colspan="8" class="text-center py-8">
              <v-progress-circular indeterminate color="#21866B" />
              <div class="text-caption text-secondary-editorial mt-2">Chargement des réservations...</div>
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-else-if="!bookings.length">
            <td colspan="8" class="text-center py-10">
              <v-icon size="48" color="#D9B98C" class="mb-2">mdi-ticket-confirmation-outline</v-icon>
              <div class="text-subtitle-1 font-weight-bold text-forest">Aucune réservation trouvée</div>
              <p class="text-caption text-secondary-editorial mb-0">
                Aucune commande ne correspond à vos filtres actuels.
              </p>
            </td>
          </tr>

          <!-- Rows -->
          <tr v-else v-for="b in bookings" :key="b._id">
            <!-- Reference -->
            <td class="font-weight-bold font-monospace text-forest">
              {{ b.bookingReference }}
              <div class="text-caption text-grey" style="font-size: 0.72rem !important;">
                {{ formatDate(b.createdAt) }}
              </div>
            </td>

            <!-- Excursion -->
            <td>
              <div class="font-weight-medium text-forest text-truncate" style="max-width: 180px;">
                {{ b.trip?.name || 'Excursion' }}
              </div>
              <div class="text-caption text-secondary-editorial">
                {{ b.trip?.destination || 'Algérie' }}
              </div>
            </td>

            <!-- Departure Date -->
            <td>
              <div class="text-caption font-weight-medium">
                {{ formatDepartureDates(b.departure?.startDate, b.departure?.endDate) }}
              </div>
              <div class="text-caption text-grey text-truncate" style="max-width: 140px;">
                {{ b.departure?.meetingPoint || 'Lieu standard' }}
              </div>
            </td>

            <!-- Client & Contact -->
            <td>
              <div class="font-weight-medium text-forest">
                {{ b.customerInfo?.fullName }}
              </div>
              <div class="text-caption text-emerald font-weight-bold">
                <a :href="'tel:' + b.customerInfo?.phone" class="text-decoration-none text-emerald">
                  <v-icon size="12">mdi-phone</v-icon> {{ b.customerInfo?.phone }}
                </a>
              </div>
            </td>

            <!-- Seats -->
            <td class="text-center">
              <v-chip size="small" variant="tonal" color="#102D27" class="font-weight-bold">
                {{ b.seats }} {{ b.seats > 1 ? 'places' : 'place' }}
              </v-chip>
            </td>

            <!-- Total Price in DZD -->
            <td class="text-end font-weight-bold text-forest">
              {{ formatPrice(b.totalPriceDZD) }}
            </td>

            <!-- Status -->
            <td class="text-center">
              <div class="d-flex flex-column align-center ga-1">
                <v-chip
                  size="small"
                  :color="getStatusColor(b.status)"
                  variant="flat"
                  class="text-capitalize font-weight-bold text-white"
                >
                  {{ formatStatus(b.status) }}
                </v-chip>
                <v-chip
                  size="x-small"
                  :color="getFinancialStatusColor(b.financialStatus)"
                  variant="tonal"
                  class="font-weight-bold"
                >
                  {{ formatFinancialStatus(b.financialStatus) }}
                </v-chip>
              </div>
            </td>

            <!-- Actions -->
            <td class="text-end">
              <div class="d-inline-flex ga-1">
                <v-btn
                  icon="mdi-eye-outline"
                  size="small"
                  variant="text"
                  color="#102D27"
                  title="Voir les détails"
                  @click="openDetail(b)"
                />

                <!-- Confirm button (if pending) -->
                <v-btn
                  v-if="b.status === 'pending'"
                  icon="mdi-check-circle-outline"
                  size="small"
                  variant="text"
                  color="success"
                  title="Confirmer la réservation"
                  @click="openConfirm(b)"
                />

                <!-- Reject button (if pending) -->
                <v-btn
                  v-if="b.status === 'pending'"
                  icon="mdi-close-circle-outline"
                  size="small"
                  variant="text"
                  color="error"
                  title="Rejeter la réservation"
                  @click="openReject(b)"
                />

                <!-- Cancel button (if active) -->
                <v-btn
                  v-if="['pending', 'confirmed'].includes(b.status)"
                  icon="mdi-cancel"
                  size="small"
                  variant="text"
                  color="grey"
                  title="Annuler la réservation"
                  @click="openCancel(b)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- ============================================================ -->
    <!-- DETAIL MODAL -->
    <!-- ============================================================ -->
    <v-dialog v-model="detailDialog" max-width="650" scrollable>
      <v-card v-if="selectedBooking" class="editorial-card pa-6">
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <div class="text-caption text-sand-dark font-weight-bold">DÉTAIL DE RÉSERVATION</div>
            <h3 class="text-h6 font-serif font-weight-bold text-forest">
              {{ selectedBooking.bookingReference }}
            </h3>
          </div>
          <v-chip :color="getStatusColor(selectedBooking.status)" class="text-white font-weight-bold" size="small">
            {{ formatStatus(selectedBooking.status) }}
          </v-chip>
        </div>

        <v-divider class="mb-4 border-subtle" />

        <div class="mb-4">
          <div class="text-caption text-secondary-editorial mb-1">EXCURSION & DÉPART</div>
          <div class="font-weight-bold text-forest text-body-1">{{ selectedBooking.trip?.name }}</div>
          <div class="text-body-2 text-secondary-editorial">
            {{ formatDepartureDates(selectedBooking.departure?.startDate, selectedBooking.departure?.endDate) }}
          </div>
          <div class="text-caption text-grey">
            Point de rendez-vous : {{ selectedBooking.departure?.meetingPoint || 'Non précisé' }}
          </div>
        </div>

        <!-- Primary Booker Info -->
        <div class="bg-sand-light pa-4 rounded-lg mb-4">
          <div class="text-caption font-weight-bold text-forest mb-2">COORDONNÉES CLIENT</div>
          <div class="d-flex justify-space-between mb-1">
            <span class="text-caption text-secondary-editorial">Nom complet :</span>
            <span class="text-caption font-weight-bold text-forest">{{ selectedBooking.customerInfo?.fullName }}</span>
          </div>
          <div class="d-flex justify-space-between mb-1">
            <span class="text-caption text-secondary-editorial">Téléphone :</span>
            <span class="text-caption font-weight-bold text-emerald">{{ selectedBooking.customerInfo?.phone }}</span>
          </div>
          <div v-if="selectedBooking.customerInfo?.email" class="d-flex justify-space-between">
            <span class="text-caption text-secondary-editorial">Email :</span>
            <span class="text-caption font-weight-medium text-forest">{{ selectedBooking.customerInfo?.email }}</span>
          </div>
        </div>

        <!-- Passenger Roster -->
        <div class="mb-4">
          <div class="text-caption font-weight-bold text-forest mb-2">
            LISTE DES PASSAGERS ({{ selectedBooking.passengers?.length || selectedBooking.seats }})
          </div>
          <v-list density="compact" class="bg-transparent pa-0">
            <v-list-item
              v-for="(p, idx) in selectedBooking.passengers"
              :key="idx"
              class="px-2 py-1 border-b"
            >
              <template #prepend>
                <v-avatar size="24" color="#D9B98C" class="mr-2 text-caption font-weight-bold text-forest">
                  {{ idx + 1 }}
                </v-avatar>
              </template>
              <v-list-item-title class="text-body-2 font-weight-medium">
                {{ p.fullName }}
                <span class="text-caption text-grey ml-1">({{ p.ageCategory === 'child' ? 'Enfant' : 'Adulte' }})</span>
              </v-list-item-title>
              <template #append v-if="p.emergencyPhone">
                <span class="text-caption text-secondary-editorial">Urg: {{ p.emergencyPhone }}</span>
              </template>
            </v-list-item>
          </v-list>
        </div>

        <!-- Pricing & Financial Breakdown -->
        <div class="pa-3 bg-warm-ivory rounded-lg mb-4 border-subtle">
          <div class="d-flex justify-space-between align-center mb-2">
            <div>
              <div class="text-caption text-secondary-editorial">Montant total ({{ selectedBooking.seats }} places)</div>
              <div class="text-h6 font-weight-bold text-forest">{{ formatPrice(selectedBooking.totalPriceDZD) }}</div>
            </div>
            <div class="text-caption text-emerald font-weight-bold">
              {{ formatPrice(selectedBooking.unitPriceDZD) }} / place
            </div>
          </div>
          <v-divider class="my-2" />
          <div class="d-flex justify-space-between text-body-2 mb-1">
            <span class="text-secondary-editorial">Déjà Encaissé :</span>
            <strong class="text-emerald">{{ formatPrice(selectedBooking.totalPaidDZD || 0) }}</strong>
          </div>
          <div class="d-flex justify-space-between text-body-2 mb-2">
            <span class="text-secondary-editorial">Reste à Régler :</span>
            <strong class="text-amber">{{ formatPrice(selectedBooking.balanceDueDZD !== undefined ? selectedBooking.balanceDueDZD : selectedBooking.totalPriceDZD) }}</strong>
          </div>
          <v-btn
            size="small"
            color="#173F35"
            variant="tonal"
            block
            class="font-weight-bold"
            to="/agency/financials"
          >
            <v-icon start>mdi-cash-multiple</v-icon>
            Gérer les Règlements de cette Réservation
          </v-btn>
        </div>

        <!-- Audit Trail / History -->
        <div v-if="selectedBooking.statusHistory?.length" class="mb-4">
          <div class="text-caption font-weight-bold text-forest mb-2">HISTORIQUE DU STATUT</div>
          <div v-for="(h, idx) in selectedBooking.statusHistory" :key="idx" class="text-caption text-secondary-editorial mb-1">
            • <strong>{{ formatStatus(h.status) }}</strong> — {{ formatDate(h.timestamp) }}
            <span v-if="h.note" class="text-grey font-italic"> ({{ h.note }})</span>
          </div>
        </div>

        <v-card-actions class="px-0 pt-2">
          <v-spacer />
          <v-btn variant="outlined" color="#102D27" rounded="pill" @click="detailDialog = false">
            Fermer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ============================================================ -->
    <!-- CONFIRM DIALOG -->
    <!-- ============================================================ -->
    <v-dialog v-model="confirmDialog" max-width="450">
      <v-card class="editorial-card pa-6">
        <h3 class="text-h6 font-serif font-weight-bold text-forest mb-2">
          Confirmer la Réservation
        </h3>
        <p class="text-caption text-secondary-editorial mb-4">
          Vous êtes sur le point de confirmer la réservation <strong>{{ actionTarget?.bookingReference }}</strong> pour
          <strong>{{ actionTarget?.seats }} place(s)</strong>.
        </p>

        <v-text-field
          v-model="confirmNote"
          label="Note ou instruction pour le client (optionnel)"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          class="mb-4"
        />

        <v-card-actions class="px-0">
          <v-spacer />
          <v-btn variant="text" @click="confirmDialog = false">Annuler</v-btn>
          <v-btn
            color="#21866B"
            class="text-white font-weight-bold"
            rounded="pill"
            :loading="actionLoading"
            @click="executeConfirm"
          >
            Confirmer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ============================================================ -->
    <!-- REJECT DIALOG -->
    <!-- ============================================================ -->
    <v-dialog v-model="rejectDialog" max-width="480">
      <v-card class="editorial-card pa-6">
        <h3 class="text-h6 font-serif font-weight-bold text-forest mb-2">
          Rejeter la Demande de Réservation
        </h3>
        <p class="text-caption text-secondary-editorial mb-4">
          Les places réservées seront immédiatement libérées et remises en disponibilité sur le catalogue.
        </p>

        <v-textarea
          v-model="rejectReason"
          label="Motif du rejet (obligatoire, min 5 caractères) *"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          rows="3"
          placeholder="Ex: Session complète suite à un groupe privé ou indisponibilité transport."
          class="mb-4"
          :error-messages="rejectError"
        />

        <v-card-actions class="px-0">
          <v-spacer />
          <v-btn variant="text" @click="rejectDialog = false">Fermer</v-btn>
          <v-btn
            color="error"
            class="font-weight-bold"
            rounded="pill"
            :loading="actionLoading"
            @click="executeReject"
          >
            Rejeter & Libérer les Places
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ============================================================ -->
    <!-- CANCEL DIALOG -->
    <!-- ============================================================ -->
    <v-dialog v-model="cancelDialog" max-width="480">
      <v-card class="editorial-card pa-6">
        <h3 class="text-h6 font-serif font-weight-bold text-forest mb-2">
          Annuler la Réservation
        </h3>
        <p class="text-caption text-secondary-editorial mb-4">
          L'annulation libérera automatiquement les places réservées pour d'autres voyageurs.
        </p>

        <v-textarea
          v-model="cancelReason"
          label="Motif d'annulation (obligatoire) *"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          rows="3"
          placeholder="Ex: Demande expresse du client ou impératif logistique."
          class="mb-4"
          :error-messages="cancelError"
        />

        <v-card-actions class="px-0">
          <v-spacer />
          <v-btn variant="text" @click="cancelDialog = false">Fermer</v-btn>
          <v-btn
            color="error"
            class="font-weight-bold"
            rounded="pill"
            :loading="actionLoading"
            @click="executeCancel"
          >
            Confirmer l'Annulation
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAgencyStore } from '@/stores/agency'

const agencyStore = useAgencyStore()

const loading = ref(false)
const searchQuery = ref('')
const activeTab = ref('all')
const actionSuccess = ref('')
const actionError = ref('')
const actionLoading = ref(false)

const detailDialog = ref(false)
const selectedBooking = ref(null)

const confirmDialog = ref(false)
const confirmNote = ref('')

const rejectDialog = ref(false)
const rejectReason = ref('')
const rejectError = ref('')

const cancelDialog = ref(false)
const cancelReason = ref('')
const cancelError = ref('')

const actionTarget = ref(null)

let searchTimeout = null

const bookings = computed(() => agencyStore.getBookings)

const loadBookings = async () => {
  loading.value = true
  try {
    const statusParam = activeTab.value === 'all' ? null : activeTab.value
    await agencyStore.fetchBookings({
      status: statusParam,
      search: searchQuery.value?.trim() || ''
    })
  } catch (err) {
    actionError.value = 'Impossible de charger les réservations.'
  } finally {
    loading.value = false
  }
}

const onTabChange = () => {
  loadBookings()
}

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadBookings()
  }, 350)
}

const formatPrice = (val) => {
  const num = Number(val)
  return isNaN(num) ? `${val} DZD` : `${num.toLocaleString()} DZD`
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-DZ', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

const getFinancialStatusColor = (status) => {
  const map = {
    unpaid: '#8F9088',
    partially_paid: '#D9943B',
    paid: '#21866B',
    refund_pending: '#D9943B',
    refunded: '#21866B',
    partially_refunded: '#D9943B',
    cancelled_unpaid: '#8F9088'
  }
  return map[status] || '#8F9088'
}

const formatFinancialStatus = (status) => {
  const map = {
    unpaid: 'Non payé',
    partially_paid: 'Partiel',
    paid: 'Payé',
    refund_pending: 'Remb. en attente',
    refunded: 'Remboursé',
    partially_refunded: 'Partiel. remboursé',
    cancelled_unpaid: 'Non facturé'
  }
  return map[status] || status || 'Non payé'
}

const formatDepartureDates = (start, end) => {
  if (!start) return '—'
  const s = new Date(start).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short' })
  const e = end ? new Date(end).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
  return e ? `${s} — ${e}` : s
}

const formatStatus = (st) => {
  const map = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    cancelled: 'Annulée',
    rejected: 'Rejetée',
    completed: 'Terminée'
  }
  return map[st] || st
}

const getStatusColor = (st) => {
  const map = {
    pending: '#B06000',
    confirmed: '#21866B',
    cancelled: '#757575',
    rejected: '#C62828',
    completed: '#173F35'
  }
  return map[st] || 'grey'
}

const openDetail = (b) => {
  selectedBooking.value = b
  detailDialog.value = true
}

const openConfirm = (b) => {
  actionTarget.value = b
  confirmNote.value = ''
  confirmDialog.value = true
}

const executeConfirm = async () => {
  if (!actionTarget.value) return
  actionLoading.value = true
  try {
    await agencyStore.confirmBooking(actionTarget.value._id, confirmNote.value)
    confirmDialog.value = false
    actionSuccess.value = `Réservation ${actionTarget.value.bookingReference} confirmée avec succès.`
    await loadBookings()
  } catch (err) {
    actionError.value = err.response?.data?.error || 'Échec de la confirmation.'
  } finally {
    actionLoading.value = false
  }
}

const openReject = (b) => {
  actionTarget.value = b
  rejectReason.value = ''
  rejectError.value = ''
  rejectDialog.value = true
}

const executeReject = async () => {
  if (!rejectReason.value || rejectReason.value.trim().length < 5) {
    rejectError.value = 'Veuillez saisir un motif valide d\'au moins 5 caractères.'
    return
  }
  actionLoading.value = true
  try {
    await agencyStore.rejectBooking(actionTarget.value._id, rejectReason.value)
    rejectDialog.value = false
    actionSuccess.value = `Réservation ${actionTarget.value.bookingReference} rejetée et places libérées.`
    await loadBookings()
  } catch (err) {
    actionError.value = err.response?.data?.error || 'Échec du rejet.'
  } finally {
    actionLoading.value = false
  }
}

const openCancel = (b) => {
  actionTarget.value = b
  cancelReason.value = ''
  cancelError.value = ''
  cancelDialog.value = true
}

const executeCancel = async () => {
  if (!cancelReason.value || cancelReason.value.trim().length < 5) {
    cancelError.value = 'Veuillez préciser le motif d\'annulation.'
    return
  }
  actionLoading.value = true
  try {
    await agencyStore.cancelBooking(actionTarget.value._id, cancelReason.value)
    cancelDialog.value = false
    actionSuccess.value = `Réservation ${actionTarget.value.bookingReference} annulée.`
    await loadBookings()
  } catch (err) {
    actionError.value = err.response?.data?.error || 'Échec de l\'annulation.'
  } finally {
    actionLoading.value = false
  }
}

onMounted(() => {
  loadBookings()
})
</script>

<style scoped>
.editorial-card {
  border: 1px solid #E7E8E1;
  border-radius: 12px;
  background: #FFFFFF;
}

.bg-sand-light {
  background-color: #FAF8F2;
}

.text-forest {
  color: #102D27;
}

.text-emerald {
  color: #21866B;
}

.text-secondary-editorial {
  color: #555555;
}

.border-subtle {
  border-color: #E7E8E1 !important;
}

.font-monospace {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
</style>
