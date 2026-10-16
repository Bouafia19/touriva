<template>
  <div>
    <h2 class="d-flex justify-center">{{ categoryId ? 'Edit' : 'Add' }} Category</h2>
    <v-container>
      <v-row
        justify="center"
      >
        <v-col
          cols="12"
          md="4"
        >
          <form @submit.prevent="saveCategory">
            <v-text-field
              v-model="category.name"
              label="Category Name"
              required
            ></v-text-field>

            <v-select
              v-model="category.typeAccount"
              :items="items"
              label="TypeCategory"
            ></v-select>
            
            <div>
              <select v-model="category.parent" class="select-box">
                <option :value="null">Root Category</option>
                <CategoryOption v-for="cat in categories" :key="cat._id" :category="cat" />
              </select>
            </div>
            <div>
              <v-file-input 
                v-model="category.img" 
                type="file" 
                :label="$t('appPhoto')"
                outlined
                prepend-icon="mdi-camera"
                dense
                @change="onImageChange"
                class="mt-4"
              />   
              <v-row justify="center" class="ma-2">
              <v-avatar 
                size="300"
                rounded="lg"
              >
                <v-img 
                  :src="category.img"
                  cover
                  style="float: center; border: 1px solid;"
                  alt=""
                ></v-img> 
              </v-avatar>
            </v-row>
            </div>
            <v-row justify="center" class="ma-2">
              <v-btn color="next" type="submit">Add Category</v-btn>
            </v-row>
          </form>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import axios from 'axios';
import CategoryOption from '@/components/CategoryOption.vue';

export default {
  props: ['categoryId'],
  components: { CategoryOption },
  data() {
    return {
      category: { name: '', parent: null, img: '', typeAccount: '' },
      categories: [],
      items: ['rented', 'seller']
    };
  },
  async created() {
    await this.fetchCategories();
    if (this.categoryId) {
      await this.fetchCategory(this.categoryId);
    }
  },
  methods: {
    async fetchCategories() {
      try {
        const response = await axios.post('/api/categories/nested');
        this.categories = response.data;
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    },
    // async addCategory() {
    //   try {
    //     await axios.post('/api/categories/add', this.category);
    //     alert('Category added successfully!');
    //     this.category.name = '';
    //     this.category.parent = null;
    //     await this.fetchCategories();
    //   } catch (error) {
    //     console.error('Error adding category:', error);
    //   }
    // },

    saveImage(file){
      const reader = new FileReader();
      reader.onload = (e) => {
        this.category.img = e.target.result;
      };
      reader.readAsDataURL(this.category.img);
    },

    onImageChange(file){
      if (!file) {
        return;
      }
      this.saveImage(file);
    },

    async fetchCategory(id) {
      try {
        const response = await axios.get(`/api/categories/${id}`);
        this.category = response.data;
      } catch (error) {
        console.error('Error fetching category:', error);
      }
    },

    async saveCategory() {
      try {
        if (this.categoryId) {
          await axios.patch(`/api/categories/${this.categoryId}`, this.category);
        } else {
          await axios.post('/api/categories/add', this.category);
        }
        this.$router.push('/admin/categories');
      } catch (error) {
        console.error('Error saving category:', error);
      }
    },
  }
};
</script>

<style scoped>
/* Basic styling for the select box */
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

/* Hover and focus effects */
.select-box:hover {
  border-color: #888;
}

.select-box:focus {
  border-color: #555;
  box-shadow: 0 0 5px rgba(85, 85, 85, 0.5);
}


</style>
