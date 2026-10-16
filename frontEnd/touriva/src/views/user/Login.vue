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
            <h5>{{ $t('logInParagraph') }}</h5>
          </div>
   
            <form @submit.prevent="submit">
              
              <v-text-field
                v-model="phone.value.value"
                :label="$t('phoneNumber')"
                required
                outlined
                append-icon="mdi-backspace-outline"
                @click:append="phone.value.value = null"
                :error-messages="phone.errorMessage.value"
                prefix="+213"
                type="number"
              ></v-text-field>
              

              <v-text-field
                v-model="password"
                :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                :type="show ? 'text' : 'password'"
                @click:append="show = !show"
                :label="$t('password')"
                required
                outlined
              
              >
              </v-text-field>

              <div class="text-left ml-2 mb-5">
                <h5>
                  <router-link to="/checkPhone">{{ $t('forgotPassword') }}</router-link>
                </h5>
              </div>

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
  import { ref, onMounted } from 'vue'
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
      password = ref(''),
      show = ref(false),
      loading = ref(false)
  
    
      const logIn = async () => {
        try {
          let phoneNum = '+213' + phoneNumber.value
          await auth.account_sign_in({  
            phone: phoneNum,
            password: password.value,
            role: 'partner'
          })
        } catch (error) {
          err.value = error.message
          setTimeout(() => {
            err.value = ''
            clear()
          }, "5000")
        }
        loading.value = false
        
      }

      const submit = handleSubmit(values => {
        phoneNumber.value = phone.value.value
        loading.value = true
        logIn()
      })

      const clear = () => {
        phone.value.value = ''
        password.value = ''
      }
</script>

<style scoped>
  :deep(.mdi-backspace-outline::before) {
    color: #DC143C !important;
  }
  :deep(.mdi-eye-off::before) { 
    color: #008B8B;
  }
</style>