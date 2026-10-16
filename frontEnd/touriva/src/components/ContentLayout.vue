<template>
    <v-row class="d-flex justify-center align-center">
      <!-- Image Section -->
      <v-col cols="12" sm="6" md="5">
        <v-responsive aspect-ratio="1">
          <v-img
            cover
            height="65vh"
            :src="company.getHomeImage"
            :lazy-src="lazyImage"
          >
            <template v-slot:placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
              </div>
            </template>
          </v-img>
        </v-responsive>
      </v-col>
  
      <!-- Divider (only on md and up) -->
      <v-divider v-if="$vuetify.display.mdAndUp" vertical class="mx-4"></v-divider>
  
      <!-- Form Section -->
      <v-col cols="12" sm="6" md="5">
        <div class="text-center mb-6">
          <v-img
            src="/logo.svg"
            alt="Touriva"
            max-width="220"
            class="mx-auto mb-2"
          />
          <p class="text-body-2 text-grey-darken-1 font-weight-medium">
            Discover More. Travel Better.
          </p>
        </div>

        <div class="d-flex justify-center mt-2 mb-4">
          <v-select
            v-model="$i18n.locale"
            :items="locals"
            bg-color="#0f766e"
            color="white"
            theme="dark"
            flat
            label="Language"
            max-width="200"
            density="compact"
            variant="solo"
            rounded="lg"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props" :title="$t(item.raw.title)"></v-list-item>
            </template>
            <template v-slot:selection="{ item }">
              <span>{{ $t(item.title) }}</span>
            </template>
          </v-select>
        </div>
  
        <div class="text-center px-4">
          <div class="my-3 mx-4">
            <v-btn color="primary" block size="large" @click="routerLogin" rounded="pill" elevation="2">
              {{ $t('Login') }}
            </v-btn>
          </div>
  
          <div class="my-3 mx-4">
            <v-btn color="secondary" block variant="outlined" size="large" @click="routerSignup" rounded="pill">
              {{ $t('SignUp') }}
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>
  </template>
  
<script setup>
  

  import { ref, onMounted } from 'vue'
  import { useCompanyStore } from '@/stores/company'
  import { useRouter } from 'vue-router'
  import { Capacitor } from '@capacitor/core'
//   import ContentLayout from "@/components/ContentLayout.vue"; // Import Component

  const company = useCompanyStore()
  const router = useRouter()

  let lazyImage = ref(new URL('@/assets/touriva.png', import.meta.url).href),
      locals = ref([
              {
                value: "ar",
                title: "arabic"
              }, 
              {
                value: "fr",
                title: "french"
              }, 
              {
                value: "en",
                title: "english"
              }]),
              platform = ref('')

  const routerLogin = () => {
    router.push('/login')
  }

  const routerSignup = () => {
    router.push('/signup')
  }

    onMounted(() => {
      company.fetchAppImage()
      platform.value = Capacitor.getPlatform()
    })
  
 
  </script>
  