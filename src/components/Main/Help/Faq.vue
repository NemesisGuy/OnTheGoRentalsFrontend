<template>
  <div class="card-container">
    <div class="faq">
      <h1>Frequently Asked Questions</h1>
      <hr>
      <div v-if="faqList" class="faq-list">
        <div class="accordion" id="faqAccordion">
          <div v-for="faq in faqList" :key="faq.id" class="accordion-item">
            <h2 class="accordion-header" :id="`heading${faq.id}`">
              <button
                  class="accordion-button"
                  type="button"
                  data-bs-toggle="collapse"
                  :data-bs-target="`#collapse${faq.id}`"
                  aria-expanded="false"
                  :aria-controls="`collapse${faq.id}`"
              >
                {{ faq.question }}
              </button>
            </h2>
            <div
                :id="`collapse${faq.id}`"
                class="accordion-collapse collapse"
                :aria-labelledby="`heading${faq.id}`"
                data-bs-parent="#faqAccordion"
            >
              <div class="accordion-body">
                {{ faq.answer }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <p>Loading FAQs...</p>
      </div>
      <hr>
      <div class="button-container">
        <router-link class="deny-button button" to="/help-center">Back to Help Center</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import api from "@/api";

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
      api
          .get('/api/faq/get-all')
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
.button-container {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}


</style>

