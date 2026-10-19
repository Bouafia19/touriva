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
          {{ $t('logInParagraph') || 'Sign in to access your orders and profile' }}
        </p>
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
    window.open('http://localhost:2024/login', '_blank')
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