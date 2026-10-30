<template>
  <div class="agency-packages pa-4 pa-md-8">
    <v-container class="max-w-container pa-0">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-space-between align-start align-md-center mb-6">
        <div>
          <div class="editorial-tag text-emerald mb-1">CATALOGUE AGENCE</div>
          <h1 class="text-h4 font-serif font-weight-bold text-forest mb-1">
            Mes Circuits & Packages
          </h1>
          <p class="text-secondary-editorial text-body-2 mb-0">
            Créez et configurez vos offres de voyages, leurs itinéraires détaillés et leurs conditions tarifaires.
          </p>
        </div>

        <div class="mt-4 mt-md-0 d-flex ga-2">
          <v-btn
            color="#173F35"
            class="btn-editorial-primary font-weight-bold"
            rounded="pill"
            to="/agency/packages/new"
          >
            <v-icon start>mdi-plus</v-icon>
            Nouveau Package
          </v-btn>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <v-card class="editorial-card pa-4 mb-6" elevation="0">
        <v-row align="center">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchQuery"
              placeholder="Rechercher par titre de circuit ou wilaya..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              color="#173F35"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-tabs
              v-model="activeTab"
              color="#173F35"
              density="comfortable"
              align-tabs="end"
              class="border-b-0"
            >
              <v-tab value="all">Tous ({{ agencyStore.packages.length }})</v-tab>
              <v-tab value="published">Publiés</v-tab>
              <v-tab value="created">Brouillons</v-tab>
              <v-tab value="paused">En pause</v-tab>
              <v-tab value="archived">Archivés</v-tab>
            </v-tabs>
          </v-col>
        </v-row>
      </v-card>

      <!-- Loading State -->
      <div v-if="agencyStore.loading && !agencyStore.packages.length" class="py-16 text-center">
        <v-progress-circular indeterminate color="#21866B" size="48" />
        <p class="text-secondary-editorial text-caption mt-4">Chargement de votre catalogue...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!filteredPackages.length" class="editorial-card pa-12 text-center">
        <v-avatar color="#FAF8F2" size="72" class="mb-4">
          <v-icon size="36" color="#B89564">mdi-map-marker-path</v-icon>
        </v-avatar>
        <h3 class="text-h6 font-serif font-weight-bold text-forest mb-2">
          Aucun package trouvé
        </h3>
        <p class="text-secondary-editorial text-body-2 mb-6 max-w-md mx-auto">
          {{ searchQuery ? 'Aucun résultat ne correspond à vos filtres de recherche.' : 'Commencez à concevoir votre premier circuit d\'excursion en Algérie.' }}
        </p>
        <v-btn
          color="#173F35"
          rounded="pill"
          class="btn-editorial-primary font-weight-bold"
          to="/agency/packages/new"
        >
          <v-icon start>mdi-plus</v-icon>
          Créer un package
        </v-btn>
      </div>

      <!-- Packages Grid -->
      <v-row v-else>
        <v-col
          v-for="pkg in filteredPackages"
          :key="pkg._id"
          cols="12"
          sm="6"
          lg="4"
        >
          <v-card class="editorial-card package-card d-flex flex-column fill-height" elevation="0">
            <!-- Cover Photo with Badges -->
            <div class="position-relative">
              <v-img
                :src="pkg.image || 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=800&q=80'"
                height="200"
                cover
                class="rounded-t-lg bg-sand-light"
              >
                <template #placeholder>
                  <div class="d-flex fill-height align-center justify-center bg-sand-light">
                    <v-progress-circular indeterminate color="#21866B" size="24" />
                  </div>
                </template>
              </v-img>

              <!-- Status Badge -->
              <div class="position-absolute top-0 right-0 ma-3">
                <v-chip
                  size="small"
                  :color="statusColor(pkg.status)"
                  variant="flat"
                  class="text-white font-weight-bold elevation-1"
                >
                  {{ statusLabel(pkg.status) }}
                </v-chip>
              </div>

              <!-- Duration Pill -->
              <div class="position-absolute bottom-0 left-0 ma-3">
                <v-chip
                  size="small"
                  color="rgba(16, 45, 39, 0.85)"
                  variant="flat"
                  class="text-white backdrop-blur"
                >
                  <v-icon start size="14" color="#D9B98C">mdi-clock-outline</v-icon>
                  {{ pkg.durationDays || pkg.days?.length || 1 }} Jours
                </v-chip>
              </div>
            </div>

            <!-- Card Body -->
            <v-card-text class="pa-5 flex-grow-1 d-flex flex-column justify-space-between">
              <div>
                <div class="d-flex align-center text-caption text-secondary-editorial mb-1">
                  <v-icon size="14" color="#21866B" class="mr-1">mdi-map-marker</v-icon>
                  {{ pkg.destination?.name || 'Algérie' }}
                  <span class="mx-2">•</span>
                  <span>{{ pkg.theme || 'Circuit' }}</span>
                </div>

                <h3 class="text-h6 font-serif font-weight-bold text-forest mb-2 line-clamp-2">
                  {{ pkg.name }}
                </h3>

                <p class="text-body-2 text-secondary-editorial line-clamp-2 mb-4">
                  {{ pkg.description || 'Circuit guidé conçu par une agence agréée Touriva.' }}
                </p>
              </div>

              <div>
                <!-- Departures count info -->
                <div class="pa-2 rounded-lg bg-warm-ivory border-editorial mb-4 d-flex justify-space-between align-center text-caption">
                  <span class="text-forest font-weight-medium">
                    <v-icon size="14" color="#21866B" class="mr-1">mdi-calendar-check</v-icon>
                    {{ pkg.activeDeparturesCount || 0 }} départs actifs
                  </span>
                  <router-link
                    :to="`/agency/departures?trip=${pkg._id}`"
                    class="text-emerald font-weight-bold text-decoration-none"
                  >
                    Gérer les dates
                  </router-link>
                </div>

                <!-- Price and Actions Footer -->
                <div class="d-flex justify-space-between align-center pt-2 border-t">
                  <div>
                    <div class="text-caption text-secondary-editorial">Prix de base</div>
                    <div class="text-h6 font-weight-bold text-forest">
                      {{ formatPrice(pkg.price) }} <span class="text-caption font-weight-regular">DZD</span>
                    </div>
                  </div>

                  <div class="d-flex ga-1">
                    <v-btn
                      icon="mdi-pencil-outline"
                      size="small"
                      variant="tonal"
                      color="#173F35"
                      :to="`/agency/packages/edit/${pkg._id}`"
                    />

                    <v-menu location="bottom end">
                      <template #activator="{ props }">
                        <v-btn
                          icon="mdi-dots-vertical"
                          size="small"
                          variant="text"
                          v-bind="props"
                        />
                      </template>
                      <v-list density="compact" class="py-1">
                        <v-list-item
                          v-if="pkg.status !== 'published'"
                          prepend-icon="mdi-publish"
                          title="Publier au catalogue"
                          @click="toggleStatus(pkg, 'published')"
                        />
                        <v-list-item
                          v-if="pkg.status === 'published'"
                          prepend-icon="mdi-pause-circle-outline"
                          title="Mettre en pause"
                          @click="toggleStatus(pkg, 'paused')"
                        />
                        <v-list-item
                          v-if="pkg.status !== 'archived'"
                          prepend-icon="mdi-archive-arrow-down-outline"
                          title="Archiver"
                          @click="toggleStatus(pkg, 'archived')"
                        />
                        <v-divider class="my-1" />
                        <v-list-item
                          prepend-icon="mdi-delete-outline"
                          title="Supprimer"
                          class="text-error"
                          @click="confirmDelete(pkg)"
                        />
                      </v-list>
                    </v-menu>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Delete Confirmation Modal -->
    <v-dialog v-model="deleteDialog" max-width="450">
      <v-card class="editorial-card pa-6">
        <h3 class="text-h6 font-serif font-weight-bold text-forest mb-2">
          Supprimer ce package ?
        </h3>
        <p class="text-body-2 text-secondary-editorial mb-6">
          Êtes-vous sûr de vouloir supprimer définitivement « {{ selectedPkg?.name }} » ? Cette action supprimera également tous les départs non réservés associés.
        </p>
        <div class="d-flex ga-3 justify-end">
          <v-btn variant="outlined" rounded="pill" @click="deleteDialog = false">
            Annuler
          </v-btn>
          <v-btn
            color="#C24545"
            rounded="pill"
            class="text-white font-weight-bold"
            :loading="actionLoading"
            @click="executeDelete"
          >
            Supprimer
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Snackbar Notification -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="4000">
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAgencyStore } from '@/stores/agency'

