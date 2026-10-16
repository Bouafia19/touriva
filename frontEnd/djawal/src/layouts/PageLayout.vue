<template>
  <v-app>
    <v-app-bar color="next" dark app>
      <v-btn 
        icon 
        
        @click="$route.meta.title != 'trip' ? $router.go(-1) : $router.push({ name: 'Tabs'})" 
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>

      <v-toolbar-title v-if="$route.meta.title">{{ $t($route.meta.title) }}</v-toolbar-title>

      <v-progress-linear
        absolute
        bottom
        color="light-blue"
        striped
        height="5"
        v-show="$route.meta.title === 'SignUp'"
      ></v-progress-linear>
    </v-app-bar>

    <v-main>
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