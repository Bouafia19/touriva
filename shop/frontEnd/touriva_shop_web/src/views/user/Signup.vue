<template>
  <div class="shop-auth-page bg-warm-ivory py-12 px-4 d-flex align-center justify-center">
    <v-card class="editorial-card auth-card pa-6 pa-sm-10 w-100">
      <!-- Header with Emblem -->
      <div class="text-center mb-6">
        <div class="auth-logo-emblem mx-auto mb-3">
          <v-icon color="sand" size="32">mdi-compass-rose</v-icon>
        </div>
        <div class="editorial-heading text-h5 font-weight-bold text-forest mb-1">
          Touriva Shop
        </div>
        <p class="text-body-2 text-secondary-editorial">
          {{ $t('signUpParagraph') || 'Enter your mobile number to create your account' }}
        </p>
      </div>

      <!-- Signup Form -->
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

        <!-- Terms Agreement Checkbox -->
        <div class="mb-4">
          <v-checkbox
            v-model="checkbox"
            color="forestGreen"
            density="compact"
            hide-details
          >
            <template #label>
              <span class="text-body-2 text-secondary-editorial">
                {{ $t('termsConditionsParagraph') }}
                <router-link to="/terms&conditions" class="text-forest font-weight-bold auth-link">
                  {{ $t('termsConditions') }}
                </router-link>
              </span>
            </template>
          </v-checkbox>
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
          {{ $t(err) }}
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

        <!-- Existing Account Prompt -->
        <div class="text-center text-body-2 text-secondary-editorial mt-4">
          <span>Already registered? </span>
          <router-link to="/login" class="text-forest font-weight-bold auth-link">
            {{ $t('Login') }}
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
            Confirm Mobile Number
          </h3>
          <p class="text-body-1 text-forest font-weight-bold mb-4">
            {{ phoneNumber }}
          </p>
          <p class="text-body-2 text-secondary-editorial mb-6">
            A 6-digit verification code will be sent to this number. Please ensure it is accurate.
          </p>
          <div class="d-flex ga-3">
            <v-btn
              variant="outlined"
              color="forestGreen"
              rounded="pill"
              class="flex-grow-1"
              @click="closeDialog"
            >
              {{ $t('cancel') || 'Cancel' }}
            </v-btn>
            <v-btn
              class="btn-editorial-primary flex-grow-1"
              @click="confirmDialog"
            >
              {{ $t('next') || 'Confirm' }}
            </v-btn>
          </div>
        </v-card>
      </v-dialog>

      <!-- Phone Already In Use (paiu) Dialog -->
      <v-dialog v-model="dialog" max-width="460">
        <v-card class="editorial-card pa-6 text-center">
          <v-avatar color="sandLight" size="56" class="mx-auto mb-3">
            <v-icon color="warning" size="28">mdi-account-alert</v-icon>
          </v-avatar>
          <h3 class="editorial-heading text-h6 font-weight-bold text-forest mb-2">
            {{ $t('paiu') || 'Phone Already Registered' }}
          </h3>
          <p class="text-body-2 text-secondary-editorial mb-6">
            This phone number is already associated with an account. Please sign in to continue shopping.
          </p>
          <div class="d-flex ga-3">
            <v-btn
              variant="outlined"
              color="forestGreen"
              rounded="pill"
              class="flex-grow-1"
              @click="close"
            >
              {{ $t('close') }}
            </v-btn>
            <v-btn
              class="btn-editorial-primary flex-grow-1"
              @click="confirm"
            >
              {{ $t('Login') }}
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
  import { useRouter } from 'vue-router'
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
  const router = useRouter()

  const phoneNumber = ref('')
  const err = ref('')
  const dialog = ref(false)
  const dialogConfirme = ref(false)
  const loading = ref(false)
  const checkbox = ref(false)

  const verifyPhone = async () => {
    try {
      await auth.account_verify_phone({
        phonenumber: phoneNumber.value,
        channel: 'sms',
        role: 'client'
      })
    } catch (error) {
      err.value = error.response?.data?.error || error.message
      if (err.value === 'paiu') {
        dialog.value = true
      }
      console.log('error phone number', err.value)
    }
    loading.value = false
  }

  const submit = handleSubmit(() => {
    if (checkbox.value === true) {
      loading.value = true
      phoneNumber.value = '+213' + phone.value.value
      verifyPhone()
    } else {
      err.value = 'must agree to terms'
      setTimeout(() => {
        err.value = ''
      }, 5000)
    }
  })

  const clear = () => {
    phone.value.value = ''
    phoneNumber.value = ''
  }

  const close = () => {
    dialog.value = false
  }

  const confirm = () => {
    router.push('/login')
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