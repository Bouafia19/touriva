<template>
  <v-container fluid class="pa-6 home-hub-page">
    <!-- Editorial Welcome Hero Banner -->
    <v-card class="admin-card mb-8 welcome-hero pa-6 pa-md-8 position-relative overflow-hidden">
      <div class="welcome-bg-glow"></div>
      <v-row align="center">
        <v-col cols="12" md="8">
          <span class="editorial-tag text-sand-dark mb-1 d-block">
            {{ $t('AdminPortal') }} • {{ $t('Overview') }}
          </span>
          <h1 class="editorial-title text-h4 font-weight-bold mb-2">
            Welcome to <span class="font-serif text-forest">Touriva</span> Control Center
          </h1>
          <p class="editorial-subtitle text-body-1 text-secondary-editorial mb-4" style="max-width: 680px;">
            Manage the Algerian tourism ecosystem, verify travel partners, curate heritage landmarks, and oversee operations across all regions.
          </p>
          <div class="d-flex flex-wrap gap-2 mt-2">
            <v-btn
              class="btn-editorial-primary mr-3 mb-2"
              prepend-icon="mdi-view-dashboard-outline"
              to="/dashboard"
            >
              {{ $t('Dashboard') }}
            </v-btn>
            <v-btn
              class="btn-editorial-outline mr-3 mb-2"
              prepend-icon="mdi-account-group-outline"
              to="/users"
            >
              {{ $t('ManageUsers') }}
            </v-btn>
            <v-btn
              class="btn-editorial-sand mb-2"
              prepend-icon="mdi-compass-outline"
              to="/trips"
            >
              {{ $t('Trips') }}
            </v-btn>
          </div>
        </v-col>

        <v-col cols="12" md="4" class="text-center d-none d-md-block">
          <div class="hero-emblem-container">
            <v-avatar size="100" color="forestGreen" class="elevation-3 hero-avatar">
              <v-icon icon="mdi-compass" color="sand" size="56"></v-icon>
            </v-avatar>
            <div class="font-serif font-weight-bold text-forest mt-2 text-h6">
              TOU<span class="text-sand-dark">RIVA</span>
            </div>
            <div class="editorial-tag text-secondary-editorial">PREMIUM EDITORIAL</div>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <!-- Hub Modules Grid -->
    <div class="editorial-section-header mb-4">
      <span class="editorial-tag">{{ $t('Tourism') }} & {{ $t('Management') }}</span>
      <h2 class="editorial-title text-h5 font-weight-bold">Control Modules</h2>
      <p class="editorial-subtitle">Direct access to administrative sections and catalog registries</p>
    </div>

    <v-row>
      <v-col
        v-for="item in items"
        :key="item.title"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card
          class="admin-card fill-height d-flex flex-column justify-space-between module-card pa-5"
          :to="item.to"
          link
        >
          <div>
            <div class="d-flex align-center justify-space-between mb-4">
              <div class="icon-circle-sand" :style="{ backgroundColor: item.bgTint || '#F5EDE0' }">
                <v-icon :icon="item.icon" size="22" :color="item.iconColor || '#173F35'"></v-icon>
              </div>
              <span class="editorial-tag text-caption" style="font-size: 0.65rem;">
                {{ item.category }}
              </span>
            </div>

            <h3 class="text-subtitle-1 font-weight-bold text-forest mb-1 font-serif">
              {{ $t(item.title) }}
            </h3>

            <p class="text-caption text-secondary-editorial mb-0" style="line-height: 1.45;">
              {{ item.desc }}
            </p>
          </div>

          <div class="d-flex align-center justify-space-between pt-4 mt-3 border-top">
            <span class="text-caption font-weight-semibold text-forest">Open Module</span>
            <v-icon icon="mdi-arrow-right" size="16" color="secondary" class="module-arrow"></v-icon>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'

