<template>
    <div>
      <v-container>
        <h2 class="d-flex justify-center">Manage Categories</h2>
        <v-row justify="end" class="ma-2">
          <v-btn 
            color="info"
            to="/admin/category/add"
          >
            Add New Category
          </v-btn>
        </v-row>
        <v-row>

          <v-col
            md="4"
          >
            <h2 class="d-flex justify-center">Categories</h2>
            <div v-if="categories.length > 0">
              <CategoryOptionList 
                v-for="cat in categories" 
                :key="cat._id" 
                :category="cat" 
                @custom-event="fetchCategories"
              />
            </div>
           
            <div v-else-if="categories.length === 0">
              <v-alert type="info">{{ $t('Ncf') }}</v-alert>
            </div>
          </v-col>

        </v-row>
        
      </v-container>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import CategoryOptionList from '@/components/CategoryOptionList.vue'
  
  export default {
    components: { CategoryOptionList },
    data() {
      return {
        categories: [],
      };
    },
    async created() {
      await this.fetchCategories();
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
      async deleteCategory(categoryId) {
        if (confirm('Are you sure you want to delete this category?')) {
          try {
            await axios.delete(`/api/categories/${categoryId}`);
            await this.fetchCategories();
          } catch (error) {
            console.error('Error deleting category:', error);
          }
        }
      },
    },
  };
  </script>
  