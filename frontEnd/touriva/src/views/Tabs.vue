<template>
  <div class="bg-warm-ivory min-vh-100">
    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center align-center" style="height: 80vh;">
      <v-progress-circular
        indeterminate
        color="#21866B"
        size="48"
      ></v-progress-circular>
    </div>

    <!-- Error State -->
    <div v-else-if="err" class="d-flex justify-center align-center py-16 px-4">
      <v-card class="editorial-card pa-8 text-center" max-width="500" elevation="0">
        <v-icon size="48" color="#D9B98C" class="mb-4">mdi-alert-circle-outline</v-icon>
        <h3 class="text-h6 font-weight-bold text-forest mb-2">
          {{ $t('cgu') || 'Unable to load user' }}
        </h3>
        <p class="text-caption text-secondary-editorial mb-6">
          There was an issue loading your profile. Please try again.
        </p>
        <v-btn
          color="#173F35"
          class="btn-editorial-primary font-weight-bold"
          rounded="pill"
          :loading="loadingP"
          @click="loadingPage"
        >
          <v-icon start size="18">mdi-refresh</v-icon>
          {{ $t('tryAgain') || 'Try Again' }}
        </v-btn>
      </v-card>
    </div>

    <!-- Main Content -->
    <div v-else>
      <Trips />
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import Trips from '@/views/Trip/TripsList.vue'
  import { Capacitor } from '@capacitor/core'
  import { Preferences } from '@capacitor/preferences'
  import { useUsersStore } from '@/stores/users'
  import { onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'

  const { locale } = useI18n()
  const users = useUsersStore()
  const router = useRouter()

  let value = ref('recent'),
      items = ref([
        { title: "search", icon: 'mdi-magnify', to: '/search' },
        { title: "plannedTrips", icon: 'mdi-routes-clock', to: '/plannedTrips' },
        { title: "profile", icon: 'mdi-account', to: '/profile' },
      ]),
      tab = ref(null),
      err = ref(''),
      loadingP = ref(false),
      prevRoute = ref(''),
      condition = ref(false),
      loading = ref(true),
      brResult = ref(undefined)

    
    const loadingPage = () => {
      loadingP.value = true
      router.go()
    }

    onMounted(async () => {
      await users.loadUser().then((res) => {
        locale.value = users.getUser?.language || 'fr'
        loading.value = res
      })
      if (users.getUser) {
        users.fetchUser()
      }
      if (Capacitor.isNativePlatform()) {
        
      }else{
        loading.value = false
      }
    })
</script>