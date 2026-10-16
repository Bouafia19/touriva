<template>
    <v-dialog v-model="notAuthenticated" persistent max-width="900px">
        <v-card>
            <v-card-title></v-card-title>
            <v-card-text>
                <v-row>
                    <v-col
                        cols="12"
                        sm="6"
                        md="6" 
                    >
                        <v-img 
                            src="../assets/icons/couleur/truck.png"
                            contain
                            width="100%"
                            alt="Next Challenge"
                        />
                    </v-col>
                    <v-divider
                        class="mx-4"
                        inset
                        vertical
                    ></v-divider>
                    <v-col>
                        <v-card-title>{{ ('AccountLogin') }}</v-card-title>
                            <v-form v-model="valid">
                                <v-container grid-list-md>
                                    <!-- <v-text-field 
                                        :label="('username')" 
                                        filled 
                                        v-model="username"
                                        :rules="nameRules"
                                        :counter="30"
                                        required 
                                    ></v-text-field> -->
                                    <v-text-field 
                                        :label="('Email')" 
                                        filled 
                                        v-model="email"
                                        :rules="nameRules"
                                        :counter="30"
                                        required 
                                    ></v-text-field>
                                    <v-text-field 
                                        :label="('Password')" 
                                        filled 
                                        type="password" 
                                        v-model="password" 
                                        :rules="passwordRules"
                                        :counter="8"
                                        required
                                    ></v-text-field>
                                    <v-checkbox v-model="remeber_login" :label="('RemeberMyLoginOnThisComputer')"></v-checkbox>
                                </v-container>
                            </v-form>
                            <v-spacer></v-spacer>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn 
                                    color="next" 
                                    dark
                                    :disabled="this.valid == false"
                                    block 
                                    @click="auth_login">
                                        {{ ('Login') }}
                                </v-btn>
                            </v-card-actions>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
    import { mapGetters } from 'vuex';
    export default {
        props: ['notAuthenticated'],
        name: "DialogLogin",
        data () {
            return {
                email: '',
                // username: '',
                password: '',
                remeber_login: false,
                valid: false,
                nameRules: [
                    v => !!v || ('NameIsRequired'),
                    v => v.length <= 30 || ('NameMustBeLessThan30Characters'),
                ],
                passwordRules: [
                    v => !!v || ('PasswordIsRequired'),
                    v => v.length >= 8 || ('PasswordMustBeMoreThan8Characters'),
                ],
            }
        },
        methods: {
            auth_login () {
                this.$store.commit('auth/account_sign_in', {
                    email: this.email,
                    // username: this.username,
                    password: this.password,
                    role: 'administrator',
                    remeber_login: this.remeber_login
                })
                this.email = '';
                // this.username = '';
                this.password = '';
                this.remeber_login = false;
            }
        },
        computed: {
            ...mapGetters({
                authenticated: 'auth/authenticated',
            })
        }
    }
</script>