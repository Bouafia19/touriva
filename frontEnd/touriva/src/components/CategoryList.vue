<template>
  <ul>
    <li v-for="category in categories" :key="category._id">
      <router-link :to="`/category/${category._id}`">{{ category.name }}</router-link>
      <CategoryList v-if="category.children.length && category.parent" :categories="category.children" />
    </li>
  </ul>
</template>
  
<script>
  export default {
    name: "CategoryList",
    props: {
      categories: Array,
    },
  };
</script>
  