<template>
  <v-app class="editorial-app bg-warm-ivory">
    <!-- Mobile Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      temporary
      :location="isRtl ? 'right' : 'left'"
      color="#102D27"
      class="editorial-drawer"
      v-if="isMobile"
      width="300"
    >
      <div class="pa-5 d-flex align-center justify-space-between border-b-dark">
        <div class="d-flex align-center">
          <v-img
            src="/logo-dark.svg"
            alt="Touriva"
            width="125"
            height="34"
            contain
          />
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          color="white"
          @click="drawer = false"
          size="small"
          aria-label="Close navigation"
        ></v-btn>
      </div>

      <!-- User Profile in Drawer -->
      <div v-if="isAuthenticated && users.getUser" class="pa-4 bg-deep-green-alt border-b-dark">
        <div class="d-flex align-center">
          <v-avatar size="42" color="#D9B98C" class="me-3">
            <v-img :src="photo || avatar" cover />
          </v-avatar>
          <div class="overflow-hidden">
            <div class="text-white font-weight-bold text-truncate text-body-1">
              {{ users.getUser.firstName }} {{ users.getUser.lastName }}
            </div>
            <div class="text-caption text-sand text-truncate">
              {{ users.getUser.email }}
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation List -->
      <v-list class="pa-3" nav density="comfortable">
        <v-list-item
          v-for="item in navLinks"
          :key="item.route"
          :to="item.route"
          link
          rounded="lg"
          class="mb-1 text-white editorial-nav-item"
          active-color="#D9B98C"
          @click="drawer = false"
        >
          <template #prepend>
            <v-icon :icon="item.icon" color="#D9B98C" class="me-3" size="20"></v-icon>
          </template>
          <v-list-item-title class="font-weight-medium">
            {{ $t(item.title) }}
          </v-list-item-title>
        </v-list-item>

        <!-- B2B Travel Agency Space Mobile Link: Direct Navigation to Agency Portal / Login -->
        <v-list-item
          to="/agency/dashboard"
          link
          rounded="lg"
          class="mb-1 text-sand font-weight-bold"
          style="background: rgba(217, 185, 140, 0.12); border: 1px solid rgba(217, 185, 140, 0.3);"
          @click="drawer = false; goToAgencyPortal()"
        >
          <template #prepend>
            <v-icon icon="mdi-domain" color="#D9B98C" class="me-3" size="20"></v-icon>
          </template>
          <v-list-item-title class="font-weight-bold text-sand">
            {{ $t('b2bNavTitle') }}
          </v-list-item-title>
        </v-list-item>

        <!-- Contact & Support Link in Mobile Drawer -->
        <v-list-item
          to="/contactSupport"
          link
          rounded="lg"
          class="mb-1 text-white"
          @click="drawer = false"
        >
          <template #prepend>
            <v-icon icon="mdi-face-agent" color="#D9B98C" class="me-3" size="20"></v-icon>
          </template>
          <v-list-item-title>{{ $t('contactSupport') }}</v-list-item-title>
        </v-list-item>


        <v-divider class="my-3 border-dark"></v-divider>

        <!-- Auth Links -->
        <template v-if="!isAuthenticated">
          <v-list-item to="/login" link rounded="lg" class="mb-1 text-white" @click="drawer = false">
            <template #prepend>
              <v-icon icon="mdi-login" color="#21866B" class="me-3" size="20"></v-icon>
            </template>
            <v-list-item-title>{{ $t('Login') }}</v-list-item-title>
          </v-list-item>
          <v-list-item to="/signup" link rounded="lg" class="mb-1 text-sand" @click="drawer = false">
            <template #prepend>
              <v-icon icon="mdi-account-plus" color="#D9B98C" class="me-3" size="20"></v-icon>
            </template>
            <v-list-item-title>{{ $t('SignUp') }}</v-list-item-title>
          </v-list-item>
        </template>
        <template v-else>
          <v-list-item to="/subscriptions" link rounded="lg" class="mb-1 text-white" @click="drawer = false">
            <template #prepend>
              <v-icon icon="mdi-ticket-confirmation-outline" color="#D9B98C" class="me-3" size="20"></v-icon>
            </template>
            <v-list-item-title>{{ $t('Subscriptions') }}</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="isAgencyUser" to="/agency/dashboard" link rounded="lg" class="mb-1 text-emerald-light" @click="drawer = false">
            <template #prepend>
              <v-icon icon="mdi-domain" color="#21866B" class="me-3" size="20"></v-icon>
            </template>
            <v-list-item-title class="font-weight-bold">Espace Agence</v-list-item-title>
          </v-list-item>
          <v-list-item to="/updateProfile" link rounded="lg" class="mb-1 text-white" @click="drawer = false">
            <template #prepend>
              <v-icon icon="mdi-account-cog-outline" color="#D9B98C" class="me-3" size="20"></v-icon>
            </template>
            <v-list-item-title>{{ $t('profile') }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="drawer = false; authSignOut()" link rounded="lg" class="mb-1 text-red-lighten-2">
            <template #prepend>
              <v-icon icon="mdi-logout" color="error" class="me-3" size="20"></v-icon>
            </template>
            <v-list-item-title>{{ $t('logOut') }}</v-list-item-title>
          </v-list-item>
        </template>
      </v-list>

      <!-- Language Selector in Drawer -->
      <div class="pa-4 mt-auto">
        <div class="text-caption text-grey-lighten-1 mb-2 font-weight-bold">
          LANGUAGE / LANGUE / اللغة
        </div>
        <div class="d-flex ga-2">
          <v-btn
            v-for="lang in locals"
            :key="lang.value"
            size="small"
            :variant="locale === lang.value ? 'flat' : 'outlined'"
            :color="locale === lang.value ? '#21866B' : 'grey-lighten-2'"
            class="flex-grow-1 text-capitalize"
            @click="changeLanguage(lang.value)"
          >
            {{ lang.label }}
          </v-btn>
        </div>
      </div>
    </v-navigation-drawer>

    <!-- Desktop Editorial Top Navigation Bar -->
    <v-app-bar
      elevation="0"
      color="#173F35"
      height="76"
      class="editorial-app-bar border-b"
      style="border-color: rgba(217, 185, 140, 0.2) !important;"
    >
      <v-container class="d-flex align-center justify-space-between fill-height px-3 px-sm-4 px-md-6 px-lg-8 max-w-container">
        <!-- Brand Identity -->
        <div class="d-flex align-center cursor-pointer header-brand-area" @click="router.push('/')">
          <!-- Mobile Drawer Activator -->
          <v-app-bar-nav-icon
            v-if="isMobile"
            color="#D9B98C"
            @click.stop="drawer = !drawer"
            class="me-1 me-sm-2 header-nav-icon"
            aria-label="Open navigation menu"
          ></v-app-bar-nav-icon>

          <v-img
            src="/logo-dark.svg"
            alt="Touriva"
            class="header-brand-logo"
            contain
          />
          <span class="d-none d-xl-inline-block text-sand ms-3 text-caption font-weight-medium ps-3 brand-tagline">
            {{ $t('tagline') }}
          </span>
        </div>

        <!-- Desktop Navigation Items -->
        <div v-if="!isMobile" class="align-center nav-items-group ga-1 ga-xl-2">
          <v-btn
            v-for="item in navLinks"
            :key="item.route"
            :to="item.route"
            variant="text"
            rounded="pill"
            class="text-capitalize font-weight-medium nav-link-btn"
            :class="{ 'active-nav-link': route.path === item.route }"
          >
            {{ $t(item.title) }}
          </v-btn>

          <!-- B2B Travel Agency Space Link: Direct Navigation to Agency Portal / Login -->
          <v-btn
            to="/agency/dashboard"
            variant="outlined"
            rounded="pill"
            class="text-sand border-sand-btn nav-b2b-btn font-weight-bold text-capitalize"
            @click="goToAgencyPortal"
          >
            <v-icon start size="15" color="#D9B98C" class="me-1">mdi-domain</v-icon>
            <span>{{ $t('b2bNavTitle') }}</span>
          </v-btn>
        </div>

        <!-- Right Action Dock: Language + User Profile -->
        <div class="d-flex align-center ga-1 ga-sm-2 action-dock">

          <!-- Language Selector -->
          <v-menu :location="isRtl ? 'bottom start' : 'bottom end'" transition="slide-y-transition">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                variant="outlined"
                rounded="pill"
                size="small"
                class="text-sand border-sand-btn lang-btn px-2 px-md-3"
              >
                <v-icon start size="15" class="me-1">mdi-web</v-icon>
                <span class="d-none d-lg-inline">{{ currentLangLabel }}</span>
                <span class="d-lg-none text-uppercase">{{ locale }}</span>
                <v-icon end size="13" class="ms-1">mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-list class="editorial-menu-list elevation-3" rounded="lg" density="compact">
              <v-list-item
                v-for="lang in locals"
                :key="lang.value"
                @click="changeLanguage(lang.value)"
                :class="{ 'bg-sand-light': locale === lang.value }"
              >
                <v-list-item-title class="font-weight-medium text-body-2">
                  {{ lang.label }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

          <!-- User Authentication Section -->
          <template v-if="!isAuthenticated">
            <v-btn
              to="/login"
              variant="text"
              color="#FAF8F2"
              class="d-none d-sm-inline-flex text-capitalize font-weight-medium auth-nav-btn"
              rounded="pill"
            >
              {{ $t('Login') }}
            </v-btn>
            <v-btn
              to="/signup"
              color="#D9B98C"
              class="btn-editorial-sand text-capitalize font-weight-bold d-none d-sm-inline-flex auth-nav-btn auth-signup-btn"
              rounded="pill"
              elevation="1"
            >
              {{ $t('SignUp') }}
            </v-btn>
          </template>

          <template v-else>
            <v-menu :location="isRtl ? 'bottom start' : 'bottom end'" transition="slide-y-transition">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon variant="text" class="avatar-activator">
                  <v-avatar size="36" color="#D9B98C" class="border-sand">
                    <v-img :src="photo || avatar" cover />
                  </v-avatar>
                </v-btn>
              </template>
              <v-list class="editorial-menu-list elevation-4 py-2" rounded="lg" min-width="220">
                <div class="px-4 py-2 border-b">
                  <div class="font-weight-bold text-body-2 text-forest">
                    {{ users.getUser ? (users.getUser.firstName + ' ' + users.getUser.lastName) : 'Explorer' }}
                  </div>
                  <div class="text-caption text-grey">
                    {{ users.getUser?.email }}
                  </div>
                </div>
                <v-list-item to="/subscriptions" prepend-icon="mdi-ticket-confirmation-outline">
                  <v-list-item-title>{{ $t('Subscriptions') }}</v-list-item-title>
                </v-list-item>
                <v-list-item to="/myTrips" prepend-icon="mdi-map-marker-path">
                  <v-list-item-title>{{ $t('MyTrips') }}</v-list-item-title>
                </v-list-item>
                <v-list-item to="/updateProfile" prepend-icon="mdi-account-cog-outline">
                  <v-list-item-title>{{ $t('profile') }}</v-list-item-title>
                </v-list-item>
                <v-list-item to="/contactSupport" prepend-icon="mdi-face-agent">
                  <v-list-item-title>{{ $t('contactSupport') }}</v-list-item-title>
                </v-list-item>
                <template v-if="isAgencyUser">
                  <v-divider class="my-1"></v-divider>
                  <v-list-item to="/agency/dashboard" prepend-icon="mdi-domain">
                    <v-list-item-title class="font-weight-bold" style="color: #21866B;">Espace Agence</v-list-item-title>
                  </v-list-item>
                </template>
                <v-divider class="my-1"></v-divider>
                <v-list-item @click="authSignOut" prepend-icon="mdi-logout" class="text-error">
                  <v-list-item-title>{{ $t('logOut') }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </div>
      </v-container>
    </v-app-bar>

    <!-- Main View Canvas -->
    <v-main class="editorial-main-content">
      <router-view />
    </v-main>

    <!-- Mobile Bottom Navigation for Native / Phone -->
    <v-bottom-navigation
      v-if="isPhone"
      app
      fixed
      grow
      bg-color="#173F35"
      color="#D9B98C"
      elevation="8"
      height="62"
      class="editorial-bottom-nav border-t"
      style="border-color: rgba(217, 185, 140, 0.2) !important;"
    >
      <v-btn to="/" value="home">
        <v-icon>mdi-compass-outline</v-icon>
        <span class="text-caption">{{ $t('home') }}</span>
      </v-btn>

      <v-btn to="/trips" value="trips">
        <v-icon>mdi-map-marker-path</v-icon>
        <span class="text-caption">{{ $t('Trips') }}</span>
      </v-btn>

      <v-btn to="/sites" value="sites">
        <v-icon>mdi-pillar</v-icon>
        <span class="text-caption">{{ $t('Sites') }}</span>
      </v-btn>

      <v-btn to="/hotels" value="hotels">
        <v-icon>mdi-bed-outline</v-icon>
        <span class="text-caption">{{ $t('Hotels') }}</span>
      </v-btn>

      <v-btn :to="isAuthenticated ? '/updateProfile' : '/login'" value="profile">
        <v-icon>mdi-account-outline</v-icon>
        <span class="text-caption">{{ isAuthenticated ? $t('profile') : $t('Login') }}</span>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDisplay, useLocale } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { Capacitor } from '@capacitor/core'
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import { useAdsSettingsStore } from '@/stores/adsSettings'
import { usePwaStore } from '@/stores/pwa'

const { isRtl } = useLocale()
const { locale } = useI18n()
const { mdAndDown, smAndDown } = useDisplay()
const router = useRouter()
const route = useRoute()

const users = useUsersStore()
const auth = useAuthStore()
const adsSettings = useAdsSettingsStore()
const pwaStore = usePwaStore()

const drawer = ref(false)
const ls = ref(null)
const photo = ref(null)
const avatar = ref(new URL('@/assets/avatar.png', import.meta.url).href)

const isMobile = computed(() => mdAndDown.value)
const isPhone = computed(() => smAndDown.value)

const isAuthenticated = computed(() => {
  return !!ls.value?.token
})

const isAgencyUser = computed(() => {
  const role = users.getUser?.role
  const typeAccount = users.getUser?.typeAccount
  return typeAccount === 'touristAgencies' || role === 'partner' || role === 'administrator'
})

const locals = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'ar', label: 'العربية' }
]

