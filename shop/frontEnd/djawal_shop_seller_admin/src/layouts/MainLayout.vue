<template>
  <v-app>
    
    <v-navigation-drawer
      name="drawer"
      v-model="drawer"
      color="next"
      dark
      :right="locale === 'ar'"
    >
      <v-list>
          <v-list-item
            :prepend-avatar="avatar"
            title="Djawal Store"
          >
           
          </v-list-item>
        </v-list>

      <v-divider></v-divider>

      <v-list
        dense
        nav
        shaped
      >
        <v-list-item
          v-for="item in items"
          :key="item.title"
         
          link
          :to="item.to"
        >
          <template v-slot:prepend>
            <v-icon 
              :icon="item.icon"
              :color="item.color"
            ></v-icon>
          </template>

         
          <v-list-item-title>{{ $t(item.title) }}</v-list-item-title>
          
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar 
      name="app-bar" 
      color="next" 
      dark
    >
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-app-bar-title>Djawal</v-app-bar-title>

      <v-spacer></v-spacer>

        
        <!-- <v-btn text><LocaleChanger /></v-btn> -->

          <v-btn 
            icon
            
          >
            <v-icon>mdi-magnify</v-icon>
          </v-btn>
          
          <v-btn 
            icon
            :loading="!inboxes.getInboxes"
            @click="dialogInbox = true"
          >
            <v-badge
              color="green"
              :content="inboxes.getInboxes ? inboxes.getInboxes.length : 0"
              :value="inboxes.getInboxes ? inboxes.getInboxes.length : 0"
            >
              <v-icon>mdi-email</v-icon>
            </v-badge>
            
          </v-btn>

          <v-btn 
            icon
            :loading="!orders.getPendingOrder"
            @click="dialog = true"
          >
            <v-badge
              color="green"
              :content="alertLength"
              :value="alertLength"
            >
              <v-icon>mdi-bell</v-icon>
            </v-badge>
          </v-btn>
             
          
            <div class="text-center">
              <v-menu >
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon
                    v-bind="props"
                  >
                    <v-icon>mdi-account</v-icon>
                  </v-btn>
                </template>

                <v-list
                  dense
                  nav
                >
                  <v-list-item
                        v-for="(item, index) in menuItems"
                        :key="index"
                        @click="generateProfilMenu(item)"
                      >
                      <!-- <v-list-item-avatar style="margin-right: 0px; margin-top: 0px; margin-bottom: 0px;">
                        <v-icon style="justify-content: left;" :color="item.color">{{ item.icon }}</v-icon>
                      </v-list-item-avatar> -->

                      <template v-slot:prepend>
                        <v-icon 
                          :icon="item.icon"
                          :color="item.color"
                        ></v-icon>
                      </template>

                      <v-list-item-title>{{ $t(item.title) }}</v-list-item-title>
                      
                      </v-list-item>
                  
                </v-list>
              </v-menu>
            </div>
          
         
    </v-app-bar>

   
    <v-main>
      <router-view></router-view>
    </v-main>

    <v-dialog v-model="dialog" max-width="70%">
      <v-card>
        <v-card-title 
          class="text-h5"
        >Alerts</v-card-title>
        <v-card-text>
          <AlertOrder
            v-model="dialog"
            :orders="orders.getPendingOrder"
            v-if="orders.getPendingOrder?.length > 0"
          />

        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="close">Cancel</v-btn>
          <v-btn color="success" text @click="confirm">OK</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogInbox" max-width="70%">
      <v-card>
        <v-card-title 
          class="text-h5"
        >Messages</v-card-title>
        <v-card-text>
          <alert-inboxes 
            :inboxes="inboxes.getInboxes"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="dialogInbox = false">Fermer</v-btn>
         
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
   
    <!-- <v-footer
      name="footer"
      class="bg-next"
      dark
      :height="platform === 'ios' ? 75 : 56"
    >
      <v-bottom-navigation 
        grow 
        v-model="value" 
        color="teal" 
        mode="shift"
        bg-color="next"
        
        dark 
        :height="platform === 'ios' ? 75 : 56"
      >
        <v-btn v-for="(item, index) in footerItems" :key="index" :value="item.to" :height="platform === 'ios' ? 50 : 56">
          

          <v-icon>{{item.icon}}</v-icon>

          <span>{{$t(item.title)}}</span>
        </v-btn>
      </v-bottom-navigation>
    </v-footer> -->

  </v-app>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useLocale } from 'vuetify'
  import { useUsersStore } from '@/stores/users'
  import { useAuthStore } from '@/stores/auth'
  import { useOrdersStore } from '@/stores/orders'
  import { useInboxesStore } from '@/stores/inboxes'

  
  import AlertOrder from '@/components/AlertOrder.vue'
  import AlertInboxes from '@/components/AlertInboxes.vue'

  const { current } = useLocale()
  const { locale } = useI18n()
  const user = useUsersStore()
  const auth = useAuthStore()
  
  const orders = useOrdersStore()
  const inboxes = useInboxesStore()
  const router = useRouter()

  const drawer = ref(null)

  let dialog = ref(false),
      dialogInbox = ref(false)

  const items = ref([
    { title: 'Home', icon: 'mdi-home', to: '/', color: '#008080' },
    { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/dashboard', color: '#4682B4' },
    // { title: 'Location', icon: 'mdi-map-marker', to: '/location', color: '#4682B4' },
    { title: 'Products', icon: 'mdi-shopping-search', to: '/products', color: '#CD5C5C' },
    { title: 'Brands', icon: 'mdi-shopping-search', to: '/brands', color: '#CD5C5C' },
    // { title: 'Plans', icon: 'mdi-shopping-search', to: '/plans', color: '#CD5C5C' },
    { title: 'Users', icon: 'mdi-account', to: '/users', color: '#A52A2A' },
    { title: 'Categories', icon: 'mdi-list-box', to: '/admin/categories', color: '#A52A2A' },
    { title: 'Orders', icon: 'mdi-wallet', to: '/orders', color: '#FF7F50' },
    // { title: 'Order', icon: 'mdi-wallet', to: '/order', color: '#FF7F50' },
    // { title: 'Ads', icon: 'mdi-message-badge', to: '/ads', color: '#A52A2A' },
    // { title: 'Publications', icon: 'mdi-message-badge', to: '/publications', color: '#A52A2A' },
    { title: 'Notifications', icon: 'mdi-message-badge', to: '/notifications', color: '#A52A2A' },
    { title: 'TermsConditions', icon: 'mdi-format-list-text', to: '/terms&conditions', color: '#A52A2A' },
    // { title: 'Roles', icon: 'mdi-account-key', to: '/roles', color: '#A52A2A' },
    { title: 'Settings', icon: 'mdi-cog', to: '/setting', color: '#FF7F50' },
    { title: 'About', icon: 'mdi-information', to: '/about', color: '#8A2BE2' }
  ])

  const menuItems = ref([
    { title: 'Profile', icon: 'mdi-account-circle', function: 'getUserPage', color: '#00366f' },
    { title: 'Logout', icon: 'mdi-logout', function: 'auth_sign_out', color: 'red' }
  ])

  let photo = ref(null),
      avatar = ref(new URL('@/assets/icons/couleur/online-store.png', import.meta.url).href)

  let value = ref('/map'),
      platform = ref(null)

    const getTrips = () => {
      router.push({ path: `/search`  })
    }

    const getTripInProgress = () => {
      router.push({ path: `/tripsInProgress`  })
    }

    const getTermsConditionsPage = () => {
      router.push({ path: `/terms&conditions`  })
    }

    const getNotifications = () => {
      router.push({ path: `/notifications`  })
    }

    const getWallet = () => {
      router.push({ path: `/wallet`  })
    }

    const getPaymentMethod = () => {
      router.push({ path: `/paymentMethod`  })
    }

    const getContactSupport = () => {
      router.push({ path: `/contactSupport`  })
    }
    
    const getProfile = () => {
      router.push({ path: `/updateProfile`  })
    }

    const getPlannedTrips = () => {
      router.push({ path: `/trips`  })
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
        case 'getPaymentMethod':
          getPaymentMethod()
          break
        case 'getContactSupport':
          getContactSupport()
          break
        case 'getTripInProgress':
          getTripInProgress()
          break
        case 'getTrips':
          getTrips()
          break
        case 'getProfile':
          getProfile()
          break
        case 'getPlannedTrips':
          getPlannedTrips()
          break
      }
    }

    const getUserPage = () => {
      router.push({ path: `/user` });
    }

    const close = () => {
      dialog.value = false
    }

    const confirm = () => {
      dialog.value = false
    }

    const generateProfilMenu = (item) => {
      switch (item.function) {
        case 'auth_sign_out':
          auth_sign_out()
          break
        case 'getUserPage':
          getUserPage()
          break
      }
    }

    const alertLength = computed(() => {
      if(orders.getPendingOrder?.length){
        return orders.getPendingOrder?.length
      }else{
        return 0
      }
    })

    onMounted(() => {
      user.fetchUsers()
      orders.fetchOrders()
      inboxes.fetchInboxes()
    })
</script>