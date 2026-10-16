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
                    <div v-if="!typeAccount">
                        <p>{{ $t('Sttoa') }}:</p>
                        <v-col cols="12">
                            
                            <v-btn
                                v-for="role in usersRoles"
                                block
                                color="next"
                                class="mb-2"
                                @click="selectUserRole(role)"
                                size="x-large"
                            >
                                {{ $t(role) }}
                            
                            </v-btn>
                            
                        </v-col>
                    </div>
                    <!-- <v-radio-group v-model="typeAccount">
                        <v-radio color="next" label="seller" value="seller"></v-radio>
                        <v-radio color="next" label="Rented" value="rented"></v-radio>
                    </v-radio-group> -->
                    <div v-else>
                        <v-text-field
                            v-model="companyName"
                            :label="$t('RaisonSocial')"
                            required
                            outlined
                            v-if="isAgency || isAssociation || isOther"
                        ></v-text-field>

                        <v-text-field
                            v-model="firstName"
                            :label="isVisitor || isGuide ? $t('firstName') : isAgency ? $t('firstNameResponsable') : $t('firstNamePresident')"
                            required
                            outlined
                            v-if="isAgency || isAssociation || isGuide || isOther || isVisitor"
                        ></v-text-field>

                        <v-text-field
                            v-model="lastName"
                            :label="isVisitor || isGuide ? $t('lastName') : isAgency ? $t('lastNameResponsable') : $t('lastNamePresident')"
                            required
                            outlined
                            v-if="isAgency || isAssociation || isGuide || isOther || isVisitor"
                        ></v-text-field>

                        <v-select
                            v-if="isGuide"
                            v-model="guideType"
                            :label="$t('typeOfGuide')"
                            :items="guideTypes"
                            item-title="label"
                            item-value="value"
                        />

                        <!-- <v-select
                            v-if="isAssociation"
                            v-model="associationTypeActivity"
                            label="Activité de l'association"
                            :items="['randonnées','désert','événements', 'expériences locales', 'autres']"
                        /> -->

                        <v-autocomplete
                            v-if="isAssociation"
                            v-model="associationTypeActivity"
                            :items="activities.getActivities"
                            label="Activité de l'association"
                            item-title="name"
                            item-value="_id"
                        ></v-autocomplete>

                        <v-autocomplete
                            v-model="wilayaId"
                            :items="wilaya.getWilayas"
                            label="Wilaya"
                            item-title="name"
                            item-value="_id"
                            @update:modelValue="updateDaira()"
                        ></v-autocomplete>

                        <!-- <v-autocomplete
                            v-model="dairaId"
                            :items="dairaItems"
                            label="daira"
                            item-title="name"
                            item-value="_id"
                            @update:modelValue="updateCommune()"
                        ></v-autocomplete> -->

                        <v-autocomplete
                            v-model="communeId"
                            :items="communeItems"
                            label="commune"
                            item-title="name"
                            item-value="_id"
                            @update:modelValue="getCommuneId()"
                        ></v-autocomplete>
                                
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
                            
                        <v-checkbox 
                            v-model="checkbox"
                            v-if="isGuide"
                        >
                            <template v-slot:label>
                                <h5 class="text-center">
                                    {{ $t('hasLicense') }}
                                </h5>
                            </template>
                        </v-checkbox>

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
                                rounded
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
    import { onMounted, ref, computed } from 'vue'
    import { useRoute } from 'vue-router'
    // import { PushNotifications } from '@capacitor/push-notifications'
    import { Capacitor } from '@capacitor/core'
    import { useAuthStore } from '@/stores/auth'
    import { useField, useForm } from 'vee-validate'
    import { useWilayasStore } from '@/stores/wilaya'
    import { useDairasStore } from '@/stores/daira'
    import { useCommunesStore } from '@/stores/commune'
    import { useActivitiesStore } from '@/stores/activities'
    import { useI18n } from 'vue-i18n'

    const wilaya = useWilayasStore()
    const daira = useDairasStore()
    const commune = useCommunesStore()
    const activities = useActivitiesStore()
    const { t } = useI18n()

    const { handleSubmit, handleReset } = useForm({
        validationSchema: {
        email (value) {
            if (/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(value)) {
                return true
            }

            return 'Must be a valid e-mail.'
        }
        }
    })
  
    const email = useField('email')

    const route = useRoute()
    const auth = useAuthStore()

    let progress = ref(50),
        companyName = ref(''),
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
        wilayaId = ref(""),
        dairaItems = ref([]),
        dairaId = ref(""),
        communeItems = ref([]),
        communeId = ref(""),
        sectorId = ref(null),
        usersRoles = ref(['touristGuide', 'associations', 'touristAgencies', 'visitor','others']),
        rc = ref(null),
        nis = ref(null),
        nif = ref(null),
        art = ref(null),
        typeAccount = ref(""),
        guideType = ref('none'),
        associationTypeActivity = ref(null)

        const isAgency = computed(() => typeAccount.value === 'touristAgencies')
        const isGuide = computed(() => typeAccount.value === 'touristGuide')
        const isAssociation = computed(() => typeAccount.value === 'associations')
        const isOther = computed(() => typeAccount.value === 'others')
        const isVisitor = computed(() => typeAccount.value === 'visitor')
        const guideTypes = computed(() => [
            { label: t('accompanist'), value: 'accompanist' },
            { label: t('nationalGuide'), value: 'nationalGuide' },
            { label: t('localGuide'), value: 'localGuide' }
        ])

       
       
            const signUp = async () => {
                let phone = route.params.phonenumber
                try {
                    await auth.account_sign_up({  
                        phone: phone,
                        companyName: companyName.value,
                        firstName: firstName.value,
                        lastName: lastName.value,
                        email: email.value.value,
                        password: password.value,
                        role: 'partner',
                        // fcmToken: fcmToken.value,
                        // codePartenaire: codePartenaire.value,
                        // code: code.value,
                        activated: true,
                        complete: true,
                        // vehicleId: null,
                        status: false,
                        fileStatus: 'confirmed',
                        hasLicense: checkbox.value,
                        // rc: rc.value,
                        // nis: nis.value,
                        // nif: nif.value,
                        // art: art.value,
                        wilayaId: wilayaId.value,
                        // dairaId: dairaId.value,
                        communeId: communeId.value,
                        typeAccount: typeAccount.value,
                        // sectorActivity: sectorId.value,
                        guideType: guideType.value,
                        associationTypeActivity: associationTypeActivity.value
                    })
                } catch (error) {
                    console.log('error', auth.getError)
                    err.value = auth.getError
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

        const updateDaira = () => {
            dairaItems.value = daira.getDairas.filter(
                d => d.wilayaId === wilayaId.value
            )

            communeItems.value = commune.getCommunes.filter(c =>
                dairaItems.value.some(d => d._id === c.dairaId)
            )
        }

        const updateCommune = () => {
            communeItems.value = commune.getCommunes.filter(e => e.dairaId === dairaId.value)

        }

        const getCommuneId = () => {
        }

        const selectUserRole = (role) => {
            typeAccount.value = role
            console.log('type', typeAccount.value)
        }

        onMounted(() => {
            wilaya.fetchWilayas()
            daira.fetchDairas()
            commune.fetchCommunes()
            activities.fetchActivities()
        })
</script>