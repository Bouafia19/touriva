<template>
  <div class="user-info-page bg-warm-ivory py-10 px-4 min-h-screen d-flex align-center justify-center">
    <v-container class="max-w-xl">
      <!-- Brand & Header -->
      <div class="text-center mb-8">
        <div class="editorial-tag text-emerald mb-2">
          TOURIVA PARTNERSHIP
        </div>
        <h2 class="editorial-title text-forest mb-2">
          {{ !typeAccount ? ($t('Sttoa') || 'Select Your Partner Category') : ($t('completeProfile') || 'Complete Your Profile') }}
        </h2>
        <p class="text-secondary-editorial text-body-2">
          {{ !typeAccount ? 'Choose the category that best represents your role in the Algerian tourism ecosystem.' : 'Provide your official credentials and security credentials to complete registration.' }}
        </p>
      </div>

      <v-card class="editorial-card pa-6 pa-md-8 elevation-1">
        <!-- Step 1: Role Selection -->
        <div v-if="!typeAccount">
          <div class="role-grid mb-6">
            <v-card
              v-for="role in roleOptions"
              :key="role.key"
              class="role-card pa-4 mb-3 cursor-pointer"
              variant="outlined"
              @click="selectUserRole(role.key)"
            >
              <div class="d-flex align-center">
                <div class="role-icon-box bg-sand-light mr-4 d-flex align-center justify-center">
                  <v-icon color="#173F35" size="24">{{ role.icon }}</v-icon>
                </div>
                <div class="flex-grow-1">
                  <div class="font-weight-bold text-forest text-body-1">
                    {{ $t(role.key) }}
                  </div>
                  <div class="text-caption text-secondary-editorial">
                    {{ role.desc }}
                  </div>
                </div>
                <v-icon color="#21866B" size="20">mdi-chevron-right</v-icon>
              </div>
            </v-card>
          </div>
        </div>

        <!-- Step 2: Profile Details Form -->
        <form v-else @submit.prevent="submit">
          <!-- Back to role selector -->
          <div class="d-flex justify-space-between align-center mb-6">
            <v-btn
              variant="text"
              density="compact"
              class="text-forest text-caption font-weight-bold"
              @click="typeAccount = ''"
            >
              <v-icon start size="16">mdi-arrow-left</v-icon>
              {{ $t('changeRole') || 'Change Category' }}
            </v-btn>

            <v-chip size="small" color="#173F35" variant="tonal" class="font-weight-medium">
              {{ $t(typeAccount) }}
            </v-chip>
          </div>

          <!-- Company / Agency Name -->
          <v-text-field
            v-if="isAgency || isAssociation || isOther"
            v-model="companyName"
            :label="$t('RaisonSocial') || 'Company or Organization Name'"
            variant="outlined"
            density="comfortable"
            color="#21866B"
            class="mb-3"
            required
          />

          <!-- First & Last Name -->
          <v-row v-if="isAgency || isAssociation || isGuide || isOther || isVisitor" dense>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="firstName"
                :label="isVisitor || isGuide ? $t('firstName') : isAgency ? $t('firstNameResponsable') : $t('firstNamePresident')"
                variant="outlined"
                density="comfortable"
                color="#21866B"
                class="mb-3"
                required
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="lastName"
                :label="isVisitor || isGuide ? $t('lastName') : isAgency ? $t('lastNameResponsable') : $t('lastNamePresident')"
                variant="outlined"
                density="comfortable"
                color="#21866B"
                class="mb-3"
                required
              />
            </v-col>
          </v-row>

          <!-- Guide Specifics -->
          <div v-if="isGuide" class="mb-4">
            <v-select
              v-model="guideType"
              :label="$t('typeOfGuide') || 'Guide Accreditation Level'"
              :items="guideTypes"
              item-title="label"
              item-value="value"
              variant="outlined"
              density="comfortable"
              color="#21866B"
              class="mb-3"
            />

            <v-checkbox
              v-model="checkbox"
              color="#21866B"
              density="compact"
              hide-details
            >
              <template v-slot:label>
                <span class="text-body-2 text-forest">{{ $t('hasLicense') || 'I possess an official Ministry of Tourism guide card' }}</span>
              </template>
            </v-checkbox>
          </div>

          <!-- Association Activity Type -->
          <v-autocomplete
            v-if="isAssociation"
            v-model="associationTypeActivity"
            :items="activities.getActivities"
            label="Activité de l'association"
            item-title="name"
            item-value="_id"
            variant="outlined"
            density="comfortable"
            color="#21866B"
            class="mb-3"
          />

          <!-- Wilaya & Commune Selection -->
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-autocomplete
                v-model="wilayaId"
                :items="wilaya.getWilayas"
                label="Wilaya"
                item-title="name"
                item-value="_id"
                variant="outlined"
                density="comfortable"
                color="#21866B"
                class="mb-3"
                @update:modelValue="updateDaira"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-autocomplete
                v-model="communeId"
                :items="communeItems"
                label="Commune"
                item-title="name"
                item-value="_id"
                variant="outlined"
                density="comfortable"
                color="#21866B"
                class="mb-3"
              />
            </v-col>
          </v-row>

          <!-- Email -->
          <v-text-field
            v-model="email.value.value"
            :label="$t('email')"
            type="email"
            variant="outlined"
            density="comfortable"
            color="#21866B"
            :error-messages="email.errorMessage.value"
            class="mb-3"
            required
          />

          <!-- Password & Confirmation -->
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="password"
                :label="$t('password')"
                type="password"
                variant="outlined"
                density="comfortable"
                color="#21866B"
                class="mb-3"
                required
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="passwordConfirmation"
                :label="$t('passwordConfirmation')"
                type="password"
                variant="outlined"
                density="comfortable"
                color="#21866B"
                class="mb-3"
                required
              />
            </v-col>
          </v-row>

          <!-- Error Alert -->
          <v-alert
            v-if="err"
            type="error"
            variant="tonal"
            class="mb-4 rounded-lg text-body-2"
          >
            {{ $t(err) }}
          </v-alert>

          <!-- Submit Button -->
          <v-btn
            type="submit"
            class="btn-editorial-primary mt-2"
            block
            size="large"
            :loading="loading"
          >
            {{ $t('next') || 'Continue Registration' }}
            <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>
        </form>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useField, useForm } from 'vee-validate'
