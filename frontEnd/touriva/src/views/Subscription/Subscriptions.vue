<template>
  <div class="editorial-catalog bg-warm-ivory min-vh-100 pb-16">
    <div class="catalog-hero py-10 px-4 border-b border-subtle bg-white">
      <v-container class="max-w-container">
        <div class="editorial-tag mb-1">RESERVATIONS & BOOKINGS</div>
        <h1 class="text-h3 font-serif font-weight-bold text-forest mb-2">
          {{ $t('subscriptionsForYourTrips') || 'Excursion Reservations' }}
        </h1>
        <p class="text-secondary-editorial max-w-prose mb-0">
          Review all confirmed traveler bookings, participant contacts, and excursion reservation status.
        </p>
      </v-container>
    </div>

    <v-container class="max-w-container py-8">
      <v-card
        v-if="!tripSubscriptionsStore.getUserSubscriptionsList?.length"
        class="editorial-card pa-12 text-center"
        elevation="0"
      >
        <v-icon size="56" color="#D9B98C" class="mb-4">mdi-ticket-outline</v-icon>
        <h3 class="text-h5 font-serif font-weight-bold text-forest mb-2">
          No Active Reservations Found
        </h3>
        <p class="text-secondary-editorial max-w-prose mx-auto mb-6">
          You currently have no traveler reservations registered. When you book an excursion or travelers reserve your trips, they will appear here.
        </p>
        <v-btn to="/trips" color="#173F35" class="btn-editorial-primary px-6" rounded="pill">
          Browse Excursions
        </v-btn>
      </v-card>

      <v-expansion-panels v-else variant="accordion" class="editorial-panels">
        <v-expansion-panel
          v-for="(trip, index) in tripSubscriptionsStore.getUserSubscriptionsList"
          :key="index"
          class="editorial-card mb-4 overflow-hidden"
          elevation="0"
        >
          <v-expansion-panel-title class="pa-4 bg-white">
            <div class="d-flex align-center justify-space-between w-100 pr-3">
              <div class="d-flex align-center">
                <v-avatar color="#F5EDE0" size="40" class="mr-3 border-sand">
                  <v-icon color="#173F35" size="22">mdi-compass</v-icon>
                </v-avatar>
                <div>
                  <div class="font-weight-bold text-forest text-body-1">
                    {{ trip.name }}
                  </div>
                  <div class="text-caption text-secondary-editorial">
                    {{ trip.destination?.name || 'Algeria' }}
                  </div>
                </div>
              </div>

              <v-chip
                size="small"
                :color="trip.subscriptions?.length ? '#21866B' : 'grey'"
                class="font-weight-bold"
                variant="tonal"
              >
                {{ trip.subscriptions?.length || 0 }} {{ $t('subscriptions') || 'Bookings' }}
              </v-chip>
            </div>
          </v-expansion-panel-title>

          <v-expansion-panel-text class="pa-4 bg-warm-ivory">
            <div v-if="!trip.subscriptions?.length" class="text-secondary-editorial pa-4 text-center">
              {{ $t('noSubscriptionsYet') || 'No traveler reservations yet for this trip.' }}
            </div>

            <v-list v-else class="bg-transparent" density="comfortable">
              <v-list-item
                v-for="sub in trip.subscriptions"
                :key="sub._id"
                class="bg-white rounded-lg mb-2 border-subtle pa-3"
              >
                <template #prepend>
                  <v-avatar color="#173F35" size="36" class="text-white font-weight-bold mr-3">
                    {{ sub.fullName?.charAt(0).toUpperCase() || 'T' }}
                  </v-avatar>
                </template>

                <v-list-item-title class="font-weight-bold text-forest">
                  {{ sub.fullName }}
                </v-list-item-title>

                <v-list-item-subtitle class="d-flex align-center mt-1">
                  <v-icon size="14" color="#21866B" class="mr-1">mdi-phone</v-icon>
                  <a :href="`tel:${sub.phone}`" class="text-decoration-none text-forest font-weight-medium">
                    {{ sub.phone }}
                  </a>
                </v-list-item-subtitle>

                <template #append>
                  <div class="text-end">
                    <span class="text-caption text-secondary-editorial">
                      {{ new Date(sub.createdAt).toLocaleDateString() }}
                    </span>
                    <div>
                      <v-chip size="x-small" color="#21866B" variant="flat" class="text-white font-weight-bold">
                        Confirmed
                      </v-chip>
                    </div>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTripsStore } from '@/stores/trips'
import { useTripSubscriptionsStore } from '@/stores/tripsubscriptions'
import { useAuthStore } from '@/stores/auth'

const tripsStore = useTripsStore()
const tripSubscriptionsStore = useTripSubscriptionsStore()
const auth = useAuthStore()

const user = ref(null)

onMounted(async () => {
  const ls = await auth.getLSUserInfo()
  user.value = ls?.user
  if (user.value?._id) {
    tripsStore.fetchTripsByUser(user.value._id)
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

.catalog-hero {
  background: #FFFFFF;
}
</style>