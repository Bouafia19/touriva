<template>
  <div class="location-view pa-4 pa-sm-6">
    <!-- Page Header -->
    <div class="mb-6">
      <div class="editorial-tag text-sand-dark mb-1">
        GEOGRAPHIC DIRECTORY
      </div>
      <div class="d-flex flex-wrap align-center justify-space-between gap-4">
        <div>
          <h1 class="font-serif text-h4 font-weight-bold text-forest mb-1">
            {{ $t('Location') || 'Wilayas, Daïras & Communes' }}
          </h1>
          <p class="text-body-2 text-secondary-editorial mb-0">
            {{ $t('Manage Algerian territorial subdivisions and import administrative datasets.') }}
          </p>
        </div>

        <!-- Quick Stats -->
        <div class="d-flex align-center gap-3">
          <div class="stat-pill px-4 py-2 bg-white rounded-pill border-editorial d-flex align-center">
            <v-icon icon="mdi-map-marker-multiple" size="18" color="sandDark" class="mr-2"></v-icon>
            <span class="text-caption font-weight-bold text-forest">
              {{ wilayas.getWilayas?.length || 0 }} {{ $t('Wilayas') }}
            </span>
          </div>
          <div class="stat-pill px-4 py-2 bg-white rounded-pill border-editorial d-flex align-center">
            <v-icon icon="mdi-map-marker-path" size="18" color="sandDark" class="mr-2"></v-icon>
            <span class="text-caption font-weight-bold text-forest">
              {{ daira.getDairas?.length || 0 }} {{ $t('Dairas') }}
            </span>
          </div>
          <div class="stat-pill px-4 py-2 bg-white rounded-pill border-editorial d-flex align-center">
            <v-icon icon="mdi-home-city-outline" size="18" color="sandDark" class="mr-2"></v-icon>
            <span class="text-caption font-weight-bold text-forest">
              {{ commune.getCommunes?.length || 0 }} {{ $t('Communes') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- CSV Bulk Import Section -->
    <v-card class="editorial-card mb-6 pa-5 bg-white">
      <div class="d-flex flex-wrap align-center justify-space-between gap-4 mb-3">
        <div class="d-flex align-center">
          <v-avatar size="40" color="sandLight" class="mr-3">
            <v-icon icon="mdi-file-delimited-outline" color="sandDark" size="22"></v-icon>
          </v-avatar>
          <div>
            <h3 class="font-serif text-subtitle-1 font-weight-bold text-forest mb-0">
              {{ $t('Bulk CSV Dataset Import') }}
            </h3>
            <span class="text-caption text-secondary-editorial">
              {{ $t('Import territorial hierarchies using a structured CSV file') }}
            </span>
          </div>
        </div>

        <v-chip size="small" variant="tonal" color="info" prepend-icon="mdi-information-outline">
          Format: Wilaya, Daira, Commune
        </v-chip>
      </div>

      <!-- Import Feedback Alerts -->
      <v-alert
        v-if="uploadSuccess"
        type="success"
        variant="tonal"
        density="comfortable"
        closable
        class="mb-3 rounded-lg"
        @click:close="uploadSuccess = false"
      >
        {{ $t('CSV data imported successfully! Territories have been updated.') }}
      </v-alert>

      <v-alert
        v-if="uploadError"
        type="error"
        variant="tonal"
        density="comfortable"
        closable
        class="mb-3 rounded-lg"
        @click:close="uploadError = ''"
      >
        {{ uploadError }}
      </v-alert>

      <!-- File Input & Import Trigger -->
      <v-row align="center">
        <v-col cols="12" md="8">
          <v-file-input
            v-model="csvfile"
            accept=".csv"
            :label="$t('Select CSV File')"
            variant="outlined"
            density="comfortable"
            prepend-icon="mdi-paperclip"
            hide-details
            rounded="pill"
            color="primary"
            :disabled="isUploading"
            @update:modelValue="onFileSelected"
          ></v-file-input>
        </v-col>
        <v-col cols="12" md="4" class="d-flex justify-end">
          <v-btn
            class="btn-editorial-primary w-100"
            rounded="pill"
            prepend-icon="mdi-cloud-upload-outline"
            :loading="isUploading"
            :disabled="!hasFile"
            @click="handleFileUpload"
          >
            {{ $t('Import Dataset') }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- Wilayas & Subdivisions Manager -->
    <wilaya />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWilayasStore } from '@/stores/wilaya'
import { useDairasStore } from '@/stores/daira'
import { useCommunesStore } from '@/stores/commune'
import Papa from 'papaparse'
import wilaya from '@/components/wilaya.vue'

const wilayas = useWilayasStore()
const daira = useDairasStore()
const commune = useCommunesStore()

const csvfile = ref(null)
const isUploading = ref(false)
const uploadSuccess = ref(false)
const uploadError = ref('')

const hasFile = computed(() => {
  if (Array.isArray(csvfile.value)) return csvfile.value.length > 0
  return !!csvfile.value
})

const onFileSelected = () => {
  uploadSuccess.value = false
  uploadError.value = ''
}

const handleFileUpload = () => {
  let fileToParse = null
  if (Array.isArray(csvfile.value)) {
    fileToParse = csvfile.value[0]
  } else {
    fileToParse = csvfile.value
  }

  if (!fileToParse) {
    uploadError.value = 'Please select a CSV file first'
    return
  }

  isUploading.value = true
  uploadSuccess.value = false
  uploadError.value = ''

  Papa.parse(fileToParse, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      try {
        const jsonData = results.data
        if (!jsonData || jsonData.length === 0) {
          uploadError.value = 'CSV file contains no records'
          isUploading.value = false
          return
        }

        // Audit Item 7 fix: do NOT call deleteMultWilayas() to avoid wiping existing wilayas
        await wilayas.addMultWilayas({ data: jsonData })
        await Promise.all([
          wilayas.fetchWilayas(),
          daira.fetchDairas(),
          commune.fetchCommunes()
        ])

        uploadSuccess.value = true
        csvfile.value = null
      } catch (err) {
        uploadError.value = err?.message || 'Error processing CSV dataset'
      } finally {
        isUploading.value = false
      }
    },
    error: (error) => {
      uploadError.value = error?.message || 'Error parsing CSV file'
      isUploading.value = false
    }
  })
}

onMounted(() => {
  wilayas.fetchWilayas()
  daira.fetchDairas()
  commune.fetchCommunes()
})
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}
.gap-4 {
  gap: 16px;
}

.stat-pill {
  transition: all 0.2s ease;
}
.stat-pill:hover {
  border-color: var(--color-sand) !important;
  transform: translateY(-2px);
}
</style>