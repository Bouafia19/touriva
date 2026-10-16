<template>
  <div>
   
    <h1>Notifications</h1>
      <!-- <div v-if="!announcements.getAnnouncements">
        <v-row 
          class="d-flex justify-center align-center"  
          style="height: 100vh;"
        >
          <v-progress-circular
            indeterminate
            color="next"
          ></v-progress-circular>
        </v-row>
      </div>
      <div v-else>
        <div v-if="announcements.getAnnouncements.length === 0" class="text-center ma-2">
          <v-alert
            outlined
            color="info"
          >
            <div class="text-h6">
              {{ $t('noRecords')}}
            </div>
          </v-alert>
        </div>
        
        <div v-else-if="announcements.getAnnouncements.length > 0">
          <v-row 
            justify="center"
            no-gutters
          >
            <v-col>  
              <div
                v-for="announcement in announcements.getAnnouncements"
                :key="announcement._id"
              >
                          <v-card 
                              width="90%"
                              elevation="2"
                              class="mx-auto my-2"
                              outlined
                              
                          >
                              <v-card-title>
                                  <div class="ml-3 text-subtitle-1">
                                      {{ announcement.title }}
                                  </div>
                              </v-card-title>

                              <v-card-text>
                                  <div class="font-weight-bold ml-8 mb-2">
                                      {{ announcement.body }}
                                  </div>
                              </v-card-text>
                              <v-card-actions>
                                <v-btn
                                  text
                                  color="next"
                        
                                >
                                  Learn More
                                </v-btn>
                              </v-card-actions>
                          </v-card>
                      </div>
                  </v-col>
              </v-row>
          </div>
      </div> -->
  </div>
</template>

<script setup>
  import { onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAnnouncementsStore } from '@/stores/announcements'
  import { useNotificationsStore } from '@/stores/notifications'
 
  const router = useRouter()
  const announcements = useAnnouncementsStore()
  const notifications = useNotificationsStore()

  const getAnnouncementDetail = (value) => {
    console.log('value', value)  
  }

  const goToNotificationClient = (value) => {
    console.log('goToNotificationClient', value)
    value.data.clientLastName = value.data.clientId.lastName
    value.data.clientFirstName = value.data.clientId.firstName
    value.data.clientSocketIo = value.data.socketId
    notifications.notification = value.data
    announcements.announcementId = value._id
    router.push({ name: 'NotificationClient' })
  }
  
  onMounted(() => {
    // announcements.fetchAnnouncements()
    // announcements.fetchAnnouncementsByTransporterId()
  })
</script>