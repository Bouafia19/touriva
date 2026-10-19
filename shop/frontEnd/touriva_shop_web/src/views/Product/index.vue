<template>
  <v-container
    fluid
    :class="[platform === 'web' ? 'px-4 main-container' : 'px-2']"
    class="py-6"
  >
    <Advertising />

    <!-- Editorial Header Section -->
    <div class="mb-6">
      <div class="d-flex align-center justify-space-between flex-wrap ga-2">
        <div>
          <span class="editorial-tag text-sand-dark d-block mb-1">
            {{ categories.getCategoryName ? $t('Category') : 'TOURIVA COLLECTION' }}
          </span>
          <h1 class="editorial-heading text-h4 text-md-h3 font-weight-bold text-forest">
            {{ categories.getCategoryName || $t('Products') || 'Curated Goods & Artwork' }}
          </h1>
        </div>

        <!-- Mobile Filter Button -->
        <v-btn
          class="d-flex d-md-none btn-editorial-outline px-4"
          @click="drawer = true"
          size="small"
        >
          <v-icon start size="18">mdi-tune-variant</v-icon>
          {{ $t('Filters') }}
          <v-badge
            v-if="selectedCategories.length > 0 || filters.price > 0"
            color="sand"
            dot
            inline
            class="ml-1"
          />
        </v-btn>
      </div>

      <!-- Active Filters / Item count -->
      <div class="d-flex align-center justify-space-between mt-3 text-caption text-secondary-editorial border-b-editorial pb-3">
        <span>
          <strong class="text-forest">{{ filteredProducts.length }}</strong>
          {{ filteredProducts.length === 1 ? 'item found' : 'items found' }}
        </span>

        <div v-if="selectedCategories.length > 0 || filters.price > 0" class="d-flex align-center ga-2">
          <v-chip
            size="x-small"
            color="forestGreen"
            variant="tonal"
            closable
            @click:close="removeFilters"
          >
            {{ $t('Remove') || 'Reset Filters' }}
          </v-chip>
        </div>
      </div>
    </div>

    <!-- Main Content: Sidebar Filters + Products Grid -->
    <v-row class="ma-0">
      <!-- Desktop Filter Sidebar -->
      <v-col
        cols="12"
        md="3"
        class="filter-sidebar d-none d-md-block pr-md-4 pl-0"
      >
        <v-card class="editorial-card pa-4 sticky-filter">
          <div class="d-flex align-center justify-space-between mb-4 border-b-editorial pb-3">
            <div class="d-flex align-center">
              <v-icon color="forestGreen" size="20" class="mr-2">mdi-tune-variant</v-icon>
              <h3 class="editorial-heading text-subtitle-1 font-weight-bold text-forest">
                {{ $t('Filters') }}
              </h3>
            </div>
            <v-btn
              v-if="selectedCategories.length > 0 || filters.price > 0"
              variant="text"
              size="x-small"
              color="error"
              @click="removeFilters"
            >
              {{ $t('Remove') }}
            </v-btn>
          </div>

          <!-- Category filter list -->
          <div class="mb-4">
            <div class="editorial-tag text-sand-dark mb-2">{{ $t('Categories') }}</div>
            <div class="category-filter-list pr-1">
              <CategoryCheckbox
                v-for="category in categories.categoriesLocal"
                :key="category._id"
                :category="category"
                v-model:selected="selectedCategories"
              />
            </div>
          </div>

          <v-divider class="my-4" />

          <!-- Price filter slider -->
          <div class="mb-4">
            <div class="d-flex justify-space-between align-center mb-1">
              <span class="editorial-tag text-sand-dark">{{ $t('PriceRange') }}</span>
              <span class="text-caption font-weight-bold text-forest" v-if="filters.price">
                ≤ {{ filters.price }} DZD
              </span>
            </div>
            <v-slider
              v-model="filters.price"
              :max="maxPrice || 50000"
              color="forestGreen"
              track-color="sandLight"
              thumb-color="forestGreen"
              thumb-label
              step="500"
              hide-details
            />
          </div>

          <!-- Filter action buttons -->
          <div class="d-flex ga-2 mt-4">
            <v-btn
              block
              class="btn-editorial-primary"
              size="small"
              @click="applyFilters"
            >
              {{ $t('Apply') }}
            </v-btn>
          </div>
        </v-card>
      </v-col>

      <!-- Products Grid Section -->
      <v-col cols="12" md="9" class="px-0">
        <!-- Products Grid -->
        <v-row v-if="filteredProducts.length > 0 && !getLoading">
          <v-col
            v-for="(product, idx) in paginatedItems"
            :key="product._id"
            cols="6"
            sm="6"
            md="6"
            lg="4"
            class="pa-2 pa-sm-3"
          >
            <v-card
              class="shop-product-card cursor-pointer"
              @click="router.push(`/product/${product._id}`)"
            >
              <!-- Product Image -->
              <div class="position-relative overflow-hidden product-image-wrapper">
                <v-img
                  :src="getResolvedProductImage(product, idx)"
                  cover
                  eager
                  class="img-editorial-zoom h-100"
                >
                  <template #placeholder>
                    <div class="d-flex align-center justify-center fill-height bg-warm-ivory">
                      <v-progress-circular color="forestGreen" indeterminate size="24" />
                    </div>
                  </template>
                </v-img>

                <!-- Top category or code tag -->
                <div class="position-absolute top-2 left-2" v-if="product.code">
                  <span class="editorial-chip px-2 py-0-5 text-caption">
                    {{ product.code }}
                  </span>
                </div>
              </div>

              <!-- Product Details -->
              <v-card-text class="pa-3 pa-sm-4 d-flex flex-column justify-space-between flex-grow-1">
                <div>
                  <h3 class="product-title font-weight-bold text-forest mb-1">
                    {{ product.name || product.code || 'Bespoke Item' }}
                  </h3>
                  <p class="text-caption text-secondary-editorial line-clamp-2 mb-2" v-if="product.description">
                    {{ product.description }}
                  </p>
                </div>

                <div class="d-flex align-center justify-space-between pt-2 border-t-editorial mt-auto">
                  <div>
                    <span class="shop-price-tag">{{ product.price }}</span>
                    <span class="shop-price-currency">DZD</span>
                  </div>

                  <v-btn
                    color="forestGreen"
                    variant="tonal"
                    size="small"
                    rounded="pill"
                    class="font-weight-bold"
                    @click.stop="router.push(`/product/${product._id}`)"
                  >
                    {{ $t('Detail') }}
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Loading Skeletons -->
        <v-row v-else-if="getLoading || (paginatedItems.length === 0 && getLoading)">
          <v-col
            v-for="index in 6"
            :key="index"
            cols="6"
            sm="6"
            md="6"
            lg="4"
            class="pa-2 pa-sm-3"
          >
            <v-skeleton-loader
              type="image, article, actions"
              class="rounded-xl border-editorial bg-white pa-2"
            />
          </v-col>
        </v-row>

        <!-- Empty State -->
        <div v-else class="shop-empty-state my-8">
          <v-avatar size="64" color="sandLight" class="mb-3">
            <v-icon size="32" color="deepGreen">mdi-package-variant-closed</v-icon>
          </v-avatar>
          <h3 class="editorial-heading text-h6 font-weight-bold text-forest mb-2">
            {{ $t('Npfitc') || 'No products found' }}
          </h3>
          <p class="text-body-2 text-secondary-editorial mb-4">
            Try adjusting your search criteria or removing filters to view more items.
          </p>
          <v-btn
            class="btn-editorial-primary px-6"
            size="small"
            @click="removeFilters"
          >
            {{ $t('Remove') || 'Clear Filters' }}
          </v-btn>
        </div>

        <!-- Pagination -->
        <div class="d-flex justify-center mt-8 mb-4" v-if="totalPages > 1">
          <v-pagination
            v-model="currentPage"
            :length="totalPages"
            :total-visible="5"
            active-color="forestGreen"
            rounded="circle"
            class="shop-pagination"
          />
        </div>
      </v-col>
    </v-row>

    <!-- Mobile Filter Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      location="right"
      temporary
      class="d-md-none"
      width="300"
    >
      <div class="pa-4 bg-deep-green text-white d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon color="sand" size="20" class="mr-2">mdi-tune-variant</v-icon>
          <span class="editorial-heading text-h6 font-weight-bold">{{ $t('Filters') }}</span>
        </div>
        <v-btn icon="mdi-close" variant="text" size="small" color="sand" @click="drawer = false" />
      </div>

      <div class="pa-4">
        <div class="editorial-tag text-sand-dark mb-2">{{ $t('PriceRange') }}</div>
        <div class="text-caption font-weight-bold text-forest mb-1" v-if="filters.price">
          ≤ {{ filters.price }} DZD
        </div>
        <v-slider
          v-model="filters.price"
          :max="maxPrice || 50000"
          color="forestGreen"
          track-color="sandLight"
          thumb-color="forestGreen"
          thumb-label
          step="500"
        />

        <div class="d-flex flex-column ga-2 mt-6">
          <v-btn
            block
            class="btn-editorial-primary"
            @click="applyFilters(); drawer = false"
          >
            {{ $t('Apply') }}
          </v-btn>
          <v-btn
            block
            variant="outlined"
            color="forestGreen"
            rounded="pill"
            @click="removeFilters(); drawer = false"
          >
            {{ $t('Remove') }}
          </v-btn>
        </div>
      </div>
    </v-navigation-drawer>
  </v-container>
