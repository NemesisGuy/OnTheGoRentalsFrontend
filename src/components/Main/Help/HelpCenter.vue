<template>
  <div class="two-column-layout">
    <!-- Sidebar with Categories -->
    <aside class="sidebar">
      <h2>Categories</h2>
      <hr>
      <ul class="sidebar-menu">
        <li v-for="(category, index) in categories" :key="index">
          <a href="#" @click.prevent="selectCategory(category)">
            {{ category }}
          </a>
        </li>
      </ul>
    </aside>

    <!-- Main Content Area -->
    <main class="content-help-center">
      <h1>Help Center</h1>
      <hr>

      <!-- Entries Filtered by Selected Category -->
      <div v-if="filteredHelpCenters.length">
        <div v-for="(helpCenter, index) in filteredHelpCenters" :key="index" class="help-entry">
          <h3>{{ helpCenter.title }}</h3>
          <p>{{ helpCenter.content }}</p>
          <hr>
        </div>
      </div>
      <div v-else>
        <p>No help entries available for this category.</p>
        <hr>

      </div>
    </main>
  </div>
</template>

<script>
import api from "@/api";

export default {
  name: 'TwoColumnHelpCenter',
  data() {
    return {
      helpCenters: [],
      categories: [],
      selectedCategory: 'All'
    };
  },
  computed: {
    filteredHelpCenters() {
      return this.selectedCategory === 'All'
          ? this.helpCenters
          : this.helpCenters.filter(entry => entry.category === this.selectedCategory);
    }
  },
  mounted() {
    this.fetchHelpCenters();
  },
  methods: {
    fetchHelpCenters() {
      api.get('/api/v1/contact-us')
          .then(response => {
            this.helpCenters = response.data.data;
            this.categories = ['All', ...new Set(response.data.map(entry => entry.category))];
          })
          .catch(error => {
            console.error('Error fetching help centers:', error);
          });
    },
    selectCategory(category) {
      this.selectedCategory = category;
    }
  }
};
</script>

<style scoped>
.two-column-layout {
  display: flex;
}

.sidebar {
  /*
  position: fixed; !* Makes the sidebar stick to the left *!
  */
  float: left;
  top: 0; /* Aligns the sidebar to the top */
  left: 0; /* Sticks the sidebar to the left of the screen */
  width: 17rem; /* Sets the width of the sidebar */
  height: 100%; /* Makes the sidebar span the full height of the viewport */
  /* background-color: var(--primary-color);*/
  padding: 20px;
  /*
  margin-top: 80px;
  */
}

.content-help-center {
  /*
  margin-left: 220px; !* Adjusts the content to not overlap with the fixed sidebar *!
  */
  padding: 15px;
  flex: 1;
  width: 99.5em;
}

.help-entry {
  margin-bottom: 20px;
  padding: 10px;
  /* border-bottom: 1px solid #ddd;*/
}

</style>
