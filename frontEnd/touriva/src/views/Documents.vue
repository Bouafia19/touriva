<template>
    <div>
            <v-container 
                fluid 
                :class="containerClass"
            >
                
                <div class="text-right">
                    <v-btn
                        icon
                        color="error"
                        @click="auth_sign_out"
                    >
                        <v-icon>mdi-logout</v-icon>
                    </v-btn>
                </div>

                <v-row 
                    class="d-flex justify-center align-center"
                    style="height: 50vh;"
                >
                    <v-col
                        cols="12"
                        sm="6"
                        md="4"
                    >
                        
                        <div class="text-center ma-2 mb-6">
                            <h4>{{ $t('documentTitle')}}</h4>
                            <h5>{{ $t('documentParagraph') }}</h5>
                        </div>

                        <v-progress-linear
                            color="next"
                            indeterminate
                            rounded
                            height="6"
                            v-if="!users.images"
                        ></v-progress-linear>

                        <v-list
                            dense
                            nav
                            shaped
                            v-else
                        >
                            <div v-for="(item, index) in array" :key="index">
                                <v-list-item
                                    dense
                                    @click="getRoute(item)"
                                >

                                    <template v-slot:prepend>
                                        <v-icon :color="item.done ? 'success' : 'next'">
                                            {{ item.done ? 'mdi-checkbox-marked-circle' : 'mdi-minus-circle' }}
                                        </v-icon>
                                    </template>
                                    
                                    <v-list-item-title>{{ $t(item.title) }}</v-list-item-title>
                                    
                                </v-list-item>
                            </div>
                        </v-list>
                    </v-col>
                </v-row>
                <div class="text-center ma-2">
                    <v-alert
                        dense
                        rounded
                        type="error"
                        v-if="err"
                    >
                        {{ $t(err) }}
                    </v-alert>
                </div>
                <div class="text-center ma-2">
                    <v-btn
                        color="next"
                        block
                        rounded
                        dark
                        :loading="loading"
                        @click="submit"
                        v-show="show"
                    >
                        {{ $t('submit') }}
                    </v-btn>
                </div>
            </v-container>
    </div>
</template>

<script setup>
    import { onMounted, ref, computed, watch } from 'vue'
    import { useRouter } from 'vue-router'
    import { useUsersStore } from '@/stores/users'
    import { useAuthStore } from '@/stores/auth'
    import { useDisplay } from "vuetify"
   
    const users = useUsersStore()
    const auth = useAuthStore()
    const router = useRouter()
    const display = useDisplay()

    const GUIDE_ROLE_DOCUMENTS = {
        localGuide: {
            label: 'Guide local',
            documents: ['diploma', 'accreditation', 'id']
        },

        nationalGuide: {
            label: 'Guide national',
            documents: ['diploma', 'accreditation', 'id']
        },

        accompanist: {
            label: 'Accompagnateur',
            documents: ['id']
        }
    }

    const ROLE_DOCUMENTS = {

        touristAgencies: {
            label: 'Agence de voyage',
            documents: ['id', 'commercialRegister', 'accreditation']
        },

        associations: {
            label: 'Association',
            documents: ['presidentId', 'accreditation']
        },

        others: {
            label: 'Autre organisme',
            documents: ['id', 'justification']
        }
    }

    const DOCUMENT_LABELS = {
        id: 'id',
        diploma: 'diploma',
        accreditation: 'accreditation',
        commercialRegister: 'commercialRegister',
        presidentId: 'presidentId',
        justification: 'justification'
    }

    let user = ref(null),
        loading = ref(false),
        show = ref(false),
        counter = ref(0),
        err = ref(''),
        array = ref([])

    const items = ref([])

    const buildDocumentsForRoleGuide = (typeAccount) => {
        const roleConfig = GUIDE_ROLE_DOCUMENTS[typeAccount]

        if (!roleConfig) {
            items.value = []
            return
        }

        let docs = [...roleConfig.documents]

        if (user.value.hasLicense === false) {
            docs = docs.filter(doc => doc !== 'accreditation')
        }

        items.value = docs.map((doc, index) => ({
            id: index + 1,
            title: DOCUMENT_LABELS[doc],
            key: doc,
            done: false
        }))

        array.value = items.value
    }

    const buildDocumentsForRole = (typeAccount) => {
        const roleConfig = ROLE_DOCUMENTS[typeAccount]

        if (!roleConfig) {
            items.value = []
            return
        }

        items.value = roleConfig.documents.map((doc, index) => ({
            id: index + 1,
            title: DOCUMENT_LABELS[doc],
            key: doc,
            done: false
        }))

        array.value = items.value
    }

    const auth_sign_out = () => {
        auth.account_sign_out()
    }

    const getRoute = (item) => {
        users.photo = users.images[item.key]
        users.title = item.key
        router.push({ name: 'Document' })
    }

    const submit = () => {
        loading.value = true
        users.updateUserProfile({ fileStatus: 'pending' }).then((res) => {
            console.log('res', res)
            
            router.push({ name: 'Pending' })
            loading.value = false
        })
    }

    // const updateUi = () => {
    //     counter.value = 0

    //     if (!users.getImages) return

    //     items.value.forEach(item => {
    //         if (users.getImages[item.key]) {
    //         item.done = true
    //         counter.value++
    //         }
    //     })

    //     show.value = counter.value === items.value.length
    // }
    const updateUi = () => {
        counter.value = 0

        if (!users.getImages || !items.value.length) return

        items.value.forEach(item => {
            if (users.getImages[item.key]) {
                item.done = true
                counter.value++
            } else {
                item.done = false
            }
        })

        show.value = counter.value === items.value.length
    }

    watch(
        () => users.getImages,
        () => {
            updateUi()
        },
        { deep: true }
    )


    const containerClass = computed(() => {
        if (display.xs.value) return "custom-width-xs";
        if (display.sm.value) return "custom-width-sm";
        if (display.md.value) return "custom-width-md";
        if (display.lg.value || display.xl.value) return "custom-width-lg";
        return ""
    })
    
    onMounted(async () => {
        const ls = await auth.getLSUserInfo()
        user.value = ls.user

        // 🔑 example: user.typeAccount must exist
        if(user.value.typeAccount === 'touristGuide'){
            buildDocumentsForRoleGuide(user.value.guideType)
        }else{
            buildDocumentsForRole(user.value.typeAccount)
        }

        await users.loadPartnerPhotos()
        updateUi()
    })
</script>

<style scoped>
/* Adjust widths for different screen sizes */
.custom-width-xs {
  max-width: 100%; /* Full width for extra small screens */
}
.custom-width-sm {
  max-width: 540px;
}
.custom-width-md {
  max-width: 720px;
}
.custom-width-lg {
  max-width: 960px;
}
</style>