<template>
  <div>
   
    <v-container
      fluid
    >
      <v-row 
        class="d-flex justify-center align-center"
        style="height: 90vh;"
        
      >
        <v-col
          cols="12"
          sm="6"
          md="4"
        >
          <div class="text-center ma-2 mb-6">
            <h5>{{ $t('forgotPassword') }}</h5>
          </div>

          <div class="text-center ma-2">
            
              <form @submit.prevent="submit">
                
                  <v-text-field
                    v-model="phone.value.value"
                    
                    type="number"
                    :label="$t('phoneNumber')"
                    required
                    outlined
                    append-icon="mdi-backspace-outline"
                    @click:append="clear"
                    :error-messages="phone.errorMessage.value"
                    prefix="+213"
                  >
                    
                  </v-text-field>
                

                <v-dialog v-model="dialogConfirme" max-width="500px">
                  <v-card color="next" dark>
                    <v-card-title class="text-h5">{{ phone }}</v-card-title>
                    <v-card-text>
                      Êtes-vous sûr que c'est bien votre numéro
                    </v-card-text>
                    <v-card-actions>
    
                      <v-spacer></v-spacer>
                      <v-btn color="error" text @click="closeDialog">Cancel</v-btn>
                      <v-btn color="success" text @click="confirmDialog">ok</v-btn>
                      <v-spacer></v-spacer>
                    </v-card-actions>
                  </v-card>
                </v-dialog>

                <div class="text-center ma-2" v-if="err != 'paiu'">
                  <v-alert
                    dense
                    rounded
                    type="error"
                    v-if="err"
                  >
                    {{ err }}
                  </v-alert>
                </div>
                <v-dialog v-model="dialog" max-width="500px">
                  <v-card color="next" dark>
                    <v-card-title class="text-h5">{{ $t(err) }}</v-card-title>
                    <v-card-text>
                      le numéro de téléphone lequel vous essayer de vous inscrire existe déjà
                      veuillez appuyer sur le button connexion pour vous connecter à votre compte ou annuler
                      
                    </v-card-text>
                    <v-card-actions>
    
                      <v-spacer></v-spacer>
                      <v-btn color="error" text @click="close">Cancel</v-btn>
                      <v-btn color="success" text @click="confirm">{{ $t('Login') }}</v-btn>
                      <v-spacer></v-spacer>
                    </v-card-actions>
                  </v-card>
                </v-dialog>

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
           
          </div>

          <!-- <div class="text-center ma-2 mt-6">
            <v-checkbox v-model="checkbox">
              <template v-slot:label>
                <h5 class="text-center">{{ $t('termsConditionsParagraph') }}
                  <router-link to="/terms&conditions">{{ $t('termsConditions') }}</router-link>
                </h5>
              </template>
            </v-checkbox>
          </div> -->
          
        </v-col>
      </v-row>
    </v-container>
   
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  import { useField, useForm } from 'vee-validate'
  import { useI18n } from 'vue-i18n'

  const { t, locale } = useI18n()

  const { handleSubmit, handleReset } = useForm({
    validationSchema: {
      phone (value) {
        if (/^[0-9-]{9,10}$/.test(value)) return true

        return t('phoneNumberValidation')
      }
    },
  })

  const phone = useField('phone')

  const auth = useAuthStore()

  let phoneNumber = ref(''),
      err = ref(''),
      progress = ref(0),
      dialog = ref(false),
      dialogConfirme = ref(false),
      loading = ref(false),
      checkbox = ref(false)

      const verifyPhone = async () => {
        try {
          await auth.account_verify_phone({  
            phonenumber: phone.value,
            channel: 'sms',
            role: 'client' 
          })
        } catch (error) {
          err.value = error.response.data.error
          if(err.value === 'paiu'){
            dialog.value = true
          }
          console.log('error phone number', error.response.data.error)
        }
        loading.value = false
      }

       const checkPhone = async() => {
        try {
          await auth.checkPhone({  
            phonenumber: phoneNumber.value,
            role: 'client' 
          })
        } catch (error) {
          err.value = error
          if(err.value === 'paiu'){
            dialog.value = true
          }
          console.log('error phone number', error)
        }
        loading.value = false
      }

      const submit = handleSubmit(values => {
        phoneNumber.value = phone.value.value
        loading.value = true
        phoneNumber.value = '+213' + phoneNumber.value
        checkPhone()
      })

      const clear = () => {
        phone.value.value = ''
      }

      const close = () => {
        dialog.value = false
      }

      const confirm = async () => {
        await auth.verifyUser({  
          phonenumber: phone.value,
          role: 'client' 
        })
        // this.$router.push('/login')
        dialog.value = false
      }

      const closeDialog = () => {
        dialogConfirme.value = false
      }

      const confirmDialog = () => {
        verifyPhone()
        dialogConfirme.value = false
      }
  
</script>

<style scoped>
   :deep(.mdi-backspace-outline::before) {
    color: #DC143C !important;
  }
</style>