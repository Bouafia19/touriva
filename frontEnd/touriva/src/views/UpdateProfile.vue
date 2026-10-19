<template>
  <div class="editorial-catalog bg-warm-ivory min-vh-100 py-10 px-4">
    <v-container class="max-w-container">
      <v-row justify="center">
        <v-col cols="12" sm="10" md="7" lg="6">
          <v-card class="editorial-card pa-8 pa-md-10" elevation="0">
            <div class="text-center mb-6">
              <div class="editorial-tag text-sand mb-1">ACCOUNT SETTINGS</div>
              <h1 class="text-h4 font-serif font-weight-bold text-forest mb-2">
                {{ $t('profile') || 'User Profile & Preferences' }}
              </h1>
              <p class="text-caption text-secondary-editorial max-w-prose mx-auto">
                Manage your personal details, language preference, and platform credentials.
              </p>
            </div>

            <!-- Avatar Section -->
            <div class="text-center mb-8">
              <div class="position-relative d-inline-block">
                <v-avatar size="110" color="#F5EDE0" class="border-sand elevation-2">
                  <v-img :src="photo || avatar" cover />
                </v-avatar>
                <div class="mt-2">
                  <use-camera v-on:cameraUpload="uploadImage($event)" pageTitle="ProfileUpdate" />
                </div>
              </div>
            </div>

            <v-alert v-if="err" type="error" variant="tonal" class="mb-4 rounded-lg">
              {{ $t(err) || err }}
            </v-alert>

            <v-alert v-if="info" type="success" variant="tonal" class="mb-4 rounded-lg">
              {{ $t(info) || info }}
            </v-alert>

            <form @submit.prevent="submit" v-if="users.getUser">
              <div class="mb-4">
                <div class="text-caption font-weight-bold text-forest mb-1">FIRST NAME *</div>
                <v-text-field
                  v-model="users.user.firstName"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  color="#173F35"
                  hide-details
                  required
                />
              </div>

              <div class="mb-4">
                <div class="text-caption font-weight-bold text-forest mb-1">LAST NAME *</div>
                <v-text-field
                  v-model="users.user.lastName"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  color="#173F35"
                  hide-details
                  required
                />
              </div>

              <div class="mb-4">
                <div class="text-caption font-weight-bold text-forest mb-1">EMAIL ADDRESS *</div>
                <v-text-field
                  v-model="users.user.email"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  color="#173F35"
                  type="email"
                  hide-details
                  required
                />
              </div>

              <div class="mb-6">
                <div class="text-caption font-weight-bold text-forest mb-1">PREFERRED LANGUAGE</div>
                <v-select
                  v-model="$i18n.locale"
                  :items="locals"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  color="#173F35"
                  hide-details
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props" :title="$t(item.raw.title)"></v-list-item>
                  </template>
                  <template v-slot:selection="{ item }">
                    <span>{{ $t(item.title) }}</span>
                  </template>
                </v-select>
              </div>

              <v-btn
                type="submit"
                block
                color="#173F35"
                size="large"
                rounded="pill"
                class="btn-editorial-primary font-weight-bold"
                :loading="loading"
              >
                {{ $t('update') || 'Save Profile Changes' }}
              </v-btn>
            </form>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUsersStore } from '@/stores/users'
import UseCamera from '@/components/UseCamera.vue'

const { t, locale } = useI18n()
const users = useUsersStore()

const locals = ref([
  { value: 'ar', title: 'arabic' },
  { value: 'fr', title: 'french' },
  { value: 'en', title: 'english' }
])

const photo = ref(null)
const avatar = ref(new URL('@/assets/avatar.png', import.meta.url).href)
const err = ref('')
const info = ref('')
const loading = ref(false)

const uploadImage = (imageData) => {
  photo.value = imageData
  if (users.user) {
    users.user.photo = imageData
  }
}

const submit = async () => {
  loading.value = true
  err.value = ''
  info.value = ''
  try {
    await users.updateUserProfile(users.user)
    info.value = 'Profile updated successfully'
  } catch (e) {
    err.value = e.message || 'Failed to update profile'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await users.loadUser()
  if (users.user?.photo) {
    photo.value = users.user.photo
  }
})
</script>

<style scoped>
.max-w-container {
  max-width: 1000px;
}

.max-w-prose {
  max-width: 500px;
}
</style>