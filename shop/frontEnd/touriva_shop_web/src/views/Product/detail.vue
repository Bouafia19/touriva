<template>
  <v-container
    fluid
    :class="[platform === 'web' ? 'px-4 main-container' : 'px-2']"
    class="py-6"
  >
    <Advertising />

    <!-- Breadcrumb & Return -->
    <div class="d-flex align-center justify-space-between mb-6">
      <v-btn
        variant="text"
        color="forestGreen"
        class="font-weight-bold px-0"
        @click="returnTo"
      >
        <v-icon start size="18">mdi-arrow-left</v-icon>
        {{ $t('Return') || 'Back to Products' }}
      </v-btn>

      <span class="editorial-tag text-sand-dark">
        {{ product.code ? `ITEM REF: ${product.code}` : 'TOURIVA EDITORIAL' }}
      </span>
    </div>

    <!-- Main Product Section -->
    <v-row class="ma-0 mb-8" v-if="product._id">
      <!-- Left Column: Gallery -->
      <v-col cols="12" md="6" class="pr-md-6 pl-0">
        <div class="product-gallery sticky-gallery">
          <!-- Main Image -->
          <v-card class="editorial-card overflow-hidden mb-3 border-editorial">
            <v-carousel
              v-model="currentImage"
              :show-arrows="imageList.length > 1"
              hide-delimiters
              height="380"
              class="product-carousel"
            >
              <v-carousel-item
                v-for="(image, index) in imageList"
                :key="index"
              >
                <v-img
                  :src="image || fallbackImage"
                  cover
                  height="100%"
                  class="img-editorial-zoom"
                >
                  <template #placeholder>
                    <div class="d-flex align-center justify-center fill-height bg-warm-ivory">
                      <v-progress-circular color="forestGreen" indeterminate />
                    </div>
                  </template>
                </v-img>
              </v-carousel-item>
            </v-carousel>
          </v-card>

          <!-- Thumbnails -->
          <div
            v-if="product.thumbnails && product.thumbnails.length > 1"
            class="d-flex ga-2 overflow-x-auto py-2"
          >
            <v-card
              v-for="(thumb, index) in product.thumbnails"
              :key="index"
              class="thumbnail-card cursor-pointer overflow-hidden flex-shrink-0"
              :class="{ 'thumbnail-active': currentImage === index }"
              width="76"
              height="76"
              elevation="0"
              @click="currentImage = index"
            >
              <v-img :src="thumb" cover height="100%" />
            </v-card>
          </div>
        </div>
      </v-col>

      <!-- Right Column: Details & Actions -->
      <v-col cols="12" md="6" class="pl-md-6 pr-0">
        <v-card class="editorial-card pa-6">
          <div class="mb-3">
            <span class="editorial-chip px-2 py-0-5 text-caption mb-2 d-inline-block">
              {{ product.code || 'ARTISAN CREATION' }}
            </span>
            <h1 class="editorial-heading text-h4 font-weight-bold text-forest mb-2">
              {{ product.name || product.code || 'Bespoke Travel Piece' }}
            </h1>
          </div>

          <!-- Price Display -->
          <div class="d-flex align-baseline ga-2 mb-4 pb-4 border-b-editorial" v-if="product.price">
            <span class="editorial-heading text-h3 font-weight-bold text-forest">
              {{ product.price }}
            </span>
            <span class="text-subtitle-1 font-weight-bold text-sand-dark">DZD</span>
            <span class="text-caption text-secondary-editorial ml-2">All taxes included</span>
          </div>

          <!-- Description -->
          <div class="mb-6">
            <h4 class="editorial-tag text-sand-dark mb-2">{{ $t('Description') }}</h4>
            <p class="text-body-1 text-secondary-editorial line-height-relaxed">
              {{ product.description || 'Carefully sourced and curated for exceptional quality, durability, and travel-inspired aesthetics.' }}
            </p>
          </div>

          <!-- Quantity Selector -->
          <div class="mb-6">
            <label class="editorial-tag text-sand-dark d-block mb-2">QUANTITY</label>
            <div class="d-flex align-center ga-3">
              <div class="quantity-control d-flex align-center border-editorial rounded-pill px-2 py-1 bg-warm-ivory">
                <v-btn
                  icon="mdi-minus"
                  variant="text"
                  size="small"
                  :disabled="quantity <= 1"
                  @click="quantity > 1 ? quantity-- : null"
                />
                <span class="px-4 font-weight-bold text-forest">{{ quantity }}</span>
                <v-btn
                  icon="mdi-plus"
                  variant="text"
                  size="small"
                  @click="quantity++"
                />
              </div>
              <span class="text-caption text-secondary-editorial">In stock & ready to ship</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="d-flex flex-column ga-3 mb-6">
            <div class="d-flex ga-3">
              <!-- Add to Cart -->
              <v-btn
                class="btn-editorial-sand flex-grow-1"
                size="large"
                @click="handleAddToCart"
              >
                <v-icon start size="20">mdi-cart-plus</v-icon>
                {{ $t('AddToCart') || 'Add to Cart' }}
              </v-btn>

              <!-- Instant Order / Buy Now -->
              <v-btn
                class="btn-editorial-primary flex-grow-1"
                size="large"
                @click="placeOrder(product)"
              >
                <v-icon start size="20">mdi-flash</v-icon>
                {{ $t('PlaceOrder') || 'Buy Now' }}
              </v-btn>
            </div>

            <!-- Contact Seller -->
            <v-btn
              v-if="product.ownerId"
              variant="outlined"
              color="forestGreen"
              rounded="pill"
              size="default"
              class="font-weight-bold"
              @click="contactSeller(product.ownerId)"
            >
              <v-icon start size="18">mdi-storefront-outline</v-icon>
              {{ $t('ContactSeller') }}
            </v-btn>
          </div>

          <!-- Trust Badges -->
          <div class="pt-4 border-t-editorial">
            <v-row class="text-caption text-secondary-editorial">
              <v-col cols="4" class="d-flex align-center ga-2">
                <v-icon size="20" color="forestGreen">mdi-truck-check-outline</v-icon>
                <span>Fast National Shipping</span>
              </v-col>
              <v-col cols="4" class="d-flex align-center ga-2">
                <v-icon size="20" color="forestGreen">mdi-shield-check-outline</v-icon>
                <span>Verified Artisan</span>
              </v-col>
              <v-col cols="4" class="d-flex align-center ga-2">
                <v-icon size="20" color="forestGreen">mdi-headset</v-icon>
                <span>Dedicated Support</span>
              </v-col>
            </v-row>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Loading Skeleton for Main View -->
    <v-row class="ma-0 mb-8" v-else>
      <v-col cols="12" md="6">
        <v-skeleton-loader type="image" height="380" class="rounded-xl border-editorial bg-white" />
      </v-col>
      <v-col cols="12" md="6">
        <v-skeleton-loader type="article, actions" class="rounded-xl border-editorial bg-white pa-6" />
      </v-col>
    </v-row>

    <!-- Specifications Section -->
    <v-card class="editorial-card pa-6 mb-8" v-if="product.features && product.features.length > 0">
      <div class="d-flex align-center mb-4">
        <v-icon color="forestGreen" size="24" class="mr-2">mdi-format-list-checks</v-icon>
        <h3 class="editorial-heading text-h5 font-weight-bold text-forest">
          {{ $t('Specifications') }}
        </h3>
      </div>

      <v-row>
        <v-col
          v-for="(feature, index) in product.features"
          :key="index"
          cols="12"
          sm="6"
          md="4"
        >
          <div class="pa-3 rounded-lg bg-warm-ivory border-editorial d-flex justify-space-between align-center">
            <span class="text-caption text-secondary-editorial font-weight-bold text-uppercase">{{ feature.key }}</span>
            <span class="text-body-2 font-weight-bold text-forest">{{ feature.value }}</span>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <!-- Related Products -->
    <div class="mt-8" v-if="relatedProducts.length > 0">
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <span class="editorial-tag text-sand-dark">{{ $t('CuratedCollections') || 'SIMILAR PIECES' }}</span>
          <h3 class="editorial-heading text-h5 font-weight-bold text-forest">
            {{ $t('RelatedAnnouncements') || 'Related Collections' }}
          </h3>
        </div>
      </div>

      <v-row>
        <v-col
          v-for="related in relatedProducts.slice(0, 4)"
          :key="related._id"
          cols="6"
          sm="6"
          md="3"
        >
          <v-card
            class="shop-product-card cursor-pointer"
            @click="$router.push(`/product/${related._id}`)"
          >
            <div class="position-relative overflow-hidden" style="height: 180px;">
              <v-img :src="related.img || fallbackImage" height="180" cover class="img-editorial-zoom">
                <template #placeholder>
                  <div class="d-flex align-center justify-center fill-height bg-warm-ivory">
                    <v-progress-circular indeterminate color="forestGreen" size="20" />
                  </div>
                </template>
              </v-img>
            </div>
            <v-card-text class="pa-3">
              <h4 class="text-subtitle-2 font-weight-bold text-forest text-truncate mb-1">
                {{ related.name || related.code }}
              </h4>
              <div class="d-flex align-center justify-space-between pt-1 border-t-editorial">
                <div>
                  <span class="shop-price-tag">{{ related.price }}</span>
                  <span class="shop-price-currency">DZD</span>
                </div>
                <v-btn
                  size="x-small"
                  variant="tonal"
                  color="forestGreen"
                  rounded="pill"
                  :to="`/product/${related._id}`"
                >
                  {{ $t('Detail') }}
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Contact Seller Dialog -->
    <v-dialog v-model="dialog" max-width="480">
      <v-card class="editorial-card overflow-hidden">
        <div class="pa-4 bg-deep-green text-white d-flex align-center justify-space-between border-b-sand">
          <div class="d-flex align-center">
            <v-icon color="sand" size="22" class="mr-2">mdi-storefront</v-icon>
            <span class="editorial-heading text-h6 font-weight-bold">
              {{ product.ownerId?.companyName || 'Artisan Seller' }}
            </span>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" color="sand" @click="dialog = false" />
        </div>

        <v-card-text class="pa-6">
          <div class="mb-4 d-flex align-center">
            <v-avatar color="sandLight" size="44" class="mr-3">
              <v-icon color="deepGreen">mdi-phone</v-icon>
            </v-avatar>
            <div>
              <div class="text-caption text-secondary-editorial">{{ $t('phoneNumber') }}</div>
              <div class="text-subtitle-1 font-weight-bold text-forest">{{ product.ownerId?.phone || 'N/A' }}</div>
            </div>
          </div>

          <div class="mb-2 d-flex align-center">
            <v-avatar color="sandLight" size="44" class="mr-3">
              <v-icon color="deepGreen">mdi-email</v-icon>
            </v-avatar>
            <div>
              <div class="text-caption text-secondary-editorial">{{ $t('email') }}</div>
              <div class="text-subtitle-1 font-weight-bold text-forest">{{ product.ownerId?.email || 'N/A' }}</div>
            </div>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4 bg-warm-ivory justify-end">
          <v-btn
            variant="text"
            color="forestGreen"
            rounded="pill"
            @click="dialog = false"
          >
            {{ $t('close') }}
          </v-btn>
          <v-btn
            v-if="product.ownerId?.phone"
            class="btn-editorial-primary px-4"
            size="small"
            :href="`tel:${product.ownerId?.phone}`"
          >
            <v-icon start size="16">mdi-phone-in-talk</v-icon>
            Call Now
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Added to Cart Snackbar -->
    <v-snackbar
      v-model="snackbar"
      color="forestGreen"
      rounded="pill"
      timeout="3000"
      location="top right"
    >
      <div class="d-flex align-center">
        <v-icon color="sand" size="20" class="mr-2">mdi-check-circle</v-icon>
        <span>Item added to your shopping cart!</span>
      </div>
      <template #actions>
        <v-btn
          color="sand"
          variant="text"
          size="small"
          @click="cartStore.openDrawer(); snackbar = false"
        >
          View Cart
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
  import axios from 'axios'
  import { Capacitor } from '@capacitor/core'
  import { useAdvertisingStore } from '@/stores/advertising'
  import Advertising from '@/components/Advertising.vue'
  import { useOrdersStore } from '@/stores/orders'
  import { useAuthStore } from '@/stores/auth'
  import { useCartStore } from '@/stores/cart'
  import { getResolvedProductImage } from '@/config/curatedImages'

  export default {
    name: 'ProductDetail',
    props: ['productId'],
    components: {
      Advertising
    },
    data() {
      return {
        products: [],
        product: {
          thumbnails: [],
          features: []
        },
        currentImage: 0,
        quantity: 1,
        relatedProducts: [],
        dialog: false,
        snackbar: false,
        platform: null,
        ads: null,
        dialogAds: false,
        orders: null,
        auth: null,
        cartStore: null,
        fallbackImage: new URL('@/assets/online-shop.png', import.meta.url).href
      }
    },

    computed: {
      imageList() {
        if (this.product.thumbnails && this.product.thumbnails.length) {
          return this.product.thumbnails
        }
        if (this.product.img && (this.product.img.startsWith('http://') || this.product.img.startsWith('https://'))) {
          return [this.product.img]
        }
        return [getResolvedProductImage(this.product)]
      }
    },

    async created() {
      this.platform = Capacitor.getPlatform()
      this.ads = useAdvertisingStore()
      this.orders = useOrdersStore()
      this.auth = useAuthStore()
      this.cartStore = useCartStore()
      await this.fetchProductDetails()
      this.ads.fetchAdvertising().then(() => {
        if (this.ads.getInterstitialAdsDetail && this.ads.getInterstitialAdsDetail.length > 0) {
          this.dialogAds = true
        }
      })
    },

    watch: {
      "$route.params.productId": {
        immediate: true,
        handler(newId) {
          if (newId) {
            this.fetchProductDetails(newId)
          }
        }
      }
    },

    methods: {
      returnTo() {
        this.$router.go(-1)
      },

      openInNewTab(href) {
        if (href) {
          window.open(href, '_blank')
        }
      },

      handleAddToCart() {
        if (this.cartStore && this.product._id) {
          this.cartStore.addToCart(this.product, this.quantity)
          this.snackbar = true
        }
      },

      async placeOrder(product) {
        const ls = await this.auth.getLSUserInfo()
        if (!ls || !ls.token) {
          this.$router.push('/login')
          return
        }

        const order = {
          userId: ls.user._id,
          productId: product._id,
          amount: (product.price || 0) * this.quantity,
          date: Date.now(),
          description: `Order for ${product.name || product.code} (Qty: ${this.quantity})`,
          status: 'pending'
        }

        await this.orders.addOrders(order)
        this.$router.push({ path: '/orders' })
      },

      contactSeller(owner) {
        if (Capacitor.getPlatform() !== 'web') {
          window.open('tel:' + (owner.phone || ''), '_system')
        } else {
          this.dialog = true
        }
      },

      async fetchProducts(id) {
        try {
          const response = await axios.get(`/api/products/getProductsByCategory/${id || this.product.categoryId?._id || ''}`)
          this.products = response.data || []
          this.relatedProducts = this.products.filter((a) => a._id !== this.product._id)
        } catch (error) {
          console.error('Error fetching products:', error)
        }
      },

      async fetchProductDetails(id) {
        const targetId = id || this.productId
        if (!targetId) return

        try {
          const response = await axios.get(`/api/products/${targetId}`)
          this.product = response.data
          if (this.product.categoryId) {
            await this.fetchProducts(this.product.categoryId._id || this.product.categoryId)
          }
        } catch (error) {
          console.error('Error fetching product details:', error)
        }
      },

      setMainImage(image) {
        this.product.img = image
      },

      addToCart() {
        this.handleAddToCart()
      },

      buyNow() {
        this.placeOrder(this.product)
      }
    }
  }
</script>

<style scoped>
  .main-container {
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
  }

  .sticky-gallery {
    position: sticky;
    top: 90px;
  }

  .thumbnail-card {
    border: 2px solid transparent;
    border-radius: 12px;
    transition: all 0.2s ease;
  }

  .thumbnail-card:hover,
  .thumbnail-active {
    border-color: var(--color-sand) !important;
    transform: translateY(-2px);
  }

  .line-height-relaxed {
    line-height: 1.7;
  }

  .border-b-editorial {
    border-bottom: 1px solid var(--color-border);
  }

  .border-t-editorial {
    border-top: 1px solid var(--color-border);
  }

  .border-b-sand {
    border-bottom: 1px solid rgba(217, 185, 140, 0.25);
  }

  .cursor-pointer {
    cursor: pointer;
  }
</style>
