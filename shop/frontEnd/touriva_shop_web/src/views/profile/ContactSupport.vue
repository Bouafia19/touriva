<template>
  <v-container 
    fluid 
    class="px-4 py-8 main-container"
  >
    <div class="mb-6">
      <span class="editorial-tag text-sand-dark d-block mb-1">CUSTOMER CARE • SUPPORT</span>
      <h1 class="editorial-heading text-h4 font-weight-bold text-forest">
        {{ $t('contactSupport') }}
      </h1>
      <p class="text-body-2 text-secondary-editorial mt-1">
        Have questions about your order, shipping, or bespoke artisan pieces? Reach out to our team.
      </p>
    </div>

    <v-row>
      <!-- Contact Form -->
      <v-col cols="12" md="7">
        <v-card class="editorial-card pa-6">
          <h2 class="editorial-heading text-h5 font-weight-bold text-forest mb-4">Send Us a Message</h2>
          <v-form @submit.prevent="submitForm">
            <v-text-field
              v-model="form.name"
              :label="$t('firstName') || 'Full Name'"
              variant="outlined"
              density="comfortable"
              color="forestGreen"
              rounded="lg"
              class="mb-3"
              required
            ></v-text-field>
            <v-text-field
              v-model="form.email"
              :label="$t('email')"
              type="email"
              variant="outlined"
              density="comfortable"
              color="forestGreen"
              rounded="lg"
              class="mb-3"
              required
            ></v-text-field>
            <v-text-field
              v-model="form.phone"
              :label="$t('phoneNumber')"
              variant="outlined"
              density="comfortable"
              color="forestGreen"
              rounded="lg"
              class="mb-3"
              required
            ></v-text-field>
            <v-textarea
              v-model="form.message"
              label="How can we help you?"
              variant="outlined"
              density="comfortable"
              color="forestGreen"
              rounded="lg"
              rows="4"
              class="mb-4"
              required
            ></v-textarea>
            <v-btn
              type="submit"
              class="btn-editorial-primary px-8"
              size="large"
              :loading="submitting"
            >
              Send Inquiry
            </v-btn>
          </v-form>
        </v-card>
      </v-col>

      <!-- Contact Info -->
      <v-col cols="12" md="5">
        <v-card class="editorial-card pa-6 mb-6">
          <h2 class="editorial-heading text-h5 font-weight-bold text-forest mb-4">Contact Information</h2>
          <v-list class="bg-transparent">
            <v-list-item class="px-0 mb-3">
              <template #prepend>
                <v-avatar color="sandLight" size="44" class="mr-3">
                  <v-icon color="deepGreen" size="22">mdi-map-marker-outline</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-bold text-forest">Headquarters</v-list-item-title>
              <v-list-item-subtitle class="text-secondary-editorial">Algiers, Algeria</v-list-item-subtitle>
            </v-list-item>

            <v-list-item class="px-0 mb-3">
              <template #prepend>
                <v-avatar color="sandLight" size="44" class="mr-3">
                  <v-icon color="deepGreen" size="22">mdi-phone-outline</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-bold text-forest">Telephone</v-list-item-title>
              <v-list-item-subtitle class="text-secondary-editorial">+213 550 000 000</v-list-item-subtitle>
            </v-list-item>

            <v-list-item class="px-0">
              <template #prepend>
                <v-avatar color="sandLight" size="44" class="mr-3">
                  <v-icon color="deepGreen" size="22">mdi-email-outline</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-bold text-forest">Email Support</v-list-item-title>
              <v-list-item-subtitle class="text-secondary-editorial">support@touriva.com</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>

        <v-card class="editorial-card pa-6 bg-deep-green text-white">
          <div class="d-flex align-center mb-2">
            <v-icon color="sand" size="24" class="mr-2">mdi-clock-outline</v-icon>
            <h3 class="editorial-heading text-h6 font-weight-bold text-white">Customer Support Hours</h3>
          </div>
          <p class="text-body-2 text-sand-light line-height-relaxed">
            Our concierge team is available Saturday to Thursday from 9:00 AM to 6:00 PM (GMT+1) to assist with any order questions.
          </p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Map -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card class="editorial-card overflow-hidden">
          <v-card-text class="pa-0">
            <iframe
              width="100%"
              height="300"
              frameborder="0"
              style="border:0;"
              allowfullscreen
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d102286.38283832167!2d3.003923377759567!3d36.75988981440751!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128fb2f570773d57%3A0x8670df550d53c7a0!2sAlgiers!5e0!3m2!1sen!2sdz!4v1711123456789"
            ></iframe>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from "vue"

const submitting = ref(false)
const form = ref({
  name: "",
  email: "",
  phone: "",
  subject: "Shop Inquiry",
  message: "",
})

const submitForm = () => {
  submitting.value = true
  setTimeout(() => {
    alert("Thank you! Your message has been sent to the Touriva support team.")
    submitting.value = false
    form.value.message = ""
  }, 1000)
}
</script>

<style scoped>
.main-container {
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}
</style>
