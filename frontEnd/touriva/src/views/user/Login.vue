<template>
  <div class="auth-page bg-warm-ivory min-vh-100 d-flex align-center justify-center py-12 px-4">
    <v-card class="editorial-card auth-card pa-8 pa-md-10" width="100%" max-width="480" elevation="0">
      <!-- Brand Header -->
      <div class="text-center mb-6">
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

      <!-- Demo Accounts Section -->
      <div class="demo-section pa-4 mb-6 rounded-lg border-subtle bg-sand-light">
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="d-flex align-center ga-2">
            <v-icon color="#173F35" size="20">mdi-shield-account-outline</v-icon>
            <span class="text-caption font-weight-bold text-forest text-uppercase">
              {{ $t('demoAccounts') }}
            </span>
          </div>
          <v-chip size="x-small" color="#173F35" variant="flat" class="font-weight-bold text-sand">
            DEMO ACCESS
          </v-chip>
        </div>
        <p class="text-caption text-secondary-editorial mb-3">
          {{ $t('demoExploreSubtitle') }}
        </p>

        <div class="d-flex flex-column ga-2">
          <!-- Customer Demo Option -->
          <v-btn
            variant="flat"
            color="#FFFFFF"
            rounded="lg"
            class="text-none justify-start px-3 py-2 border-subtle demo-btn"
            elevation="0"
            :loading="demoLoadingRole === 'customer'"
            :disabled="loading || (demoLoadingRole !== null && demoLoadingRole !== 'customer')"
            @click="quickDemoSignIn('customer')"
          >
            <v-icon color="#173F35" start size="22">mdi-account-compass-outline</v-icon>
            <div class="text-left flex-grow-1">
              <div class="text-caption font-weight-bold text-forest">{{ $t('demoTouristTitle') }}</div>
              <div class="text-caption text-secondary-editorial text-xs">demo.customer@touriva.test</div>
            </div>
            <v-icon color="#C2A87E" size="18">mdi-arrow-right</v-icon>
          </v-btn>

          <!-- Agency Director Demo Option -->
          <v-btn
            variant="flat"
            color="#FFFFFF"
            rounded="lg"
            class="text-none justify-start px-3 py-2 border-subtle demo-btn"
            elevation="0"
            :loading="demoLoadingRole === 'agency'"
            :disabled="loading || (demoLoadingRole !== null && demoLoadingRole !== 'agency')"
            @click="quickDemoSignIn('agency')"
          >
            <v-icon color="#173F35" start size="22">mdi-office-building-outline</v-icon>
            <div class="text-left flex-grow-1">
              <div class="text-caption font-weight-bold text-forest">{{ $t('demoAgencyTitle') }}</div>
              <div class="text-caption text-secondary-editorial text-xs">demo.agency@touriva.test</div>
            </div>
            <v-icon color="#C2A87E" size="18">mdi-arrow-right</v-icon>
          </v-btn>
        </div>
      </div>

      <div class="d-flex align-center my-4">
        <v-divider class="border-subtle"></v-divider>
        <span class="mx-3 text-caption text-secondary-editorial font-weight-medium text-center">
          {{ $t('orSignInWith') }}
        </span>
        <v-divider class="border-subtle"></v-divider>
      </div>

      <!-- Login Form (Phone or Email) -->
      <form @submit.prevent="submit">
        <div class="mb-4">
          <div class="text-caption font-weight-bold text-forest mb-1">
            {{ $t('phoneOrEmail') }} *
          </div>
          <v-text-field
            v-model="identifier.value.value"
            placeholder="0550 12 34 56 or demo.customer@touriva.test"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            color="#173F35"
            prepend-inner-icon="mdi-account-outline"
            :error-messages="identifier.errorMessage.value"
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
            :disabled="demoLoadingRole !== null"
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
const auth = useAuthStore()

const { handleSubmit } = useForm({
  validationSchema: {
    identifier(value) {
      if (!value) return t('phoneOrEmailValidation') || 'Valid phone number or email required'
      const trimmed = String(value).trim()
      // Check if email format
      if (trimmed.includes('@')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (emailRegex.test(trimmed)) return true
        return t('phoneOrEmailValidation') || 'Please enter a valid email address'
      }
      // Check phone format
      const cleaned = trimmed.replace(/[\s\-\(\)\.]/g, '')
      if (/^(\+213|00213|0)?[567]\d{8}$/.test(cleaned) || /^[0-9]{9,10}$/.test(cleaned)) return true
      return t('phoneOrEmailValidation') || 'Valid 9 or 10-digit phone number or email required'
    }
  }
})

const identifier = useField('identifier')

const err = ref('')
const password = ref('')
const show = ref(false)
const loading = ref(false)
const demoLoadingRole = ref(null)

const quickDemoSignIn = async (role) => {
  try {
    demoLoadingRole.value = role
    err.value = ''
    await auth.demoSignIn(role)
  } catch (error) {
    err.value = error.message || 'Demo login failed'
    setTimeout(() => {
      err.value = ''
    }, 6000)
  } finally {
    demoLoadingRole.value = null
  }
}

const logIn = async () => {
  try {
    loading.value = true
    err.value = ''

    const raw = String(identifier.value.value || '').trim()
    let payload = { password: password.value }

    if (raw.includes('@')) {
      // Email authentication
      payload.email = raw.toLowerCase()
    } else {
      // Phone authentication
      let cleaned = raw.replace(/[\s\-\(\)\.]/g, '')
      if (cleaned.startsWith('+213')) {
        cleaned = cleaned.slice(4)
      } else if (cleaned.startsWith('00213')) {
        cleaned = cleaned.slice(5)
      }
      if (cleaned.startsWith('0')) {
        cleaned = cleaned.slice(1)
      }
      payload.phone = `+213${cleaned}`
    }

    await auth.account_sign_in(payload)
  } catch (error) {
    const errorMsg = error.message || ''
    if (errorMsg === 'ip' || errorMsg === 'ie') {
      err.value = t('ip') || 'Account not found. Please check phone number or email.'
    } else if (errorMsg === 'ipass') {
      err.value = t('ipass') || 'Incorrect password'
    } else if (errorMsg === 'All field must be filled') {
      err.value = t('allFieldsRequired') || 'All fields must be filled'
    } else {
      err.value = errorMsg
    }
    setTimeout(() => {
      err.value = ''
    }, 6000)
  } finally {
    loading.value = false
  }
}

const submit = handleSubmit(() => {
  logIn()
})
</script>

<style scoped>
.auth-page {
  background-color: #FAF8F2;
}

.auth-card {
  background: #FFFFFF !important;
  border: 1px solid #E7E8E1 !important;
}

.bg-sand-light {
  background-color: #F8F5EE;
}

.border-subtle {
  border-color: #E7E8E1 !important;
}

.demo-section {
  border: 1px dashed #D9B98C;
}

.demo-btn {
  border: 1px solid #E7E8E1 !important;
  transition: all 0.2s ease;
}

.demo-btn:hover {
  border-color: #173F35 !important;
  background-color: #FAF8F2 !important;
}

.text-xs {
  font-size: 0.725rem !important;
}
</style>
