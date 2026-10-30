<template>
  <div class="documents-page bg-warm-ivory py-10 px-4 min-h-screen d-flex align-center justify-center">
    <v-container class="max-w-lg">
      <!-- Header bar with Sign Out -->
      <div class="d-flex justify-space-between align-center mb-6">
        <div class="editorial-tag text-emerald">
          TOURIVA PARTNER DOSSIER
        </div>
        <v-btn
          variant="text"
          density="comfortable"
          color="error"
          class="text-caption font-weight-bold"
          @click="auth_sign_out"
        >
          <v-icon start size="16">mdi-logout</v-icon>
          {{ $t('logout') || 'Sign Out' }}
        </v-btn>
      </div>

      <v-card class="editorial-card pa-6 pa-md-8 elevation-1">
        <!-- Section Header -->
        <div class="text-center mb-8">
          <div class="icon-circle bg-sand-light mx-auto mb-4 d-flex align-center justify-center">
            <v-icon color="#173F35" size="32">mdi-file-document-multiple-outline</v-icon>
          </div>
          <h2 class="editorial-title text-forest mb-2">
            {{ $t('documentTitle') || 'Professional Accreditation' }}
          </h2>
          <p class="text-secondary-editorial text-body-2">
            {{ $t('documentParagraph') || 'Please upload the official certification required for your professional travel operator category.' }}
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="!users.images" class="py-12 text-center">
          <v-progress-circular indeterminate color="#21866B" size="48" />
          <p class="text-secondary-editorial text-caption mt-4">Loading dossier requirements...</p>
        </div>

        <!-- Document List -->
        <div v-else>
          <!-- Rejection Notice if resubmitting -->
          <v-alert
            v-if="users.user?.fileStatus === 'rejected'"
            type="error"
            variant="tonal"
            density="comfortable"
            class="mb-6 rounded-lg text-body-2"
          >
            <div class="font-weight-bold mb-1">
              {{ $t('rejectionNoticeTitle') || 'Dossier Précédemment Rejeté' }}
            </div>
            <div>
              {{ users.user?.rejectionReason || 'Veuillez mettre à jour les documents non conformes puis soumettre à nouveau.' }}
            </div>
          </v-alert>

          <div class="document-list mb-6">
            <v-card
              v-for="(item, index) in array"
              :key="index"
              class="doc-item-card mb-3 pa-4 cursor-pointer"
              :class="{ 'doc-completed': item.done }"
              variant="outlined"
              @click="getRoute(item)"
            >
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <div
                    class="status-indicator mr-3 d-flex align-center justify-center"
                    :class="item.done ? 'bg-emerald text-white' : 'bg-sand-light text-forest'"
                  >
                    <v-icon size="18">{{ item.done ? 'mdi-check' : 'mdi-upload' }}</v-icon>
                  </div>
                  <div>
                    <div class="font-weight-bold text-forest text-body-2">
                      {{ $t(item.title) }}
                    </div>
                    <div class="text-caption text-secondary-editorial">
                      {{ item.done ? ($t('uploaded') || 'Document uploaded & verified') : ($t('clickToUpload') || 'Tap to photograph or upload file') }}
                    </div>
                  </div>
                </div>

                <v-chip
                  size="small"
                  :color="item.done ? '#21866B' : '#D9B98C'"
                  variant="tonal"
                  class="font-weight-medium"
                >
                  {{ item.done ? ($t('completed') || 'Complete') : ($t('required') || 'Pending') }}
                </v-chip>
              </div>
            </v-card>
          </div>

          <!-- Alert -->
          <v-alert
            v-if="err"
            type="error"
            variant="tonal"
            class="mb-6 rounded-lg text-body-2"
          >
            {{ $t(err) }}
          </v-alert>

          <!-- Completion Progress Indicator -->
          <div class="progress-box pa-4 rounded-lg bg-warm-ivory border-editorial mb-6">
            <div class="d-flex justify-space-between text-caption text-secondary-editorial mb-2">
              <span>{{ $t('dossierCompletion') || 'Dossier Completion' }}</span>
              <span class="font-weight-bold text-forest">{{ counter }} / {{ array.length }}</span>
            </div>
            <v-progress-linear
              :model-value="(counter / (array.length || 1)) * 100"
              color="#21866B"
              bg-color="#E7E8E1"
              height="6"
              rounded
            />
          </div>

          <!-- Submit Button -->
          <v-btn
            class="btn-editorial-primary"
            block
            size="large"
            :loading="loading"
            :disabled="!show"
            @click="submit"
          >
            {{ $t('submitDossier') || 'Submit Dossier for Verification' }}
            <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>

          <p v-if="!show" class="text-caption text-center text-secondary-editorial mt-3">
            {{ $t('allDocsRequired') || 'Please upload all requested documents before submitting.' }}
          </p>
        </div>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'

