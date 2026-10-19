<template>
  <div class="auth-page bg-warm-ivory min-vh-100 d-flex align-center justify-center py-12 px-4">
    <v-card class="editorial-card auth-card pa-8 pa-md-10" width="100%" max-width="480" elevation="0">
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
        <div class="editorial-tag text-sand mb-1">SECURITY CREDENTIALS</div>
        <h2 class="text-h5 font-serif font-weight-bold text-forest">
          Set New Password
        </h2>
        <p class="text-caption text-secondary-editorial mt-1">
          Create a secure new password for your Touriva traveler or partner account.
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

      <!-- Success Alert -->
      <v-alert
        v-if="successMsg"
        type="success"
        variant="tonal"
        density="comfortable"
        class="mb-6 rounded-lg"
      >
        {{ successMsg }}
      </v-alert>

      <!-- Form -->
      <form @submit.prevent="submit">
        <div class="mb-4">
          <div class="text-caption font-weight-bold text-forest mb-1">
            {{ $t('password') || 'New Password' }} *
          </div>
          <v-text-field
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Enter new password"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            color="#173F35"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            @click:append-inner="showPassword = !showPassword"
            hide-details
            required
          />
        </div>

        <div class="mb-6">
          <div class="text-caption font-weight-bold text-forest mb-1">
            {{ $t('passwordConfirmation') || 'Confirm Password' }} *
          </div>
          <v-text-field
            v-model="passwordConfirmation"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="Confirm your new password"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            color="#173F35"
            prepend-inner-icon="mdi-lock-check-outline"
            :append-inner-icon="showConfirmPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            @click:append-inner="showConfirmPassword = !showConfirmPassword"
            hide-details
            required
          />
        </div>

        <div class="mb-4">
          <v-btn
            type="submit"
            block
            color="#173F35"
            size="large"
            rounded="pill"
            class="btn-editorial-primary font-weight-bold"
            :loading="auth.getLoading"
          >
            {{ $t('save') || 'Update Password' }}
          </v-btn>
        </div>
      </form>

      <v-divider class="my-6 border-subtle"></v-divider>

      <!-- Back to Login -->
      <div class="text-center text-caption text-secondary-editorial">
        Return to
        <router-link to="/login" class="text-emerald font-weight-bold text-decoration-none ml-1">
          {{ $t('Login') || 'Sign In' }}
        </router-link>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const password = ref('')
const passwordConfirmation = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const err = ref('')
const successMsg = ref('')

const signUp = async () => {
  try {
    const params = {
      id: auth.user?._id,
      password: password.value
    }
    await auth.account_update_existing_user(params)
    successMsg.value = 'Password updated successfully! Redirecting to sign in...'
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (error) {
    err.value = error.message || 'Failed to update password'
  } finally {
    auth.loading = false
  }
}

const submit = () => {
  err.value = ''
  if (!password.value || !passwordConfirmation.value) {
    err.value = 'Please fill in both password fields'
    return
  }
  if (password.value !== passwordConfirmation.value) {
    err.value = "Passwords don't match"
    return
  }
  auth.loading = true
  signUp()
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