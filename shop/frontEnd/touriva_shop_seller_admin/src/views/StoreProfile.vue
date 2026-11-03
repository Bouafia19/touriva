<template>
  <v-container fluid class="px-4 px-md-8 py-6">
    <!-- Editorial Page Header -->
    <div class="editorial-page-header">
      <div>
        <div class="editorial-tag mb-1">Store Identity</div>
        <h1 class="editorial-page-title">Store Profile & Settings</h1>
        <p class="editorial-page-subtitle">Configure your public vendor storefront details, contact information, and business credentials.</p>
      </div>

      <div class="d-flex align-center gap-2">
        <v-btn
          variant="outlined"
          class="btn-editorial-outline px-4"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="loadProfile"
        >
          Refresh
        </v-btn>
        <v-btn
          class="btn-editorial-primary px-5"
          prepend-icon="mdi-content-save-outline"
          :loading="saving"
          @click="saveProfile"
        >
          Save Changes
        </v-btn>
      </div>
    </div>

    <!-- Alert Messages -->
    <v-alert
      v-if="successMsg"
      type="success"
      variant="tonal"
      closable
      class="mb-4 rounded-lg"
      @click:close="successMsg = null"
    >
      {{ successMsg }}
    </v-alert>

    <v-alert
      v-if="errorMsg"
      type="error"
      variant="tonal"
      closable
      class="mb-4 rounded-lg"
      @click:close="errorMsg = null"
    >
      {{ errorMsg }}
    </v-alert>

    <!-- Main Profile Form -->
    <v-row>
      <!-- Left Column: Store Details -->
      <v-col cols="12" md="8">
        <div class="editorial-card pa-6 mb-6">
          <h2 class="text-subtitle-1 font-weight-bold text-deep-green mb-4">Store Identity</h2>

          <v-row>
            <!-- Store Name -->
            <v-col cols="12" sm="6">
              <label class="input-label">Store Brand Name *</label>
              <v-text-field
                v-model="form.storeName"
                placeholder="e.g. Sahara Expedition Outfitters"
                variant="outlined"
                density="comfortable"
                class="editorial-input"
                required
              ></v-text-field>
            </v-col>

            <!-- Store Slug -->
            <v-col cols="12" sm="6">
              <label class="input-label">Store Slug (URL Identifier)</label>
              <v-text-field
                v-model="form.storeSlug"
                placeholder="sahara-expedition"
                variant="outlined"
                density="comfortable"
                class="editorial-input"
                prefix="market.touriva.dz/store/"
              ></v-text-field>
            </v-col>

            <!-- Phone Number -->
            <v-col cols="12" sm="6">
              <label class="input-label">Customer Support Phone *</label>
              <v-text-field
                v-model="form.phone"
                placeholder="0550 12 34 56"
                variant="outlined"
                density="comfortable"
                class="editorial-input"
                prepend-inner-icon="mdi-phone"
              ></v-text-field>
            </v-col>

            <!-- Wilaya Dropdown -->
            <v-col cols="12" sm="6">
              <label class="input-label">Headquarters Wilaya *</label>
              <v-select
                v-model="form.wilaya"
                :items="algeriaWilayas"
                placeholder="Select Wilaya"
                variant="outlined"
                density="comfortable"
                class="editorial-input"
                prepend-inner-icon="mdi-map-marker-outline"
              ></v-select>
            </v-col>

            <!-- Physical Address -->
            <v-col cols="12">
              <label class="input-label">Physical Address / Workshop Location</label>
              <v-text-field
                v-model="form.address"
                placeholder="Rue de la Liberté, Zone d'activité, Ghardaïa"
                variant="outlined"
                density="comfortable"
                class="editorial-input"
              ></v-text-field>
            </v-col>

            <!-- Bio / Description -->
            <v-col cols="12">
              <label class="input-label">Store Bio & Artisan Story</label>
              <v-textarea
                v-model="form.bio"
                placeholder="Introduce your craft, heritage, regional specialties, and commitment to authentic Algerian travel goods..."
                variant="outlined"
                density="comfortable"
                rows="4"
                class="editorial-input"
              ></v-textarea>
            </v-col>
          </v-row>
        </div>

        <!-- Visual Branding Card -->
        <div class="editorial-card pa-6">
          <h2 class="text-subtitle-1 font-weight-bold text-deep-green mb-4">Visual Branding Assets</h2>

          <v-row>
            <v-col cols="12" sm="6">
              <label class="input-label">Store Logo URL</label>
              <v-text-field
                v-model="form.logoUrl"
                placeholder="https://..."
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-image-outline"
                class="editorial-input"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <label class="input-label">Store Banner Image URL</label>
              <v-text-field
                v-model="form.bannerUrl"
                placeholder="https://..."
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-panorama-outline"
                class="editorial-input"
              ></v-text-field>
            </v-col>
          </v-row>
        </div>
      </v-col>

      <!-- Right Column: Verification & Status Summary -->
      <v-col cols="12" md="4">
        <div class="editorial-card pa-6 mb-6">
          <div class="d-flex align-center justify-space-between mb-4">
            <span class="editorial-tag">Vendor Status</span>
            <span :class="['status-badge', form.isSuspended ? 'status-badge-error' : 'status-badge-success']">
              <span class="status-badge-dot"></span>
              {{ form.isSuspended ? 'Suspended' : 'Active Partner' }}
            </span>
          </div>

          <div class="text-center py-4 border-b">
            <v-avatar size="80" class="border-editorial mb-3 bg-sand-light">
              <v-img v-if="form.logoUrl" :src="form.logoUrl" cover></v-img>
              <v-icon v-else icon="mdi-store" size="40" color="forestGreen"></v-icon>
            </v-avatar>
            <div class="text-h6 font-weight-bold text-deep-green">{{ form.storeName || 'My Store' }}</div>
            <div class="text-caption text-editorial-secondary mt-1">
              {{ form.wilaya ? form.wilaya + ', Algeria' : 'Algeria' }}
            </div>
            <div class="d-flex align-center justify-center gap-1 mt-2">
              <v-icon icon="mdi-star" color="#D9943B" size="18"></v-icon>
              <span class="text-subtitle-2 font-weight-bold text-deep-green">{{ form.rating || 5.0 }}</span>
              <span class="text-caption text-editorial-secondary">({{ form.reviewCount || 0 }} reviews)</span>
            </div>
          </div>

          <div class="pt-4">
            <div class="d-flex justify-space-between text-caption mb-2">
              <span class="text-editorial-secondary">Commission Tier:</span>
              <span class="font-weight-bold text-deep-green">{{ form.commissionRate || 10 }}% standard</span>
            </div>
            <div class="d-flex justify-space-between text-caption mb-2">
              <span class="text-editorial-secondary">Partner Verified:</span>
              <span class="font-weight-bold text-forest">Yes (Official)</span>
            </div>
            <div class="d-flex justify-space-between text-caption">
              <span class="text-editorial-secondary">Marketplace Network:</span>
              <span class="font-weight-bold text-deep-green">Touriva Algeria</span>
            </div>
          </div>
        </div>

        <div class="editorial-card pa-5 bg-sand-light">
          <div class="d-flex align-center gap-2 mb-2">
            <v-icon icon="mdi-shield-check" color="#173F35" size="20"></v-icon>
            <span class="text-subtitle-2 font-weight-bold text-deep-green">Commercial Guarantee</span>
          </div>
          <p class="text-caption text-editorial-secondary mb-0">
            All merchandise listed by your store is covered under Touriva's national artisan protection pledge. Payouts are guaranteed upon delivery confirmation.
          </p>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSellerStore } from '@/stores/seller'

