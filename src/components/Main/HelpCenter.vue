<template>
  <div class="card-container">
    <div class="help-center">
      <h1>Help Center</h1>
      <div class="filter-container">
        <select v-model="selectedCategory" class="filter-dropdown">
          <option value="All">Show All</option>
          <option value="Booking">Booking</option>
          <option value="General">General</option>
          <option value="Accounts">Accounts</option>
        </select>
        <button class="faq-button" @click="openFAQPage">FAQ</button>
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
      selectedCategory: 'All'
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
          })
          .catch((error) => {
            console.error(error);
          });
    },
    openFAQPage() {
      this.$router.push('/faq');
    }
  }
};
</script>

<style scoped>
.card-container {
  display: flex;
  justify-content: center;
  background-color: #f2105e;
  padding: 30px;
}

.help-center {
  width: 650px;
  height: 100%;
  background-color: #fff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

.help-center h1 {
  margin-bottom: 20px;
  text-align: center;
  color: #555;
}

.filter-container {
  display: flex;
  align-items: center;
}

.filter-dropdown {
  font-size: 16px;
  padding: 8px;
  border-radius: 5px;
}

.filter-dropdown:focus {
  outline: none;
}

.filter-dropdown option {
  background-color: #fff;
  color: #333;
}

.filter-dropdown option:hover {
  background-color: #f2105e;
  color: #fff;
}

.faq-button {
  font-size: 16px;
  padding: 8px 16px;
  margin-left: 10px;
  border-radius: 5px;
  background-color: #f2105e;
  color: #fff;
  border: none;
  cursor: pointer;
}

.faq-button:focus {
  outline: none;
}

.faq-button:hover {
  background-color: #ff005a;
}

.help-center hr {
  border: none;
  border-top: 2px solid #f2105e;
  margin: 20px 0;
}

.help-center p, .help-center h3 {
  text-align: start;
  margin: 0;
}

.help-center h3 {
  font-size: 1.5em;
  margin-bottom: 10px;
  color: #333;
}

.help-center p {
  font-size: 1.2em;
  color: #555;
}
</style>



<!--<template>-->
<!--  <div class="card-container">-->
<!--    <div class="help-center">-->
<!--      <h1 class="title">Help Center</h1>-->
<!--      <select v-model="selectedCategory" class="category-dropdown">-->
<!--        <option value="All">Show All</option>-->
<!--        <option value="Booking">Booking</option>-->
<!--        <option value="General">General</option>-->
<!--        <option value="Accounts">Accounts</option>-->
<!--      </select>-->
<!--      <hr>-->
<!--      <div v-if="filteredHelpCenters && filteredHelpCenters.length > 0">-->
<!--        <div v-for="helpCenter in filteredHelpCenters" :key="helpCenter.id" class="help-entry">-->
<!--          <h3>{{ helpCenter.title }}</h3>-->
<!--          <p>{{ helpCenter.content }}</p>-->
<!--          <hr>-->
<!--        </div>-->
<!--      </div>-->
<!--      <div v-else>-->
<!--        <p class="loading-text">Loading help center content...</p>-->
<!--      </div>-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--import axios from 'axios';-->

<!--export default {-->
<!--  name: 'HelpCenter',-->
<!--  data() {-->
<!--    return {-->
<!--      helpCenters: null,-->
<!--      originalHelpCenters: null,-->
<!--      selectedCategory: 'All'-->
<!--    };-->
<!--  },-->
<!--  computed: {-->
<!--    filteredHelpCenters() {-->
<!--      if (this.selectedCategory === 'All') {-->
<!--        return this.helpCenters;-->
<!--      } else {-->
<!--        return this.originalHelpCenters.filter(entry => entry.category === this.selectedCategory);-->
<!--      }-->
<!--    }-->
<!--  },-->
<!--  mounted() {-->
<!--    this.fetchHelpCenters();-->
<!--  },-->
<!--  methods: {-->
<!--    fetchHelpCenters() {-->
<!--      axios-->
<!--          .get('http://localhost:8080/api/help-center/get-all')-->
<!--          .then((response) => {-->
<!--            this.helpCenters = response.data;-->
<!--            this.originalHelpCenters = response.data;-->
<!--          })-->
<!--          .catch((error) => {-->
<!--            console.error(error);-->
<!--          });-->
<!--    },-->
<!--  },-->
<!--};-->
<!--</script>-->

<!--<style scoped>-->
<!--.card-container {-->
<!--  display: flex;-->
<!--  justify-content: center;-->
<!--}-->

<!--.help-center {-->
<!--  margin-top: 20px;-->
<!--  width: 800px;-->
<!--}-->

<!--.title {-->
<!--  margin-bottom: 10px;-->
<!--  font-size: 60px;-->
<!--}-->

<!--.category-dropdown {-->
<!--  width: 150px;-->
<!--  padding: 5px;-->
<!--  background-color: #f2105e;-->
<!--  color: #fff;-->
<!--  border: none;-->
<!--}-->

<!--.category-dropdown option {-->
<!--  background-color: #fff;-->
<!--  color: #000;-->
<!--}-->

<!--.help-entry {-->
<!--  margin-bottom: 20px;-->
<!--}-->

<!--.loading-text {-->
<!--  color: #f2105e; /* Pink color */-->
<!--}-->

<!--</style>-->


