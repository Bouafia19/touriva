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
                    <v-col>
                        
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
    import { onMounted, ref, computed } from 'vue'
    import { useRouter } from 'vue-router'
    import { useUsersStore } from '@/stores/users'
    import { useAuthStore } from '@/stores/auth'
    import { useDisplay } from "vuetify"
   
    const users = useUsersStore()
    const auth = useAuthStore()
    const router = useRouter()
    const display = useDisplay()

    let items = ref([
              { id: 1, title: 'nisDoc', done: false },
              { id: 2, title: 'commercialRegister', done: false },
              { id: 3, title: 'nifDoc', done: false },
            //   { id: 4, title: 'trafficPermit', done: false },
              { id: 5, title: 'id', done: false }
            ]),
            user = ref(null),
            loading = ref(false),
            show = ref(false),
            counter = ref(0),
            err = ref(''),
            array = ref([])

            const auth_sign_out = () => {
                auth.account_sign_out()
            }

            const getRoute = (item) => {
                users.photo = users.images[item.title]
                users.title = item.title
                router.push({ name: 'Document' })
            }

            const submit = () => {
                loading.value = true
                users.updateUserProfile({ fileStatus: 'pending' }).then((res) => {
                    console.log('res', res)
                    // this.user.fileStatus = res.fileStatus
                    router.push({ name: 'Pending' })
                    loading.value = false
                })
            }

            const updateUi = () => {
                auth.getLSUserInfo().then((ls) => {
                counter.value = 0
                const keys = Object.keys(users.getImages)
                    keys.forEach(key => {
                        items.value.forEach(e => {
                            if(key === e.title){
                                e.done = true
                                counter.value = counter.value + 1
                                if(counter.value === 4){
                                    show.value = true
                                } 
                            }
                        })
                    })
                })
            }

            const containerClass = computed(() => {
                if (display.xs.value) return "custom-width-xs";
                if (display.sm.value) return "custom-width-sm";
                if (display.md.value) return "custom-width-md";
                if (display.lg.value || display.xl.value) return "custom-width-lg";
                return ""
            })
    
        onMounted(() => {
            auth.getLSUserInfo().then((ls) => {
                user.value = ls.user
                array.value = items.value
            })
            if(users.getImages){
                updateUi()
            }
            users.loadPartnerPhotos().then(() => {
                updateUi()
            })
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