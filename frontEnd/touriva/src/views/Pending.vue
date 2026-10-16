<template>
    <div>
        
            <v-container fluid>
                <div class="text-right">
                    <v-btn
                        icon
                        color="error"
                        @click="auth_sign_out"
                    >
                        <v-icon>mdi-logout</v-icon>
                    </v-btn>
                </div>

                <v-row 
                    class="d-flex justify-center align-center"
                    style="height: 80vh;"
                >
                    <v-col
                        cols="12"
                        sm="6"
                        md="4"
                    >
                        <h3>{{ $t('pending') }} ...</h3>
                    </v-col>
                </v-row>

            </v-container>
        
    </div>
</template>

<script setup>
    import { onMounted } from 'vue'
    import { useAuthStore } from '@/stores/auth'
    import { useUsersStore } from '@/stores/users'

    const auth = useAuthStore()
    const users = useUsersStore()
            
    const auth_sign_out = async () => {
        auth.account_sign_out()
    }

    onMounted(() => {
        users.fetchUser().then(() => {
            users.loadUser()
        })
    })
</script>