const agencyStore = useAgencyStore()

const searchQuery = ref('')
const activeTab = ref('all')
const deleteDialog = ref(false)
const selectedPkg = ref(null)
const actionLoading = ref(false)

const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const notify = (text, color = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

const statusColor = (st) => {
  switch (st) {
    case 'published': return '#21866B'
    case 'paused': return '#D9943B'
    case 'archived': return '#757575'
    default: return '#546E7A' // created / draft
  }
}

const statusLabel = (st) => {
  switch (st) {
    case 'published': return 'Publié'
    case 'paused': return 'En pause'
    case 'archived': return 'Archivé'
    default: return 'Brouillon'
  }
}

const formatPrice = (p) => {
  return Number(p || 0).toLocaleString('fr-DZ')
}

const filteredPackages = computed(() => {
  let list = agencyStore.packages || []

  // Filter by tab
  if (activeTab.value !== 'all') {
    list = list.filter(p => p.status === activeTab.value)
  }

  // Filter by search query
  if (searchQuery.value && searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(p => {
      const nameMatch = p.name?.toLowerCase().includes(q)
      const wilayaMatch = p.destination?.name?.toLowerCase().includes(q)
      const themeMatch = p.theme?.toLowerCase().includes(q)
      return nameMatch || wilayaMatch || themeMatch
    })
  }

  return list
})

const toggleStatus = async (pkg, newStatus) => {
  try {
    await agencyStore.updatePackage(pkg._id, { status: newStatus })
    notify(`Statut du package mis à jour : ${statusLabel(newStatus)}`)
  } catch (err) {
    notify(err.response?.data?.error || 'Erreur lors de la mise à jour du statut', 'error')
  }
}

const confirmDelete = (pkg) => {
  selectedPkg.value = pkg
  deleteDialog.value = true
}

const executeDelete = async () => {
  if (!selectedPkg.value) return
  actionLoading.value = true
  try {
    await agencyStore.deletePackage(selectedPkg.value._id)
    notify('Package supprimé avec succès')
    deleteDialog.value = false
  } catch (err) {
    notify(err.response?.data?.error || 'Impossible de supprimer ce package', 'error')
  } finally {
    actionLoading.value = false
  }
}

onMounted(async () => {
  try {
    await agencyStore.fetchPackages()
  } catch (e) {
    console.error('Error fetching packages:', e)
  }
})
</script>

<style scoped>
.editorial-card {
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(23, 63, 53, 0.08);
}
.package-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.package-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(23, 63, 53, 0.08) !important;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.border-editorial {
  border: 1px solid rgba(23, 63, 53, 0.08);
}
</style>
