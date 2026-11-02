import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePwaStore = defineStore('pwa', () => {
  const deferredPrompt = ref(null)
  const isInstalled = ref(false)
  const isStandalone = ref(false)
  const isIos = ref(false)
  const isSafari = ref(false)
  const showIosDialog = ref(false)
  const updateAvailable = ref(false)
  const waitingWorker = ref(null)
  const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const showReconnectedToast = ref(false)
  const bannerDismissed = ref(false)

  // Detect standalone mode
  const checkStandalone = () => {
    if (typeof window === 'undefined') return false
    const isStandaloneDisplay = window.matchMedia('(display-mode: standalone)').matches
    const isIosStandalone = window.navigator && window.navigator.standalone === true
    const isAndroidApp = typeof document !== 'undefined' && document.referrer.includes('android-app://')
    return Boolean(isStandaloneDisplay || isIosStandalone || isAndroidApp)
  }

  // Detect iOS Safari
  const checkIos = () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false
    const ua = navigator.userAgent || ''
    return /iphone|ipad|ipod/i.test(ua) && !window.MSStream
  }

  const checkSafari = () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false
    const ua = navigator.userAgent || ''
    return /safari/i.test(ua) && !/chrome|crios|crmo|android|edg/i.test(ua)
  }

  // Installable condition
  const canInstall = computed(() => {
    if (isStandalone.value || isInstalled.value) return false
    return Boolean(deferredPrompt.value)
  })

  const canInstallIos = computed(() => {
    if (isStandalone.value || isInstalled.value) return false
    return isIos.value && !bannerDismissed.value
  })

  const showInstallButton = computed(() => {
    if (isStandalone.value || isInstalled.value) return false
    return Boolean(deferredPrompt.value) || isIos.value
  })

  // Action: Trigger installation
  const promptInstall = async () => {
    if (deferredPrompt.value) {
      try {
        await deferredPrompt.value.prompt()
        const choiceResult = await deferredPrompt.value.userChoice
        if (choiceResult && choiceResult.outcome === 'accepted') {
          isInstalled.value = true
        }
        deferredPrompt.value = null
      } catch (err) {
        console.warn('[Touriva PWA] Install prompt error:', err)
      }
    } else if (isIos.value) {
      showIosDialog.value = true
    }
  }

  // Action: Dismiss banner
  const dismissBanner = () => {
    bannerDismissed.value = true
    try {
      sessionStorage.setItem('touriva_pwa_banner_dismissed', 'true')
    } catch (e) {}
  }

  // Action: Apply service worker update
  const applyUpdate = () => {
    if (waitingWorker.value) {
      waitingWorker.value.postMessage({ type: 'SKIP_WAITING' })
    }
  }

  // Initialize listeners
  const initPwa = () => {
    if (typeof window === 'undefined') return

    isStandalone.value = checkStandalone()
    isIos.value = checkIos()
    isSafari.value = checkSafari()

    try {
      if (sessionStorage.getItem('touriva_pwa_banner_dismissed') === 'true') {
        bannerDismissed.value = true
      }
    } catch (e) {}

    // Watch display mode changes
    try {
      const mediaQuery = window.matchMedia('(display-mode: standalone)')
      mediaQuery.addEventListener('change', (e) => {
        isStandalone.value = e.matches
      })
    } catch (e) {}

    // Listen to native beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt.value = e
    })

    // Listen to native appinstalled event
    window.addEventListener('appinstalled', () => {
      isInstalled.value = true
      deferredPrompt.value = null
      bannerDismissed.value = true
      console.log('[Touriva PWA] Application successfully installed')
    })

    // Listen to online / offline network state
    window.addEventListener('online', () => {
      isOnline.value = true
      showReconnectedToast.value = true
      setTimeout(() => {
        showReconnectedToast.value = false
      }, 3500)
    })

    window.addEventListener('offline', () => {
      isOnline.value = false
    })

    // Register Service Worker in production or preview environments
    if ('serviceWorker' in navigator && (import.meta.env.PROD || window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      registerServiceWorker()
    }

    // Attach for testing and inspection
    window.__pwa_store = {
      isStandalone,
      canInstall,
      showInstallButton,
      isIos,
      isSafari,
      showIosDialog,
      updateAvailable,
      isOnline,
      promptInstall,
      dismissBanner,
      applyUpdate
    }
  }

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      // Check if a service worker is already waiting
      if (registration.waiting) {
        waitingWorker.value = registration.waiting
        updateAvailable.value = true
      }

      // Detect newly installed service worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            waitingWorker.value = newWorker
            updateAvailable.value = true
          }
        })
      })

      // When the controlling service worker changes, reload page to load new assets
      let refreshing = false
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true
          window.location.reload()
        }
      })
    } catch (err) {
      console.warn('[Touriva PWA] Service worker registration failed:', err)
    }
  }

  return {
    deferredPrompt,
    isInstalled,
    isStandalone,
    isIos,
    isSafari,
    showIosDialog,
    updateAvailable,
    waitingWorker,
    isOnline,
    showReconnectedToast,
    bannerDismissed,
    canInstall,
    canInstallIos,
    showInstallButton,
    promptInstall,
    dismissBanner,
    applyUpdate,
    initPwa
  }
})
