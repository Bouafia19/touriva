<template>
  <h1>About</h1>
</template>
<!-- <template>
  <base-layout>
  <v-container>
    <v-card 
      class="rounded-card"
      elevation="6"
    >
      <v-card-title class="justify-center">
        <v-avatar size="60">
          <v-img 
              src="../assets/icons/logo.png"
              contain
              width="100%"
          />
        </v-avatar>
        
        <h2 class="ml-3 text-uppercase" style="text-indent: 10px;">
          {{ $t('CompanyName') }}
        </h2>
       
      </v-card-title>

      <v-divider
        class="ma-4"
        inset
      >
      </v-divider>

      <v-card-text>
        <v-row>
          <v-col>
            <v-row>
              <v-col >
                <h2 
                  
                  style="color: #102D27; margin: auto; text-align: center; text-decoration: underline;"
                >
                  {{ $t('Office') }}
                </h2>
                <v-list>
                  <v-list-item
                    v-for="contact in contacts"
                    :key="contact.title"      
                  >
                    <v-list-item-avatar>       
                      <v-img
                        left
                        :src="contact.img">
                      </v-img>    
                    </v-list-item-avatar>

                    <v-list-item-content>
                      <v-list-item-title 
                        :style="[`this.$i18n.locale == 'ar'` ? {'direction': 'ltr'} : {'direction': 'ltr'}]"
                        class="font-weight-black" 
                        >
                        <v-chip
                          color="pink darken-3"
                          outlined
                          class="rounded-r-xl"
                        >
                          {{ $t(contact.title) }}
                        </v-chip>
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>     
            </v-row>
          </v-col>

          <v-divider
            class="mx-4"
            inset
            vertical
          ></v-divider>

          <v-col>
            <h2 style="color: #102D27; margin: auto; text-align: center; text-decoration: underline;">{{ $t('Services') }}</h2>
            <v-list>
              <v-list-item
                v-for="item in services"
                :key="item.title"  
              >
                <v-list-item-avatar>
                  <v-img
                    left
                    :src="item.img">
                  </v-img>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title class="font-weight-black">
                     <v-chip
                          color="pink darken-3"
                          outlined
                          class="rounded-r-xl"
                        >
                    {{ $t(item.title) }}
                     </v-chip>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card> 
  </v-container>
  </base-layout>
</template>

<script>
  import BaseLayout from '@/components/BaseLayout.vue'
  export default {
    components: {
      'base-layout': BaseLayout
    },
    name: 'About',
    data: () => ({
      contacts: [
            { title: 'Telephone', img: require('../assets/icons/couleur/phone.png')},
            { title: 'MyMobile', img: require('../assets/icons/couleur/mobile.png')},
            { title: 'Contact', img: require('../assets/icons/couleur/email.png')},
            { title: 'Site', img: require('../assets/icons/couleur/google.png')},
            { title: 'CompanyName', img: require('../assets/icons/couleur/facebook.png')},
      ],
      services: [
            { title: 'web', img: require('../assets/icons/couleur/ruby.png')},
            { title: 'ecommerce', img: require('../assets/icons/couleur/nodejs.png')},
            { title: 'erp', img: require('../assets/icons/couleur/python.png')},
            { title: 'mobileDev', img: require('../assets/icons/couleur/android.png')},
            { title: 'desktop', img: require('../assets/icons/couleur/electron.svg')},
            { title: 'design', img: require('../assets/icons/couleur/experience.png')},
            { title: 'support', img: require('../assets/icons/couleur/gnu-bash.png')},
      ]
    })
  }
</script>

<style scoped>
  .rounded-card {
    border-radius:30px;
    color: #102D27;
    margin: 50px auto;
  }
</style> -->