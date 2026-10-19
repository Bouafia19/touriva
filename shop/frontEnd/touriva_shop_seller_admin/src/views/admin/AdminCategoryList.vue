<template>
  <v-container fluid class="px-4 px-md-8 py-6">
    <!-- Editorial Page Header -->
    <div class="editorial-page-header">
      <div>
        <div class="editorial-tag mb-1">Catalog Structure</div>
        <h1 class="editorial-page-title">Category Management</h1>
        <p class="editorial-page-subtitle">Organize product hierarchy, parent-child relationships, and taxonomy.</p>
      </div>

      <div class="d-flex align-center gap-2">
        <v-btn
          class="btn-editorial-primary px-5"
          prepend-icon="mdi-plus"
          to="/admin/category/add"
        >
          Add New Category
        </v-btn>
      </div>
    </div>

    <!-- Category Tree Container -->
    <div class="editorial-card pa-6">
      <div class="d-flex align-center justify-space-between mb-4 pb-3 border-b">
        <div class="d-flex align-center">
          <v-icon icon="mdi-sitemap" color="forestGreen" class="me-2"></v-icon>
          <h2 class="text-subtitle-1 font-weight-bold text-deep-green font-serif mb-0">Category Hierarchy Tree</h2>
        </div>
        <v-btn
          icon="mdi-refresh"
          variant="text"
          density="comfortable"
          color="forestGreen"
          @click="fetchCategories"
          title="Refresh hierarchy"
        ></v-btn>
      </div>

      <div v-if="categories.length > 0" class="category-tree-container">
        <CategoryOptionList 
          v-for="cat in categories" 
          :key="cat._id" 
          :category="cat" 
          @custom-event="fetchCategories"
        />
      </div>

      <div v-else class="text-center py-12 px-4">
        <v-icon icon="mdi-folder-open-outline" size="48" color="sand" class="mb-2"></v-icon>
        <div class="text-subtitle-1 font-weight-medium text-deep-green">No Categories Configured</div>
        <p class="text-caption text-editorial-secondary mb-3">Create root and subcategories to classify merchandise.</p>
        <v-btn class="btn-editorial-primary px-4" size="small" to="/admin/category/add">
          Create First Category
        </v-btn>
      </div>
    </div>
  </v-container>
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
        this.categories = response.data || [];
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

<style scoped>
.category-tree-container {
  max-width: 900px;
}
</style>