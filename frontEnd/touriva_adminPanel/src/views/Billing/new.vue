<template>
    <h1>New</h1>
</template>
<!-- <template>
  <base-layout>
        <v-container>
            <h1>New</h1>
            <v-card
                class="mx-auto"
                outlined
            >
                <v-container>
                    <form @submit.prevent="submit">
                        
                        <v-text-field
                            v-model="name"
                            :counter="10"
                            label="Name"
                            required
                        ></v-text-field>
                    
                        <v-text-field
                            v-model="phoneNumber"
                            :counter="7"
                            label="Phone Number"
                            required
                        ></v-text-field>
                   
                        <v-text-field
                            v-model="email"
                            :error-messages="errors"
                            label="E-mail"
                            required
                        ></v-text-field>
                    
                        <v-select
                            v-model="select"
                            :items="items"
                            :error-messages="errors"
                            label="Select"
                            data-vv-name="select"
                            required
                        ></v-select>
                    
                        <v-btn
                            class="mr-4"
                            type="submit"
                            :disabled="invalid"
                        >
                            submit
                        </v-btn>
                    </form>
                </v-container>
            </v-card>
        </v-container>
  </base-layout>
</template>

<script>
    import BaseLayout from '@/components/BaseLayout.vue'
    import { mapGetters, mapActions } from 'vuex'

    export default {
        components: {
            'base-layout': BaseLayout
        },

        methods: {
            ...mapActions(['fetchBillings']),

            submit(){
                console.log('', )
            }
        },

    }
</script>

<style>

</style> -->