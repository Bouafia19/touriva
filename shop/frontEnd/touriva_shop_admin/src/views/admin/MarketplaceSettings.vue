<template>
  <v-container fluid class="px-4 px-md-8 py-6">
    <!-- Editorial Page Header -->
    <div class="editorial-page-header">
      <div>
        <div class="editorial-tag mb-1">Global Configuration</div>
        <h1 class="editorial-page-title">Marketplace Settings</h1>
        <p class="editorial-page-subtitle">Configure central platform rules, default commission percentages, support contacts, and approved payment methods.</p>
      </div>

      <div class="d-flex align-center gap-2">
        <v-btn
          variant="outlined"
          class="btn-editorial-outline px-4"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="loadSettings"
        >
          Refresh
        </v-btn>
        <v-btn
          class="btn-editorial-primary px-5"
          prepend-icon="mdi-content-save-outline"
          :loading="saving"
          @click="saveSettings"
        >
          Save Settings
        </v-btn>
      </div>
    </div>

    <!-- Alert Messages -->
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

    <v-row>
      <!-- Left Column: Monetary & Platform Policies -->
      <v-col cols="12" md="7">
        <div class="editorial-card pa-6 mb-6">
          <h2 class="text-subtitle-1 font-weight-bold text-deep-green mb-4">Financial & Commission Policy</h2>

          <v-row>
            <v-col cols="12" sm="6">
              <label class="input-label">Default Platform Commission Rate (%) *</label>
              <v-text-field
                v-model="form.defaultCommissionRate"
                type="number"
                variant="outlined"
                density="comfortable"
                class="editorial-input"
                suffix="%"
                hint="Applied automatically to newly approved vendors"
                persistent-hint
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <label class="input-label">Platform Currency</label>
              <v-text-field
                model-value="DZD (Algerian Dinar)"
                variant="outlined"
                density="comfortable"
                class="editorial-input"
                disabled
              ></v-text-field>
            </v-col>
          </v-row>
        </div>

        <div class="editorial-card pa-6 mb-6">
          <h2 class="text-subtitle-1 font-weight-bold text-deep-green mb-4">Approved Payment Methods</h2>
          <p class="text-caption text-editorial-secondary mb-4">Enable or disable checkout payment rails available to Algerian travelers.</p>

          <v-switch
            v-model="form.enableCod"
            color="forestGreen"
            label="Cash on Delivery (Paiement à la livraison)"
            hide-details
            class="mb-3"
          ></v-switch>

          <v-switch
            v-model="form.enableBaridiMob"
            color="forestGreen"
            label="BaridiMob (Algérie Poste RIP Instant Transfer)"
            hide-details
            class="mb-3"
          ></v-switch>

          <v-switch
            v-model="form.enableCcp"
            color="forestGreen"
            label="CCP / Virement Postal (Manual postal transfer receipt upload)"
            hide-details
            class="mb-3"
          ></v-switch>
        </div>

        <div class="editorial-card pa-6">
          <h2 class="text-subtitle-1 font-weight-bold text-deep-green mb-4">Marketplace Announcement Banner</h2>
          <label class="input-label">Public Notification Bar Message</label>
          <v-textarea
            v-model="form.announcement"
            placeholder="e.g. Welcome to Touriva Marketplace! Discover authentic artisan crafts from Djanet, Ghardaïa, and the Atlas..."
            variant="outlined"
            density="comfortable"
            rows="3"
            class="editorial-input"
          ></v-textarea>
        </div>
      </v-col>

      <!-- Right Column: Support & Governance Info -->
      <v-col cols="12" md="5">
        <div class="editorial-card pa-6 mb-6">
          <h2 class="text-subtitle-1 font-weight-bold text-deep-green mb-4">Central Support Contacts</h2>

          <div class="mb-4">
            <label class="input-label">Support Phone *</label>
            <v-text-field
              v-model="form.supportPhone"
              placeholder="0550 00 00 00"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-phone"
              class="editorial-input"
            ></v-text-field>
          </div>

          <div class="mb-4">
            <label class="input-label">Support Email *</label>
            <v-text-field
              v-model="form.supportEmail"
              placeholder="support@touriva.dz"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-email"
              class="editorial-input"
            ></v-text-field>
          </div>
        </div>

        <div class="editorial-card pa-6 bg-sand-light">
          <div class="d-flex align-center gap-2 mb-3">
            <v-icon icon="mdi-shield-crown-outline" color="#173F35" size="24"></v-icon>
            <span class="text-subtitle-1 font-serif font-weight-bold text-deep-green">Platform Ownership</span>
          </div>
          <p class="text-caption text-editorial-secondary mb-3">
            This instance of Touriva Marketplace is privately owned and operated by <strong>Khaled Bouafia</strong> under the <code>nextchallenge.tech</code> ecosystem.
          </p>
          <p class="text-caption text-editorial-secondary mb-0">
            Vendors join by application only and are subject to mandatory catalog moderation and commission settlements.
          </p>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMarketplaceAdminStore } from '@/stores/marketplaceAdmin'

const adminStore = useMarketplaceAdminStore()

const loading = ref(false)
const saving = ref(false)
const errorMsg = ref(null)
const successMsg = ref(null)

const form = ref({
  defaultCommissionRate: 10,
  supportPhone: '0550 00 00 00',
  supportEmail: 'contact@touriva.dz',
  enableCod: true,
  enableBaridiMob: true,
  enableCcp: true,
  announcement: ''
})

const loadSettings = async () => {
  loading.value = true
  errorMsg.value = null
  try {
    const s = await adminStore.fetchSettings()
    if (s) {
      form.value = {
        defaultCommissionRate: s.defaultCommissionRate ?? 10,
        supportPhone: s.supportPhone || '0550 00 00 00',
        supportEmail: s.supportEmail || 'contact@touriva.dz',
        enableCod: s.enableCod !== false,
        enableBaridiMob: s.enableBaridiMob !== false,
        enableCcp: s.enableCcp !== false,
        announcement: s.announcement || ''
      }
    }
  } catch (err) {
    errorMsg.value = err.response?.data?.message || err.message
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  saving.value = true
  errorMsg.value = null
  successMsg.value = null
  try {
    await adminStore.updateSettings(form.value)
    successMsg.value = 'Marketplace settings updated successfully!'
  } catch (err) {
    errorMsg.value = err.response?.data?.message || err.message
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadSettings()
})
</script>
