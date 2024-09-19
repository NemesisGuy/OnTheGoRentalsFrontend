<template>
  <div class="card-container">
    <div class="faq">
      <h1>Frequently Asked Questions</h1>
      <hr>
      <div v-if="faqList" class="faq-list">
        <ul>
          <li v-for="faq in faqList" :key="faq.id" class="faq-item">
            <h3>{{ faq.question }}</h3>
            <p>{{ faq.answer }}</p>
            <hr>
          </li>
        </ul>
      </div>
      <div v-else>
        <p>Loading FAQs...</p>
      </div>
      <div class="button-container">
        <router-link class="deny-button button" to="/help-center">Back to Help Center</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Faq',
  data() {
    return {
      faqList: null,
    };
  },
  mounted() {
    this.fetchFaqList();
  },
  methods: {
    fetchFaqList() {
      axios
          .get('http://localhost:8080/api/faq/get-all')
          .then((response) => {
            this.faqList = response.data;
          })
          .catch((error) => {
            console.error(error);
          });
    },
  },
};
</script>

<style scoped>



</style>

