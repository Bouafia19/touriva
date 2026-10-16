<template>
  <!-- Render current category as checkbox -->
  <v-list-item :style="{ paddingLeft: `${indentLevel * 20}px` }">
    <v-checkbox
      v-model="localSelected"
      :value="category._id"
      :label="category.name"
      hide-details
    />
  </v-list-item>

  <!-- Render children recursively -->
  <CategoryCheckbox
    v-for="child in category.children"
    :key="child._id"
    :category="child"
    v-model:selected="localSelected"
    :indent-level="indentLevel + 1"
  />
</template>

<script setup>
import { computed } from "vue"

const props = defineProps({
  category: { type: Object, required: true },
  indentLevel: { type: Number, default: 0 },
  selected: { type: Array, required: true },
})

const emit = defineEmits(["update:selected"])

// Proxy for v-model:selected
const localSelected = computed({
  get: () => props.selected,
  set: (val) => emit("update:selected", val),
})
</script>
