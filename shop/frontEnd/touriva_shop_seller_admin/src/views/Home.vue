<template>
  <v-container fluid>
    <v-row class="justify-center">
      <v-col
        cols="auto"
        v-for="item in items"
        :key="item.title"
      >      
        <v-card
          class="mx-auto"
          width="344"
          height="150"
          :subtitle="$t(item.model)"
          :title="$t(item.title)"
        >
          <template v-slot:prepend>
            <v-avatar size="x-large">
              <v-img :src="item.img"></v-img>
            </v-avatar>
          </template>
          
          <v-card-text>{{ $t(item.description) }}</v-card-text>
        </v-card>
        <!-- <v-card
          class="mx-auto"
          width="344"
          outlined
        >
          <v-list-item class="align-center justify-center">
            <v-list-img size="60" color="white">
              <v-img :src="item.img"></v-img>
            </v-list-img>

            <v-list-item-title class="text-h6">
                {{ $t(item.title) }}
              </v-list-item-title>
              <v-list-item-subtitle>{{ $t(item.model) }}</v-list-item-subtitle>
            <v-list-item-subtitle>{{ $t(item.description) }}</v-list-item-subtitle>
          </v-list-item>

          <v-card-actions class="pt-0">
            <v-spacer></v-spacer>
            <v-btn
              outlined
              rounded
              
              :to="item.to"
              :disabled="item.title === 'Home'"
              color="teal accent-4"
            >
              {{ $t('More') }}
            </v-btn>
          </v-card-actions>
        </v-card>        -->
      </v-col>
    </v-row> 
  </v-container>
</template>

<script>
  export default {
    data: () => ({ 
      items: [
          { title: 'Home', img: new URL('@/assets/icons/couleur/home.png', import.meta.url).href, to: '/', model: 'component', description: 'CompHome' },
          { title: 'Dashboard', img: new URL('@/assets/icons/couleur/dashboard.png', import.meta.url).href, to: '/dashboard', model: 'component', description: 'CompDash' },
          // { title: 'Trips', img: new URL('@/assets/icons/couleur/route.png', import.meta.url).href, to: '/trips', model: 'trip', description: 'ModTrip' },
          // { title: 'Vehicles', img: new URL('@/assets/icons/couleur/fast-delivery.png', import.meta.url).href, to: '/vehicles', model: 'Vehicle', description: 'ModVehicle' },
          { title: 'Users', img: new URL('@/assets/icons/couleur/group.png', import.meta.url).href, to: '/users', model: 'User', description: 'ModUser' },
          { title: 'Billing', img: new URL('@/assets/icons/couleur/receipt.png', import.meta.url).href, to: '/billing', model: 'Billing', description: 'ModBilling' },
          { title: 'Notifications', img: new URL('@/assets/icons/couleur/chat.png', import.meta.url).href, to: '/notifications', model: 'Notification', description: 'ModNotification' },
          { title: 'TermsConditions', img: new URL('@/assets/icons/couleur/agreement.png', import.meta.url).href, to: '/terms&conditions', model: 'Term', description: 'ModTerm' },
          { title: 'Roles', img: new URL('@/assets/icons/couleur/shield.png', import.meta.url).href, to: '/roles', model: 'Roles', description: 'ModRole' },
          { title: 'Settings', img: new URL('@/assets/icons/couleur/settings.png', import.meta.url).href, to: '/setting', model: 'component', description: 'CompSetting' },
          { title: 'About', img: new URL('@/assets/icons/couleur/information.png', import.meta.url).href, to: '/about', model: 'component', description: '' },
        ],
      }),
  }
</script>