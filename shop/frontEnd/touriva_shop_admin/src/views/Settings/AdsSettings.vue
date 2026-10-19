<template>
    <v-container fluid class="px-16">
        <v-card 
            style="border: 1px"
            class="mx-16"
        >
            <v-card-title>
                Ads
            </v-card-title>

            <v-divider
                class="mx-4"
                inset
            >

            </v-divider>

            <v-card-text class="pa-16">

                <v-row>
                    <v-col>
                        <v-text-field
                            v-model="adsSettings.getAdsSettings.unitPrice"
                            :label="$t('unitPrice')"
                            outlined
                            dense
                            type="number"
                        ></v-text-field>
                    </v-col>

                    <v-col>
                    <v-text-field
                        v-model="adsSettings.getAdsSettings.interval"
                        :label="$t('Interval')"
                        outlined
                        dense
                        type="number"
                    ></v-text-field>
                    </v-col>
                </v-row>
   
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="error"
                    @click="close"
                >
                    {{ $t('Cancel') }}
                </v-btn>

                <v-btn
                    color="success"
                    @click="save"
                >
                    {{ $t('Edit') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script setup>
    import { ref, onMounted, nextTick, computed, watch } from 'vue'
    import { useAdsSettingsStore } from '@/stores/adsSettings'

    const adsSettings = useAdsSettingsStore()

    let dialog = ref(false),
        editedIndex = ref(-1)

        watch(dialog, (diaNew, diaOld) => {
            diaNew || close()
        })

        onMounted(()=>{
            initialize()
        })

        const initialize = () => {
            adsSettings.fetchAdsSettings()
        }

        const close = () => {
            dialog.value = false
            nextTick(() => {
                editedItem.value = Object.assign({}, defaultItem.value)
                editedIndex.value = -1
            })
        }

        const save = () => {
            adsSettings.editAdsSettings(adsSettings.adsSettings)
        }
</script>

<style scoped>
    :v-deep(.v-file-input .v-icon) {
        color: #102D27 !important;
    }
    .v-card__actions {
        background-color: #102D27;
    }
</style>