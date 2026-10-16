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
                <v-row class="d-flex justify-center">
                    <v-col
                        class="d-flex pb-0"
                        cols="12"
                        sm="6"
                    >
                        
                        <v-text-field
                            v-model="computedDateFormatted"
                            append-icon="mdi-calendar"
                            :label="$t('Date')"
                            readonly
                            outlined
                            rounded
                            disabled
                        ></v-text-field>
                           
                    </v-col>
                </v-row>

                <v-row class="d-flex justify-center">
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
                        
                        dark
                        color="next"
                        @click="newBilling"
                        :loading="loadingNewBilling"
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
    import { useBillingsStore } from '@/stores/billings'
    import axios from 'axios'

    const billings = useBillingsStore()
   
    const props = defineProps(['modelValue', 'id', 'total', 'announcements'])
    const emit = defineEmits('close')
      
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
            emit('update:modelValue', value)
            emit('reloadAnnouncements')
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

        const updateAnnouncement = async (item) =>{
            try {
                await axios.patch(`/api/announcements/${item._id}`, item);
            } catch (error) {
                console.error('Error updating announcement:', error);
            }
        }

        const newBilling = () => {
            // this.$router.push('/billing/new')
            loadingNewBilling.value = true
            
            let currentBilling = {
                userId: props.id,
                photo: photo.value,
                billingMethod: '',
                amount: props.total,
                brutAmount: '',
                date: date.value,
                description: description.value,
                pubId: props.announcements[0],
                status: 'pending'
            }

            console.log('currentBilling', currentBilling)
            console.log('props.announcements', props.announcements)

            props.announcements.forEach(e => {
                e.paid = true
                e.published = false
                updateAnnouncement(e)
                // billings.editBillings(e)
                // currentBilling.tripsIds.push(e._id)
                // trips.updateTrip(e)
            })

            billings.addBillings(currentBilling).then(() => {
                billings.fetchBillingsByUserId(props.id)
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
  