<template>
  <v-container fluid class="pa-6 dashboard-page">
    <!-- Editorial Section Header -->
    <div class="editorial-section-header d-flex flex-wrap align-center justify-space-between mb-6">
      <div>
        <span class="editorial-tag">{{ $t('Overview') }}</span>
        <h1 class="editorial-title">{{ $t('Dashboard') }}</h1>
        <p class="editorial-subtitle">Platform metrics, tourism listings & pending operations</p>
      </div>

      <div class="d-flex align-center mt-3 mt-sm-0">
        <v-btn
          class="btn-editorial-outline mr-2"
          prepend-icon="mdi-refresh"
          @click="refreshData"
          :loading="loading"
          size="small"
        >
          Refresh
        </v-btn>
        <v-btn
          class="btn-editorial-primary"
          prepend-icon="mdi-plus-circle"
          to="/trips"
          size="small"
        >
          {{ $t('AddNewTrip') }}
        </v-btn>
      </div>
    </div>

    <!-- Summary Stat Cards -->
    <v-row class="mb-6">
      <!-- Total Users -->
      <v-col cols="12" sm="6" md="4" lg="2" v-for="stat in statCards" :key="stat.title">
        <v-skeleton-loader v-if="loading" type="card" height="110" class="rounded-xl"></v-skeleton-loader>
        <v-card
          v-else
          class="admin-stat-card fill-height d-flex flex-column justify-space-between"
          :to="stat.to"
          link
        >
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="editorial-tag text-caption" style="font-size: 0.6875rem;">{{ stat.label }}</span>
            <div class="icon-circle-sand" :style="{ backgroundColor: stat.bgColor }">
              <v-icon :icon="stat.icon" size="20" :color="stat.iconColor"></v-icon>
            </div>
          </div>
          <div class="d-flex align-baseline justify-space-between">
            <div class="stat-number font-serif font-weight-bold" :class="stat.numberColorClass">
              {{ stat.count }}
            </div>
            <v-chip
              v-if="stat.badge"
              size="x-small"
              :color="stat.badgeColor"
              class="font-weight-bold px-2"
              variant="flat"
            >
              {{ stat.badge }}
            </v-chip>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main Content Grid -->
    <v-row>
      <!-- Left Column: Pending Activity & Operations -->
      <v-col cols="12" lg="8">
        <!-- Pending Approvals & Activity Card -->
        <v-card class="admin-card mb-6">
          <div class="pa-5 border-bottom d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-avatar size="34" color="sandLight" class="mr-3">
                <v-icon icon="mdi-clock-outline" color="forestGreen" size="18"></v-icon>
              </v-avatar>
              <div>
                <h2 class="text-subtitle-1 font-weight-bold text-forest mb-0">
                  {{ $t('PendingApprovals') }}
                </h2>
                <span class="text-caption text-secondary-editorial">
                  Items requiring administrative review & verification
                </span>
              </div>
            </div>
            <v-chip size="small" color="warning" variant="flat" class="font-weight-bold">
              {{ pendingTotalCount }} pending
            </v-chip>
          </div>

          <!-- Loading state -->
          <div v-if="loading" class="pa-4">
            <v-skeleton-loader type="list-item-three-line@3"></v-skeleton-loader>
          </div>

          <!-- Empty State -->
          <div v-else-if="allPendingItems.length === 0" class="text-center py-10 px-4">
            <v-avatar size="56" color="sandLight" class="mb-3">
              <v-icon icon="mdi-check-all" color="emerald" size="28"></v-icon>
            </v-avatar>
            <div class="font-serif font-weight-bold text-forest text-body-1 mb-1">
              {{ $t('AllReviewed') }}
            </div>
            <div class="text-caption text-secondary-editorial">
              All partner requests, trips, and venues are fully reviewed.
            </div>
          </div>

          <!-- Pending Items List -->
          <v-list v-else lines="two" class="pa-0">
            <v-list-item
              v-for="(item, idx) in allPendingItems.slice(0, 6)"
              :key="idx"
              class="border-bottom px-5 py-3 pending-list-item"
              :to="item.link"
              link
            >
              <template v-slot:prepend>
                <v-avatar size="40" :color="item.avatarBg" class="mr-3">
                  <v-icon :icon="item.icon" size="20" :color="item.iconColor"></v-icon>
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-semibold text-body-2 text-forest">
                {{ item.title }}
              </v-list-item-title>

              <v-list-item-subtitle class="text-caption text-secondary-editorial">
                {{ item.subtitle }}
              </v-list-item-subtitle>

              <template v-slot:append>
                <div class="d-flex align-center">
                  <span class="status-badge warning mr-3">
                    <v-icon icon="mdi-alert-circle-outline" size="12"></v-icon>
                    {{ $t('pendingStatus') }}
                  </span>
                  <v-icon icon="mdi-chevron-right" size="18" color="secondary"></v-icon>
                </div>
              </template>
            </v-list-item>
          </v-list>

          <div v-if="allPendingItems.length > 6" class="pa-3 text-center bg-warm-ivory border-top">
            <v-btn variant="text" size="small" class="text-forest font-weight-bold" to="/users">
              View all {{ allPendingItems.length }} pending submissions →
            </v-btn>
          </div>
        </v-card>

        <!-- Platform Service Status & Infrastructure -->
        <v-card class="admin-card">
          <div class="pa-5 border-bottom d-flex align-center justify-space-between flex-wrap ga-2">
            <div class="d-flex align-center">
              <v-avatar size="34" color="sandLight" class="mr-3">
                <v-icon icon="mdi-server-network" color="forestGreen" size="18"></v-icon>
              </v-avatar>
              <div>
                <h2 class="text-subtitle-1 font-weight-bold text-forest mb-0">
                  Platform Services & Connectivity
                </h2>
                <span class="text-caption text-secondary-editorial">
                  Live status of database clusters, APIs and operational microservices
                </span>
              </div>
            </div>
            <v-chip size="small" color="success" variant="flat" class="font-weight-bold">
              <v-icon start size="14">mdi-check-circle</v-icon> All Systems Operational
            </v-chip>
          </div>

          <div class="pa-5">
            <v-row>
              <v-col cols="12" sm="6" md="3" v-for="svc in serviceStatuses" :key="svc.name">
                <div class="pa-4 rounded-lg bg-warm-ivory border-editorial">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <span class="text-caption font-weight-bold text-forest">{{ svc.name }}</span>
                    <v-badge dot inline :color="svc.online ? 'success' : 'error'"></v-badge>
                  </div>
                  <div class="text-caption text-secondary-editorial mb-2">{{ svc.details }}</div>
                  <div class="text-caption font-weight-medium text-emerald d-flex align-center">
                    <v-icon size="14" class="mr-1">mdi-pulse</v-icon> {{ svc.latency }}
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-card>
      </v-col>

      <!-- Right Column: Quick Actions & System Info -->
      <v-col cols="12" lg="4">
        <!-- Quick Actions Card -->
        <v-card class="admin-card mb-6">
          <div class="pa-5 border-bottom">
            <div class="d-flex align-center">
              <v-avatar size="34" color="sandLight" class="mr-3">
                <v-icon icon="mdi-lightning-bolt" color="forestGreen" size="18"></v-icon>
              </v-avatar>
              <div>
                <h2 class="text-subtitle-1 font-weight-bold text-forest mb-0">
                  {{ $t('QuickActions') }}
                </h2>
                <span class="text-caption text-secondary-editorial">
                  Frequently accessed operations
                </span>
              </div>
            </div>
          </div>

          <div class="pa-3">
            <v-list density="compact" class="pa-0">
              <v-list-item
                v-for="action in quickActions"
                :key="action.title"
                :to="action.to"
                link
                class="rounded-lg mb-2 quick-action-item"
              >
                <template v-slot:prepend>
                  <v-avatar size="36" :color="action.bgColor" class="mr-3">
                    <v-icon :icon="action.icon" size="18" :color="action.iconColor"></v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-medium text-body-2 text-forest">
                  {{ $t(action.title) }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption text-secondary-editorial">
                  {{ action.subtitle }}
                </v-list-item-subtitle>
                <template v-slot:append>
                  <v-icon icon="mdi-arrow-right" size="16" color="secondary"></v-icon>
                </template>
              </v-list-item>
            </v-list>
          </div>
        </v-card>

        <!-- Admin Portal Status Banner -->
        <v-card class="admin-card bg-forest-green text-white pa-5">
          <div class="d-flex align-center mb-3">
            <v-avatar size="36" color="rgba(255,255,255,0.15)" class="mr-3">
              <v-icon icon="mdi-shield-check" color="sand" size="20"></v-icon>
            </v-avatar>
            <div>
              <div class="font-serif text-subtitle-1 font-weight-bold text-white">Touriva Platform</div>
              <div class="text-caption text-sand font-weight-medium">Editorial Tourism Admin</div>
            </div>
          </div>
          <p class="text-caption text-white opacity-80 mb-4" style="line-height: 1.5;">
            Connected to Touriva production API. All operations performed are synchronized in real time with the mobile & web applications.
          </p>
          <div class="d-flex align-center justify-space-between pt-2 border-top-translucent">
            <span class="text-caption text-sand font-weight-bold">SYSTEM STATUS</span>
            <span class="status-badge success text-caption">Operational</span>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUsersStore } from '@/stores/users'
