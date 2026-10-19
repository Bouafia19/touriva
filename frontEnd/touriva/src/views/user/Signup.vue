<template>
  <div class="auth-page bg-warm-ivory min-vh-100 d-flex align-center justify-center py-12 px-4">
    <v-card class="editorial-card auth-card pa-8 pa-md-10" width="100%" max-width="480" elevation="0">
      <!-- Brand Header -->
      <div class="text-center mb-8">
        <v-img
          src="/logo.svg"
          alt="Touriva"
          width="170"
          height="45"
          contain
          class="mx-auto mb-3"
        />
        <div class="editorial-tag text-sand mb-1">JOIN THE TOURIVA COMMUNITY</div>
        <h2 class="text-h5 font-serif font-weight-bold text-forest">
          Create Your Touriva Account
        </h2>
        <p class="text-caption text-secondary-editorial mt-1">
          Explore destinations, reserve guided tours, and book verified stays.
        </p>
      </div>

      <!-- Error Alert -->
      <v-alert
        v-if="err && err !== 'paiu'"
        type="error"
        variant="tonal"
        density="comfortable"
        class="mb-6 rounded-lg"
      >
        {{ $t(err) || err }}
      </v-alert>

      <!-- Signup Form -->
      <form @submit.prevent="submit">
        <div class="mb-4">
          <div class="text-caption font-weight-bold text-forest mb-1">
            {{ $t('phoneNumber') || 'Phone Number' }} *
          </div>
          <v-text-field
            v-model="phone.value.value"
            placeholder="0550 12 34 56"
            prefix="+213"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            color="#173F35"
            prepend-inner-icon="mdi-phone-outline"
            :error-messages="phone.errorMessage.value"
            hide-details="auto"
          />
        </div>

        <div class="mb-4">
          <v-checkbox v-model="checkbox" density="compact" color="#173F35" hide-details>
            <template #label>
              <span class="text-caption text-secondary-editorial">
                {{ $t('termsConditionsParagraph') || 'I agree to the' }}
                <router-link to="/terms&conditions" class="text-emerald font-weight-bold text-decoration-none">
                  {{ $t('termsConditions') || 'Terms & Conditions' }}
                </router-link>
              </span>
            </template>
          </v-checkbox>
        </div>

        <div class="mt-6 mb-4">
          <v-btn
            type="submit"
            block
            color="#173F35"
            size="large"
            rounded="pill"
            class="btn-editorial-primary font-weight-bold"
            :loading="loading"
          >
            {{ $t('next') || 'Continue Registration' }}
          </v-btn>
        </div>
      </form>

      <!-- Account Already Exists Dialog -->
      <v-dialog v-model="dialog" max-width="460">
        <v-card class="editorial-card pa-6">
          <v-card-title class="text-h6 font-weight-bold text-forest px-0">
            Account Already Exists
          </v-card-title>
          <v-card-text class="px-0 text-secondary-editorial text-body-2">
            An account with this phone number is already registered on Touriva. Would you like to sign in instead?
          </v-card-text>
          <v-card-actions class="px-0 pt-4 d-flex ga-2">
            <v-btn variant="outlined" rounded="pill" class="flex-grow-1" @click="close">
              Cancel
            </v-btn>
            <v-btn color="#173F35" class="btn-editorial-primary flex-grow-1 font-weight-bold" rounded="pill" @click="confirm">
              {{ $t('Login') || 'Sign In' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-divider class="my-6 border-subtle"></v-divider>

      <!-- Login Prompt -->
      <div class="text-center text-caption text-secondary-editorial">
        Already registered on Touriva?
        <router-link to="/login" class="text-emerald font-weight-bold text-decoration-none ml-1">
          {{ $t('Login') || 'Sign In' }}
        </router-link>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useField, useForm } from 'vee-validate'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const { handleSubmit } = useForm({
  validationSchema: {
    phone(value) {
      if (/^[0-9-]{9,10}$/.test(value)) return true
      return t('phoneNumberValidation') || 'Valid 9 or 10-digit phone number required'
    }
  }
})

const phone = useField('phone')
const auth = useAuthStore()
const router = useRouter()

const phoneNumber = ref('')
const err = ref('')
const dialog = ref(false)
const loading = ref(false)
const checkbox = ref(false)

const verifyPhone = async () => {
  try {
    phoneNumber.value = '+213' + phoneNumber.value
    await auth.account_verify_phone({  
      phonenumber: phoneNumber.value,
      channel: 'sms',
      role: 'partner' 
    })
  } catch (error) {
    err.value = error.response?.data?.error || error.message
    if (err.value === 'paiu') {
      dialog.value = true
    }
  }
  loading.value = false
}

const submit = handleSubmit(() => {
  if (checkbox.value === true) {
    loading.value = true
    phoneNumber.value = phone.value.value
    verifyPhone()
  } else {
    err.value = 'Please agree to the Terms & Conditions to proceed'
    setTimeout(() => {
      err.value = ''
    }, 5000)
  }
})

const close = () => {
  dialog.value = false
}

const confirm = () => {
  router.push('/login')
  dialog.value = false
}
</script>

<style scoped>
.auth-page {
  background-color: #FAF8F2;
}

.auth-card {
  background: #FFFFFF !important;
  border: 1px solid #E7E8E1 !important;
}

.border-subtle {
  border-color: #E7E8E1 !important;
}
</style>