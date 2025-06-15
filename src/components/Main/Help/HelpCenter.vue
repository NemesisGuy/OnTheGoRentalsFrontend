<template>
  <div class="content-container">
    <div class="page-header">
      <h1><i class="fas fa-question-circle"></i> Help Center</h1>
      <p>Find answers to common questions and learn more about our services.</p>
    </div>

    <div class="help-center-layout">
      <!-- Sidebar with Categories -->
      <aside class="sidebar-panel">
        <h3 class="panel-title">Categories</h3>
        <ul class="category-list">
          <li v-for="category in categories" :key="category">
            <a href="#" @click.prevent="selectCategory(category)" :class="{ 'active': selectedCategory === category }">
              <i :class="getCategoryIcon(category)"></i>
              <span>{{ category }}</span>
              <span v-if="category !== 'All'" class="category-count">{{ countForCategory(category) }}</span>
            </a>
          </li>
        </ul>
      </aside>

      <!-- Main Content Area with FAQs -->
      <main class="content-panel">
        <LoadingModal v-if="loading" :show="true" message="Loading topics..." />

        <div v-else-if="filteredHelpCenters.length > 0" class="faq-list">
          <div v-for="entry in filteredHelpCenters" :key="entry.uuid" class="faq-item">
            <div class="faq-question" @click="toggleFaq(entry.uuid)">
              <span>{{ entry.title }}</span>
              <i class="fas fa-chevron-down" :class="{ 'is-open': openFaqUuid === entry.uuid }"></i>
            </div>
            <transition name="slide">
              <div v-if="openFaqUuid === entry.uuid" class="faq-answer">
                <p v-html="formatContent(entry.content)"></p>
              </div>
            </transition>
          </div>
        </div>

        <div v-else class="no-entries-card">
          <i class="fas fa-info-circle empty-icon"></i>
          <h2>No Topics Found</h2>
          <p v-if="selectedCategory === 'All'">There are currently no help topics available.</p>
          <p v-else>No topics found for the "<strong>{{ selectedCategory }}</strong>" category.</p>
        </div>
      </main>
    </div>

    <SuccessModal v-if="successModal.show" @close="closeFeedbackModal" :show="successModal.show" :message="successModal.message" />
    <FailureModal v-if="failModal.show" @close="closeFeedbackModal" :show="failModal.show" :message="failModal.message" />
  </div>
</template>

<script>
// The script logic is excellent and remains largely unchanged.
import api from "@/api";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";

export default {
  name: 'HelpCenterView',
  components: { LoadingModal, SuccessModal, FailureModal },
  data() {
    return {
      allHelpCenters: [],
      categories: [],
      selectedCategory: 'All',
      openFaqUuid: null, // Use UUID to track open FAQ
      loading: false,
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" },
      categoryIcons: {
        'All': 'fas fa-book-open',
        'Bookings': 'fas fa-calendar-check',
        'Car': 'fas fa-car-side',
        'Rental': 'fas fa-key',
        'User': 'fas fa-user-shield',
      }
    };
  },
  computed: {
    filteredHelpCenters() {
      if (this.selectedCategory === 'All') return this.allHelpCenters;
      return this.allHelpCenters.filter(entry => entry.category === this.selectedCategory);
    }
  },
  created() {
    this.fetchHelpCenters();
  },
  methods: {
    fetchHelpCenters() {
      this.loading = true;
      api.get('/api/v1/help-topics')
          .then(response => {
            this.allHelpCenters = response.data.data || [];
            this.extractCategories();
          })
          .catch(error => {
            console.error('Error fetching help centers:', error);
            this.showFailureModal(`Error fetching help topics. Please try again later.`);
          })
          .finally(() => this.loading = false);
    },
    extractCategories() {
      const uniqueCategories = [...new Set(this.allHelpCenters.map(entry => entry.category).filter(Boolean))];
      this.categories = ['All', ...uniqueCategories.sort()];
    },
    selectCategory(category) {
      this.selectedCategory = category;
      this.openFaqUuid = null; // Close any open FAQ when changing category
    },
    toggleFaq(uuid) {
      this.openFaqUuid = this.openFaqUuid === uuid ? null : uuid;
    },
    formatContent(content) {
      return content ? content.replace(/\n/g, '<br>') : '';
    },
    getCategoryIcon(category) {
      return this.categoryIcons[category] || 'fas fa-info-circle';
    },
    countForCategory(category) {
      return this.allHelpCenters.filter(entry => entry.category === category).length;
    },
    showFailureModal(message) { this.failModal = { show: true, message }; },
    closeFeedbackModal() {
      this.successModal.show = false;
      this.failModal.show = false;
    }
  }
};
</script>

<style scoped>
.content-container {
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: auto;
}
.page-header {
  text-align: center;
  margin-bottom: 2.5rem;
}
.page-header h1 { font-weight: 700; color: #343a40; }
.page-header p { color: #6c757d; font-size: 1.1rem; }

.help-center-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  align-items: flex-start;
}

.sidebar-panel, .content-panel {
  background: #fff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 30px rgba(0,0,0,0.08);
}
.panel-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
  color: #343a40;
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.category-list a {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  text-decoration: none;
  color: #495057;
  border-radius: 8px;
  margin-bottom: 0.25rem;
  font-weight: 500;
  transition: background-color 0.2s ease, color 0.2s ease;
}
.category-list a:hover {
  background-color: #e9ecef;
  color: #007bff;
}
.category-list a.active {
  background-color: #007bff;
  color: white;
  font-weight: 600;
}
.category-list a i {
  width: 30px;
  text-align: center;
  margin-right: 0.5rem;
}
.category-count {
  margin-left: auto;
  font-size: 0.8rem;
  background-color: #e9ecef;
  color: #6c757d;
  padding: 2px 8px;
  border-radius: 50px;
}
.category-list a.active .category-count {
  background-color: rgba(255, 255, 255, 0.25);
  color: white;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.faq-item {
  border: 1px solid #e9ecef;
  border-radius: 12px;
  overflow: hidden;
}
.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.1rem;
  color: #343a40;
  background-color: #f8f9fa;
}
.faq-question:hover {
  background-color: #e9ecef;
}
.faq-question i {
  transition: transform 0.3s ease;
  color: #007bff;
}
.faq-question i.is-open {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 1.5rem;
  color: #495057;
  line-height: 1.6;
}
.faq-answer p { margin: 0; }

.slide-enter-active, .slide-leave-active {
  transition: max-height 0.4s ease, opacity 0.3s ease, padding 0.3s ease;
  max-height: 200px;
  opacity: 1;
}
.slide-enter-from, .slide-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
  overflow: hidden;
}

.no-entries-card {
  text-align: center;
  padding: 3rem 2rem;
}
.empty-icon {
  font-size: 3.5rem;
  color: #6c757d;
  margin-bottom: 1.5rem;
}
.no-entries-card h2 {
  font-weight: 600;
  color: #343a40;
}

@media (max-width: 992px) {
  .help-center-layout {
    grid-template-columns: 1fr;
  }
}
</style>