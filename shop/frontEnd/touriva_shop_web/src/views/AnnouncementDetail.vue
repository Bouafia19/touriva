<template>
  <v-container 
    fluid 
    :class="[platform === 'web' ? 'px-0 main-container' : '']"
  >

    <Advertising />

    <v-row>
      <v-col class="d-flex justify-start">
        <v-btn 
          color="next"
          @click="returnTo"
          variant="text"
          prepend-icon="mdi-arrow-left"
        >
          {{ $t('Return') }}
        </v-btn>
      </v-col>
    </v-row>

    <!-- Announcement Details -->
    <v-row>
      <!-- Left Column: Images -->
      <v-col cols="12" md="6" :class="platform !== 'web' ? 'pt-0' : ''">

        <v-carousel 
          :show-arrows="false" 
          v-model="currentImage" 
          class="pa-0 ma-0" 
          :height="$vuetify.display.mdAndUp ? 400 : 250"  
          hide-delimiters
        >
          <v-carousel-item 
            v-for="(image, index) in imageList" 
            :key="index" 
            class="pa-0 ma-0"
          >
            <v-img
              :src="image"
              aspect-ratio="1.77"
              cover
            >
              <!-- Loading slot -->
              <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular
                    indeterminate
                    color="next"
                  ></v-progress-circular>
                </v-row>
              </template>
            </v-img>
          </v-carousel-item>
        </v-carousel>

        <!-- Thumbnails -->
        <v-row 
          justify="center"
          v-if="announcement.thumbnails.length === 0"  
        >
          <v-skeleton-loader
            v-for="(im, index) in 3"
            :key="index"
            max-width="75"
            max-height="75"
            class="mx-1"
            type="image"
          ></v-skeleton-loader>
        </v-row>

        <v-row 
          class="mt-2" 
          justify="center" 
          v-else
        >
          <v-img  
            v-for="(image, index) in announcement.thumbnails"
            :key="index"
            :src="image"
            max-width="75"
            max-height="75"
            class="mx-1"
            :class="{ active: currentImage === index }"
            @click="currentImage = index"
          ></v-img>
        </v-row>
      </v-col>

      <!-- Right Column: Details -->
      <v-col cols="12" md="6">
        <v-card class="pa-4">
          <v-card-title 
            class="text-h5 mb-2"
          >
            {{ announcement.name }}
          </v-card-title>

          <v-card-subtitle class="text-h6 text-primary">
            {{ announcement.price + ' DZD' }}
          </v-card-subtitle>

          <v-divider class="my-4"></v-divider>

          <v-card-text>
            <p class="mb-2"><strong>{{ $t('Category') }}:</strong> {{ announcement.category ? announcement.category.name : '****' }}</p>
            <p class="mb-2"><strong>{{ $t('Location') }}:</strong> {{ announcement.ownerId ? announcement.ownerId.communeId.name + 
                                                          ', ' + announcement.ownerId.dairaId.name + 
                                                          ', ' + announcement.ownerId.wilayaId.name 
                                                          : '****'
                                                        }}
                                                      </p>
            <p class="mb-2"><strong>{{ $t('Description') }}:</strong></p>
            <p>{{ announcement.description }}</p>
          </v-card-text>

          <v-btn 
            block 
            color="next" 
            class="mt-4"
            @click="contactSeller(announcement.ownerId)"
          >
            {{ $t('ContactSeller') }}
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- Additional Information -->
    <v-card class="my-4">
      <v-card-title class="text-h6">{{ $t('Specifications') }}</v-card-title>
      <v-card-text>

        <v-skeleton-loader
          v-if="announcement.features.length === 0"
          type="list-item-three-line"
        ></v-skeleton-loader>

        <v-list v-else>
          <v-list-item 
            v-for="(feature, index) in announcement.features" 
            :key="index"
          >
            
            <v-list-item-title>
              <strong>{{ feature.key }}</strong>: {{ feature.value }}
            </v-list-item-title>
            
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <!-- Related Announcements -->
    <v-row 
      class="mt-6"
      v-if="relatedAnnouncements.length > 0"
    >

      <v-col cols="12">
        <h4 class="mb-4">{{ $t('RelatedAnnouncements') }}</h4>
      </v-col>

      <v-col 
        cols="12" 
        md="3" 
        v-for="(rel, index) in 4" 
        :key="index"
        v-if="relatedAnnouncements.length === 0"
      >
        <v-skeleton-loader
          type="card"
        ></v-skeleton-loader>
      </v-col>

      <v-col 
        v-else 
        cols="12" 
        md="3" 
        v-for="(related, index) in relatedAnnouncements.slice(0, 4)" 
        :key="related._id"
      >
        <v-card @click="$router.push(`/announcement/${related._id}`)">
          <v-img :src="related.img" height="150px" class="mb-2"></v-img>
          <v-card-title class="text-h6">{{ related.name }}</v-card-title>
          <v-card-subtitle class="text-primary">{{ related.price + ' DZD'}}</v-card-subtitle>
          <v-card-actions>
            <v-btn text color="next" :to="`/announcement/${related._id}`">{{ $t('ViewDetails') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title 
          style="background-color: #173F35; color: white"
        >
          {{announcement.ownerId.companyName}}
        </v-card-title>

        <v-card-text>
          <p>{{ $t('phoneNumber') }}: </p>
          <p>{{announcement.ownerId.phone}}</p>  
          
          <p>{{ $t('email') }}: </p>
          <p>{{announcement.ownerId.email}}</p> 
          
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="dialog = false">{{ $t('close') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>
  import axios from 'axios'
  import { Capacitor } from '@capacitor/core'
  import { useAdvertisingStore } from '@/stores/advertising'
  import Advertising from '@/components/Advertising.vue'

export default {
  name: 'AnnouncementDetail',
  props: ['announcementId'],
  components: {
    Advertising
  },
  data() {
    return {
      announcements: [],
      announcement: {
        thumbnails: [],
        features: []
      },
      currentImage: 0,
      relatedAnnouncements: [],
      dialog: false,
      platform: null,
      ads: null,
      dialogAds: false
    };
  },

  computed: {
    // Combine main image with thumbnails, or just use the main image if no thumbnails
    imageList() {
      return this.announcement.thumbnails.length ? this.announcement.thumbnails : [this.announcement.img];
    },
  },

  async created() {
    this.platform = Capacitor.getPlatform()
    this.ads = useAdvertisingStore()
    await this.fetchAnnouncementDetails()
    this.ads.fetchAdvertising().then(() => {
      if(this.ads.getInterstitialAdsDetail.length > 0){
        this.dialogAds = true
      }
    })
  },

  watch: {
    // Watch for changes to the route parameter (id)
    "$route.params.announcementId": {
      immediate: true, // Trigger on component creation
      handler(newId) {
        this.fetchAnnouncementDetails(newId); // Fetch data whenever the id changes
      },
    },
  },

  methods: {
    returnTo(){
      this.$router.go(-1)
    },

    openInNewTab(href){
      if(href){
        window.open(href, '_blank')
      }
    },

    contactSeller(owner) {
      if(Capacitor.getPlatform() !== 'web'){
        window.open('tel:' + owner.phone, '_system')
      }else{
        this.dialog = true
      }
    },

    async fetchAnnouncements(id){
      try {
        let response = null
        response = await axios.get(`/api/announcements/getAnnouncementsByCategory/${id}`);
        // this.announcements = response.data;
        this.announcements.push(...response.data)
        this.relatedAnnouncements = this.announcements.filter((a) => a._id !== this.announcement._id);

      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    },

    async fetchAnnouncementDetails() {
      try {
        const response = await axios.get(`/api/announcements/${this.announcementId}`)
        this.announcement = response.data
        await this.fetchAnnouncements(this.announcement.category._id)
      } catch (error) {
        console.error('Error fetching announcement details:', error)
      }
    },

    setMainImage(image) {
      this.announcement.img = image
    },

    addToCart() {
      alert("Item added to cart!");
    },

    buyNow() {
      alert("Proceeding to checkout...");
    }
  },
};
</script>

<style scoped>
  .v-card-actions {
    background-color: #173F35;
  }

  .v-img.active {
    border: 2px solid #D9B98C;
    border-radius: 4px;
    cursor: pointer;
  }

  .v-card {
    border: 1px solid var(--color-border);
    border-radius: 12px;
  }

  .image-gallery {
    position: relative;
  }

  .main-image {
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .thumbnail {
    width: 80px;
    height: 80px;
    margin: 0 8px;
    cursor: pointer;
    border: 2px solid transparent;
    border-radius: 4px;
    transition: transform 0.2s, border 0.2s;
  }

  .thumbnail:hover {
    transform: scale(1.1);
    border: 2px solid #1976d2; /* Primary color */
  }

  .details-card {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    border-radius: 8px;
  }

  .price {
    font-weight: bold;
    color: #1976d2; /* Primary color */
  }

  .description {
    font-size: 16px;
    line-height: 1.6;
    color: #555;
  }

  .main-container {
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
  }
</style>
