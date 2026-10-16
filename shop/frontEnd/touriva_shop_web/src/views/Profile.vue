<template>
  <div>
    <v-card
      class="my-2 mx-auto"
      width="90%"
      border 
      flat
    >
      <v-row>
          <v-col>
              <div class="d-flex justify-center">
                  <v-switch
                      v-model="users.getUser.status"
                      inset
                      :label="users.getUser.status ? $t('availabe') : $t('notAvailable')"
                      color="success"
                      @change="updateUser"
                      :loading="loading"
                      hide-details
                  ></v-switch>
              </div>
          </v-col>
      </v-row>
    </v-card>

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
    <!-- <v-list>
      <v-list-item @click="$router.push({ path: `/updateProfile`  })">
        <v-list-item-avatar tile size="60" color="white">
          <v-img :src="photo" v-if="photo"></v-img>
          <v-img src="@/assets/avatar.png" v-else></v-img>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title class="text-h6">
            {{ user.firstName + ' ' + user.lastName }}
          </v-list-item-title>
          <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-list-item class="align-center justify-content-center">
        <v-list-item-content class="text-center">
          <v-list-item-title class="font-weight-bold">
            Credit
          </v-list-item-title>
          <v-list-item-subtitle>0 DA</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-content class="text-center">
          <v-list-item-title class="font-weight-bold">
            member depuis
          </v-list-item-title>
          <v-list-item-subtitle>18-09-2022</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list> -->

    <!-- <v-divider></v-divider> -->

    <v-container>
      <v-row class="justify-space-evenly">
        <v-col
          cols="auto"
          v-for="item in items"
          :key="item.title"
          class="pa-2"
        >      
          <v-card
            variant="elevated"
            class="mx-auto"
            width="100"
            outlined
            @click="generateRoutes(item)"
            style="border: none;"
            color="next"
          >
            <div class="text-center">
              <v-avatar
                size="100"
                tile
                color="next"
                class="rounded-lg"
              >
                <div
                  v-if="item.title === 'notifications'"
                >
                  <v-badge
                    color="green"
                    :content="announcements.getAnnouncementsByTransporterId ? announcements.getAnnouncementsByTransporterId.length : 0"
                    :value="announcements.getAnnouncementsByTransporterId ? announcements.getAnnouncementsByTransporterId.length : 0"
                    
                  >
                    <v-icon dark size="x-large">
                      {{ item.icon }}
                    </v-icon>
                  </v-badge>
                </div>
                <div v-else>
                  <v-icon dark size="x-large" :color="item.title === 'logOut' ? 'error': 'white'">
                    {{ item.icon }}
                  </v-icon>
                </div>
                
              </v-avatar>
            </div>
            
            <!-- <div class="my-4 text-wrap">
              {{ $t(item.title) }}
            </div> -->
            
            <!-- <v-card-subtitle 
              class="py-1 mx-auto text-break subtitle-2" 
              
            >
              
            </v-card-subtitle> -->
           
          </v-card>      
          <div 
            class="text-center text-caption text-break" 
            style="font-size: 0.8rem !important;color: #00366f;font-weight: bold;max-width: 100px;"
          >
            {{ $t(item.title) }}
          </div> 
        </v-col>
      </v-row> 
    </v-container>

    <!-- <v-list
      dense
      nav
      shaped
    >
      <div v-for="(item, index) in items"
          :key="index">
          <v-list-item
          
          @click="generateRoutes(item)"
          dense
          >
              
          <v-list-item-avatar
              color="white"
              class="my-0"
          >
              <v-icon :color="item.color">{{ item.icon }}</v-icon>
          </v-list-item-avatar>

          <v-list-item-content class="py-0">
              <v-list-item-title>{{ $t(item.title) }}</v-list-item-title>
          </v-list-item-content>
              
          </v-list-item>
          <v-divider
              v-if="index < items.length - 1"
              :key="index"
          ></v-divider>
      </div>
    </v-list> -->
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAnnouncementsStore } from '@/stores/announcements'
  import { useUsersStore } from '@/stores/users'
  import { useAuthStore } from '@/stores/auth'

  const router = useRouter()
  const users = useUsersStore()
  const announcements = useAnnouncementsStore()
  const auth = useAuthStore()

        let items = ref([
            {title: 'trips', icon: 'mdi-truck-delivery', color: 'primary', action: 'getSearch', to: '/search'},
            {title: 'plannedTrips', icon: 'mdi-routes-clock', color: 'primary', action: 'getPlannedTrips', to: '/plannedTrips'},
            {title: 'notifications', icon: 'mdi-bell-ring', color: 'primary', action: 'getNotifications', to: '/notification'},
            {title: 'profile', icon: 'mdi-account', color: 'primary', action: 'getProfile', to: '/profile'},
            {title: 'Billing', icon: 'mdi-account-credit-card', color: 'primary', action: 'getBilling', to: '/billing'},
            {title: 'contactSupport', icon: 'mdi-face-agent', color: 'primary', action: 'getContactSupport', to: '/contactSupport'},
            {title: 'terms', icon: 'mdi-information', color: 'primary', action: 'getTermsConditionsPage', to: '/termsConditions'},
            {title: 'logOut', icon: 'mdi-logout', color: 'error', action: 'auth_sign_out', to: '/notification'},
          ]),
          photo = ref(null),
          loading = ref(false),
          err = ref(''),
          info = ref('')
      
      
      const getTermsConditionsPage = () => {
        router.push({ path: `/terms&conditions`  });
      }

      const getNotifications = () => {
        router.push({ path: `/notifications`  })
      }

      const getWallet = () => {
        router.push({ path: `/wallet`  })
      }

      const getBilling = () => {
        router.push({ path: `/billing`  })
      }

      const getContactSupport = () => {
        router.push({ path: `/contactSupport`  })
      }

      const getSearch = () => {
        router.push({ path: `/search`  })
      }

      const getPlannedTrips = () => {
        router.push({ path: `/plannedTrips`  })
      }

      const getProfile = () => {
        router.push({ path: `/updateProfile`  })
      }

      const auth_sign_out = () => {
        auth.account_sign_out()
      }

      const generateRoutes = (item) => {
          switch (item.action) {
            case 'auth_sign_out':
              auth_sign_out()
              break
            case 'getTermsConditionsPage':
              getTermsConditionsPage()
              break
            case 'getNotifications':
              getNotifications()
              break
            case 'getWallet':
              getWallet()
              break
            case 'getBilling':
              getBilling()
              break
            case 'getContactSupport':
              getContactSupport()
              break
            case 'getSearch':
              getSearch()
              break
            case 'getPlannedTrips':
              getPlannedTrips()
              break
            case 'getProfile':
              getProfile()
              break
          }
        }
        
      const updateUser = () => {
        
        loading.value = true
        try {
          users.updateUserProfile(users.user).then(() => {
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
   
  onMounted(() => {
    users.loadUser()
    announcements.fetchAnnouncements()
    // announcements.fetchAnnouncementsByTransporterId()
  })
  
</script>