<template>
    <v-dialog
        v-model="dialog"
        fullscreen
    >
        <v-card>
            <v-toolbar>

                <v-toolbar-title>{{ $t('Ad') }}</v-toolbar-title>

                <v-toolbar-items>
                    <v-btn
                        :text="$t('Skip')"
                        variant="text"
                        @click="closeDialog"
                    ></v-btn>
                </v-toolbar-items>
            </v-toolbar>

            <v-img
                :src="ads.getLSIntAdHome.img"
                cover
            ></v-img>
        </v-card>
    </v-dialog>
    
    <h2 
        class="pa-4 text-uppercase"
        v-if="ads.getHeaderAdsHome.length > 0"
    >
        {{ $t('Ads') }}
    </h2>

    <v-sheet
        class="d-flex justify-center align-center mx-2"
        v-if="ads.getHeaderAdsHome.length > 0"
    >
        <v-carousel 
            :show-arrows="false"
            height="250"
            hide-delimiters
            :interval="adsSettings.getAdsSettings.interval"
            cycle
        >
            <v-carousel-item
                v-for="(item,i) in ads.getHeaderAdsHome"
                :key="i"
                :src="item.img"
                cover
                @click="openInNewTab(item.link)"
            ></v-carousel-item>
        </v-carousel>
    </v-sheet>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { useAdvertisingStore } from '@/stores/advertising'
    import { useAdsSettingsStore} from '@/stores/adsSettings'

    const ads = useAdvertisingStore()
    const adsSettings = useAdsSettingsStore()

    let dialog = ref(false)

    const closeDialog = () => {
        ads.updateLSIntAdHomeCounter()
        dialog.value = false
    }

    const openInNewTab = (href) => {
        if(href){
            window.open(href, '_blank')
        }
    }

    onMounted(async () => {
        ads.fetchAdvertising().then(() => {
            if(ads.getLSIntAdHome){
                dialog.value = true
            }
        })
        adsSettings.fetchAdsSettings()
    })

</script>