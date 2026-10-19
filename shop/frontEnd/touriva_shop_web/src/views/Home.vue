<template>
  <div class="shop-home-page bg-warm-ivory">
    <!-- Top Editorial Header / Brand Bar (if accessed directly outside MainLayout) -->
    <header class="home-top-bar px-6 py-4 d-flex align-center justify-space-between bg-forest-green text-white">
      <div class="d-flex align-center cursor-pointer" @click="router.push('/tabs')">
        <v-icon color="sand" size="28" class="mr-2">mdi-compass-rose</v-icon>
        <span class="editorial-heading text-h5 font-weight-bold tracking-wide">Touriva</span>
        <span class="shop-badge ml-2">SHOP</span>
      </div>

      <div class="d-flex align-center ga-3">
        <!-- Language Selector -->
        <v-menu location="bottom end">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              variant="text"
              rounded="pill"
              size="small"
              class="text-white"
            >
              <v-icon start size="18" color="sand">mdi-translate</v-icon>
              <span>{{ selectedLanguage.title }}</span>
              <v-icon end size="16">mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list elevation="4" rounded="lg" class="border-editorial py-1">
            <v-list-item
              v-for="lang in locals"
              :key="lang.value"
              @click="changeLang(lang.value)"
              :active="$i18n.locale === lang.value"
              color="forestGreen"
            >
              <v-list-item-title class="font-sans text-body-2">{{ $t(lang.title) }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-btn
          variant="text"
          rounded="pill"
          color="sand"
          class="font-weight-bold"
          @click="routerLogin"
        >
          {{ $t('Login') }}
        </v-btn>

        <v-btn
          class="btn-editorial-sand px-4"
          rounded="pill"
          size="small"
          @click="routerSignup"
        >
          {{ $t('SignUp') }}
        </v-btn>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="home-hero-section px-4 py-8 py-md-12">
      <v-container class="max-w-1200">
        <div class="shop-hero-banner pa-6 pa-md-12">
          <div class="shop-hero-pattern"></div>
          <v-row align="center">
            <v-col cols="12" md="7" class="hero-content-col position-relative">
              <span class="editorial-tag text-sand mb-2 d-inline-block">
                PREMIUM TRAVEL EDITORIAL • COMMERCE
              </span>
              <h1 class="editorial-heading text-h3 text-md-h2 text-white font-weight-bold mb-4 line-height-tight">
                Curated Treasures for Every Journey
              </h1>
              <p class="text-body-1 text-sand-light mb-6 line-height-relaxed max-w-500">
                Discover handcrafted artisan creations, voyage essentials, and authentic decor designed to enrich your travel lifestyle.
              </p>

              <div class="d-flex flex-wrap align-center ga-3 mb-6">
                <v-btn
                  class="btn-editorial-sand px-6"
                  size="large"
                  rounded="pill"
                  @click="router.push('/products')"
                >
                  <v-icon start size="20">mdi-shopping-outline</v-icon>
                  {{ $t('ShopNow') || 'Explore Shop' }}
                </v-btn>

                <v-btn
                  variant="outlined"
                  color="sand"
                  class="rounded-pill px-6"
                  size="large"
                  @click="router.push('/categories')"
                >
                  <v-icon start size="20">mdi-view-grid-outline</v-icon>
                  {{ $t('Categories') }}
                </v-btn>
              </div>

              <!-- Value highlights -->
              <div class="d-flex flex-wrap ga-4 pt-4 border-t-sand-subtle text-caption text-sand-light">
                <div class="d-flex align-center">
                  <v-icon size="16" color="sand" class="mr-1">mdi-check-decagram</v-icon>
                  <span>Authentic Quality</span>
                </div>
                <div class="d-flex align-center">
                  <v-icon size="16" color="sand" class="mr-1">mdi-truck-fast-outline</v-icon>
                  <span>Algeria-wide Delivery</span>
                </div>
                <div class="d-flex align-center">
                  <v-icon size="16" color="sand" class="mr-1">mdi-shield-check-outline</v-icon>
                  <span>Verified Sellers</span>
                </div>
              </div>
            </v-col>

            <!-- Hero Image Showcase -->
            <v-col cols="12" md="5" class="d-flex justify-center position-relative">
              <v-card class="hero-image-card elevation-6 overflow-hidden rounded-xl border-sand">
                <v-img
                  v-if="company.getHomeImage"
                  :src="company.getHomeImage"
                  :lazy-src="lazyImage"
                  cover
                  height="340"
                  width="100%"
                  class="img-editorial-zoom"
                >
                  <template #placeholder>
                    <div class="d-flex align-center justify-center fill-height bg-deep-green">
                      <v-progress-circular color="sand" indeterminate />
                    </div>
                  </template>
                </v-img>
                <v-img
                  v-else
                  :src="lazyImage"
                  height="340"
                  cover
                  class="img-editorial-zoom"
                />
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </section>

    <!-- Categories Showcase Section -->
    <section class="home-categories-section py-8 px-4">
      <v-container class="max-w-1200">
        <div class="d-flex flex-column flex-sm-row justify-space-between align-sm-end mb-6">
          <div>
            <span class="editorial-tag text-sand-dark d-block mb-1">{{ $t('CuratedCollections') || 'CURATED COLLECTIONS' }}</span>
            <h2 class="editorial-heading text-h4 font-weight-bold text-forest">
              {{ $t('Categories') }}
            </h2>
          </div>
          <v-btn
            variant="text"
            color="forestGreen"
            class="font-weight-bold px-0 mt-2 mt-sm-0"
            @click="router.push('/categories')"
          >
            {{ $t('ViewAll') || 'View All Categories' }}
            <v-icon end size="18">mdi-arrow-right</v-icon>
          </v-btn>
        </div>

        <!-- Categories Grid -->
        <v-row v-if="categories.categoriesLocal && categories.categoriesLocal.length > 0">
          <v-col
            v-for="cat in categories.categoriesLocal.slice(0, 6)"
            :key="cat._id"
            cols="6"
            sm="4"
            md="2"
          >
            <v-card
              class="editorial-card text-center pa-3 cursor-pointer h-100 d-flex flex-column justify-center align-center"
              @click="openCategory(cat)"
            >
              <v-avatar size="72" color="sandLight" class="mb-3 border-editorial">
                <v-img v-if="cat.img" :src="cat.img" cover />
                <v-icon v-else size="32" color="forestGreen">mdi-compass-outline</v-icon>
              </v-avatar>
              <div class="text-subtitle-2 font-weight-bold text-forest text-truncate w-100">
                {{ cat.name }}
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Skeleton loader for categories -->
        <v-row v-else-if="categories.loading">
          <v-col v-for="i in 6" :key="i" cols="6" sm="4" md="2">
            <v-skeleton-loader type="avatar, text" class="rounded-xl pa-3 bg-white border-editorial" />
          </v-col>
        </v-row>

        <!-- Empty state -->
        <div v-else class="shop-empty-state my-4">
          <v-icon size="48" color="sand" class="mb-2">mdi-view-grid-outline</v-icon>
          <div class="text-subtitle-1 font-weight-bold text-forest">{{ $t('Ncf') }}</div>
        </div>
      </v-container>
    </section>

    <!-- Featured Products Section -->
    <section class="home-featured-products py-8 px-4 bg-white border-y-editorial">
      <v-container class="max-w-1200">
        <div class="d-flex flex-column flex-sm-row justify-space-between align-sm-end mb-6">
          <div>
            <span class="editorial-tag text-sand-dark d-block mb-1">{{ $t('BestSellers') || 'FEATURED CATALOG' }}</span>
            <h2 class="editorial-heading text-h4 font-weight-bold text-forest">
              {{ $t('FeaturedProducts') || 'Featured Travel & Artisan Goods' }}
            </h2>
          </div>
          <v-btn
            variant="text"
            color="forestGreen"
            class="font-weight-bold px-0 mt-2 mt-sm-0"
            @click="router.push('/products')"
          >
            {{ $t('ViewCatalog') || 'View Complete Catalog' }}
            <v-icon end size="18">mdi-arrow-right</v-icon>
          </v-btn>
        </div>

        <!-- Products Grid -->
        <v-row v-if="products.getProductsLocal && products.getProductsLocal.length > 0">
          <v-col
            v-for="product in products.getProductsLocal.slice(0, 8)"
            :key="product._id"
            cols="12"
            sm="6"
            md="3"
          >
            <v-card
              class="shop-product-card cursor-pointer"
              @click="router.push(`/product/${product._id}`)"
            >
              <div class="position-relative overflow-hidden" style="height: 210px;">
                <v-img
                  :src="product.img || lazyImage"
                  height="210"
                  cover
                  class="img-editorial-zoom"
                >
                  <template #placeholder>
                    <div class="d-flex align-center justify-center fill-height bg-warm-ivory">
                      <v-progress-circular indeterminate color="forestGreen" size="24" />
                    </div>
                  </template>
                </v-img>
                <div class="position-absolute top-2 right-2">
                  <span class="editorial-chip px-2 py-1 text-caption">TOU-ITEM</span>
                </div>
              </div>

              <v-card-text class="pa-4 flex-grow-1 d-flex flex-column justify-space-between">
                <div>
                  <h3 class="text-subtitle-1 font-weight-bold text-forest text-truncate mb-1">
                    {{ product.name || product.code || 'Artisan Piece' }}
                  </h3>
                  <p class="text-caption text-secondary-editorial line-clamp-2 mb-3">
                    {{ product.description || 'Authentic curated travel piece crafted with attention to detail.' }}
                  </p>
                </div>

                <div class="d-flex align-center justify-space-between pt-2 border-t-editorial">
                  <div>
                    <span class="shop-price-tag">{{ product.price }}</span>
                    <span class="shop-price-currency">DZD</span>
                  </div>
                  <v-btn
                    size="small"
                    color="forestGreen"
                    rounded="pill"
                    class="px-3"
                    @click.stop="router.push(`/product/${product._id}`)"
                  >
                    {{ $t('Detail') }}
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Skeleton loaders -->
        <v-row v-else-if="products.loading">
          <v-col v-for="i in 4" :key="i" cols="12" sm="6" md="3">
            <v-skeleton-loader type="image, article, actions" class="rounded-xl border-editorial bg-white" />
          </v-col>
        </v-row>

        <!-- Empty state -->
        <div v-else class="shop-empty-state my-6">
          <v-icon size="48" color="sand" class="mb-2">mdi-package-variant-closed</v-icon>
          <div class="text-subtitle-1 font-weight-bold text-forest">{{ $t('Npfitc') }}</div>
        </div>
      </v-container>
    </section>

    <!-- Editorial Assurance Banner -->
    <section class="py-12 px-4 bg-warm-ivory">
      <v-container class="max-w-1200">
        <v-row>
          <v-col cols="12" md="4">
            <v-card class="editorial-card pa-6 text-center h-100">
              <v-avatar size="56" color="sandLight" class="mb-4">
                <v-icon color="deepGreen" size="28">mdi-seal</v-icon>
              </v-avatar>
              <h3 class="editorial-heading text-h6 font-weight-bold text-forest mb-2">Heritage & Craft</h3>
              <p class="text-body-2 text-secondary-editorial">
                Every piece is selected from verified artisans celebrating traditional techniques and contemporary style.
              </p>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card class="editorial-card pa-6 text-center h-100">
              <v-avatar size="56" color="sandLight" class="mb-4">
                <v-icon color="deepGreen" size="28">mdi-truck-check-outline</v-icon>
              </v-avatar>
              <h3 class="editorial-heading text-h6 font-weight-bold text-forest mb-2">Seamless Delivery</h3>
              <p class="text-body-2 text-secondary-editorial">
                Secure doorstep shipping across all Algerian wilayas with complete tracking on every order.
              </p>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card class="editorial-card pa-6 text-center h-100">
              <v-avatar size="56" color="sandLight" class="mb-4">
                <v-icon color="deepGreen" size="28">mdi-headphones</v-icon>
              </v-avatar>
              <h3 class="editorial-heading text-h6 font-weight-bold text-forest mb-2">Dedicated Concierge</h3>
              <p class="text-body-2 text-secondary-editorial">
                Our support team is available to assist you with order inquiries, product recommendations, and custom sizing.
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Footer for standalone Home view -->
    <footer class="bg-deep-green text-warm-ivory py-8 px-4 text-center border-t-sand">
      <v-container class="max-w-1200">
        <div class="d-flex align-center justify-center mb-3">
          <v-icon color="sand" size="24" class="mr-2">mdi-compass-rose</v-icon>
          <span class="editorial-heading text-h6 text-white font-weight-bold">Touriva Shop</span>
        </div>
        <p class="text-caption text-sand mb-4">
          Discover More • Travel Better • Authentic Travel Commerce
        </p>
        <div class="text-caption text-sand-light">
          &copy; {{ new Date().getFullYear() }} Touriva. {{ $t('AllRightsReserved') || 'All rights reserved.' }}
        </div>
      </v-container>
    </footer>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useCompanyStore } from '@/stores/company'
  import { useCategoriesStore } from '@/stores/categories'
  import { useProductsStore } from '@/stores/products'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useLocale } from 'vuetify'

  const { isRtl } = useLocale()
  const { locale } = useI18n()
  const company = useCompanyStore()
  const categories = useCategoriesStore()
  const products = useProductsStore()
  const router = useRouter()

  const lazyImage = ref(new URL('@/assets/online-shop.png', import.meta.url).href)
  const locals = ref([
    { value: "ar", title: "arabic", short: "العربية" },
    { value: "fr", title: "french", short: "FR" },
    { value: "en", title: "english", short: "EN" }
  ])

  const selectedLanguage = computed(() =>
    locals.value.find((lang) => lang.value === locale.value) || locals.value[0]
  )

  const changeLang = (code) => {
    if (code === 'ar') {
      isRtl.value = true
      document.dir = 'rtl'
    } else {
      isRtl.value = false
      document.dir = 'ltr'
    }
    locale.value = code
  }

  const openCategory = (cat) => {
    categories.categoryName = cat.name
    router.push({ name: 'Subcategories', params: { id: cat._id } })
  }

  const routerLogin = () => {
    router.push('/login')
  }

  const routerSignup = () => {
    router.push('/signup')
  }

  onMounted(() => {
    company.fetchAppImage()
    categories.fetchCategoriesNoImages()
    products.fetchProductsNoImages()
  })
</script>

<style scoped>
  .shop-home-page {
    min-height: 100vh;
    font-family: var(--font-sans);
  }

  .max-w-1200 {
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
  }

  .max-w-500 {
    max-width: 500px;
  }

  .cursor-pointer {
    cursor: pointer;
  }

  .home-top-bar {
    border-bottom: 1px solid rgba(217, 185, 140, 0.25);
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

  .line-height-tight {
    line-height: 1.15;
  }

  .line-height-relaxed {
    line-height: 1.6;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .border-b-sand {
    border-bottom: 1px solid rgba(217, 185, 140, 0.25);
  }

  .border-t-sand {
    border-top: 1px solid rgba(217, 185, 140, 0.25);
  }

  .border-t-sand-subtle {
    border-top: 1px solid rgba(217, 185, 140, 0.15);
  }

  .border-sand {
    border: 1.5px solid var(--color-sand) !important;
  }

  .border-y-editorial {
    border-top: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);
  }

  .border-t-editorial {
    border-top: 1px solid var(--color-border);
  }

  .hero-image-card {
    max-width: 440px;
    width: 100%;
  }
</style>