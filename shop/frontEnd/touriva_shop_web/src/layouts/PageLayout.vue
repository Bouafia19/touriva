<template>
  <v-app class="editorial-app bg-warm-ivory">
    <v-app-bar
      color="forestGreen"
      density="comfortable"
      elevation="2"
      height="70"
      class="border-b-sand"
    >
      <v-btn 
        icon 
        color="sand"
        @click="$route.meta.title !== 'documents' ? $router.go(-1) : $router.push({ name: 'Tabs'})" 
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>

      <!-- Touriva Compass Rose Brand Emblem -->
      <div class="shop-logo-emblem me-3 cursor-pointer" @click="$router.push('/')">
        <v-icon icon="mdi-compass-rose" color="sand" size="24" />
      </div>

      <v-toolbar-title v-if="$route.meta.title" class="editorial-heading text-h6 font-weight-bold text-white">
        {{ $t($route.meta.title) }}
      </v-toolbar-title>

      <v-progress-linear
        absolute
        location="bottom"
        color="sand"
        striped
        height="4"
        v-show="$route.meta.title === 'SignUp'"
      ></v-progress-linear>
    </v-app-bar>

    <v-main class="bg-warm-ivory">
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
  import { onMounted } from 'vue'
  import { useUsersStore } from '@/stores/users'

  const user = useUsersStore()

  onMounted(() => {
    // user.fetchUser()
  })
</script>

<style scoped>
  .border-b-sand {
    border-bottom: 1px solid rgba(217, 185, 140, 0.25) !important;
  }
  .shop-logo-emblem {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(217, 185, 140, 0.15);
    border: 1px solid rgba(217, 185, 140, 0.3);
  }
</style>