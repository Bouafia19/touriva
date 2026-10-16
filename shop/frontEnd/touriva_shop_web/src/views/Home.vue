<template>
  <v-container fluid class="fill-height d-flex align-center justify-center">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="4" class="text-center">
        
        <!-- App image -->
        <v-img
          v-if="company.getHomeImage"
          :src="company.getHomeImage"
          :lazy-src="lazyImage"
          cover
          height="45vh"
          class="rounded-xl"
        >
          <template #placeholder>
            <div class="d-flex align-center justify-center fill-height">
              <v-progress-circular color="next" indeterminate />
            </div>
          </template>
        </v-img>

        <!-- Fallback image if company image missing -->
        <v-img
          v-else
          :src="lazyImage"
          height="45vh"
          cover
          class="rounded-xl"
        />

        <!-- Language selector -->
        <div class="d-flex justify-center mt-6">
          <v-select
            v-model="$i18n.locale"
            :items="locals"
            label="Language"
            variant="outlined"
            color="next"
            hide-details
            style="max-width: 220px;"
          >
            <template #item="{ props, item }">
              <v-list-item v-bind="props" :title="$t(item.raw.title)" />
            </template>
            <template #selection="{ item }">
              <span>{{ $t(item.title) }}</span>
            </template>
          </v-select>
        </div>

        <!-- Auth buttons -->
        <div class="mt-6">
          <v-btn
            color="next"
            block
            class="mb-3"
            rounded
            size="x-large"
            @click="routerLogin"
          >
            {{ $t('Login') }}
          </v-btn>

          <v-btn
            color="next"
            block
            rounded
            variant="outlined"
            size="x-large"
            @click="routerSignup"
          >
            {{ $t('SignUp') }}
          </v-btn>
        </div>

      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useCompanyStore } from '@/stores/company'
  import { useRouter } from 'vue-router'

  const company = useCompanyStore()
  const router = useRouter()

  let lazyImage = ref(new URL('@/assets/online-shop.png', import.meta.url).href),
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
              }])

  const routerLogin = () => {
    router.push('/login')
  }

  const routerSignup = () => {
    router.push('/signup')
  }

    onMounted(() => {
      company.fetchAppImage()
    })
    
</script>