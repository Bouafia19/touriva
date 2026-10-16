<template>
<v-container>
  <h1>{{ $t('TripSubscriptions') }}</h1>

  <v-expansion-panels variant="accordion">
    <v-expansion-panel
      v-for="group in subscriptions"
      :key="group.name"
    >
      <!-- PANEL HEADER -->
      <v-expansion-panel-title>
        <div class="d-flex align-center justify-space-between w-100">
          <span class="font-weight-medium">
            {{ group.name }}
          </span>

          <v-chip size="small" color="primary" variant="flat">
            {{ group.subscriptions.length }}
          </v-chip>
        </div>
      </v-expansion-panel-title>

      <!-- PANEL CONTENT -->
      <v-expansion-panel-text>
        <v-data-table
          :headers="headers"
          :items="group.subscriptions"
          item-key="_id"
          density="compact"
          hide-default-footer
        >
          <template #item.fullName="{ item }">
            {{ item.fullName }}
          </template>

          <template #item.phone="{ item }">
            {{ item.phone }}
          </template>

          <template #item.createdAt="{ item }">
            {{ new Date(item.createdAt).toLocaleString() }}
          </template>
        </v-data-table>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>

</v-container>
</template>

<script setup>
  import axios from 'axios'
  import { onMounted, ref } from 'vue'

  const subscriptions = ref([])

  const headers = [
    // { title: 'Trip', key: 'trip' },
    { title: 'Full Name', key: 'fullName' },
    { title: 'Phone', key: 'phone' },
    { title: 'Date', key: 'createdAt' }
  ]

  onMounted(async () => {
    const res = await axios.get('/api/tripSubscriptions')
    console.log('res.data', res.data)
    subscriptions.value = res.data
  })

</script>