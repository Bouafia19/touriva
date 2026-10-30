<template>
  <div class="agency-departures pa-4 pa-md-8">
    <v-container class="max-w-container pa-0">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-space-between align-start align-md-center mb-6">
        <div>
          <div class="editorial-tag text-emerald mb-1">GESTION DES DATES & CAPACITÉS</div>
          <h1 class="text-h4 font-serif font-weight-bold text-forest mb-1">
            Départs Programmés
          </h1>
          <p class="text-secondary-editorial text-body-2 mb-0">
            Planifiez vos sessions de voyage, ajustez vos disponibilités en sièges et gérez les annulations éventuelles.
          </p>
        </div>

        <div class="mt-4 mt-md-0 d-flex ga-2">
          <v-btn
            color="#173F35"
            class="btn-editorial-primary font-weight-bold"
            rounded="pill"
            @click="openCreateModal"
          >
            <v-icon start>mdi-calendar-plus</v-icon>
            Planifier un Départ
          </v-btn>
        </div>
      </div>

      <!-- Filters Toolbar -->
      <v-card class="editorial-card pa-4 mb-6" elevation="0">
        <v-row align="center">
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="filterTrip"
              :items="tripFilterOptions"
              item-title="name"
              item-value="_id"
              label="Filtrer par circuit / package"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              color="#173F35"
              hide-details
              clearable
              @update:model-value="fetchFilteredDepartures"
            />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="filterStatus"
              :items="statusOptions"
              label="Statut du départ"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              color="#173F35"
              hide-details
              clearable
              @update:model-value="fetchFilteredDepartures"
            />
          </v-col>
          <v-col cols="12" md="4" class="text-right">
            <v-btn
              variant="text"
              size="small"
              color="#173F35"
              @click="resetFilters"
            >
              <v-icon start size="16">mdi-refresh</v-icon>
              Réinitialiser
            </v-btn>
          </v-col>
        </v-row>
      </v-card>

      <!-- Loading State -->
      <div v-if="agencyStore.loading && !agencyStore.departures.length" class="py-16 text-center">
        <v-progress-circular indeterminate color="#21866B" size="48" />
        <p class="text-secondary-editorial text-caption mt-4">Chargement des sessions de départs...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!agencyStore.departures.length" class="editorial-card pa-12 text-center">
        <v-avatar color="#FAF8F2" size="72" class="mb-4">
          <v-icon size="36" color="#B89564">mdi-calendar-clock</v-icon>
        </v-avatar>
        <h3 class="text-h6 font-serif font-weight-bold text-forest mb-2">
          Aucun départ planifié
        </h3>
        <p class="text-secondary-editorial text-body-2 mb-6 max-w-md mx-auto">
          Définissez les dates de départ de vos circuits pour permettre aux voyageurs de réserver leurs places en ligne.
        </p>
        <v-btn
          color="#173F35"
          rounded="pill"
          class="btn-editorial-primary font-weight-bold"
          @click="openCreateModal"
        >
          <v-icon start>mdi-calendar-plus</v-icon>
          Programmer mon premier départ
        </v-btn>
      </div>

      <!-- Departures List -->
      <div v-else>
        <v-card
          v-for="dep in agencyStore.departures"
          :key="dep._id"
          class="editorial-card departure-item-card pa-5 mb-4"
          elevation="0"
        >
          <div class="d-flex flex-column flex-md-row justify-space-between align-start align-md-center ga-4">
            <!-- Left: Trip name & Dates -->
            <div class="d-flex align-center ga-4">
              <v-avatar rounded="lg" size="56" color="#FAF8F2" class="d-none d-sm-flex">
                <v-img v-if="dep.trip?.image" :src="dep.trip.image" cover />
                <v-icon v-else color="#173F35">mdi-image-outline</v-icon>
              </v-avatar>

              <div>
                <div class="d-flex align-center ga-2 mb-1">
                  <v-chip
                    size="x-small"
                    :color="statusColor(dep.status)"
                    variant="flat"
                    class="text-white font-weight-bold"
                  >
                    {{ statusLabel(dep.status) }}
                  </v-chip>
                  <span class="text-caption text-secondary-editorial">
                    {{ dep.trip?.destination?.name || 'Algérie' }}
                  </span>
                </div>

                <h3 class="text-h6 font-serif font-weight-bold text-forest mb-1">
                  {{ dep.trip?.name || 'Circuit d\'excursion' }}
                </h3>

                <div class="d-flex flex-wrap align-center ga-3 text-caption text-secondary-editorial">
                  <span class="font-weight-medium text-forest">
                    <v-icon size="14" color="#21866B" class="mr-1">mdi-airplane-takeoff</v-icon>
                    {{ formatDateTime(dep.startDate) }}
                  </span>
                  <span>→</span>
                  <span class="font-weight-medium text-forest">
                    <v-icon size="14" color="#B89564" class="mr-1">mdi-airplane-landing</v-icon>
                    {{ formatDateTime(dep.endDate) }}
                  </span>
                  <span v-if="dep.meetingPoint" class="d-none d-md-inline">
                    • Rdv : {{ dep.meetingPoint }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Middle: Capacity & Availability Progress -->
            <div class="capacity-block min-w-180">
              <div class="d-flex justify-space-between align-center text-caption mb-1">
                <span class="text-secondary-editorial">Places réservées :</span>
                <span class="font-weight-bold text-forest">
                  {{ dep.bookedSeats || 0 }} / {{ dep.capacity }}
                </span>
              </div>

              <v-progress-linear
                :model-value="((dep.bookedSeats || 0) / dep.capacity) * 100"
                :color="progressColor(dep)"
                height="6"
                rounded
                class="mb-1"
              />

              <div class="d-flex justify-space-between align-center text-caption">
                <span :class="dep.availableSeats > 0 ? 'text-emerald' : 'text-error'" class="font-weight-bold">
                  {{ dep.availableSeats }} disponibles
                </span>
                <span class="text-secondary-editorial">Min: {{ dep.minGroupSize || 1 }}</span>
              </div>
            </div>

            <!-- Right: Price & Actions -->
            <div class="d-flex align-center justify-space-between w-100 w-md-auto ga-4 pt-2 pt-md-0 border-t-mobile">
              <div class="text-md-right">
                <div class="text-caption text-secondary-editorial">Tarif par personne</div>
                <div class="text-h6 font-weight-bold text-forest">
                  {{ formatPrice(dep.priceDZD) }} <span class="text-caption font-weight-regular">DZD</span>
                </div>
              </div>

              <div class="d-flex ga-1">
                <v-btn
                  icon="mdi-clipboard-text-outline"
                  size="small"
                  variant="tonal"
                  color="#21866B"
                  title="Manifeste officiel des passagers"
                  @click="openManifestModal(dep)"
                />

                <v-btn
                  icon="mdi-pencil-outline"
                  size="small"
                  variant="tonal"
                  color="#173F35"
                  @click="openEditModal(dep)"
                />

                <v-btn
                  v-if="dep.status !== 'cancelled'"
                  icon="mdi-cancel"
                  size="small"
                  variant="tonal"
                  color="#C24545"
                  title="Annuler ce départ"
                  @click="openCancelModal(dep)"
                />

                <v-btn
                  v-if="!dep.bookedSeats"
                  icon="mdi-delete-outline"
                  size="small"
                  variant="text"
                  color="error"
                  title="Supprimer"
                  @click="confirmDelete(dep)"
                />
              </div>
            </div>
          </div>

          <!-- Cancellation note banner if cancelled -->
          <v-alert
            v-if="dep.status === 'cancelled'"
            type="error"
            variant="tonal"
            density="compact"
            class="mt-3 text-caption rounded-lg"
          >
            <strong>Départ annulé :</strong> {{ dep.cancellationReason || 'Aucun motif renseigné' }}
          </v-alert>
        </v-card>
      </div>
    </v-container>

    <!-- Modal: Planifier / Modifier Départ -->
    <v-dialog v-model="departureModal" max-width="580" persistent>
      <v-card class="editorial-card pa-6">
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <div class="editorial-tag text-emerald mb-1">
              {{ editingDeparture ? 'MODIFICATION DU DÉPART' : 'NOUVELLE DATE DE DÉPART' }}
            </div>
            <h3 class="text-h6 font-serif font-weight-bold text-forest">
              {{ editingDeparture ? 'Mettre à jour la session' : 'Programmer une session de voyage' }}
            </h3>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="departureModal = false" />
        </div>

        <v-form ref="departureFormRef" @submit.prevent="submitDeparture">
          <!-- Package Selector -->
          <div class="mb-4">
            <label class="font-weight-bold text-forest text-caption mb-1 d-block">
              CIRCUIT / PACKAGE CONCERNÉ *
            </label>
            <v-select
              v-model="depForm.trip"
              :items="agencyStore.packages"
              item-title="name"
              item-value="_id"
              placeholder="Sélectionnez le circuit"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              color="#173F35"
              :disabled="!!editingDeparture"
              :rules="[v => !!v || 'Le package est obligatoire']"
              hide-details="auto"
            />
          </div>

          <!-- Dates Row -->
          <v-row class="mb-2">
            <v-col cols="12" sm="6">
              <label class="font-weight-bold text-forest text-caption mb-1 d-block">
                DATE & HEURE DE DÉPART *
              </label>
              <v-text-field
                v-model="depForm.startDate"
                type="datetime-local"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                color="#173F35"
                :rules="[v => !!v || 'Date de départ obligatoire']"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <label class="font-weight-bold text-forest text-caption mb-1 d-block">
                DATE & HEURE DE RETOUR *
              </label>
              <v-text-field
                v-model="depForm.endDate"
                type="datetime-local"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                color="#173F35"
                :rules="[v => !!v || 'Date de retour obligatoire', validateDateOrder]"
                hide-details="auto"
              />
            </v-col>
          </v-row>

          <!-- Price & Capacity Row -->
          <v-row class="mb-2">
            <v-col cols="12" sm="6">
              <label class="font-weight-bold text-forest text-caption mb-1 d-block">
                TARIF EN DZD (PAR PERSONNE) *
              </label>
              <v-text-field
                v-model.number="depForm.priceDZD"
                type="number"
                min="0"
                step="500"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                color="#173F35"
                suffix="DZD"
                :rules="[v => (v !== '' && Number(v) >= 0) || 'Tarif non négatif obligatoire']"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <label class="font-weight-bold text-forest text-caption mb-1 d-block">
                CAPACITÉ TOTALE (SIÈGES) *
              </label>
              <v-text-field
                v-model.number="depForm.capacity"
                type="number"
                min="1"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                color="#173F35"
                :rules="[v => (Number(v) >= 1) || 'Minimum 1 place', validateMinCapacity]"
                hide-details="auto"
              />
            </v-col>
          </v-row>

          <!-- Min Group & Meeting Point -->
          <v-row class="mb-4">
            <v-col cols="12" sm="5">
              <label class="font-weight-bold text-forest text-caption mb-1 d-block">
                GROUPE MINIMUM (CONFIRMATION)
              </label>
              <v-text-field
                v-model.number="depForm.minGroupSize"
                type="number"
                min="1"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                color="#173F35"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="7">
              <label class="font-weight-bold text-forest text-caption mb-1 d-block">
                POINT DE DÉPART & RENDEZ-VOUS
              </label>
              <v-text-field
                v-model="depForm.meetingPoint"
                placeholder="Ex: Agence Alger Centre ou Aéroport"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                color="#173F35"
                hide-details="auto"
              />
            </v-col>
          </v-row>

          <!-- Instructions -->
          <div class="mb-6">
            <label class="font-weight-bold text-forest text-caption mb-1 d-block">
              CONSIGNES & INSTRUCTIONS DE DÉPART
            </label>
            <v-textarea
              v-model="depForm.departureInstructions"
              rows="2"
              placeholder="Ex: Présentation 45 min avant le départ munis de pièces d'identité et bagages compacts."
              variant="outlined"
              density="comfortable"
              rounded="lg"
              color="#173F35"
              hide-details
            />
          </div>

          <div class="d-flex ga-3 justify-end">
            <v-btn variant="outlined" rounded="pill" @click="departureModal = false">
              Annuler
            </v-btn>
            <v-btn
              color="#173F35"
              class="btn-editorial-primary font-weight-bold"
              rounded="pill"
              type="submit"
              :loading="modalLoading"
            >
              {{ editingDeparture ? 'Mettre à jour' : 'Confirmer le départ' }}
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- Modal: Annuler un Départ -->
    <v-dialog v-model="cancelModal" max-width="500" persistent>
      <v-card class="editorial-card pa-6">
        <h3 class="text-h6 font-serif font-weight-bold text-forest mb-2">
          Annuler cette session de voyage ?
        </h3>
        <p class="text-body-2 text-secondary-editorial mb-4">
          Cette action marquera le départ comme <strong>Annulé</strong>. Veuillez fournir un motif clair pour les voyageurs inscrits.
        </p>

        <v-form @submit.prevent="executeCancel">
          <label class="font-weight-bold text-forest text-caption mb-1 d-block">
            MOTIF DE L'ANNULATION *
          </label>
          <v-textarea
            v-model="cancellationReasonInput"
            rows="3"
            placeholder="Ex: Conditions météorologiques défavorables dans le Tassili ou nombre minimal de participants non atteint."
            variant="outlined"
            density="comfortable"
            rounded="lg"
            color="#C24545"
            class="mb-6"
            :rules="[v => (v && v.trim().length >= 5) || 'Minimum 5 caractères requis']"
          />

          <div class="d-flex ga-3 justify-end">
            <v-btn variant="outlined" rounded="pill" @click="cancelModal = false">
              Fermer
            </v-btn>
            <v-btn
              color="#C24545"
              rounded="pill"
              class="text-white font-weight-bold"
              type="submit"
              :loading="modalLoading"
            >
              Confirmer l'annulation
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- Modal: Supprimer Départ -->
    <v-dialog v-model="deleteModal" max-width="450">
      <v-card class="editorial-card pa-6">
        <h3 class="text-h6 font-serif font-weight-bold text-forest mb-2">
          Supprimer ce départ ?
        </h3>
        <p class="text-body-2 text-secondary-editorial mb-6">
          Voulez-vous supprimer définitivement ce créneau de départ ? Cette opération n'est possible que si aucune réservation n'y est rattachée.
        </p>
        <div class="d-flex ga-3 justify-end">
          <v-btn variant="outlined" rounded="pill" @click="deleteModal = false">Annuler</v-btn>
          <v-btn color="error" rounded="pill" :loading="modalLoading" @click="executeDelete">
            Supprimer
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Modal: Manifeste Passagers -->
    <v-dialog v-model="manifestModal" max-width="720" scrollable>
      <v-card v-if="currentManifest" class="editorial-card pa-6">
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <div class="text-caption text-sand-dark font-weight-bold">MANIFESTE OFFICIEL</div>
            <h3 class="text-h6 font-serif font-weight-bold text-forest">
              {{ currentManifest.manifestReference }}
            </h3>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="manifestModal = false" />
        </div>

        <v-divider class="mb-4 border-subtle" />

        <div class="d-flex justify-space-between align-center mb-3">
          <div>
            <div class="font-weight-bold text-forest">{{ currentManifest.excursion?.title }}</div>
            <div class="text-caption text-secondary-editorial">
              {{ currentManifest.session?.totalPassengers }} passagers enregistrés sur {{ currentManifest.session?.capacity }} places
            </div>
          </div>
          <v-btn
            color="#102D27"
            size="small"
            rounded="pill"
            class="text-white font-weight-bold"
            :loading="printLoading"
            @click="printManifest(currentManifestDepartureId)"
          >
            <v-icon start size="16">mdi-printer</v-icon>
            Version Imprimable
          </v-btn>
        </div>

        <v-table density="compact" class="border rounded-lg mb-4">
          <thead>
            <tr class="bg-sand-light">
              <th style="width: 30px;">N°</th>
              <th>Nom & Prénom</th>
              <th>Catégorie</th>
              <th>Téléphone</th>
              <th>Réf. Billet</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!currentManifest.passengers?.length">
              <td colspan="6" class="text-center py-4 text-grey">
                Aucun passager enregistré pour ce départ.
              </td>
            </tr>
            <tr v-else v-for="p in currentManifest.passengers" :key="p.order">
              <td class="font-weight-bold text-center">{{ p.order }}</td>
              <td><strong>{{ p.fullName }}</strong></td>
              <td class="text-capitalize">{{ p.ageCategory === 'child' ? 'Enfant' : 'Adulte' }}</td>
              <td>{{ p.contactPhone || '—' }}</td>
              <td class="font-monospace text-caption">{{ p.bookingReference }}</td>
              <td>
                <v-chip size="x-small" :color="p.bookingStatus === 'confirmed' ? 'success' : 'warning'">
                  {{ p.bookingStatus === 'confirmed' ? 'Confirmé' : 'En attente' }}
                </v-chip>
              </td>
            </tr>
          </tbody>
        </v-table>

        <div class="text-caption text-grey text-center">
          Conforme à la réglementation relative au transport des voyageurs en Algérie.
        </div>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="4000">
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAgencyStore } from '@/stores/agency'

