<template>
  <div class="card-container">
    <div class="help-center">
      <h1>Help Center</h1>
      <div class="filter-container">
        <select v-model="selectedCategory" class="filter-dropdown">
          <option value="All">Show All</option>
          <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
        </select>
<!--        <button class="faq-button button" @click="openFAQPage">FAQ</button>-->
      </div>
      <hr>
      <div v-if="filteredHelpCenters && filteredHelpCenters.length > 0">
        <div v-for="helpCenter in filteredHelpCenters" :key="helpCenter.id">
          <h3>{{ helpCenter.title }}</h3>
          <p>{{ helpCenter.content }}</p>
          <hr>
        </div>
      </div>
      <div v-else>
        <p>Loading help center content...</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'HelpCenter',
  data() {
    return {
      helpCenters: null,
      originalHelpCenters: null,
      selectedCategory: 'All',
      categories: []
    };
  },
  computed: {
    filteredHelpCenters() {
      if (this.selectedCategory === 'All') {
        return this.helpCenters;
      } else {
        return this.helpCenters.filter(entry => entry.category === this.selectedCategory);
      }
    }
  },
  mounted() {
    this.fetchHelpCenters();
  },
  methods: {
    fetchHelpCenters() {
      axios
          .get('http://localhost:8080/api/help-center/get-all')
          .then((response) => {
            this.helpCenters = response.data;
            this.originalHelpCenters = response.data;
            this.categories = [...new Set(response.data.map(entry => entry.category))];
          })
          .catch((error) => {
            console.error(error);
          });
    },
    // openFAQPage() {
    //   this.$router.push('/faq');
    // }
  }
};
</script>

<style scoped>



</style>