const currentLangLabel = computed(() => {
  const current = locals.find(l => l.value === locale.value)
  return current ? current.label : 'English'
})

// Curated primary navigation links
const navLinks = [
  { title: 'home', route: '/', icon: 'mdi-compass-outline' },
  { title: 'Trips', route: '/trips', icon: 'mdi-map-marker-path' },
  { title: 'Sites', route: '/sites', icon: 'mdi-pillar' },
  { title: 'Hotels', route: '/hotels', icon: 'mdi-bed-outline' },
  { title: 'Restaurants', route: '/restaurants', icon: 'mdi-silverware-fork-knife' },
  { title: 'Subscriptions', route: '/subscriptions', icon: 'mdi-ticket-confirmation-outline' }
]

const changeLanguage = (code) => {
  if (code === 'ar') {
    isRtl.value = true
    document.dir = 'rtl'
  } else {
    isRtl.value = false
    document.dir = 'ltr'
  }
  locale.value = code
  try {
    localStorage.setItem('locale', code)
  } catch (e) {
    // Ignore storage errors
  }
}

const authSignOut = () => {
  auth.account_sign_out()
  ls.value = null
  router.push('/')
}

const goToAgencyPortal = () => {
  router.push('/agency/dashboard')
}

// Retain scrollToAgencySection for hash anchor compatibility
const scrollToAgencySection = () => {
  if (route.path === '/') {
    const el = document.getElementById('agency-space')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  } else {
    router.push({ path: '/', hash: '#agency-space' })
  }
}

