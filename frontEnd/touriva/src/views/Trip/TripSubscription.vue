<template>
  <div class="editorial-trip-detail bg-warm-ivory min-vh-100 pb-16">
    <!-- Top Back Navigation -->
    <div class="py-6 px-4 border-b border-subtle bg-white">
      <v-container class="max-w-container d-flex align-center justify-space-between">
        <v-btn
          variant="text"
          color="#173F35"
          rounded="pill"
          class="font-weight-bold"
          @click="router.push('/trips')"
        >
          <v-icon start size="18">mdi-arrow-left</v-icon>
          {{ $t('Return') || 'Back to Excursions' }}
        </v-btn>

        <v-chip class="editorial-chip font-weight-bold">
          {{ trip?.name || 'Guided Excursion Reservation' }}
        </v-chip>
      </v-container>
    </div>

    <!-- Booking Content -->
    <v-container class="max-w-container mt-8">
      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-card class="editorial-card pa-8" elevation="0">
            <div class="text-center mb-8">
              <div class="editorial-tag text-sand mb-2">OFFICIAL TOURISM RESERVATION</div>
              <h1 class="text-h4 font-serif font-weight-bold text-forest mb-2">
                {{ trip?.name || 'Complete Your Excursion Booking' }}
              </h1>
              <p class="text-secondary-editorial max-w-prose mx-auto">
                Secure your reservation directly with the certified guide. No payment is required upfront; your details will be verified by the agency.
              </p>
            </div>

            <v-alert v-if="successMsg" type="success" variant="tonal" class="mb-6 rounded-lg">
              <v-icon start>mdi-check-decagram</v-icon>
              {{ successMsg }}
            </v-alert>

            <v-alert v-if="errorMsg" type="error" variant="tonal" class="mb-6 rounded-lg">
              {{ errorMsg }}
            </v-alert>

            <v-form @submit.prevent="confirmSubscription">
              <v-row>
                <v-col cols="12" sm="6">
                  <div class="text-caption font-weight-bold text-forest mb-2">FULL NAME *</div>
                  <v-text-field
                    v-model="form.fullName"
                    placeholder="Enter your full name"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    required
                    color="#173F35"
                    hide-details
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <div class="text-caption font-weight-bold text-forest mb-2">PHONE NUMBER *</div>
                  <v-text-field
                    v-model="form.phone"
                    placeholder="Enter your contact phone"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    type="tel"
                    required
                    color="#173F35"
                    hide-details
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <div class="text-caption font-weight-bold text-forest mb-2">NUMBER OF PARTICIPANTS</div>
                  <v-select
                    v-model="form.seats"
                    :items="[1, 2, 3, 4, 5, 6, 8, 10]"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="#173F35"
                    hide-details
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <div class="text-caption font-weight-bold text-forest mb-2">ESTIMATED PRICE</div>
                  <div class="pa-3 bg-warm-ivory rounded-lg border-subtle d-flex align-center justify-space-between">
                    <span class="text-caption text-secondary-editorial">Total (Taxes Incl.)</span>
                    <span class="text-h6 font-weight-bold text-forest">{{ formatPrice(totalPrice) }}</span>
                  </div>
                </v-col>

                <v-col cols="12" class="mt-4">
                  <v-btn
                    type="submit"
                    block
                    color="#173F35"
                    size="large"
                    rounded="pill"
                    class="btn-editorial-primary font-weight-bold"
                    :loading="loading"
                  >
                    <v-icon start size="20">mdi-ticket-confirmation</v-icon>
                    Confirm My Reservation
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { useTripsStore } from '@/stores/trips'

const router = useRouter()
const route = useRoute()
const tripsStore = useTripsStore()

const loading = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const form = ref({
  fullName: '',
  phone: '',
  seats: 1
})

const trip = computed(() => tripsStore.getCurrentTrip)

const totalPrice = computed(() => {
  const unit = Number(trip.value?.price) || 15000
  return unit * form.value.seats
})

const formatPrice = (val) => {
  const num = Number(val)
  return isNaN(num) ? `${val} DZD` : `${num.toLocaleString()} DZD`
}

const confirmSubscription = async () => {
  if (!form.value.fullName || !form.value.phone) {
    errorMsg.value = 'Please provide both your full name and phone number.'
    return
  }

  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    await axios.post('/api/tripSubscriptions', {
      tripId: trip.value?._id || route.params.id,
      fullName: form.value.fullName,
      phone: form.value.phone,
      seats: form.value.seats
    })

    successMsg.value = 'Your reservation has been confirmed and registered! The tour guide will contact you shortly.'
    setTimeout(() => {
      router.push('/subscriptions')
    }, 2000)
  } catch (e) {
    console.error(e)
    errorMsg.value = e.response?.data?.error || 'Subscription submission failed. Please try again.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const id = route.params.id
  if (id) {
    await tripsStore.fetchTripById(id)
  }
})
</script>

<style scoped>
.max-w-container {
  max-width: 1200px;
}

.max-w-prose {
  max-width: 600px;
}

.border-subtle {
  border-color: #E7E8E1 !important;
}
</style>