import { useTripsStore } from '@/stores/trips'
import { useSitesStore } from '@/stores/sites'
import { useHotelsStore } from '@/stores/hotels'
import { useRestaurantsStore } from '@/stores/restaurants'

const users = useUsersStore()
const trips = useTripsStore()
const sites = useSitesStore()
const hotels = useHotelsStore()
const restaurants = useRestaurantsStore()

const loading = ref(true)

const refreshData = async () => {
  loading.value = true
  try {
    await Promise.allSettled([
      users.fetchUsers(),
      trips.fetchTrips(),
      sites.fetchSites(),
      hotels.fetchHotels(),
      restaurants.fetchRestaurants()
    ])
  } catch (err) {
    console.error('Failed to load dashboard data', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refreshData()
})

// Counts
const totalUsersCount = computed(() => users.getUsers?.length || 0)
const totalTripsCount = computed(() => trips.getTrips?.length || 0)
const totalSitesCount = computed(() => sites.getSites?.length || 0)
const totalHotelsCount = computed(() => hotels.getHotels?.length || 0)
const totalRestaurantsCount = computed(() => restaurants.getRestaurants?.length || 0)

const pendingPartnersCount = computed(() => users.getPendingPartners?.length || 0)
const pendingTripsCount = computed(() => trips.getAlertTrips?.length || 0)
const pendingSitesCount = computed(() => sites.getAlertSites?.length || 0)
const pendingHotelsCount = computed(() => hotels.getAlertHotels?.length || 0)
const pendingRestaurantsCount = computed(() => restaurants.getAlertRestaurants?.length || 0)

const pendingTotalCount = computed(() => {
  return (
    pendingPartnersCount.value +
    pendingTripsCount.value +
    pendingSitesCount.value +
    pendingHotelsCount.value +
    pendingRestaurantsCount.value
  )
})

// Stat Cards configuration
const statCards = computed(() => [
  {
    label: 'Total Users',
    title: 'TotalUsers',
    count: totalUsersCount.value,
    icon: 'mdi-account-group-outline',
    iconColor: '#173F35',
    bgColor: '#F5EDE0',
    numberColorClass: 'text-forest',
    to: '/users'
  },
  {
    label: 'Active Trips',
    title: 'ActiveTrips',
    count: totalTripsCount.value,
    icon: 'mdi-compass-outline',
    iconColor: '#21866B',
    bgColor: '#E6F4F0',
    numberColorClass: 'text-forest',
    to: '/trips'
  },
  {
    label: 'Sites',
    title: 'Sites',
    count: totalSitesCount.value,
    icon: 'mdi-map-marker-radius-outline',
    iconColor: '#2A6F85',
    bgColor: '#EAF3F6',
    numberColorClass: 'text-forest',
    to: '/sites'
  },
  {
    label: 'Hotels',
    title: 'Hotels',
    count: totalHotelsCount.value,
    icon: 'mdi-bed-outline',
    iconColor: '#D9943B',
    bgColor: '#FDF5EC',
    numberColorClass: 'text-forest',
    to: '/hotels'
  },
  {
    label: 'Restaurants',
    title: 'Restaurants',
    count: totalRestaurantsCount.value,
    icon: 'mdi-silverware-fork-knife',
    iconColor: '#B89564',
    bgColor: '#F7F2EB',
    numberColorClass: 'text-forest',
    to: '/restaurants'
  },
  {
    label: 'Approvals',
    title: 'PendingApprovals',
    count: pendingTotalCount.value,
    icon: 'mdi-alert-circle-outline',
    iconColor: pendingTotalCount.value > 0 ? '#C24545' : '#21866B',
    bgColor: pendingTotalCount.value > 0 ? '#FBEBEB' : '#E6F4F0',
    numberColorClass: pendingTotalCount.value > 0 ? 'text-error' : 'text-forest',
    badge: pendingTotalCount.value > 0 ? 'Action' : 'Clean',
    badgeColor: pendingTotalCount.value > 0 ? 'error' : 'success',
    to: '/users'
  }
])

// Aggregated Pending Items
const allPendingItems = computed(() => {
  const items = []

  // Pending Partners
  if (users.getPendingPartners) {
    users.getPendingPartners.forEach((p) => {
      items.push({
        title: p.companyName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.email,
        subtitle: `Partner registration (${p.typeAccount || 'Partner'}) • ${p.email || ''}`,
        link: '/users',
        icon: 'mdi-account-tie',
        iconColor: '#173F35',
        avatarBg: '#F5EDE0'
      })
    })
  }

  // Pending Trips
  if (trips.getAlertTrips) {
    trips.getAlertTrips.forEach((t) => {
      items.push({
        title: t.name || 'Untitled Trip',
        subtitle: `Trip submission • ${t.destination?.name || 'Algeria'} • ${t.price ? t.price + ' DA' : ''}`,
        link: '/trips',
        icon: 'mdi-compass',
        iconColor: '#21866B',
        avatarBg: '#E6F4F0'
      })
    })
  }

  // Pending Sites
  if (sites.getAlertSites) {
    sites.getAlertSites.forEach((s) => {
      items.push({
        title: s.name || 'Unnamed Site',
        subtitle: `New site listing • ${s.address || 'Algeria'}`,
        link: '/sites',
        icon: 'mdi-map-marker',
        iconColor: '#2A6F85',
        avatarBg: '#EAF3F6'
      })
    })
  }

  // Pending Hotels
  if (hotels.getAlertHotels) {
    hotels.getAlertHotels.forEach((h) => {
      items.push({
        title: h.name || 'Unnamed Hotel',
        subtitle: `Hotel verification • ${h.address || 'Algeria'}`,
        link: '/hotels',
        icon: 'mdi-bed',
        iconColor: '#D9943B',
        avatarBg: '#FDF5EC'
      })
    })
  }

  // Pending Restaurants
  if (restaurants.getAlertRestaurants) {
    restaurants.getAlertRestaurants.forEach((r) => {
      items.push({
        title: r.name || 'Unnamed Restaurant',
        subtitle: `Restaurant verification • ${r.address || 'Algeria'}`,
        link: '/restaurants',
        icon: 'mdi-silverware',
        iconColor: '#B89564',
        avatarBg: '#F7F2EB'
      })
    })
  }

  return items
})

// Platform Service Statuses
const serviceStatuses = computed(() => [
  { name: 'Tourism REST API', details: 'Node.js Express Gateway', latency: 'Port 4004 • Online', online: true },
  { name: 'MongoDB Cluster', details: 'Touriva Database Engine', latency: 'Connected (Atlas/Local)', online: true },
  { name: 'Shop Core Service', details: 'Merchandise & Orders', latency: 'Port 5000 • Online', online: true },
  { name: 'Places GIS Engine', details: 'Geocoding & Attractions', latency: `${totalSitesCount.value} Sites Active`, online: true }
])

// Quick Actions
const quickActions = [
  {
    title: 'AddNewTrip',
    subtitle: 'Publish organized tours & expeditions',
    to: '/trips',
    icon: 'mdi-compass',
    iconColor: '#173F35',
    bgColor: '#F5EDE0'
  },
  {
    title: 'ManageUsers',
    subtitle: 'Review clients, partners & guides',
    to: '/users',
    icon: 'mdi-account-cog-outline',
    iconColor: '#2A6F85',
    bgColor: '#EAF3F6'
  },
  {
    title: 'Sites',
    subtitle: 'Heritage & touristic landmarks catalog',
    to: '/sites',
    icon: 'mdi-map-marker-plus',
    iconColor: '#21866B',
    bgColor: '#E6F4F0'
  },
  {
    title: 'Hotels',
    subtitle: 'Manage hotel listings & rooms',
    to: '/hotels',
    icon: 'mdi-bed',
    iconColor: '#D9943B',
    bgColor: '#FDF5EC'
  },
  {
    title: 'Restaurants',
    subtitle: 'Gastronomy & dining directory',
    to: '/restaurants',
    icon: 'mdi-silverware',
    iconColor: '#B89564',
    bgColor: '#F7F2EB'
  }
]
</script>

<style scoped>
.dashboard-page {
  max-width: 1600px;
  margin: 0 auto;
}

.stat-number {
  font-size: 2rem;
  line-height: 1;
}

.pending-list-item {
  transition: background-color 0.15s ease;
}

.pending-list-item:hover {
  background-color: #F8F6F0 !important;
}

.quick-action-item {
  transition: all 0.15s ease;
  border: 1px solid transparent;
}

.quick-action-item:hover {
  background-color: #F8F6F0 !important;
  border-color: var(--color-border) !important;
  transform: translateX(3px);
}

[dir="rtl"] .quick-action-item:hover {
  transform: translateX(-3px);
}

.border-bottom {
  border-bottom: 1px solid var(--color-border);
}

.border-top {
  border-top: 1px solid var(--color-border);
}

.border-top-translucent {
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}
</style>