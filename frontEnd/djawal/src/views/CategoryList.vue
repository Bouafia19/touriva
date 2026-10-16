<template>
  <div>
    <h2>{{ categoryName || 'Categories' }}</h2>
    <ul>
      <li v-for="category in categories" :key="category._id">
        <router-link :to="{ name: 'CategoryList', params: { categoryId: category._id } }">
          {{ category.name }}
        </router-link>
      </li>
    </ul>
    <button v-if="hasAnnouncements" @click="goToAnnouncements">View Announcements</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  props: ['categoryId'],
  data() {
    return {
      categories: [],
      categoryName: '',
      hasAnnouncements: false,
    };
  },
  async created() {
    await this.fetchCategory();
    await this.fetchSubcategories();
  },
  methods: {
    async fetchCategory() {
      if (this.categoryId) {
        try {
          const response = await axios.post(`/api/categories/${this.categoryId}`);
          this.categoryName = response.data.name;
          this.hasAnnouncements = response.data.hasAnnouncements; // Assuming this comes from the API
        } catch (error) {
          console.error('Error fetching category:', error);
        }
      }
    },
    async fetchSubcategories() {
      try {
        const response = await axios.post(`/api/categories/nested/${this.categoryId || null}`);
        this.categories = response.data.children || [];
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      }
    },
    goToAnnouncements() {
      this.$router.push({ name: 'AnnouncementList', params: { categoryId: this.categoryId } });
    },
  },
};
</script>
