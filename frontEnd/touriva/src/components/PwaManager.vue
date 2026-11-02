<template>
  <div class="pwa-manager-root">
    <!-- 1. Offline Notification Bar -->
    <v-snackbar
      v-model="showOfflineBar"
      :timeout="-1"
      location="top"
      color="#102D27"
      elevation="6"
      class="pwa-offline-snackbar"
    >
      <div class="d-flex align-center justify-space-between w-100">
        <div class="d-flex align-center">
          <v-icon color="#C24545" class="me-2" size="20">mdi-wifi-off</v-icon>
          <div>
            <span class="font-weight-bold text-white me-1">{{ $t('youAreOffline') }}</span>
            <span class="text-caption text-grey-lighten-2 d-none d-sm-inline">
              — {{ $t('offlineBanner') }}
            </span>
          </div>
        </div>
        <v-btn
          size="small"
          variant="text"
          color="#D9B98C"
          class="text-capitalize ms-2"
          @click="checkConnectivity"
        >
          {{ $t('refresh') }}
        </v-btn>
      </div>
    </v-snackbar>

    <!-- 2. Reconnected Toast -->
    <v-snackbar
      v-model="pwaStore.showReconnectedToast"
      :timeout="3500"
      location="top"
      color="#21866B"
      elevation="4"
    >
      <div class="d-flex align-center">
        <v-icon color="white" class="me-2" size="20">mdi-wifi-check</v-icon>
        <span class="font-weight-medium text-white">{{ $t('reconnected') }}</span>
      </div>
    </v-snackbar>

    <!-- 3. New Application Version Update Prompt -->
    <v-snackbar
      v-model="pwaStore.updateAvailable"
      :timeout="-1"
      location="bottom right"
      color="#173F35"
      elevation="8"
      rounded="lg"
      class="pwa-update-snackbar"
    >
      <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between ga-2">
        <div class="d-flex align-center">
          <v-avatar size="28" color="#D9B98C" class="me-2">
            <v-icon size="16" color="#173F35">mdi-sync</v-icon>
          </v-avatar>
          <span class="text-white text-body-2 font-weight-medium">
            {{ $t('newVersionAvailable') }}
          </span>
        </div>
        <div class="d-flex align-center ga-1 justify-end">
          <v-btn
            color="#D9B98C"
            size="small"
            variant="flat"
            class="text-capitalize text-deep-green font-weight-bold"
            @click="pwaStore.applyUpdate"
          >
            {{ $t('refresh') }}
          </v-btn>
        </div>
      </div>
    </v-snackbar>

    <!-- 4. Non-Intrusive Floating Install Banner (Mobile & Desktop) -->
    <transition name="slide-up">
      <div
        v-if="showFloatingBanner"
        class="pwa-install-banner elevation-6"
      >
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center me-3">
            <v-avatar size="44" rounded="lg" color="#173F35" class="me-3 pwa-banner-icon border-sand">
              <v-img src="/icons/icon-192.png" alt="Touriva" cover />
            </v-avatar>
            <div>
              <div class="font-weight-bold text-white text-body-2 d-flex align-center">
                <span>{{ pwaStore.isIos ? $t('installTourivaIos') : $t('installTouriva') }}</span>
                <v-chip size="x-small" color="#D9B98C" class="ms-2 text-deep-green font-weight-bold" variant="flat">
                  APP
                </v-chip>
              </div>
              <div class="text-caption text-sand-light line-clamp-1">
                {{ $t('installTourivaDesc') }}
              </div>
            </div>
          </div>

          <div class="d-flex align-center ga-1 ga-sm-2 flex-shrink-0">
            <v-btn
              color="#D9B98C"
              size="small"
              rounded="pill"
              variant="flat"
              class="text-deep-green font-weight-bold text-capitalize install-cta-btn"
              @click="pwaStore.promptInstall"
            >
              <v-icon start size="16">mdi-download</v-icon>
              <span>{{ $t('installTouriva') }}</span>
            </v-btn>
            <v-btn
              icon="mdi-close"
              size="x-small"
              variant="text"
              color="#FAF8F2"
              @click="pwaStore.dismissBanner"
              aria-label="Dismiss install banner"
            />
          </div>
        </div>
      </div>
    </transition>

    <!-- 5. iOS Safari 3-Step Installation Dialog -->
    <v-dialog
      v-model="pwaStore.showIosDialog"
      max-width="440"
      rounded="xl"
    >
      <v-card class="editorial-card pa-5 bg-warm-ivory" rounded="xl">
        <div class="text-center mb-4">
          <v-avatar size="64" rounded="xl" color="#173F35" class="mb-3 mx-auto border-sand elevation-3">
            <v-img src="/icons/icon-192.png" alt="Touriva" cover />
          </v-avatar>
          <h2 class="text-h6 font-weight-bold text-forest mb-1">
            {{ $t('installTourivaIos') }}
          </h2>
          <p class="text-caption text-grey-darken-1">
            {{ $t('installTourivaDesc') }}
          </p>
        </div>

        <v-divider class="mb-4" />

        <div class="ios-steps-list mb-5">
          <!-- Step 1: Share Button -->
          <div class="d-flex align-center mb-3 pa-3 rounded-lg step-card">
            <div class="step-num me-3">1</div>
            <v-avatar size="36" color="#173F35" class="me-3">
              <v-icon color="#D9B98C" size="20">mdi-export-variant</v-icon>
            </v-avatar>
            <div class="text-body-2 font-weight-medium text-forest">
              {{ $t('iosShareStep') }}
            </div>
          </div>

          <!-- Step 2: Add to Home Screen -->
          <div class="d-flex align-center mb-3 pa-3 rounded-lg step-card">
            <div class="step-num me-3">2</div>
            <v-avatar size="36" color="#173F35" class="me-3">
              <v-icon color="#D9B98C" size="20">mdi-plus-box-outline</v-icon>
            </v-avatar>
            <div class="text-body-2 font-weight-medium text-forest">
              {{ $t('iosAddStep') }}
            </div>
          </div>

          <!-- Step 3: Confirm Add -->
          <div class="d-flex align-center pa-3 rounded-lg step-card">
            <div class="step-num me-3">3</div>
            <v-avatar size="36" color="#173F35" class="me-3">
              <v-icon color="#21866B" size="20">mdi-check-circle-outline</v-icon>
            </v-avatar>
            <div class="text-body-2 font-weight-medium text-forest">
              {{ $t('iosConfirmStep') }}
            </div>
          </div>
        </div>

        <v-btn
          block
          color="#173F35"
          rounded="pill"
          size="large"
          class="text-white font-weight-bold text-capitalize"
          @click="pwaStore.showIosDialog = false"
        >
          {{ $t('close') }}
        </v-btn>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePwaStore } from '@/stores/pwa'

