<template>
  <v-container 
    fluid 
    class="px-0 main-container"
  >
    <v-row>
      <!-- Contact Form -->
      <v-col cols="12" md="6">
        <v-card elevation="3" class="pa-4">
          <v-card-title class="text-h5">Contact Us</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="submitForm">
              <v-text-field
                v-model="form.name"
                label="Full Name"
                required
              ></v-text-field>
              <v-text-field
                v-model="form.email"
                label="Email"
                type="email"
                required
              ></v-text-field>
              <v-text-field
                v-model="form.phone"
                label="Phone"
                required
              ></v-text-field>
              <v-textarea
                v-model="form.message"
                label="Message"
                required
                rows="3"
              ></v-textarea>
              <v-btn type="submit" color="next" block>Send Message</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Contact Info -->
      <v-col cols="12" md="6">
        <v-card elevation="3" class="pa-4">
          <v-card-title class="text-h5">Our Contact Information</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <template #prepend>
                  <v-icon color="next" class="mr-2">mdi-map-marker</v-icon>
                </template>
                <v-list-item-title>
                  city hachemi nouv 221 lots n° 217, Setif, Algeria
                </v-list-item-title>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon color="next" class="mr-2">mdi-phone</v-icon>
                </template>
                <v-list-item-title>
                  +213 552 56 96 54
                </v-list-item-title>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon color="next" class="mr-2">mdi-email</v-icon>
                </template>
                <v-list-item-title>
                  nextchallenge2021@gmail.com
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Map -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="3">
          <v-card-text class="pa-0">
            <iframe
              width="100%"
              height="300"
              frameborder="0"
              style="border:0;"
              allowfullscreen
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3234.184003798208!2d3.054999815488522!3d36.75399957995842!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128fadcac1234abcd%3A0xabcdef1234567890!2sProlourd%20Algeria!5e0!3m2!1sen!2sdz!4v1711123456789"
            ></iframe>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from "vue"
import axios from 'axios'

const form = ref({
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
});

const submitForm = async () => {
  console.log("Form submitted", form.value)
  try {
    await axios.post("/api/inboxes/", form.value)
  } catch (error) {
    console.log('error', error)
  }
}
</script>

<style scoped>
  iframe {
    border-radius: 10px;
  }

  .main-container {
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
  }
</style>
