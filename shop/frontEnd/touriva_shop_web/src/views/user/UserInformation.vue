<template>
    <v-container fluid >
        <!-- <div class="text-right">
            <v-menu
                v-model="menu"
                :close-on-content-click="false"
                offset-x
            >
                <template v-slot:activator="{ props }">
                    <v-btn
                        color="indigo"
                        dark
                        v-bind="props"
                        icon
                    >
                        <v-icon>mdi-code-less-than</v-icon>
                    </v-btn>
                </template>

                <v-card width="300">
                    <v-card-text>
                        <v-text-field
                                v-model="codePartenaire"
                                :label="$t('code')"
                                required
                                outlined
                            ></v-text-field>
                    </v-card-text>
                </v-card>
            </v-menu>
        </div> -->

        <v-row
            class="d-flex justify-center align-center"
            style="height: 90vh;"
        >
            <v-col
                cols="12"
                sm="6"
                md="4"
            >
                <form @submit.prevent="submit">

                    <!--<div v-if="!typeAccount">
                        <p>{{ $t('Sttoa') }}:</p>
                        <v-col cols="12">
                            
                            <v-btn
                                block
                                :color="typeAccount === 'ordinary' ? 'primary' : 'next'"
                                class="mb-2"
                                @click="selectOrdinary"
                                size="x-large"
                            >
                                {{ $t('Ordinary') }}
                            </v-btn>

                            <v-btn
                                block
                                :color="typeAccount === 'professional' ? 'primary' : 'next'"
                                @click="selectProfessional"
                                size="x-large"
                                class="mt-4"
                            >
                                {{ $t('professional') }}
                            </v-btn>
                            
                        </v-col>
                    </div>  -->
                    <div>
                        <!--<v-text-field
                            v-model="companyName"
                            :label="$t('RaisonSocial')"
                            required
                            outlined
                            v-if="typeAccount === 'professional'"
                        ></v-text-field>
                                
                        <v-text-field
                            v-model="nis"
                            :label="$t('NIS')"
                            required
                            outlined
                            v-if="typeAccount === 'professional'"
                        ></v-text-field>

                        <v-text-field
                            v-model="nif"
                            :label="$t('NIF')"
                            required
                            outlined
                            v-if="typeAccount === 'professional'"
                        ></v-text-field>

                        <v-text-field
                            v-model="rc"
                            :label="$t('RC')"
                            required
                            outlined
                            v-if="typeAccount === 'professional'"
                        ></v-text-field>

                        <v-text-field
                            v-model="art"
                            :label="$t('ART')"
                            required
                            outlined
                            v-if="typeAccount === 'professional'"
                        ></v-text-field>

                        <v-autocomplete
                            v-model="wilayaId"
                            :items="wilaya.getWilayas"
                            :label="$t('Wilaya')"
                            item-title="name"
                            item-value="_id"
                            @update:modelValue="updateDaira()"
                            v-if="typeAccount === 'professional'"
                        ></v-autocomplete>

                        <v-autocomplete
                            v-model="dairaId"
                            :items="dairaItems"
                            :label="$t('daira')"
                            item-title="name"
                            item-value="_id"
                            @update:modelValue="updateCommune()"
                            v-if="typeAccount === 'professional'"
                        ></v-autocomplete>

                        <v-autocomplete
                            v-model="communeId"
                            :items="communeItems"
                            :label="$t('commune')"
                            item-title="name"
                            item-value="_id"
                            @update:modelValue="getCommuneId()"
                            v-if="typeAccount === 'professional'"
                        ></v-autocomplete>

                        <v-autocomplete
                            v-model="sectorId"
                            :items="sectorItems"
                            :label="$t('Sa')"
                            v-if="typeAccount === 'professional'"
                        ></v-autocomplete>  -->

                        <v-text-field
                            v-model="firstName"
                            :label="$t('firstName')"
                            required
                            outlined
                            
                        ></v-text-field>
                                
                        <v-text-field
                            v-model="lastName"
                            :label="$t('lastName')"
                            required
                            outlined
                    
                        ></v-text-field>
                                
                        <v-text-field
                            v-model="email.value.value"
                            :label="$t('email')"
                            required
                            outlined
                            :error-messages="email.errorMessage.value"
                        ></v-text-field>
                                
                        <v-text-field
                            v-model="password"
                            :label="$t('password')"
                            required
                            outlined
                            type="password"
                        ></v-text-field>
                                
                        <v-text-field
                            v-model="passwordConfirmation"
                            :label="$t('passwordConfirmation')"
                            required
                            outlined
                            type="password"
                        ></v-text-field>
                                
                        <!-- <v-checkbox v-model="checkbox">
                            <template v-slot:label>
                                <h5 class="text-center">
                                    {{ $t('legal') }}
                                </h5>
                            </template>
                        </v-checkbox> -->

                        <div class="ma-2">
                            <v-alert
                                dense
                                outlined
                                type="error"
                                v-if="err"
                            >
                                {{ $t(err) }}
                            </v-alert>
                        </div>

                        <div class="text-center ma-2">
                            <v-btn
                                type="submit"
                                block
                                color="next"
                                dark
                                :loading="loading"
                            >
                                {{ $t('next') }}
                            </v-btn>
                        </div>
                    </div>
                </form>
                    
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
    import { onMounted, ref } from 'vue'
    import { useRoute } from 'vue-router'
    // import { PushNotifications } from '@capacitor/push-notifications'
    import { Capacitor } from '@capacitor/core'
    import { useAuthStore } from '@/stores/auth'
    import { useWilayasStore } from '@/stores/wilaya'
    import { useDairasStore } from '@/stores/daira'
    import { useCommunesStore } from '@/stores/commune'
    import { useField, useForm } from 'vee-validate'

    const wilaya = useWilayasStore()
    const daira = useDairasStore()
    const commune = useCommunesStore()

    const { handleSubmit, handleReset } = useForm({
        validationSchema: {
        email (value) {
            if (/^[a-z.-]+@[a-z.-]+\.[a-z]+$/i.test(value)) return true

            return 'Must be a valid e-mail.'
        }
        }
    })
  
    const email = useField('email')

    const route = useRoute()
    const auth = useAuthStore()

    let progress = ref(50),
        firstName = ref(''),
        lastName = ref(''),
        phoneNumber = ref(''),
        password = ref(''),
        passwordConfirmation = ref(''),
        err = ref(''),
        loading = ref(false),
        fcmToken = ref(''),
        fav = ref(true),
        menu = ref(false),
        message = ref(false),
        hints = ref(true),
        codePartenaire = ref(''),
        code = ref(''),
        checkbox = ref(false),
        wilayaId = ref(null),
        dairaItems = ref([]),
        dairaId = ref(null),
        communeItems = ref([]),
        communeId = ref(null),
        sectorId = ref(null),
        sectorItems = ref(['BTPH', 'Agricole', 'Industriel', 'Autre']),
        rc = ref(null),
        nis = ref(null),
        nif = ref(null),
        art = ref(null),
        typeAccount= ref(""),
        companyName = ref('')
       
            const signUp = async () => {
                let phone = route.params.phonenumber
                try {
                    await auth.account_sign_up({  
                        phone: phone,
                        firstName: firstName.value,
                        lastName: lastName.value,
                        companyName: companyName.value,
                        email: email.value.value,
                        password: password.value,
                        role: 'client',
                        // fcmToken: fcmToken.value,
                        // codePartenaire: codePartenaire.value,
                        // code: code.value,
                        activated: true,
                        complete: true,
                        vehicleId: null,
                        status: false,
                        fileStatus: 'confirmed',
                        // legal: checkbox.value
                        rc: rc.value,
                        nis: nis.value,
                        nif: nif.value,
                        art: art.value,
                        wilayaId: wilayaId.value,
                        dairaId: dairaId.value,
                        communeId: communeId.value,
                        typeAccount: typeAccount.value,
                        sectorActivity: sectorId.value
                    })
                } catch (error) {
                    err.value = error.message
                    console.log('error user Information', error)
                }
                loading.value = false
            }

            const submit = handleSubmit(values => {
                loading.value = true
                if(password.value === passwordConfirmation.value){
                    signUp()
                }else{
                    err.value = 'Password doesn\'t match'
                    loading.value = false
                    setTimeout(() => {
                        err.value = ''
                        clear()
                    }, "5000")
                }
            })

        const clear = () => {
            password.value = ''
            passwordConfirmation.value = ''
        }

        // const registerNotifications = async () => {
        //     let permStatus = await PushNotifications.checkPermissions()

        //     if (permStatus.receive === 'prompt') {
        //         permStatus = await PushNotifications.requestPermissions()
        //     }

        //     if (permStatus.receive !== 'granted') {
        //         throw new Error('User denied permissions!');
        //     }

        //     await PushNotifications.register();
        // }
            
        // const addListeners = async () => {
        //     await PushNotifications.addListener('registration', token => {
        //         console.log('Registration token: ', token.value)
        //         fcmToken.value = token.value
        //     })

        //     await PushNotifications.addListener('registrationError', err => {
        //         console.error('Registration error: ', err.error);
        //     })
        // }

        const updateDaira = () => {
            console.log('id', wilayaId.value)
            dairaItems.value = daira.getDairas.filter(e => e.wilayaId === wilayaId.value)
        }

        const updateCommune = () => {
            console.log('id', dairaId.value)
            communeItems.value = commune.getCommunes.filter(e => e.dairaId === dairaId.value)

        }

        const getCommuneId = () => {
            console.log('communeId', communeId.value)
        }

        const selectOrdinary = () => {
            typeAccount.value = 'ordinary';
            
        }

        const selectProfessional = () => {
            typeAccount.value = 'professional';
            
        }

        /*onMounted(() => {
            wilaya.fetchWilayas()
            daira.fetchDairas()
            commune.fetchCommunes()
            
        })*/
</script>