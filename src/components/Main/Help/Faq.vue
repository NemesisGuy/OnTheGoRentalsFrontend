<template>
  <div class="content-container">
    <div class="page-header">
      <h1><i class="fas fa-question-circle"></i> Frequently Asked Questions</h1>
      <p>Find answers to common questions about our services and policies.</p>
    </div>

    <!-- Loading State with Shimmer -->
    <div v-if="isLoading" class="faq-list">
      <div v-for="i in 4" :key="i" class="shimmer-card">
        <div class="shimmer shimmer-line"></div>
      </div>
    </div>

    <!-- No FAQs Message -->
    <div v-else-if="!faqList || faqList.length === 0" class="no-content-card">
      <i class="fas fa-file-alt empty-icon"></i>
      <h2>No FAQs Available</h2>
      <p>We're currently updating our FAQ section. Please check back later.</p>
    </div>

    <!-- FAQ Accordion List -->
    <div v-else class="faq-list">
      <div v-for="faq in faqList" :key="faq.id" class="faq-item">
        <div class="faq-question" @click="toggleFaq(faq.id)">
          <span>{{ faq.question }}</span>
          <i class="fas fa-chevron-down" :class="{ 'is-open': openFaqId === faq.id }"></i>
        </div>
        <transition name="slide">
          <div v-if="openFaqId === faq.id" class="faq-answer">
            <p>{{ faq.answer }}</p>
          </div>
        </transition>
      </div>
    </div>

    <div class="button-container">
      <router-link class="button back-button" to="/help-center">
        <i class="fas fa-arrow-left"></i> Back to Help Center
      </router-link>
    </div>
  </div>
</template>

<script>
import api from "@/api";

export default {
  name: 'Faq',
  data() {
    return {
      faqList: [],
      isLoading: true,
      openFaqId: null, // Tracks which FAQ item is currently open
    };
  },
  mounted() {
    this.fetchFaqList();
  },
  methods: {
    fetchFaqList() {
      this.isLoading = true;
      api.get('/api/v1/faqs')
          .then(response => {
            this.faqList = response.data.data || response.data || [];
          })
          .catch(error => {
            console.error('Error fetching FAQ data:', error);
            this.faqList = []; // Ensure it's an empty array on error
          })
          .finally(() => {
            this.isLoading = false;
          });
    },
    /**
     * Toggles the visibility of an FAQ's answer.
     * If the clicked FAQ is already open, it closes it.
     * Otherwise, it opens the clicked one.
     * @param {number} id - The ID of the FAQ item to toggle.
     */
    toggleFaq(id) {
      if (this.openFaqId === id) {
        this.openFaqId = null; // Close if already open
      } else {
        this.openFaqId = id; // Open the new one
      }
    },
  },
};
</script>

<style scoped>
.content-container {
  padding: 2rem 1rem;
  max-width: 900px;
  margin: auto;
}

.page-header {
  text-align: center;
  margin-bottom: 2.5rem;
}
.page-header h1 {
  font-weight: 700;
  color: #343a40;
}
.page-header p {
  color: #6c757d;
  font-size: 1.1rem;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.faq-item {
  background-color: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  overflow: hidden; /* Important for the transition */
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.1rem;
  color: #343a40;
  transition: background-color 0.2s ease;
}
.faq-question:hover {
  background-color: #f8f9fa;
}
.faq-question i {
  transition: transform 0.3s ease;
  color: #007bff;
}
.faq-question i.is-open {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 0 1.5rem 1.25rem 1.5rem;
  color: var( --color-text-black);
  line-height: 1.6;
}
.faq-answer p {
  color: var( --bs-gray-600);
  margin: 0;
  border-top: 1px solid #e9ecef;
  padding-top: 1.25rem;
}

/* Slide Transition for Accordion */
.slide-enter-active, .slide-leave-active {
  transition: max-height 0.4s ease, opacity 0.3s ease;
  max-height: 200px; /* Adjust if answers can be very long */
  opacity: 1;
}
.slide-enter-from, .slide-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

.button-container {
  text-align: center;
  margin-top: 2.5rem;
}
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
}
.back-button {
  background-color: #6c757d;
  color: white;
}
.back-button:hover {
  background-color: #5a6268;
}

/* No Content State */
.no-content-card {
  text-align: center;
  padding: 3rem 2rem;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.08);
}
.empty-icon {
  font-size: 3.5rem;
  color: #007bff;
  margin-bottom: 1.5rem;
}
.no-content-card h2 {
  font-weight: 600;
  color: #343a40;
}

/* Shimmer Styles */
.shimmer-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  height: 60px; /* Approximate height of a closed question */
}
.shimmer {
  background-image: linear-gradient(to right, #f0f0f0 8%, #e0e0e0 18%, #f0f0f0 33%);
  background-size: 1200px 100%;
  animation: shimmerAnimation 1.8s infinite linear;
}
.shimmer-line {
  height: 24px;
  border-radius: 4px;
}
@keyframes shimmerAnimation { 0% { background-position: -1200px 0; } 100% { background-position: 1200px 0; } }
</style>