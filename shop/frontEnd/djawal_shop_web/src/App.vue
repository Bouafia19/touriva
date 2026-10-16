<template>
  <router-view />
</template>

<script setup>
  import { onMounted } from 'vue'
  import { Capacitor } from '@capacitor/core'
  import { Filesystem, Directory } from '@capacitor/filesystem'

  const createImageCacheFolder = async () => {
    try {
      await Filesystem.mkdir({
        path: 'categories',
        directory: Directory.Data,
        recursive: true, // create parent folders if not existing
      });

      await Filesystem.mkdir({
        path: 'publications',
        directory: Directory.Data,
        recursive: true, // create parent folders if not existing
      });

      // console.log('📁 cached folders created');
    } catch (error) {
      if (error.message.includes('File exists')) {
        // console.log('📁 cached already exists');
      } else {
        // console.error('❌ Failed to create folder:', error);
      }
    }
  }

  onMounted(() => {
    createImageCacheFolder()
  })
</script>

<style scoped>

</style>