const route = useRoute()
const agencyStore = useAgencyStore()

const filterTrip = ref(null)
const filterStatus = ref(null)

const departureModal = ref(false)
const editingDeparture = ref(null)
const departureFormRef = ref(null)
const modalLoading = ref(false)

const cancelModal = ref(false)
const departureToCancel = ref(null)
const cancellationReasonInput = ref('')

const deleteModal = ref(false)
const departureToDelete = ref(null)

const manifestModal = ref(false)
const currentManifest = ref(null)
const currentManifestDepartureId = ref(null)

const openManifestModal = async (dep) => {
  currentManifestDepartureId.value = dep._id
  try {
    const data = await agencyStore.fetchManifest(dep._id)
    currentManifest.value = data
    manifestModal.value = true
  } catch (err) {
    notify('Impossible de charger le manifeste des passagers.', 'error')
  }
}

const printLoading = ref(false)

const printManifest = async (depId) => {
  if (!depId) return
  printLoading.value = true
  try {
    const html = await agencyStore.fetchManifestHtml(depId)
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const blobUrl = URL.createObjectURL(blob)
    const printWindow = window.open(blobUrl, '_blank')
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000)
      }
    } else {
      const a = document.createElement('a')
      a.href = blobUrl
      a.target = '_blank'
      a.click()
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000)
    }
  } catch (err) {
    notify('Impossible de générer le manifeste officiel pour impression.', 'error')
  } finally {
    printLoading.value = false
  }
}

