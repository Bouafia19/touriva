<template>
  <!-- CREATE / EDIT DIALOG -->
  <v-dialog v-model="dialog" max-width="500px">

    <template #activator="{ props }">
        <v-btn
            color="next"
            prepend-icon="mdi-plus"
            v-bind="props"
        >
            {{ $t('Add') }}
        </v-btn>
    </template>

    <v-card>
      <v-card-title>
        <span class="text-h5">{{ formTitle }}</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-row>

            <v-col cols="12">
              <v-text-field
                v-model="editedItem.name"
                :label="`${typeLabel} Name`"
              />
            </v-col>

            <v-col cols="12">

              <v-autocomplete
                v-model="wilayaId"
                :items="wilaya.getWilayas"
                label="Wilaya"
                item-title="name"
                item-value="_id"
                @update:modelValue="updateDaira"
              />
            </v-col>

            <!-- <v-col cols="12">
              <v-autocomplete
                v-model="dairaId"
                :items="dairaItems"
                label="Daira"
                item-title="name"
                item-value="_id"
                @update:modelValue="updateCommune"
              />
            </v-col> -->

            <v-col cols="12">
              <v-autocomplete
                v-model="communeId"
                :items="communeItems"
                label="Commune"
                item-title="name"
                item-value="_id"
                @update:modelValue="getCommuneId()"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="editedItem.address"
                label="Address"
              />
            </v-col>

            <v-col cols="6">
              <v-text-field
                v-model.number="editedItem.latitude"
                label="Latitude"
                type="number"
              />
            </v-col>

            <v-col cols="6">
              <v-text-field
                v-model.number="editedItem.longitude"
                label="Longitude"
                type="number"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="editedItem.phone"
                label="Phone"
                prepend-inner-icon="mdi-phone"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="editedItem.description"
                label="Description"
              />
            </v-col>

            <v-col cols="12">
              <v-file-input
                v-model="mainImg"
                label="Photo"
                prepend-icon="mdi-camera"
                @change="onImageChange"
              />
            </v-col>

            <v-col cols="12">
              <v-img
                v-if="editedItem.photo"
                :src="editedItem.photo"
                max-height="200"
                cover
              />
            </v-col>

          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer/>

        <v-btn color="error" @click="close">
          Cancel
        </v-btn>

        <v-btn
          color="success"
          @click="save"
          :loading="loading"
        >
          Save
        </v-btn>

      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue'
    import { useWilayasStore } from '@/stores/wilaya'
    import { useDairasStore } from '@/stores/daira'
    import { useCommunesStore } from '@/stores/commune'
    import { useHotelsStore } from '@/stores/hotels'
    import { useRestaurantsStore } from '@/stores/restaurants'
    import { useSitesStore } from '@/stores/sites'

    const wilaya = useWilayasStore()
    const daira = useDairasStore()
    const commune = useCommunesStore()
    const hotelsStore = useHotelsStore()
    const restaurantsStore = useRestaurantsStore()
    const sitesStore = useSitesStore()

    const props = defineProps({
        type: String
    })

    const dialog = ref(false)
    const dialogDelete = ref(false)

    const loading = ref(false)
    const loadingDelete = ref(false)

    const editedItem = ref({})
    const mainImg = ref(null)

    const wilayaId = ref(""),
          dairaItems = ref([]),
          dairaId = ref(""),
          communeItems = ref([]),
          communeId = ref("")

    const typeLabel = computed(() => {
        if (props.type === 'hotel') return 'Hotel'
        if (props.type === 'restaurant') return 'Restaurant'
        if (props.type === 'site') return 'Site'
    })

    const formTitle = computed(() => {
        return `New ${typeLabel.value}`
    })

    const close = () => dialog.value = false
    const closeDelete = () => dialogDelete.value = false

    const save = async () => {
        loading.value = true
        editedItem.value.wilayaId = wilayaId.value
        // editedItem.value.dairaId = dairaId.value
        editedItem.value.communeId = communeId.value
        editedItem.value.status = 'pending'
        editedItem.value.location = {
            type: 'Point',
            coordinates: [editedItem.value.longitude, editedItem.value.latitude]
        }
        console.log('Saving item:', editedItem.value)

        try {
            // call API depending on type
            if (props.type === 'hotel') {
                hotelsStore.addHotels(editedItem.value)
            }

            if (props.type === 'restaurant') {
                restaurantsStore.addRestaurants(editedItem.value)
            }

            if (props.type === 'site') {
                sitesStore.addSites(editedItem.value)
            }

            dialog.value = false
        } finally {
            loading.value = false
            editedItem.value = {} 
        }
    }

const deleteItemConfirm = async () => {
  loadingDelete.value = true
  // delete logic
  loadingDelete.value = false
}

    const onImageChange = () => {
        // image preview logic
        const reader = new FileReader()
        reader.onload = (e) => {
            editedItem.value.photo = e.target.result
        }
        reader.readAsDataURL(mainImg.value)
    }

    const updateDaira = () => {
        dairaItems.value = daira.getDairas.filter(
            d => d.wilayaId === wilayaId.value
        )

        communeItems.value = commune.getCommunes.filter(c =>
            dairaItems.value.some(d => d._id === c.dairaId)
        )
    }

    const updateCommune = () => {
        communeItems.value = commune.getCommunes.filter(e => e.dairaId === dairaId.value)

    }

    const getCommuneId = () => {
    }

    onMounted(() => {
        wilaya.fetchWilayas()
        daira.fetchDairas()
        commune.fetchCommunes()
    })
</script>