<template>
 
    <v-container fluid class="px-0 main-container">
        <v-carousel
            cycle
            hide-delimiter-background
            show-arrows-on-hover
            height="50vh"
        >
            <v-carousel-item
            v-for="(slide, idx) in slides"
            :key="idx"
            >
            <v-img
                :src="slide.image"
                cover
                class="d-flex flex-column align-center justify-center"
            ></v-img>
            </v-carousel-item>
        </v-carousel>
        
        <Products />
    
        <!-- <h2 class="text-center my-8">Shop by Collection</h2>
        <v-row class="d-flex align-center justify-center">
          <v-col cols="12" md="4" v-for="category in getCategoriesLocal" :key="category._id">
            <v-card class="hover-card" elevation="2">
              <v-img :src="category.img" height="250px" cover></v-img>
              <v-card-title class="justify-center">{{ category.name }}</v-card-title>
            </v-card>
          </v-col>
        </v-row> -->
      
        <h2 class="text-center my-8">Best Sellers</h2>
        <v-row>
          <v-col cols="12" sm="6" md="3" v-for="product in products" :key="product.id">
            <v-card class="product-card" elevation="2">
              <v-img :src="product.image" height="220px" cover></v-img>
              <v-card-title>{{ product.name }}</v-card-title>
              <v-card-subtitle>{{ product.price }} DZD</v-card-subtitle>
              <v-card-actions>
                <v-btn block color="primary" @click="addToCart(product)">
                  Add to Cart
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>  
    </v-container>

    <!-- Footer -->
    <v-footer color="next" class="text-white pa-8">
        <v-container>
            <v-row>
            <v-col cols="12" md="4">
                <h3 class="mb-4">Online Store</h3>
                <p>Unique paintings and wallpapers to transform your space.</p>
            </v-col>
            <v-col cols="12" md="4">
                <h4 class="mb-4">Quick Links</h4>
                <ul class="footer-links">
                <li><a href="/">Home</a></li>
                <li><a href="/shop">Shop</a></li>
                <li><a href="/about">About</a></li>
                <li><a href="/contact">Contact</a></li>
                </ul>
            </v-col>
            <v-col cols="12" md="4">
                <h4 class="mb-4">Follow Us</h4>
                <v-btn icon variant="text"><v-icon>mdi-facebook</v-icon></v-btn>
                <v-btn icon variant="text"><v-icon>mdi-instagram</v-icon></v-btn>
                <v-btn icon variant="text"><v-icon>mdi-twitter</v-icon></v-btn>
            </v-col>
            </v-row>
        </v-container>
    </v-footer>
    
</template>

<script setup>
    import { ref, onMounted, watch } from "vue"
    import { storeToRefs } from 'pinia'
    import { useCategoriesStore } from "@/stores/categories"
    import Products from '@/views/Product/index.vue'
    
    const categories = useCategoriesStore()
    const { getCategoriesLocal, getLoading } = storeToRefs(categories)

    watch(getCategoriesLocal, (newValue) => {
        categories.categoriesLocal = newValue
    }, { immediate: true })

    const slides = ref([
        {
            image: "/1.webp",  // put actual image file url
            title: "Street Art Collection",
            subtitle: "Bright and bold pieces for modern rooms",
            ctaText: "Explore Now",
            link: "/collection/street-art",
        },
        {
            image: "/2.jpg",
            title: "Zen Decor",
            subtitle: "Soothing designs for calm spaces",
            ctaText: "View Collection",
            link: "/collection/zen",
        },
        {
            image: "/3.avif",
            title: "Leaf & Nature",
            subtitle: "Natural motifs to freshen your walls",
            ctaText: "Shop Nature",
            link: "/collection/nature",
        },
    ])

const products = ref([
  { id: 1, name: "Golden Sunset", price: 4500, image: "https://picsum.photos/300/220?random=11" },
  { id: 2, name: "Modern Lines Wallpaper", price: 3200, image: "https://picsum.photos/300/220?random=12" },
  { id: 3, name: "Nature Vibes", price: 5000, image: "https://picsum.photos/300/220?random=13" },
  { id: 4, name: "Classic Art", price: 6000, image: "https://picsum.photos/300/220?random=14" },
])

const addToCart = (product) => {
  console.log("Added to cart:", product)
  // TODO: connect to Pinia or backend cart API
}

onMounted(() => {
    categories.fetchCategoriesNoImages()
})

</script>

<style scoped>
    .carousel-caption {
        background: rgba(0, 0, 0, 0.4);
        padding: 24px;
        border-radius: 12px;
    }

    .main-container {
        max-width: 1200px;
        margin-left: auto;
        margin-right: auto;
    }

.hover-card {
  cursor: pointer;
  transition: transform 0.3s;
}
.hover-card:hover {
  transform: scale(1.05);
}
.product-card {
  transition: box-shadow 0.3s;
}
.product-card:hover {
  box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.15);
}
.footer-links {
  list-style: none;
  padding: 0;
}
.footer-links li {
  margin-bottom: 8px;
}
.footer-links a {
  color: white;
  text-decoration: none;
}
.footer-links a:hover {
  text-decoration: underline;
}
</style>
