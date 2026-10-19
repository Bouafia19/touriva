<template>
  <v-layout class="touriva-admin-app" :class="{ 'rtl-layout': isRtl }">
    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      :location="isRtl ? 'right' : 'left'"
      class="touriva-sidebar"
      width="270"
      elevation="0"
    >
      <!-- Sidebar Brand Header -->
      <div class="sidebar-header d-flex align-center px-5 py-4">
        <div class="brand-logo mr-3">
          <v-avatar size="40" rounded="lg" class="elevation-1" color="deepGreen">
            <v-icon icon="mdi-compass" color="sand" size="26"></v-icon>
          </v-avatar>
        </div>
        <div class="brand-meta">
          <div class="brand-title font-serif">TOU<span class="text-sand">RIVA</span></div>
          <div class="brand-subtitle editorial-tag">{{ $t('AdminPortal') }}</div>
        </div>
      </div>

      <v-divider class="sidebar-divider mx-4"></v-divider>

      <!-- Sidebar Navigation Groups -->
      <div class="sidebar-nav-container py-2">
        <!-- Group 1: Tourism -->
        <div class="nav-section-label px-5 pt-3 pb-1">
          <span>{{ $t('Tourism') }}</span>
        </div>
        <v-list density="compact" nav class="px-3">
          <v-list-item
            v-for="item in tourismItems"
            :key="item.to"
            :to="item.to"
            link
            class="nav-item mb-1"
            active-class="nav-item-active"
          >
            <template v-slot:prepend>
              <v-icon :icon="item.icon" size="20" class="nav-item-icon mr-3"></v-icon>
            </template>
            <v-list-item-title class="nav-item-text">{{ $t(item.title) }}</v-list-item-title>
          </v-list-item>
        </v-list>

        <!-- Group 2: Management -->
        <div class="nav-section-label px-5 pt-4 pb-1">
          <span>{{ $t('Management') }}</span>
        </div>
        <v-list density="compact" nav class="px-3">
          <v-list-item
            v-for="item in managementItems"
            :key="item.to"
            :to="item.to"
            link
            class="nav-item mb-1"
            active-class="nav-item-active"
          >
            <template v-slot:prepend>
              <v-icon :icon="item.icon" size="20" class="nav-item-icon mr-3"></v-icon>
            </template>
            <v-list-item-title class="nav-item-text">{{ $t(item.title) }}</v-list-item-title>
          </v-list-item>
        </v-list>

        <!-- Group 3: Settings -->
        <div class="nav-section-label px-5 pt-4 pb-1">
          <span>{{ $t('Settings') }}</span>
        </div>
        <v-list density="compact" nav class="px-3">
          <v-list-item
            v-for="item in settingsItems"
            :key="item.to"
            :to="item.to"
            link
            class="nav-item mb-1"
            active-class="nav-item-active"
          >
            <template v-slot:prepend>
              <v-icon :icon="item.icon" size="20" class="nav-item-icon mr-3"></v-icon>
            </template>
            <v-list-item-title class="nav-item-text">{{ $t(item.title) }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </div>

      <!-- Sidebar Footer User Profile -->
      <template v-slot:append>
        <div class="sidebar-footer pa-3">
          <div class="user-pill d-flex align-center justify-space-between pa-2 rounded-lg">
            <div class="d-flex align-center overflow-hidden">
              <v-avatar size="34" color="forestGreen" class="mr-2 text-white font-weight-bold">
                {{ adminInitials }}
              </v-avatar>
              <div class="text-truncate">
                <div class="admin-name text-truncate text-white font-weight-medium text-caption">
                  {{ adminUser.email || 'Administrator' }}
                </div>
                <div class="admin-role text-sand text-caption" style="font-size: 0.7rem !important;">
                  Touriva Admin
                </div>
              </div>
            </div>
            <v-btn
              icon="mdi-logout"
              variant="text"
              size="small"
              color="error"
              @click="auth_sign_out"
              :title="$t('Logout')"
            ></v-btn>
          </div>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Top App Bar -->
    <v-app-bar
      elevation="0"
      class="touriva-app-bar px-2"
      height="64"
    >
      <v-app-bar-nav-icon
        @click="drawer = !drawer"
        color="primary"
        class="mr-2"
      ></v-app-bar-nav-icon>

      <!-- Breadcrumb / Route Title -->
      <div class="d-flex flex-column justify-center">
        <div class="app-bar-breadcrumb d-flex align-center">
          <span class="editorial-tag text-sand-dark mr-2">{{ $t('AdminPortal') }}</span>
          <v-icon icon="mdi-chevron-right" size="14" class="text-secondary-editorial mr-2"></v-icon>
          <span class="app-bar-page-title font-weight-bold text-forest">
            {{ currentRouteTitle }}
          </span>
        </div>
      </div>

      <v-spacer></v-spacer>

      <!-- Language Selector -->
      <v-menu location="bottom end">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            variant="text"
            rounded="pill"
            class="lang-selector-btn mx-1 px-3"
            size="small"
          >
            <v-icon icon="mdi-translate" size="18" class="mr-1 text-forest"></v-icon>
            <span class="font-weight-bold text-uppercase text-forest">{{ locale }}</span>
            <v-icon icon="mdi-chevron-down" size="14" class="ml-1 text-secondary-editorial"></v-icon>
          </v-btn>
        </template>
        <v-list density="compact" class="elevation-3 rounded-lg border-editorial">
          <v-list-item
            v-for="lang in availableLanguages"
            :key="lang.code"
            @click="setLanguage(lang.code)"
            :class="{ 'bg-sand-light font-weight-bold': locale === lang.code }"
          >
            <v-list-item-title class="text-caption">
              {{ lang.label }} ({{ lang.code.toUpperCase() }})
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <!-- Alerts / Notification Bell -->
      <v-btn
        icon
        class="mx-1"
        :loading="!user.pendingPartners && !ads.getAds && !announcements.getAnnouncements && !billing.getBillings && !trips.getTrips"
        @click="dialog = true"
        :title="$t('RecentAlerts')"
      >
        <v-badge
          :content="alertLength"
          :value="alertLength"
          color="warning"
          offset-x="2"
          offset-y="2"
        >
          <v-icon icon="mdi-bell-outline" color="primary" size="22"></v-icon>
        </v-badge>
      </v-btn>

      <!-- User Profile Menu -->
      <v-menu location="bottom end">
        <template v-slot:activator="{ props }">
          <v-btn
            icon
            v-bind="props"
            class="user-avatar-btn ml-1"
          >
            <v-avatar size="36" color="forestGreen">
              <span class="text-white font-weight-bold text-caption">{{ adminInitials }}</span>
            </v-avatar>
          </v-btn>
        </template>

        <v-card width="240" class="elevation-4 rounded-lg border-editorial">
          <div class="pa-3 bg-warm-ivory border-bottom">
            <div class="font-weight-bold text-forest text-body-2 text-truncate">
              {{ adminUser.email || 'Administrator' }}
            </div>
            <div class="editorial-tag text-sand-dark" style="font-size: 0.65rem;">
              Touriva Admin
            </div>
          </div>
          <v-list density="compact" nav class="pa-2">
            <v-list-item
              prepend-icon="mdi-account-circle-outline"
              :title="$t('Profile')"
              @click="getUserPage"
              class="rounded-lg mb-1"
            ></v-list-item>
            <v-divider class="my-1"></v-divider>
            <v-list-item
              prepend-icon="mdi-logout"
              :title="$t('Logout')"
              @click="auth_sign_out"
              color="error"
              class="rounded-lg text-error"
            ></v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </v-app-bar>

    <!-- Main Content Area -->
    <v-main class="touriva-main-content">
      <router-view></router-view>
    </v-main>

    <!-- Redesigned Compact Alerts Dialog -->
    <v-dialog v-model="dialog" max-width="840px" persistent scrollable>
      <v-card class="editorial-card rounded-xl overflow-hidden">
        <!-- Dialog Header -->
        <div class="dialog-editorial-header d-flex align-center justify-space-between px-6 py-4 bg-forest-green text-white">
          <div class="d-flex align-center">
            <v-avatar size="36" color="rgba(255,255,255,0.15)" class="mr-3">
              <v-icon icon="mdi-bell-ring-outline" color="sand" size="20"></v-icon>
            </v-avatar>
            <div>
              <div class="font-serif text-h6 font-weight-bold">{{ $t('RecentAlerts') }}</div>
              <div class="text-caption text-sand">{{ alertLength }} {{ $t('PendingApprovals') }}</div>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" color="white" @click="close"></v-btn>
        </div>

        <!-- Dialog Body -->
        <v-card-text class="pa-0 bg-warm-ivory" style="max-height: 65vh;">
          <div v-if="alertLength === 0" class="text-center py-12 px-6">
            <v-avatar size="72" color="sandLight" class="mb-4">
              <v-icon icon="mdi-check-decagram-outline" color="primary" size="40"></v-icon>
            </v-avatar>
            <div class="editorial-title text-forest text-h6 font-weight-bold mb-1">
              {{ $t('AllReviewed') }}
            </div>
            <div class="editorial-subtitle text-secondary-editorial">
              No pending approvals or alerts require immediate attention.
            </div>
          </div>

          <div v-else class="pa-4">
            <!-- Tabs for alert categories -->
            <v-tabs
              v-model="activeAlertTab"
              color="primary"
              bg-color="transparent"
              density="compact"
              class="mb-3 border-bottom"
              show-arrows
            >
              <v-tab value="partners" v-if="user.getPendingPartners?.length">
                {{ $t('roles') }} ({{ user.getPendingPartners.length }})
              </v-tab>
              <v-tab value="trips" v-if="trips.getAlertTrips?.length">
                {{ $t('Trips') }} ({{ trips.getAlertTrips.length }})
              </v-tab>
              <v-tab value="sites" v-if="sites.getAlertSites?.length">
                {{ $t('Sites') }} ({{ sites.getAlertSites.length }})
              </v-tab>
              <v-tab value="hotels" v-if="hotels.getAlertHotels?.length">
                {{ $t('Hotels') }} ({{ hotels.getAlertHotels.length }})
              </v-tab>
              <v-tab value="restaurants" v-if="restaurants.getAlertRestaurants?.length">
                {{ $t('Restaurants') }} ({{ restaurants.getAlertRestaurants.length }})
              </v-tab>
              <v-tab value="billings" v-if="billing.getPendingBilling?.length">
                {{ $t('Billing') }} ({{ billing.getPendingBilling.length }})
              </v-tab>
              <v-tab value="ads" v-if="ads.getAlertAds?.length">
                {{ $t('Ads') }} ({{ ads.getAlertAds.length }})
              </v-tab>
              <v-tab value="announcements" v-if="announcements.getAlertAnnouncements?.length">
                {{ $t('Publications') }} ({{ announcements.getAlertAnnouncements.length }})
              </v-tab>
            </v-tabs>

            <v-tabs-window v-model="activeAlertTab">
              <v-tabs-window-item value="partners" v-if="user.getPendingPartners?.length">
                <AlertPartner :users="user.getPendingPartners" />
              </v-tabs-window-item>

              <v-tabs-window-item value="trips" v-if="trips.getAlertTrips?.length">
                <AlertTrip v-model="dialog" :trips="trips.getAlertTrips" />
              </v-tabs-window-item>

              <v-tabs-window-item value="sites" v-if="sites.getAlertSites?.length">
                <AlertSite v-model="dialog" :sites="sites.getAlertSites" />
              </v-tabs-window-item>

              <v-tabs-window-item value="hotels" v-if="hotels.getAlertHotels?.length">
                <AlertHotel v-model="dialog" :hotels="hotels.getAlertHotels" />
              </v-tabs-window-item>

              <v-tabs-window-item value="restaurants" v-if="restaurants.getAlertRestaurants?.length">
                <AlertRestaurant v-model="dialog" :restaurants="restaurants.getAlertRestaurants" />
              </v-tabs-window-item>

              <v-tabs-window-item value="billings" v-if="billing.getPendingBilling?.length">
                <AlertBilling v-model="dialog" :billings="billing.getPendingBilling" />
              </v-tabs-window-item>

              <v-tabs-window-item value="ads" v-if="ads.getAlertAds?.length">
                <AlertAds :ads="ads.getAlertAds" />
              </v-tabs-window-item>

              <v-tabs-window-item value="announcements" v-if="announcements.getAlertAnnouncements?.length">
                <AlertPublication :announcements="announcements.getAlertAnnouncements" />
              </v-tabs-window-item>
            </v-tabs-window>
          </div>
        </v-card-text>

        <!-- Dialog Actions -->
        <v-divider></v-divider>
        <v-card-actions class="px-6 py-3 bg-white">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            rounded="pill"
            class="px-5 font-weight-medium"
            @click="close"
          >
            {{ $t('Cancel') }}
          </v-btn>
          <v-btn
            class="btn-editorial-primary px-6"
            rounded="pill"
            @click="confirm"
          >
            {{ $t('OK') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLocale } from 'vuetify'

import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import { useAnnouncementsStore } from '@/stores/announcements'
import { useAdsStore } from '@/stores/advertising'
import { useBillingsStore } from '@/stores/billings'
import { useTripsStore } from '@/stores/trips'
import { useSitesStore } from '@/stores/sites'
import { useHotelsStore } from '@/stores/hotels'
import { useRestaurantsStore } from '@/stores/restaurants'

import AlertPartner from '@/components/AlertPartner.vue'
import AlertAds from '@/components/AlertAds.vue'
import AlertPublication from '@/components/AlertPublication.vue'
import AlertBilling from '@/components/AlertBilling.vue'
import AlertTrip from '@/components/AlertTrip.vue'
import AlertSite from '@/components/AlertSite.vue'
import AlertHotel from '@/components/AlertHotel.vue'
import AlertRestaurant from '@/components/AlertRestaurant.vue'

const { current } = useLocale()
const { locale, t, te } = useI18n()
const router = useRouter()
const route = useRoute()

const user = useUsersStore()
const auth = useAuthStore()
const ads = useAdsStore()
const announcements = useAnnouncementsStore()
const billing = useBillingsStore()
const trips = useTripsStore()
const sites = useSitesStore()
const hotels = useHotelsStore()
const restaurants = useRestaurantsStore()

const drawer = ref(true)
const dialog = ref(false)
const activeAlertTab = ref('partners')

const isRtl = computed(() => locale.value === 'ar')

const availableLanguages = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' }
]

const setLanguage = (langCode) => {
  locale.value = langCode
  current.value = langCode
  document.documentElement.setAttribute('dir', langCode === 'ar' ? 'rtl' : 'ltr')
  document.documentElement.setAttribute('lang', langCode)
}

// Tourism navigation group
const tourismItems = ref([
  { title: 'Home', icon: 'mdi-home-outline', to: '/' },
  { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/dashboard' },
  { title: 'Trips', icon: 'mdi-compass-outline', to: '/trips' },
  { title: 'TripSubscriptions', icon: 'mdi-ticket-confirmation-outline', to: '/tripSubscriptions' },
  { title: 'Sites', icon: 'mdi-map-marker-radius-outline', to: '/sites' },
  { title: 'Hotels', icon: 'mdi-bed-outline', to: '/hotels' },
  { title: 'Restaurants', icon: 'mdi-silverware-fork-knife', to: '/restaurants' },
  { title: 'Activities', icon: 'mdi-calendar-clock-outline', to: '/activities' },
  { title: 'Location', icon: 'mdi-map-outline', to: '/location' }
])

// Management navigation group
const managementItems = ref([
  { title: 'Users', icon: 'mdi-account-group-outline', to: '/users' },
  { title: 'Billing', icon: 'mdi-wallet-outline', to: '/billing' },
  { title: 'Notifications', icon: 'mdi-bell-outline', to: '/notifications' },
  { title: 'Ads', icon: 'mdi-bullhorn-outline', to: '/ads' },
  { title: 'Publications', icon: 'mdi-newspaper-variant-outline', to: '/publications' },
  { title: 'Categories', icon: 'mdi-shape-outline', to: '/admin/categories' }
])

// Settings navigation group
const settingsItems = ref([
  { title: 'Settings', icon: 'mdi-cog-outline', to: '/setting' },
  { title: 'TermsConditions', icon: 'mdi-file-document-outline', to: '/terms&conditions' },
  { title: 'About', icon: 'mdi-information-outline', to: '/about' }
])

const menuItems = ref([
  { title: 'Profile', icon: 'mdi-account-circle', function: 'getUserPage', color: '#173F35' },
  { title: 'Logout', icon: 'mdi-logout', function: 'auth_sign_out', color: '#C24545' }
])

const adminUser = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('userInfo')) || {}
  } catch (e) {
    return {}
  }
})

