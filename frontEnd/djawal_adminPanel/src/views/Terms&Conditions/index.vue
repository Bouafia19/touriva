<template>
    <v-container>
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
            :items="terms"
            v-show="!firstLoad"
            :loading="loadingTab"
        >
            <template v-slot:headers="{ columns, isSorted, getSortIcon, toggleSort }">
                <tr style="color: #00366f;">
                <template v-for="column in columns" :key="column.key">
                    <td>
                    {{ $t(column.text) }}
                    </td>
                </template>
                </tr>
            </template>

            <template v-slot:top>
            <v-toolbar
                flat
            >
                <v-toolbar-title>{{ $t('TermsConditions') }}</v-toolbar-title>
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
                <template v-slot:activator="{ props: activatorProps }">
                    <v-btn
                        color="next"
                        dark
                        class="mb-2"
                        v-bind="activatorProps"
                        icon
                        size="x-large"
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
                                        v-model="editedItem.order"
                                        :label="$t('Order')"
                                        shaped
                                        filled
                                    >

                                    </v-text-field>

                                    <v-textarea
                                        v-model="editedItem.title"
                                        :label="$t('Title')"
                                        filled
                                        dense
                                        shaped
                                        rows="2"
                                        auto-grow
                                        color="deep-purple"
                                    ></v-textarea>

                                    <v-textarea
                                        v-model="editedItem.text"
                                        :label="$t('Text')"
                                        rows="7"
                                        auto-grow
                                        color="deep-purple"
                                        filled
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
            >
                mdi-pencil
            </v-icon>
            <v-icon
                small
                @click="deleteItem(item)"
                color="error"
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
</template>

<script>
import { useTermsStore } from '@/stores/terms'
import { mapState, mapActions } from 'pinia'

export default {
  data: () => ({
    dialog: false,
    dialogDelete: false,
    headers: [
      { text: 'Order', align: 'start', value: 'order' },
      { text: 'Title', value: 'title' },
      { text: 'Text', value: 'text' },
      { text: 'Actions', value: 'actions', sortable: false },
    ],
    err: '',
    loadingTab: true,
    firstLoad: true,
    editedIndex: -1,
    editedItem: {
      order: '',
      title: '',
      text: ''
    },
    defaultItem: {
      order: '',
      title: '',
      text: ''
    },
    loading: false
  }),

  computed: {
    // Vuex mapGetters ➜ Pinia mapState
    ...mapState(useTermsStore, ['terms']),

    formTitle () {
      return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
    },

    filterHeaders () {
      return this.headers
    }
  },

  watch: {
    dialog (val) {
      val || this.close()
    },
    dialogDelete (val) {
      val || this.closeDelete()
    }
  },

  created () {
    this.initialize()
  },

  methods: {
    // Vuex mapActions ➜ Pinia mapActions
    ...mapActions(useTermsStore, [
      'fetchTerms',
      'addTerms',
      'editTerms',
      'deleteTerms'
    ]),

    initialize () {
      this.fetchTerms().then(() => {
        if (this.firstLoad) this.firstLoad = false
        this.loadingTab = false
      })
    },

    editItem (item) {
      this.editedIndex = this.terms.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem (item) {
      this.editedIndex = item._id
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },

    deleteItemConfirm () {
      this.deleteTerms(this.editedIndex)
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

    async createTerms () {
      try {
        await this.addTerms(this.editedItem)
      } catch (error) {
        this.err = error
        console.error('error create Term', error)
      }
    },

    save () {
      this.loading = true
      if (this.editedIndex > -1) {
        this.editTerms(this.editedItem).then(() => {
          this.loading = false
          this.close()
          this.initialize()
        })
      } else {
        this.createTerms().then(() => {
          this.close()
          this.loading = false
          this.initialize()
        })
      }
    }
  }
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
</style>