onMounted(async () => {
  if (Capacitor.isNativePlatform()) {
    users.loadUser()
  }
  ls.value = await auth.getLSUserInfo()
  adsSettings.fetchAdsSettings()

  const savedLang = localStorage.getItem('locale')
  if (savedLang) {
    changeLanguage(savedLang)
  } else if (locale.value === 'ar') {
    isRtl.value = true
    document.dir = 'rtl'
  } else {
    isRtl.value = false
    document.dir = 'ltr'
  }
})
</script>

<style scoped>
.editorial-app {
  min-height: 100vh;
}

.editorial-app-bar {
  overflow-x: clip;
}

.max-w-container {
  max-width: 1720px;
  width: 100%;
}

.header-brand-area {
  flex-shrink: 0;
}

.header-brand-logo {
  width: 145px;
  height: 38px;
  transition: width 0.2s ease;
}

@media (max-width: 480px) {
  .header-brand-logo {
    width: 115px;
    height: 32px;
  }
}

@media (max-width: 360px) {
  .header-brand-logo {
    width: 102px;
    height: 28px;
  }
}

.brand-tagline {
  border-inline-start: 1px solid rgba(217, 185, 140, 0.3) !important;
  white-space: nowrap;
}

@media (min-width: 1280px) and (max-width: 1380px) {
  .brand-tagline {
    font-size: 0.72rem !important;
    max-width: 170px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.filter-brightness {
  filter: brightness(0) invert(1);
}

.border-b-dark {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.bg-deep-green-alt {
  background-color: #0c231e !important;
}

.border-dark {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.cursor-pointer {
  cursor: pointer;
}

/* Desktop Navigation Links */
.nav-items-group {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.nav-link-btn {
  color: #FAF8F2 !important;
  font-size: 0.88rem;
  letter-spacing: 0.01em;
  padding: 0 12px;
  height: 38px;
  min-width: 0;
  transition: all 0.2s ease;
  white-space: nowrap;
}

@media (min-width: 960px) and (max-width: 1279px) {
  .nav-link-btn {
    font-size: 0.81rem;
    padding: 0 7px;
    height: 34px;
    letter-spacing: 0;
  }
}

@media (min-width: 1280px) and (max-width: 1439px) {
  .nav-link-btn {
    font-size: 0.85rem;
    padding: 0 10px;
    height: 36px;
  }
}

@media (min-width: 1440px) {
  .nav-link-btn {
    font-size: 0.92rem;
    padding: 0 14px;
    height: 40px;
  }
}

.nav-link-btn:hover {
  background-color: rgba(255, 255, 255, 0.08) !important;
  color: #D9B98C !important;
}

.active-nav-link {
  color: #D9B98C !important;
  background-color: rgba(217, 185, 140, 0.12) !important;
}

/* B2B Agency Button in Header */
.nav-b2b-btn {
  color: #D9B98C !important;
  border-color: rgba(217, 185, 140, 0.5) !important;
  font-size: 0.84rem;
  padding: 0 12px;
  height: 36px;
  min-width: 0;
  transition: all 0.2s ease;
  white-space: nowrap;
}

@media (min-width: 960px) and (max-width: 1279px) {
  .nav-b2b-btn {
    font-size: 0.77rem;
    padding: 0 8px;
    height: 32px;
  }
}

@media (min-width: 1280px) and (max-width: 1439px) {
  .nav-b2b-btn {
    font-size: 0.82rem;
    padding: 0 10px;
    height: 34px;
  }
}

.nav-b2b-btn:hover {
  background-color: rgba(217, 185, 140, 0.12) !important;
}

/* Right Action Dock */
.action-dock {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.border-sand-btn {
  border-color: rgba(217, 185, 140, 0.5) !important;
}

.border-sand-btn:hover {
  background-color: rgba(217, 185, 140, 0.1) !important;
}

.lang-btn {
  height: 34px;
  min-width: 0;
  font-size: 0.82rem;
}

@media (min-width: 1280px) {
  .lang-btn {
    height: 36px;
    font-size: 0.85rem;
  }
}

.auth-nav-btn {
  font-size: 0.86rem;
  padding: 0 12px;
  height: 36px;
  min-width: 0;
  white-space: nowrap;
}

@media (min-width: 960px) and (max-width: 1279px) {
  .auth-nav-btn {
    font-size: 0.8rem;
    padding: 0 9px;
    height: 32px;
  }
}

@media (min-width: 1280px) and (max-width: 1439px) {
  .auth-nav-btn {
    font-size: 0.84rem;
    padding: 0 11px;
    height: 34px;
  }
}

@media (min-width: 1440px) {
  .auth-nav-btn {
    font-size: 0.9rem;
    padding: 0 16px;
    height: 38px;
  }
}

.editorial-menu-list {
  background-color: #FFFFFF !important;
  border: 1px solid #E7E8E1 !important;
}

.bg-sand-light {
  background-color: #F5EDE0 !important;
}

.editorial-bottom-nav {
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 9999 !important;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.editorial-bottom-nav .v-btn--active {
  color: #D9B98C !important;
}
</style>
