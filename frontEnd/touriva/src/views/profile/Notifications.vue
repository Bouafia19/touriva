<template>
  <div class="notifications-page bg-warm-ivory py-6 px-4 min-h-screen">
    <v-container class="max-w-md mx-auto">
      <!-- Header -->
      <div class="d-flex align-center justify-space-between mb-6">
        <div class="d-flex align-center ga-3">
          <v-btn
            icon="mdi-arrow-left"
            variant="text"
            density="comfortable"
            color="#173F35"
            @click="router.back()"
          />
          <div>
            <div class="text-caption font-weight-bold text-secondary-editorial text-uppercase">
              {{ $t('profile') || 'Mon Espace' }}
            </div>
            <h1 class="text-h5 font-serif font-weight-bold text-forest">
              {{ $t('notifications') || 'Notifications' }}
            </h1>
          </div>
        </div>

        <v-chip
          v-if="notifications.unreadCount > 0"
          size="small"
          color="#173F35"
          variant="flat"
          class="font-weight-bold text-sand"
        >
          {{ notifications.unreadCount }} {{ $t('unread') || 'non lue(s)' }}
        </v-chip>
      </div>

      <!-- Loading State -->
      <div v-if="notifications.loading" class="text-center py-12">
        <v-progress-circular indeterminate color="#173F35" size="36" width="3" />
        <div class="text-caption text-secondary-editorial mt-3">
          {{ $t('loading') || 'Chargement des notifications...' }}
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!notifications.notificationsList || notifications.notificationsList.length === 0"
        class="text-center py-12"
      >
        <v-avatar color="#F8F5EE" size="64" class="mb-4">
          <v-icon color="#B89564" size="32">mdi-bell-outline</v-icon>
        </v-avatar>
        <div class="text-subtitle-1 font-weight-bold text-forest mb-1">
          {{ $t('noRecords') || 'Aucune notification pour le moment' }}
        </div>
        <p class="text-caption text-secondary-editorial max-w-xs mx-auto">
          {{ $t('noNotificationsSubtitle') || 'Vous recevrez ici les alertes concernant la validation de votre dossier, vos réservations et vos activités.' }}
        </p>
      </div>

      <!-- Notification List -->
      <div v-else class="d-flex flex-column ga-3">
        <v-card
          v-for="notif in notifications.notificationsList"
          :key="notif._id"
          class="editorial-card pa-4"
          :class="{ 'unread-card': notif.status === 'unread' }"
          elevation="0"
        >
          <div class="d-flex align-start ga-3">
            <!-- Icon by notification type -->
            <v-avatar
              :color="getNotificationColor(notif).bg"
              size="40"
              class="flex-shrink-0"
            >
              <v-icon :color="getNotificationColor(notif).text" size="22">
                {{ getNotificationIcon(notif) }}
              </v-icon>
            </v-avatar>

            <div class="flex-grow-1">
              <div class="d-flex justify-space-between align-start mb-1">
                <span class="text-subtitle-2 font-weight-bold text-forest">
                  {{ notif.title }}
                </span>
                <span class="text-caption text-secondary-editorial text-xs ml-2">
                  {{ formatDate(notif.createdAt) }}
                </span>
              </div>

              <p class="text-body-2 text-forest mb-2">
                {{ notif.message }}
              </p>

              <!-- If rejection notice: CTA to fix documents -->
              <div
                v-if="notif.metadata?.fileStatus === 'rejected'"
                class="mt-2 pt-2 border-top-subtle d-flex align-center justify-space-between"
              >
                <v-btn
                  size="small"
                  color="#C24545"
                  variant="flat"
                  rounded="pill"
                  class="text-white text-none font-weight-bold"
                  to="/pending"
                >
                  <v-icon start size="16">mdi-file-document-edit-outline</v-icon>
                  {{ $t('updateDossier') || 'Mettre à jour mon dossier' }}
                </v-btn>

                <v-btn
                  v-if="notif.status === 'unread'"
                  size="x-small"
                  variant="text"
                  color="#173F35"
                  @click="notifications.markAsRead(notif._id)"
                >
                  {{ $t('markAsRead') || 'Marquer comme lu' }}
                </v-btn>
              </div>

              <!-- General mark as read button if unread -->
              <div
                v-else-if="notif.status === 'unread'"
                class="text-right mt-1"
              >
                <v-btn
                  size="x-small"
                  variant="text"
                  color="#173F35"
                  @click="notifications.markAsRead(notif._id)"
                >
                  {{ $t('markAsRead') || 'Marquer comme lu' }}
                </v-btn>
              </div>
            </div>
          </div>
        </v-card>
      </div>
    </v-container>
  </div>
</template>

<script setup>
  import { onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useNotificationsStore } from '@/stores/notifications'

  const router = useRouter()
  const notifications = useNotificationsStore()

  const getNotificationColor = (notif) => {
    if (notif.metadata?.fileStatus === 'rejected' || notif.type === 'error') {
      return { bg: '#FDF2F2', text: '#C24545' }
    }
    if (notif.metadata?.fileStatus === 'confirmed' || notif.type === 'success') {
      return { bg: '#EBF5F0', text: '#21866B' }
    }
    return { bg: '#F5EDE0', text: '#173F35' }
  }

  const getNotificationIcon = (notif) => {
    if (notif.metadata?.fileStatus === 'rejected') return 'mdi-alert-circle-outline'
    if (notif.metadata?.fileStatus === 'confirmed') return 'mdi-check-decagram-outline'
    if (notif.type === 'booking') return 'mdi-ticket-confirmation-outline'
    return 'mdi-bell-ring-outline'
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    } catch (e) {
      return ''
    }
  }

  onMounted(async () => {
    await notifications.fetchUserNotifications()
  })
</script>

<style scoped>
.bg-warm-ivory {
  background-color: #FAF8F2;
}

.text-forest {
  color: #173F35 !important;
}

.text-secondary-editorial {
  color: #5A6B63 !important;
}

.text-sand {
  color: #D9B98C !important;
}

.editorial-card {
  background-color: #FFFFFF;
  border: 1px solid #E7E8E1;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.unread-card {
  border-left: 4px solid #173F35 !important;
  background-color: #FCFBF7;
}

.border-top-subtle {
  border-top: 1px solid #E7E8E1;
}

.text-xs {
  font-size: 0.75rem !important;
}
</style>