const adminInitials = computed(() => {
  const email = adminUser.value.email || 'Admin'
  return email.charAt(0).toUpperCase()
})

const currentRouteTitle = computed(() => {
  const name = route.name
  if (!name) return 'Dashboard'
  return te(name) ? t(name) : name
})

const auth_sign_out = () => {
  auth.account_sign_out()
}

const getUserPage = () => {
  router.push({ path: '/user' })
}

const close = () => {
  dialog.value = false
}

const confirm = () => {
  dialog.value = false
}

const generateProfilMenu = (item) => {
  switch (item.function) {
    case 'auth_sign_out':
      auth_sign_out()
      break
    case 'getUserPage':
      getUserPage()
      break
  }
}

const generateRoutes = (item) => {
  switch (item.action) {
    case 'auth_sign_out':
      auth_sign_out()
      break
    case 'getUserPage':
      getUserPage()
      break
  }
}

const alertLength = computed(() => {
  const pUsers = user.getPendingPartners?.length || 0
  const pAds = ads.getAlertAds?.length || 0
  const pAnnounce = announcements.getAlertAnnouncements?.length || 0
  const pBilling = billing.getPendingBilling?.length || 0
  const pTrips = trips.getAlertTrips?.length || 0
  const pSites = sites.getAlertSites?.length || 0
  const pHotels = hotels.getAlertHotels?.length || 0
  const pRestaurants = restaurants.getAlertRestaurants?.length || 0
  return pUsers + pAds + pAnnounce + pBilling + pTrips + pSites + pHotels + pRestaurants
})

