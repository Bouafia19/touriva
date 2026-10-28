<template>
  <div class="editorial-catalog bg-warm-ivory min-vh-100 pb-16">
    <!-- Header Banner -->
    <div class="catalog-hero py-10 px-4 border-b border-subtle bg-white">
      <v-container class="max-w-container">
        <div class="editorial-tag mb-1">TRAVELER ASSISTANCE & INQUIRIES</div>
        <h1 class="text-h3 font-serif font-weight-bold text-forest mb-2">
          {{ $t('contactSupport') || 'Contact & Concierge Support' }}
        </h1>
        <p class="text-secondary-editorial max-w-prose mb-0">
          Our dedicated tourism concierge team is here to assist travelers, certified guides, and partner agencies across Algeria.
        </p>
      </v-container>
    </div>

    <v-container class="max-w-container py-8">
      <v-row>
        <!-- Contact Form Card -->
        <v-col cols="12" md="7">
          <v-card class="editorial-card pa-6 pa-md-8 h-100" elevation="0">
            <div class="editorial-tag text-sand mb-1">GET IN TOUCH</div>
            <h2 class="text-h5 font-serif font-weight-bold text-forest mb-4">
              Send Us a Message
            </h2>
            <p class="text-caption text-secondary-editorial mb-6">
              Have a question about an excursion reservation, landmark accessibility, or guide certification? We typically respond within 24 hours.
            </p>

            <v-form @submit.prevent="submitForm">
              <div class="mb-4">
                <div class="text-caption font-weight-bold text-forest mb-1">FULL NAME *</div>
                <v-text-field
                  v-model="form.name"
                  placeholder="e.g. Youcef Boualem"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  color="#173F35"
                  required
                  hide-details
                />
              </div>

              <div class="mb-4">
                <div class="text-caption font-weight-bold text-forest mb-1">EMAIL ADDRESS *</div>
                <v-text-field
                  v-model="form.email"
                  type="email"
                  placeholder="e.g. youcef@example.com"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  color="#173F35"
                  required
                  hide-details
                />
              </div>

              <div class="mb-4">
                <div class="text-caption font-weight-bold text-forest mb-1">INQUIRY TOPIC</div>
                <v-select
                  v-model="form.subject"
                  :items="topics"
                  placeholder="Select inquiry category"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  color="#173F35"
                  hide-details
                />
              </div>

              <div class="mb-6">
                <div class="text-caption font-weight-bold text-forest mb-1">MESSAGE *</div>
                <v-textarea
                  v-model="form.message"
                  placeholder="Describe your inquiry or question in detail..."
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  color="#173F35"
                  rows="4"
                  required
                  hide-details
                />
              </div>

              <v-btn
                type="submit"
                color="#173F35"
                size="large"
                rounded="pill"
                class="btn-editorial-primary font-weight-bold px-8"
                :loading="submitting"
              >
                <v-icon start size="18">mdi-send-outline</v-icon>
                Send Message
              </v-btn>
            </v-form>
          </v-card>
        </v-col>

        <!-- Information & Direct Channels -->
        <v-col cols="12" md="5">
          <v-card class="editorial-card pa-6 pa-md-8 bg-deep-green text-white mb-6" elevation="0">
            <div class="editorial-tag text-sand mb-1">OFFICIAL CONTACT</div>
            <h3 class="text-h5 font-serif font-weight-bold text-white mb-4">
              Touriva Headquarters
            </h3>
            <p class="text-sand-light text-caption mb-6">
              National tourism platform coordinating excursions, verified boutique stays, and cultural heritage promotion across all 58 Algerian Wilayas.
            </p>

            <div class="d-flex align-start mb-4">
              <v-icon color="#D9B98C" class="mr-3 mt-1" size="20">mdi-map-marker-outline</v-icon>
              <div>
                <div class="text-caption text-sand font-weight-bold">OFFICE LOCATION</div>
                <div class="text-body-2 text-white">Didouche Mourad Avenue, Algiers, Algeria</div>
              </div>
            </div>

            <div class="d-flex align-start mb-4">
              <v-icon color="#D9B98C" class="mr-3 mt-1" size="20">mdi-phone-outline</v-icon>
              <div>
                <div class="text-caption text-sand font-weight-bold">DIRECT TELEPHONE</div>
                <div class="text-body-2 text-white">+213 (0) 550 000 000</div>
              </div>
            </div>

            <div class="d-flex align-start mb-6">
              <v-icon color="#D9B98C" class="mr-3 mt-1" size="20">mdi-email-outline</v-icon>
              <div>
                <div class="text-caption text-sand font-weight-bold">CONCIERGE INQUIRIES</div>
                <div class="text-body-2 text-white">support@touriva.com</div>
              </div>
            </div>

            <v-divider class="my-4 border-sand-subtle"></v-divider>

            <div class="d-flex align-center justify-space-between">
              <span class="text-caption text-sand-light">HOURS: Sun - Thu, 08:30 - 17:30</span>
              <v-chip size="x-small" color="#21866B" variant="flat" class="text-white font-weight-bold">
                OPERATIONAL
              </v-chip>
            </div>
          </v-card>

          <!-- Map Card (OpenStreetMap) -->
          <v-card class="editorial-card overflow-hidden" elevation="0">
            <iframe
              width="100%"
              height="240"
              frameborder="0"
              style="border:0; display:block;"
              allowfullscreen
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              src="https://www.openstreetmap.org/export/embed.html?bbox=3.046086%2C36.758132%2C3.066086%2C36.778132&amp;layer=mapnik&amp;marker=36.768132%2C3.056086"
            ></iframe>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="snackbar"
      color="#173F35"
      location="top"
      rounded="pill"
      :timeout="4000"
    >
      <div class="d-flex align-center">
        <v-icon color="#D9B98C" class="mr-2">mdi-check-decagram</v-icon>
        <span class="font-weight-bold">Your message has been received! Our concierge team will reach out shortly.</span>
      </div>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  name: '',
  email: '',
  subject: 'Excursion Booking Inquiry',
  message: ''
})

const submitting = ref(false)
const snackbar = ref(false)

const topics = [
  'Excursion Booking Inquiry',
  'Certified Guide Partnership',
  'Hotel or Restaurant Listing',
  'Technical Platform Support',
  'Custom Saharan Expedition Planning'
]

const submitForm = () => {
  if (!form.value.name || !form.value.email || !form.value.message) return
  submitting.value = true
  setTimeout(() => {
    submitting.value = false
    snackbar.value = true
    form.value = {
      name: '',
      email: '',
      subject: 'Excursion Booking Inquiry',
      message: ''
    }
  }, 600)
}
</script>

<style scoped>
.editorial-catalog {
  min-height: 100vh;
}

.max-w-container {
  max-width: 1200px;
}

.max-w-prose {
  max-width: 600px;
}

.catalog-hero {
  background: #FFFFFF;
}

.border-subtle {
  border-color: #E7E8E1 !important;
}

.border-sand-subtle {
  border-color: rgba(217, 185, 140, 0.2) !important;
}
</style>