<template>
    <v-container fluid>
      <v-row 
        class="d-flex justify-center align-center"
        style="height: 90vh;"
      >
        <v-col>
         
            <h3 class="text-h5">Verification Code</h3>

            <div class="text-subtitle-2 font-weight-light mb-3">Please enter the verification code sent to your mobile</div>

            <v-otp-input
              v-model="otp"
              class="mb-8"
             
              length="6"
            
            ></v-otp-input>

            <div class="text-caption">
              <div class="text-center ma-2">
                <h5>{{ $t(err) }}</h5>
              </div>

              <div class="text-center ma-2">
                <v-btn 
                  color="next" 
                  dark 
                  block 
                  :disabled="!isActive" 
                  @click="show" 
                  :loading="loading"
                >
                  {{ $t('next') }}
                </v-btn>
              </div>

              <div class="text-center ma-2">
                <v-btn 
                  color="next" 
                  dark 
                  block 
                  :disabled="!showTryAgain" 
                  @click="tryAgain" :loading="loading">{{ $t('tryAgain') }}</v-btn>
              </div>
              
            </div>


         
          <!-- <div class="text-center ma-2">
            <v-otp-input
              v-model="otp"
              :length="length"
              type="number"
            ></v-otp-input>
          </div>

          <div class="text-center ma-2">
            <h5>{{ $t(err) }}</h5>
          </div>

          <div class="text-center ma-2">
            <v-btn color="next" dark block :disabled="!isActive" @click="show" :loading="loading">{{ $t('next') }}</v-btn>
          </div>

          <div class="text-center ma-2">
            <v-btn color="next" dark block :disabled="!showTryAgain" @click="tryAgain" :loading="loading">{{ $t('tryAgain') }}</v-btn>
          </div> -->
        </v-col>
      </v-row>

    </v-container>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import moment from "moment"

  const fmt = "YYYY-MM-DD HH:mm:ss"

  const auth = useAuthStore()
  const route = useRoute()
  const router = useRouter()

  const otp = ref(''),
        loading = ref(false),
        err = ref(''),
        length = ref(6),
        deadlinets = moment()
        .add(3, "m")
        .format(fmt),
        showTryAgain = ref(false)
      
  //     progress: 25,
 
    const isActive = computed(() => {
      return otp.value.length === length.value
    })

    const deadline = computed(() => {
      return moment(deadlinets).format(fmt)
    })


      const codeVerify = async () => {
        let phone = route.params.phonenumber
        try {
          await auth.account_verify_code({  phonenumber: phone,
                                            code: otp.value 
                                        })
        } catch (error) {
          err.value = error.message
          console.log('error code', error.value)

        }
        loading.value = false
      }

      const show = () => {
        loading.value = true
        codeVerify()
      }
  //     timeElapsedHandler() {
  //       this.showTryAgain = true
  //     },
      const tryAgain = () => {
        router.push('/signup')
      }
  //   }
  // }
</script>