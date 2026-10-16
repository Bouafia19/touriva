<template>
  <v-container>

    <h2 class="d-flex justify-center">{{ $t('ManageAnnouncements') }}</h2>

    <v-row justify="end" class="ma-2">
      <v-col
        cols="12"
        sm="6"
        md="4"
      >
        <v-btn 
          color="grey"
          to="/admin/announcement/add"
          icon="mdi-plus"
        ></v-btn>
      </v-col>
    </v-row>

    <v-row
      class="ma-2 d-flex justify-center" 
      v-if="!publications.getPublicationsByOwnerId"
    >
      <v-col 
        cols="12"
        sm="6"
        md="4"
      >
        <v-skeleton-loader
          v-for="(cat, index) in 5" 
          :key="index"
          class="mx-auto"
          type="list-item"
        ></v-skeleton-loader>
      </v-col>
    </v-row>

    <v-row 
      class="ma-2 d-flex justify-center"
      v-if="!publications.getPublicationsByOwnerId === 0">
      <v-alert type="info">{{ $t('Npf') }}</v-alert>
    </v-row>

    <v-row class="ma-2 d-flex justify-center">
      <v-col 
        cols="12"
        sm="6"
        md="4"
      >
        <v-list>
          <v-list-item 
            v-for="announcement in publications.getPublicationsByOwnerId" 
            :key="announcement.id" 
            width="100%"
          >
            <div class="d-flex justify-space-between align-center w-100">
              
              <v-list-item-title>{{ announcement.name }}</v-list-item-title>
              
              <div class="d-flex align-center">
                <v-switch
                  v-model="announcement.published"
                  hide-details
                  inset
                  :color="announcement.published ? 'success' : 'error'"
                  class="mr-4"
                  @change="checkSubBeforPub(announcement)"
                >
                  <template v-slot:label>
                    <v-progress-circular
                      v-if="announcement.loading"
                      indeterminate
                      class="ms-2"
                      size="20"
                    />
                  </template>
                </v-switch>

                <v-btn 
                  color="next" 
                  class="mr-2" 
                  :to="`/admin/announcement/edit/${announcement._id}`"
                  icon="mdi-pencil"
                ></v-btn>

                <v-btn 
                  color="error" 
                  @click="publications.deleteAnnouncements(announcement._id)"
                  icon="mdi-delete"
                ></v-btn>
              </div>
            </div>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>

    <div class="text-center pa-4">
      <v-dialog
        v-model="dialog"
        max-width="400"
        persistent
      >
        <v-card
          prepend-icon="mdi-alert"
          :text="$t('BillingText')"
          :title="$t('BillingTitle')"
        >
          <template v-slot:actions>
            <v-spacer></v-spacer>

            <v-btn @click="dialog = false">
              {{ $t('Cancel') }}
            </v-btn>

            <v-btn @click="$router.push(`/billing/`)">
              {{ $t('Agree') }}
            </v-btn>
          </template>
        </v-card>
      </v-dialog>
    </div>

    <NewPlan
      @updateSheet="sheet = !sheet"
      @selectPlan="selectPlan($event)"
      v-model="sheet" 
      :plans="plans"
      class="mb-1"
    />
  </v-container>
</template>
  
<script setup>
  import { ref, onMounted, watch } from 'vue'
  import { usePublicationsStore } from '@/stores/publications'
  import { useAuthStore } from '@/stores/auth'
  import axios from 'axios'
  import NewPlan from '@/components/NewPlan.vue'
  import { storeToRefs } from 'pinia'

  const publications = usePublicationsStore()
  const auth = useAuthStore()
  const { getPublicationsByOwnerId } = storeToRefs(publications)

  const user = ref(null),
        dialog = ref(false),
        sheet = ref(false),
        plans = ref([]),
        announcement = ref({})

  
  
  const checkSubBeforPub = async (announcement) => {
    announcement.loading = true
    try {
      const currentTimestamp = Date.now();

    if (user.value.typeAccount === 'seller') {
      const userTimestamp = new Date(user.value.expirationOfSubscription).getTime();
      if (currentTimestamp >= userTimestamp) {
        dialog.value = true;
      } else {
        await publications.updateAnnouncements({ ...announcement });
      }
    } else if (user.value.typeAccount === 'rented') {
      const announcementTimestamp = new Date(announcement.expirationOfSubscription).getTime();
      if (currentTimestamp >= announcementTimestamp) {
        sheet.value = true;
      } else {
        await publications.updateAnnouncements({ ...announcement });
      }
    }
  } catch (error) {
    console.error('❌ Error updating announcement:', error)
  } finally {
    announcement.loading = false
    console.log('🟢 Finished updating:', announcement._id)
  }
}


  const selectPlan = async (plan) => {
    console.log('plan', plan)
    announcement.value.planId = plan._id
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + plan.duration);
    currentDate.toISOString().split("T")[0]; 
    announcement.value.expirationOfSubscription = currentDate;
    announcement.value.pai
    console.log('announcement', announcement.value)
    
    try {
      publications.updateAnnouncements(announcement)
    } catch (error) {
      console.error('Error adding announcement:', error);
    }
    router.push(`/billing/`)
  }

  const fetchPlans = async () => {
    try {
      const response = await axios.get('/api/plans');
      plans.value = response.data
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  onMounted(async() => {
    const ls = await auth.getLSUserInfo()
    user.value = ls.user
    publications.fetchAnnouncementsByOwner()
    fetchPlans()
  })
</script>
  