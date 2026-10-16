<template>
    <div>
        <div v-if="pageTitle === 'document'">
            <v-btn
                @click="takePicture"
                color="next"
                dark
                block
            >
                {{ $t('camera') }}
            </v-btn>
        </div>
         <div v-else>
            <v-btn
                @click="takePicture"
                color="next"
                dark
                text
            >
                {{ $t('camera') }}
            </v-btn>
        </div>
    </div>
</template>

<script setup>
    import { Camera, CameraResultType } from '@capacitor/camera'

    const props = defineProps(['pageTitle'])
    const emit = defineEmits('cameraUpload')
        
    const takePicture = async () => {
        const image = await Camera.getPhoto({
            quality: 90,
            // allowEditing: true,
            resultType: CameraResultType.DataUrl
        })
        
        if(image){
            let imageUrl = image.dataUrl
            emit('cameraUpload', imageUrl)
        } 
    }
</script>