<template>
  <div>
    <div class="text-center" v-if="loading">
      <v-row 
        class="d-flex justify-center align-center"  
        style="height: 80vh;"
      >
        <v-progress-circular
          indeterminate
          color="forestGreen"
          size="48"
        ></v-progress-circular>
      </v-row>
    </div>
    <div v-else>
      <div class="text-center ma-4" v-if="err">
        <v-row 
          class="d-flex justify-center align-center"  
          style="min-height: 50vh;"
        >
          <v-col cols="12" sm="8" md="6">
            <v-alert
              type="error"
              variant="tonal"
              rounded="lg"
              class="mb-4"
            >
              {{ $t('cgu') || 'Unable to load content' }}
            </v-alert>
            <v-btn
              :loading="loadingP"
              :disabled="loadingP"
              class="btn-editorial-primary px-6"
              @click="loadingPage"
            >
              {{ $t('tryAgain') || 'Reload' }}
              <v-icon end>mdi-refresh</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </div>
      <div v-else>
        <Accueil />
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import Accueil from '@/views/Accueil.vue'
  import { Capacitor } from '@capacitor/core'
  import { useUsersStore } from '@/stores/users'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'

  const { locale } = useI18n()
  const users = useUsersStore()
  const router = useRouter()

  const err = ref('')
  const loadingP = ref(false)
  const loading = ref(true)

  const loadingPage = () => {
    loadingP.value = true
    router.go()
  }

  onMounted(() => {
    users.loadUser().then((res) => {
      if (users.getUser?.language) {
        locale.value = users.getUser.language
      }
      loading.value = !!res
    }).catch(() => {
      loading.value = false
    })

    users.fetchUser()
    if (!Capacitor.isNativePlatform()) {
      loading.value = false
    }
  })
</script>