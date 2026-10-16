<template>
  <div>
    <div class="text-center" v-if="loading">
      <v-row 
        class="d-flex justify-center align-center"  
        style="height: 100vh;"
      >
        <v-progress-circular
          indeterminate
          color="next"
        ></v-progress-circular>
      </v-row>
    </div>
    <div v-else>
      <div class="text-center ma-2" v-if="err">
        <v-row 
          class="d-flex justify-center align-center"  
          style="height: 100vh;"
        >
          <v-col>
            <div>
              <v-alert
                dense
                rounded
                type="error"
                outlined
              >
                {{ $t('cgu') }}
                
              </v-alert>
            </div>
            <div>
              <v-btn
                :loading="loadingP"
                :disabled="loadingP"
                color="blue-grey"
                class="ma-2 white--text"
                @click="loadingPage"
              >
                Upload
                <v-icon
                  right
                  dark
                >
                  mdi-cloud-upload
                </v-icon>
                <template v-slot:loader>
                  <span class="custom-loader">
                    <v-icon light>mdi-cached</v-icon>
                  </span>
                </template>
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </div>
      <div v-else>
        <Accueil />
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import Accueil from '@/views/Accueil.vue'
  import { Capacitor } from '@capacitor/core'
  import { useUsersStore } from '@/stores/users'
  import { onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'


  const { locale } = useI18n()
  const users = useUsersStore()
  const router = useRouter()

  let err = ref(''),
      loadingP = ref(false),
      loading = ref(true)
    
    const loadingPage = () => {
      loadingP.value = true
      router.go()
    }

    onMounted(() => {
      users.loadUser().then((res) => {
        locale.value = users.getUser.language
        loading.value = res
      })
      users.fetchUser()
      if (Capacitor.isNativePlatform()) {
        
      }else{
        loading.value = false
      }
    })
</script>