<template>
    <div 
      :value="category._id"
      class="ma-2"
      :class="[category.parent ? 'parentClass' : 'childClass']"
    >
      <v-row class="ma-2">
        <v-col>
          {{ indentation }}{{ category.name }}
        </v-col>
        <v-col>
          <v-btn
            :to="`/admin/category/edit/${category._id}`"
            class="ml-2"
            color="next"
          >
            Edit
          </v-btn>   
          <v-btn
            @click="deleteCategory(category._id)"
            class="ml-2"
            color="error"
          >
          Delete
          </v-btn>
        </v-col>
      </v-row>
    </div>
    <CategoryOptionList
      v-for="child in category.children" 
      :key="child._id" 
      :category="child" 
      :indent-level="indentLevel + 1" 
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
    computed: {
      indentation() {
        return '+ '.repeat(this.indentLevel);
      },
    },

    methods: {
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

     fetchCategories() {
        this.$emit('custom-event');
      },
    }
  };
  </script>

<style scoped>
.parentClass{
  background-color: blanchedalmond;
  color: black;
}
.childClass{
  background-color: brown;
  color: white;
}
</style>
  