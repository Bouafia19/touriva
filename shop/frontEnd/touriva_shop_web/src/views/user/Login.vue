<template>
  <div class="shop-auth-page bg-warm-ivory py-12 px-4 d-flex align-center justify-center">
    <v-card class="editorial-card auth-card pa-6 pa-sm-10 w-100">
      <!-- Header with Emblem -->
      <div class="text-center mb-6">
        <div class="auth-logo-emblem mx-auto mb-3">
          <img src="/logo.jpg" width="40" height="40" style="border-radius: 10px;" alt="Touriva" />
        </div>
        <div class="editorial-heading text-h5 font-weight-bold text-forest mb-1">
          Touriva Shop
        </div>
        <p class="text-body-2 text-secondary-editorial">
          {{ $t('logInParagraph') || 'Sign in to access your orders and profile' }}
        </p>
      </div>

      <!-- Try Touriva Marketplace — Demo Accounts Section -->
      <div class="demo-section pa-4 mb-6 rounded-lg border-subtle bg-sand-light">
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="d-flex align-center ga-2">
            <v-icon color="#173F35" size="20">mdi-account-group-outline</v-icon>
            <span class="text-caption font-weight-bold text-forest text-uppercase">
              Try Touriva Marketplace — Demo Accounts
            </span>
          </div>
          <v-chip size="x-small" color="#173F35" variant="flat" class="font-weight-bold text-white">
            DEMO ACCESS
          </v-chip>
        </div>
        <p class="text-caption text-secondary-editorial mb-3">
          Select an Algerian customer persona for instant 1-click marketplace exploration.
        </p>

        <!-- Demo Error Alert -->
        <v-alert
          v-if="demoErr"
          type="error"
          variant="tonal"
          rounded="lg"
          density="comfortable"
          class="mb-3 text-caption"
          closable
          @click:close="demoErr = ''"
        >
          {{ demoErr }}
        </v-alert>

        <div class="d-flex flex-column ga-2">
          <v-btn
            v-for="b in demoBuyers"
            :key="b.key"
            variant="flat"
            color="#FFFFFF"
            rounded="lg"
            class="text-none justify-start px-3 py-2 border-subtle demo-account-btn"
            elevation="0"
            :loading="demoLoadingKey === b.key"
            :disabled="loading || (demoLoadingKey !== null && demoLoadingKey !== b.key)"
            @click="quickDemoSignIn(b.key)"
          >
            <v-avatar size="28" :color="b.avatarColor" class="me-2 text-caption font-weight-bold text-white">
              {{ b.initials }}
            </v-avatar>
            <div class="text-left flex-grow-1">
              <div class="text-caption font-weight-bold text-forest line-height-tight">
                {{ b.name }}
              </div>
              <div class="text-caption text-secondary-editorial text-xs line-height-tight">
                {{ b.wilaya }} • {{ b.roleLabel }}
              </div>
            </div>
            <v-icon color="#C2A87E" size="18">mdi-arrow-right</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- Divider -->
      <div class="d-flex align-center my-5">
        <v-divider class="border-subtle"></v-divider>
        <span class="mx-3 text-caption text-secondary-editorial font-weight-medium text-center text-uppercase">
          Or sign in with phone
        </span>
        <v-divider class="border-subtle"></v-divider>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="submit">
        <div class="mb-4">
          <label class="editorial-tag text-sand-dark d-block mb-1">{{ $t('phoneNumber') }}</label>
          <v-text-field
            v-model="phone.value.value"
            placeholder="07 70 00 00 00"
            required
            variant="outlined"
            density="comfortable"
            color="forestGreen"
            append-inner-icon="mdi-backspace-outline"
            @click:append-inner="phone.value.value = null"
            :error-messages="phone.errorMessage.value"
            prefix="+213"
            type="number"
            rounded="lg"
            hide-details="auto"
          />
        </div>

        <div class="mb-3">
          <div class="d-flex justify-space-between align-center mb-1">
            <label class="editorial-tag text-sand-dark">{{ $t('password') }}</label>
            <router-link to="/checkPhone" class="text-caption text-forest font-weight-bold auth-link">
              {{ $t('forgotPassword') }}
            </router-link>
          </div>
          <v-text-field
            v-model="password"
            :append-inner-icon="show ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
            :type="show ? 'text' : 'password'"
            @click:append-inner="show = !show"
            placeholder="••••••••"
            required
            variant="outlined"
            density="comfortable"
            color="forestGreen"
            rounded="lg"
            hide-details="auto"
          />
        </div>

        <!-- Error Alert -->
        <v-alert
          v-if="err"
          type="error"
          variant="tonal"
          rounded="lg"
          density="comfortable"
          class="my-4 text-caption"
        >
          {{ $t(err) }}
        </v-alert>

        <!-- Submit Button -->
        <v-btn
          type="submit"
          block
          class="btn-editorial-primary mt-6 mb-3"
          size="large"
          :loading="loading"
        >
          {{ $t('Login') || 'Sign In' }}
          <v-icon end size="18">mdi-arrow-right</v-icon>
        </v-btn>

        <!-- Don't have an account -->
        <div class="text-center text-body-2 text-secondary-editorial mt-4">
          <span>Don't have an account? </span>
          <router-link to="/signup" class="text-forest font-weight-bold auth-link">
            {{ $t('SignUp') }}
          </router-link>
        </div>

        <v-divider class="my-6" />

        <!-- Seller Portal Link -->
        <div class="text-center">
          <v-btn
            variant="outlined"
            color="forestGreen"
            rounded="pill"
            block
            size="default"
            class="font-weight-bold"
            @click="goToSellerLogin"
          >
            <v-icon start size="18">mdi-storefront-outline</v-icon>
            {{ $t('SellerAccount') || 'Artisan & Seller Portal' }}
          </v-btn>
        </div>
      </form>
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
  const password = ref('')
  const show = ref(false)
  const loading = ref(false)
  const demoLoadingKey = ref(null)
  const demoErr = ref('')

  const demoBuyers = [
    { key: 'buyer1', name: 'Yasmine Benali', wilaya: 'Alger (16)', roleLabel: 'Customer Persona', initials: 'YB', avatarColor: '#173F35' },
    { key: 'buyer2', name: 'Rachid Khellaf', wilaya: 'Oran (31)', roleLabel: 'Customer Persona', initials: 'RK', avatarColor: '#21866B' },
    { key: 'buyer3', name: 'Amina Bouzid', wilaya: 'Constantine (25)', roleLabel: 'Customer Persona', initials: 'AB', avatarColor: '#102D27' },
    { key: 'buyer4', name: 'Sofiane Zerrouki', wilaya: 'Sétif (19)', roleLabel: 'Customer Persona', initials: 'SZ', avatarColor: '#B89564' },
    { key: 'buyer5', name: 'Nour El Houda Belkacem', wilaya: 'Annaba (23)', roleLabel: 'Customer Persona', initials: 'NB', avatarColor: '#D9943B' }
  ]

  const quickDemoSignIn = async (key) => {
    try {
      demoLoadingKey.value = key
      demoErr.value = ''
      await auth.demoSignIn(key)
    } catch (e) {
      demoErr.value = e.message || 'Demo login failed'
      setTimeout(() => { demoErr.value = '' }, 6000)
    } finally {
      demoLoadingKey.value = null
    }
  }

  const logIn = async () => {
    try {
      let phoneNum = '+213' + phoneNumber.value
      await auth.account_sign_in({
        phone: phoneNum,
        password: password.value,
        role: 'client'
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

  const goToSellerLogin = () => {
    window.open('https://seller.market.touriva.nextchallenge.tech/login', '_blank')
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

  .demo-section {
    background: #FAF8F2;
    border: 1px solid rgba(217, 185, 140, 0.4);
    box-shadow: 0 2px 8px rgba(23, 63, 53, 0.04);
  }

  .demo-account-btn {
    border: 1px solid rgba(23, 63, 53, 0.08) !important;
    transition: all 0.2s ease;
  }

  .demo-account-btn:hover {
    border-color: rgba(217, 185, 140, 0.8) !important;
    background-color: #FAF8F2 !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(23, 63, 53, 0.08);
  }

  .line-height-tight {
    line-height: 1.25;
  }
</style>