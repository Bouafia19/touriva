<template>
  <v-container class="py-8 max-w-1000">
    <!-- User Profile Header Card -->
    <v-card class="editorial-card pa-6 mb-6">
      <div class="d-flex flex-column flex-sm-row align-center justify-space-between ga-4">
        <div class="d-flex align-center ga-4">
          <v-avatar size="72" color="deepGreen" class="border-sand">
            <v-img :src="photo" v-if="photo"></v-img>
            <v-img :src="avatar" v-else></v-img>
          </v-avatar>

          <div class="text-center text-sm-left">
            <span class="editorial-tag text-sand-dark mb-1 d-block">TOURIVA SHOP MEMBER</span>
            <h1 class="editorial-heading text-h5 font-weight-bold text-forest mb-1">
              {{ (users.getUser?.firstName || '') + ' ' + (users.getUser?.lastName || '') || 'Member Profile' }}
            </h1>
            <div class="text-body-2 text-secondary-editorial">
              {{ users.getUser?.email || users.getUser?.phone || 'Account active' }}
            </div>
          </div>
        </div>

        <!-- Edit Profile Button -->
        <v-btn
          class="btn-editorial-primary px-5"
          size="small"
          @click="getProfile"
        >
          <v-icon start size="16">mdi-account-edit-outline</v-icon>
          {{ $t('update') || 'Edit Profile' }}
        </v-btn>
      </div>

      <!-- User Active Status Switch -->
      <div class="mt-4 pt-4 border-t-editorial d-flex align-center justify-space-between flex-wrap ga-2" v-if="users.getUser">
        <div class="text-caption text-secondary-editorial">
          Account Status & Notification Availability
        </div>
        <v-switch
          v-model="users.getUser.status"
          inset
          :label="users.getUser.status ? $t('availabe') : $t('notAvailable')"
          color="emerald"
          @change="updateUser"
          :loading="loading"
          hide-details
          density="compact"
        />
      </div>
    </v-card>

    <!-- Feedback Alerts -->
    <v-alert
      v-if="err"
      type="error"
      variant="tonal"
      rounded="lg"
      class="mb-4 text-caption"
    >
      {{ $t(err) }}
    </v-alert>

    <v-alert
      v-if="info"
      type="success"
      variant="tonal"
      rounded="lg"
      class="mb-4 text-caption"
    >
      {{ $t(info) }}
    </v-alert>

    <!-- Profile Action Grid -->
    <v-row>
      <v-col
        v-for="item in items"
        :key="item.title"
        cols="6"
        sm="4"
        md="3"
        class="pa-2 pa-sm-3"
      >
        <v-card
          class="editorial-card pa-4 text-center cursor-pointer h-100 d-flex flex-column align-center justify-center"
          @click="generateRoutes(item)"
        >
          <v-avatar
            size="56"
            :color="item.title === 'logOut' ? 'error' : 'sandLight'"
            class="mb-3"
            :variant="item.title === 'logOut' ? 'tonal' : 'flat'"
          >
            <v-icon
              size="26"
              :color="item.title === 'logOut' ? 'error' : 'deepGreen'"
            >
              {{ item.icon }}
            </v-icon>
          </v-avatar>

          <div
            class="text-subtitle-2 font-weight-bold"
            :class="item.title === 'logOut' ? 'text-error' : 'text-forest'"
          >
            {{ $t(item.title) || item.title }}
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
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

  const items = ref([
    { title: 'Orders', icon: 'mdi-receipt-text-outline', color: 'primary', action: 'getOrders', to: '/orders' },
    { title: 'profile', icon: 'mdi-account-outline', color: 'primary', action: 'getProfile', to: '/updateProfile' },
    { title: 'notifications', icon: 'mdi-bell-outline', color: 'primary', action: 'getNotifications', to: '/notifications' },
    { title: 'contactSupport', icon: 'mdi-face-agent', color: 'primary', action: 'getContactSupport', to: '/contactSupport' },
    { title: 'terms', icon: 'mdi-information-outline', color: 'primary', action: 'getTermsConditionsPage', to: '/terms&conditions' },
    { title: 'logOut', icon: 'mdi-logout', color: 'error', action: 'auth_sign_out', to: '/login' },
  ])

  const photo = ref(null)
  const avatar = ref(new URL('@/assets/avatar.png', import.meta.url).href)
  const loading = ref(false)
  const err = ref('')
  const info = ref('')

  const getTermsConditionsPage = () => {
    router.push({ path: '/terms&conditions' })
  }

  const getNotifications = () => {
    router.push({ path: '/notifications' })
  }

  const getWallet = () => {
    router.push({ path: '/wallet' })
  }

  const getBilling = () => {
    router.push({ path: '/billing' })
  }

  const getContactSupport = () => {
    router.push({ path: '/contactSupport' })
  }

  const getSearch = () => {
    router.push({ path: '/products' })
  }

  const getPlannedTrips = () => {
    router.push({ path: '/orders' })
  }

  const getOrders = () => {
    router.push({ path: '/orders' })
  }

  const getProfile = () => {
    router.push({ path: '/updateProfile' })
  }

  const auth_sign_out = () => {
    auth.account_sign_out()
    router.push('/login')
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
      case 'getOrders':
        getOrders()
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
        }, 5000)
      })
    } catch (error) {
      loading.value = false
      err.value = error.message
      console.log('error user Information', error)
    }
  }

  onMounted(() => {
    users.loadUser()
    announcements.fetchAnnouncements()
  })
</script>

<style scoped>
  .max-w-1000 {
    max-width: 1000px;
    margin-left: auto;
    margin-right: auto;
  }

  .border-sand {
    border: 2px solid var(--color-sand) !important;
  }

  .border-t-editorial {
    border-top: 1px solid var(--color-border);
  }

  .cursor-pointer {
    cursor: pointer;
  }
</style>