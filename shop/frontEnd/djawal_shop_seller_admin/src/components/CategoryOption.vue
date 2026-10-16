<template>
    <option :value="category._id">
      {{ indentation }}{{ category.name }}
    </option>
    <CategoryOption v-for="child in category.children" :key="child._id" :category="child" :indent-level="indentLevel + 1" />
  </template>
  
  <script>
  export default {
    name: "CategoryOption",
    props: {
      category: Object,
      indentLevel: {
        type: Number,
        default: 0,
      },
    },
    computed: {
      indentation() {
        return '- '.repeat(this.indentLevel);
      },
    },
  };
  </script>
  