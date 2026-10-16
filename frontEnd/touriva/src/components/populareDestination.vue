<template>
  <v-container class="py-8">
    <h1 class="text-center mb-6">Algerian Cities</h1>

    <v-row
      dense
      align="stretch"
    >
      <v-col
        v-for="city in cities"
        :key="city.name"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card
          class="mx-auto"
          max-width="220"
          elevation="3"
        >
          <v-img
            :src="city.img"
            height="120"
            cover
          ></v-img>

          <v-card-title class="text-center text-h6 py-2">
            {{ city.name }}
          </v-card-title>

          <v-card-text class="text-body-2 text-center">
            Population: {{ city.population }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const cities = [
  { name: "Algiers", population: "3,900,000", img: "https://picsum.photos/300?1" },
  { name: "Oran", population: "1,500,000", img: "https://picsum.photos/300?2" },
  { name: "Constantine", population: "900,000", img: "https://picsum.photos/300?3" },
  { name: "Annaba", population: "700,000", img: "https://picsum.photos/300?4" }
];
</script>
