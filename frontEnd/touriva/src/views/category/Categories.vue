<template>
    <v-container 
      fluid 
      :class="[platform === 'web' ? 'px-0 main-container' : '']"
    >
        <Advertising />

        <h2 class="pa-4 text-uppercase">{{ $t('Categories') }}</h2>

        <v-row class="justify-center ma-0">
            <v-col 
                cols="auto"
                v-for="(cat, index) in 10" 
                :key="index" 
                v-if="getCategoriesLocal.length === 0 && getLoading"
            >
                <v-skeleton-loader
                    class="mx-auto"
                    :width="cardWidth"
                    :height="cardHeight"
                    type="card"
                ></v-skeleton-loader>
            </v-col>

            <v-col
                v-else-if="getCategoriesLocal.length === 0 && !getLoading"
            >
                <v-alert type="info">{{ $t('Ncf') }}</v-alert>
            </v-col>
        
            <v-col
                v-else
                cols="auto"
                v-for="category in getCategoriesLocal" 
                :key="category._id"
            >      
                <v-card
                    class="mx-auto"
                    :width="cardWidth"
                    @click="filterChild(category)"
                >
                    <v-img
                        class="align-end text-white"
                        height="200"
                        :src="category.img"
                        cover
                    >
                        <template v-slot:placeholder>
                            <div class="d-flex align-center justify-center fill-height">
                                <v-progress-circular
                                    color="grey-lighten-5"
                                    indeterminate
                                ></v-progress-circular>
                            </div>
                        </template>
                    </v-img>

                    <v-card-title
                        class="subtitle-2 text-center break-word d-flex justify-center align-center"
                        :style="{ fontSize: fontSize, height: '50px'}"
                    >
                        {{ category.name }}
                    </v-card-title>
                </v-card>
            </v-col>
      </v-row> 

    </v-container>
</template>

<script setup>
    import { ref, onMounted, computed } from 'vue'
    import { Capacitor } from '@capacitor/core'
    import { useDisplay } from "vuetify"
    import { useCategoriesStore } from '@/stores/categories'
    import Advertising from '@/components/Advertising.vue'
    import { useRouter } from 'vue-router'
    import { storeToRefs } from 'pinia'

    const categories = useCategoriesStore()
    const { getCategoriesLocal, getLoading } = storeToRefs(categories)
    const display = useDisplay()
    const router = useRouter()

    let platform = ref(null)

    const cardWidth = computed(() => {
        const { xs, sm, md, lg } = display
        if (xs.value) return "165px"
        if (sm.value) return "165px"
        if (md.value) return "165px"
        if (lg.value) return "344"
        return "200"
    })

    const cardHeight = computed(() => {
        const { xs, sm, md, lg } = display
        if (xs.value) return "150px"
        if (sm.value) return "250px"
        if (md.value) return "250px"
        if (lg.value) return "250px"
        return "250px"
    })

    const fontSize = computed(() => {
        const { xs, sm, md, lg } = display
        if (xs.value) return "12px"
        if (sm.value) return "16px"
        if (md.value) return "16px"
        if (lg.value) return "16px"
        return "18px"
    })

    const filterChild = (cat) => {
        categories.categoryName = cat.name
        router.push({ name: 'Subcategories', params: { id: cat._id } })
    }

    onMounted(async () => {
        platform.value = Capacitor.getPlatform()
        if(!getCategoriesLocal.value.length){
            categories.fetchCategoriesNoImages({ typeAccount: 'rented' })
        }
    })

</script>

<style scoped>

    .main-container {
        max-width: 1200px;
        margin-left: auto;
        margin-right: auto;
    }

    .break-word {
        word-break: break-word;
        overflow-wrap: break-word;
        white-space: normal;
    }

</style>