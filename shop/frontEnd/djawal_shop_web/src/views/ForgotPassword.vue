<template>
    <div>
       
        <v-container fluid >
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
                          
                            color="next"
                            dark
                            
                            :loading="loading"
                        >
                            {{ $t('next') }}
                        </v-btn>
                    </div>
                </form>
            
                </v-col>
            </v-row>
        </v-container>
     
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import { useAuthStore } from '@/stores/auth'
    import { defineRule } from 'vee-validate'

    const auth = useAuthStore()
    
    let password = ref(''),
        passwordConfirmation = ref(''),
        err = ref(''),
        loading = ref(false)
        
            const signUp = async () => {
                try {
                    let params = {
                        id: auth.user._id,
                        password: password.value
                    }
                    await auth.account_update_existing_user(params)
                } catch (error) {
                    err.value = error.message
                    console.log('error user Information', error)
                }
            }

            const submit = () => {
                loading.value = true
                if(password.value === passwordConfirmation.value){
                    signUp()
                }else{
                    err.value = 'Password doesn\'t match'
                    loading.value = false
                    setTimeout(() => {
                        err.value = ''
                    }, "5000")
                }
            }

            const clear = () => {
                password.value = ''
                passwordConfirmation.value = ''
                
            }
</script>