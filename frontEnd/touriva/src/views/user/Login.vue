<template>
  <div class="auth-page bg-warm-ivory min-vh-100 d-flex align-center justify-center py-12 px-4">
    <v-card class="editorial-card auth-card pa-8 pa-md-10" width="100%" max-width="460" elevation="0">
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
        <div class="editorial-tag text-sand mb-1">TRAVELER & PARTNER ACCESS</div>
        <h2 class="text-h5 font-serif font-weight-bold text-forest">
          Welcome to Touriva
        </h2>
        <p class="text-caption text-secondary-editorial mt-1">
          Sign in to access your travel reservations and custom itineraries.
        </p>
      </div>

      <!-- Error Alert -->
      <v-alert
        v-if="err"
        type="error"
        variant="tonal"
        density="comfortable"
        class="mb-6 rounded-lg"
      >
        {{ $t(err) || err }}
      </v-alert>

      <!-- Login Form -->
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

        <div class="mb-2">
          <div class="d-flex justify-space-between align-center mb-1">
            <span class="text-caption font-weight-bold text-forest">
              {{ $t('password') || 'Password' }} *
            </span>
            <router-link to="/checkPhone" class="text-caption text-emerald font-weight-medium text-decoration-none">
              {{ $t('forgotPassword') || 'Forgot password?' }}
            </router-link>
          </div>
          <v-text-field
            v-model="password"
            :type="show ? 'text' : 'password'"
            placeholder="Enter your password"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            color="#173F35"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="show ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            @click:append-inner="show = !show"
            hide-details
            required
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
            :loading="loading"
          >
            {{ $t('Login') || 'Sign In' }}
          </v-btn>
        </div>
      </form>

      <v-divider class="my-6 border-subtle"></v-divider>

      <!-- Sign Up Prompt -->
      <div class="text-center text-caption text-secondary-editorial">
        Don’t have a Touriva account?
        <router-link to="/signup" class="text-emerald font-weight-bold text-decoration-none ml-1">
          {{ $t('SignUp') || 'Create Account' }}
        </router-link>
      </div>
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
    phone(value) {
      if (/^[0-9-]{9,10}$/.test(value)) return true
      return t('phoneNumberValidation') || 'Valid 9 or 10-digit phone number required'
    }
  }
})

const phone = useField('phone')
const auth = useAuthStore()

const phoneNumber = ref('')
const err = ref('')
const password = ref('')
const show = ref(false)
const loading = ref(false)

const logIn = async () => {
  try {
    let phoneNum = '+213' + phoneNumber.value
    await auth.account_sign_in({  
      phone: phoneNum,
      password: password.value,
      role: 'partner'
    })
  } catch (error) {
    err.value = error.message
    setTimeout(() => {
      err.value = ''
      clear()
    }, 5000)
  }
  loading.value = false
}

const submit = handleSubmit(() => {
  phoneNumber.value = phone.value.value
  loading.value = true
  logIn()
})

const clear = () => {
  phone.value.value = ''
  password.value = ''
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