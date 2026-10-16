<template>
    <v-container 
        fluid 
        :class="[platform === 'web' ? 'px-0 main-container' : '']"
    >
        <Advertising />

        <!--
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
        -->
        <h2 class="pa-4 text-uppercase">
            {{ categories.getCategoryName }}
        </h2>
        
        <v-row 
            v-if="filteredProducts.length > 0 && !getLoading" 
            class="d-flex justify-center"
        >
            <!-- Filter Section -->
            <v-col 
                cols="3" 
                class="filter-sidebar d-none d-md-flex"
            >
                <v-card
                    elevation="4"
                    width="100%"
                >
                    <v-card-title>{{ $t('Filters') }}</v-card-title>

                    <v-card-text>

                        <v-list>
                            <!--
                            <v-list-item
                                v-for="category in categories.categoriesLocal"
                                :key="category._id"
                            >
                                <v-checkbox
                                    v-model="filters.category" 
                                    :value="category._id"
                                    :label="category.name" 
                                    hide-details
                                ></v-checkbox>
                            </v-list-item>
                            -->
                            
                            <CategoryCheckbox
                                v-for="category in categories.categoriesLocal"
                                :key="category._id"
                                :category="category"
                                v-model:selected="selectedCategories"
                            />
                            
                            <v-divider 
                                v-if="categories.categoriesLocal.length > 0"
                                class="mb-2"
                            ></v-divider>
                            
                            <div class="text-caption">{{ $t('PriceRange') }}</div>
                            <v-slider 
                                v-model="filters.price" 
                                :max="maxPrice"  
                                class="px-1"
                                thumb-label     
                            ></v-slider>
                        </v-list>
                    </v-card-text>

                    <v-card-actions>
                        <v-btn 
                            @click="applyFilters" 
                            color="next"
                        >
                            {{ $t('Apply') }}
                        </v-btn>
                        <v-btn 
                            @click="removeFilters" 
                            color="next"
                        >
                            {{ $t('Remove') }}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>

            <!-- Products Section -->
            <v-col cols="9" class="product-cards px-0">
                <v-row justify="end">
                    <v-btn
                        class="d-flex d-md-none"
                        variant="plain"
                        @click="drawer = true"
                        append-icon="mdi-filter"
                        color="next"
                    >
                        {{ $t('OpenFilters') }}

                        <template v-slot:append>
                            <v-icon color="next"></v-icon>
                        </template>
                    </v-btn>
                </v-row>
                
                <v-row >
                    <v-col 
                        v-for="product in paginatedItems" 
                        :key="product.id" 
                        cols="6" 
                        sm="6" 
                        md="6" 
                        lg="4"
                        :class="[platform != 'web' ? 'pa-1' : 'flex-grow-1']"
                    >
                        <v-card
                            elevation="4"
                            :to="`/product/${product._id}`"
                            class="px-1"
                            
                            
                        >
                            <v-img 
                                :src="product.img" 
                                class="align-end" 
                                height="200px"
                                width="100%"
                            >
                                <template v-slot:placeholder>
                                    <v-row
                                        align="center"
                                        class="fill-height ma-0"
                                        justify="center"
                                    >
                                        <v-progress-circular
                                            color="grey-lighten-5"
                                            indeterminate
                                        ></v-progress-circular>
                                    </v-row>
                                </template>
                            </v-img>

                            <v-card-title
                                class="subtitle-2 text-center break-word d-flex justify-center align-center"
                                :style="{ fontSize: fontSize, height: '50px'}"
                                v-if="product.name"
                            >
                                {{ product.name }}
                            </v-card-title>

                            <v-card-text 
                                class="py-0"
                                v-if="product.price"
                            >
                                {{ product.price + ' DZD' }}
                            </v-card-text>

                            <v-card-actions>
                                <v-btn 
                                    color="next" 
                                    :to="`/product/${product._id}`"
                                >
                                    {{ $t('Detail') }}
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- Pagination -->
                <v-row justify="center">
                    <v-pagination
                        v-model="currentPage"
                        :length="totalPages"
                        :total-visible="5"
                        color="next"
                        v-if="totalPages > 1"
                    ></v-pagination>
                </v-row>
            </v-col>
        </v-row>

        <v-row v-else>
            <v-col 
                v-for="(ann, index) in 10" 
                :key="index" 
                cols="6" 
                sm="6" 
                md="6" 
                lg="4"
                v-if="paginatedItems.length === 0 && getLoading"
            >
                <v-skeleton-loader
                    type="card"
                ></v-skeleton-loader>
            </v-col>

            <v-col v-else-if="paginatedItems.length === 0 && !getLoading">
                <v-alert type="info">{{ $t('Npfitc') }}</v-alert>
            </v-col>
        </v-row>

        <!-- Navigation Drawer for Mobile -->
        <v-navigation-drawer
            v-model="drawer"
            class="d-md-none"
            app
            temporary
        >
            <v-card
                flat
            >
                <v-card-title>{{ $t('Filters') }}</v-card-title>
                <v-card-text>
                    <v-list>
                        <!-- <v-list-item
                            v-for="category in categories.categoriesLocal"
                            :key="category._id"
                        >
                            <v-checkbox
                            v-model="filters.category" 
                            :value="category._id"
                            :label="category.name" 
                            ></v-checkbox>
                        </v-list-item>

                        <v-divider v-if="categories.categoriesLocal.length > 0"></v-divider> -->
                        <div class="text-caption">{{ $t('PriceRange') }}</div>
                        <v-slider 
                            v-model="filters.price" 
                            :max="maxPrice" 
                            thumb-label 
                        ></v-slider>
                    </v-list>
                </v-card-text>
                <v-card-actions>
                    <v-btn 
                        @click="applyFilters" 
                        color="next"
                    >
                        {{ $t('Apply') }}
                    </v-btn>
                    <v-btn 
                        @click="removeFilters" 
                        color="next"
                    >
                        {{ $t('Remove') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-navigation-drawer>
    </v-container>
</template>

<script setup>
    import { ref, onMounted, computed, watch, reactive, onActivated, onDeactivated, onUnmounted } from 'vue'
    import { useRouter, useRoute } from 'vue-router'
    import { useProductsStore } from '@/stores/products'
    import Advertising from '@/components/Advertising.vue'
    import { useCategoriesStore } from '@/stores/categories'
    import { useDisplay } from "vuetify"
    import { storeToRefs } from 'pinia'
    import CategoryCheckbox from '@/components/CategoryCheckbox.vue'

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

     watch(() => route.fullPath, (newPath, oldPath) => {
            id = route.params.id
            
            if(route.name === "Wallpaper"){
                categories.fetchNestedCategories({ parentId: "68d93256e80c80fd4e3ee3fc"})
                products.fetchProductsByCategoryChilds("68d93256e80c80fd4e3ee3fc")
            }else if(route.name === "Painting"){
                categories.fetchNestedCategories({ parentId: "68d8fdc4f5b38332f5976c96"})
                products.fetchProductsByCategoryChilds("68d8fdc4f5b38332f5976c96")
            }
        }
    )

    // Watch Pinia store changes
    watch(getProductsLocal, (newValue) => {
        filteredProducts.value = newValue
    }, { immediate: true })

    const cardWidth = computed(() => {
        const { xs, sm, md, lg } = display
        if (xs.value) return "240px"
        if (sm.value) return "280px"
        if (md.value) return "280px"
        if (lg.value) return "344px"
        return "200px"
    })

    const cardHeight = computed(() => {
        const { xs, sm, md, lg } = display
        if (xs.value) return "300px"
        if (sm.value) return "300px"
        if (md.value) return "300px"
        if (lg.value) return "300px"
        return "300px"
    })

    const fontSize = computed(() => {
        const { xs, sm, md, lg } = display
        if (xs.value) return "12px"
        if (sm.value) return "16px"
        if (md.value) return "16px"
        if (lg.value) return "16px"
        return "18px"
    })

    const totalPages = computed(() => {
        return Math.ceil(filteredProducts.value.length / itemsPerPage.value);
    })

    const paginatedItems = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage.value;
        const end = currentPage.value * itemsPerPage.value;
        return filteredProducts.value.slice(start, end);
    })

    const maxPrice = computed(() => {
        return Math.max(...getProductsLocal.value.map((product) => product.price));
    })

    // Remove Filters
    const removeFilters = () => {
        filters.category = false;
        filters.price = 0;
        filteredProducts.value = getProductsLocal.value
    }

    // Apply Filters
    const applyFilters = () => {

        filteredProducts.value = getProductsLocal.value.filter((product) => {
            // Match category (supports multiple)
            const matchesCategory =
            selectedCategories.value.length === 0 ||
            selectedCategories.value.includes(product.categoryId)

            // Match price
            const withinPriceRange =
            !filters.price || product.price <= filters.price

            return matchesCategory && withinPriceRange
        })
    }

    const returnTo = () => {
        categories.categoryName = ''
        router.go(-1)
    }

    onMounted(async () => {
        platform.value = Capacitor.getPlatform()
        products.fetchProductsNoImages().then(() => {
            filteredProducts.value = getProductsLocal.value
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
        max-width: 1200px;
        margin-left: auto;
        margin-right: auto;
    }

    .filter-sidebar {
        padding-right: 16px;
        align-self: flex-start;
    }

    .break-word {
        word-break: break-word;
        overflow-wrap: break-word;
        white-space: normal;
    }

    .filter-sidebar {
        padding-right: 16px;
        align-self: flex-start;
    }

    .product-cards {
        padding-left: 16px;
    }

</style>