const pwaStore = usePwaStore()

const showOfflineBar = computed(() => !pwaStore.isOnline)

const showFloatingBanner = computed(() => {
  return pwaStore.showInstallButton && !pwaStore.bannerDismissed && !pwaStore.isStandalone
})

const checkConnectivity = () => {
  if (typeof window !== 'undefined') {
    if (navigator.onLine) {
      pwaStore.isOnline = true
      window.location.reload()
    }
  }
}
</script>

<style scoped>
.pwa-manager-root {
  position: relative;
  z-index: 9999;
}

.pwa-install-banner {
  position: fixed;
  bottom: 76px;
  left: 20px;
  right: 20px;
  max-width: 540px;
  margin: 0 auto;
  background: linear-gradient(135deg, #102D27 0%, #173F35 100%);
  border: 1px solid rgba(217, 185, 140, 0.35);
  border-radius: 18px;
  padding: 12px 16px;
  color: #FAF8F2;
  z-index: 1000;
  box-shadow: 0 10px 30px rgba(16, 45, 39, 0.35);
}

@media (min-width: 960px) {
  .pwa-install-banner {
    bottom: 24px;
    right: 24px;
    left: auto;
    margin: 0;
    width: 480px;
  }
}

.pwa-banner-icon {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.border-sand {
  border: 1.5px solid rgba(217, 185, 140, 0.4) !important;
}

.text-forest {
  color: #173F35 !important;
}

.text-deep-green {
  color: #102D27 !important;
}

.text-sand-light {
  color: rgba(245, 237, 224, 0.85) !important;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.step-card {
  background: #FFFFFF;
  border: 1px solid rgba(23, 63, 53, 0.08);
}

.step-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #FAF8F2;
  color: #173F35;
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(217, 185, 140, 0.4);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(30px);
  opacity: 0;
}
</style>
