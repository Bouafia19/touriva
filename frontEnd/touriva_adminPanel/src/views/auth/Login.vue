<template>
  <div class="login-wrapper d-flex align-center justify-center pa-4">
    <div class="login-container">
      <v-card class="editorial-card pa-6 pa-sm-8 elevation-2">
        <!-- Logo & Branding Header -->
        <div class="text-center mb-5">
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

        <!-- Demo Administrator Account Section -->
        <div class="demo-admin-card pa-3 mb-4 rounded-lg bg-sand-light border-subtle">
          <div class="d-flex align-center justify-space-between mb-1">
            <div class="d-flex align-center ga-2">
              <v-icon color="#173F35" size="18">mdi-shield-crown-outline</v-icon>
              <span class="text-caption font-weight-bold text-forest">
                {{ $t('demoAdminTitle') }}
              </span>
            </div>
            <v-chip size="x-small" color="#173F35" variant="flat" class="font-weight-bold text-sand">
              {{ $t('demoAdminBadge') }}
            </v-chip>
          </div>
          <p class="text-caption text-secondary-editorial mb-2" style="font-size: 0.75rem; line-height: 1.3;">
            {{ $t('demoAdminSubtitle') }}
          </p>
          <v-btn
            variant="flat"
            color="#FFFFFF"
            rounded="pill"
            size="small"
            class="text-none w-100 border-subtle font-weight-bold text-forest demo-btn"
            elevation="0"
            @click="selectDemoAdmin"
          >
            <v-icon start size="16" color="#173F35">mdi-account-check-outline</v-icon>
            {{ $t('demoAdminSelect') }}
          </v-btn>
        </div>

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

const selectDemoAdmin = () => {
  email.value = 'demo.admin@touriva.test'
}

const logIn = async () => {
  try {
    await auth.account_sign_in({
      email: email.value.trim().toLowerCase(),
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

.bg-sand-light {
  background-color: #F8F5EE;
}

.demo-admin-card {
  border: 1px dashed #D9B98C;
}

.border-subtle {
  border: 1px solid #E7E8E1 !important;
}

.demo-btn:hover {
  background-color: #FAF8F2 !important;
  border-color: #173F35 !important;
}
</style>
