<template>
  <v-container class="py-8 max-w-900">
    <div class="mb-6">
      <span class="editorial-tag text-sand-dark d-block mb-1">UPDATES & ALERTS</span>
      <h1 class="editorial-heading text-h4 font-weight-bold text-forest">
        {{ $t('notifications') }}
      </h1>
      <p class="text-body-2 text-secondary-editorial mt-1">
        Stay informed about order updates, featured collections, and artisan spotlights.
      </p>
    </div>

    <div v-if="announcementsList.length > 0">
      <v-card
        v-for="item in announcementsList"
        :key="item._id"
        class="editorial-card pa-4 mb-3"
      >
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="d-flex align-center">
            <v-avatar color="sandLight" size="36" class="mr-3">
              <v-icon color="deepGreen" size="20">mdi-bell-outline</v-icon>
            </v-avatar>
            <h3 class="text-subtitle-1 font-weight-bold text-forest">
              {{ item.title }}
            </h3>
          </div>
          <span class="editorial-chip px-2 py-0-5 text-caption">INFO</span>
        </div>
        <p class="text-body-2 text-secondary-editorial ml-12 mb-2">
          {{ item.body || item.text }}
        </p>
      </v-card>
    </div>

    <div v-else class="shop-empty-state my-6 pa-8">
      <v-avatar size="64" color="sandLight" class="mb-3">
        <v-icon size="32" color="deepGreen">mdi-bell-sleep-outline</v-icon>
      </v-avatar>
      <h3 class="editorial-heading text-h6 font-weight-bold text-forest mb-2">
        No New Notifications
      </h3>
      <p class="text-body-2 text-secondary-editorial mb-4">
        You are completely caught up. Updates on your purchases will appear here.
      </p>
      <v-btn
        class="btn-editorial-primary px-6"
        size="small"
        @click="$router.push('/products')"
      >
        Explore Catalog
      </v-btn>
    </div>
  </v-container>
</template>

<script setup>
  import { onMounted, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAnnouncementsStore } from '@/stores/announcements'
  import { useNotificationsStore } from '@/stores/notifications'

  const router = useRouter()
  const announcements = useAnnouncementsStore()
  const notifications = useNotificationsStore()

  const announcementsList = computed(() => {
    return Array.isArray(announcements.getAnnouncements) ? announcements.getAnnouncements : []
  })

  onMounted(() => {
    announcements.fetchAnnouncements()
  })
</script>

<style scoped>
  .max-w-900 {
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
  }
</style>