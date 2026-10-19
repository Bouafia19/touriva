<template>
  <v-container class="py-8 max-w-700">
    <div class="mb-6">
      <span class="editorial-tag text-sand-dark d-block mb-1">ACCOUNT MANAGEMENT</span>
      <h1 class="editorial-heading text-h4 font-weight-bold text-forest">
        {{ $t('ProfileUpdate') || 'Update Profile' }}
      </h1>
      <p class="text-body-2 text-secondary-editorial mt-1">
        Manage your contact details, language preferences, and personal information.
      </p>
    </div>

    <v-card class="editorial-card pa-6 pa-sm-8" v-if="users.user">
      <form @submit.prevent="submit">
        <!-- Avatar and Camera -->
        <div class="d-flex flex-column align-center mb-6">
          <v-avatar size="120" color="sandLight" class="border-sand mb-3">
            <v-img
              :src="photo || avatarFallback"
              cover
              alt="Profile Image"
            >
              <use-camera @cameraUpload="uploadImage($event)" pageTitle="ProfileUpdate" />
            </v-img>
          </v-avatar>
          <span class="text-caption text-secondary-editorial">Tap avatar to change photo</span>
        </div>

        <!-- Language Preference -->
        <div class="mb-4">
          <label class="editorial-tag text-sand-dark d-block mb-1">{{ $t('cl') || 'Language' }}</label>
          <v-select
            v-model="$i18n.locale"
            :items="locals"
            variant="outlined"
            density="comfortable"
            color="forestGreen"
            rounded="lg"
            hide-details
          >
            <template #item="{ props, item }">
              <v-list-item v-bind="props" :title="$t(item.raw.title)" />
            </template>
            <template #selection="{ item }">
              <span>{{ $t(item.title) }}</span>
            </template>
          </v-select>
        </div>

        <!-- Form fields -->
        <div class="mb-4">
          <label class="editorial-tag text-sand-dark d-block mb-1">{{ $t('firstName') }}</label>
          <v-text-field
            v-model="users.user.firstName"
            variant="outlined"
            density="comfortable"
            color="forestGreen"
            rounded="lg"
            hide-details="auto"
            required
          />
        </div>

        <div class="mb-4">
          <label class="editorial-tag text-sand-dark d-block mb-1">{{ $t('lastName') }}</label>
          <v-text-field
            v-model="users.user.lastName"
            variant="outlined"
            density="comfortable"
            color="forestGreen"
            rounded="lg"
            hide-details="auto"
            required
          />
        </div>

        <div class="mb-6">
          <label class="editorial-tag text-sand-dark d-block mb-1">{{ $t('email') }}</label>
          <v-text-field
            v-model="users.user.email"
            type="email"
            variant="outlined"
            density="comfortable"
            color="forestGreen"
            rounded="lg"
            hide-details="auto"
            required
          />
        </div>

        <!-- Feedback Alerts -->
        <v-alert
          v-if="err"
          type="error"
          variant="tonal"
          rounded="lg"
          density="comfortable"
          class="mb-4 text-caption"
        >
          {{ $t(err) }}
        </v-alert>

        <v-alert
          v-if="info"
          type="success"
          variant="tonal"
          rounded="lg"
          density="comfortable"
          class="mb-4 text-caption"
        >
          {{ $t(info) }}
        </v-alert>

        <!-- Submit Button -->
        <v-btn
          type="submit"
          block
          class="btn-editorial-primary"
          size="large"
          :loading="loading"
        >
          {{ $t('update') || 'Save Changes' }}
        </v-btn>
      </form>
    </v-card>
  </v-container>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useUsersStore } from '@/stores/users'
  import UseCamera from '@/components/UseCamera.vue'

  const { locale } = useI18n()
  const users = useUsersStore()

  const err = ref('')
  const info = ref('')
  const loading = ref(false)
  const image = ref(undefined)
  const photo = ref(null)
  const avatarFallback = ref(new URL('@/assets/avatar.png', import.meta.url).href)

  const locals = ref([
    { value: "ar", title: "arabic" },
    { value: "fr", title: "french" },
    { value: "en", title: "english" }
  ])

  const submit = () => {
    loading.value = true
    try {
      users.updateUserProfile(users.user).then(() => {
        loading.value = false
        info.value = 'Profile updated successfully'
        setTimeout(() => {
          info.value = ''
        }, 5000)
      })
    } catch (error) {
      loading.value = false
      err.value = error.message
    }
  }

  const uploadImage = (e) => {
    photo.value = e
    users.user.photo = e
  }

  onMounted(() => {
    users.loadUser()
  })
</script>

<style scoped>
  .max-w-700 {
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
  }

  .border-sand {
    border: 2px solid var(--color-sand) !important;
  }
</style>