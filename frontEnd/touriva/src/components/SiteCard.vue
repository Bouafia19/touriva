<template>
  <v-card
    class="editorial-card h-100 d-flex flex-column"
    elevation="0"
    @click="goToDetails"
  >
    <div class="position-relative overflow-hidden">
      <v-img
        :src="imageUrl"
        height="220"
        cover
        eager
        class="img-editorial-zoom cursor-pointer"
      >
        <template #placeholder>
          <div class="d-flex fill-height align-center justify-center bg-grey-lighten-4">
            <v-progress-circular indeterminate color="#21866B" size="28" />
          </div>
        </template>
      </v-img>

      <div class="editorial-scrim"></div>

      <!-- Rating Badge -->
      <div class="position-absolute top-0 right-0 pa-3" v-if="site.rating">
        <span class="editorial-badge">
          <v-icon size="14" color="#D9B98C" class="mr-1">mdi-star</v-icon>
          {{ Number(site.rating).toFixed(1) }}
        </span>
      </div>

      <!-- Category Tag -->
      <div class="position-absolute top-0 left-0 pa-3">
        <span class="editorial-category-badge">
          <v-icon size="13" color="#FAF8F2" class="mr-1">mdi-pillar</v-icon>
          {{ $t('Heritage') || 'Attraction' }}
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="pa-4 flex-grow-1 d-flex flex-column justify-space-between">
      <div>
        <h3 class="text-h6 font-weight-bold text-forest mb-1 line-clamp-1">
          {{ siteName }}
        </h3>
        <div class="d-flex align-center text-caption text-secondary-editorial mb-2">
          <v-icon size="15" color="#21866B" class="mr-1">mdi-map-marker</v-icon>
          <span class="text-truncate">{{ siteAddress }}</span>
        </div>
        <p v-if="site.description" class="text-caption text-secondary-editorial line-clamp-2 mb-3">
          {{ site.description }}
        </p>
      </div>

      <div class="mt-auto pt-2">
        <v-btn
          block
          variant="outlined"
          color="#173F35"
          size="small"
          rounded="pill"
          class="btn-editorial-outline text-capitalize font-weight-bold"
        >
          {{ $t('DiscoverSite') || 'Explore Site' }}
          <v-icon end size="16">mdi-arrow-right</v-icon>
        </v-btn>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlacesStore } from '@/stores/places'
import { getResolvedImage } from '@/config/curatedImages'

const placesStore = usePlacesStore()
const router = useRouter()

const props = defineProps({
  site: {
    type: Object,
    required: true
  }
})

const siteName = computed(() => {
  return props.site.displayName?.text || props.site.name || 'Historic Cultural Site'
})

const siteAddress = computed(() => {
  return props.site.formattedAddress || props.site.address || props.site.wilayaId?.name || 'Algeria'
})

const imageUrl = computed(() => {
  return getResolvedImage(props.site, 'site')
})

const goToDetails = () => {
  placesStore.setTrip(props.site)
  const placeId = props.site.name?.includes('places/') 
    ? props.site.name.replace('places/', '') 
    : (props.site._id || props.site.name || 'detail')

  router.push({
    name: 'PlaceDetail',
    params: { placeId }
  })
}
</script>

<style scoped>
.editorial-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(16, 45, 39, 0.45) 0%,
    transparent 50%,
    rgba(16, 45, 39, 0.75) 100%
  );
  pointer-events: none;
}

.editorial-badge {
  background: rgba(16, 45, 39, 0.85);
  backdrop-filter: blur(6px);
  color: #FAF8F2;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 9999px;
  border: 1px solid rgba(217, 185, 140, 0.3);
  display: inline-flex;
  align-items: center;
}

.editorial-category-badge {
  background: rgba(33, 134, 107, 0.85);
  backdrop-filter: blur(6px);
  color: #FAF8F2;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
