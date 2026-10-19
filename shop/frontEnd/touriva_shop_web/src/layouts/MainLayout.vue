<template>
  <v-app class="editorial-app">
    <!-- Mobile Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      color="secondary"
      dark
      temporary
      :location="$i18n.locale === 'ar' ? 'right' : 'left'"
      class="shop-mobile-drawer"
    >
      <div class="pa-4 drawer-header border-b-sand">
        <div class="d-flex align-center justify-space-between mb-3">
          <div class="d-flex align-center">
            <div class="shop-logo-mark mr-2">
              <v-icon color="sand" size="24">mdi-compass-outline</v-icon>
            </div>
            <div>
              <span class="editorial-heading text-h6 text-white font-weight-bold">Touriva</span>
              <span class="editorial-tag ml-2 px-2 py-0-5 rounded bg-sand-light text-deep-green">SHOP</span>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" color="sand" @click="drawer = false" />
        </div>

        <!-- User Brief if logged in -->
        <div v-if="users.getUser" class="d-flex align-center mt-3 pt-3 border-t-sand-subtle">
          <v-avatar size="44" color="forestGreen" class="border-sand">
            <v-img :src="photo" v-if="photo"></v-img>
            <v-img :src="avatar" v-else></v-img>
          </v-avatar>
          <div class="ml-3 overflow-hidden">
            <div class="text-subtitle-2 font-weight-bold text-white text-truncate">
              {{ (users.getUser.firstName || '') + ' ' + (users.getUser.lastName || '') }}
            </div>
            <div class="text-caption text-sand text-truncate">{{ users.getUser.email || users.getUser.phone }}</div>
          </div>
        </div>
      </div>

      <v-divider style="border-color: rgba(217, 185, 140, 0.2);" />

      <v-list density="comfortable" nav class="pa-3">
        <!-- Main navigation items -->
        <v-list-item
          prepend-icon="mdi-home-outline"
          :title="$t('Home')"
          @click="navigateTo('/tabs')"
          :active="$route.path === '/tabs' || $route.path === '/'"
          rounded="lg"
          class="mb-1 drawer-nav-item"
        />

        <v-list-item
          prepend-icon="mdi-view-grid-outline"
          :title="$t('Categories')"
          @click="navigateTo('/categories')"
          :active="$route.path === '/categories'"
          rounded="lg"
          class="mb-1 drawer-nav-item"
        />

        <v-list-item
          prepend-icon="mdi-shopping-outline"
          :title="$t('Products') || 'Products'"
          @click="navigateTo('/products')"
          :active="$route.path === '/products'"
          rounded="lg"
          class="mb-1 drawer-nav-item"
        />

        <v-list-item
          prepend-icon="mdi-cart-outline"
          :title="'Shopping Bag'"
          @click="drawer = false; cartStore.openDrawer()"
          rounded="lg"
          class="mb-1 drawer-nav-item"
        >
          <template #append v-if="cartStore.itemCount > 0">
            <v-badge color="sand" :content="cartStore.itemCount" inline class="font-weight-bold" />
          </template>
        </v-list-item>

        <v-list-item
          v-if="ls?.token"
          prepend-icon="mdi-receipt-text-outline"
          :title="$t('Orders') || 'My Orders'"
          @click="navigateTo('/orders')"
          :active="$route.path === '/orders'"
          rounded="lg"
          class="mb-1 drawer-nav-item"
        />

        <v-list-item
          v-if="ls?.token"
          prepend-icon="mdi-bell-outline"
          :title="$t('notifications')"
          @click="navigateTo('/notifications')"
          :active="$route.path === '/notifications'"
          rounded="lg"
          class="mb-1 drawer-nav-item"
        />

        <v-list-item
          v-if="ls?.token"
          prepend-icon="mdi-account-outline"
          :title="$t('profile')"
          @click="navigateTo('/updateProfile')"
          :active="$route.path === '/updateProfile'"
          rounded="lg"
          class="mb-1 drawer-nav-item"
        />

        <v-divider class="my-3" style="border-color: rgba(217, 185, 140, 0.2);" />

        <v-list-item
          prepend-icon="mdi-face-agent"
          :title="$t('contactSupport')"
          @click="navigateTo('/contactSupport')"
          rounded="lg"
          class="mb-1 drawer-nav-item"
        />

        <v-list-item
          prepend-icon="mdi-information-outline"
          :title="$t('termsConditions')"
          @click="navigateTo('/terms&conditions')"
          rounded="lg"
          class="mb-1 drawer-nav-item"
        />

        <!-- Auth buttons in drawer -->
        <div class="mt-4 px-2" v-if="!ls?.token">
          <v-btn
            block
            class="btn-editorial-sand mb-2"
            @click="navigateTo('/login')"
          >
            {{ $t('Login') }}
          </v-btn>
          <v-btn
            block
            variant="outlined"
            color="sand"
            class="rounded-pill"
            @click="navigateTo('/signup')"
          >
            {{ $t('SignUp') }}
          </v-btn>
        </div>

        <v-list-item
          v-else
          prepend-icon="mdi-logout"
          :title="$t('logOut')"
          @click="auth_sign_out"
          rounded="lg"
          class="mt-4 text-error drawer-nav-item"
        />
      </v-list>

      <!-- Drawer language selector footer -->
      <template #append>
        <div class="pa-4 border-t-sand-subtle">
          <div class="text-caption text-sand mb-2">{{ $t('cl') || 'Language' }}</div>
          <div class="d-flex ga-2">
            <v-btn
              v-for="lang in locals"
              :key="lang.value"
              size="small"
              :variant="locale === lang.value ? 'flat' : 'outlined'"
              :color="locale === lang.value ? 'sand' : 'white'"
              class="flex-grow-1 rounded-pill"
              @click="changeLanguage(lang.value)"
            >
              {{ lang.short }}
            </v-btn>
          </div>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Slide-out Shopping Cart Drawer -->
    <v-navigation-drawer
      v-model="cartStore.isDrawerOpen"
      location="right"
      temporary
      width="380"
      class="shop-cart-drawer bg-white elevation-12"
    >
      <div class="pa-4 bg-deep-green text-white d-flex align-center justify-space-between border-b-sand">
        <div class="d-flex align-center">
          <v-icon color="sand" size="22" class="mr-2">mdi-cart-outline</v-icon>
          <span class="editorial-heading text-h6 font-weight-bold">Shopping Bag</span>
          <v-chip size="x-small" color="sand" class="ml-2 font-weight-bold text-deep-green" label>
            {{ cartStore.itemCount }}
          </v-chip>
        </div>
        <v-btn icon="mdi-close" variant="text" size="small" color="sand" @click="cartStore.closeDrawer()" />
      </div>

      <!-- Cart Items List -->
      <div v-if="cartStore.items && cartStore.items.length > 0" class="d-flex flex-column h-100 justify-space-between">
        <div class="pa-4 overflow-y-auto flex-grow-1" style="max-height: calc(100vh - 220px);">
          <div
            v-for="item in cartStore.items"
            :key="item.product._id"
            class="d-flex align-center ga-3 py-3 border-b-editorial"
          >
            <v-avatar size="64" rounded="lg" class="border-editorial bg-warm-ivory flex-shrink-0">
              <v-img :src="item.product.img || fallbackImage" cover />
            </v-avatar>

            <div class="flex-grow-1 overflow-hidden">
              <div class="text-subtitle-2 font-weight-bold text-forest text-truncate">
                {{ item.product.name || item.product.code }}
              </div>
              <div class="text-caption text-secondary-editorial mb-1">
                {{ item.product.price }} DZD
              </div>

              <!-- Quantity selector -->
              <div class="d-flex align-center ga-2">
                <v-btn
                  icon="mdi-minus"
                  variant="outlined"
                  size="x-small"
                  density="compact"
                  color="forestGreen"
                  @click="cartStore.updateQuantity(item.product._id, item.quantity - 1)"
                />
                <span class="text-caption font-weight-bold px-1">{{ item.quantity }}</span>
                <v-btn
                  icon="mdi-plus"
                  variant="outlined"
                  size="x-small"
                  density="compact"
                  color="forestGreen"
                  @click="cartStore.updateQuantity(item.product._id, item.quantity + 1)"
                />
              </div>
            </div>

            <div class="d-flex flex-column align-end">
              <span class="text-subtitle-2 font-weight-bold text-forest mb-2">
                {{ (item.product.price || 0) * item.quantity }} DZD
              </span>
              <v-btn
                icon="mdi-trash-can-outline"
                variant="text"
                size="x-small"
                color="error"
                @click="cartStore.removeFromCart(item.product._id)"
              />
            </div>
          </div>
        </div>

        <!-- Cart Footer Checkout -->
        <div class="pa-4 bg-warm-ivory border-t-editorial">
          <div class="d-flex justify-space-between align-center mb-3">
            <span class="text-subtitle-2 text-secondary-editorial">Total Amount</span>
            <span class="editorial-heading text-h5 font-weight-bold text-forest">
              {{ cartStore.subtotal }} DZD
            </span>
          </div>
          <div class="d-flex flex-column ga-2">
            <v-btn
              block
              class="btn-editorial-primary"
              size="large"
              @click="proceedToCheckout"
            >
              <v-icon start size="18">mdi-lock-outline</v-icon>
              Proceed to Checkout
            </v-btn>
            <v-btn
              block
              variant="text"
              size="small"
              color="error"
              @click="cartStore.clearCart()"
            >
              Clear Bag
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Empty Cart State -->
      <div v-else class="pa-8 text-center d-flex flex-column align-center justify-center fill-height">
        <v-avatar size="72" color="sandLight" class="mb-4">
          <v-icon size="36" color="deepGreen">mdi-cart-off</v-icon>
        </v-avatar>
        <h3 class="editorial-heading text-h6 font-weight-bold text-forest mb-2">Your Bag is Empty</h3>
        <p class="text-body-2 text-secondary-editorial mb-6">
          Explore our artisan collection and curated travel goods.
        </p>
        <v-btn
          class="btn-editorial-primary px-6"
          rounded="pill"
          @click="cartStore.closeDrawer(); router.push('/products')"
        >
          Explore Catalog
        </v-btn>
      </div>
    </v-navigation-drawer>

    <!-- Top App Bar for Desktop and Mobile -->
    <v-app-bar
      color="forestGreen"
      density="comfortable"
      elevation="2"
      height="72"
      class="shop-top-navbar border-b-sand"
    >
      <v-container class="d-flex align-center justify-space-between fill-height pa-0 px-4 max-w-1400">
        <!-- Left: Hamburger (mobile) or Logo (desktop) -->
        <div class="d-flex align-center">
          <v-app-bar-nav-icon
            v-if="isMobile"
            color="sand"
            @click="drawer = !drawer"
            class="mr-1"
          />

          <!-- Brand Logo and Name -->
          <div
            class="d-flex align-center brand-container cursor-pointer"
            @click="getHome"
          >
            <div class="shop-logo-emblem mr-2">
              <v-icon color="sand" size="26">mdi-compass-rose</v-icon>
            </div>
            <div class="d-flex align-center">
              <span class="editorial-heading text-h5 font-weight-bold text-white tracking-wide">
                Touriva
              </span>
              <span class="shop-badge ml-2">SHOP</span>
            </div>
          </div>
        </div>

        <!-- Center: Desktop Navigation Links -->
        <nav v-if="!isMobile" class="d-none d-md-flex align-center ga-1">
          <v-btn
            variant="text"
            rounded="pill"
            class="nav-link-btn"
            :class="{ 'nav-link-active': $route.path === '/tabs' || $route.path === '/' }"
            @click="getHome"
          >
            {{ $t('Home') }}
          </v-btn>

          <v-btn
            variant="text"
            rounded="pill"
            class="nav-link-btn"
            :class="{ 'nav-link-active': $route.path === '/products' }"
            @click="router.push('/products')"
          >
            {{ $t('Products') || 'Products' }}
          </v-btn>

          <v-btn
            variant="text"
            rounded="pill"
            class="nav-link-btn"
            :class="{ 'nav-link-active': $route.path === '/categories' }"
            @click="router.push('/categories')"
          >
            {{ $t('Categories') }}
          </v-btn>

          <v-btn
            v-if="ls?.token"
            variant="text"
            rounded="pill"
            class="nav-link-btn"
            :class="{ 'nav-link-active': $route.path === '/orders' }"
            @click="router.push('/orders')"
          >
            {{ $t('Orders') || 'Orders' }}
          </v-btn>
        </nav>

        <!-- Right: Actions (Language, Cart, Auth / Profile) -->
        <div class="d-flex align-center ga-2">
          <!-- Language Selector -->
          <v-menu location="bottom end" transition="slide-y-transition">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                variant="text"
                rounded="pill"
                size="small"
                class="lang-selector-btn text-white px-3"
              >
                <v-icon start size="18" color="sand">mdi-translate</v-icon>
                <span class="text-caption font-weight-bold">{{ selectedLanguage.short }}</span>
                <v-icon end size="16">mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-list elevation="6" rounded="lg" class="border-editorial py-1">
              <v-list-item
                v-for="lang in locals"
                :key="lang.value"
                :value="lang.value"
                @click="changeLanguage(lang.value)"
                :active="locale === lang.value"
                color="forestGreen"
              >
                <template #prepend>
                  <span class="text-caption font-weight-bold mr-2 text-sand-dark">{{ lang.short }}</span>
                </template>
                <v-list-item-title class="font-sans text-body-2 font-weight-medium">
                  {{ $t(lang.title) }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

          <!-- Shopping Bag Button -->
          <v-btn
            icon
            variant="text"
            color="white"
            class="cart-btn"
            @click="cartStore.openDrawer()"
            title="Shopping Bag"
          >
            <v-badge
              v-if="cartStore.itemCount > 0"
              color="sand"
              :content="cartStore.itemCount"
              class="shop-cart-badge"
            >
              <v-icon size="22" color="sand">mdi-cart-outline</v-icon>
            </v-badge>
            <v-icon v-else size="22">mdi-cart-outline</v-icon>
          </v-btn>

          <!-- User Menu (Logged In) -->
          <v-menu
            v-if="ls?.token"
            location="bottom end"
            transition="slide-y-transition"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                variant="text"
                class="user-avatar-btn pa-1 ml-1"
                rounded="pill"
              >
                <v-avatar size="36" color="deepGreen" class="border-sand">
                  <v-img :src="photo" v-if="photo"></v-img>
                  <v-img :src="avatar" v-else></v-img>
                </v-avatar>
                <v-icon size="16" color="sand" class="ml-1 d-none d-sm-inline-flex">mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-list width="240" elevation="6" rounded="lg" class="border-editorial py-1">
              <div class="px-4 py-3 bg-warm-ivory border-b-sand-subtle">
                <div class="font-weight-bold text-subtitle-2 text-forest">
                  {{ (users.getUser?.firstName || '') + ' ' + (users.getUser?.lastName || '') }}
                </div>
                <div class="text-caption text-secondary-editorial text-truncate">
                  {{ users.getUser?.email || users.getUser?.phone }}
                </div>
              </div>

              <v-list-item
                prepend-icon="mdi-account-outline"
                :title="$t('profile')"
                @click="getProfile"
                class="my-1"
              />
              <v-list-item
                prepend-icon="mdi-receipt-text-outline"
                :title="$t('Orders') || 'My Orders'"
                @click="router.push('/orders')"
                class="my-1"
              />
              <v-list-item
                prepend-icon="mdi-bell-outline"
                :title="$t('notifications')"
                @click="getNotifications"
                class="my-1"
              />
              <v-list-item
                prepend-icon="mdi-face-agent"
                :title="$t('contactSupport')"
                @click="getContactSupport"
                class="my-1"
              />

              <v-divider class="my-1" />

              <v-list-item
                prepend-icon="mdi-logout"
                :title="$t('logOut')"
                @click="auth_sign_out"
                class="text-error my-1"
              />
            </v-list>
          </v-menu>

          <!-- Auth Buttons (Logged Out, Desktop) -->
          <div v-else class="d-none d-sm-flex align-center ga-2 ml-1">
            <v-btn
              variant="text"
              color="white"
              rounded="pill"
              size="small"
              class="font-weight-bold px-3"
              @click="getLogin"
            >
              {{ $t('Login') }}
            </v-btn>

            <v-btn
              class="btn-editorial-sand px-4"
              size="small"
              rounded="pill"
              @click="getSignUp"
            >
              {{ $t('SignUp') }}
            </v-btn>
          </div>
        </div>
      </v-container>
    </v-app-bar>

    <!-- Main Content Area -->
    <v-main class="shop-main-content bg-warm-ivory">
      <router-view v-slot="{ Component, route }">
        <keep-alive :max="20" :include="['Subcategories', 'Products', 'ProductDetail']">
          <component :is="Component" :key="route.fullPath" />
        </keep-alive>
      </router-view>
    </v-main>

    <!-- Mobile Bottom Navigation -->
    <v-bottom-navigation
      v-if="isMobile"
      v-model="mobileNavValue"
      bg-color="deepGreen"
      color="sand"
      grow
      elevation="8"
      density="comfortable"
      class="shop-bottom-nav border-t-sand"
    >
      <v-btn value="home" @click="getHome">
        <v-icon>mdi-home-outline</v-icon>
        <span class="text-caption font-weight-bold">{{ $t('Home') }}</span>
      </v-btn>

      <v-btn value="categories" @click="router.push('/categories')">
        <v-icon>mdi-view-grid-outline</v-icon>
        <span class="text-caption font-weight-bold">{{ $t('Categories') }}</span>
      </v-btn>

      <v-btn value="products" @click="router.push('/products')">
        <v-icon>mdi-shopping-outline</v-icon>
        <span class="text-caption font-weight-bold">{{ $t('Products') || 'Shop' }}</span>
      </v-btn>

      <v-btn value="cart" @click="cartStore.openDrawer()">
        <v-badge
          v-if="cartStore.itemCount > 0"
          color="sand"
          :content="cartStore.itemCount"
          class="shop-cart-badge"
        >
          <v-icon>mdi-cart-outline</v-icon>
        </v-badge>
        <v-icon v-else>mdi-cart-outline</v-icon>
        <span class="text-caption font-weight-bold">Bag</span>
      </v-btn>

      <v-btn value="account" @click="ls?.token ? getProfile() : getLogin()">
        <v-icon>mdi-account-outline</v-icon>
        <span class="text-caption font-weight-bold">{{ ls?.token ? $t('profile') : $t('Login') }}</span>
      </v-btn>
    </v-bottom-navigation>

    <!-- Editorial Footer (Desktop and Tablet) -->
    <footer v-if="!isMobile" class="shop-editorial-footer bg-deep-green text-warm-ivory">
      <v-container class="max-w-1400 py-12">
        <v-row class="mb-8">
          <!-- Col 1: Brand & Editorial Mission -->
          <v-col cols="12" md="4" class="pr-md-8">
            <div class="d-flex align-center mb-3">
              <v-icon color="sand" size="28" class="mr-2">mdi-compass-rose</v-icon>
              <span class="editorial-heading text-h5 font-weight-bold text-white">Touriva Shop</span>
            </div>
            <p class="text-body-2 text-sand-light mb-4 line-height-relaxed">
              Curated artisanal goods, premium travel essentials, and cultural treasures inspired by the landscapes and heritage of Algeria.
            </p>
            <div class="d-flex ga-2">
              <v-btn icon="mdi-instagram" variant="tonal" color="sand" size="small" class="rounded-circle" />
              <v-btn icon="mdi-facebook" variant="tonal" color="sand" size="small" class="rounded-circle" />
              <v-btn icon="mdi-pinterest" variant="tonal" color="sand" size="small" class="rounded-circle" />
            </div>
          </v-col>

          <!-- Col 2: Navigation Links -->
          <v-col cols="12" sm="4" md="2">
            <h4 class="editorial-tag text-sand mb-3 font-weight-bold">{{ $t('Explore') || 'EXPLORE' }}</h4>
            <ul class="footer-nav-list">
              <li><a @click.prevent="getHome" class="footer-link">{{ $t('Home') }}</a></li>
              <li><a @click.prevent="router.push('/products')" class="footer-link">{{ $t('Products') || 'All Products' }}</a></li>
              <li><a @click.prevent="router.push('/categories')" class="footer-link">{{ $t('Categories') }}</a></li>
              <li v-if="ls?.token"><a @click.prevent="router.push('/orders')" class="footer-link">{{ $t('Orders') || 'My Orders' }}</a></li>
            </ul>
          </v-col>

          <!-- Col 3: Customer Care -->
          <v-col cols="12" sm="4" md="3">
            <h4 class="editorial-tag text-sand mb-3 font-weight-bold">{{ $t('CustomerCare') || 'CUSTOMER CARE' }}</h4>
            <ul class="footer-nav-list">
              <li><a @click.prevent="getContactSupport" class="footer-link">{{ $t('contactSupport') }}</a></li>
              <li><a @click.prevent="getTermsConditionsPage" class="footer-link">{{ $t('termsConditions') }}</a></li>
              <li><a @click.prevent="router.push('/orders')" class="footer-link">{{ $t('TrackOrder') || 'Order Tracking' }}</a></li>
              <li><a @click.prevent="getProApp" class="footer-link">{{ $t('professional') || 'Partner Portal' }}</a></li>
            </ul>
          </v-col>

          <!-- Col 4: Contact & Assurance -->
          <v-col cols="12" sm="4" md="3">
            <h4 class="editorial-tag text-sand mb-3 font-weight-bold">{{ $t('Contact') || 'CONTACT' }}</h4>
            <div class="text-body-2 text-sand-light mb-2 d-flex align-center">
              <v-icon size="18" color="sand" class="mr-2">mdi-email-outline</v-icon>
              <span>support@touriva.com</span>
            </div>
            <div class="text-body-2 text-sand-light mb-2 d-flex align-center">
              <v-icon size="18" color="sand" class="mr-2">mdi-phone-outline</v-icon>
              <span>+213 550 000 000</span>
            </div>
            <div class="text-body-2 text-sand-light d-flex align-center">
              <v-icon size="18" color="sand" class="mr-2">mdi-map-marker-outline</v-icon>
              <span>Algiers, Algeria</span>
            </div>
          </v-col>
        </v-row>

        <v-divider style="border-color: rgba(217, 185, 140, 0.2);" class="my-6" />

        <div class="d-flex flex-column flex-sm-row justify-space-between align-center text-caption text-sand">
          <div>
            &copy; {{ new Date().getFullYear() }} Touriva. {{ $t('AllRightsReserved') || 'All rights reserved.' }}
          </div>
          <div class="d-flex align-center mt-2 mt-sm-0 ga-4">
            <span>DZD (Algerian Dinar)</span>
            <span>•</span>
            <span class="font-serif italic">Premium Travel Editorial</span>
          </div>
        </div>
      </v-container>
    </footer>
  </v-app>
</template>

<script setup>
  import { ref, onMounted, computed, watch } from 'vue'
  import { useDisplay, useLocale } from "vuetify"
  import { useRouter, useRoute } from 'vue-router'
  import { Capacitor } from '@capacitor/core'
  import { useI18n } from 'vue-i18n'
  import { useUsersStore } from '@/stores/users'
  import { useAuthStore } from '@/stores/auth'
  import { useAdsSettingsStore } from '@/stores/adsSettings'
  import { useCategoriesStore } from '@/stores/categories'
  import { useOrdersStore } from '@/stores/orders'
  import { useCartStore } from '@/stores/cart'

  const { isRtl } = useLocale()
  const { locale } = useI18n()
  const users = useUsersStore()
  const adsSettings = useAdsSettingsStore()
  const categories = useCategoriesStore()
  const orders = useOrdersStore()
  const cartStore = useCartStore()
  const auth = useAuthStore()
  const router = useRouter()
  const route = useRoute()

  const drawer = ref(false)
  const mobileNavValue = ref('home')
  const photo = ref(null)
  const avatar = ref(new URL('@/assets/avatar.png', import.meta.url).href)
  const fallbackImage = ref(new URL('@/assets/online-shop.png', import.meta.url).href)
  const ls = ref(null)
  const platform = ref('')

  const locals = ref([
    { value: "ar", title: "arabic", short: "العربية" },
    { value: "fr", title: "french", short: "FR" },
    { value: "en", title: "english", short: "EN" }
  ])

  // Responsive display logic
  const { smAndDown } = useDisplay()
  const isMobile = computed(() => smAndDown.value)

  const selectedLanguage = computed(() =>
    locals.value.find((lang) => lang.value === locale.value) || locals.value[0]
  )

  const orderCount = computed(() => {
    if (orders.getOrders && Array.isArray(orders.getOrders)) {
      return orders.getOrders.length
    }
    return 0
  })

  // Change language function with RTL support
  const changeLanguage = (code) => {
    if (code === 'ar') {
      isRtl.value = true
      document.dir = 'rtl'
    } else {
      isRtl.value = false
      document.dir = 'ltr'
    }
    locale.value = code
  }

  const navigateTo = (path) => {
    drawer.value = false
    router.push(path)
  }

  const getProfile = () => {
    router.push({ path: '/updateProfile' })
  }

  const getHome = () => {
    if (route.path === "/tabs") {
      window.location.reload()
    } else {
      router.push({ path: '/tabs' })
    }
  }

  const getPainting = () => {
    router.push({ path: '/painting' })
  }

  const getWallpaper = () => {
    router.push({ path: '/wallpaper' })
  }

  const getTermsConditionsPage = () => {
    router.push({ path: '/terms&conditions' })
  }

  const getNotifications = () => {
    router.push({ path: '/notifications' })
  }

  const getWallet = () => {
    router.push({ path: '/wallet' })
  }

  const getBilling = () => {
    router.push({ path: '/billing' })
  }

  const getContactSupport = () => {
    router.push({ path: '/contactSupport' })
  }

  const getLogin = () => {
    router.push({ path: '/login' })
  }

  const getSignUp = () => {
    router.push({ path: '/signup' })
  }

  const getProApp = () => {
    window.open("https://www.bildoz.com.dz/pro/", "_blank")
  }

  const getAdvertising = () => {
    router.push({ path: '/advertising' })
  }

  const auth_sign_out = () => {
    auth.account_sign_out()
    window.location.reload()
  }

  const proceedToCheckout = async () => {
    cartStore.closeDrawer()
    if (!ls.value?.token) {
      router.push('/login')
      return
    }

    for (const item of cartStore.items) {
      try {
        await orders.addOrders({
          userId: ls.value.user._id,
          productId: item.product._id,
          amount: (item.product.price || 0) * item.quantity,
          date: Date.now(),
          description: `Ordered via Shopping Bag (${item.quantity}x ${item.product.name || item.product.code})`,
          status: 'pending'
        })
      } catch (e) {
        console.error('Error placing order for item:', item, e)
      }
    }
    cartStore.clearCart()
    router.push('/orders')
  }

  // Set active mobile nav on route change
  watch(() => route.path, (newPath) => {
    if (newPath === '/tabs' || newPath === '/') mobileNavValue.value = 'home'
    else if (newPath.startsWith('/categories')) mobileNavValue.value = 'categories'
    else if (newPath.startsWith('/product')) mobileNavValue.value = 'products'
    else if (newPath === '/orders') mobileNavValue.value = 'orders'
    else if (newPath === '/updateProfile') mobileNavValue.value = 'account'
  }, { immediate: true })

  onMounted(async () => {
    platform.value = Capacitor.getPlatform()
    if (Capacitor.isNativePlatform()) {
      users.loadUser()
    }
    ls.value = await auth.getLSUserInfo()
    if (ls.value?.token) {
      orders.fetchOrdersByUserId()
    }
    adsSettings.fetchAdsSettings()
  })
</script>

<style scoped>
  .editorial-app {
    font-family: var(--font-sans);
  }

  .max-w-1400 {
    max-width: 1400px;
    margin-left: auto;
    margin-right: auto;
  }

  .shop-top-navbar {
    background-color: var(--color-forest-green) !important;
  }

  .border-b-sand {
    border-bottom: 1px solid rgba(217, 185, 140, 0.25) !important;
  }

  .border-t-sand {
    border-top: 1px solid rgba(217, 185, 140, 0.25) !important;
  }

  .border-t-sand-subtle {
    border-top: 1px solid rgba(217, 185, 140, 0.15) !important;
  }

  .border-sand {
    border: 1.5px solid var(--color-sand) !important;
  }

  .border-editorial {
    border: 1px solid var(--color-border);
  }

  .border-t-editorial {
    border-top: 1px solid var(--color-border);
  }

  .border-b-editorial {
    border-bottom: 1px solid var(--color-border);
  }

  .shop-logo-emblem {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(217, 185, 140, 0.15);
    border: 1px solid rgba(217, 185, 140, 0.3);
  }

  .shop-badge {
    background: var(--color-sand);
    color: var(--color-deep-green);
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    padding: 2px 8px;
    border-radius: 9999px;
  }

  .nav-link-btn {
    color: #FAF8F2 !important;
    font-weight: 500;
    letter-spacing: 0.01em;
    transition: all 0.2s ease;
  }

  .nav-link-btn:hover {
    color: var(--color-sand) !important;
    background: rgba(217, 185, 140, 0.1) !important;
  }

  .nav-link-active {
    color: var(--color-sand) !important;
    font-weight: 700;
    background: rgba(217, 185, 140, 0.15) !important;
  }

  .shop-mobile-drawer {
    background-color: var(--color-deep-green) !important;
  }

  .drawer-nav-item {
    color: #FAF8F2 !important;
    font-weight: 500;
  }

  .drawer-nav-item:hover,
  .drawer-nav-item.v-list-item--active {
    background: rgba(217, 185, 140, 0.15) !important;
    color: var(--color-sand) !important;
  }

  .shop-bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
  }

  .shop-editorial-footer {
    background-color: var(--color-deep-green);
    color: var(--color-warm-ivory);
  }

  .footer-nav-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .footer-nav-list li {
    margin-bottom: 8px;
  }

  .footer-link {
    color: var(--color-sand-light);
    text-decoration: none;
    font-size: 0.875rem;
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .footer-link:hover {
    color: var(--color-sand);
    text-decoration: underline;
  }

  .line-height-relaxed {
    line-height: 1.6;
  }

  .cursor-pointer {
    cursor: pointer;
  }
</style>