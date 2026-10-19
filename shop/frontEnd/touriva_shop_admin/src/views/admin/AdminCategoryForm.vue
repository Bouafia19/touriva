<template>
  <v-container fluid class="px-4 px-md-8 py-6">
    <!-- Editorial Page Header -->
    <div class="editorial-page-header">
      <div>
        <div class="editorial-tag mb-1">Catalog Structure</div>
        <h1 class="editorial-page-title">{{ categoryId ? 'Edit Category' : 'Add New Category' }}</h1>
        <p class="editorial-page-subtitle">Configure category taxonomy, parent inheritance, and visual badge icon.</p>
      </div>

      <div class="d-flex align-center gap-2">
        <v-btn
          variant="outlined"
          class="btn-editorial-outline px-4"
          prepend-icon="mdi-arrow-left"
          to="/admin/categories"
        >
          Back to List
        </v-btn>
      </div>
    </div>

    <!-- Form Card -->
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="editorial-card pa-6">
          <form @submit.prevent="saveCategory">
            <div class="mb-4">
              <label class="text-caption font-weight-bold text-deep-green d-block mb-1">Category Name</label>
              <v-text-field
                v-model="category.name"
                placeholder="e.g. Leather Goods, Travel Gear, Apparel"
                variant="outlined"
                density="comfortable"
                class="editorial-input"
                required
              ></v-text-field>
            </div>
            
            <div class="mb-4">
              <label class="text-caption font-weight-bold text-deep-green d-block mb-1">Parent Hierarchy</label>
              <select v-model="category.parent" class="editorial-select-box">
                <option :value="null">Root Category (No Parent)</option>
                <CategoryOption v-for="cat in categories" :key="cat._id" :category="cat" />
              </select>
            </div>

            <div class="mb-5">
              <label class="text-caption font-weight-bold text-deep-green d-block mb-1">Category Banner / Image</label>
              <v-file-input 
                v-model="imageFile" 
                accept="image/*"
                :label="$t('Photo') || 'Choose Image File'"
                variant="outlined"
                density="comfortable"
                prepend-icon=""
                prepend-inner-icon="mdi-camera"
                class="editorial-input"
                @change="onImageChange"
              />   

              <div v-if="category.img" class="mt-3 text-center">
                <div class="pa-3 bg-warm-ivory border-editorial rounded-lg d-inline-block">
                  <v-img 
                    :src="category.img"
                    height="180"
                    width="260"
                    contain
                    class="rounded-lg"
                    alt="Category visual"
                  ></v-img> 
                </div>
              </div>
            </div>

            <div class="pt-4 border-t d-flex justify-end gap-2">
              <v-btn
                to="/admin/categories"
                class="btn-editorial-ghost px-4 me-2"
              >
                Cancel
              </v-btn>
              <v-btn
                type="submit"
                class="btn-editorial-primary px-6"
                :loading="saving"
              >
                {{ categoryId ? 'Update Category' : 'Save Category' }}
              </v-btn>
            </div>
          </form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';
import CategoryOption from '@/components/CategoryOption.vue';

export default {
  props: ['categoryId'],
  components: { CategoryOption },
  data() {
    return {
      category: { name: '', parent: null, img: '' },
      categories: [],
      imageFile: null,
      saving: false,
    };
  },
  async created() {
    await this.fetchCategories();
    if (this.categoryId) {
      await this.fetchCategory(this.categoryId);
    }
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

    saveImage(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.category.img = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    onImageChange(e) {
      const file = this.imageFile?.[0] || this.imageFile;
      if (!file) return;
      this.saveImage(file);
    },

    async fetchCategory(id) {
      try {
        const response = await axios.get(`/api/categories/${id}`);
        this.category = response.data;
      } catch (error) {
        console.error('Error fetching category:', error);
      }
    },

    async saveCategory() {
      this.saving = true;
      try {
        if (this.categoryId) {
          await axios.patch(`/api/categories/${this.categoryId}`, this.category);
        } else {
          await axios.post('/api/categories/add', this.category);
        }
        this.$router.push('/admin/categories');
      } catch (error) {
        console.error('Error saving category:', error);
      } finally {
        this.saving = false;
      }
    },
  }
};
</script>

<style scoped>
.editorial-select-box {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: #FFFFFF;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 0.88rem;
  color: var(--color-text-primary);
  width: 100%;
  height: 48px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s ease;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23173F35'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 18px;
}

.editorial-select-box:focus {
  border-color: var(--color-emerald);
}
</style>
