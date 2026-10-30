<template>
  <router-view />
</template>

<script setup>
  import { onMounted, onUnmounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { StatusBar } from '@capacitor/status-bar'
  import { Capacitor } from '@capacitor/core'
  import { Filesystem, Directory } from '@capacitor/filesystem'
  import { App } from '@capacitor/app'

  const router = useRouter()
  let backButtonListener = null
  
  const setStatusBarStyle = async () => {
    try {
      await StatusBar.setOverlaysWebView({ overlay: false })
      await StatusBar.setBackgroundColor({ color: '#173F35' })
    } catch (error) {
      // Ignore in non-native or unsupported devices
    }
  }

  const createImageCacheFolder = async () => {
    try {
      await Filesystem.mkdir({
        path: 'categories',
        directory: Directory.Data,
        recursive: true,
      });

      await Filesystem.mkdir({
        path: 'publications',
        directory: Directory.Data,
        recursive: true,
      });
    } catch (error) {
      if (error.message && error.message.includes('File exists')) {
        // Cached folder already exists
      } else {
        // Silently handle cache folder creation
      }
    }
  }

  const setupBackButtonListener = async () => {
    if (!Capacitor.isNativePlatform()) return

    try {
      backButtonListener = await App.addListener('backButton', ({ canGoBack }) => {
        const currentPath = router.currentRoute.value?.path || '/'
        const rootPaths = ['/', '/tabs', '/login', '/agency/dashboard']

        // If currently on a nested route and history permits, navigate back
        if (!rootPaths.includes(currentPath) && window.history.length > 1) {
          router.back()
        } else {
          // If on a root landing page or cannot step back further, exit/minimize gracefully
          App.exitApp()
        }
      })
    } catch (e) {
      // Ignore if listener cannot be attached
    }
  }

  onMounted(() => {
    // Only execute native Capacitor platform plugins on native runtime
    if (Capacitor.isNativePlatform()) {
      setStatusBarStyle()
      createImageCacheFolder()
      setupBackButtonListener()
    }
  })

  onUnmounted(() => {
    if (backButtonListener && typeof backButtonListener.remove === 'function') {
      backButtonListener.remove()
      backButtonListener = null
    }
  })
</script>