const items = ref([
  {
    title: 'Dashboard',
    icon: 'mdi-view-dashboard-outline',
    to: '/dashboard',
    category: 'Analytics',
    desc: 'Real-time performance metrics, directory counts and pending alerts',
    iconColor: '#173F35',
    bgTint: '#F5EDE0'
  },
  {
    title: 'Trips',
    icon: 'mdi-compass-outline',
    to: '/trips',
    category: 'Tourism',
    desc: 'Curated expeditions, organized tours and day trips across Algeria',
    iconColor: '#21866B',
    bgTint: '#E6F4F0'
  },
  {
    title: 'TripSubscriptions',
    icon: 'mdi-ticket-confirmation-outline',
    to: '/tripSubscriptions',
    category: 'Tourism',
    desc: 'Traveler bookings, tour subscriptions and traveler participant lists',
    iconColor: '#21866B',
    bgTint: '#E6F4F0'
  },
  {
    title: 'Sites',
    icon: 'mdi-map-marker-radius-outline',
    to: '/sites',
    category: 'Directory',
    desc: 'Archaeological wonders, historical landmarks and national reserves',
    iconColor: '#2A6F85',
    bgTint: '#EAF3F6'
  },
  {
    title: 'Hotels',
    icon: 'mdi-bed-outline',
    to: '/hotels',
    category: 'Directory',
    desc: 'Verified hotels, boutique stays, lodges and desert campings',
    iconColor: '#D9943B',
    bgTint: '#FDF5EC'
  },
  {
    title: 'Restaurants',
    icon: 'mdi-silverware-fork-knife',
    to: '/restaurants',
    category: 'Directory',
    desc: 'Traditional Algerian gastronomy, fine dining and cafe registries',
    iconColor: '#B89564',
    bgTint: '#F7F2EB'
  },
  {
    title: 'Activities',
    icon: 'mdi-calendar-clock-outline',
    to: '/activities',
    category: 'Tourism',
    desc: 'Adventure excursions, cultural workshops and sports experiences',
    iconColor: '#21866B',
    bgTint: '#E6F4F0'
  },
  {
    title: 'Users',
    icon: 'mdi-account-group-outline',
    to: '/users',
    category: 'Management',
    desc: 'Account management for travelers, guides, agencies and admins',
    iconColor: '#173F35',
    bgTint: '#F5EDE0'
  },
  {
    title: 'Billing',
    icon: 'mdi-wallet-outline',
    to: '/billing',
    category: 'Finance',
    desc: 'Partner subscription tiers, invoice processing and billing plans',
    iconColor: '#2A6F85',
    bgTint: '#EAF3F6'
  },
  {
    title: 'Notifications',
    icon: 'mdi-bell-outline',
    to: '/notifications',
    category: 'Communications',
    desc: 'Push notifications, system alerts and announcements to users',
    iconColor: '#D9943B',
    bgTint: '#FDF5EC'
  },
  {
    title: 'Settings',
    icon: 'mdi-cog-outline',
    to: '/setting',
    category: 'System',
    desc: 'Application configuration, localization and platform parameters',
    iconColor: '#173F35',
    bgTint: '#F5EDE0'
  },
  {
    title: 'About',
    icon: 'mdi-information-outline',
    to: '/about',
    category: 'System',
    desc: 'Touriva editorial design system details and developer notes',
    iconColor: '#21866B',
    bgTint: '#E6F4F0'
  }
])
</script>

<style scoped>
.home-hub-page {
  max-width: 1600px;
  margin: 0 auto;
}

.welcome-hero {
  background: linear-gradient(135deg, #FFFFFF 0%, #FAF8F2 100%) !important;
  border: 1px solid var(--color-border) !important;
}

.welcome-bg-glow {
  position: absolute;
  top: -60px;
  right: -60px;
  width: 240px;
  height: 240px;
  background: radial-gradient(circle, rgba(217, 185, 140, 0.25) 0%, rgba(217, 185, 140, 0) 70%);
  pointer-events: none;
}

.module-card {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.module-card:hover {
  transform: translateY(-4px) !important;
  border-color: var(--color-sand) !important;
  box-shadow: 0 12px 24px -4px rgba(16, 45, 39, 0.1) !important;
}

.module-card:hover .module-arrow {
  transform: translateX(4px);
  color: var(--color-forest-green) !important;
}

[dir="rtl"] .module-card:hover .module-arrow {
  transform: translateX(-4px);
}

.module-arrow {
  transition: transform 0.2s ease, color 0.2s ease;
}

.border-top {
  border-top: 1px solid var(--color-border);
}
</style>