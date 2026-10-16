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

          <v-col>
            <h2 class="d-flex justify-center">Categories for Rented</h2>
            <CategoryOptionList 
              v-for="cat in categories.filter((e) => e.typeAccount === 'rented')" 
              :key="cat._id" 
              :category="cat" 
              @custom-event="fetchCategories"
            />
          </v-col>

          <v-col>
            <h2 class="d-flex justify-center">Categories for Seller</h2>
            <CategoryOptionList 
              v-for="cat in categories.filter((e) => e.typeAccount === 'seller')" 
              :key="cat._id" 
              :category="cat" 
              @custom-event="fetchCategories"
            />
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
  