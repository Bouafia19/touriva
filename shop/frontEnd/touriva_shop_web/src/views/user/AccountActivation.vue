<template>
<div>
    <head-bar pageTitle="SignUp" :progress="progress">
    <v-container fluid>
        <v-row 
            class="d-flex justify-center align-center"
            style="height: 90vh;"
        >
            <v-col>
                <div class="text-center ma-2 mb-6">
                    <h3>{{ $t('yartuf') }}</h3>
                    <p>{{ $t('yaia') }}</p>
                </div>

                <div class="text-center ma-2" v-if="err">
                    <v-alert
                        dense
                        rounded
                        type="error"
                        v-if="err"
                    >
                        {{ $t(err) }}
                    </v-alert>
                </div>

                <div class="text-center ma-2">
                    <v-btn 
                        color="next" 
                        dark 
                        block 
                        @click="handleSubmit"
                        :loading="loading"
                    >{{ $t('next') }}</v-btn>
                </div>
            </v-col>
        </v-row>
    </v-container>
    </head-bar>
</div>
</template>

<script>
    import HeadBar from '@/components/HeadBar.vue'
    import { mapGetters, mapActions } from 'vuex'
   
export default {
    components: {
        'head-bar': HeadBar
    },
    data: () => ({
        progress: 100,
        loading: false,
        err: '',
    }),
    methods: {
        ...mapActions(['editUsers']),
        async handleSubmit () {
            try {
                this.editUsers({ activated: true })
                this.$router.push('/tabs')
            } catch (error) {
                this.err = error
            }
        }
    } 
}
</script>