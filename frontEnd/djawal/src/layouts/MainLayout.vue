<template>
  <v-app>
    <v-navigation-drawer
      app
      v-model="drawer"
      color="next"
      dark
      :right="$i18n.locale == 'ar'"
      :class="[platform === 'ios' ? 'pt-16' : '']"
      v-if="isMobile"
    >
        <v-list v-if="users.getUser">
          <v-list-item class="align-center justify-center">
           
            <v-list-img size="60" color="white">
              <v-img :src="photo" v-if="photo"></v-img>
              <v-img :src="avatar" v-else></v-img>
            </v-list-img>
          </v-list-item>

          <v-list-item  link>
          
              <v-list-item-title class="text-h6">
                {{ users.getUser.firstName + ' ' + users.getUser.lastName }}
              </v-list-item-title>
              <v-list-item-subtitle>{{ users.getUser.email }}</v-list-item-subtitle>
           
          </v-list-item>
        </v-list>

      <v-divider></v-divider>

      <v-list
        dense
        nav
        shaped
      >
        <v-list-item
          v-for="item in filteredRecords"
          :key="item.title"
          @click="generateRoutes(item)"
          link
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
      app 
      color="next" 
      dark 
      :prominent="platform === 'ios' ? true : false"
      v-if="isMobile"
    >
      <v-toolbar-title >
        <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>Djawal
      </v-toolbar-title>
    </v-app-bar>

    <!-- Desktop Top Bar Navigation -->
    <v-app-bar 
      color="next" 
      dark 
      height="70"
      v-else app
    >
        <v-row justify="center" align="center" class="fill-height">
          <v-col cols="auto" class="mr-12">
            <v-toolbar-title class="d-flex align-center" @click="$router.push('/')"
              style="cursor:pointer; max-width: max-content;"
            >
              <v-img
                src="/logo.png"
                alt="Logo"
                contain
                width="45"
                height="45"
                style="
                  background: white;
                  padding: 4px;
                  border-radius: 12px;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                "
              />
            </v-toolbar-title>
          </v-col>
          <v-col cols="auto">
            <v-btn 
              v-for="item in filteredRecords" 
              :key="item.text" 
              text 
              :color="item.color"
              @click="generateRoutes(item)"
            >
              {{ $t(item.title) }}
            </v-btn>
          </v-col>
          <!-- Language Selector -->
          <!-- Improved Language Selector -->
          <v-col cols="auto">
            <v-menu offset-y>
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" class="text-white">
                  {{ $t(selectedLanguage.title) }}
                  <v-icon right>mdi-chevron-down</v-icon>
                </v-btn>
              </template>

              <v-list>
                <v-list-item 
                  v-for="lang in locals" 
                  :key="lang.value" 
                  @click="changeLanguage(lang.value)"
                >
                  <v-list-item-title>{{ lang.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
        </v-row>
      </v-app-bar>

      <v-main>
        <!-- <router-view v-slot="{ Component, route }">
          <keep-alive 
            :max="20"
            :include="['Subcategories', 'Publications', 'AnnouncementDetail']"
          >
            <component :is="Component" :key="route.fullPath" />
          </keep-alive>
        </router-view> -->
        <router-view />
      </v-main>

      <v-footer 
        app
        class="px-0"
        :height="platform === 'ios' ? 75 : 56"
        v-if="platform != 'web'"
      >
        <v-layout style="height: 56px;">
          <v-bottom-navigation
            v-model="value"
            bg-color="next"
            mode="shift"
            grow 
            :height="platform === 'ios' ? 75 : 56"
          >
            <v-btn  
              v-for="(item, index) in footerItems" 
              :key="index" 
              @click="generateRoutes(item)"
              :height="platform === 'ios' ? 50 : 56"
            >
              <v-icon>{{ item.icon }}</v-icon>

              <span>{{ $t(item.title) }}</span>
            </v-btn>

          </v-bottom-navigation>
        </v-layout>
      
    </v-footer>
  </v-app>
    
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useDisplay } from "vuetify"
  import { useRouter, useRoute } from 'vue-router'
  import { Capacitor } from '@capacitor/core'
  import { useI18n } from 'vue-i18n'
  import { useLocale } from 'vuetify'
  import { useUsersStore } from '@/stores/users'
  import { useAuthStore } from '@/stores/auth'
  import { useAdsSettingsStore} from '@/stores/adsSettings'
  import { useCategoriesStore } from '@/stores/categories'

  const { current, isRtl } = useLocale()
  const { locale } = useI18n()
  const users = useUsersStore()
  const adsSettings = useAdsSettingsStore()
  const categories = useCategoriesStore()
  const auth = useAuthStore()
  const router = useRouter()
  const route = useRoute()

    let drawer = ref(null),
        items = ref([
          { title: "search", icon: 'mdi-map-search-outline', action: 'getAllTrips' },
          { title: "Hotels", icon: 'mdi-bed', action: 'getHotels' },
          { title: "Restaurants", icon: 'mdi-silverware', action: 'getRestaurants' },
          { title: "Sites", icon: 'mdi-map-marker-outline', action: 'getSites' },
          { title: "Trips", icon: 'mdi-map-marker-path', action: 'getTrips' },
          {title: 'Subscriptions', icon: 'mdi-playlist-check', color: 'white', action: 'getSubscriptions', to: '/admin/announcements'},
          // {title: 'notifications', icon: 'mdi-bell-ring', color: 'white', action: 'getNotifications', to: '/notification'},
          // {title: 'wallet', icon: 'mdi-wallet', color: 'primary', action: 'getWallet', to: '/wallet'},
          // {title: 'Billing', icon: 'mdi-account-credit-card', color: 'white', action: 'getBilling', to: '/billing'},
          { title: "Login", icon: 'mdi-account', action: 'getLogin', to: '/updateProfile' },
          { title: "SignUp", icon: 'mdi-account', action: 'getSignUp', to: '/updateProfile' },
          { title: "profile", icon: 'mdi-account', action: 'getProfile', to: '/updateProfile' },
          // { title: "professional", icon: 'mdi-account', action: 'getProApp', to: '/updateProfile' },
          // { title: "Ad", icon: 'mdi-bullhorn', action: 'getAdvertising', to: '/updateProfile' },
          {title: 'contactSupport', icon: 'mdi-face-agent', color: 'white', action: 'getContactSupport', to: '/contactSupport'},
          // {title: 'termsConditions', icon: 'mdi-information', color: 'white', action: 'getTermsConditionsPage', to: '/termsConditions'},
          {title: 'logOut', icon: 'mdi-logout', color: 'error', action: 'auth_sign_out', to: '/notification'},
        ]),
        footerItems= ref([
          { title: "Home", icon: 'mdi-home', action: 'getTrips', to: '/categories' },
          // { title: "search", icon: 'mdi-magnify', to: '/search' },
          // { title: "add", icon: 'mdi-plus', to: '/admin/announcements' },
          { title: "profile", icon: 'mdi-account', action: 'getProfile', to: '/updateProfile' },
        ]),
      tab = ref(null),
      value = ref(''),
      err = ref(''),
      platform = ref(''),
      photo = ref(null),
      avatar = ref(new URL('@/assets/avatar.png', import.meta.url).href),
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
              }]),
      ls = ref(null)

    // Responsive display logic
    const { smAndDown } = useDisplay();
    const isWeb = computed(() => !Capacitor.isNativePlatform())
    const isMobile = computed(() => smAndDown.value)
    // Get the selected language

    const selectedLanguage = computed(() =>
      locals.value.find((lang) => lang.value === locale.value) || locals.value[0]
    )

    const isAuthenticated = computed(() => {
      return !!ls.value?.token
    })


    // Change language function
    const changeLanguage = (code) => {
      if (code === 'ar') {
        isRtl.value = true // Switch to RTL
        document.dir = 'rtl' // Set HTML dir attribute
      } else {
        isRtl.value = false // Switch to LTR
        document.dir = 'ltr'
      }
      locale.value = code;
    };

    const excludedTitles = ["termsConditions"]; // Titles to remove on web
    const excludedTitlesNative = ["Login", "SignUp", "professional"]; // Titles to remove on native platforms

    // const filteredRecords = computed(() =>{
    //   if (Capacitor.isNativePlatform()) {
    //     return items.value.filter(item => !excludedTitlesNative.includes(item.title)); // Show all records on native platforms
    //   } else {
    //     return items.value.filter(item => !excludedTitles.includes(item.title)); // Remove specific records on web
    //   }
    // })
    const filteredRecords = computed(() => {
      let baseItems = []

      // Platform filtering first
      if (Capacitor.isNativePlatform()) {
        baseItems = items.value.filter(
          item => !excludedTitlesNative.includes(item.title)
        )
      } else {
        baseItems = items.value.filter(
          item => !excludedTitles.includes(item.title)
        )
      }

      // Authentication filtering
      return baseItems.filter(item => {
        if (isAuthenticated.value) {
          // User connected → hide Login & SignUp
          return item.title !== 'Login' && item.title !== 'SignUp'
        } else {
          // User NOT connected → hide Logout & Profile
          return item.title !== 'logOut' && item.title !== 'profile'
        }
      })
    })


    const getSubscriptions = () => {
      router.push({ path: '/subscriptions'  });
    }

    const getSites = () => {
      router.push({ path: '/sites'  });
    }

    const getAllTrips = () => {
      router.push({ path: '/trips'  });
    }

    const getTrips = () => {
      router.push({ path: '/myTrips'  });
    }

    const getHotels = () => {
      router.push({ path: '/hotels'  });
    }

    const getRestaurants = () => {
      router.push({ path: '/restaurants'  });
    }

    const getAdminAddPage = () => {
      router.push({ path: '/admin/announcements'  });
    }

    const getProfile = () => {
      router.push({ path: `/updateProfile`  });
    }

    const getHome = () => {
      
      if (route.path === "/categories") {
        // If already on home, reload the page
        window.location.reload()
      } else {
        // If not on home, navigate to home
        router.push({ path: `/categories`  });
      }
    }
  
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

    const getLogin = () => {
      router.push({ path: `/login`  })
    }

    const getSignUp = () => {
      router.push({ path: `/signup`  })
    }
    
    const getProApp = () => {
      window.open("https://www.bildoz.com.dz/pro/", "_blank");
    }

    const getAdvertising = () => {
      router.push({ path: `/advertising`  })
    }

    const auth_sign_out = () => {
      auth.account_sign_out()
      // window.location.reload()
      
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
          case 'getHome':
            getHome()
            break
          case 'getProfile':
            getProfile()
            break
          case 'getLogin':
            getLogin()
            break
          case 'getSignUp':
            getSignUp()
            break
          case 'getProApp':
            getProApp()
            break
          case 'getAdminAddPage':
            getAdminAddPage()
            break
          case 'getTrips':
            getTrips()
            break
          case 'getHotels':
            getHotels()
            break
          case 'getRestaurants':
            getRestaurants()
            break
          case 'getAllTrips':
            getAllTrips()
            break
          case 'getSites':
            getSites()
            break
          case 'getAdvertising':
            getAdvertising()
            break
          case 'getSubscriptions':
            getSubscriptions()
            break
        }
      }
  onMounted(async () => {
    if (Capacitor.isNativePlatform()) {
      users.loadUser()
    }else{
      
    }
    platform.value = Capacitor.getPlatform()
    
    ls.value = await auth.getLSUserInfo()

    adsSettings.fetchAdsSettings()
  })
  
</script>

<style>
  body[dir="rtl"] .my-class {
    text-align: right;
  }

  body[dir="ltr"] .my-class {
    text-align: left;
  }
</style>
  