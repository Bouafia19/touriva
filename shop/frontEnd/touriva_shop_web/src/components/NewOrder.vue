<template>
    <div>
        <v-bottom-sheet v-model="sheet" persistent>
            <v-sheet
                class="text-center"
                height="100%"
            >
                <v-btn
                    class="mt-1"
                    icon
                    color="red"
                    @click="close"
                >
                <v-icon >mdi-chevron-down</v-icon>
                </v-btn>
           
            <div >

            <v-container fluid>
                <v-row align="center">
                    <v-col
                        class="d-flex pb-0"
                        cols="12"
                        sm="6"
                    >
                        <v-menu
                            v-model="trip_date"
                            :close-on-content-click="false"
                            max-width="290"
                        >
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                    :value="computedDateFormatted"
                                    append-icon="mdi-calendar"
                                    clearable
                                    :label="$t('Date')"
                                    readonly
                                    outlined
                                    rounded
                                    disabled
                                ></v-text-field>
                            </template>
                        </v-menu>
                    </v-col>
                </v-row>

                <v-row align="center">
                    <v-col
                        class="d-flex py-2"
                        cols="12"
                        sm="6"
                    >
                        <v-textarea
                            v-model="description"
                            :label="$t('Description')"
                            required
                            auto-grow
                            rows="2"
                            filled
                            color="next"
                        ></v-textarea>
                    </v-col>
                </v-row>
                 
                <div class="d-flex flex-column justify-space-between align-center mb-2">
                    <v-avatar 
                        size="200"
                        rounded="lg"
                    >
                        <v-img 
                            :src="photo"
                            contain
                            width="100px"
                            style="float: right; border: 1px solid;"
                            alt="marchandise Image"
                            eager
                        >  
                            <use-camera v-on:cameraUpload="uploadImage($event)"/>
                        </v-img> 
                    </v-avatar>
                </div>

                <v-row align="center" class="mt-4">
                <v-col>
                    <v-btn
                        
                        block
                        dark
                        color="next"
                        @click="newOrder"
                        :loading="loadingNewOrder"
                    >
                        {{ $t('makePayment') }}
                    </v-btn>
                </v-col>
            </v-row>
            </v-container>

            </div>
            </v-sheet>
        </v-bottom-sheet>

    </div>
</template>

<script setup>
    import { ref, onMounted, computed } from 'vue'
    import UseCamera from '@/components/UseCamera.vue'
    import moment from 'moment'
    import { useOrdersStore } from '@/stores/orders'
    import { useTripsStore } from '@/stores/trips'

    const orders = useOrdersStore()
    const trips = useTripsStore()
   
    const props = defineProps(['modelValue', 'id', 'total', 'subTotal', 'tripsByTransporterId'])
    const emit = defineEmits('close')
      
    let drawer = ref(null),
        date = ref(Date.now()),
        date_time = ref(null),
        trip_date = ref(false),
        trip_time = ref(false), 
        photo = ref(''),
        modal = ref(false),
        loadingNewOrder = ref(false),
        description =ref('')
       
        computedDateFormatted = computed(() => {
            return date.value ? moment(date.value).format('dddd, MMMM Do YYYY, h:mm:ss a') : ''
        }) 

        const sheet = computed(() => {
            return props.modelValue
        })

        const close = () => {
            let value = !modelValue
            // let obj = {
            //     date: Date.now(),
            //     photo: this.photo
            // }
            // this.$emit('tripPlaned', obj)
            emit('update:modelValue', value)
        }

        const confirme = () => {
            this.$refs.dialog.save(time.value)
            // this.date_time = new Date(`${this.date}T${this.time}:00`)
            date_time.value = new Date(Date.now())
        }

        const updateDate = () => {
            trip_date.value = false
            modal.value = true
        }
            
            const uploadImage = (img64) => {  
                photo.value = img64
            }

            const newOrder = () => {
                // this.$router.push('/order/new')
                loadingNewOrder.value = true
                
                let currentOrder = {
                    transporterId: props.id,
                    photo: photo.value,
                    orderMethod: '',
                    amount: props.total,
                    brutAmount: props.subTotal,
                    date: date.value,
                    description: description.value,
                    tripsIds: [],
                        status: 'pending'
                }

                console.log('currentOrder', currentOrder)

                props.tripsByTransporterId.forEach(e => {
                    e.paid = true
                    currentOrder.tripsIds.push(e._id)
                    trips.updateTrip(e)
                })

                orders.addOrders(currentOrder).then(() => {
                    orders.fetchOrdersByTransporterId(props.id)
                    trips.fetchtripsByTransporterId(props.id)
                })

                loadingNewOrder.value = false
                close()
            }
</script>

<style scoped>
    :deep(.v-text-field__suffix) {
        color: #00366f !important;
    }
    :deep(.v-input__icon--append .v-icon) { 
        color: #00366f !important;
    }
    :deep(.v-dialog:not(.v-dialog--fullscreen)) {
        max-height: 100%;
    }   
</style>
  