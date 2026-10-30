<template>
  <div class="agency-enquiries-view">
    <!-- Header -->
    <div class="d-flex flex-column flex-md-row justify-space-between align-start align-md-center mb-6 ga-4">
      <div>
        <h1 class="text-h4 font-serif font-weight-bold text-forest mb-1">
          Demandes de Devis & Sur-Mesure
        </h1>
        <p class="text-body-2 text-secondary-editorial mb-0">
          Traitement des demandes d'itinéraires personnalisés, cotations tarifaires et suivi des propositions clients.
        </p>
      </div>
    </div>

    <!-- Feedback alerts -->
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
        @update:model-value="loadEnquiries"
      >
        <v-tab value="all" class="text-capitalize font-weight-bold">Toutes</v-tab>
        <v-tab value="requested" class="text-capitalize font-weight-bold">
          <v-badge
            v-if="agencyStore.pendingEnquiriesCount > 0"
            :content="agencyStore.pendingEnquiriesCount"
            color="warning"
            inline
            class="mr-1"
          />
          En Attente de Devis
        </v-tab>
        <v-tab value="quoted" class="text-capitalize font-weight-bold">Devis Envoyés</v-tab>
        <v-tab value="accepted" class="text-capitalize font-weight-bold">Acceptées</v-tab>
        <v-tab value="declined" class="text-capitalize font-weight-bold">Refusées</v-tab>
      </v-tabs>
    </v-card>

    <!-- Enquiries Grid -->
    <div v-if="loading" class="text-center py-10">
      <v-progress-circular indeterminate color="#21866B" size="36" />
      <div class="text-caption text-secondary-editorial mt-2">Chargement des demandes de devis...</div>
    </div>

    <v-card v-else-if="!enquiries.length" class="editorial-card pa-10 text-center" elevation="0">
      <v-icon size="48" color="#D9B98C" class="mb-2">mdi-file-document-edit-outline</v-icon>
      <div class="text-h6 font-weight-bold text-forest">Aucune demande de devis</div>
      <p class="text-caption text-secondary-editorial mb-0">
        Les demandes d'excursions personnalisées soumises par les voyageurs apparaîtront ici.
      </p>
    </v-card>

    <v-row v-else>
      <v-col
        v-for="e in enquiries"
        :key="e._id"
        cols="12"
        md="6"
      >
        <v-card class="editorial-card pa-5 h-100 d-flex flex-column justify-space-between" elevation="0">
          <div>
            <div class="d-flex justify-space-between align-start mb-2">
              <span class="text-caption font-monospace font-weight-bold text-forest">
                {{ e.enquiryReference }}
              </span>
              <v-chip :color="getStatusColor(e.status)" size="small" class="text-white font-weight-bold">
                {{ formatStatus(e.status) }}
              </v-chip>
            </div>

            <h3 class="text-h6 font-weight-bold text-forest mb-1">
              {{ e.destination }}
            </h3>
            <div class="text-caption text-secondary-editorial mb-3">
              {{ formatDate(e.startDate) }} — {{ formatDate(e.endDate) }} • <strong>{{ e.groupSize }} personnes</strong>
            </div>

            <!-- Client Info -->
            <div class="bg-sand-light pa-3 rounded-lg mb-3">
              <div class="text-caption font-weight-bold text-forest">{{ e.customerInfo?.fullName }}</div>
              <div class="text-caption text-emerald font-weight-medium">
                <v-icon size="12">mdi-phone</v-icon> {{ e.customerInfo?.phone }}
              </div>
              <div v-if="e.budgetDZD" class="text-caption text-grey mt-1">
                Budget estimé : {{ formatPrice(e.budgetDZD) }}
              </div>
            </div>

            <!-- Special Requests / Theme -->
            <div v-if="e.specialRequests" class="text-caption text-secondary-editorial mb-3">
              <strong>Demande :</strong> {{ e.specialRequests }}
            </div>

            <!-- Existing Quotation Preview if already quoted -->
            <div v-if="e.quotation" class="pa-3 bg-warm-ivory rounded-lg mb-3 border-subtle">
              <div class="d-flex justify-space-between align-center mb-1">
                <span class="text-caption text-secondary-editorial">Devis proposé :</span>
                <span class="text-subtitle-2 font-weight-bold text-forest">{{ formatPrice(e.quotation.quotedPriceDZD) }}</span>
              </div>
              <div class="text-caption text-grey">
                Valide jusqu'au : {{ formatDate(e.quotation.validUntil) }}
              </div>
            </div>
          </div>

          <v-divider class="my-3 border-subtle" />

          <!-- Card Actions -->
          <div class="d-flex justify-space-between align-center">
            <span class="text-caption text-grey">Reçue le {{ formatDate(e.createdAt) }}</span>
            <div class="d-flex ga-2">
              <v-btn
                v-if="e.status === 'requested'"
                color="#102D27"
                size="small"
                rounded="pill"
                class="text-white font-weight-bold text-capitalize"
                @click="openQuoteModal(e)"
              >
                <v-icon start size="16">mdi-send</v-icon>
                Rédiger le Devis
              </v-btn>

              <v-btn
                v-else
                variant="outlined"
                color="#102D27"
                size="small"
                rounded="pill"
                class="text-capitalize"
                @click="openQuoteModal(e)"
              >
                Modifier Devis
              </v-btn>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- ============================================================ -->
    <!-- QUOTATION BUILDER MODAL -->
    <!-- ============================================================ -->
    <v-dialog v-model="quoteDialog" max-width="650" scrollable>
      <v-card v-if="selectedEnquiry" class="editorial-card pa-6">
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <div class="text-caption text-sand-dark font-weight-bold">PROPOSITION DE DEVIS</div>
            <h3 class="text-h6 font-serif font-weight-bold text-forest">
              {{ selectedEnquiry.destination }} — {{ selectedEnquiry.enquiryReference }}
            </h3>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="quoteDialog = false" />
        </div>

        <v-divider class="mb-4 border-subtle" />

        <v-form @submit.prevent="submitQuotation">
          <!-- Price and Expiry -->
          <v-row class="mb-1">
            <v-col cols="12" sm="6">
              <div class="text-caption font-weight-bold text-forest mb-1">PRIX TOTAL PROPOSÉ (DZD) *</div>
              <v-text-field
                v-model="quoteForm.quotedPriceDZD"
                type="number"
                placeholder="Ex: 120000"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                color="#102D27"
                required
              />
            </v-col>
            <v-col cols="12" sm="6">
              <div class="text-caption font-weight-bold text-forest mb-1">DATE LIMITE DE VALIDITÉ *</div>
              <v-text-field
                v-model="quoteForm.validUntil"
                type="date"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                color="#102D27"
                required
              />
            </v-col>
          </v-row>

          <!-- Itinerary Summary -->
          <div class="mb-3">
            <div class="text-caption font-weight-bold text-forest mb-1">PROGRAMME & ÉTAPES PROPOSÉES *</div>
            <v-textarea
              v-model="quoteForm.itinerarySummary"
              rows="3"
              placeholder="Détaillez le circuit, les étapes journalières, les haltes et les prestations assurées..."
              variant="outlined"
              density="comfortable"
              rounded="lg"
              color="#102D27"
              required
            />
          </div>

          <!-- Inclusions -->
          <div class="mb-3">
            <div class="text-caption font-weight-bold text-forest mb-1">PRESTATIONS INCLUSES (séparez par virgule)</div>
            <v-text-field
              v-model="quoteForm.inclusionsRaw"
              placeholder="Ex: Transport 4x4, Bivouac haut de gamme, Guide agréé, Pension complète"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              color="#102D27"
            />
          </div>

          <!-- Exclusions -->
          <div class="mb-3">
            <div class="text-caption font-weight-bold text-forest mb-1">PRESTATIONS NON INCLUSES</div>
            <v-text-field
              v-model="quoteForm.exclusionsRaw"
              placeholder="Ex: Billets d'avion, Assurances individuelles, Achats personnels"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              color="#102D27"
            />
          </div>

          <!-- Cancellation Policy -->
          <div class="mb-4">
            <div class="text-caption font-weight-bold text-forest mb-1">CONDITIONS D'ANNULATION</div>
            <v-text-field
              v-model="quoteForm.cancellationPolicy"
              placeholder="Ex: Annulation sans frais jusqu'à 10 jours avant la date de départ."
              variant="outlined"
              density="comfortable"
              rounded="lg"
              color="#102D27"
            />
          </div>

          <v-card-actions class="px-0 pt-2">
            <v-spacer />
            <v-btn variant="text" @click="quoteDialog = false">Annuler</v-btn>
            <v-btn
              color="#21866B"
              class="text-white font-weight-bold"
              rounded="pill"
              type="submit"
              :loading="submittingQuote"
            >
              Envoyer la Cotation
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAgencyStore } from '@/stores/agency'