const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const notify = (msg, col = 'success') => {
  snackbarText.value = msg
  snackbarColor.value = col
  snackbar.value = true
}

const tripFilterOptions = computed(() => {
  return (agencyStore.packages || []).map(p => ({
    name: p.name,
    _id: p._id
  }))
})

const statusOptions = [
  { title: 'Confirmé / Programmé', value: 'scheduled' },
  { title: 'Départ Garanti', value: 'guaranteed' },
  { title: 'Annulé', value: 'cancelled' },
  { title: 'Terminé', value: 'completed' }
]

const depForm = reactive({
  trip: null,
  startDate: '',
  endDate: '',
  priceDZD: 45000,
  capacity: 15,
  minGroupSize: 4,
  meetingPoint: '',
  departureInstructions: ''
})

const formatDateTime = (dt) => {
  if (!dt) return ''
  return new Date(dt).toLocaleDateString('fr-DZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPrice = (p) => {
  return Number(p || 0).toLocaleString('fr-DZ')
}

const statusColor = (st) => {
  switch (st) {
    case 'scheduled': return '#21866B'
    case 'guaranteed': return '#173F35'
    case 'cancelled': return '#C24545'
    case 'completed': return '#757575'
    default: return '#173F35'
  }
}

const statusLabel = (st) => {
  switch (st) {
    case 'scheduled': return 'Programmé'
    case 'guaranteed': return 'Garanti'
    case 'cancelled': return 'Annulé'
    case 'completed': return 'Terminé'
    default: return st
  }
}

const progressColor = (dep) => {
  const ratio = (dep.bookedSeats || 0) / (dep.capacity || 1)
  if (ratio >= 0.9) return '#C24545'
  if (ratio >= 0.5) return '#D9943B'
  return '#21866B'
}

const validateDateOrder = () => {
  if (!depForm.startDate || !depForm.endDate) return true
  return new Date(depForm.endDate) >= new Date(depForm.startDate) || 'La date de retour doit être postérieure à la date de départ'
}

const validateMinCapacity = (v) => {
  if (!editingDeparture.value) return true
  const minRequired = editingDeparture.value.bookedSeats || 0
  return Number(v) >= minRequired || `La capacité ne peut pas être inférieure aux ${minRequired} places déjà réservées`
}

const formatForInput = (d) => {
  if (!d) return ''
  const date = new Date(d)
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

const openCreateModal = () => {
  editingDeparture.value = null
  depForm.trip = filterTrip.value || agencyStore.packages[0]?._id || null
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 3600000)
  const threeDaysLater = new Date(now.getTime() + 4 * 24 * 3600000)
  depForm.startDate = formatForInput(tomorrow)
  depForm.endDate = formatForInput(threeDaysLater)
  depForm.priceDZD = 45000
  depForm.capacity = 15
  depForm.minGroupSize = 4
  depForm.meetingPoint = ''
  depForm.departureInstructions = ''
  departureModal.value = true
}

const openEditModal = (dep) => {
  editingDeparture.value = dep
  depForm.trip = dep.trip?._id || dep.trip
  depForm.startDate = formatForInput(dep.startDate)
  depForm.endDate = formatForInput(dep.endDate)
  depForm.priceDZD = dep.priceDZD
  depForm.capacity = dep.capacity
  depForm.minGroupSize = dep.minGroupSize || 1
  depForm.meetingPoint = dep.meetingPoint || ''
  depForm.departureInstructions = dep.departureInstructions || ''
  departureModal.value = true
}

const submitDeparture = async () => {
  const { valid } = await departureFormRef.value.validate()
  if (!valid) return

  modalLoading.value = true
  try {
    const payload = {
      trip: depForm.trip,
      startDate: new Date(depForm.startDate).toISOString(),
      endDate: new Date(depForm.endDate).toISOString(),
      priceDZD: depForm.priceDZD,
      capacity: depForm.capacity,
      minGroupSize: depForm.minGroupSize,
      meetingPoint: depForm.meetingPoint,
      departureInstructions: depForm.departureInstructions
    }

    if (editingDeparture.value) {
      await agencyStore.updateDeparture(editingDeparture.value._id, payload)
      notify('Session de départ mise à jour avec succès')
    } else {
      await agencyStore.createDeparture(payload)
      notify('Nouvelle session de départ programmée avec succès')
    }
    departureModal.value = false
    await fetchFilteredDepartures()
  } catch (err) {
    notify(err.response?.data?.error || err.message || 'Erreur lors de l\'enregistrement', 'error')
  } finally {
    modalLoading.value = false
  }
}

const openCancelModal = (dep) => {
  departureToCancel.value = dep
  cancellationReasonInput.value = ''
  cancelModal.value = true
}

const executeCancel = async () => {
  if (!departureToCancel.value) return
  if (!cancellationReasonInput.value || cancellationReasonInput.value.trim().length < 5) {
    notify('Veuillez fournir un motif d\'annulation d\'au moins 5 caractères', 'error')
    return
  }

  modalLoading.value = true
  try {
    await agencyStore.cancelDeparture(departureToCancel.value._id, cancellationReasonInput.value.trim())
    notify('Départ annulé avec succès')
    cancelModal.value = false
    await fetchFilteredDepartures()
  } catch (err) {
    notify(err.response?.data?.error || 'Erreur lors de l\'annulation', 'error')
  } finally {
    modalLoading.value = false
  }
}

const confirmDelete = (dep) => {
  departureToDelete.value = dep
  deleteModal.value = true
}

const executeDelete = async () => {
  if (!departureToDelete.value) return
  modalLoading.value = true
  try {
    await agencyStore.deleteDeparture(departureToDelete.value._id)
    notify('Départ supprimé avec succès')
    deleteModal.value = false
    await fetchFilteredDepartures()
  } catch (err) {
    notify(err.response?.data?.error || 'Impossible de supprimer ce départ', 'error')
  } finally {
    modalLoading.value = false
  }
}

const fetchFilteredDepartures = async () => {
  try {
    await agencyStore.fetchDepartures({
      trip: filterTrip.value,
      status: filterStatus.value
    })
  } catch (e) {
    console.error('Error fetching departures:', e)
  }
}

const resetFilters = async () => {
  filterTrip.value = null
  filterStatus.value = null
  await fetchFilteredDepartures()
}

onMounted(async () => {
  try {
    if (route.query.trip) {
      filterTrip.value = route.query.trip
    }
    await Promise.all([
      agencyStore.fetchProfile(),
      agencyStore.fetchPackages(),
      fetchFilteredDepartures()
    ])
  } catch (e) {
    console.error('Error mounting departures:', e)
  }
})
</script>

<style scoped>
.editorial-card {
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(23, 63, 53, 0.08);
}
.departure-item-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.departure-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(23, 63, 53, 0.06) !important;
}
.min-w-180 {
  min-width: 180px;
}
@media (max-width: 959px) {
  .border-t-mobile {
    border-top: 1px solid rgba(23, 63, 53, 0.08);
  }
}
</style>
