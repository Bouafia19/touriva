<template>
  <h1>Account</h1>
</template>
<!-- <template>
  <base-layout>
  <v-container fluid class="px-16">
    <v-card
      elevation="4"
    >
      <v-card-actions>
        <v-btn
          color="error"
          @click="close"
        >
          {{ $t('Cancel') }}
        </v-btn>
        <v-btn
          color="success"
          @click="save"
          :loading="loading"
        >
          {{ $t('Save') }}
        </v-btn>
      </v-card-actions>
      <v-card-text v-if="err">
        <div class="ma-2">
          <v-alert
            dense
            outlined
            type="error"
          >
            {{ $t(err) }}
          </v-alert>
        </div>
      </v-card-text>
    </v-card>

    <v-card 
      elevation="4"
      style="margin-top: 4px;"
    >
      <v-card-title class="justify-center">
        
            <h3 class="text-uppercase" style="color: #102D27;">{{$t('User')}}</h3>

            <v-spacer></v-spacer>

             <v-avatar 
              size="100"
              rounded="lg"
              >

              <v-hover v-slot="{ hover }">
                <v-img 
                  :src="userInfo.photo"
                  contain
                  width="100px"
                  style="float: right; border: 1px solid;"
                  alt="Product Image"
                >  
                  <v-file-input 
                    v-model="image" 
                    type="file" 
                    :label="$t('Photo')"
                    hide-input
                    v-if="hover"
                    @change="onFileChange"  
                  />     
                </v-img> 
              </v-hover>
            </v-avatar> 
          
      </v-card-title>

      <v-divider
        class="mx-4"
        inset
        >
      </v-divider>

      <v-card-text>
        
            <v-container>
                <v-row>
                  <v-col>
                    <v-row>
                      <v-col
                        cols="12"
                        sm="6"
                        md="3"
                      >
                        <h4>{{ $t('GeneralInfo') }}</h4>
                      </v-col>

                      <v-divider
                          class="mx-4"
                          inset
                          vertical
                      ></v-divider>
                  
                      <v-col
                        cols="12"
                        sm="6"
                        md="6"
                        
                      >
                        <v-text-field
                          v-model="user.email"
                          :label="$t('Email')"
                          outlined
                          dense
                          disabled
                        ></v-text-field>

                        <v-text-field
                            v-model="user.password"
                            :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                            :rules="[rules.required, rules.min]"
                            :type="show ? 'text' : 'password'"
                            
                            :label="$t('Password')"
                            :hint="$t('PasswordMustBeMoreThan8Characters')"
                            counter
                            @click:append="show = !show"
                            outlined
                            dense
                        ></v-text-field>

                        <div class="text-start">
                          <v-btn text>
                            <locale-changer />
                          </v-btn>
                        </div>
                      </v-col>
                    </v-row>  
                  </v-col>

                  <v-col>
                    <v-row>
                      
                      <!-- <v-col
                        cols="12"
                        sm="6"
                        md="2">  
                        <h4>{{$t('Language')}}</h4>
                      </v-col>

                      <v-divider
                        class="mx-4"
                        inset
                        vertical>
                      </v-divider>

                      <v-col
                        cols="12"
                        sm="6"
                        md="6">
                        
                       <v-select
                            :items="languages"
                            :label="$t('Language')"
                        
                            v-model="userInfo.language"
                            
                            single-line
                            outlined
                            dense
                        
                        ></v-select>
                        
                      </v-col> 
                    </v-row>
                  </v-col>
                </v-row>
   
            </v-container>
          
      </v-card-text>
    </v-card>
  </v-container>
  </base-layout>
</template>

<script>
    import LocaleChanger from '../../components/LocaleChanger.vue'
    import BaseLayout from '@/components/BaseLayout.vue'
    import { mapGetters, mapActions } from 'vuex'
    
  export default {
      components: {
        LocaleChanger,
        'base-layout': BaseLayout
      },
    data () {
            return {
      user: [],
      languages: ['en', 'ar', 'fr'],
      show: false,
      rules: {
          required: value => !!value || this.$t('PasswordIsRequired'),
          min: v => v.length >= 8 || this.$t('PasswordMustBeMoreThan8Characters'),
        },
      ls: null,
      loading: false,
      err: ''
    }},
    methods: {
      ...mapActions(['updateExistingUser']),
      getUserInfo() {
        this.ls = JSON.parse(localStorage.getItem('userInfo'))
        this.user.password = ''
        this.user.email = this.ls.user.email
      },

      close() {
        this.$router.push({ path: `/`  });
      },

      async save() {
        this.loading = true
        console.log('User', this.user)
        console.log('Ls', this.ls)
        let params = {
          _id: this.ls.user._id,
          language: this.$i18n.locale
        }
        if(this.user.password){
          params.password = this.user.password
        }
        try {
          await this.$store.dispatch('updateExistingUser', params)
        } catch (error) {
          this.err = error.message
          console.log('error user Information', error)
        }
        this.loading = false
        this.$store.dispatch('auth/account_sign_out')
      }
    },
    created() {
        this.getUserInfo()
    }
  }
</script>

<style scoped>
  .v-card__actions {
    background-color: #102D27;
  }
</style> -->