<template>
  <v-container 
    fluid 
    :class="[platform === 'web' ? 'px-0 main-container' : '']"
  >

    <Advertising />

    <v-row>
      <v-col class="d-flex justify-start">
        <v-btn 
          color="next"
          @click="returnTo"
          variant="text"
          prepend-icon="mdi-arrow-left"
        >
          {{ $t('Return') }}
        </v-btn>
      </v-col>
    </v-row>

    <!-- Product Details -->
    <v-row>
      <!-- Left Column: Images -->
      <v-col cols="12" md="6" :class="platform !== 'web' ? 'pt-0' : ''">

        <v-carousel 
          :show-arrows="false" 
          v-model="currentImage" 
          class="pa-0 ma-0" 
          :height="$vuetify.display.mdAndUp ? 300 : 250"  
          hide-delimiters
        >
          <v-carousel-item 
            v-for="(image, index) in imageList" 
            :key="index" 
            class="pa-0 ma-0"
          >
            <v-img
              :src="image"
              aspect-ratio="1.77"
              cover
            >
              <!-- Loading slot -->
              <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular
                    indeterminate
                    color="next"
                  ></v-progress-circular>
                </v-row>
              </template>
            </v-img>
          </v-carousel-item>
        </v-carousel>

        <!-- Thumbnails -->
        <v-row 
          justify="center"
          v-if="product.thumbnails.length === 0"  
        >
          <v-skeleton-loader
            v-for="(im, index) in 3"
            :key="index"
            max-width="75"
            max-height="75"
            class="mx-1"
            type="image"
          ></v-skeleton-loader>
        </v-row>

        <v-row 
          class="mt-2" 
          justify="center" 
          v-else
        >
          <v-img  
            v-for="(image, index) in product.thumbnails"
            :key="index"
            :src="image"
            max-width="95"
            max-height="95"
            class="mx-1"
            :class="{ active: currentImage === index }"
            @click="currentImage = index"
          ></v-img>
        </v-row>
      </v-col>

      <!-- Right Column: Details -->
      <v-col cols="12" md="6">
        <v-card class="pa-4">
          <v-card-title 
            class="text-h5 mb-2"
          >
            {{ product.code }}
          </v-card-title>

          <v-card-subtitle class="text-h6 text-primary" v-if="product.price">
            {{ product.price + ' DZD' }}
          </v-card-subtitle>

          <v-divider class="my-4" v-if="product.price"></v-divider>

          <v-card-text>
            <!--<p class="mb-2"><strong>{{ $t('Category') }}:</strong> {{ product.categoryId ? product.categoryId.name : '****' }}</p>
            <p class="mb-2"><strong>{{ $t('Location') }}:</strong> {{ product.ownerId ? product.ownerId.communeId.name + 
                                                          ', ' + product.ownerId.dairaId.name + 
                                                          ', ' + product.ownerId.wilayaId.name 
                                                          : '****'
                                                        }}
                                                      </p>-->
            <p class="mb-2" v-if="product.price"><strong>{{ $t('Description') }}:</strong>{{ product.description }}</p>
          </v-card-text>

          <v-btn 
            block 
            color="next" 
            class="mt-4"
            @click="placeOrder(product)"
          >
            {{ $t('PlaceOrder') }}
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- Additional Information -->
    <v-card class="my-4" v-if="product.features.length > 0">
      <v-card-title class="text-h6">{{ $t('Specifications') }}</v-card-title>
      <v-card-text>

        <v-skeleton-loader
          v-if="product.features.length === 0"
          type="list-item-three-line"
        ></v-skeleton-loader>

        <v-list v-else>
          <v-list-item 
            v-for="(feature, index) in product.features" 
            :key="index"
          >
            
            <v-list-item-title>
              <strong>{{ feature.key }}</strong>: {{ feature.value }}
            </v-list-item-title>
            
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <!-- Related Products -->
    <v-row 
      class="mt-6"
      v-if="relatedProducts.length > 0"
    >

      <v-col cols="12">
        <h4 class="mb-4">{{ $t('RelatedProducts') }}</h4>
      </v-col>

      <v-col 
        cols="12" 
        md="3" 
        v-for="(rel, index) in 4" 
        :key="index"
        v-if="relatedProducts.length === 0"
      >
        <v-skeleton-loader
          type="card"
        ></v-skeleton-loader>
      </v-col>

      <v-col 
        v-else 
        cols="12" 
        md="3" 
        v-for="(related, index) in relatedProducts.slice(0, 4)" 
        :key="related._id"
      >
        <v-card @click="$router.push(`/product/${related._id}`)">
          <v-img :src="related.img" height="150px" cover class="mb-2"></v-img>
          <v-card-title class="text-h6">{{ related.code }}</v-card-title>
          <v-card-subtitle class="text-primary" v-if="related.price">{{ related.price + ' DZD'}}</v-card-subtitle>
          <v-card-actions>
            <v-btn text color="white" :to="`/product/${related._id}`">{{ $t('ViewDetails') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title 
          style="background-color: #00366f;color: white"
        >
          {{product.ownerId.companyName}}
        </v-card-title>

        <v-card-text>
          <p>{{ $t('phoneNumber') }}: </p>
          <p>{{product.ownerId.phone}}</p>  
          
          <p>{{ $t('email') }}: </p>
          <p>{{product.ownerId.email}}</p> 
          
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="dialog = false">{{ $t('close') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>
  import axios from 'axios'
  import { Capacitor } from '@capacitor/core'
  import { useAdvertisingStore } from '@/stores/advertising'
  import Advertising from '@/components/Advertising.vue'
  import { useOrdersStore } from '@/stores/orders'
  import { useAuthStore } from '@/stores/auth'

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
      relatedProducts: [],
      dialog: false,
      platform: null,
      ads: null,
      dialogAds: false,
      orders: null,
      auth: null
    };
  },

  computed: {
    // Combine main image with thumbnails, or just use the main image if no thumbnails
    imageList() {
      return this.product.thumbnails.length ? this.product.thumbnails : [this.product.img];
    },
  },

  async created() {
    this.platform = Capacitor.getPlatform()
    this.ads = useAdvertisingStore()
    this.orders = useOrdersStore()
    this.auth = useAuthStore()
    await this.fetchProductDetails()
    this.ads.fetchAdvertising().then(() => {
      if(this.ads.getInterstitialAdsDetail.length > 0){
        this.dialogAds = true
      }
    })
  },

  watch: {
    // Watch for changes to the route parameter (id)
    "$route.params.productId": {
      immediate: true, // Trigger on component creation
      handler(newId) {
        this.fetchProductDetails(newId); // Fetch data whenever the id changes
      },
    },
  },

  methods: {
    returnTo(){
      this.$router.go(-1)
    },

    openInNewTab(href){
      if(href){
        window.open(href, '_blank')
      }
    },

    async placeOrder(product) {
      console.log('product', product)
      const ls = await this.auth.getLSUserInfo()
      
      let order = {
        userId: ls.user._id,
        productId: product._id,
        amount: product.price,
        date: Date.now(),
        description: '',
        status: 'pending'
      }
      console.log('order', order)
      this.orders.addOrders(order)
      this.$router.push({ path: `/orders` })
    },

    contactSeller(owner) {
      if(Capacitor.getPlatform() !== 'web'){
        window.open('tel:' + owner.phone, '_system')
      }else{
        this.dialog = true
      }
    },

    async fetchProducts(id){
      try {
        let response = null
        response = await axios.get(`/api/products/getProductsByCategory/${id}`)
        this.products.push(...response.data)
        this.relatedProducts = this.products.filter((a) => a._id !== this.product._id);

      } catch (error) {
        console.error('Error fetching products:', error);
      }
    },

    async fetchProductDetails() {
      try {
        const response = await axios.get(`/api/products/${this.productId}`)
        this.product = response.data
        await this.fetchProducts()
      } catch (error) {
        console.error('Error fetching product details:', error)
      }
    },

    setMainImage(image) {
      this.product.img = image
    },

    addToCart() {
      alert("Item added to cart!");
    },

    buyNow() {
      alert("Proceeding to checkout...");
    }
  },
};
</script>

<style scoped>
  .v-card-actions {
    background-color: #00366f;
  }

  .v-img.active {
    border: 2px solid #1976d2;
    border-radius: 4px;
    cursor: pointer;
  }

  .v-card {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
  }

  .image-gallery {
    position: relative;
  }

  .main-image {
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .thumbnail {
    width: 80px;
    height: 80px;
    margin: 0 8px;
    cursor: pointer;
    border: 2px solid transparent;
    border-radius: 4px;
    transition: transform 0.2s, border 0.2s;
  }

  .thumbnail:hover {
    transform: scale(1.1);
    border: 2px solid #1976d2; /* Primary color */
  }

  .details-card {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    border-radius: 8px;
  }

  .price {
    font-weight: bold;
    color: #1976d2; /* Primary color */
  }

  .description {
    font-size: 16px;
    line-height: 1.6;
    color: #555;
  }

  .main-container {
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
  }
</style>
