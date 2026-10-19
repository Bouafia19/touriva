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
        <div class="editorial-tag text-sand mb-1">ACCOUNT VERIFICATION</div>
        <h2 class="text-h5 font-serif font-weight-bold text-forest">
          Verification Code
        </h2>
        <p class="text-caption text-secondary-editorial mt-1">
          Please enter the 6-digit confirmation code sent to <strong class="text-forest">{{ route.params.phonenumber }}</strong>
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

      <!-- OTP Input -->
      <div class="mb-8">
        <v-otp-input
          v-model="otp"
          length="6"
          type="number"
          variant="outlined"
          color="#173F35"
          class="editorial-otp"
        ></v-otp-input>
      </div>

      <!-- Action Buttons -->
      <div class="mb-4">
        <v-btn
          block
          color="#173F35"
          size="large"
          rounded="pill"
          class="btn-editorial-primary font-weight-bold"
          :disabled="!isActive"
          :loading="auth.getLoading"
          @click="show"
        >
          {{ $t('next') || 'Verify & Continue' }}
        </v-btn>
      </div>

      <div class="text-center">
        <v-btn
          variant="text"
          color="#173F35"
          size="small"
          class="font-weight-medium text-capitalize"
          @click="tryAgain"
        >
          <v-icon start size="16">mdi-arrow-left</v-icon>
          {{ $t('tryAgain') || 'Edit phone number' }}
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const otp = ref('')
const err = ref('')
const length = ref(6)

const isActive = computed(() => {
  return otp.value.length === length.value
})

const codeVerify = async () => {
  const phone = route.params.phonenumber
  try {
    await auth.account_verify_OTP({
      phonenumber: phone,
      code: otp.value
    })
  } catch (error) {
    err.value = auth.getError || error.message || 'Invalid verification code'
  } finally {
    auth.loading = false
  }
}

const show = () => {
  auth.loading = true
  codeVerify()
}

const tryAgain = () => {
  router.push('/signup')
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

:deep(.editorial-otp .v-otp-input__field) {
  border-radius: 10px !important;
  border-color: #E7E8E1 !important;
}

:deep(.editorial-otp .v-otp-input__field:focus) {
  border-color: #173F35 !important;
}
</style>