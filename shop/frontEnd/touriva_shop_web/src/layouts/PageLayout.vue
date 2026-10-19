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
</style>