const agencyStore = useAgencyStore()

const loading = ref(false)
const activeTab = ref('all')
const actionSuccess = ref('')
const actionError = ref('')

const quoteDialog = ref(false)
const selectedEnquiry = ref(null)
const submittingQuote = ref(false)

const quoteForm = ref({
  quotedPriceDZD: null,
  validUntil: '',
  itinerarySummary: '',
  inclusionsRaw: '',
  exclusionsRaw: '',
  cancellationPolicy: ''
})

const enquiries = computed(() => agencyStore.getEnquiries)

const loadEnquiries = async () => {
  loading.value = true
  try {
    const statusParam = activeTab.value === 'all' ? null : activeTab.value
    await agencyStore.fetchEnquiries(statusParam)
  } catch (err) {
    actionError.value = 'Impossible de charger les demandes de devis.'
  } finally {
    loading.value = false
  }
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

const formatStatus = (st) => {
  const map = {
    requested: 'En attente de devis',
    quoted: 'Devis envoyé',
    accepted: 'Acceptée',
    declined: 'Refusée',
    expired: 'Expirée'
  }
  return map[st] || st
}

const getStatusColor = (st) => {
  const map = {
    requested: '#B06000',
    quoted: '#1565C0',
    accepted: '#21866B',
    declined: '#C62828',
    expired: '#757575'
  }
  return map[st] || 'grey'
}

const openQuoteModal = (e) => {
  selectedEnquiry.value = e
  const defaultExpiry = new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]

  quoteForm.value = {
    quotedPriceDZD: e.quotation?.quotedPriceDZD || e.budgetDZD || '',
    validUntil: e.quotation?.validUntil ? new Date(e.quotation.validUntil).toISOString().split('T')[0] : defaultExpiry,
    itinerarySummary: e.quotation?.itinerarySummary || `Programme sur-mesure pour ${e.destination}`,
    inclusionsRaw: e.quotation?.inclusions?.join(', ') || 'Transport privatisé, Hébergement, Guide touristique agréé',
    exclusionsRaw: e.quotation?.exclusions?.join(', ') || 'Dépenses personnelles, Billets d\'avion',
    cancellationPolicy: e.quotation?.cancellationPolicy || 'Remboursement à 100% jusqu\'à 7 jours avant le départ.'
  }
  quoteDialog.value = true
}

const submitQuotation = async () => {
  if (!selectedEnquiry.value) return
  submittingQuote.value = true
  try {
    const inclusions = quoteForm.value.inclusionsRaw.split(',').map(s => s.trim()).filter(Boolean)
    const exclusions = quoteForm.value.exclusionsRaw.split(',').map(s => s.trim()).filter(Boolean)

    await agencyStore.quoteEnquiry(selectedEnquiry.value._id, {
      quotedPriceDZD: quoteForm.value.quotedPriceDZD,
      validUntil: quoteForm.value.validUntil,
      itinerarySummary: quoteForm.value.itinerarySummary,
      inclusions,
      exclusions,
      cancellationPolicy: quoteForm.value.cancellationPolicy
    })

    quoteDialog.value = false
    actionSuccess.value = `Devis pour ${selectedEnquiry.value.destination} envoyé avec succès.`
    await loadEnquiries()
  } catch (err) {
    actionError.value = err.response?.data?.error || 'Échec de l\'envoi du devis.'
  } finally {
    submittingQuote.value = false
  }
}

onMounted(() => {
  loadEnquiries()
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
