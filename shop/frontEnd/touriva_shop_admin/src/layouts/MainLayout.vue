<template>
  <v-app class="editorial-admin-app">
    <!-- Sidebar Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      name="drawer"
      class="touriva-sidebar"
      :location="locale === 'ar' ? 'right' : 'left'"
      width="275"
    >
      <!-- Touriva Brand Header -->
      <div class="sidebar-brand-wrapper">
        <div class="sidebar-brand-inner">
          <div class="brand-monogram">T</div>
          <div class="brand-text">
            <div class="brand-title">TOU<span>RIVA</span></div>
            <div class="brand-badge">SHOP ADMIN</div>
          </div>
        </div>
      </div>

      <v-divider class="sidebar-divider"></v-divider>

      <!-- Navigation Sections -->
      <div class="sidebar-nav-container">
        <template v-for="(group, gIdx) in navGroups" :key="gIdx">
          <div class="nav-section-label">{{ $t(group.label) }}</div>
          <v-list density="compact" nav class="pa-0 mb-3">
            <v-list-item
              v-for="item in group.items"
              :key="item.to"
              :to="item.to"
              link
              rounded="lg"
              class="sidebar-nav-item mb-1"
              active-class="nav-item-active"
            >
              <template v-slot:prepend>
                <v-icon :icon="item.icon" size="20" class="me-3 nav-icon"></v-icon>
              </template>
              <v-list-item-title class="nav-title">{{ $t(item.title) }}</v-list-item-title>
              <template v-slot:append v-if="item.badge">
                <span class="nav-item-badge">{{ item.badge }}</span>
              </template>
            </v-list-item>
          </v-list>
        </template>
      </div>

      <!-- Sidebar Footer User Quick Info -->
      <template v-slot:append>
        <div class="sidebar-footer">
          <div class="sidebar-user-card" @click="getUserPage">
            <v-avatar size="36" class="sidebar-avatar">
              <v-icon icon="mdi-account" color="#102D27"></v-icon>
            </v-avatar>
            <div class="user-details">
              <div class="user-name">{{ userEmail || 'Touriva Admin' }}</div>
              <div class="user-role">Administrator</div>
            </div>
            <v-icon icon="mdi-logout" size="18" class="logout-icon" @click.stop="auth_sign_out" title="Logout"></v-icon>
          </div>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- App Top Bar -->
    <v-app-bar
      elevation="0"
      class="touriva-app-bar"
      height="68"
    >
      <v-app-bar-nav-icon
        variant="text"
        color="forestGreen"
        class="me-2"
        @click="drawer = !drawer"
      ></v-app-bar-nav-icon>

      <!-- Page / Breadcrumb Indicator -->
      <div class="d-flex align-center">
        <span class="app-bar-title font-serif">{{ currentRouteTitle }}</span>
        <span class="app-bar-tag ms-3 d-none d-sm-inline-block">Editorial Shop</span>
      </div>

      <v-spacer></v-spacer>

      <!-- Language Switcher Toggle -->
      <v-menu location="bottom end">
        <template v-slot:activator="{ props }">
          <v-btn
            variant="text"
            rounded="pill"
            class="lang-switcher-btn me-2"
            v-bind="props"
            size="small"
          >
            <v-icon icon="mdi-translate" size="18" class="me-1"></v-icon>
            <span class="text-uppercase font-weight-bold">{{ currentLocaleText }}</span>
          </v-btn>
        </template>
        <v-list class="editorial-menu-list" density="compact">
          <v-list-item @click="setLanguage('en')">
            <v-list-item-title>English</v-list-item-title>
          </v-list-item>
          <v-list-item @click="setLanguage('fr')">
            <v-list-item-title>Français</v-list-item-title>
          </v-list-item>
          <v-list-item @click="setLanguage('ar')">
            <v-list-item-title>العربية (Arabic)</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <!-- Messages / Inbox Button -->
      <v-btn
        icon
        variant="text"
        color="forestGreen"
        class="action-btn me-1"
        :loading="!inboxes.getInboxes"
        @click="dialogInbox = true"
        title="Messages"
      >
        <v-badge
          color="#21866B"
          :content="inboxes.getInboxes ? inboxes.getInboxes.length : 0"
          :value="inboxes.getInboxes ? inboxes.getInboxes.length : 0"
          offset-x="3"
          offset-y="3"
        >
          <v-icon icon="mdi-email-outline" size="22"></v-icon>
        </v-badge>
      </v-btn>

      <!-- Pending Orders / Alerts Button -->
      <v-btn
        icon
        variant="text"
        color="forestGreen"
        class="action-btn me-2"
        :loading="!orders.getPendingOrder"
        @click="dialog = true"
        title="Alerts"
      >
        <v-badge
          color="#D9943B"
          :content="alertLength"
          :value="alertLength"
          offset-x="3"
          offset-y="3"
        >
          <v-icon icon="mdi-bell-outline" size="22"></v-icon>
        </v-badge>
      </v-btn>

      <!-- User Profile Menu -->
      <v-menu location="bottom end" transition="slide-y-transition">
        <template v-slot:activator="{ props }">
          <v-btn
            variant="text"
            rounded="pill"
            class="user-profile-btn px-2"
            v-bind="props"
          >
            <v-avatar size="34" color="forestGreen">
              <v-icon icon="mdi-account" color="sandLight" size="20"></v-icon>
            </v-avatar>
            <span class="user-profile-name ms-2 d-none d-md-inline-block">{{ userShortName }}</span>
            <v-icon icon="mdi-chevron-down" size="18" class="ms-1 text-secondary"></v-icon>
          </v-btn>
        </template>

        <v-card class="editorial-card pa-2" width="220">
          <div class="px-3 py-2 border-b">
            <div class="text-caption text-secondary-editorial">Signed in as</div>
            <div class="text-subtitle-2 font-weight-bold text-truncate text-forest">{{ userEmail || 'Administrator' }}</div>
          </div>
          <v-list density="compact" nav class="pa-1">
            <v-list-item
              v-for="(item, index) in menuItems"
              :key="index"
              @click="generateProfilMenu(item)"
              rounded="lg"
              class="menu-list-item"
            >
              <template v-slot:prepend>
                <v-icon :icon="item.icon" size="18" :color="item.color" class="me-2"></v-icon>
              </template>
              <v-list-item-title>{{ $t(item.title) }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </v-app-bar>

    <!-- Main View Content Area -->
    <v-main class="main-content-area">
      <router-view></router-view>
    </v-main>

    <!-- Pending Orders Alert Modal -->
    <v-dialog v-model="dialog" max-width="700px">
      <v-card class="editorial-dialog-card">
        <div class="editorial-dialog-header">
          <div class="d-flex align-center">
            <v-icon icon="mdi-bell-ring-outline" color="sand" class="me-2"></v-icon>
            <span class="dialog-title font-serif">Pending Orders & Alerts</span>
          </div>
          <v-btn icon="mdi-close" variant="text" density="compact" color="white" @click="close"></v-btn>
        </div>
        <v-card-text class="pa-4">
          <AlertOrder
            v-model="dialog"
            :orders="orders.getPendingOrder"
            v-if="orders.getPendingOrder?.length > 0"
          />
          <div v-else class="text-center py-6 text-secondary-editorial">
            <v-icon icon="mdi-check-circle-outline" size="48" color="success" class="mb-2"></v-icon>
            <div class="text-body-1 font-weight-medium">All caught up!</div>
            <div class="text-caption">No pending order alerts at this moment.</div>
          </div>
        </v-card-text>
        <div class="editorial-dialog-actions d-flex justify-end">
          <v-btn class="btn-editorial-primary px-6" @click="confirm">OK</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Inboxes Messages Modal -->
    <v-dialog v-model="dialogInbox" max-width="700px">
      <v-card class="editorial-dialog-card">
        <div class="editorial-dialog-header">
          <div class="d-flex align-center">
            <v-icon icon="mdi-email-outline" color="sand" class="me-2"></v-icon>
            <span class="dialog-title font-serif">Inbox & Communications</span>
          </div>
          <v-btn icon="mdi-close" variant="text" density="compact" color="white" @click="dialogInbox = false"></v-btn>
        </div>
        <v-card-text class="pa-4">
          <alert-inboxes
            :inboxes="inboxes.getInboxes"
          />
        </v-card-text>
        <div class="editorial-dialog-actions d-flex justify-end">
          <v-btn class="btn-editorial-sand px-6" @click="dialogInbox = false">Close</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useLocale } from 'vuetify'
  import { useUsersStore } from '@/stores/users'
  import { useAuthStore } from '@/stores/auth'
  import { useOrdersStore } from '@/stores/orders'
  import { useInboxesStore } from '@/stores/inboxes'

  import AlertOrder from '@/components/AlertOrder.vue'
  import AlertInboxes from '@/components/AlertInboxes.vue'

  const { current } = useLocale()
  const { locale } = useI18n()
  const user = useUsersStore()
  const auth = useAuthStore()
  const orders = useOrdersStore()
  const inboxes = useInboxesStore()
  const router = useRouter()
  const route = useRoute()

  const drawer = ref(null)
  const dialog = ref(false)
  const dialogInbox = ref(false)

  // Navigation structure grouped logically
  const navGroups = ref([
    {
      label: 'Dashboard',
      items: [
        { title: 'Home', icon: 'mdi-compass-outline', to: '/' },
        { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/dashboard' }
      ]
    },
    {
      label: 'Products',
      items: [
        { title: 'Products', icon: 'mdi-package-variant-closed', to: '/products' },
        { title: 'Categories', icon: 'mdi-format-list-bulleted-type', to: '/admin/categories' },
        { title: 'Brands', icon: 'mdi-tag-outline', to: '/brands' },
        { title: 'Orders', icon: 'mdi-receipt-text-outline', to: '/orders' }
      ]
    },
    {
      label: 'Marketing & Comms',
      items: [
        { title: 'Ads', icon: 'mdi-bullhorn-outline', to: '/ads' },
        { title: 'Notifications', icon: 'mdi-bell-outline', to: '/notifications' }
      ]
    },
    {
      label: 'Settings',
      items: [
        { title: 'Users', icon: 'mdi-account-group-outline', to: '/users' },
        { title: 'Billing', icon: 'mdi-credit-card-outline', to: '/billing' },
        { title: 'TermsConditions', icon: 'mdi-file-document-outline', to: '/terms&conditions' },
        { title: 'Settings', icon: 'mdi-cog-outline', to: '/setting' },
        { title: 'About', icon: 'mdi-information-outline', to: '/about' }
      ]
    }
  ])

  const menuItems = ref([
    { title: 'Profile', icon: 'mdi-account-circle-outline', function: 'getUserPage', color: '#173F35' },
    { title: 'Logout', icon: 'mdi-logout', function: 'auth_sign_out', color: '#C24545' }
  ])

  const currentRouteTitle = computed(() => {
    const name = route.name || 'Dashboard'
    return String(name)
  })

  const currentLocaleText = computed(() => {
    return locale.value || 'en'
  })

  const setLanguage = (lang) => {
    locale.value = lang
    current.value = lang
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr')
      document.documentElement.setAttribute('lang', lang)
    }
  }

  const userEmail = computed(() => {
    try {
      const ls = JSON.parse(localStorage.getItem('userInfo'))
      return ls?.email || ls?.user?.email || ''
    } catch (e) {
      return ''
    }
  })

  const userShortName = computed(() => {
    if (userEmail.value) {
      return userEmail.value.split('@')[0]
    }
    return 'Admin'
  })

  const alertLength = computed(() => {
    return orders.getPendingOrder?.length || 0
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
    if (item.function === 'auth_sign_out') {
      auth_sign_out()
    } else if (item.function === 'getUserPage') {
      getUserPage()
    }
  }

  onMounted(() => {
    user.fetchUsers()
    orders.fetchOrders()
    inboxes.fetchInboxes()
    if (typeof document !== 'undefined' && locale.value === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl')
    }
  })
</script>

<style scoped>
.editorial-admin-app {
  background-color: var(--color-warm-ivory) !important;
}

/* Sidebar styling */
.touriva-sidebar {
  background-color: #102D27 !important;
  border-right: 1px solid rgba(231, 232, 225, 0.12) !important;
  color: #FFFFFF !important;
}

.sidebar-brand-wrapper {
  padding: 24px 20px 18px 20px;
}

.sidebar-brand-inner {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-monogram {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: linear-gradient(135deg, #D9B98C, #B89564);
  color: #102D27;
  font-family: var(--font-serif);
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(217, 185, 140, 0.3);
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #FAF8F2;
  line-height: 1.1;
}

.brand-title span {
  color: #D9B98C;
}

.brand-badge {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #D9B98C;
  text-transform: uppercase;
  margin-top: 2px;
}

.sidebar-divider {
  border-color: rgba(255, 255, 255, 0.08) !important;
  margin: 0 16px;
}

.sidebar-nav-container {
  padding: 16px 14px;
}

.nav-section-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #B89564;
  padding: 8px 12px 6px 12px;
  margin-top: 6px;
}

.sidebar-nav-item {
  color: #CFD8D5 !important;
  transition: all 0.2s ease !important;
  border-radius: 10px !important;
  margin-bottom: 2px;
}

.sidebar-nav-item:hover {
  background-color: rgba(255, 255, 255, 0.06) !important;
  color: #FFFFFF !important;
}

.nav-item-active {
  background: linear-gradient(90deg, rgba(217, 185, 140, 0.18), rgba(217, 185, 140, 0.05)) !important;
  color: #FAF8F2 !important;
  border-left: 3px solid #D9B98C !important;
  font-weight: 600 !important;
}

[dir="rtl"] .nav-item-active {
  border-left: none !important;
  border-right: 3px solid #D9B98C !important;
}

.nav-item-active .nav-icon {
  color: #D9B98C !important;
}

.nav-title {
  font-size: 0.88rem !important;
  font-weight: 500;
}

.nav-item-badge {
  background-color: #21866B;
  color: white;
  font-size: 0.68rem;
  padding: 2px 7px;
  border-radius: 10px;
  font-weight: 600;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 12px 14px 18px 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-user-card {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.sidebar-user-card:hover {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-avatar {
  background: #D9B98C !important;
  flex-shrink: 0;
}

.user-details {
  margin-left: 10px;
  overflow: hidden;
  flex: 1;
}

[dir="rtl"] .user-details {
  margin-left: 0;
  margin-right: 10px;
}

.user-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: #FFFFFF;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.68rem;
  color: #B89564;
}

.logout-icon {
  color: #E7E8E1;
  opacity: 0.6;
  transition: opacity 0.2s ease, color 0.2s ease;
}

.logout-icon:hover {
  opacity: 1;
  color: #C24545;
}

/* App Bar */
.touriva-app-bar {
  background-color: #FFFFFF !important;
  border-bottom: 1px solid var(--color-border) !important;
  padding: 0 16px;
}

.app-bar-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #102D27;
}

.app-bar-tag {
  background-color: var(--color-sand-light);
  color: var(--color-deep-green);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-sand);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.lang-switcher-btn {
  border: 1px solid var(--color-border);
  color: var(--color-forest-green) !important;
}

.action-btn {
  border-radius: 50% !important;
  transition: background 0.2s ease;
}

.action-btn:hover {
  background-color: var(--color-sand-light) !important;
}

.user-profile-btn {
  border: 1px solid var(--color-border);
  background-color: #FFFFFF;
}

.user-profile-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #102D27;
}

.main-content-area {
  background-color: var(--color-warm-ivory);
  min-height: 100vh;
  padding-bottom: 40px;
}
</style>