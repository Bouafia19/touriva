<template>
  <div class="login-wrapper d-flex align-center justify-center pa-4">
    <div class="login-container">
      <v-card class="editorial-card pa-6 pa-sm-8 elevation-2">
        <!-- Logo & Branding Header -->
        <div class="text-center mb-6">
          <v-avatar size="56" color="deepGreen" class="elevation-2 mb-3">
            <v-icon icon="mdi-compass" color="sand" size="32"></v-icon>
          </v-avatar>
          <div class="font-serif brand-title text-h4 font-weight-bold text-forest">
            TOU<span class="text-sand-dark">RIVA</span>
          </div>
          <div class="editorial-tag text-sand-dark mt-1">
            {{ $t('AdminPortal') }}
          </div>
          <p class="text-caption text-secondary-editorial mt-2 mb-0">
            {{ $t('logInParagraph') }} — Sign in to platform control center
          </p>
        </div>

        <!-- Error Alert -->
        <v-alert
          v-if="err"
          type="error"
          variant="tonal"
          density="comfortable"
          closable
          class="mb-4 rounded-lg text-caption"
          @click:close="err = ''"
        >
          {{ $t(err) }}
        </v-alert>

        <!-- Login Form -->
        <form @submit.prevent="submit" class="login-form">
          <div class="mb-3">
            <v-text-field
              v-model="email"
              :label="$t('Email')"
              prepend-inner-icon="mdi-email-outline"
              type="email"
              variant="outlined"
              color="primary"
              density="comfortable"
              rounded="pill"
              required
              hide-details="auto"
              class="mb-3"
            ></v-text-field>
          </div>

          <div class="mb-4">
            <v-text-field
              v-model="password"
              :label="$t('Password')"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="show ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              :type="show ? 'text' : 'password'"
              @click:append-inner="show = !show"
              variant="outlined"
              color="primary"
              density="comfortable"
              rounded="pill"
              required
              hide-details="auto"
            ></v-text-field>
          </div>

          <v-btn
            type="submit"
            block
            class="btn-editorial-primary py-3 mb-4"
            size="large"
            rounded="pill"
            :loading="loading"
          >
            {{ $t('Login') }}
          </v-btn>
        </form>

        <div class="text-center pt-2 border-top">
          <span class="text-caption text-secondary-editorial">
            Touriva Platform &copy; 2026 • Editorial Travel & Tourism
          </span>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const email = ref('')
const err = ref('')
const password = ref('')
const show = ref(false)
const loading = ref(false)

const logIn = async () => {
  try {
    await auth.account_sign_in({
      email: email.value,
      password: password.value,
      role: 'administrator'
    })
  } catch (error) {
    err.value = error.message || 'Authentication failed'
    console.error('error email', error.message)
  } finally {
    loading.value = false
  }
}

const submit = () => {
  loading.value = true
  logIn()
}
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  background-color: var(--color-warm-ivory);
  background-image: radial-gradient(circle at 10% 20%, rgba(217, 185, 140, 0.15) 0%, transparent 40%),
                    radial-gradient(circle at 90% 80%, rgba(23, 63, 53, 0.08) 0%, transparent 40%);
}

.login-container {
  width: 100%;
  max-width: 440px;
}

.brand-title {
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.border-top {
  border-top: 1px solid var(--color-border);
}
</style>