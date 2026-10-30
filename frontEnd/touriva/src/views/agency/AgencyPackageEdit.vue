<template>
  <div class="agency-package-edit pa-4 pa-md-8">
    <v-container class="max-w-container pa-0">
      <!-- Top Return Bar -->
      <div class="mb-4">
        <v-btn
          variant="text"
          color="#173F35"
          size="small"
          rounded="pill"
          to="/agency/packages"
          class="font-weight-medium"
        >
          <v-icon start size="18">mdi-arrow-left</v-icon>
          Retour aux packages
        </v-btn>
      </div>

      <!-- Header Title -->
      <div class="d-flex flex-column flex-md-row justify-space-between align-start align-md-center mb-6">
        <div>
          <div class="editorial-tag text-emerald mb-1">
            {{ isEditing ? 'MODIFICATION DU CIRCUIT' : 'CRÉATION DE CIRCUIT' }}
          </div>
          <h1 class="text-h4 font-serif font-weight-bold text-forest mb-1">
            {{ isEditing ? form.name || 'Modifier le Package' : 'Nouveau Circuit d\'Excursion' }}
          </h1>
          <p class="text-secondary-editorial text-body-2 mb-0">
            Renseignez l'itinéraire, les prestations incluses et les conditions pour les voyageurs.
          </p>
        </div>

        <div class="mt-4 mt-md-0 d-flex ga-2">
          <v-btn
            variant="outlined"
            color="#173F35"
            rounded="pill"
            :loading="saving"
            @click="savePackage('created')"
          >
            Enregistrer en Brouillon
          </v-btn>

          <v-btn
            color="#173F35"
            class="btn-editorial-primary font-weight-bold"
            rounded="pill"
            :loading="saving"
            @click="savePackage('published')"
          >
            <v-icon start>mdi-publish</v-icon>
            Publier au Catalogue
          </v-btn>
        </div>
      </div>

      <!-- Verification Warning if trying to publish unverified -->
      <v-alert
        v-if="!agencyStore.isVerified"
        type="info"
        variant="tonal"
        density="comfortable"
        class="mb-6 rounded-lg text-body-2"
        icon="mdi-shield-alert-outline"
      >
        <strong>Note relative à l'agrément :</strong> Votre agence est en cours de vérification. Vous pouvez configurer votre circuit et l'enregistrer en brouillon. La publication publique s'activera dès validation de vos pièces officielles par l'administration.
      </v-alert>

      <!-- Main Form Row -->
      <v-form ref="formRef" @submit.prevent="savePackage('published')">
        <v-row>
          <!-- LEFT COLUMN: GENERAL INFO & PRICING -->
          <v-col cols="12" md="7">
            <!-- Basic Information Card -->
            <v-card class="editorial-card pa-6 mb-6" elevation="0">
              <h2 class="text-h6 font-serif font-weight-bold text-forest mb-4">
                Informations Principales
              </h2>

              <!-- Title -->
              <div class="mb-4">
                <label class="font-weight-bold text-forest text-caption mb-1 d-block">
                  TITRE DU CIRCUIT *
                </label>
                <v-text-field
                  v-model="form.name"
                  placeholder="Ex: Expédition Tassili & Djanet : Entre Oasis et Gravures Millénaires"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  color="#173F35"
                  :rules="[v => !!v || 'Le nom du circuit est obligatoire']"
                  hide-details="auto"
                />
              </div>

              <!-- Wilaya & Theme -->
              <v-row class="mb-2">
                <v-col cols="12" sm="6">
                  <label class="font-weight-bold text-forest text-caption mb-1 d-block">
                    DESTINATION (WILAYA) *
                  </label>
                  <v-select
                    v-model="form.destination"
                    :items="wilayasStore.getWilayas"
                    item-title="name"
                    item-value="_id"
                    placeholder="Sélectionnez la wilaya"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="#173F35"
                    :rules="[v => !!v || 'La wilaya de destination est obligatoire']"
                    hide-details="auto"
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <label class="font-weight-bold text-forest text-caption mb-1 d-block">
                    THÉMATIQUE
                  </label>
                  <v-select
                    v-model="form.theme"
                    :items="themeOptions"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="#173F35"
                    hide-details="auto"
                  />
                </v-col>
              </v-row>

              <!-- Deposit Configuration -->
              <div class="pa-4 rounded-lg bg-warm-ivory border-editorial mb-4">
                <div class="d-flex justify-space-between align-center mb-3">
                  <div>
                    <span class="font-weight-bold text-forest text-body-2">Exiger un acompte à la réservation</span>
                    <div class="text-caption text-secondary-editorial">
                      Sécurisez vos réservations par le versement d'un acompte avant le départ.
                    </div>
                  </div>
                  <v-switch
                    v-model="form.requiresDeposit"
                    color="#21866B"
                    hide-details
                    density="compact"
                  />
                </div>

                <v-expand-transition>
                  <div v-if="form.requiresDeposit">
                    <v-row class="mb-2">
                      <v-col cols="12" sm="6">
                        <label class="font-weight-bold text-forest text-caption mb-1 d-block">
                          TYPE D'ACOMPTE
                        </label>
                        <v-select
                          v-model="form.depositType"
                          :items="[
                            { title: 'Pourcentage (%) du montant total', value: 'percentage' },
                            { title: 'Montant fixe par place (DZD)', value: 'fixed' }
                          ]"
                          variant="outlined"
                          density="comfortable"
                          rounded="lg"
                          hide-details
                        />
                      </v-col>

                      <v-col cols="12" sm="6" v-if="form.depositType === 'percentage'">
                        <label class="font-weight-bold text-forest text-caption mb-1 d-block">
                          POURCENTAGE DE L'ACOMPTE (%)
                        </label>
                        <v-text-field
                          v-model.number="form.depositPercentage"
                          type="number"
                          min="1"
                          max="100"
                          suffix="%"
                          variant="outlined"
                          density="comfortable"
                          rounded="lg"
                          hide-details
                        />
                      </v-col>

                      <v-col cols="12" sm="6" v-else>
                        <label class="font-weight-bold text-forest text-caption mb-1 d-block">
                          MONTANT DE L'ACOMPTE (DZD)
                        </label>
                        <v-text-field
                          v-model.number="form.depositAmountDZD"
                          type="number"
                          min="1"
                          suffix="DZD"
                          variant="outlined"
                          density="comfortable"
                          rounded="lg"
                          hide-details
                        />
                      </v-col>
                    </v-row>

                    <v-row>
                      <v-col cols="12" sm="6">
                        <label class="font-weight-bold text-forest text-caption mb-1 d-block">
                          DÉLAI DE PAIEMENT DU SOLDE AVANT DÉPART (JOURS)
                        </label>
                        <v-text-field
                          v-model.number="form.paymentDueDaysBeforeDeparture"
                          type="number"
                          min="0"
                          suffix="Jours"
                          variant="outlined"
                          density="comfortable"
                          rounded="lg"
                          hide-details
                        />
                      </v-col>
                    </v-row>
                  </div>
                </v-expand-transition>
              </div>

              <!-- Duration & Base Price -->
              <v-row class="mb-4">
                <v-col cols="12" sm="6">
                  <label class="font-weight-bold text-forest text-caption mb-1 d-block">
                    DURÉE (JOURS) *
                  </label>
                  <v-text-field
                    v-model.number="form.durationDays"
                    type="number"
                    min="1"
                    max="30"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="#173F35"
                    hide-details="auto"
                    @update:model-value="onDurationChange"
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <label class="font-weight-bold text-forest text-caption mb-1 d-block">
                    PRIX DE BASE INDICATIF (DZD) *
                  </label>
                  <v-text-field
                    v-model.number="form.price"
                    type="number"
                    min="0"
                    step="500"
                    placeholder="Ex: 45000"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="#173F35"
                    suffix="DZD"
                    :rules="[v => (v !== '' && Number(v) >= 0) || 'Prix non négatif obligatoire']"
                    hide-details="auto"
                  />
                </v-col>
              </v-row>

              <!-- Deposit Configuration -->
              <div class="pa-4 rounded-lg bg-warm-ivory border-editorial mb-4">
                <div class="d-flex justify-space-between align-center mb-3">
                  <div>
                    <span class="font-weight-bold text-forest text-body-2">Exiger un acompte à la réservation</span>
                    <div class="text-caption text-secondary-editorial">
                      Sécurisez vos réservations par le versement d'un acompte avant le départ.
                    </div>
                  </div>
                  <v-switch
                    v-model="form.requiresDeposit"
                    color="#21866B"
                    hide-details
                    density="compact"
                  />
                </div>

                <v-expand-transition>
                  <div v-if="form.requiresDeposit">
                    <v-row class="mb-2">
                      <v-col cols="12" sm="6">
                        <label class="font-weight-bold text-forest text-caption mb-1 d-block">
                          TYPE D'ACOMPTE
                        </label>
                        <v-select
                          v-model="form.depositType"
                          :items="[
                            { title: 'Pourcentage (%) du montant total', value: 'percentage' },
                            { title: 'Montant fixe par place (DZD)', value: 'fixed' }
                          ]"
                          variant="outlined"
                          density="comfortable"
                          rounded="lg"
                          hide-details
                        />
                      </v-col>

                      <v-col cols="12" sm="6" v-if="form.depositType === 'percentage'">
                        <label class="font-weight-bold text-forest text-caption mb-1 d-block">
                          POURCENTAGE DE L'ACOMPTE (%)
                        </label>
                        <v-text-field
                          v-model.number="form.depositPercentage"
                          type="number"
                          min="1"
                          max="100"
                          suffix="%"
                          variant="outlined"
                          density="comfortable"
                          rounded="lg"
                          hide-details
                        />
                      </v-col>

                      <v-col cols="12" sm="6" v-else>
                        <label class="font-weight-bold text-forest text-caption mb-1 d-block">
                          MONTANT DE L'ACOMPTE (DZD)
                        </label>
                        <v-text-field
                          v-model.number="form.depositAmountDZD"
                          type="number"
                          min="1"
                          suffix="DZD"
                          variant="outlined"
                          density="comfortable"
                          rounded="lg"
                          hide-details
                        />
                      </v-col>
                    </v-row>

                    <v-row>
                      <v-col cols="12" sm="6">
                        <label class="font-weight-bold text-forest text-caption mb-1 d-block">
                          DÉLAI DE PAIEMENT DU SOLDE AVANT DÉPART (JOURS)
                        </label>
                        <v-text-field
                          v-model.number="form.paymentDueDaysBeforeDeparture"
                          type="number"
                          min="0"
                          suffix="Jours"
                          variant="outlined"
                          density="comfortable"
                          rounded="lg"
                          hide-details
                        />
                      </v-col>
                    </v-row>
                  </div>
                </v-expand-transition>
              </div>

              <!-- Description -->
              <div class="mb-4">
                <label class="font-weight-bold text-forest text-caption mb-1 d-block">
                  DESCRIPTION ÉDITORIALE DU VOYAGE
                </label>
                <v-textarea
                  v-model="form.description"
                  rows="4"
                  placeholder="Décrivez les temps forts, l'ambiance, les paysages traversés et les spécificités de cette excursion..."
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  color="#173F35"
                  hide-details
                />
              </div>

              <!-- Meeting Point -->
              <div class="mb-2">
                <label class="font-weight-bold text-forest text-caption mb-1 d-block">
                  POINT DE RASSEMBLEMENT & DÉPART
                </label>
                <v-text-field
                  v-model="form.meetingPoint"
                  placeholder="Ex: Aéroport d'Alger (Terminal 1) ou Siège de l'Agence, Djanet"
                  prepend-inner-icon="mdi-map-marker-radius"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  color="#173F35"
                  hide-details
                />
              </div>
            </v-card>

            <!-- Day-by-Day Itinerary Builder -->
            <v-card class="editorial-card pa-6 mb-6" elevation="0">
              <div class="d-flex justify-space-between align-center mb-4">
                <h2 class="text-h6 font-serif font-weight-bold text-forest ma-0">
                  Itinéraire Jour par Jour ({{ form.items.length }} Jours)
                </h2>
                <v-btn
                  size="small"
                  variant="tonal"
                  color="#21866B"
                  rounded="pill"
                  @click="addDay"
                >
                  <v-icon start size="16">mdi-plus</v-icon>
                  Ajouter un jour
                </v-btn>
              </div>

              <div v-for="(day, dIndex) in form.items" :key="dIndex" class="day-block pa-4 mb-4 rounded-lg bg-warm-ivory border-editorial">
                <div class="d-flex justify-space-between align-center mb-3">
                  <span class="font-weight-bold text-forest text-body-2">
                    <v-icon size="16" color="#21866B" class="mr-1">mdi-calendar-today</v-icon>
                    Jour {{ day.day || (dIndex + 1) }}
                  </span>
                  <v-btn
                    v-if="form.items.length > 1"
                    icon="mdi-trash-can-outline"
                    size="x-small"
                    variant="text"
                    color="error"
                    @click="removeDay(dIndex)"
                  />
                </div>

                <div v-for="(item, iIndex) in day.items" :key="iIndex" class="mb-3">
                  <v-text-field
                    v-model="item.title"
                    placeholder="Titre de l'étape (ex: Arrivée et Bivouac à Tikobaouine)"
                    variant="outlined"
                    density="compact"
                    rounded="lg"
                    class="mb-2"
                    hide-details
                  />
                  <v-textarea
                    v-model="item.description"
                    rows="2"
                    placeholder="Programme et activités de cette étape..."
                    variant="outlined"
                    density="compact"
                    rounded="lg"
                    hide-details
                  />
                </div>
              </div>
            </v-card>
          </v-col>

          <!-- RIGHT COLUMN: INCLUSIONS, POLICIES & MEDIA -->
          <v-col cols="12" md="5">
            <!-- Media & Photos -->
            <v-card class="editorial-card pa-6 mb-6" elevation="0">
              <h2 class="text-h6 font-serif font-weight-bold text-forest mb-4">
                Visuel de Couverture
              </h2>

              <div class="mb-3">
                <v-img
                  v-if="form.image"
                  :src="form.image"
                  height="180"
                  cover
                  class="rounded-lg mb-3 bg-sand-light"
                />
                <v-text-field
                  v-model="form.image"
                  placeholder="URL de la photo de couverture (https://...)"
                  prepend-inner-icon="mdi-camera-outline"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  color="#173F35"
                  hide-details
                />
              </div>

              <!-- Sample Photo Presets -->
              <div class="text-caption text-secondary-editorial mb-2">Suggestions libres de droits :</div>
              <div class="d-flex flex-wrap ga-2">
                <v-chip
                  v-for="(sample, idx) in sampleImages"
                  :key="idx"
                  size="small"
                  variant="outlined"
                  color="#173F35"
                  @click="form.image = sample.url"
                >
                  {{ sample.label }}
                </v-chip>
              </div>
            </v-card>

            <!-- Inclusions & Exclusions -->
            <v-card class="editorial-card pa-6 mb-6" elevation="0">
              <h2 class="text-h6 font-serif font-weight-bold text-forest mb-4">
                Prestations & Services
              </h2>

              <!-- Inclusions -->
              <div class="mb-6">
                <label class="font-weight-bold text-forest text-caption mb-1 d-block">
                  SERVICES INCLUS DANS LE TARIF
                </label>
                <div class="d-flex ga-2 mb-2">
                  <v-text-field
                    v-model="newInclusion"
                    placeholder="Ex: Hébergement en pension complète"
                    variant="outlined"
                    density="compact"
                    rounded="lg"
                    hide-details
                    @keyup.enter="addInclusion"
                  />
                  <v-btn color="#173F35" size="small" rounded="lg" @click="addInclusion">
                    Ajouter
                  </v-btn>
                </div>

                <!-- Common quick tags -->
                <div class="d-flex flex-wrap ga-1 mb-2">
                  <v-chip
                    v-for="sug in suggestedInclusions"
                    :key="sug"
                    size="x-small"
                    variant="tonal"
                    color="#21866B"
                    class="cursor-pointer"
                    @click="addQuickInclusion(sug)"
                  >
                    + {{ sug }}
                  </v-chip>
                </div>

                <div class="d-flex flex-wrap ga-1">
                  <v-chip
                    v-for="(inc, idx) in form.inclusions"
                    :key="idx"
                    size="small"
                    closable
                    color="#21866B"
                    variant="flat"
                    class="text-white"
                    @click:close="form.inclusions.splice(idx, 1)"
                  >
                    {{ inc }}
                  </v-chip>
                </div>
              </div>

              <!-- Exclusions -->
              <div>
                <label class="font-weight-bold text-forest text-caption mb-1 d-block">
                  SERVICES NON INCLUS (À LA CHARGE DU CLIENT)
                </label>
                <div class="d-flex ga-2 mb-2">
                  <v-text-field
                    v-model="newExclusion"
                    placeholder="Ex: Billets d'avion internationaux"
                    variant="outlined"
                    density="compact"
                    rounded="lg"
                    hide-details
                    @keyup.enter="addExclusion"
                  />
                  <v-btn color="#173F35" size="small" rounded="lg" @click="addExclusion">
                    Ajouter
                  </v-btn>
                </div>

                <!-- Common quick tags -->
                <div class="d-flex flex-wrap ga-1 mb-2">
                  <v-chip
                    v-for="sug in suggestedExclusions"
                    :key="sug"
                    size="x-small"
                    variant="tonal"
                    color="#C24545"
                    class="cursor-pointer"
                    @click="addQuickExclusion(sug)"
                  >
                    + {{ sug }}
                  </v-chip>
                </div>

                <div class="d-flex flex-wrap ga-1">
                  <v-chip
                    v-for="(exc, idx) in form.exclusions"
                    :key="idx"
                    size="small"
                    closable
                    color="#C24545"
                    variant="flat"
                    class="text-white"
                    @click:close="form.exclusions.splice(idx, 1)"
                  >
                    {{ exc }}
                  </v-chip>
                </div>
              </div>
            </v-card>

            <!-- Cancellation Policy -->
            <v-card class="editorial-card pa-6 mb-6" elevation="0">
              <h2 class="text-h6 font-serif font-weight-bold text-forest mb-4">
                Conditions d'Annulation
              </h2>
              <v-textarea
                v-model="form.cancellationPolicy"
                rows="3"
                placeholder="Ex: Annulation sans frais jusqu'à 72 heures avant le départ. Passé ce délai, des frais d'annulation de 30% sont retenus."
                variant="outlined"
                density="comfortable"
                rounded="lg"
                color="#173F35"
                hide-details
              />
            </v-card>
          </v-col>
        </v-row>
      </v-form>
    </v-container>

    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="4000">
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAgencyStore } from '@/stores/agency'
import { useWilayasStore } from '@/stores/wilaya'

