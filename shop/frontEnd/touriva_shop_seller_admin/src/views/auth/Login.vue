<template>
  <div>
    <v-container
      fluid
      class="d-flex justify-center align-center"
      style="height: 90vh;"
    >
      <v-card
        width="70%"
        outlined
        class="rounded-lg"
          
      >
        <v-row 
          class="d-flex justify-space-around align-center ma-4 pa-4"
        
        >
          <v-col 
            cols="12"
            md="4"
          >
            <v-img           
                size="100%"
                src="/logo.jpg"
                alt="img"
              >
            </v-img>
          </v-col>

        <v-divider
          class="mx-4"
          vertical
        ></v-divider>

        <v-col 
          cols="12"
          md="4"
        >
          <div class="text-center ma-2 mb-6">
            <h5>{{ $t('logInParagraph') }}</h5>
          </div>
            <form @submit.prevent="submit">
              <v-text-field
                v-model="email"
                :label="$t('Email')"
                required
                append-icon="mdi-backspace-outline"
                @click:append="email = null"
              >
              </v-text-field>

              <v-text-field
                v-model="password"
                :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                :type="show ? 'text' : 'password'"
                @click:append="show = !show"
                :label="$t('Password')"
                required
                
              >
              </v-text-field>

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
                  block
                 
                  dark
                  :loading="loading"
                >
                  {{ $t('Login') }}
                </v-btn>
              </div>
            </form>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { useAuthStore } from '@/stores/auth'

  const auth = useAuthStore()
 
  let image = ref(new URL('@/assets/icons/couleur/online-store.png', import.meta.url).href),
      email = ref(''),
      err = ref(''),
      password = ref(''),
      show = ref(false),
      loading = ref(false)
   
      const logIn = async () => {
        try {
          await auth.account_sign_in({  
            email: email.value,
            password: password.value,
            role: 'administrator'
          })
        } catch (error) {
          err.value = error.message
          console.log('error email', error.message)
        }
        loading.value = false
      }

      const submit = () => {
        loading.value = true
        logIn()
      }
</script>

<style scoped>
  :deep(.mdi-backspace-outline::before) {
    color: #DC143C !important;
  }
  :deep(.v-input__icon--append .v-icon) { 
    color: #008B8B;
  }
</style>