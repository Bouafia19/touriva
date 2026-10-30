<template>
  <div class="agency-dashboard pa-4 pa-md-8">
    <v-container class="max-w-container pa-0">
      <!-- Welcome Header -->
      <div class="d-flex flex-column flex-md-row justify-space-between align-start align-md-center mb-6">
        <div>
          <div class="editorial-tag text-emerald mb-1">TABLEAU DE BORD OPÉRATIONNEL</div>
          <h1 class="text-h4 font-serif font-weight-bold text-forest mb-1">
            {{ agencyStore.profile?.companyName || 'Mon Agence de Voyages' }}
          </h1>
          <p class="text-secondary-editorial text-body-2 mb-0">
            Gestion souveraine de vos circuits touristiques, départs programmés et réservations en Algérie.
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
          <v-btn
            variant="outlined"
            color="#173F35"
            rounded="pill"
            to="/agency/departures"
          >
            <v-icon start>mdi-calendar-plus</v-icon>
            Planifier un Départ
          </v-btn>
        </div>
      </div>

      <!-- Verification Status Banners -->
      <v-alert
        v-if="agencyStore.isVerified"
        type="success"
        variant="tonal"
        density="comfortable"
        class="mb-6 rounded-lg text-body-2"
        icon="mdi-check-decagram"
      >
        <div class="font-weight-bold">Agence Officiellement Agréée</div>
        <div>
          Votre dossier d'agrément a été validé par l'administration Touriva. Vos packages et départs sont publiés et ouverts aux réservations des touristes.
        </div>
      </v-alert>

      <v-alert
        v-else-if="agencyStore.fileStatus === 'pending'"
        type="warning"
        variant="tonal"
        density="comfortable"
        class="mb-6 rounded-lg text-body-2"
        icon="mdi-clock-outline"
      >
        <div class="font-weight-bold">Dossier en Cours d'Examen Réglementaire</div>
        <div>
          Votre dossier d'accréditation est en cours de validation par notre comité. Vous pouvez préparer et enregistrer vos packages en brouillon ; la publication sera activée dès validation officielle.
        </div>
      </v-alert>

      <v-alert
        v-else-if="agencyStore.fileStatus === 'rejected'"
        type="error"
        variant="tonal"
        density="comfortable"
        class="mb-6 rounded-lg text-body-2"
        icon="mdi-alert-circle-outline"
      >
        <div class="font-weight-bold mb-1">Dossier Non Conforme — Action Requise</div>
        <div class="mb-2">
          <strong>Motif indiqué par l'administration :</strong> {{ agencyStore.rejectionReason || 'Documents incomplets ou expirés.' }}
        </div>
        <v-btn
          color="#C24545"
          variant="flat"
          size="small"
          rounded="pill"
          class="text-white font-weight-bold"
          to="/pending"
        >
          Mettre à jour et renvoyer le dossier
        </v-btn>
      </v-alert>

      <!-- KPI Metrics Cards -->
      <v-row class="mb-8">
        <v-col cols="12" sm="6" md="3">
          <v-card class="editorial-card pa-5" elevation="0">
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-caption font-weight-bold text-secondary-editorial text-uppercase">Packages Actifs</span>
              <v-avatar color="#FAF8F2" size="36">
                <v-icon color="#173F35" size="20">mdi-map-marker-path</v-icon>
              </v-avatar>
            </div>
            <div class="text-h4 font-serif font-weight-bold text-forest">
              {{ agencyStore.metrics.publishedPackagesCount }}
              <span class="text-caption font-weight-regular text-secondary-editorial">/ {{ agencyStore.metrics.packagesCount }}</span>
            </div>
            <div class="text-caption text-secondary-editorial mt-1">
              Circuits publiés au catalogue
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="editorial-card pa-5" elevation="0">
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-caption font-weight-bold text-secondary-editorial text-uppercase">Départs Programmés</span>
              <v-avatar color="#FAF8F2" size="36">
                <v-icon color="#21866B" size="20">mdi-calendar-clock</v-icon>
              </v-avatar>
            </div>
            <div class="text-h4 font-serif font-weight-bold text-forest">
              {{ agencyStore.metrics.activeDeparturesCount }}
            </div>
            <div class="text-caption text-secondary-editorial mt-1">
              Sessions ouvertes aux réservations
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="editorial-card pa-5" elevation="0">
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-caption font-weight-bold text-secondary-editorial text-uppercase">Voyageurs Inscrits</span>
              <v-avatar color="#FAF8F2" size="36">
                <v-icon color="#D9943B" size="20">mdi-account-group-outline</v-icon>
              </v-avatar>
            </div>
            <div class="text-h4 font-serif font-weight-bold text-forest">
              {{ agencyStore.metrics.totalBookedTravelers }}
            </div>
            <div class="text-caption text-secondary-editorial mt-1">
              Places confirmées sur les départs
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="editorial-card pa-5" elevation="0">
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-caption font-weight-bold text-secondary-editorial text-uppercase">Statut Légal</span>
              <v-avatar color="#FAF8F2" size="36">
                <v-icon :color="agencyStore.isVerified ? '#21866B' : '#D9943B'" size="20">
                  {{ agencyStore.isVerified ? 'mdi-shield-check' : 'mdi-shield-alert' }}
                </v-icon>
              </v-avatar>
            </div>
            <div class="text-h6 font-weight-bold text-forest">
              {{ agencyStore.isVerified ? 'Vérifié' : (agencyStore.fileStatus === 'rejected' ? 'Rejeté' : 'En attente') }}
            </div>
            <div class="text-caption text-secondary-editorial mt-1">
              Agrément Ministère du Tourisme
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Financial Snapshot Banner -->
      <v-card
        v-if="agencyStore.financialDashboard?.summary"
        class="editorial-card pa-6 mb-8 bg-warm-ivory"
        elevation="0"
      >
        <div class="d-flex flex-column flex-md-row justify-space-between align-start align-md-center ga-4">
          <div>
            <div class="editorial-tag text-emerald mb-1">TRÉSORERIE & RÈGLEMENTS</div>
            <h3 class="text-h6 font-serif font-weight-bold text-forest mb-1">
              Synthèse Financière
            </h3>
            <div class="d-flex flex-wrap ga-4 mt-2">
              <div>
                <span class="text-caption text-secondary-editorial d-block">Total Encaissé :</span>
                <strong class="text-emerald font-mono text-body-1">{{ Number(agencyStore.financialDashboard.summary.totalCollectedDZD || 0).toLocaleString('fr-DZ') }} DZD</strong>
              </div>
              <v-divider vertical class="d-none d-sm-block" />
              <div>
                <span class="text-caption text-secondary-editorial d-block">Recettes Nettes :</span>
                <strong class="text-forest font-mono text-body-1">{{ Number(agencyStore.financialDashboard.summary.netRevenueDZD || 0).toLocaleString('fr-DZ') }} DZD</strong>
              </div>
              <v-divider vertical class="d-none d-sm-block" />
              <div>
                <span class="text-caption text-secondary-editorial d-block">Reste à Recouvrer :</span>
                <strong class="text-amber font-mono text-body-1">{{ Number(agencyStore.financialDashboard.summary.outstandingReceivablesDZD || 0).toLocaleString('fr-DZ') }} DZD</strong>
              </div>
            </div>
          </div>

          <v-btn
            color="#173F35"
            class="text-white font-weight-bold"
            rounded="pill"
            to="/agency/financials"
          >
            <v-icon start>mdi-cash-multiple</v-icon>
            Gérer les Règlements
          </v-btn>
        </div>
      </v-card>

      <!-- Recent Packages & Quick Departures Table -->
      <v-row>
        <!-- My Packages Overview -->
        <v-col cols="12" md="7">
          <v-card class="editorial-card pa-6" elevation="0">
            <div class="d-flex justify-space-between align-center mb-4">
              <h2 class="text-h6 font-serif font-weight-bold text-forest ma-0">
                Mes Packages Récents
              </h2>
              <v-btn variant="text" size="small" color="#173F35" to="/agency/packages">
                Voir tout ({{ agencyStore.packages.length }})
                <v-icon end size="16">mdi-arrow-right</v-icon>
              </v-btn>
            </div>

            <div v-if="agencyStore.loading && !agencyStore.packages.length" class="py-8 text-center">
              <v-progress-circular indeterminate color="#21866B" size="32" />
            </div>

            <div v-else-if="!agencyStore.packages.length" class="py-8 text-center text-secondary-editorial">
              <v-icon size="40" color="#B89564" class="mb-2">mdi-package-variant-closed</v-icon>
              <div>Aucun circuit créé pour le moment.</div>
              <v-btn
                color="#173F35"
                size="small"
                rounded="pill"
                class="mt-3 text-white font-weight-bold"
                to="/agency/packages/new"
              >
                Créer mon premier package
              </v-btn>
            </div>

            <v-list v-else lines="two" class="pa-0">
              <v-list-item
                v-for="pkg in agencyStore.packages.slice(0, 5)"
                :key="pkg._id"
                class="px-0 py-2 border-b"
              >
                <template #prepend>
                  <v-avatar rounded="lg" size="48" color="#FAF8F2" class="mr-3">
                    <v-img v-if="pkg.image" :src="pkg.image" cover />
                    <v-icon v-else color="#173F35">mdi-image-outline</v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title class="font-weight-bold text-forest text-body-2">
                  {{ pkg.name }}
                </v-list-item-title>

                <v-list-item-subtitle class="text-caption text-secondary-editorial">
                  {{ pkg.destination?.name || 'Algérie' }} • {{ pkg.durationDays || pkg.days?.length || 1 }} jours • {{ formatPrice(pkg.price) }} DZD
                </v-list-item-subtitle>

                <template #append>
                  <div class="d-flex align-center ga-2">
                    <v-chip
                      size="x-small"
                      :color="pkg.status === 'published' ? '#21866B' : (pkg.status === 'paused' ? '#D9943B' : '#757575')"
                      variant="flat"
                      class="text-white"
                    >
                      {{ pkg.status === 'published' ? 'Publié' : (pkg.status === 'paused' ? 'En pause' : 'Brouillon') }}
                    </v-chip>
                    <v-btn
                      icon="mdi-pencil-outline"
                      size="x-small"
                      variant="text"
                      :to="`/agency/packages/edit/${pkg._id}`"
                    />
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <!-- Upcoming Departures -->
        <v-col cols="12" md="5">
          <v-card class="editorial-card pa-6" elevation="0">
            <div class="d-flex justify-space-between align-center mb-4">
              <h2 class="text-h6 font-serif font-weight-bold text-forest ma-0">
                Prochains Départs
              </h2>
              <v-btn variant="text" size="small" color="#173F35" to="/agency/departures">
                Gérer
                <v-icon end size="16">mdi-arrow-right</v-icon>
              </v-btn>
            </div>

            <div v-if="agencyStore.loading && !agencyStore.departures.length" class="py-8 text-center">
              <v-progress-circular indeterminate color="#21866B" size="32" />
            </div>

            <div v-else-if="!agencyStore.departures.length" class="py-8 text-center text-secondary-editorial">
              <v-icon size="40" color="#B89564" class="mb-2">mdi-calendar-blank-outline</v-icon>
              <div>Aucun départ programmé.</div>
              <v-btn
                variant="outlined"
                color="#173F35"
                size="small"
                rounded="pill"
                class="mt-3 font-weight-bold"
                to="/agency/departures"
              >
                Programmer une date
              </v-btn>
            </div>

            <div v-else class="departures-list">
              <div
                v-for="dep in agencyStore.departures.slice(0, 5)"
                :key="dep._id"
                class="pa-3 mb-2 rounded-lg bg-warm-ivory border-editorial"
              >
                <div class="d-flex justify-space-between align-start mb-1">
                  <div class="font-weight-bold text-forest text-body-2 text-truncate mr-2">
                    {{ dep.trip?.name || 'Excursion' }}
                  </div>
                  <v-chip
                    size="x-small"
                    :color="dep.status === 'scheduled' ? '#21866B' : (dep.status === 'cancelled' ? '#C24545' : '#173F35')"
                    class="text-white"
                  >
                    {{ dep.status === 'scheduled' ? 'Confirmé' : (dep.status === 'cancelled' ? 'Annulé' : dep.status) }}
                  </v-chip>
                </div>

                <div class="d-flex align-center text-caption text-secondary-editorial mb-2">
                  <v-icon size="14" color="#D9B98C" class="mr-1">mdi-calendar</v-icon>
                  {{ formatDate(dep.startDate) }}
                </div>

                <div class="d-flex justify-space-between align-center text-caption">
                  <span class="font-weight-bold text-forest">{{ formatPrice(dep.priceDZD) }} DZD</span>
                  <span :class="dep.availableSeats > 0 ? 'text-emerald' : 'text-error'" class="font-weight-medium">
                    {{ dep.availableSeats }} places dispo (sur {{ dep.capacity }})
                  </span>
                </div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAgencyStore } from '@/stores/agency'

const agencyStore = useAgencyStore()

const formatPrice = (p) => {
  return Number(p || 0).toLocaleString('fr-DZ')
}

const formatDate = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('fr-DZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  try {
    await agencyStore.fetchProfile()
    await Promise.all([
      agencyStore.fetchPackages(),
      agencyStore.fetchDepartures({ upcoming: true }),
      agencyStore.fetchFinancialDashboard().catch(() => {})
    ])
  } catch (e) {
    console.error('Error loading dashboard:', e)
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
