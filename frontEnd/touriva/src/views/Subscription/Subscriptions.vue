<template>
    <v-container 
        fluid 
        :class="[platform === 'web' ? 'px-0 main-container' : '']"
    >
        <h3
            class="mb-4"
            :style="{ 'font-size': platform === 'web' ? '2rem' : '1.5rem' }"
            
        >
            {{ $t('subscriptionsForYourTrips') }}
        </h3>

        <v-alert
            v-if="!tripSubscriptionsStore.getUserSubscriptionsList?.length"
            type="info"
            variant="tonal"
            class="mb-4"
        >
            {{ $t('noTripsSubscriptions') }}
        </v-alert>

        <v-expansion-panels variant="accordion">
            <v-expansion-panel
                v-for="(trip, index) in tripSubscriptionsStore.getUserSubscriptionsList"
                :key="index"
            >
                <!-- HEADER -->
                <v-expansion-panel-title>
                <div class="d-flex align-center justify-space-between w-100">
                    <span class="font-weight-bold">
                    {{ trip.name }}
                    </span>

                    <v-chip
                    size="small"
                    :color="trip.subscriptions.length ? 'primary' : 'grey'"
                    variant="tonal"
                    >
                    {{ trip.subscriptions.length }} {{ $t('subscriptions') }}
                    </v-chip>
                </div>
                </v-expansion-panel-title>

                <!-- CONTENT -->
                <v-expansion-panel-text>
                <div v-if="!trip.subscriptions.length" class="text-medium-emphasis">
                    {{ $t('noSubscriptionsYet') }}
                </div>

                <v-list v-else density="compact">
                    <v-list-item
                    v-for="sub in trip.subscriptions"
                    :key="sub._id"
                    >
                    <template #prepend>
                        <v-avatar color="primary" size="32">
                        {{ sub.fullName.charAt(0).toUpperCase() }}
                        </v-avatar>
                    </template>

                    <v-list-item-title>
                        {{ sub.fullName }}
                    </v-list-item-title>

                    <v-list-item-subtitle>
                        {{ sub.phone }}
                    </v-list-item-subtitle>

                    <template #append>
                        <span class="text-caption">
                        {{ new Date(sub.createdAt).toLocaleDateString() }}
                        </span>
                    </template>
                    </v-list-item>
                </v-list>
                </v-expansion-panel-text>
            </v-expansion-panel>
        </v-expansion-panels>
    </v-container>

</template>

<script setup>
    import { ref, computed, onMounted } from 'vue'
    import { useTripsStore } from '@/stores/trips'
    import { useTripSubscriptionsStore } from '@/stores/tripsubscriptions'
    import { Capacitor } from '@capacitor/core'
    import { useAuthStore } from '@/stores/auth'

    const tripsStore = useTripsStore()
    const tripSubscriptionsStore = useTripSubscriptionsStore()
    const auth = useAuthStore()

    const platform = ref('')
    const user = ref(null)

    onMounted(async () => {
        platform.value = Capacitor.getPlatform()
        const ls = await auth.getLSUserInfo()
        user.value = ls?.user
        tripsStore.fetchTripsByUser(user.value._id)
    })
</script>

<style scoped>

    .main-container {
        max-width: 1200px;
        margin-left: auto;
        margin-right: auto;
    }

</style>