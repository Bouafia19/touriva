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
        
        <v-data-table
            :headers="headers"
            :items="products.getProducts"
            :loading="products.loading"
            :search="search"
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
                <v-toolbar-title>{{ $t('Products') }}</v-toolbar-title>
                <v-divider
                class="mx-4"
                inset
                vertical
                ></v-divider>

                 <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    :label="$t('Search')"
                    single-line
                    hide-details
                    class="shrink mx-4"
                    dense
                ></v-text-field>
                
                <v-spacer></v-spacer>

                <v-dialog
                    v-model="dialog"
                    :max-width="'500px'"
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
                        <v-row justify="center">
                            <v-col
                                
                            >
                                <v-text-field
                                    v-model="editedItem.code"
                                    :label="$t('Code')"
                                    outlined
                                    dense
                                    append-icon="mdi-qrcode"
                                    @click:append="generateCode"
                                ></v-text-field>

                                <v-text-field
                                    v-model="editedItem.name"
                                    label="name"
                                    type="text"
                                ></v-text-field>

                                <v-text-field
                                    v-model="editedItem.price"
                                    label="price"
                                    type="text"
                                ></v-text-field>

                                <v-text-field
                                    v-model="editedItem.description"
                                    label="description"
                                    type="text"
                                ></v-text-field>

                                <div class="mb-4">
                                    <select v-model="editedItem.categoryId" class="select-box">
                                        <option :value="null">Root Category</option>
                                        <CategoryOption v-for="cat in categories" :key="cat._id" :category="cat" />
                                    </select>
                                </div>

                                <v-autocomplete
                                    v-model="editedItem.brandId"
                                    :items="brands.getBrands"
                                    item-title="name"       
                                    item-value="_id"
                                ></v-autocomplete>

                                <v-checkbox
                                    v-model="editedItem.published"
                                    :label="$t('published')"
                                ></v-checkbox>

                                <v-file-input 
                                    v-model="editedItem.img" 
                                    type="file" 
                                    :label="$t('appPhoto')"
                                    outlined
                                    prepend-icon="mdi-camera"
                                    dense
                                    @change="onImageChange"
                                    class="mt-4"
                                />   
                                <v-img 
                                    :src="editedItem.img"
                                    contain
                                    width="400"
                                    height="300"
                                    style="float: right; border: 1px solid;"
                                    alt="Image"
                                >             
                                </v-img> 

                                <v-row justify="center">
                                    <v-col 
                                        cols="12" 
                                        md="8"
                                    >
                                        <v-file-input
                                            v-model="thumbnail"
                                            :label="$t('UploadThumbnails')"
                                            @change="handleFileUpload"
                                            outlined
                                            dense
                                        ></v-file-input>

                                        <v-row class="mt-4" justify="center">
                                            <v-img
                                                v-for="(thumbnail, index) in editedItem.thumbnails"
                                                :key="index"
                                                :src="thumbnail"
                                                aspect-ratio="1"
                                                :alt="$t('ThumbnailPreview')"
                                                class="thumbnail"
                                                @click="removeThumbnail(index)"
                                            ></v-img>
                                        </v-row>
                                    </v-col>
                                </v-row>
                                
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
                        :loading="loading"
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
                    <v-btn color="error" text @click="closeDelete">Cancel</v-btn>
                    <v-btn 
                        color="success" 
                        text 
                        @click="deleteItemConfirm"
                        :loading="loadingDelete"
                    >
                        OK
                    </v-btn>
                    <v-spacer></v-spacer>
                    </v-card-actions>
                </v-card>
                </v-dialog>
            </v-toolbar>
            </template>
            <template v-slot:[`item.actions`]="{ item }">
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

<script setup>
    import { ref, onMounted, nextTick, computed, watch } from 'vue'
    import { useProductsStore } from '@/stores/products'
    import { useBrandsStore } from '@/stores/brands'
    import CategoryOption from '@/components/CategoryOption.vue'
    import axios from 'axios'

    const products = useProductsStore()
    const brands = useBrandsStore()

    let search = ref(''),
        dialog = ref(false),
        dialogDelete = ref(false),
        loadingDelete = ref(false),
        headers = ref([
            {
                text: 'code',
                align: 'start',
                sortable: false,
                value: 'code',
            },
            {
                text: 'title',
                align: 'start',
                sortable: false,
                value: 'name',
            },
            { text: 'description', value: 'description' },
            { text: 'price', value: 'price' },
            
            { text: 'Actions', value: 'actions', sortable: false },
        ]),
        loading = ref(false),
        err = ref(''),
        editedIndex = ref(-1),
        deleteId = ref(-1),
        editedItem = ref({
            code: '',
            name: '',
            price: '',
            description: '',
            img: '',
            categoryId: null,
            brandId: null,
            published: true,
            thumbnails: []
        }),
        defaultItem = ref({
            code: '',
            name: '',
            price: '',
            description: '',
            img: '',
            categoryId: null,
            brandId: null,
            published: true,
            thumbnails: []
        }),
        thumbnail = ref(null),
        categories = ref([])

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

        const initialize = () => {
            products.fetchProducts()
            brands.fetchBrands()
            fetchCategories()
        }

        const generateCode = () => {
            const count = products.getProducts.length + 1
            let str = String(count).padStart(5, "0")
            editedItem.value.code = "A" + str
        }

        // Handle File Upload
        const handleFileUpload = (file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                editedItem.value.thumbnails.push(e.target.result); // Add the base64 image to thumbnails
            }
            reader.readAsDataURL(thumbnail.value)
        }

        // Remove Thumbnail
        const removeThumbnail = (index) => {
            editedItem.value.thumbnails.splice(index, 1); // Remove the clicked thumbnail
        }

        const onImageChange = (file) => {
            if (!file) {
                return
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                editedItem.value.img = e.target.result
            }
            reader.readAsDataURL(editedItem.value.img)
        }

        const fetchCategories = async () => {
            try {
                const response = await axios.post('/api/categories/nested')
                categories.value = response.data
            } catch (error) {
                console.error('Error fetching categories:', error)
            }
        }

        const editItem = (item) => {
            console.log('item', item)
            editedIndex.value = products.getProducts.indexOf(item)
            editedItem.value = Object.assign({}, item)
            dialog.value = true
        }

        const deleteItem = (item) => {
            editedIndex.value = products.getProducts.indexOf(item)
            deleteId.value = item._id
            editedItem.value = Object.assign({}, item)
            dialogDelete.value = true
        }

        const deleteItemConfirm = () => {
            loadingDelete.value = true
            products.deleteProducts(deleteId.value).then(() => {
                products.getProducts.splice(editedIndex.value, 1)
                initialize()
                loadingDelete.value = false
                closeDelete()
            })
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
            console.log('editedItem', editedItem.value)
            loading.value = true
            if (editedIndex.value > -1) {
                
                products.editProducts(editedItem.value).then(() => {
                    Object.assign(products.products[editedIndex.value], editedItem.value)
                   
                    loading.value = false
                    close()
                    initialize()
                })
            } else {
                products.addProducts(editedItem.value).then(() => {
                    close()
                    loading.value = false
                    initialize()
                })
            }   
        }
</script>

<style scoped>
.select-box {
  appearance: none; /* Remove default styles */
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: #f3f3f3;
  border-bottom: 1px solid #ccc;
  /* border-radius: 4px; */
  padding: 10px;
  font-size: 16px;
  color: #333;
  width: 100%;
  height: 56px;
  /* max-width: 300px; */
  outline: none;
  cursor: pointer;
  transition: border-color 0.3s ease;
  position: relative;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px top 50%;
  background-size: 16px;
}

</style>