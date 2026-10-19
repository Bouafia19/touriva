<template>
  <v-app class="touriva-page-layout bg-warm-ivory">
    <v-app-bar
      color="#173F35"
      elevation="0"
      density="comfortable"
      class="border-b"
      style="border-bottom-color: rgba(231, 232, 225, 0.2) !important;"
    >
      <v-btn
        icon
        variant="text"
        color="#FAF8F2"
        @click="$route.meta.title != 'trip' ? $router.go(-1) : $router.push({ name: 'Tabs'})"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>

      <v-toolbar-title v-if="$route.meta.title" class="text-white font-weight-bold" style="font-family: 'Playfair Display', serif; letter-spacing: 0.5px;">
        {{ $t($route.meta.title) }}
      </v-toolbar-title>

      <v-spacer />

      <!-- Brand Logo / Badge -->
      <div class="d-flex align-center pr-4">
        <span class="text-caption font-weight-bold tracking-widest text-sand text-uppercase">Touriva</span>
      </div>

      <v-progress-linear
        v-show="$route.meta.title === 'SignUp'"
        absolute
        location="bottom"
        color="#D9B98C"
        height="3"
        indeterminate
      />
    </v-app-bar>

    <v-main class="bg-warm-ivory">
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Capacitor } from '@capacitor/core'

const platform = ref('')

onMounted(() => {
  platform.value = Capacitor.getPlatform()
})
</script>

<style scoped>
.touriva-page-layout {
  min-height: 100vh;
}
</style>