<template>
  <v-app class="touriva-agency-layout bg-warm-ivory">
    <!-- Top App Bar -->
    <v-app-bar
      color="#173F35"
      elevation="0"
      density="comfortable"
      class="border-b"
      style="border-bottom-color: rgba(231, 232, 225, 0.15) !important;"
    >
      <v-app-bar-nav-icon
        variant="text"
        color="#FAF8F2"
        @click="drawer = !drawer"
      />

      <div class="d-flex align-center cursor-pointer" @click="$router.push('/agency/dashboard')">
        <span class="font-serif font-weight-bold text-white text-h6 mr-2">Touriva</span>
        <v-chip size="x-small" color="#D9B98C" variant="flat" class="text-deep-green font-weight-bold text-uppercase">
          Espace Agence
        </v-chip>
      </div>

      <v-spacer />

      <!-- Verification Badge in Top Bar -->
      <div v-if="agencyStore.profile" class="mr-3 d-none d-sm-flex align-center">
        <v-chip
          v-if="agencyStore.isVerified"
          size="small"
          color="#21866B"
          variant="flat"
          class="text-white font-weight-medium"
        >
          <v-icon start size="14">mdi-check-decagram</v-icon>
          Agence Agréée
        </v-chip>
        <v-chip
          v-else-if="agencyStore.fileStatus === 'pending'"
          size="small"
          color="#D9943B"
          variant="flat"
          class="text-white font-weight-medium"
        >
          <v-icon start size="14">mdi-clock-outline</v-icon>
          En cours de vérification
        </v-chip>
        <v-chip
          v-else-if="agencyStore.fileStatus === 'rejected'"
          size="small"
          color="#C24545"
          variant="flat"
          class="text-white font-weight-medium"
          @click="$router.push('/pending')"
        >
          <v-icon start size="14">mdi-alert-circle</v-icon>
          Dossier à corriger
        </v-chip>
      </div>

      <!-- Public Site Link -->
      <v-btn
        variant="text"
        color="#D9B98C"
        size="small"
        class="text-caption font-weight-medium mr-2"
        @click="$router.push('/trips')"
      >
        <v-icon start size="16">mdi-eye-outline</v-icon>
        <span class="d-none d-md-inline">Portail Touristes</span>
      </v-btn>

      <!-- Sign Out -->
      <v-btn
        icon="mdi-logout"
        variant="text"
        color="#FAF8F2"
        size="small"
        @click="signOut"
      />
    </v-app-bar>

    <!-- Side Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      color="#102D27"
      class="agency-drawer text-white"
    >
      <!-- Agency Header Info -->
      <div class="pa-5 border-b" style="border-color: rgba(255,255,255,0.08) !important;">
        <div class="d-flex align-center ga-3">
          <v-avatar color="#21866B" size="44" class="text-white font-weight-bold">
            <v-icon size="24">mdi-domain</v-icon>
          </v-avatar>
          <div class="overflow-hidden">
            <div class="font-weight-bold text-body-2 text-truncate text-white">
              {{ agencyStore.profile?.companyName || agencyStore.profile?.firstName || 'Agence Partenaire' }}
            </div>
            <div class="text-caption text-sand-light text-truncate">
              {{ agencyStore.profile?.email }}
            </div>
          </div>
        </div>
      </div>

      <!-- Nav Items -->
      <v-list density="comfortable" nav class="pa-3">
        <v-list-item
          prepend-icon="mdi-view-dashboard-outline"
          title="Tableau de bord"
          value="dashboard"
          to="/agency/dashboard"
          rounded="lg"
          active-color="#D9B98C"
        />

        <v-list-item
          prepend-icon="mdi-map-marker-path"
          title="Mes Packages & Circuits"
          value="packages"
          to="/agency/packages"
          rounded="lg"
          active-color="#D9B98C"
        />

        <v-list-item
          prepend-icon="mdi-calendar-clock"
          title="Départs Programmés"
          value="departures"
          to="/agency/departures"
          rounded="lg"
          active-color="#D9B98C"
        />

        <v-list-item
          prepend-icon="mdi-ticket-confirmation-outline"
          title="Réservations"
          value="bookings"
          to="/agency/bookings"
          rounded="lg"
          active-color="#D9B98C"
        >
          <template #append v-if="agencyStore.pendingBookingsCount > 0">
            <v-badge
              :content="agencyStore.pendingBookingsCount"
              color="#D9943B"
              inline
            />
          </template>
        </v-list-item>

        <v-list-item
          prepend-icon="mdi-file-document-edit-outline"
          title="Demandes de Devis"
          value="enquiries"
          to="/agency/enquiries"
          rounded="lg"
          active-color="#D9B98C"
        >
          <template #append v-if="agencyStore.pendingEnquiriesCount > 0">
            <v-badge
              :content="agencyStore.pendingEnquiriesCount"
              color="#D9943B"
              inline
            />
          </template>
        </v-list-item>

        <v-list-item
          prepend-icon="mdi-cash-multiple"
          title="Finances & Règlements"
          value="financials"
          to="/agency/financials"
          rounded="lg"
          active-color="#D9B98C"
        />

        <v-divider class="my-3" style="border-color: rgba(255,255,255,0.08) !important;" />

        <v-list-item
          prepend-icon="mdi-plus-box-outline"
          title="Créer un Package"
          value="newPackage"
          to="/agency/packages/new"
          rounded="lg"
          active-color="#D9B98C"
        />

        <v-list-item
          prepend-icon="mdi-file-certificate-outline"
          title="Dossier d'Agrément"
          value="verification"
          to="/pending"
          rounded="lg"
          active-color="#D9B98C"
        />
      </v-list>

      <template #append>
        <div class="pa-4 border-t" style="border-color: rgba(255,255,255,0.08) !important;">
          <v-btn
            block
            variant="outlined"
            color="#D9B98C"
            size="small"
            rounded="pill"
            to="/trips"
          >
            <v-icon start size="16">mdi-arrow-left</v-icon>
            Retour au Catalogue
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Main Router Content -->
    <v-main class="bg-warm-ivory">
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAgencyStore } from '@/stores/agency'

const router = useRouter()
const authStore = useAuthStore()
const agencyStore = useAgencyStore()

const drawer = ref(true)

const signOut = async () => {
  await authStore.account_sign_out()
  router.push('/login')
}

onMounted(async () => {
  try {
    await agencyStore.fetchProfile()
  } catch (e) {
    console.error('Failed to load agency profile in layout:', e)
  }
})
</script>

<style scoped>
.touriva-agency-layout {
  min-height: 100vh;
}
.agency-drawer {
  background-color: #102D27 !important;
}
</style>
