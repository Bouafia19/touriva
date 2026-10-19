<template>
  <div 
    :value="category._id"
    class="category-node-row mb-2 pa-2 rounded-lg"
    :class="[category.parent ? 'category-parent-node' : 'category-root-node']"
    :style="{ marginLeft: indentLevel * 20 + 'px' }"
  >
    <div class="d-flex align-center justify-space-between flex-wrap gap-2">
      <div class="d-flex align-center">
        <v-icon 
          :icon="category.parent ? 'mdi-subdirectory-arrow-right' : 'mdi-folder-outline'" 
          size="18" 
          color="forestGreen" 
          class="me-2"
        ></v-icon>
        <span class="font-weight-medium text-deep-green">{{ category.name }}</span>
        <span v-if="category.children?.length" class="text-caption text-editorial-secondary ms-2">
          ({{ category.children.length }} subcategories)
        </span>
      </div>
      <div>
        <v-btn
          :to="`/admin/category/edit/${category._id}`"
          class="btn-editorial-outline px-3 me-2"
          size="x-small"
          prepend-icon="mdi-pencil"
        >
          Edit
        </v-btn>   
        <v-btn
          @click="deleteCategory(category._id)"
          size="x-small"
          variant="tonal"
          color="error"
          rounded="pill"
          prepend-icon="mdi-delete"
        >
          Delete
        </v-btn>
      </div>
    </div>
  </div>
  <CategoryOptionList
    v-for="child in category.children" 
    :key="child._id" 
    :category="child" 
    :indent-level="indentLevel + 1"
    @custom-event="fetchCategories"
  ></CategoryOptionList>
</template>

<script>
import axios from 'axios';
export default {
  name: "CategoryOptionList",
  props: {
    category: Object,
    indentLevel: {
      type: Number,
      default: 0,
    },
  },

  methods: {
    async deleteCategory(categoryId) {
      if (confirm('Are you sure you want to delete this category?')) {
        try {
          await axios.delete(`/api/categories/${categoryId}`);
          this.fetchCategories();
        } catch (error) {
          console.error('Error deleting category:', error);
        }
      }
    },

    fetchCategories() {
      this.$emit('custom-event');
    },
  }
};
</script>

<style scoped>
.category-node-row {
  border: 1px solid var(--color-border);
  transition: all 0.2s ease;
}

.category-root-node {
  background-color: #FFFFFF;
  border-left: 4px solid var(--color-forest-green);
}

.category-parent-node {
  background-color: var(--color-sand-light);
  border-left: 3px solid var(--color-sand-dark);
}

.category-node-row:hover {
  border-color: var(--color-sand);
  box-shadow: 0 2px 8px rgba(16, 45, 39, 0.05);
}
</style>