const users = useUsersStore()
const auth = useAuthStore()
const router = useRouter()

const GUIDE_ROLE_DOCUMENTS = {
  localGuide: {
    label: 'Guide local',
    documents: ['diploma', 'accreditation', 'id']
  },
  nationalGuide: {
    label: 'Guide national',
    documents: ['diploma', 'accreditation', 'id']
  },
  accompanist: {
    label: 'Accompagnateur',
    documents: ['id']
  }
}

const ROLE_DOCUMENTS = {
  touristAgencies: {
    label: 'Agence de voyage',
    documents: ['id', 'commercialRegister', 'accreditation']
  },
  associations: {
    label: 'Association',
    documents: ['presidentId', 'accreditation']
  },
  others: {
    label: 'Autre organisme',
    documents: ['id', 'justification']
  }
}

const DOCUMENT_LABELS = {
  id: 'id',
  diploma: 'diploma',
  accreditation: 'accreditation',
  commercialRegister: 'commercialRegister',
  presidentId: 'presidentId',
  justification: 'justification'
}

const user = ref(null)
const loading = ref(false)
const show = ref(false)
const counter = ref(0)
const err = ref('')
const array = ref([])
const items = ref([])

const buildDocumentsForRoleGuide = (typeAccount) => {
  const roleConfig = GUIDE_ROLE_DOCUMENTS[typeAccount]
  if (!roleConfig) {
    items.value = []
    return
  }
  let docs = [...roleConfig.documents]
  if (user.value?.hasLicense === false) {
    docs = docs.filter(doc => doc !== 'accreditation')
  }
  items.value = docs.map((doc, index) => ({
    id: index + 1,
    title: DOCUMENT_LABELS[doc] || doc,
    key: doc,
    done: false
  }))
  array.value = items.value
}

const buildDocumentsForRole = (typeAccount) => {
  const roleConfig = ROLE_DOCUMENTS[typeAccount]
  if (!roleConfig) {
    items.value = []
    return
  }
  items.value = roleConfig.documents.map((doc, index) => ({
    id: index + 1,
    title: DOCUMENT_LABELS[doc] || doc,
    key: doc,
    done: false
  }))
  array.value = items.value
}

const auth_sign_out = async () => {
  await auth.account_sign_out()
}

const getRoute = (item) => {
  users.photo = users.images?.[item.key] || null
  users.title = item.key
  router.push({ name: 'Document' })
}

const submit = () => {
  loading.value = true
  users.updateUserProfile({ fileStatus: 'pending' }).then((res) => {
    router.push({ name: 'Pending' })
    loading.value = false
  }).catch((e) => {
    err.value = e.message || 'Submission failed'
    loading.value = false
  })
}

const updateUi = () => {
  counter.value = 0
  if (!users.getImages || !items.value.length) return

  items.value.forEach(item => {
    if (users.getImages[item.key]) {
      item.done = true
      counter.value++
    } else {
      item.done = false
    }
  })

  show.value = counter.value === items.value.length
}

watch(
  () => users.getImages,
  () => {
    updateUi()
  },
  { deep: true }
)

onMounted(async () => {
  try {
    const ls = await auth.getLSUserInfo()
    if (ls?.user) {
      user.value = ls.user
      if (user.value.typeAccount === 'touristGuide') {
        buildDocumentsForRoleGuide(user.value.guideType)
      } else {
        buildDocumentsForRole(user.value.typeAccount)
      }
    }
    await users.loadPartnerPhotos()
    updateUi()
  } catch (e) {
    console.error('Error mounting Documents view:', e)
  }
})
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}

.max-w-lg {
  max-width: 620px;
}

.icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 1px solid rgba(217, 185, 140, 0.4);
}

.doc-item-card {
  border: 1px solid #E7E8E1 !important;
  background-color: #FFFFFF;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.doc-item-card:hover {
  border-color: #21866B !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(23, 63, 53, 0.06);
}

.doc-item-card.doc-completed {
  border-color: rgba(33, 134, 107, 0.3) !important;
  background-color: #F8FAF9;
}

.status-indicator {
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.cursor-pointer {
  cursor: pointer;
}

.border-editorial {
  border: 1px solid #E7E8E1;
}
</style>