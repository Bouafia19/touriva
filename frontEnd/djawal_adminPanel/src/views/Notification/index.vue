<template>
    <h1>Notifications</h1>
</template>
<!-- <template>
  <base-layout>
    <v-container fluid>
        <div class="ma-2">
            <v-alert
                dense
                outlined
                type="error"
                v-if="err"
            >
                {{ $t(err) }}
            </v-alert>
        </div>
        <v-skeleton-loader v-if="firstLoad" :loading="loadingTab" type="table" height="100%"></v-skeleton-loader>
        <v-data-table
            :headers="filterHeaders"
            :items="announcements"
            v-show="!firstLoad"
            :loading="loadingTab"
        >
            <template v-for="header in headers" v-slot:[`header.${header.value}`]="{ header }">
                {{ $t(header.text) }}
            </template>

            <template v-slot:top>
            <v-toolbar
                flat
            >
                <v-toolbar-title>{{ $t('Announcements') }}</v-toolbar-title>
                <v-divider
                class="mx-4"
                inset
                vertical
                ></v-divider>
                <v-spacer></v-spacer>
                <v-dialog
                v-model="dialog"
                max-width="800px"
                >
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        color="next"
                        dark
                        class="mb-2"
                        v-bind="attrs"
                        v-on="on"
                        icon
                        v-if="$can('create', 'Notifications')"
                    >
                        <v-icon large>
                            mdi-plus-circle
                        </v-icon>
                    </v-btn>
                </template>
                <v-card>
                    <v-card-title>
                    <span class="text-h5">{{ formTitle }}</span>
                    </v-card-title>

                    <v-card-text>
                        <v-container>
                            <v-row
                                align="center" 
                                justify="center"
                            >
                                <v-col
                                    cols="12" 
                                >
                                    <v-text-field
                                      v-model="editedItem.title"
                                      label="Title"
                                      filled
                                      color="deep-purple"
                                    ></v-text-field>

                                    <v-select
                                      v-model="editedItem.topic"
                                      :items="items"
                                      label="Select Tpic"
                                      required
                                      filled
                                      dense
                                      shaped
                                      color="deep-purple"
                                    ></v-select>

                                    <v-textarea
                                      v-model="editedItem.body"
                                      label="Body"
                                      required
                                      outlined
                                      filled
                                      color="deep-purple"
                                      rows="7"
                                      auto-grow
                                      dense
                                      shaped
                                    ></v-textarea>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-card-text>

                    <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="error"
                        text
                        @click="close"
                    >
                        Cancel
                    </v-btn>
                    <v-btn
                        color="success"
                        text
                        @click="save"
                    >
                        Save
                    </v-btn>
                    </v-card-actions>
                </v-card>
                </v-dialog>
                <v-dialog v-model="dialogDelete" max-width="500px">
                <v-card>
                    <v-card-title class="text-h5">Are you sure you want to delete this item?</v-card-title>
                    <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeDelete">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="deleteItemConfirm">OK</v-btn>
                    <v-spacer></v-spacer>
                    </v-card-actions>
                </v-card>
                </v-dialog>
            </v-toolbar>
            </template>
            <template v-slot:item.actions="{ item }">
            <v-icon
                small
                class="mr-2"
                @click="editItem(item)"
                color="primary"
                v-if="$can('update', 'Notifications')"
            >
                mdi-pencil
            </v-icon>
            <v-icon
                small
                @click="deleteItem(item)"
                color="error"
                v-if="$can('delete', 'Notifications')"
            >
                mdi-delete
            </v-icon>
            </template>
            <template v-slot:no-data>
            <v-btn
                color="primary"
                @click="initialize"
            >
                Reset
            </v-btn>
            </template>
        </v-data-table>
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
    data: () => ({
      title: '',
      body: '',
      topic: null,
      items: [
        'client',
        'transporter'
      ],
      dialog: false,
            dialogDelete: false,
            headers: [
                {
                    text: 'Title',
                    align: 'start',
                    // sortable: false,
                    value: 'title',
                },
                { text: 'Topic', value: 'topic' },
                { text: 'Body', value: 'body' },
                { text: 'Actions', value: 'actions', sortable: false },
            ],
            err: '',
            loadingTab: true,
            firstLoad: true,
            editedIndex: -1,
            editedItem: {
                title: '',
                body: '',
                topic: ''
            },
            defaultItem: {
                title: '',
                body: '',
                topic: ''
            },
            loading: false
    }),

    computed: {
      ...mapGetters(['announcements']),
      formTitle () {
        return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
      },
      filterHeaders(){
        if(!this.$can('update', 'Notifications') && !this.$can('delete', 'Notifications')){
            return this.headers.filter((e) => e.text != 'Actions')
        }else{
            return this.headers
        }
      }
    },

    watch: {
      dialog (val) {
          val || this.close()
      },
      dialogDelete (val) {
          val || this.closeDelete()
      },
    },

    created () {
      this.initialize()
    },

    methods: {
        ...mapActions(['sendNotifications', 'fetchAnnouncements', 'addAnnouncements', 'editAnnouncements', 'deleteAnnouncements']),
      // submit () {
      //   let note = {
      //       title: this.title,
      //       body: this.body,
      //       topic: this.topic
      //   }
      //   console.log('note', note)
      //   this.sendNotifications(note)
      // },
      // clear () {
      //   this.title = ''
      //   this.body = ''
      //   this.topic = null
      // },
      initialize () {
        this.fetchAnnouncements()
        .then(() => {
          if (this.firstLoad) this.firstLoad = false
          this.loadingTab = false
        })
      },

      editItem (item) {
                this.editedIndex = this.announcements.indexOf(item)
                this.editedItem = Object.assign({}, item)
                this.dialog = true
            },

            deleteItem (item) {
                // this.editedIndex = this.vehicles.indexOf(item)
                this.editedIndex = item._id
                this.editedItem = Object.assign({}, item)
                this.dialogDelete = true
            },

            deleteItemConfirm () {
                this.deleteAnnouncements(this.editedIndex)
                this.initialize()
                this.closeDelete()
            },

            close () {
                this.dialog = false
                this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
                })
            },

            closeDelete () {
                this.dialogDelete = false
                this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
                })
            },

            async createAnnouncements(){
                try {
                    await this.addAnnouncements(this.editedItem)
                } catch (error) {
                    this.err = error
                    console.log('error create Announcement', error)
                }
            },

            save () {
                this.loading = true
                if (this.editedIndex > -1) {
                    // Object.assign(this.vehicles[this.editedIndex], this.editedItem)
                    this.editAnnouncements(this.editedItem).then(() => {
                        this.sendNotifications(this.editedItem)
                        this.loading = false
                        this.close()
                        this.initialize()
                    })
                } else {
                    this.createAnnouncements().then(() => {
                        this.sendNotifications(this.editedItem)
                        this.close()
                        this.loading = false
                        this.initialize()
                    })
                }
            },
    },
  }
</script>

<style scoped>
    .v-data-table {
        border: 1px solid black;
    }
    :deep(table > thead > tr:last-child > th) {
        color: white !important;
        background-color: #00366f !important;
    }
    :deep(.mdi-arrow-up::before) {
        color: white !important;
    }
    .v-card__title {
        background-color: #00366f;
        color: white;
    }
    .v-card__actions {
        background-color: #00366f;
    }
</style> -->