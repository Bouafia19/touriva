<template>
  <div class="shop-auth-page bg-warm-ivory py-12 px-4 d-flex align-center justify-center">
    <v-card class="editorial-card auth-card pa-6 pa-sm-10 w-100">
      <!-- Header with Emblem -->
      <div class="text-center mb-6">
        <div class="auth-logo-emblem mx-auto mb-3">
          <v-icon color="sand" size="32">mdi-lock-reset</v-icon>
        </div>
        <div class="editorial-heading text-h5 font-weight-bold text-forest mb-1">
          {{ $t('forgotPassword') || 'Password Recovery' }}
        </div>
        <p class="text-body-2 text-secondary-editorial">
          Enter your registered phone number to receive a verification code.
        </p>
      </div>

      <!-- Recovery Form -->
      <form @submit.prevent="submit">
        <div class="mb-4">
          <label class="editorial-tag text-sand-dark d-block mb-1">{{ $t('phoneNumber') }}</label>
          <v-text-field
            v-model="phone.value.value"
            placeholder="07 70 00 00 00"
            type="number"
            required
            variant="outlined"
            density="comfortable"
            color="forestGreen"
            append-inner-icon="mdi-backspace-outline"
            @click:append-inner="clear"
            :error-messages="phone.errorMessage.value"
            prefix="+213"
            rounded="lg"
            hide-details="auto"
          />
        </div>

        <!-- Error Alert -->
        <v-alert
          v-if="err && err !== 'paiu'"
          type="error"
          variant="tonal"
          rounded="lg"
          density="comfortable"
          class="mb-4 text-caption"
        >
          {{ typeof err === 'string' ? $t(err) : 'Error verifying phone number' }}
        </v-alert>

        <!-- Submit Button -->
        <v-btn
          type="submit"
          block
          class="btn-editorial-primary mt-4 mb-3"
          size="large"
          :loading="loading"
        >
          {{ $t('next') }}
          <v-icon end size="18">mdi-arrow-right</v-icon>
        </v-btn>

        <!-- Return to Login -->
        <div class="text-center text-body-2 text-secondary-editorial mt-4">
          <router-link to="/login" class="text-forest font-weight-bold auth-link">
            Return to Login
          </router-link>
        </div>
      </form>

      <!-- Confirmation Dialog -->
      <v-dialog v-model="dialogConfirme" max-width="460">
        <v-card class="editorial-card pa-6 text-center">
          <v-avatar color="sandLight" size="56" class="mx-auto mb-3">
            <v-icon color="deepGreen" size="28">mdi-cellphone-check</v-icon>
          </v-avatar>
          <h3 class="editorial-heading text-h6 font-weight-bold text-forest mb-2">
            Confirm Number
          </h3>
          <p class="text-body-1 text-forest font-weight-bold mb-4">
            {{ phoneNumber }}
          </p>
          <div class="d-flex ga-3">
            <v-btn
              variant="outlined"
              color="forestGreen"
              rounded="pill"
              class="flex-grow-1"
              @click="closeDialog"
            >
              Cancel
            </v-btn>
            <v-btn
              class="btn-editorial-primary flex-grow-1"
              @click="confirmDialog"
            >
              Confirm
            </v-btn>
          </div>
        </v-card>
      </v-dialog>

      <!-- Number not found / Alert Dialog -->
      <v-dialog v-model="dialog" max-width="460">
        <v-card class="editorial-card pa-6 text-center">
          <v-avatar color="sandLight" size="56" class="mx-auto mb-3">
            <v-icon color="warning" size="28">mdi-alert-circle-outline</v-icon>
          </v-avatar>
          <h3 class="editorial-heading text-h6 font-weight-bold text-forest mb-2">
            Account Not Found
          </h3>
          <p class="text-body-2 text-secondary-editorial mb-6">
            We could not locate an account associated with this phone number.
          </p>
          <div class="d-flex ga-3">
            <v-btn
              variant="outlined"
              color="forestGreen"
              rounded="pill"
              class="flex-grow-1"
              @click="close"
            >
              Try Again
            </v-btn>
            <v-btn
              class="btn-editorial-primary flex-grow-1"
              @click="$router.push('/signup')"
            >
              Sign Up
            </v-btn>
          </div>
        </v-card>
      </v-dialog>
    </v-card>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  import { useField, useForm } from 'vee-validate'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  const { handleSubmit } = useForm({
    validationSchema: {
      phone (value) {
        if (/^[0-9-]{9,10}$/.test(value)) return true
        return t('phoneNumberValidation')
      }
    },
  })

  const phone = useField('phone')
  const auth = useAuthStore()

  const phoneNumber = ref('')
  const err = ref('')
  const dialog = ref(false)
  const dialogConfirme = ref(false)
  const loading = ref(false)

  const verifyPhone = async () => {
    try {
      await auth.account_verify_phone({
        phonenumber: phone.value.value,
        channel: 'sms',
        role: 'client'
      })
    } catch (error) {
      err.value = error.response?.data?.error || error.message
      if (err.value === 'paiu') {
        dialog.value = true
      }
    }
    loading.value = false
  }

  const checkPhone = async () => {
    try {
      await auth.checkPhone({
        phonenumber: phoneNumber.value,
        role: 'client'
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
    phoneNumber.value = phone.value.value
    loading.value = true
    phoneNumber.value = '+213' + phoneNumber.value
    checkPhone()
  })

  const clear = () => {
    phone.value.value = ''
  }

  const close = () => {
    dialog.value = false
  }

  const closeDialog = () => {
    dialogConfirme.value = false
  }

  const confirmDialog = () => {
    verifyPhone()
    dialogConfirme.value = false
  }
</script>

<style scoped>
  .shop-auth-page {
    min-height: calc(100vh - 120px);
  }

  .auth-card {
    max-width: 440px;
  }

  .auth-logo-emblem {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 16px;
    background: var(--color-forest-green);
    border: 1.5px solid var(--color-sand);
    box-shadow: 0 4px 14px rgba(23, 63, 53, 0.2);
  }

  .auth-link {
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .auth-link:hover {
    color: var(--color-sand-dark) !important;
    text-decoration: underline;
  }
</style>