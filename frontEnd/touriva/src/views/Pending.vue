<template>
  <div class="pending-page bg-warm-ivory py-12 px-4 min-h-screen d-flex align-center justify-center">
    <v-container class="max-w-md">
      <!-- Status Card -->
      <v-card class="editorial-card text-center pa-8 elevation-1">
        <!-- Badge & Icon -->
        <div class="d-flex justify-center mb-6">
          <div v-if="users.user?.fileStatus === 'rejected'" class="icon-circle bg-sand-light d-flex align-center justify-center">
            <v-icon color="#C24545" size="36">mdi-alert-circle-outline</v-icon>
          </div>
          <div v-else class="icon-circle bg-sand-light d-flex align-center justify-center">
            <v-icon color="#173F35" size="36">mdi-clock-check-outline</v-icon>
          </div>
        </div>

        <div v-if="users.user?.fileStatus === 'rejected'" class="editorial-tag text-error mb-2">
          {{ $t('verificationRejected') || 'DOSSIER REJETÉ' }}
        </div>
        <div v-else class="editorial-tag text-emerald mb-2">
          {{ $t('partnerPortal') || 'PARTNER VERIFICATION' }}
        </div>

        <h2 v-if="users.user?.fileStatus === 'rejected'" class="editorial-title text-forest mb-3">
          {{ $t('dossierRejectedTitle') || 'Vérification Non Validée' }}
        </h2>
        <h2 v-else class="editorial-title text-forest mb-3">
          {{ $t('pendingReview') || 'Application Under Review' }}
        </h2>

        <!-- Rejection Feedback Box -->
        <div v-if="users.user?.fileStatus === 'rejected'" class="pa-4 rounded-lg bg-sand-light border-editorial text-left mb-6">
          <div class="font-weight-bold text-forest mb-1 d-flex align-center">
            <v-icon color="#C24545" size="18" class="mr-1">mdi-information-outline</v-icon>
            {{ $t('rejectionReason') || 'Motif du rejet par l’administrateur :' }}
          </div>
          <p class="text-body-2 text-forest mb-0">
            {{ users.user?.rejectionReason || $t('defaultRejectionMessage') || 'Des informations ou pièces justificatives fournies sont incomplètes ou non conformes aux normes réglementaires.' }}
          </p>
        </div>

        <p v-else class="text-secondary-editorial mb-8">
          {{ $t('pendingDescription') || 'Thank you for submitting your partner dossier. Our editorial tourism committee is currently verifying your accreditation and credentials to maintain the premier quality standards of Touriva.' }}
        </p>

        <!-- Stepper / Status Indicator -->
        <div v-if="users.user?.fileStatus !== 'rejected'" class="timeline-box bg-warm-ivory pa-4 rounded-lg mb-8 text-left">
          <div class="d-flex align-center mb-3">
            <v-icon color="#21866B" size="20" class="mr-2">mdi-check-circle</v-icon>
            <span class="text-body-2 font-weight-medium text-forest">{{ $t('dossierSubmitted') || 'Documentation Uploaded' }}</span>
          </div>
          <div class="d-flex align-center mb-3">
            <v-progress-circular indeterminate size="18" width="2" color="#D9B98C" class="mr-2" />
            <span class="text-body-2 font-weight-medium text-forest">{{ $t('complianceReview') || 'Official Verification in Progress' }}</span>
          </div>
          <div class="d-flex align-center text-medium-emphasis">
            <v-icon color="#B89564" size="20" class="mr-2">mdi-circle-outline</v-icon>
            <span class="text-body-2">{{ $t('accountActivation') || 'Concierge Activation & Publishing' }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="d-flex flex-column gap-3">
          <v-btn
            v-if="users.user?.fileStatus === 'rejected'"
            class="btn-editorial-primary mb-2"
            block
            size="large"
            @click="goToDocuments"
          >
            <v-icon start>mdi-file-document-edit-outline</v-icon>
            {{ $t('resubmitDossier') || 'Mettre à jour et renvoyer le dossier' }}
          </v-btn>

          <v-btn
            class="btn-editorial-primary"
            block
            size="large"
            :loading="loading"
            @click="checkStatus"
          >
            <v-icon start>mdi-refresh</v-icon>
            {{ $t('refreshStatus') || 'Check Review Status' }}
          </v-btn>

          <v-btn
            variant="text"
            class="text-secondary-editorial mt-2"
            @click="auth_sign_out"
          >
            <v-icon start size="18">mdi-logout</v-icon>
            {{ $t('logout') || 'Sign Out' }}
          </v-btn>
        </div>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUsersStore } from '@/stores/users'

const router = useRouter()
const auth = useAuthStore()
const users = useUsersStore()
const loading = ref(false)

const goToDocuments = () => {
  router.push({ name: 'Documents' })
}

const auth_sign_out = async () => {
  await auth.account_sign_out()
}

const checkStatus = async () => {
  loading.value = true
  try {
    await users.fetchUser()
    await users.loadUser()
  } catch (e) {
    console.error('Error refreshing status:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  checkStatus()
})
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}

.max-w-md {
  max-width: 520px;
}

.icon-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 1px solid rgba(217, 185, 140, 0.4);
}

.timeline-box {
  border: 1px solid #E7E8E1;
}

.gap-3 {
  gap: 12px;
}
</style>