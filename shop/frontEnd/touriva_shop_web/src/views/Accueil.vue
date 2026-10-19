<template>
  <div class="accueil-container">
    <!-- Editorial Hero Carousel -->
    <v-carousel
      cycle
      hide-delimiter-background
      show-arrows="hover"
      height="460"
      class="accueil-carousel mb-8 rounded-b-xl overflow-hidden"
    >
      <v-carousel-item
        v-for="(slide, idx) in slides"
        :key="idx"
      >
        <v-img
          :src="slide.image"
          cover
          height="100%"
          class="d-flex align-center"
        >
          <div class="carousel-overlay fill-height d-flex align-center px-6 px-md-16">
            <div class="carousel-caption pa-6 pa-md-8 rounded-xl max-w-600">
              <span class="editorial-tag text-sand mb-2 d-inline-block">TOURIVA SHOP EXCLUSIVE</span>
              <h2 class="editorial-heading text-h4 text-md-h3 text-white font-weight-bold mb-3">
                {{ slide.title }}
              </h2>
              <p class="text-body-1 text-sand-light mb-6">
                {{ slide.subtitle }}
              </p>
              <v-btn
                class="btn-editorial-sand px-6"
                rounded="pill"
                size="large"
                @click="$router.push('/products')"
              >
                {{ slide.ctaText || 'Explore Now' }}
              </v-btn>
            </div>
          </div>
        </v-img>
      </v-carousel-item>
    </v-carousel>

    <!-- Categories / Collections Row -->
    <v-container class="max-w-1200 mb-8 px-4">
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <span class="editorial-tag text-sand-dark">{{ $t('CuratedCollections') || 'COLLECTIONS' }}</span>
          <h2 class="editorial-heading text-h4 text-forest font-weight-bold">
            {{ $t('Categories') }}
          </h2>
        </div>
        <v-btn
          variant="text"
          color="forestGreen"
          class="font-weight-bold px-0"
          @click="$router.push('/categories')"
        >
          {{ $t('ViewAll') || 'View All' }}
          <v-icon end size="18">mdi-arrow-right</v-icon>
        </v-btn>
      </div>

      <v-row v-if="getCategoriesLocal && getCategoriesLocal.length > 0">
        <v-col
          cols="6"
          sm="4"
          md="2"
          v-for="category in getCategoriesLocal.slice(0, 6)"
          :key="category._id"
        >
          <v-card
            class="editorial-card text-center pa-3 cursor-pointer h-100 d-flex flex-column align-center justify-center"
            @click="openCategory(category)"
          >
            <v-avatar size="64" color="sandLight" class="mb-3 border-editorial">
              <v-img v-if="isValidShopImage(category.img)" :src="category.img" cover eager />
              <v-icon v-else size="28" color="forestGreen">mdi-tag-heart-outline</v-icon>
            </v-avatar>
            <div class="text-subtitle-2 font-weight-bold text-forest text-truncate w-100">
              {{ category.name }}
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Main Products Catalogue View -->
    <v-container class="max-w-1200 px-4">
      <Products />
    </v-container>
  </div>
</template>

<script setup>
  import { ref, onMounted, watch } from "vue"
  import { storeToRefs } from 'pinia'
  import { useRouter } from 'vue-router'
  import { useCategoriesStore } from "@/stores/categories"
  import { CURATED_SHOP_PHOTOGRAPHY, isValidShopImage } from "@/config/curatedImages"
  import Products from '@/views/Product/index.vue'

  const router = useRouter()
  const categories = useCategoriesStore()
  const { getCategoriesLocal, getLoading } = storeToRefs(categories)

  watch(getCategoriesLocal, (newValue) => {
    categories.categoriesLocal = newValue
  }, { immediate: true })

  const slides = ref(CURATED_SHOP_PHOTOGRAPHY.heroSlides)

  const openCategory = (cat) => {
    categories.categoryName = cat.name
    router.push({ name: 'Subcategories', params: { id: cat._id } })
  }

  onMounted(() => {
    categories.fetchCategoriesNoImages()
  })
</script>

<style scoped>
  .accueil-container {
    background-color: var(--color-warm-ivory);
    min-height: 100vh;
  }

  .max-w-1200 {
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
  }

  .max-w-600 {
    max-width: 600px;
  }

  .accueil-carousel {
    border-bottom: 1px solid rgba(217, 185, 140, 0.3);
  }

  .carousel-overlay {
    background: linear-gradient(90deg, rgba(16, 45, 39, 0.85) 0%, rgba(16, 45, 39, 0.4) 60%, transparent 100%);
  }

  .carousel-caption {
    background: rgba(16, 45, 39, 0.7);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(217, 185, 140, 0.3);
  }

  .cursor-pointer {
    cursor: pointer;
  }
</style>
