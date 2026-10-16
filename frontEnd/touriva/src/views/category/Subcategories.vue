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

        <h2 class="pa-4 text-uppercase">
            {{ categories.getCategoryName || child[0]?.parent?.name }}
        </h2>

        <h3 
            class="pa-4 text-uppercase text-center"
        >
            {{ $t('Subcategories') }}
        </h3>

        <v-row 
            v-if="child.length > 0 && !getLoading" 
            class="d-flex justify-center"
        >
            <v-col       
                cols="auto"
                v-for="category in child" 
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
                    >
                        {{ category.name }}
                    </v-card-title>
            
                </v-card>
            </v-col>
        </v-row>

        <v-row
            v-else
            class="d-flex justify-center"
        >
            <v-col
                v-if="child.length === 0 && !getLoading"
            >
                <v-alert type="info">No categories found.</v-alert>
            </v-col>

            <v-col 
                cols="auto"
                v-for="(cat, index) in 10" 
                :key="index" 
                v-else
            >
                <v-skeleton-loader
                    class="mx-auto"
                    :width="cardWidth"
                    :height="cardHeight"
                    type="card"
                ></v-skeleton-loader>
            </v-col>

        </v-row>
           
             
    </v-container>
</template>

<script setup>
    import { ref, onMounted, computed, watch, onActivated, onDeactivated } from 'vue'
    import { Capacitor } from '@capacitor/core'
    import { useDisplay } from "vuetify"
    import { useCategoriesStore } from '@/stores/categories'
    import Advertising from '@/components/Advertising.vue'
    import { useRouter, useRoute } from 'vue-router'
    import { storeToRefs } from 'pinia'

    const categories = useCategoriesStore()
    const { getChildsLocal, getLoading } = storeToRefs(categories)
    const display = useDisplay()
    const router = useRouter()
    const route = useRoute()

    let id = route.params.id
    let platform = ref(null),
        child = ref([])

    watch(() => route.fullPath, (newPath, oldPath) => {
            id = route.params.id
            categories.fetchChildNoImages({ typeAccount: 'rented', id: id })
        }
    )

    watch(() => categories.childsLocal, (newVal) => {
            child.value = [...newVal]
        },
        { deep: true }
    )

    const cardWidth = computed(() => {
        const { xs, sm, md, lg } = display
        if (xs.value) return "170px"
        if (sm.value) return "170px"
        if (md.value) return "170px"
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
        categories.childsLocal = []
        categories.loading = true
        if(cat.hasChild){
            router.push({ name: 'Subcategories', params: { id: cat._id } })
        }else{
            router.push({ name: 'Publications', params: { id: cat._id } })
        }
    }

    const returnTo = () => {
        categories.categoryName = ''
        categories.childsLocal = []
        categories.loading = true
        router.go(-1)
    }

    onMounted(async () => {
        platform.value = Capacitor.getPlatform()
        if (!child.value.length) {
            await categories.fetchChildNoImages({ typeAccount: 'rented', id })
            child.value = getChildsLocal.value
        }
        console.log('onMounted')
    })

    onActivated(() => {
        console.log('onActivated')
        if(child.value.length){
            categories.loading = false
        }
    })

    onDeactivated(() => {
        console.log('onDeactivated')
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

    .break-word {
        word-break: break-word;
        overflow-wrap: break-word;
        white-space: normal;
    }

</style>