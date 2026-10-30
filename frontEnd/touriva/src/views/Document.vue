<template>
  <div class="document-upload-page bg-warm-ivory py-10 px-4 min-h-screen d-flex align-center justify-center">
    <v-container class="max-w-md">
      <!-- Back Button -->
      <div class="mb-4">
        <v-btn
          variant="text"
          density="comfortable"
          class="text-forest text-body-2 font-weight-medium"
          @click="$router.go(-1)"
        >
          <v-icon start>mdi-arrow-left</v-icon>
          {{ $t('backToDossier') || 'Back to Dossier' }}
        </v-btn>
      </div>

      <!-- Card -->
      <v-card class="editorial-card pa-6 pa-md-8 elevation-1">
        <!-- Loading -->
        <div v-if="loading" class="text-center py-12">
          <v-progress-circular
            indeterminate
            color="#21866B"
            size="48"
          />
          <p class="text-secondary-editorial text-caption mt-4">Uploading and verifying document...</p>
        </div>

        <!-- Content -->
        <div v-else>
          <div class="editorial-tag text-emerald mb-2">
            ACCREDITATION DOCUMENT
          </div>

          <h2 class="editorial-title text-forest mb-2">
            {{ $t(users.getTitle) }}
          </h2>

          <p class="text-secondary-editorial text-body-2 mb-6">
            {{ $t('documentUploadInstructions') || 'Upload a clear, readable scan or photograph of your document. Make sure all edges and text are clearly visible.' }}
          </p>

          <!-- Preview / Placeholder -->
          <div class="image-wrapper mb-6">
            <div class="image-container">
              <!-- Image Preview -->
              <div v-if="users.getPhoto" class="preview-box position-relative">
                <v-img
                  :src="users.getPhoto"
                  max-height="280"
                  cover
                  class="rounded-lg border-editorial"
                />
                <v-btn
                  size="small"
                  color="#173F35"
                  icon
                  class="replace-btn"
                  @click="$refs.fileInput.click()"
                >
                  <v-icon size="18">mdi-camera-retake-outline</v-icon>
                </v-btn>
              </div>

              <!-- Placeholder -->
              <div
                v-else
                class="image-placeholder rounded-lg d-flex flex-column align-center justify-center pa-8 cursor-pointer"
                @click="$refs.fileInput.click()"
              >
                <div class="icon-circle bg-sand-light d-flex align-center justify-center mb-3">
                  <v-icon size="32" color="#173F35">
                    mdi-cloud-upload-outline
                  </v-icon>
                </div>
                <div class="font-weight-bold text-forest text-body-2 mb-1">
                  {{ $t('clickToUploadImage') || 'Select Document File' }}
                </div>
                <div class="text-caption text-secondary-editorial">
                  Supports JPG, PNG or PDF scans
                </div>
              </div>
            </div>

            <!-- Hidden file input -->
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              hidden
              @change="onFileSelected"
            />
          </div>

          <!-- Error Alert -->
          <v-alert
            v-if="err"
            type="error"
            variant="tonal"
            class="mb-6 rounded-lg text-body-2"
          >
            {{ $t(err) }}
          </v-alert>

          <!-- Camera Integration -->
          <div class="mb-4">
            <use-camera
              @cameraUpload="uploadImage"
              pageTitle="document"
            />
          </div>

          <!-- Return / Save Button -->
          <v-btn
            class="btn-editorial-primary"
            block
            size="large"
            @click="$router.go(-1)"
          >
            <v-icon start>mdi-check</v-icon>
            {{ $t('confirmAndSave') || 'Confirm & Save Document' }}
          </v-btn>
        </div>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUsersStore } from '@/stores/users'
import UseCamera from '@/components/UseCamera.vue'

const users = useUsersStore()
const loading = ref(false)
const err = ref('')
const fileInput = ref(null)

/* Upload from file picker */
const onFileSelected = (e) => {
  const file = e.target.files[0]
  if (!file) return

  // Prevent selecting files > 4MB (translates to ~5.3MB in Base64) to prevent BSON document overflow
  if (file.size > 4 * 1024 * 1024) {
    err.value = 'Le fichier sélectionné dépasse la taille limite de 4 Mo. Veuillez sélectionner un fichier optimisé.'
    return
  }

  const reader = new FileReader()
  reader.onload = (event) => {
    uploadImage(event.target.result)
  }
  reader.readAsDataURL(file)
}

/* Upload logic */
const uploadImage = (img64) => {
  loading.value = true
  err.value = ''

  users.uploadPartnerImages({
    [users.getTitle]: img64,
    name: users.getTitle
  })
  .then(() => {
    users.photo = img64
    if (!users.images) users.images = {}
    users.images[users.getTitle] = img64
    loading.value = false
  })
  .catch((error) => {
    err.value = error?.message || 'Failed to upload document'
    loading.value = false
  })
}

onMounted(() => {
  if (users.photo) {
    users.photo = users.photo
  }
})
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}

.max-w-md {
  max-width: 540px;
}

.image-placeholder {
  border: 2px dashed #D9B98C;
  background-color: #FAF8F2;
  transition: all 0.2s ease;
}

.image-placeholder:hover {
  border-color: #21866B;
  background-color: #F4F6F4;
}

.icon-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 1px solid rgba(217, 185, 140, 0.4);
}

.replace-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.cursor-pointer {
  cursor: pointer;
}
</style>
