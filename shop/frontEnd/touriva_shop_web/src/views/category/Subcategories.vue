<template>
  <v-container
    fluid
    :class="[platform === 'web' ? 'px-4 main-container' : 'px-2']"
    class="py-6"
  >
    <Advertising />

    <!-- Return button & breadcrumbs -->
    <div class="d-flex align-center justify-space-between mb-6">
      <v-btn
        variant="text"
        color="forestGreen"
        class="font-weight-bold px-0"
        @click="returnTo"
      >
        <v-icon start size="18">mdi-arrow-left</v-icon>
        {{ $t('Return') || 'Back' }}
      </v-btn>

      <span class="editorial-tag text-sand-dark">
        {{ $t('Subcategories') }}
      </span>
    </div>

    <!-- Header Section -->
    <div class="mb-8">
      <span class="editorial-tag text-sand-dark d-block mb-1">COLLECTION DIRECTORY</span>
      <h1 class="editorial-heading text-h4 text-md-h3 font-weight-bold text-forest">
        {{ categories.getCategoryName || child[0]?.parent?.name || 'Subcategories' }}
      </h1>
      <p class="text-body-2 text-secondary-editorial mt-1 max-w-600">
        Choose a subcollection to view specialized items, artisan variants, and regional crafts.
      </p>
    </div>

    <!-- Subcategories Grid -->
    <v-row v-if="child.length > 0 && !getLoading">
      <v-col
        v-for="category in child"
        :key="category._id"
        cols="6"
        sm="4"
        md="3"
        lg="3"
        class="pa-2 pa-sm-3"
      >
        <v-card
          class="editorial-card cursor-pointer h-100 d-flex flex-column"
          @click="filterChild(category)"
        >
          <!-- Image -->
          <div class="position-relative overflow-hidden category-img-wrapper">
            <v-img
              :src="category.img || fallbackImage"
              cover
              class="img-editorial-zoom h-100"
            >
              <template #placeholder>
                <div class="d-flex align-center justify-center fill-height bg-warm-ivory">
                  <v-progress-circular color="forestGreen" indeterminate size="24" />
                </div>
              </template>
            </v-img>

            <div class="category-overlay d-flex align-end pa-3">
              <span class="editorial-chip px-2 py-0-5 text-caption">
                {{ category.hasChild ? 'SUBCOLLECTION' : 'VIEW ITEMS' }}
              </span>
            </div>
          </div>

          <!-- Title -->
          <v-card-text class="pa-4 d-flex align-center justify-space-between flex-grow-1">
            <h3 class="text-subtitle-1 font-weight-bold text-forest text-truncate">
              {{ category.name }}
            </h3>
            <v-icon color="sand-dark" size="18">mdi-arrow-right</v-icon>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Skeleton Loaders -->
    <v-row v-else-if="getLoading">
      <v-col
        v-for="index in 8"
        :key="index"
        cols="6"
        sm="4"
        md="3"
        class="pa-2 pa-sm-3"
      >
        <v-skeleton-loader
          type="image, article"
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
        {{ $t('Npfitc') || 'No subcategories found' }}
      </h3>
      <p class="text-body-2 text-secondary-editorial mb-4">
        Explore our main catalogue to find more artisan products.
      </p>
      <v-btn
        class="btn-editorial-primary px-6"
        size="small"
        @click="$router.push('/products')"
      >
        {{ $t('ViewCatalog') || 'View All Products' }}
      </v-btn>
    </div>
  </v-container>
</template>

<script setup>
  import { ref, onMounted, watch, onActivated } from 'vue'
  import { Capacitor } from '@capacitor/core'
  import { useCategoriesStore } from '@/stores/categories'
  import Advertising from '@/components/Advertising.vue'
  import { useRouter, useRoute } from 'vue-router'
  import { storeToRefs } from 'pinia'

  const categories = useCategoriesStore()
  const { getChildsLocal, getLoading } = storeToRefs(categories)
  const router = useRouter()
  const route = useRoute()

  let id = route.params.id
  const platform = ref(null)
  const child = ref([])
  const fallbackImage = ref(new URL('@/assets/online-shop.png', import.meta.url).href)

  watch(() => route.fullPath, () => {
    categories.fetchChildNoImages({ id: route.params.id })
  })

  watch(() => categories.childsLocal, (newVal) => {
    child.value = [...(newVal || [])]
  }, { deep: true })

  const filterChild = (cat) => {
    categories.categoryName = cat.name
    if (cat.hasChild) {
      router.push({ name: 'Subcategories', params: { id: cat._id } })
    } else {
      router.push({ name: 'Products', params: { id: cat._id } })
    }
  }

  const returnTo = () => {
    categories.categoryName = ''
    categories.loading = true
    router.go(-1)
  }

  onMounted(async () => {
    platform.value = Capacitor.getPlatform()
    if (!child.value.length) {
      await categories.fetchChildNoImages({ id })
      child.value = getChildsLocal.value || []
    }
  })

  onActivated(() => {
    if (child.value.length) {
      categories.loading = false
    }
  })
</script>

<script>
  export default {
    name: 'Subcategories'
  }
</script>

<style scoped>
  .main-container {
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
  }

  .max-w-600 {
    max-width: 600px;
  }

  .category-img-wrapper {
    height: 180px;
    background-color: var(--color-warm-ivory);
  }

  .category-overlay {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: linear-gradient(0deg, rgba(16, 45, 39, 0.4) 0%, transparent 60%);
    pointer-events: none;
  }

  .cursor-pointer {
    cursor: pointer;
  }
</style>