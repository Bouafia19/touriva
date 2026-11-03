<template>
  <div class="editorial-login-wrapper">
    <div class="editorial-login-container">
      <v-card class="editorial-auth-card">
        <v-row no-gutters class="fill-height">
          <!-- Left Brand Hero Panel -->
          <v-col cols="12" md="5" class="auth-hero-panel d-flex flex-column justify-space-between pa-8 pa-lg-10">
            <div>
              <div class="d-flex align-center gap-3 mb-6">
                <div class="brand-monogram">
                  <v-icon color="sand" size="26">mdi-compass-rose</v-icon>
                </div>
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
            <div class="mb-5">
              <span class="editorial-tag">Authentication</span>
              <h1 class="auth-title font-serif mt-1">Welcome Back</h1>
              <p class="auth-subtitle">Enter your administrative credentials to access the commerce portal.</p>
            </div>

            <!-- Marketplace Administration — Demo Access -->
            <div class="demo-section pa-4 mb-5 rounded-lg border-subtle bg-sand-light">
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="d-flex align-center ga-2">
                  <v-icon color="#173F35" size="20">mdi-shield-crown-outline</v-icon>
                  <span class="text-caption font-weight-bold text-forest text-uppercase">
                    Marketplace Administration — Demo Access
                  </span>
                </div>
                <v-chip size="x-small" color="#173F35" variant="flat" class="font-weight-bold text-white">
                  GOVERNANCE DEMO
                </v-chip>
              </div>
              <p class="text-caption text-secondary-editorial mb-3">
                Experience owner controls, seller approvals, product moderation queues, and live GMV analytics.
              </p>

              <!-- Demo Error Banner -->
              <v-alert
                v-if="demoErr"
                type="error"
                variant="tonal"
                closable
                class="mb-3 rounded-lg text-caption"
                @click:close="demoErr = ''"
              >
                {{ demoErr }}
              </v-alert>

              <v-btn
                variant="flat"
                color="#FFFFFF"
                rounded="lg"
                class="text-none justify-start px-3 py-3 border-subtle demo-admin-btn w-100"
                elevation="0"
                :loading="demoLoading"
                :disabled="loading"
                @click="quickDemoSignIn"
              >
                <v-avatar size="36" color="#173F35" class="me-3 text-white">
                  <v-icon size="20" color="#D9B98C">mdi-shield-crown</v-icon>
                </v-avatar>
                <div class="text-left flex-grow-1">
                  <div class="text-subtitle-2 font-weight-bold text-forest line-height-tight">
                    Touriva Demo Administrator
                  </div>
                  <div class="text-caption text-secondary-editorial text-xs line-height-tight mt-1">
                    Role: Marketplace Administrator • Full Platform Oversight
                  </div>
                </div>
                <v-chip size="x-small" color="#D9B98C" variant="flat" class="text-deep-green font-weight-bold me-2">
                  1-CLICK ACCESS
                </v-chip>
                <v-icon color="#C2A87E" size="20">mdi-arrow-right</v-icon>
              </v-btn>
            </div>

            <div class="d-flex align-center my-4">
              <v-divider class="border-subtle"></v-divider>
              <span class="mx-3 text-caption text-secondary-editorial font-weight-medium text-center text-uppercase">
                Or sign in with credentials
              </span>
              <v-divider class="border-subtle"></v-divider>
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
const demoLoading = ref(false)
const demoErr = ref('')

const quickDemoSignIn = async () => {
  try {
    demoLoading.value = true
    demoErr.value = ''
    await auth.demoSignIn('admin')
  } catch (error) {
    demoErr.value = error.message || 'Demo admin authentication failed'
    setTimeout(() => { demoErr.value = '' }, 6000)
  } finally {
    demoLoading.value = false
  }
}

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
  background: rgba(217, 185, 140, 0.15);
  border: 1px solid rgba(217, 185, 140, 0.3);
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

.demo-section {
  background: #FAF8F2;
  border: 1px solid rgba(217, 185, 140, 0.45);
  box-shadow: 0 2px 8px rgba(16, 45, 39, 0.04);
}

.demo-admin-btn {
  border: 1px solid rgba(16, 45, 39, 0.1) !important;
  transition: all 0.2s ease;
}

.demo-admin-btn:hover {
  border-color: rgba(217, 185, 140, 0.85) !important;
  background-color: #FAF8F2 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 45, 39, 0.08);
}

.line-height-tight {
  line-height: 1.25;
}
</style>