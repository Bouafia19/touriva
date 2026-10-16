<template>
    <div>
      <h2>Announcements in Category</h2>
      <ul>
        <li v-for="announcement in announcements" :key="announcement._id">
          {{ announcement.name }} - ${{ announcement.price }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    props: ['categoryId'],
    data() {
      return {
        announcements: [],
      };
    },
    async created() {
      try {
        const response = await axios.get(`/api/announcements/getAnnouncementsByCategory/${this.categoryId}`);
        this.announcements = response.data;
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    },
  };
  </script>
  