// Auto-select the first non-empty alert tab when dialog opens
watch(dialog, (isOpen) => {
  if (isOpen) {
    if (user.getPendingPartners?.length) activeAlertTab.value = 'partners'
    else if (trips.getAlertTrips?.length) activeAlertTab.value = 'trips'
    else if (sites.getAlertSites?.length) activeAlertTab.value = 'sites'
    else if (hotels.getAlertHotels?.length) activeAlertTab.value = 'hotels'
    else if (restaurants.getAlertRestaurants?.length) activeAlertTab.value = 'restaurants'
    else if (billing.getPendingBilling?.length) activeAlertTab.value = 'billings'
    else if (ads.getAlertAds?.length) activeAlertTab.value = 'ads'
    else if (announcements.getAlertAnnouncements?.length) activeAlertTab.value = 'announcements'
  }
})

onMounted(() => {
  // Sync document dir on initial mount
  if (locale.value === 'ar') {
    document.documentElement.setAttribute('dir', 'rtl')
  }
  user.fetchUsers()
  ads.fetchAds()
  announcements.fetchAnnouncements()
  billing.fetchBillings()
  trips.fetchTrips()
  sites.fetchSites()
  hotels.fetchHotels()
  restaurants.fetchRestaurants()
})
</script>

<style scoped>
.touriva-admin-app {
  background-color: var(--color-warm-ivory);
  min-height: 100vh;
}

