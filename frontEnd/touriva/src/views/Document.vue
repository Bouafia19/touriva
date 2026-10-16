<template>
  <v-container fluid :class="containerClass">

    <!-- Loading -->
    <div v-if="loading" class="text-center">
      <v-row
        class="d-flex justify-center align-center"
        style="height: 80vh"
      >
        <v-progress-circular
          indeterminate
          color="next"
        />
      </v-row>
    </div>

    <!-- Content -->
    <div v-else>
      <h1>{{ $t(users.getTitle) }}</h1>
      <!-- Preview / Placeholder -->
      <div class="image-wrapper mt-3 text-center">

        <div class="image-container">

          <!-- Image Preview -->
          <v-img
            v-if="users.getPhoto"
            :src="users.getPhoto"
            max-height="300"
            cover
          />

          <!-- Placeholder -->
          <div
            v-else
            class="image-placeholder"
            @click="$refs.fileInput.click()"
          >
            <v-icon size="48" color="grey">
              mdi-camera
            </v-icon>

            <span class="placeholder-text">
              {{ $t('clickToUploadImage') }}
            </span>
          </div>

          <!-- Document title overlay -->
          <!-- <div class="document-title">
            {{ $t(users.getTitle) }}
          </div> -->

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

      <!-- Error -->
      <div class="text-center ma-2">
        <v-alert
          dense
          rounded
          type="error"
          v-if="err"
        >
          {{ $t(err) }}
        </v-alert>
      </div>

      <!-- Camera -->
      <use-camera
        @cameraUpload="uploadImage"
        pageTitle="document"
      />

      <!-- Back -->
      <div class="text-center mt-4">
        <v-btn
          color="next"
          block
          dark
          @click="$router.go(-1)"
        >
          {{ $t('submit') }}
        </v-btn>
      </div>

    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUsersStore } from '@/stores/users'
import { useDisplay } from 'vuetify'
import UseCamera from '@/components/UseCamera.vue'

const users = useUsersStore()
const display = useDisplay()

const loading = ref(false)
const err = ref('')
const fileInput = ref(null)

/* Upload from file picker */
const onFileSelected = (e) => {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    uploadImage(event.target.result)
  }
  reader.readAsDataURL(file)
}

/* Upload logic */
const uploadImage = (img64) => {
  loading.value = true

  users.uploadPartnerImages({
    [users.getTitle]: img64,
    name: users.getTitle
  })
  .then(() => {
    users.photo = img64
    users.images[users.getTitle] = img64
    loading.value = false
  })
  .catch((error) => {
    err.value = error
    loading.value = false
  })
}

/* Responsive container */
const containerClass = computed(() => {
  if (display.xs.value) return 'custom-width-xs'
  if (display.sm.value) return 'custom-width-sm'
  if (display.md.value) return 'custom-width-md'
  if (display.lg.value || display.xl.value) return 'custom-width-lg'
  return ''
})

onMounted(() => {
  if (users.photo) {
    users.photo = users.photo
  }
})
</script>

<style scoped>
/* Container sizes */
.custom-width-xs { max-width: 100%; }
.custom-width-sm { max-width: 540px; }
.custom-width-md { max-width: 720px; }
.custom-width-lg { max-width: 960px; }

/* Preview container */
.image-container {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}

/* Title overlay */
.document-title {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  text-align: center;
  pointer-events: none;
}

/* Placeholder */
.image-placeholder {
  height: 220px;
  border: 2px dashed #ccc;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: 8px;
}

.placeholder-text {
  color: #777;
  font-size: 14px;
}
</style>
