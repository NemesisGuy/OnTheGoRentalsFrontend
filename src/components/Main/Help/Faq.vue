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
// import axios from 'axios'; // Unused, api instance is used
import api from "@/api";

/**
 * @file Faq.vue
 * @description This component displays a list of Frequently Asked Questions (FAQs).
 * It fetches FAQ data from an API and presents them in an accordion-style interface,
 * allowing users to expand each question to see its answer.
 * @component Faq
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'Faq',
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {Array<object>|null} faqList - An array to store the fetched FAQ objects.
   *                                          Each object is expected to have `id`, `question`, and `answer` properties.
   *                                          Initially null until data is loaded.
   */
  data() {
    return {
      faqList: null,
    };
  },
  /**
   * Lifecycle hook that is called after the component has been mounted to the DOM.
   * It triggers the fetching of the FAQ list.
   */
  mounted() {
    this.fetchFaqList();
  },
  methods: {
    /**
     * Fetches the list of FAQs from the backend API.
     * On successful fetch, it updates the `faqList` data property.
     * Logs an error to the console if the fetch fails.
     * @async
     * @returns {void}
     */
    fetchFaqList() {
      api
          .get('/api/v1/faqs')
          .then((response) => {
            // Assuming the API returns data in response.data.data structure
            this.faqList = response.data.data;
          })
          .catch((error) => {
            console.error('Error fetching FAQ list:', error);
            this.faqList = []; // Set to empty array on error to stop "Loading..."
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

