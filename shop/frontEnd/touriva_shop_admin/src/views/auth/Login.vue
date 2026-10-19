<template>
  <div class="editorial-login-wrapper">
    <div class="editorial-login-container">
      <v-card class="editorial-auth-card">
        <v-row no-gutters class="fill-height">
          <!-- Left Brand Hero Panel -->
          <v-col cols="12" md="5" class="auth-hero-panel d-flex flex-column justify-space-between pa-8 pa-lg-10">
            <div>
              <div class="d-flex align-center gap-3 mb-6">
                <div class="brand-monogram">T</div>
                <div>
                  <div class="hero-brand-name font-serif">TOU<span>RIVA</span></div>
                  <div class="hero-brand-badge">SHOP ADMIN</div>
                </div>
              </div>
              <h2 class="hero-headline font-serif">Curated travel commerce, crafted for luxury journeys.</h2>
              <p class="hero-description mt-3">Comprehensive merchant catalog, order fulfillment, and partner ecosystem management.</p>
            </div>

            <div class="hero-footer pt-6 border-t">
              <div class="d-flex align-center gap-2">
                <v-icon icon="mdi-shield-check" color="sand" size="18"></v-icon>
                <span class="text-caption text-sand-light font-weight-medium">Enterprise Security & Compliance</span>
              </div>
            </div>
          </v-col>

          <!-- Right Login Form Panel -->
          <v-col cols="12" md="7" class="auth-form-panel pa-8 pa-lg-12 d-flex flex-column justify-center">
            <div class="mb-6">
              <span class="editorial-tag">Authentication</span>
              <h1 class="auth-title font-serif mt-1">Welcome Back</h1>
              <p class="auth-subtitle">Enter your administrative credentials to access the commerce portal.</p>
            </div>

            <!-- Error Banner -->
            <v-alert
              v-if="err"
              type="error"
              variant="tonal"
              closable
              class="mb-4 rounded-lg"
              @click:close="err = ''"
            >
              {{ $t(err) || err }}
            </v-alert>

            <form @submit.prevent="submit">
              <!-- Email Input -->
              <div class="mb-4">
                <label class="input-label">Email Address</label>
                <v-text-field
                  v-model="email"
                  placeholder="admin@touriva.com"
                  type="email"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-email-outline"
                  class="editorial-input"
                  required
                ></v-text-field>
              </div>

              <!-- Password Input -->
              <div class="mb-5">
                <div class="d-flex justify-space-between align-center mb-1">
                  <label class="input-label mb-0">Password</label>
                </div>
                <v-text-field
                  v-model="password"
                  :type="show ? 'text' : 'password'"
                  placeholder="••••••••••••"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-lock-outline"
                  :append-inner-icon="show ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                  @click:append-inner="show = !show"
                  class="editorial-input"
                  required
                ></v-text-field>
              </div>

              <!-- Submit Button -->
              <v-btn
                type="submit"
                class="btn-editorial-primary w-100 py-3"
                size="large"
                :loading="loading"
                block
              >
                Sign In to Admin Portal
              </v-btn>
            </form>

            <div class="text-center mt-8">
              <span class="text-caption text-editorial-secondary">
                Protected by Touriva Commerce Platform &copy; 2026
              </span>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const email = ref('')
const password = ref('')
const show = ref(false)
const loading = ref(false)
const err = ref('')

const logIn = async () => {
  try {
    await auth.account_sign_in({
      email: email.value,
      password: password.value,
      role: 'administrator'
    })
  } catch (error) {
    err.value = error.message || 'Authentication failed'
    console.error('Login error:', error.message)
  } finally {
    loading.value = false
  }
}

const submit = () => {
  loading.value = true
  err.value = ''
  logIn()
}
</script>

<style scoped>
.editorial-login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-warm-ivory);
  padding: 24px 16px;
}

.editorial-login-container {
  width: 100%;
  max-width: 960px;
}

.editorial-auth-card {
  background: #FFFFFF !important;
  border: 1px solid var(--color-border) !important;
  border-radius: 24px !important;
  overflow: hidden !important;
  box-shadow: 0 16px 40px -8px rgba(16, 45, 39, 0.12) !important;
}

.auth-hero-panel {
  background-color: #102D27;
  color: #FFFFFF;
  position: relative;
}

.brand-monogram {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #D9B98C, #B89564);
  color: #102D27;
  font-family: var(--font-serif);
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-brand-name {
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #FAF8F2;
  line-height: 1.1;
}

.hero-brand-name span {
  color: #D9B98C;
}

.hero-brand-badge {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #D9B98C;
  text-transform: uppercase;
}

.hero-headline {
  font-size: 1.55rem;
  font-weight: 600;
  color: #FAF8F2;
  line-height: 1.35;
}

.hero-description {
  font-size: 0.88rem;
  color: #CFD8D5;
  line-height: 1.6;
}

.hero-footer {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.auth-form-panel {
  background-color: #FFFFFF;
}

.auth-title {
  font-size: 1.85rem;
  font-weight: 600;
  color: var(--color-deep-green);
  line-height: 1.25;
}

.auth-subtitle {
  font-size: 0.88rem;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.input-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-deep-green);
  margin-bottom: 6px;
}
</style>