</template>

<script setup>
  import { ref, onMounted, computed, watch, reactive } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useProductsStore } from '@/stores/products'
  import Advertising from '@/components/Advertising.vue'
  import { useCategoriesStore } from '@/stores/categories'
  import { useDisplay } from "vuetify"
  import { storeToRefs } from 'pinia'
  import CategoryCheckbox from '@/components/CategoryCheckbox.vue'
  import { getResolvedProductImage } from '@/config/curatedImages'
  import { Capacitor } from '@capacitor/core'

  const products = useProductsStore()
  const { getProductsLocal, getLoading } = storeToRefs(products)
  const categories = useCategoriesStore()
  const router = useRouter()
  const route = useRoute()
  const display = useDisplay()

  let id = route.params.id
  let itemsPerPage = ref(9),
      currentPage = ref(1),
      filteredProducts = ref([]),
      filters = reactive({
          categories: [],
          category: false,
          price: 0
      }),
      drawer = ref(false),
      platform = ref(null),
      selectedCategories = ref([])

  const fallbackImage = ref(new URL('@/assets/online-shop.png', import.meta.url).href)

  watch(() => route.fullPath, (newPath, oldPath) => {
      id = route.params.id

      if(route.name === "Wallpaper"){
          categories.fetchNestedCategories({ parentId: "68d93256e80c80fd4e3ee3fc"})
          products.fetchProductsByCategoryChilds("68d93256e80c80fd4e3ee3fc")
      } else if(route.name === "Painting"){
          categories.fetchNestedCategories({ parentId: "68d8fdc4f5b38332f5976c96"})
          products.fetchProductsByCategoryChilds("68d8fdc4f5b38332f5976c96")
      }
  })

  // Watch Pinia store changes
  watch(getProductsLocal, (newValue) => {
      filteredProducts.value = newValue || []
  }, { immediate: true })

  const totalPages = computed(() => {
      return Math.ceil(filteredProducts.value.length / itemsPerPage.value) || 1
  })

  const paginatedItems = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = currentPage.value * itemsPerPage.value
      return filteredProducts.value.slice(start, end)
  })

  const maxPrice = computed(() => {
      if (!getProductsLocal.value || getProductsLocal.value.length === 0) return 50000
      return Math.max(...getProductsLocal.value.map((product) => product.price || 0))
  })

  // Remove Filters
  const removeFilters = () => {
      filters.category = false
      filters.price = 0
      selectedCategories.value = []
      filteredProducts.value = getProductsLocal.value || []
  }

  // Apply Filters
  const applyFilters = () => {
      filteredProducts.value = (getProductsLocal.value || []).filter((product) => {
          // Match category (supports multiple)
          const matchesCategory =
              selectedCategories.value.length === 0 ||
              selectedCategories.value.includes(product.categoryId)

          // Match price
          const withinPriceRange =
              !filters.price || product.price <= filters.price

          return matchesCategory && withinPriceRange
      })
      currentPage.value = 1
  }

  const returnTo = () => {
      categories.categoryName = ''
      router.go(-1)
  }

  onMounted(async () => {
      platform.value = Capacitor.getPlatform()
      products.fetchProductsNoImages().then(() => {
          filteredProducts.value = getProductsLocal.value || []
      })
      categories.fetchCategoriesNoImages()
  })
</script>

<script>
  export default {
      name: 'Products'
  }
</script>

<style scoped>
  .main-container {
    max-width: 1300px;
    margin-left: auto;
    margin-right: auto;
  }

  .sticky-filter {
    position: sticky;
    top: 90px;
  }

  .category-filter-list {
    max-height: 280px;
    overflow-y: auto;
  }

  .product-image-wrapper {
    height: 220px;
    background-color: var(--color-warm-ivory);
  }

  .product-title {
    font-size: 0.95rem;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .border-b-editorial {
    border-bottom: 1px solid var(--color-border);
  }

  .border-t-editorial {
    border-top: 1px solid var(--color-border);
  }

  .cursor-pointer {
    cursor: pointer;
  }
</style>