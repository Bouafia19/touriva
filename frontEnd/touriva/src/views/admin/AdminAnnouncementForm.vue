<template>
  <div>
    <v-container>
      <v-row
        class="d-flex justify-center"
      >
        <v-col
          cols="12"
          md="4"
          v-if="user"
        >
          <v-container
            v-if="isLoading"
            class="fill-height"
            fluid
          >
            <v-row
              style="height: 100vh;"
              align="center"
              justify="center"
            >
              <v-col class="text-center">
                <v-progress-circular
                  indeterminate
                  color="next"
                  size="64"
                />
                <div class="mt-4">
                  {{ $t("Loading") }}
                </div>
              </v-col>
            </v-row>
          </v-container>
          <form v-else @submit.prevent="addAnnouncement">
            <h2>{{ isEdit ? $t("EditAnnouncement") : $t("AddAnnouncement") }}</h2>
            <v-text-field
              v-model="announcement.name"
              :label="$t('Name')"
              required
            ></v-text-field>

            <v-text-field
              v-model="announcement.price"
              :label="$t('Price')"
              type="number"
              required
            ></v-text-field>

            <v-text-field
              v-model="announcement.description"
              :label="$t('Description')"
              required
            ></v-text-field>

            <v-select
              v-model="announcement.brandId"
              :items="brands.getBrands"
              :label="$t('Brands')"
              item-title="name"
              item-value="_id"
              v-if="user.typeAccount === 'seller'"
            ></v-select>

            <div>
              <select 
                v-model="announcement.category._id" 
                required 
                class="select-box"
              >
                <option 
                  disabled 
                  value=""
                >
                  {{ $t('SelectCat') }}
                </option>

                <CategoryOption 
                  v-for="category in categories" 
                  :key="category._id" 
                  :category="category" 
                />
              </select>
            </div>

            <v-file-input 
              v-model="mainImg" 
              :label="$t('Photo')"
              outlined
              prepend-icon="mdi-camera"
              dense
              @change="onImageChange"
              class="mt-4"
            />

            <v-row justify="center" class="ma-2">
              <v-avatar 
                size="300"
                rounded="lg"
              >
                <v-img 
                  :src="announcement.img"
                  cover
                  style="float: center; border: 1px solid;"
                  alt=""
                ></v-img> 
              </v-avatar>
            </v-row>

            <v-row justify="center">
              <v-col 
                cols="12" 
                md="8"
              >
                <v-file-input
                  v-model="thumbnail"
                  :label="$t('UploadThumbnails')"
                  @change="handleFileUpload"
                  outlined
                  dense
                ></v-file-input>

                <v-row class="mt-4" justify="center">
                  <v-img
                    v-for="(thumbnail, index) in announcement.thumbnails"
                    :key="index"
                    :src="thumbnail"
                    aspect-ratio="1"
                    :alt="$t('ThumbnailPreview')"
                    class="thumbnail"
                    @click="removeThumbnail(index)"
                  ></v-img>
                </v-row>
              </v-col>
            </v-row>

            <v-row 
              align="center" 
              class="d-flex justify-center mb-3"
            >
              <v-col 
                cols="12" 
                md="8"
              >
                <v-select
                  v-model="selectedFeatureKey"
                  :items="availableFeatureOptions"
                  :label="$t('SelectFeature')"
                  outlined
                  dense
                ></v-select>
              
                <v-text-field
                  v-model="featureValue"
                  :label="$t('FeatureValue')"
                  outlined
                  dense
                  :disabled="!selectedFeatureKey"
                  :placeholder="$t('EnterValue')"
                ></v-text-field>
              
                <v-btn
                  block
                  color="primary"
                  @click="addFeature"
                  :disabled="!selectedFeatureKey || !featureValue.trim()"
                >
                  {{ $t('AddFeature') }}
                </v-btn>
              </v-col>
            </v-row>

            <v-list two-line>
              <v-list-item
                v-for="(feature, index) in announcement.features"
                :key="index"
              >
                <v-list-item-title>
                  {{ feature.key }}: {{ feature.value }}
                </v-list-item-title>
                
                <v-list-item-action>
                  <v-btn icon color="error" @click="removeFeature(index)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>

            <v-row justify="center" class="ma-2">
              <v-btn 
                color="next" 
                type="submit"
              >
                {{ $t('AddAnnouncement') }}</v-btn>
            </v-row>
          </form>
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
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { Preferences } from '@capacitor/preferences'
  import axios from 'axios'
  import CategoryOption from '@/components/CategoryOption.vue'
  import NewPlan from '@/components/NewPlan.vue'
  import { useBrandsStore } from '@/stores/brands'
  import { useUsersStore } from '@/stores/users'
  import { useAuthStore } from '@/stores/auth'
  import { useRouter } from 'vue-router'

  const brands = useBrandsStore()
  const users = useUsersStore()
  const auth = useAuthStore()

  const router = useRouter()

  const props = defineProps(['announcementId'])

  let announcement = ref({
        name: '',
        price: 0,
        description: '',
        category: {
          _id: "" 
        },
        img: '',
        ownerId: "",
        brandId: "",
        thumbnails: [],
        features: [],
        planId: "",
        published: false
      }),
      isLoading = ref(false),
      isEdit = ref(false),
      categories = ref([]),
      user = ref(null),
      thumbnail = ref(null),
      mainImg = ref(null),
      newFeature = ref(""),
      brandStore = ref(null),
      userStore = ref(null),
      plans = ref([]),
      sheet = ref(false),
      dialog = ref(false),
      featureOptions = ref(['Year', 'Model', 'Power', 'Color', 'Fuel Type']),
      selectedFeatureKey = ref(''),
      featureValue = ref('')

      const availableFeatureOptions = computed(() => {
        const usedKeys = announcement.value.features.map(f => f.key)
        return featureOptions.value.filter(opt => !usedKeys.includes(opt))
      })

      onMounted(() => {
        getLSUserInfo().then(async (ls) => {
        if (!ls || !ls.user) return
        user.value = ls.user
        console.log('created', announcement.value)
        
        await fetchCategories(ls.user.typeAccount)
        brands.fetchBrands()
      
        // Detect if in edit mode
        isEdit.value = !!props.announcementId;

        if (isEdit.value) {
          await fetchAnnouncement(props.announcementId)
        } else {
          // If adding, initialize empty announcement
          announcement.value = {
            name: '',
            price: 0,
            description: '',
            category: {
              _id: "" 
            },
            img: '',
            ownerId: ls.user._id,
            brandId: null,
            thumbnails: [],
            features: [],
            planId: null,
            published: false
          }
        }
        console.log('u', announcement.value)
        
        fetchPlans()
        })
        
      })

    const selectPlan = async (plan) => {
      console.log('plan', plan)
      announcement.value.planId = plan._id
      const currentDate = new Date();
      currentDate.setMonth(currentDate.getMonth() + plan.duration);
      currentDate.toISOString().split("T")[0]; 
      announcement.value.expirationOfSubscription = currentDate;
    
      console.log('announcement', announcement.value)
      
      try {
        await axios.post('/api/announcements', announcement.value);
      } catch (error) {
        console.error('Error adding announcement:', error);
      }
      router.push(`/billing/`)
    }

    const getLSUserInfo = async () =>{
      const { value } = await Preferences.get({ key: 'userInfo' })
      return JSON.parse(value)
    }

    const fetchCategories = async (typeAccount) => {
      try {
        const response = await axios.post('/api/categories/nested'); // Adjust this to your API endpoint
        categories.value = response.data.filter(e => e.typeAccount === typeAccount)
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }

    const fetchPlans = async () => {
      try {
        const response = await axios.get('/api/plans');
        plans.value = response.data
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }

    const addAnnouncement = () => {
      console.log('addAnnouncement', announcement.value)
      if(user.value.typeAccount === 'seller'){
        const inputTimestamp = new Date(user.value.expirationOfSubscription).getTime()
        const currentTimestamp = new Date().getTime()
        announcement.value.expirationOfSubscription = user.value.expirationOfSubscription
        if(currentTimestamp >= inputTimestamp){
          dialog.value = true
        }else if (currentTimestamp < inputTimestamp){
          announcement.value.paid = true
          createAnnouncement()
        }
      }else if(user.value.typeAccount === 'rented'){
        sheet.value = true
      }
    }

    const createAnnouncement = async() => {
      console.log('createAnnouncement', announcement.value)
      try {
        if(props.announcementId){
          await axios.patch(`/api/announcements/${announcement.value._id}`, announcement.value);
          console.log('Announcement updated successfully!')
          alert('✅ Announcement updated successfully!')
        }else{
          await axios.post('/api/announcements', announcement.value)
          console.log('Announcement added successfully!')
          alert('✅ Announcement added successfully!')
        }
        announcement.value = {
            name: '',
            price: 0,
            description: '',
            category: {
              _id: "" 
            },
            img: '',
            brandId: null,
            thumbnails: [],
            features: [],
            planId: null,
            published: false
          }
      } catch (error) {
        console.error('Error adding announcement:', error);
      }
    }

    const saveImage = (file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        announcement.value.img = e.target.result
      };
      reader.readAsDataURL(mainImg.value)
    }

    const onImageChange = (file) => {
      if (!file) {
        return;
      }
      saveImage(file);
    }

    const fetchAnnouncement = async (id) => {
      try {
        isLoading.value = true
        const response = await axios.get(`/api/announcements/${id}`)
        announcement.value = response.data
      } catch (error) {
        console.error('Error fetching announcement:', error);
      } finally {
        isLoading.value = false
      }
    }

    // Handle File Upload
    const handleFileUpload = (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        announcement.value.thumbnails.push(e.target.result); // Add the base64 image to thumbnails
        console.log('thumbnails', announcement.value.thumbnails)
      };
      reader.readAsDataURL(thumbnail.value)
    }

    // Remove Thumbnail
    const removeThumbnail = (index) => {
      announcement.value.thumbnails.splice(index, 1); // Remove the clicked thumbnail
    }

    const addFeature = () => {
      const trimmedValue = featureValue.value.trim();

      // Check if feature key already exists
      const exists = announcement.value.features.some(
        (feature) => feature.key === selectedFeatureKey.value
      );

      if (selectedFeatureKey.value && trimmedValue && !exists) {
        announcement.value.features.push({
          key: selectedFeatureKey.value,
          value: trimmedValue,
        });

        // Reset inputs
        selectedFeatureKey.value = '';
        featureValue.value = '';
      } else if (exists) {
        // Optional: Notify user about duplication
        this.$toast?.warning(`Feature "${selectedFeatureKey.value}" already exists.`);
      }
    }

  const removeFeature = (index) => {
    announcement.value.features.splice(index, 1);
  }
</script>

<style scoped>
.thumbnail {
  width: 100px;
  height: 100px;
  margin: 8px;
  cursor: pointer;
  border-radius: 8px;
  border: 2px solid transparent;
  transition: border 0.2s ease-in-out, transform 0.2s ease-in-out;
}

.thumbnail:hover {
  border: 2px solid #1976d2; /* Primary color */
  transform: scale(1.05);
}
/* Basic styling for the select box */
.select-box {
  appearance: none; /* Remove default styles */
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: #f3f3f3;
  border-bottom: 1px solid #ccc;
  /* border-radius: 4px; */
  padding: 10px;
  font-size: 16px;
  color: #333;
  width: 100%;
  height: 56px;
  /* max-width: 300px; */
  outline: none;
  cursor: pointer;
  transition: border-color 0.3s ease;
  position: relative;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px top 50%;
  background-size: 16px;
}

/* Hover and focus effects */
.select-box:hover {
  border-color: #888;
}

.select-box:focus {
  border-color: #555;
  box-shadow: 0 0 5px rgba(85, 85, 85, 0.5);
}

.v-list-item-content {
  font-weight: 500;
}
.v-btn {
  border-radius: 8px;
}

</style>
