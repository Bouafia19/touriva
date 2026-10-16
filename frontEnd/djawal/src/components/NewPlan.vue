<template>
    <div>
        <v-bottom-sheet v-model="sheet" persistent>
            <v-sheet
                class="text-center"
                height="100%"
            >
                <v-btn
                    class="mt-1"
                    text
                    color="red"
                    @click="close"
                >
                    <v-icon >mdi-chevron-down</v-icon>
                </v-btn>
           
                <div>
                    <v-container fluid>
                        <v-row>
                            <v-col cols="12" md="4" v-for="item in plans" :key="item.title">
                                <v-card
                                    @click="selectPlan(item)"
                                    color="#B0BEC5"
                                >
                                    <v-card-item>
                                    <v-card-title>{{ item.title }}</v-card-title>

                                    <v-card-subtitle>{{ item.duration }}</v-card-subtitle>

                                    <v-card-subtitle>{{ item.price + ' DZD' }}</v-card-subtitle>
                                    </v-card-item>

                                    <v-card-text>
                                    {{ item.description }}
                                    </v-card-text>
                                </v-card>
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
    import moment from 'moment'
   
    const props = defineProps(['modelValue', 'plans'])
    const emit = defineEmits('close', 'updateSheet', 'updatePlan')
      
    let drawer = ref(null),
        date = ref(Date.now()),
        date_time = ref(null),
        trip_date = ref(false),
        trip_time = ref(false), 
        photo = ref(''),
        modal = ref(false),
        loadingNewBilling = ref(false),
        description =ref('')
       
        const computedDateFormatted = computed(() => {
            return date.value ? moment(date.value).format('dddd, MMMM Do YYYY, h:mm:ss a') : ''
        }) 

        const sheet = computed(() => {
            return props.modelValue
        })

        const close = () => {
            let value = !props.modelValue
            emit('updateSheet', value)
        }

        const selectPlan = (item) => {
            emit('updateSheet', false)
            emit('selectPlan', item)
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

            const newBilling = () => {
                // this.$router.push('/billing/new')
                loadingNewBilling.value = true
                
                let currentBilling = {
                    transporterId: props.id,
                    photo: photo.value,
                    billingMethod: '',
                    amount: props.total,
                    brutAmount: props.subTotal,
                    date: date.value,
                    description: description.value,
                    tripsIds: [],
                        status: 'pending'
                }

                console.log('currentBilling', currentBilling)

                props.tripsByTransporterId.forEach(e => {
                    e.paid = true
                    currentBilling.tripsIds.push(e._id)
                    trips.updateTrip(e)
                })

                billings.addBillings(currentBilling).then(() => {
                    billings.fetchBillingsByTransporterId(props.id)
                    trips.fetchtripsByTransporterId(props.id)
                })

                loadingNewBilling.value = false
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
  