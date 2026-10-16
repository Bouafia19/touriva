<template>
    <div>
        <v-container class="mt-2" fluid >
            <div class="text-center" v-if="terms.getLoadingTerms">
                <v-row 
                    class="d-flex justify-center align-center"  
                    style="height: 100vh;"
                >
                    <v-progress-circular
                    indeterminate
                    color="next"
                    ></v-progress-circular>
                </v-row>
            </div>
            <div v-else>
                <div v-if="terms.getTerms.length === 0" class="text-center ma-2">
                    <v-row class="d-flex justify-center align-center">
                        <v-col
                            cols="12"
                            sm="6"
                            md="4"
                        >
                            <v-alert
                                outlined
                                color="info"
                            >
                            <div class="text-h6">
                                {{ $t('noRecords')}}
                            </div>
                            </v-alert>
                    
                        </v-col>
                    </v-row>
                    
                </div>
                <div v-else>
                    <v-row>
                        <v-col
                            cols="12"
                            sm="6"
                            md="4"
                        >
                            <div v-for="term in terms.getTerms" :key="term._id">
                                <h4 v-if="term.order.charAt(0) != '0'" class="d-inline">{{ term.order + ' ' }}</h4> 
                                <h4 class="d-inline">{{ term.title }}</h4>
                                <p class="text-justify">{{ term.text }}</p>
                            </div>    
                        </v-col>
                    </v-row>
                </div>
                    <!-- <v-row v-if="prevRoute.fullPath != '/tabs'">
                        <v-col class="py-0">
                            <v-checkbox v-model="checkbox">
                                <template v-slot:label>
                                    <div>
                                        {{ $t('igttac')}}
                                    </div>
                                </template>
                            </v-checkbox>
                        </v-col>
                    </v-row> -->

                    <v-row 
                        v-if="prevRoute.fullPath != '/tabs'"
                        class="d-flex align-center justify-center"
                    >
                        <v-col
                            cols="12"
                            sm="6"
                            md="4"
                        >
                            <v-btn dark color="next" block @click="handleSubmit">{{ $t('next') }}</v-btn>
                        </v-col>
                    </v-row>
                
            </div>
        </v-container>
       
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import { useTermsStore } from '@/stores/terms'

    const terms = useTermsStore()
    const router = useRouter()
   
        let progress = ref(75),
            checkbox = ref(false),
            prevRoute = ref(''),
            title = ref('')

        onMounted(() => {
            terms.fetchTerms()
        })
     
        
        const handleSubmit = () => {
            router.go(-1)
        }
        
        const beforeRouteEnter = (to, from, next) => {
            next(vm => {
                vm.prevRoute = from
            })
            
            next()
        }
</script>

<style scoped>
    p {
        font-size: 14px;
    }
   
</style>