<template>
  <div class="card-container">
    <div class="faq">
      <h1>Frequently Asked Questions</h1>
      <router-link to="/help-center" class="back-button">Back to Help Center</router-link>
      <hr>
      <div class="faq-list" v-if="faqList">
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


.faq {
  width: 650px;
  background-color: #fff; /* FAQ container background color (White) */
  padding: 30px;
  border-radius: 10px;
}

.faq h1 {
  margin-bottom: 20px;
  text-align: center;
  color: #555;
}

.back-button {
  display: block;
  text-align: center;
  margin-bottom: 20px;
  color: #f2105e; /* Button color (Purple) */
  font-weight: bold;
}

.faq hr {
  border: none;
  border-top: 2px solid #f2105e;
  margin: 20px 0;
}

.faq-list ul {
  padding: 0;
}

.faq-item {
  margin-bottom: 30px;
}

.faq-item h3 {
  font-size: 1.5em;
  margin-bottom: 10px;
  color: #333;
}

.faq-item p {
  font-size: 1.2em;
  color: #555;
}

.faq-item h3, .faq-item p {
  text-align: left;
  margin: 0;
}
</style>

