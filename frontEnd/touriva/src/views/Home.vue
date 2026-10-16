<template>
  <v-container
    fluid
    :class="platform !== 'web' ? 'pt-0 px-0' : 'd-flex justify-center align-center mt-8'"
  >
    <!-- Show Card on Web -->
    <template v-if="platform === 'web'">
      <v-card width="70%" outlined class="rounded-lg">
        <ContentLayout />
      </v-card>
    </template>

    <!-- Show Content Directly on Mobile -->
    <template v-else>
      <ContentLayout />
    </template>
  </v-container>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { Capacitor } from '@capacitor/core'
  import ContentLayout from "@/components/ContentLayout.vue"; // Import Component

  let platform = ref('')

  onMounted(() => {
    platform.value = Capacitor.getPlatform()
  })
</script>