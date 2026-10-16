<template>
    <v-container 
        fluid
        :class="containerClass"
    >
        <div class="text-center" v-if="loading">
            <v-row 
                class="d-flex justify-center align-center"
                style="height: 80vh;"
            >
                <v-progress-circular
                indeterminate
                color="next"
                ></v-progress-circular>
            </v-row>
        </div>
        <div v-if="loading === false">
            <div class="text-center ma-2 mb-6">
                <v-img 
                    v-if="!users.getPhoto" 
                    height="50vh" 
                    class="ma-2" 
                    :src="exemple"
                ></v-img>
                <v-icon 
                    large 
                    color="success" 
                    v-if="users.getPhoto"
                >
                    mdi-checkbox-marked-circle
                </v-icon>
                <v-img 
                  
                    v-if="users.getPhoto" 
                    height="50vh" 
                    width="100%" 
                    class="ma-2" 
                    :src="users.getPhoto" 
                ></v-img>
            </div>
            
            <div class="text-center ma-2">
                <v-alert
                    dense
                    rounded
                    type="error"
                    v-if="err"
                >
                    {{ $t(err) }}
                </v-alert>
            </div>
            <use-camera v-on:cameraUpload="uploadImage($event)" pageTitle="document"/>

            <div class="text-center mt-4">
                <v-btn
                    color="next"
                    block
                    dark
                    @click="$router.go(-1)"
                >
                    {{ $t('submit') }}
                </v-btn>
            </div>

        </div>
    </v-container>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUsersStore } from '@/stores/users'
import UseCamera from '@/components/UseCamera.vue'
import { useDisplay } from "vuetify"

const users = useUsersStore()
const route = useRoute()
const display = useDisplay()

let err = ref(''),
    check = ref(false),
    loading = ref(false),
    photo = ref(null),
    exemple = ref(new URL(`../assets/documents/${users.getTitle}.png`, import.meta.url).href)

    
        const uploadImage = (img64) => {  
            loading.value = true  
            
            try {
                users.uploadPartnerImages({  
                    [users.getTitle]: img64,
                    name: users.getTitle
                }).then(() => {
                    photo.value = img64
                    users.photo = img64
                    users.images[users.getTitle] = img64
                    loading.value = false
                })
            } catch (error) {
                err.value = error
                console.log('error update', error)
            }
        }

        const containerClass = computed(() => {
            if (display.xs.value) return "custom-width-xs";
            if (display.sm.value) return "custom-width-sm";
            if (display.md.value) return "custom-width-md";
            if (display.lg.value || display.xl.value) return "custom-width-lg";
            return ""
        })

    onMounted(() => {
        if(users.photo){
            check.value = true
        }
    })
</script>

<style scoped>
/* Adjust widths for different screen sizes */
.custom-width-xs {
  max-width: 100%; /* Full width for extra small screens */
}
.custom-width-sm {
  max-width: 540px;
}
.custom-width-md {
  max-width: 720px;
}
.custom-width-lg {
  max-width: 960px;
}
</style>