/* Sidebar Styles */
.touriva-sidebar {
  background-color: var(--color-deep-green) !important;
  border-right: 1px solid rgba(231, 232, 225, 0.12) !important;
}

.brand-title {
  color: #FFFFFF;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.1;
}

.brand-subtitle {
  color: var(--color-sand);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.sidebar-divider {
  border-color: rgba(255, 255, 255, 0.08) !important;
}

.nav-section-label {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #7C958C;
}

.nav-item {
  color: #D3DFDB !important;
  border-radius: 8px !important;
  margin-bottom: 2px !important;
  transition: all 0.18s ease !important;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.07) !important;
  color: #FFFFFF !important;
}

.nav-item-active {
  background-color: rgba(217, 185, 140, 0.14) !important;
  color: var(--color-sand) !important;
  font-weight: 600 !important;
  border-left: 3px solid var(--color-sand) !important;
}

[dir="rtl"] .nav-item-active {
  border-left: none !important;
  border-right: 3px solid var(--color-sand) !important;
}

.nav-item-icon {
  opacity: 0.85;
}

.nav-item-active .nav-item-icon {
  color: var(--color-sand) !important;
  opacity: 1;
}

.user-pill {
  background-color: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* App Bar Styles */
.touriva-app-bar {
  background-color: #FFFFFF !important;
  border-bottom: 1px solid var(--color-border) !important;
}

.app-bar-page-title {
  font-size: 1.0625rem;
  letter-spacing: -0.01em;
}

.lang-selector-btn {
  border: 1px solid var(--color-border);
  background-color: var(--color-warm-ivory);
}

.touriva-main-content {
  background-color: var(--color-warm-ivory);
  min-height: calc(100vh - 64px);
}
</style>