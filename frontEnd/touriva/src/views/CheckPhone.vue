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
        <div class="editorial-tag text-sand mb-1">PASSWORD RECOVERY</div>
        <h2 class="text-h5 font-serif font-weight-bold text-forest">
          {{ $t('forgotPassword') || 'Reset Your Password' }}
        </h2>
        <p class="text-caption text-secondary-editorial mt-1">
          Enter your registered phone number to verify your account and receive recovery instructions.
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

      <!-- Form -->
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
            append-inner-icon="mdi-backspace-outline"
            @click:append-inner="clear"
            :error-messages="phone.errorMessage.value"
            hide-details="auto"
          />
        </div>

        <div class="mt-6 mb-4">
          <v-btn
            type="submit"
            block
            color="#173F35"
            size="large"
            rounded="pill"
            class="btn-editorial-primary font-weight-bold"
            :loading="auth.getLoading"
          >
            {{ $t('next') || 'Continue' }}
          </v-btn>
        </div>
      </form>

      <!-- Confirmation Dialog -->
      <v-dialog v-model="dialogConfirme" max-width="460">
        <v-card class="editorial-card pa-6">
          <v-card-title class="text-h6 font-weight-bold text-forest px-0">
            Confirm Phone Number
          </v-card-title>
          <v-card-text class="px-0 text-secondary-editorial text-body-2">
            Is <strong>{{ phoneNumber }}</strong> your correct phone number? A verification code will be sent to this number.
          </v-card-text>
          <v-card-actions class="px-0 pt-4 d-flex ga-2">
            <v-btn variant="outlined" rounded="pill" class="flex-grow-1" @click="closeDialog">
              {{ $t('cancel') || 'Cancel' }}
            </v-btn>
            <v-btn
              color="#173F35"
              class="btn-editorial-primary flex-grow-1 font-weight-bold"
              rounded="pill"
              @click="confirmDialog"
            >
              {{ $t('confirm') || 'Confirm' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Phone Already In Use Dialog -->
      <v-dialog v-model="dialog" max-width="460">
        <v-card class="editorial-card pa-6">
          <v-card-title class="text-h6 font-weight-bold text-forest px-0">
            Existing Account Found
          </v-card-title>
          <v-card-text class="px-0 text-secondary-editorial text-body-2">
            An account with this phone number is registered on Touriva. Would you like to proceed with login?
          </v-card-text>
          <v-card-actions class="px-0 pt-4 d-flex ga-2">
            <v-btn variant="outlined" rounded="pill" class="flex-grow-1" @click="close">
              {{ $t('cancel') || 'Cancel' }}
            </v-btn>
            <v-btn
              color="#173F35"
              class="btn-editorial-primary flex-grow-1 font-weight-bold"
              rounded="pill"
              @click="confirm"
            >
              {{ $t('Login') || 'Sign In' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-divider class="my-6 border-subtle"></v-divider>

      <!-- Return to Login -->
      <div class="text-center text-caption text-secondary-editorial">
        Remember your password?
        <router-link to="/login" class="text-emerald font-weight-bold text-decoration-none ml-1">
          {{ $t('Login') || 'Back to Sign In' }}
        </router-link>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useField, useForm } from 'vee-validate'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const { handleSubmit } = useForm({
  validationSchema: {
    phone(value) {
      if (/^[0-9-]{9,10}$/.test(value)) return true
      return t('phoneNumberValidation') || 'Valid 9 or 10-digit phone number required'
    }
  }
})

const phone = useField('phone')

const phoneNumber = ref('')
const err = ref('')
const dialog = ref(false)
const dialogConfirme = ref(false)

const verifyPhone = async () => {
  try {
    await auth.account_verify_phone({
      phonenumber: phoneNumber.value,
      channel: 'sms',
      role: 'partner'
    })
    router.push({
      name: 'CodeVerification',
      params: { phonenumber: phoneNumber.value }
    })
  } catch (error) {
    err.value = error.response?.data?.error || error.message
    if (err.value === 'paiu') {
      dialog.value = true
    }
  }
}

const checkPhone = async () => {
  err.value = null
  try {
    await auth.checkPhone({
      phonenumber: phoneNumber.value,
      role: 'partner'
    })
    dialogConfirme.value = true
  } catch (error) {
    err.value = error.response?.data?.error || error.message || error
    if (err.value === 'paiu') {
      dialog.value = true
    }
  }
}

const submit = handleSubmit(() => {
  auth.loading = true
  phoneNumber.value = '+213' + phone.value.value
  checkPhone()
})

const clear = () => {
  phone.value.value = ''
}

const close = () => {
  dialog.value = false
}

const confirm = async () => {
  dialog.value = false
  router.push('/login')
}

const closeDialog = () => {
  dialogConfirme.value = false
}

const confirmDialog = () => {
  dialogConfirme.value = false
  verifyPhone()
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