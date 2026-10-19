<template>
  <v-container fluid class="px-4 px-md-8 py-6">
    <!-- Header -->
    <div class="editorial-page-header">
      <div>
        <div class="editorial-tag mb-1">Administrative Center</div>
        <h1 class="editorial-page-title">Management Hub</h1>
        <p class="editorial-page-subtitle">Access all commerce, catalog, marketing, and system administrative modules.</p>
      </div>
    </div>

    <!-- Hub Modules Grid -->
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
          class="editorial-card h-100 pa-5 d-flex flex-column justify-space-between"
          :to="item.to"
          link
        >
          <div>
            <div class="d-flex align-center justify-space-between mb-3">
              <v-avatar size="48" class="bg-sand-light border-editorial">
                <v-icon :icon="item.icon" color="forestGreen" size="26"></v-icon>
              </v-avatar>
              <span class="editorial-tag">{{ item.section || 'MODULE' }}</span>
            </div>
            <h3 class="font-serif text-h6 font-weight-bold text-deep-green mb-1">
              {{ $t(item.title) }}
            </h3>
            <p class="text-caption text-editorial-secondary mb-0">
              {{ item.description ? $t(item.description) : item.defaultDesc }}
            </p>
          </div>

          <div class="pt-4 mt-2 border-t d-flex align-center justify-space-between">
            <span class="text-caption font-weight-bold text-forest">Open Module</span>
            <v-icon icon="mdi-arrow-right" size="18" color="forestGreen"></v-icon>
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
    section: 'Analytics',
    description: 'CompDash',
    defaultDesc: 'Real-time sales, order fulfillment, and KPI performance.'
  },
  {
    title: 'Products',
    icon: 'mdi-package-variant-closed',
    to: '/products',
    section: 'Catalog',
    description: '',
    defaultDesc: 'Manage inventory items, pricing, photos, and descriptions.'
  },
  {
    title: 'Categories',
    icon: 'mdi-format-list-bulleted-type',
    to: '/admin/categories',
    section: 'Catalog',
    description: '',
    defaultDesc: 'Organize category tree hierarchies and nested classifications.'
  },
  {
    title: 'Brands',
    icon: 'mdi-tag-outline',
    to: '/brands',
    section: 'Catalog',
    description: '',
    defaultDesc: 'Partner vendor brands, labels, and product lines.'
  },
  {
    title: 'Orders',
    icon: 'mdi-receipt-text-outline',
    to: '/orders',
    section: 'Commerce',
    description: '',
    defaultDesc: 'Track client purchases, fulfillment statuses, and order totals.'
  },
  {
    title: 'Users',
    icon: 'mdi-account-group-outline',
    to: '/users',
    section: 'Accounts',
    description: 'ModUser',
    defaultDesc: 'Administrators, partner vendors, and registered clients.'
  },
  {
    title: 'Billing',
    icon: 'mdi-credit-card-outline',
    to: '/billing',
    section: 'Finance',
    description: 'ModBilling',
    defaultDesc: 'Merchant billing, subscriptions, invoices, and payments.'
  },
  {
    title: 'Ads',
    icon: 'mdi-bullhorn-outline',
    to: '/ads',
    section: 'Marketing',
    description: '',
    defaultDesc: 'Curated banner placements, sponsorships, and campaigns.'
  },
  {
    title: 'Notifications',
    icon: 'mdi-bell-outline',
    to: '/notifications',
    section: 'Comms',
    description: 'ModNotification',
    defaultDesc: 'Broadcast notices, updates, and customer communications.'
  },
  {
    title: 'TermsConditions',
    icon: 'mdi-file-document-outline',
    to: '/terms&conditions',
    section: 'Legal',
    description: 'ModTerm',
    defaultDesc: 'Platform compliance, seller agreements, and legal policies.'
  },
  {
    title: 'Roles',
    icon: 'mdi-shield-account-outline',
    to: '/roles',
    section: 'Security',
    description: 'ModRole',
    defaultDesc: 'Administrative access control and granular role permissions.'
  },
  {
    title: 'Settings',
    icon: 'mdi-cog-outline',
    to: '/setting',
    section: 'System',
    description: 'CompSetting',
    defaultDesc: 'General store configurations, localization, and preferences.'
  }
])
</script>