const route = useRoute()
const router = useRouter()
const agencyStore = useAgencyStore()
const wilayasStore = useWilayasStore()

const formRef = ref(null)
const isEditing = computed(() => !!route.params.id)
const saving = ref(false)

const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const newInclusion = ref('')
const newExclusion = ref('')

const themeOptions = [
  'Sahara & Oasis',
  'Culture & Histoire',
  'Randonnée & Nature',
  'Côte & Mer',
  'Gastronomie & Terroir',
  'Aventure 4x4'
]

const sampleImages = [
  { label: 'Djanet Sahara', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Casbah Alger', url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Tipaza Antique', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80' }
]

const suggestedInclusions = [
  'Transport véhicule 4x4',
  'Guide accompagnateur agréé',
  'Hébergement en pension complète',
  'Bivouac saharien sous tente',
  'Eau minérale & collations'
]

const suggestedExclusions = [
  'Billets d\'avion',
  'Dépenses personnelles',
  'Assurance rapatriement'
]

const form = reactive({
  name: '',
  destination: null,
  durationDays: 3,
  theme: 'Sahara & Oasis',
  price: 45000,
  description: '',
  meetingPoint: '',
  image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
  inclusions: ['Transport véhicule 4x4', 'Guide accompagnateur agréé', 'Hébergement en pension complète'],
  exclusions: ['Billets d\'avion', 'Dépenses personnelles'],
  cancellationPolicy: 'Annulation sans frais jusqu\'à 72 heures avant le départ. Passé ce délai, 30% du montant est retenu.',
  requiresDeposit: false,
  depositType: 'percentage',
  depositPercentage: 30,
  depositAmountDZD: 0,
  paymentDueDaysBeforeDeparture: 2,
  items: [
    { day: 1, items: [{ title: 'Départ et installation', description: 'Accueil des voyageurs au point de rassemblement et départ vers le site.' }] },
    { day: 2, items: [{ title: 'Excursion et découvertes', description: 'Visite guidée des monuments et paysages naturels.' }] },
    { day: 3, items: [{ title: 'Clôture et retour', description: 'Dernière escale artisanale et voyage retour.' }] }
  ]
})

const onDurationChange = (val) => {
  const count = Math.max(1, Math.min(30, Number(val) || 1))
  while (form.items.length < count) {
    const nextDay = form.items.length + 1
    form.items.push({
      day: nextDay,
      items: [{ title: `Étape Jour ${nextDay}`, description: 'Description des activités prévues.' }]
    })
  }
  while (form.items.length > count) {
    form.items.pop()
  }
}

const addDay = () => {
  form.durationDays = (form.durationDays || form.items.length) + 1
  onDurationChange(form.durationDays)
}

const removeDay = (idx) => {
  if (form.items.length <= 1) return
  form.items.splice(idx, 1)
  form.durationDays = form.items.length
  // Re-index days
  form.items.forEach((item, i) => { item.day = i + 1 })
}

const addInclusion = () => {
  if (newInclusion.value && newInclusion.value.trim()) {
    form.inclusions.push(newInclusion.value.trim())
    newInclusion.value = ''
  }
}

const addQuickInclusion = (str) => {
  if (!form.inclusions.includes(str)) {
    form.inclusions.push(str)
  }
}

const addExclusion = () => {
  if (newExclusion.value && newExclusion.value.trim()) {
    form.exclusions.push(newExclusion.value.trim())
    newExclusion.value = ''
  }
}

const addQuickExclusion = (str) => {
  if (!form.exclusions.includes(str)) {
    form.exclusions.push(str)
  }
}

const savePackage = async (targetStatus) => {
  const { valid } = await formRef.value.validate()
  if (!valid) {
    snackbarText.value = 'Veuillez remplir tous les champs obligatoires'
    snackbarColor.value = 'error'
    snackbar.value = true
    return
  }

  saving.value = true
  try {
    const payload = {
      name: form.name,
      destination: form.destination,
      durationDays: form.durationDays,
      theme: form.theme,
      price: String(form.price),
      description: form.description,
      meetingPoint: form.meetingPoint,
      image: form.image,
      inclusions: form.inclusions,
      exclusions: form.exclusions,
      cancellationPolicy: form.cancellationPolicy,
      requiresDeposit: form.requiresDeposit,
      depositType: form.depositType,
      depositPercentage: form.depositPercentage,
      depositAmountDZD: form.depositAmountDZD,
      paymentDueDaysBeforeDeparture: form.paymentDueDaysBeforeDeparture,
      items: form.items,
      status: targetStatus
    }

    if (isEditing.value) {
      await agencyStore.updatePackage(route.params.id, payload)
      snackbarText.value = 'Package mis à jour avec succès'
    } else {
      const created = await agencyStore.createPackage(payload)
      snackbarText.value = 'Nouveau package créé avec succès'
      router.push(`/agency/packages/edit/${created._id}`)
    }
    snackbarColor.value = 'success'
    snackbar.value = true
  } catch (err) {
    snackbarText.value = err.response?.data?.error || err.message || 'Erreur lors de l\'enregistrement'
    snackbarColor.value = 'error'
    snackbar.value = true
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    await Promise.all([
      agencyStore.fetchProfile(),
      wilayasStore.fetchWilayas()
    ])

    if (isEditing.value) {
      const data = await agencyStore.fetchPackageById(route.params.id)
      const pkg = data.package
      form.name = pkg.name || ''
      form.destination = pkg.destination?._id || pkg.destination || null
      form.durationDays = pkg.durationDays || pkg.days?.length || 1
      form.theme = pkg.theme || 'Sahara & Oasis'
      form.price = Number(pkg.price) || 0
      form.description = pkg.description || ''
      form.meetingPoint = pkg.meetingPoint || ''
      form.image = pkg.image || ''
      form.inclusions = Array.isArray(pkg.inclusions) ? [...pkg.inclusions] : []
      form.exclusions = Array.isArray(pkg.exclusions) ? [...pkg.exclusions] : []
      form.cancellationPolicy = pkg.cancellationPolicy || ''
      if (Array.isArray(pkg.items) && pkg.items.length) {
        form.items = JSON.parse(JSON.stringify(pkg.items))
      }
    }
  } catch (e) {
    console.error('Error loading package edit data:', e)
  }
})
</script>

<style scoped>
.editorial-card {
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(23, 63, 53, 0.08);
}
.border-editorial {
  border: 1px solid rgba(23, 63, 53, 0.08);
}
</style>
