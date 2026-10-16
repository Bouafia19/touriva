<template>
  <v-container fluid class="px-16">
  <v-card 
      style="border: 1px"
      class="mx-16"
    >
      <v-card-title>
        Company
      </v-card-title>
      <v-divider
        class="mx-4"
        inset
        >
      </v-divider>
            <v-card-text class="pa-16">
              <v-row>

                <v-col>
                  <v-row>  
                    <v-col>
                      <v-text-field
                          v-model="company.getCompany.companyName"
                          :label="$t('RaisonSocial')"
                          outlined
                          dense
                      ></v-text-field>
                    </v-col>

                  </v-row>
                
                  <v-row>
                    <v-col>
                      <v-text-field
                        v-model="company.getCompany.state"
                        :label="$t('State')"
                        outlined
                        dense
                      ></v-text-field>
                    </v-col> 

                    <v-col>
                      <v-text-field
                        v-model="company.getCompany.city"
                        :label="$t('City')"
                        outlined
                        dense
                      ></v-text-field>
                    </v-col> 
                  </v-row>

                  <v-row>
                    <v-col>
                      <v-text-field
                        v-model="company.getCompany.street"
                        :label="$t('Street')"
                        outlined
                        dense
                      ></v-text-field>
                    </v-col>

                    <v-col>
                      <v-text-field
                        v-model="company.getCompany.zip"
                        :label="$t('PostalCode')"
                        outlined
                        dense
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col>
                      <v-text-field
                          v-model="company.getCompany.phone"
                          :label="$t('Phone')"
                          outlined
                          dense
                      ></v-text-field>
                    </v-col>

                    <v-col>
                      <v-text-field
                        v-model="company.getCompany.mobile"
                        :label="$t('Mobile')"
                        outlined
                        dense
                      ></v-text-field>
                    </v-col>

                    <v-col>
                      <v-text-field
                        v-model="company.getCompany.fax"
                        :label="$t('Fax')"
                        outlined
                        dense
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col>
                      <v-text-field
                          v-model="company.getCompany.taxIdentifierNumber"
                          :label="$t('NIF')"
                          outlined
                          dense
                      ></v-text-field>
                    </v-col>

                    <v-col>
                      <v-text-field
                          v-model="company.getCompany.statisticalIdentifierNumber"
                          :label="$t('NIS')"
                          outlined
                          dense
                          ></v-text-field>
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col>
                      <v-text-field
                        v-model="company.getCompany.commercialRegisterNumber"
                        :label="$t('RC')"
                        outlined
                        dense
                      ></v-text-field>
                    </v-col>

                    <v-col>
                      <v-text-field
                        v-model="company.getCompany.taxArticleNumber"
                        :label="$t('ART')"
                        outlined
                        dense
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col>
                      <v-text-field
                        v-model="company.getCompany.email"
                        :label="$t('Email')"
                        outlined
                        dense
                      ></v-text-field>
                    </v-col>

                    <v-col>
                      <v-text-field
                        v-model="company.getCompany.siteWeb"
                        :label="$t('WebSite')"
                        outlined
                        dense
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-col>

                <v-divider
                  class="mx-4"
                  inset
                  vertical
                ></v-divider>
                
                

                <v-col
                  cols="12"
                  sm="6"
                  md="4"
                  
                >     
                <v-file-input 
                        v-model="image" 
                        type="file" 
                        :label="$t('Photo')"
                        outlined
                        prepend-icon="mdi-camera"
                        dense
                        @change="onFileChange"  
                      />        
                  <v-avatar 
                    size="300"
                    rounded="lg"
                  >

                    <v-img 
                      :src="company.getCompany.logo"
                      contain
                      
                      style="float: center; border: 1px solid;"
                      alt="Product Image"
                    >  
                      
                    </v-img> 
                  
                </v-avatar>

                <v-divider
                  class="my-4"
                  
                ></v-divider>

                <v-file-input 
                        v-model="homeImage" 
                        type="file" 
                        :label="$t('appPhoto')"
                        outlined
                        prepend-icon="mdi-camera"
                        dense
                        @change="onImageChange" 
                       
                      />        
                  <v-avatar 
                    size="300"
                    rounded="lg"
                  >
                    <v-img 
                      :src="company.getCompany.appImage"
                      cover
                      style="float: center; border: 1px solid;"
                      alt="Home Image"
                    ></v-img> 
                </v-avatar>
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
  import { useCompanyStore } from '@/stores/company'

  const company = useCompanyStore()
 
  let dialog = ref(false),
      dialogDelete = ref(false),
      image = ref(undefined),
      homeImage = ref(undefined),
      headers = ref([
        {
          text: 'Name',
          align: 'start',
          sortable: false,
          value: 'companyName',
        },
        { text: 'NIS', value: 'statisticalIdentifierNumber'},
        { text: 'NIF', value: 'taxIdentifierNumber'},
        { text: 'RC', value: 'commercialRegisterNumber'},
        { text: 'Actions', value: 'actions', sortable: false },
      ]),
      editedIndex = ref(-1)

      const formTitle = computed(() => {
        return editedIndex.value === -1 ? 'New Item' : 'Edit Item'
      })

      watch(dialog, (diaNew, diaOld) => {
        diaNew || close()
      })

      watch(dialogDelete, (dialogDelNew, dialogDelOld) => {
        dialogDelNew || closeDelete()
      })

      onMounted(()=>{
        initialize()
      })

      const createImage = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          company.company.logo = e.target.result;
        };
        reader.readAsDataURL(image.value);
      }

      const onFileChange = (file) => {
        if (!file) {
          return;
        }
        createImage(file);
      }

      const saveImage = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          company.company.appImage = e.target.result;
        };
        reader.readAsDataURL(homeImage.value);
      }

      const onImageChange = (file) => {
        if (!file) {
          return;
        }
        saveImage(file);
      }

      const initialize = () => {
        company.fetchCompany()
      }

      const editItem  = (item) => {
        editedIndex.value = this.companies.indexOf(item)
        editedItem.value = Object.assign({}, item)
        dialog.value = true
      }

      const deleteItem  = (item) => {
        editedIndex.value = item._id
        dialogDelete.value = true
      }

      const deleteItemConfirm = () => {
        closeDelete()
      }

      const close = () => {
        dialog.value = false
        nextTick(() => {
          editedItem.value = Object.assign({}, defaultItem.value)
          editedIndex.value = -1
        })
      }

      const closeDelete = () => {
        dialogDelete.value = false
        nextTick(() => {
          editedItem.value = Object.assign({}, defaultItem.value)
          editedIndex.value = -1
        })
      }

      const save = () => {
        company.editCompany(company.company)
      }
</script>

<style scoped>
  ::v-deep .v-file-input .v-icon {
    color: #00366f !important;
  }
  .v-card__actions {
    background-color: #00366f;
  }
</style>