const sellerStore = useSellerStore()

const loading = ref(false)
const saving = ref(false)
const successMsg = ref(null)
const errorMsg = ref(null)

const form = ref({
  storeName: '',
  storeSlug: '',
  phone: '',
  wilaya: 'Algiers',
  address: '',
  bio: '',
  logoUrl: '',
  bannerUrl: '',
  isSuspended: false,
  rating: 5,
  reviewCount: 0,
  commissionRate: 10
})

const algeriaWilayas = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
  'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Algiers',
  'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
  'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
  'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
  'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
  'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal', 'Béni Abbès',
  'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', 'El M\'Ghair', 'El Meniaa'
]

const loadProfile = async () => {
  loading.value = true
  errorMsg.value = null
  try {
    const profile = await sellerStore.fetchProfile()
    if (profile) {
      form.value = {
        storeName: profile.storeName || '',
        storeSlug: profile.storeSlug || '',
        phone: profile.phone || '',
        wilaya: profile.wilaya || 'Algiers',
        address: profile.address || '',
        bio: profile.bio || '',
        logoUrl: profile.logoUrl || '',
        bannerUrl: profile.bannerUrl || '',
        isSuspended: profile.isSuspended || false,
        rating: profile.rating || 5,
        reviewCount: profile.reviewCount || 0,
        commissionRate: profile.commissionRate || 10
      }
    }
  } catch (err) {
    errorMsg.value = err.response?.data?.message || err.message
  } finally {
    loading.value = false
  }
}

const saveProfile = async () => {
  saving.value = true
  successMsg.value = null
  errorMsg.value = null
  try {
    await sellerStore.updateProfile(form.value)
    successMsg.value = 'Store profile updated successfully!'
  } catch (err) {
    errorMsg.value = err.response?.data?.message || err.message
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>