import { useWilayasStore } from '@/stores/wilaya'
import { useDairasStore } from '@/stores/daira'
import { useCommunesStore } from '@/stores/commune'
import { useActivitiesStore } from '@/stores/activities'
import { useI18n } from 'vue-i18n'

const wilaya = useWilayasStore()
const daira = useDairasStore()
const commune = useCommunesStore()
const activities = useActivitiesStore()
const { t } = useI18n()
const route = useRoute()
const auth = useAuthStore()

const { handleSubmit } = useForm({
  validationSchema: {
    email(value) {
      if (/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(value)) {
        return true
      }
      return 'Must be a valid e-mail.'
    }
  }
})

const email = useField('email')

const companyName = ref('')
const firstName = ref('')
const lastName = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const err = ref('')
const loading = ref(false)
const checkbox = ref(false)
const wilayaId = ref('')
const dairaItems = ref([])
const dairaId = ref('')
const communeItems = ref([])
const communeId = ref('')
const typeAccount = ref('')
const guideType = ref('none')
const associationTypeActivity = ref(null)

const roleOptions = [
  { key: 'touristGuide', icon: 'mdi-compass-outline', desc: 'Licensed national and local travel guides & mountain leaders' },
  { key: 'touristAgencies', icon: 'mdi-office-building-outline', desc: 'Accredited Algerian travel and tourism agencies (AVT)' },
  { key: 'associations', icon: 'mdi-account-group-outline', desc: 'Eco-tourism, hiking and cultural heritage associations' },
  { key: 'visitor', icon: 'mdi-account-outline', desc: 'Independent travelers exploring Algeria' },
  { key: 'others', icon: 'mdi-briefcase-outline', desc: 'Hospitality, transport and artisanal operators' }
]

const isAgency = computed(() => typeAccount.value === 'touristAgencies')
const isGuide = computed(() => typeAccount.value === 'touristGuide')
const isAssociation = computed(() => typeAccount.value === 'associations')
const isOther = computed(() => typeAccount.value === 'others')
const isVisitor = computed(() => typeAccount.value === 'visitor')

const guideTypes = computed(() => [
  { label: t('accompanist') || 'Accompagnateur de Tourisme', value: 'accompanist' },
  { label: t('nationalGuide') || 'Guide Touristique National', value: 'nationalGuide' },
  { label: t('localGuide') || 'Guide Touristique Local', value: 'localGuide' }
])

const selectUserRole = (role) => {
  typeAccount.value = role
}

const updateDaira = () => {
  dairaItems.value = daira.getDairas.filter(
    d => d.wilayaId === wilayaId.value
  )
  communeItems.value = commune.getCommunes.filter(c =>
    dairaItems.value.some(d => d._id === c.dairaId)
  )
}

const clear = () => {
  password.value = ''
  passwordConfirmation.value = ''
}

const signUp = async () => {
  const phone = route.params.phonenumber
  try {
    await auth.account_sign_up({
      phone: phone,
      companyName: companyName.value,
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value.value,
      password: password.value,
      role: 'partner',
      activated: true,
      complete: true,
      status: false,
      fileStatus: 'confirmed',
      hasLicense: checkbox.value,
      wilayaId: wilayaId.value,
      communeId: communeId.value,
      typeAccount: typeAccount.value,
      guideType: guideType.value,
      associationTypeActivity: associationTypeActivity.value
    })
  } catch (error) {
    err.value = auth.getError || error.message || 'Registration failed'
  } finally {
    loading.value = false
  }
}

const submit = handleSubmit(() => {
  loading.value = true
  if (password.value === passwordConfirmation.value) {
    signUp()
  } else {
    err.value = "Password doesn't match"
    loading.value = false
    setTimeout(() => {
      err.value = ''
      clear()
    }, 5000)
  }
})

onMounted(() => {
  wilaya.fetchWilayas()
  daira.fetchDairas()
  commune.fetchCommunes()
  activities.fetchActivities()
})
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}

.max-w-xl {
  max-width: 680px;
}

.role-card {
  border: 1px solid #E7E8E1 !important;
  background-color: #FFFFFF;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.role-card:hover {
  border-color: #21866B !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(23, 63, 53, 0.08);
}

.role-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  border: 1px solid rgba(217, 185, 140, 0.4);
}

.cursor-pointer {
  cursor: pointer;
}
</style>