<template>
    
    <v-container class="main-container">
        <h1>Advertising</h1>
        <v-stepper
            v-model="step"
            :items="items"
            show-actions
            :disabled="isNextDisabled"
            :mobile="platform !== 'web'"
        >
            <template v-slot:item.1>
                <v-container>
                    <h3>Advertising spaces</h3>
                    <v-row :class="[platform === 'web' ? 'my-2' : 'my-1 d-flex justify-center']">
                        <v-col
                            cols="auto"
                            v-for="option in imageOptions"
                            :key="option.title"
                        >
                            <v-card
                                width="200px"
                                :elevation="selectedImage === option.value ? 10 : 2"
                                class="pa-4"
                                outlined
                                @click="selectImage(option.value)"
                            >
                                <v-img :src="option.image" height="150px" cover></v-img>
                                <v-card-text class="text-center">{{ option.title }}</v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                
                    <!-- Second Row: Cards with Icon -->
                    <h3>Target pages</h3>
                    <v-row :class="[platform === 'web' ? 'my-2' : 'my-1 d-flex justify-center']">
                        <v-col
                            cols="auto"
                            v-for="icon in iconOptions"
                            :key="icon.title"
                        >
                            <v-card
                                width="200px"
                                height="100px"
                                :elevation="selectedIcon === icon.value ? 10 : 2"
                                class="pa-4 text-center"
                                outlined
                                @click="selectIcon(icon.value)"
                            >
                                <v-icon size="large" color="next">{{ icon.icon }}</v-icon>
                                <v-card-text>{{ icon.title }}</v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>

                    <!-- Second Row: Cards -->
                    <h3>Target sectors</h3>
                    <v-row :class="[platform === 'web' ? 'my-2' : 'my-1 d-flex justify-center']">
                        <v-col
                            cols="auto"
                            v-for="(icon, index) in sectorItems"
                            :key="index"
                        >
                            <v-card
                                width="200px"
                                height="100px"
                                :elevation="selectedSector === icon ? 10 : 2"
                                class="pa-4 text-center"
                                outlined
                                @click="selectSector(icon)"
                            >
                                <v-card-text>{{ icon }}</v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>

                </v-container>
            </template>

            <template v-slot:item.2>
                <v-row>
                    <v-col
                        cols="12" 
                        sm="6" 
                        md="6"
                    >
                        <v-date-input
                            v-model="date"
                            :label="$t('Date')"
                            :allowed-dates="allowedDates"
                        ></v-date-input>
                    </v-col>

                    <v-col
                        cols="12" 
                        sm="6" 
                        md="6"
                    >
                        <v-text-field
                            v-model="duration"
                            label="Choose a duration"
                            suffix="month"
                            type="number"
                            @change="onDurationChange"
                        ></v-text-field>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col
                        cols="12"
                        sm="6"
                        md="6"
                    >
                        <v-radio-group 
                            v-model="link" 
                            label="Promotion link"
                        >
                            <v-radio label="No link" :value="1"></v-radio>
                            <v-radio label="External link" :value="2"></v-radio>
                            <v-radio label="Announcement" :value="3"></v-radio>
                        </v-radio-group>

                        <v-text-field
                            v-if="link === 2|| link === 3"
                            label="Promotion link"
                            v-model="promotionLink"   
                        ></v-text-field>
                    </v-col>

                    <v-col
                        cols="12"
                        sm="6"
                        md="6"
                    >
                        <v-container>
                            <!-- Upload Button -->
                            <v-file-input
                                label="Upload Image"
                                accept="image/*"
                                v-model="file"
                                prepend-icon="mdi-image"
                            ></v-file-input>

                            <!-- Image Preview -->
                            <v-img
                                :src="imageUrl"
                                max-height="300"
                                class="mt-4"
                                cover
                                :class="imageUrl ? '' : 'border-placeholder'"
                            >
                                <template v-if="!imageUrl" v-slot:placeholder>
                                    <div class="text-center w-100 h-100 d-flex justify-center align-center">
                                        <span class="text-medium-emphasis">No Image Selected</span>
                                    </div>
                                </template>
                            </v-img>
                        </v-container>
                    </v-col>
                </v-row>
           
                <v-row>
                    <v-col>
                        <h1>Price : {{ calculatedPrice }} DA</h1>
                    </v-col>
                </v-row>
               
            </template>

            <template v-slot:item.3>
                <v-container>
                    <h3 class="text-h6 mb-4">{{ $t('Confirmation') }}</h3>

                    <v-sheet rounded border class="pa-6">
                    <v-row>
                        <v-col cols="12" md="6">
                        <h4 class="text-subtitle-1 mb-2">{{ $t('Selected Advertising Space :') }}</h4>
                        <p>{{ selectedImage }}</p>
                        </v-col>

                        <v-col cols="12" md="6">
                        <h4 class="text-subtitle-1 mb-2">{{ $t('Selected Target Page :') }}</h4>
                        <p>{{ selectedIcon }}</p>
                        </v-col>

                        <v-col cols="12" md="6">
                        <h4 class="text-subtitle-1 mb-2">{{ $t('Selected Target Sector :') }}</h4>
                        <p>{{ selectedSector }}</p>
                        </v-col>

                        <v-col cols="12" md="6">
                        <h4 class="text-subtitle-1 mb-2">{{ $t('Start Date :') }}</h4>
                        <p>{{ formattedDate }}</p>
                        </v-col>

                        <v-col cols="12" md="6">
                        <h4 class="text-subtitle-1 mb-2">{{ $t('Duration :') }}</h4>
                        <p>{{ duration }} {{ $t('month(s)') }}</p>
                        </v-col>

                        <v-col cols="12" md="6" v-if="promotionLink">
                        <h4 class="text-subtitle-1 mb-2">{{ $t('Promotion Link :') }}</h4>
                        <p>{{ promotionLink }}</p>
                        </v-col>

                        <v-col cols="12" md="6">
                        <h4 class="text-subtitle-1 mb-2">{{ $t('Total Price :') }}</h4>
                        <p>{{ calculatedPrice }} DA</p>
                        </v-col>
                    </v-row>
                    </v-sheet>

                    <div class="text-center mt-6">
                    <v-btn 
                        color="next" 
                        @click="submitPromotion" 
                        rounded 
                        :loading="loading">
                        {{ $t('Confirm and Submit') }}
                    </v-btn>
                    </div>
                </v-container>
            </template>

            <template v-slot:item.4>
                <v-container>
                    <h3 class="text-h6 mb-4">{{ $t('Billing') }}</h3>
                    <v-sheet rounded border class="pa-6">
                        <v-row v-if="ads.getAdvertising.billingStatus == 'draft'">
                            <v-col cols="12" md="6">
                                <v-date-input
                                    v-model="date_of_billing"
                                    :label="$t('Billing Date')"
                                    disabled
                                ></v-date-input>
                            </v-col>

                            <v-col>
                                <v-container>
                                    <!-- Upload Button -->
                                    <v-file-input
                                        label="Upload Image"
                                        accept="image/*"
                                        v-model="photo"
                                        prepend-icon="mdi-image"
                                    ></v-file-input>

                                    <!-- Image Preview -->
                                    <v-img
                                        :src="photoUrl"
                                        max-height="300"
                                        class="mt-4"
                                        cover
                                        :class="photoUrl ? '' : 'border-placeholder'"
                                    >
                                        <template v-if="!photoUrl" v-slot:placeholder>
                                            <div class="text-center w-100 h-100 d-flex justify-center align-center">
                                                <span class="text-medium-emphasis">No Image Selected</span>
                                            </div>
                                        </template>
                                    </v-img>
                                </v-container>
                            </v-col>
                        </v-row>
                        <v-row v-if="ads.getAdvertising.billingStatus == 'pending'">
                            <v-col class="d-flex align-center justify-center">
                                
                                <v-chip
                                    :color="billingColor"
                                    text-color="white"
                                    small
                                    class="ma-1"
                                    variant="flat"
                                >
                                    {{ ads.getAdvertising.billingStatus + ' ...' }}
                                </v-chip>
                            </v-col>
                        </v-row>
                    </v-sheet>

                    <div class="text-center mt-6">
                        <v-btn 
                            v-if="ads.getAdvertising.billingStatus == 'draft'"
                            color="next" 
                            @click="submitBilling" 
                            rounded 
                            :loading="loadingBilling">
                            {{ $t('Confirm and Submit') }}
                        </v-btn>
                    </div>
                </v-container>
            </template>
        </v-stepper>
   
    </v-container>
