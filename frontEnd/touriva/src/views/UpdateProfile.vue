<template>
    <div>
        <v-container fluid >
            <!-- <v-row>
                <v-col>
                    <div class="d-flex justify-end">
                        <v-switch
                            v-model="users.user.status"
                            inset
                            :label="users.user.status ? $t('availabe') : $t('notAvailable')"
                            color="success"
                        ></v-switch>
                    </div>
                </v-col>
            </v-row> -->
            <v-row
                class="d-flex justify-center"
                style="height: 90vh;"
            >
                <v-col
                    cols="12"
                    sm="6"
                    md="4"
                >
                    
                
                <form @submit.prevent="submit" v-if="users.getUser">
                    
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
                                alt="Profile Image"
                                eager
                            >  
                                <use-camera v-on:cameraUpload="uploadImage($event)" pageTitle="ProfileUpdate"/>
                            </v-img> 
                        </v-avatar>
                    </div>
        
                    <div class="d-flex justify-center mt-4">
                       
                            <v-select
                                v-model="$i18n.locale"
                                :items="locals"
                                bg-color="#00366F"
                                flat
                                :label="$t('cl')"
                                max-width="200"
                                cover
                            >
                                <template v-slot:item="{ props, item }">
                                    <v-list-item v-bind="props" :title="$t(item.raw.title)"></v-list-item>
                                </template>
                                <template v-slot:selection="{ item }">
                                    <span>
                                    {{ $t(item.title) }}
                                    </span>
                                </template>
                            </v-select>
                      
                    </div>
                   
                   
                        <v-text-field
                            v-model="users.user.firstName"
                            
                            :label="$t('firstName')"
                            required
                            outlined
                            dense
                            
                        ></v-text-field>
                    
                        <v-text-field
                            v-model="users.user.lastName"
                            
                            :label="$t('lastName')"
                            required
                            outlined
                            dense
                            
                        ></v-text-field>
                   
                        <v-text-field
                        v-model="users.user.email"
                        
                        :label="$t('email')"
                        required
                        outlined
                        dense
                        
                        ></v-text-field>
                    
                    <!-- <validation-provider
                        v-slot="{ errors }"
                        name="password"
                        rules="required|confirmed:password"  
                    >
                        <v-text-field
                        v-model="password"
                        :error-messages="errors"
                        :label="$t('password')"
                        required
                        outlined
                        dense
                        type="password"
                        ></v-text-field>
                    </validation-provider>

                    <validation-provider
                        v-slot="{ errors }"
                        name="passwordConfirmation"
                        rules="required"
                        vid="password"
                    >
                        <v-text-field
                            v-model="passwordConfirmation"
                            :error-messages="errors"
                            :label="$t('passwordConfirmation')"
                            required
                            outlined
                            dense
                            type="password"
                        >
                        </v-text-field>
                    </validation-provider> -->

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

                    <div class="ma-2">
                        <v-alert
                            dense
                            outlined
                            type="success"
                            v-if="info"
                        >
                            {{ $t(info) }}
                        </v-alert>
                    </div>

                    <div class="text-center">
                        <v-btn
                            type="submit"
                            block
                            color="next"
                            dark
                            :loading="loading"
                        >
                            {{ $t('update') }}
                        </v-btn>
                    </div>
                
                </form>
          
                </v-col>
            </v-row>
        </v-container>
       
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { useI18n } from 'vue-i18n'
    import { useLocale } from 'vuetify'
    import { useUsersStore } from '@/stores/users'
    import UseCamera from '@/components/UseCamera.vue'
    
    const { current } = useLocale()
    const { locale } = useI18n()
    const users = useUsersStore()

    let password = ref(''),
        passwordConfirmation = ref(''),
        err = ref(''),
        info = ref(''),
        loading = ref(false),
        image = ref(undefined),
        photo = ref(null),
        locals = ref([
        {
            value: "ar",
            title: "arabic"
        }, 
        {
            value: "fr",
            title: "french"
        }, 
        {
            value: "en",
            title: "english"
        }])

        let userObj = {}

        const updateUser = () => {
            userObj.language = locale.value
            userObj.firstName = users.user.firstName
            userObj.lastName = users.user.lastName
            userObj.email = users.user.email
                try {
                    users.updateUserProfile(userObj).then(() => {
                        loading.value = false
                        info.value = 'User updated successfully'
                        setTimeout(() => {
                            info.value = ''
                        }, "5000")
                    })
                } catch (error) {
                    err.value = error.message
                    console.log('error user Information', error)
                }
            }
            
            const uploadImage = (value) => {
                photo.value = value
            }

            const submit = () => {
                loading.value = true
                updateUser() 
            }

            onMounted(() => {
                users.loadUser()
            })
</script>

<style scoped>
    :deep(.v-input__control .v-text-field__details) {
        margin-bottom: 0;
    }
    :deep(.v-file-input) {
        position:relative; 
        left: 170px;
        top: 150px;
    }
    :deep(.v-file-input .v-icon) {
        color: #00366f !important;
    }
</style>