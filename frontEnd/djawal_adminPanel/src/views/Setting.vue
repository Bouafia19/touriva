<template>
  <company />
  <!-- <ads /> -->
</template>

<script>
  import Company from '@/views/Company.vue'
  import Ads from '@/views/Settings/AdsSettings.vue'

  export default {
    components: {
      'company': Company,
      'ads': Ads
    },
  }
</script>