</template>

<script setup>
    import { ref, watch, computed, onMounted } from 'vue'
    import { useAdvertisingStore } from '@/stores/advertising'
    import { useAdsSettingsStore} from '@/stores/adsSettings'
    import { useRouter, useRoute } from 'vue-router'
    
    const ads = useAdvertisingStore()
    const router = useRouter()
    const adsSettings = useAdsSettingsStore()

    let promotionLink = ref('')
    const step = ref(1),
            date = ref(null),
            date_of_billing = ref(new Date().toISOString().substr(0, 10)), // Default to today
            link = ref(null),
            duration = ref(1),
            minimumDuration = 1,      // Minimum 1 month
            loading = ref(false),
            loadingBilling = ref(false),
            sectorItems = ref(['BTPH', 'Agricole', 'Industriel', 'Autre'])
    const items = ref([
            'Advertising space',
            'Promotion Information',
            'Transaction',
            'Billing'
        ])

    const selectedImage = ref(null)
    const selectedIcon = ref(null)
    const selectedSector = ref(null)
    const file = ref(null)
    const photo = ref(null)
    const imageUrl = ref(null)
    const photoUrl = ref(null)
    const imageOptions = [
        { 
            title: 'Header', 
            value: 'header', 
            image: new URL('@/assets/ICONE-EN-TETE.png', 
            import.meta.url).href 
        },
        { 
            title: 'Interstitial', 
            value: 'interstitial', 
            image: new URL('@/assets/ICONE-INTERSTITIEL.png', 
            import.meta.url).href 
        }
    ]

    const iconOptions = [
        { title: 'Home', value: 'home', icon: 'mdi-home' },
        { title: 'Details page', value: 'detail', icon: 'mdi-monitor-screenshot' }
    ]

    const platform = ref('')

    const selectImage = (value) => {
        selectedImage.value = value
        console.log('Selected image:', value)
    }

    const selectIcon = (value) => {
        selectedIcon.value = value
        console.log('Selected icon:', value)
    }

    const selectSector = (value) => {
        selectedSector.value = value
        console.log('Selected sector:', value)
    }

    const allowedDates = (val) => {
        let today = new Date()
        return Date.parse(val) > today.setDate(today.getDate() - 1)
    }

    // Watch for file changes and update imageUrl
    watch(file, (newFile) => {
        if (newFile) {
            const reader = new FileReader()
            reader.onload = (e) => {
            imageUrl.value = e.target.result
            }
            reader.readAsDataURL(newFile)
        } else {
            imageUrl.value = null
        }
    })

    // Watch for file changes and update photoUrl
    watch(photo, (newFile) => {
        if (newFile) {
            const reader = new FileReader()
            reader.onload = (e) => {
            photoUrl.value = e.target.result
            }
            reader.readAsDataURL(newFile)
        } else {
            photoUrl.value = null
        }
    })

    watch(link, (newValue) => {
        console.log('Selected link value:', newValue)
    })

    // ---- Important Part ----

    // Validations
    const isStep1Valid = computed(() => selectedImage.value !== null && selectedIcon.value !== null && selectedSector.value !== null)
    
    const isStep2Valid = computed(() => {
        if (link.value === 2 || link.value === 3) {
            return date.value && duration.value && promotionLink.value && file.value
        }
        return date.value && duration.value && file.value
    })

    const isNextDisabled = computed(() => {
        if (step.value === 1) return !isStep1Valid.value
        if (step.value === 2) return !isStep2Valid.value
        if (step.value === 3) return true // Assuming step 3 is always valid for now
        return false
    })

    // Computed price
    const calculatedPrice = computed(() => {
        const validDuration = Math.max(Number(duration.value) || 0, minimumDuration)
        console.log('adsSettings.getAdsSettings.unitPrice', adsSettings.getAdsSettings.unitPrice)
        return validDuration * adsSettings.getAdsSettings.unitPrice
    })

    // Handle manual input change
    const onDurationChange = () => {
        if (duration.value < minimumDuration) {
            duration.value = minimumDuration
        }
    }

    const formattedDate = computed(() => {
        if (!date.value) return ''
        const options = { year: 'numeric', month: 'long', day: 'numeric' }
        return new Date(date.value).toLocaleDateString('en-US', options)
    })

    const submitPromotion = () => {
        loading.value = true
        let start = new Date(date.value) // Convert to Date object
        start.setMonth(start.getMonth() + parseInt(duration.value)) // Add months
        let endDate = start.toISOString().substr(0, 10)

        // submit logic here
        let formData = {
            space: selectedImage.value,
            page: selectedIcon.value,
            sector: selectedSector.value,
            startDate: date.value,
            duration: duration.value,
            link: promotionLink.value,
            img: imageUrl.value,
            ownerId: "",
            price: calculatedPrice.value,
            endDate: endDate
        }
        ads.addAdvertising(formData).then(() => {
            ads.fetchAdvertisingByUserId().then(() => {
                loading.value = false
                step.value = 4 
            }).catch((error) => {
                console.error('Error fetching advertising data:', error)
            })

        }).catch((error) => {
            console.error('Error submitting promotion:', error)
        })
    }

    const submitBilling = () => {
        loadingBilling.value = true
        let formData = {
            billingDate: date_of_billing.value,
            billingImg: photoUrl.value,
            _id: ads.getAdvertising._id,
            billingStatus: 'pending'
        }
        ads.editAdvertising(formData).then(() => {
            loadingBilling.value = false
            ads.advertising.billingStatus = 'pending'
        }).catch((error) => {
            console.error('Error submitting billing:', error)
            loadingBilling.value = false
        })
    }

    const billingColor = computed(() => {
        if (ads.getAdvertising.billingStatus == 'paid') return '#28a74580'
        else if (ads.getAdvertising.billingStatus == 'draft') return '#dc354580'
        else if (ads.getAdvertising.billingStatus == 'cancelled') return '#dc354580'
        else if (ads.getAdvertising.billingStatus == 'pending') return '#DEB887'
    })

    onMounted(() => {
        platform.value = Capacitor.getPlatform()
        ads.fetchAdvertisingByUserId().then(() => {
            console.log('Advertising data fetched successfully')
            if( ads.getAdvertising?.billingStatus === 'draft' || ads.getAdvertising?.billingStatus === 'pending') {
                step.value = 4
            }
        }).catch((error) => {
            console.error('Error fetching advertising data:', error)
        })
        adsSettings.fetchAdsSettings()
    })
    
</script>

<style scoped>
    /* Constrain the container's maximum width */
    .main-container {
        max-width: 1200px;
        margin-left: auto;
        margin-right: auto;
    }

    .border-placeholder {
        border: 2px dashed #ccc;
        min-height: 200px;
        background-color: #f9f9f9;
    }
</style>