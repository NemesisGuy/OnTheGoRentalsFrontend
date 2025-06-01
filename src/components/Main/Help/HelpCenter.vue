<template>
  <div class="help-center-page-wrapper"> <!-- This will be on the purple background -->
    <!-- The pink global navbar is assumed to be outside this component -->

    <div class="help-center-header-block">
      <h1>Help Center</h1>
      <p class="subtitle">Find answers to common questions and learn more about our services.</p>
    </div>

    <div class="two-column-content-container"> <!-- This container will be centered -->
      <div class="two-column-layout">
        <!-- Sidebar with Categories -->
        <aside class="sidebar card-pane">
          <h2 class="sidebar-title">Categories</h2>
          <ul class="sidebar-menu">
            <li v-for="category in categories" :key="category"
                :class="{ 'active-category': selectedCategory === category }">
              <a href="#" @click.prevent="selectCategory(category)">
                <i :class="getCategoryIcon(category)"></i>
                {{ category }}
                <span v-if="category !== 'All'" class="category-count">({{ countForCategory(category) }})</span>
              </a>
            </li>
          </ul>
        </aside>

        <!-- Main Content Area -->
        <main class="content-area card-pane">
          <div v-if="loading" class="loading-indicator">
            <LoadingModal :show="true" />
          </div>
          <div v-else>
            <div v-if="filteredHelpCenters.length">
              <div v-for="entry in filteredHelpCenters" :key="entry.uuid" class="help-entry">
                <details class="help-entry-details">
                  <summary class="help-entry-title">
                    <h3>{{ entry.title }}</h3>
                    <span class="category-tag-help" v-if="selectedCategory === 'All' && entry.category">{{ entry.category }}</span>
                  </summary>
                  <div class="help-entry-content" v-html="formatContent(entry.content)"></div>
                </details>
              </div>
            </div>
            <div v-else class="no-entries">
              <i class="fas fa-info-circle"></i>
              <p v-if="selectedCategory === 'All'">No help topics found.</p>
              <p v-else>No help topics available for "<strong>{{ selectedCategory }}</strong>".</p>
              <p v-if="selectedCategory !== 'All'">
                Try selecting <a href="#" @click.prevent="selectCategory('All')">'All' categories</a>.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>

    <SuccessModal v-if="successModal.show" @close="closeFeedbackModal" :show="successModal.show" :message="successModal.message" />
    <FailureModal v-if="failModal.show" @close="closeFeedbackModal" :show="failModal.show" :message="failModal.message" />
  </div>
</template>

<script>
// Script remains the same as the previous version (HelpCenterPage)
import api from "@/api";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";

export default {
  name: 'HelpCenterView', // Renaming to avoid confusion with any previous page wrappers
  components: { LoadingModal, SuccessModal, FailureModal },
  data() {
    return {
      allHelpCenters: [],
      categories: [],
      selectedCategory: 'All',
      loading: false,
      error: null,
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" },
      categoryIcons: {
        'All': 'fas fa-folder', // Matching your screenshot for 'All'
        'Bookings': 'fas fa-calendar-check',
        'Car': 'fas fa-car-side', // Slightly different car icon
        'Rental': 'fas fa-key',
        'User': 'fas fa-user-shield', // Example for User/Login issues
        // Add your actual categories and preferred icons
      }
    };
  },
  computed: {
    filteredHelpCenters() {
      if (this.selectedCategory === 'All') {
        return this.allHelpCenters;
      }
      return this.allHelpCenters.filter(entry => entry.category === this.selectedCategory);
    }
  },
  created() {
    this.fetchHelpCenters();
  },
  methods: {
    fetchHelpCenters() {
      this.loading = true;
      this.error = null;
      api.get('/api/v1/help-topics')
          .then(response => {
            if (response.data && response.data.status === 'success' && Array.isArray(response.data.data)) {
              this.allHelpCenters = response.data.data;
              this.extractCategories();
              if (this.allHelpCenters.length === 0) {
                // Can show an info modal or let the template handle "no entries"
              }
            } else if (response.status === 204 || (response.data && response.data.status === 'success' && response.data.data === null) || (response.data && Array.isArray(response.data.data) && response.data.data.length === 0) ) {
              this.allHelpCenters = [];
              this.categories = ['All'];
            } else {
              const errorMsg = response.data?.errors?.map(e => e.message).join(', ') || 'Failed to fetch help topics: Invalid response structure.';
              console.warn("Help Center fetch warning:", errorMsg, response.data);
              this.allHelpCenters = [];
              this.categories = ['All'];
            }
          })
          .catch(error => {
            console.error('Error fetching help centers:', error);
            this.error = error.message || 'An unknown error occurred.';
            this.showFailureModal(`Error fetching help topics. Please try again later.`);
            this.allHelpCenters = [];
            this.categories = ['All'];
          })
          .finally(() => {
            this.loading = false;
          });
    },
    extractCategories() {
      const uniqueCategories = [...new Set(this.allHelpCenters.map(entry => entry.category).filter(Boolean))];
      this.categories = ['All', ...uniqueCategories.sort()];
    },
    selectCategory(category) {
      this.selectedCategory = category;
    },
    formatContent(content) {
      if (!content) return '';
      return content.replace(/\n/g, '<br>');
    },
    getCategoryIcon(category) {
      return this.categoryIcons[category] || 'fas fa-info-circle'; // A fallback icon
    },
    countForCategory(category) {
      return this.allHelpCenters.filter(entry => entry.category === category).length;
    },
    showFailureModal(message) {
      this.failModal = { show: true, message: message };
    },
    closeFeedbackModal() {
      this.successModal.show = false;
      this.failModal.show = false;
    }
  }
};
</script>

<style scoped>
/* Assume global styles define --primary-color (purple) and --secondary-color (pink) */
/* and --text-color (white for on dark backgrounds), --background-color (white for cards) */

.help-center-page-wrapper {
  /* This component takes the full width available to it from its parent router-view.
     The purple background is assumed to be on the `body` or a higher-level layout component
     that sits underneath your fixed pink navbar.
     We add padding to account for your fixed navbar.
  */

  padding-top:  20px; /* Adjust --navbar-height if you have it */
  padding-bottom: 40px;
  width: inherit;
  box-sizing: border-box;
}

.help-center-header-block {
  text-align: center;
  margin-bottom: 30px;
  color: var(--text-color); /* White text on the purple page background */
}

.help-center-header-block h1 {
  font-size: 2.6em;
  font-weight: 600;
  margin-bottom: 8px;
}

.help-center-header-block .subtitle {
  font-size: 1.1em;
  opacity: 0.85;
}

.two-column-content-container {
  max-width: 1100px; /* Max width of the centered content (sidebar + main area) */
  margin: 0 auto;
  padding: 0 15px; /* Some padding if screen is exactly max-width */
}

.two-column-layout {
  display: flex;
  gap: 25px; /* Space between sidebar and content area */
}

.card-pane { /* This will be the white background for sidebar and content area */
  background-color: var(--background-color, #fff);
  color: var(--color-text-black, #333); /* Text color for content on white panes */
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Softer, more modern shadow */
  padding: 20px;
}

.sidebar.card-pane {
  flex: 0 0 250px; /* Width of the category sidebar */
  height: fit-content; /* Adjusts to content */
  /* position: sticky; /* Optional: if you want sidebar to stick */
  /* top: calc(var(--navbar-height, 60px) + 20px + 20px); /* Sticky position below header + margin */
}

.sidebar-title {
  font-size: 1.35em;
  color: var(--primary-color); /* Purple title for "Categories" */
  margin-top: 0;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 500;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-menu li a {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  text-decoration: none;
  color: #454545; /* Dark grey text */
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 0.95em;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.sidebar-menu li a i {
  margin-right: 10px;
  width: 18px;
  text-align: center;
  color: var(--primary-color); /* Purple icons by default */
}

.sidebar-menu li a:hover {
  background-color: #f4efff; /* Very light purple for hover */
  color: var(--primary-color);
}

.sidebar-menu li.active-category a {
  background-color: var(--primary-color); /* Purple background from your screenshot */
  color: var(--text-color); /* White text */
  font-weight: bold;
}
.sidebar-menu li.active-category a i {
  color: var(--text-color); /* White icon */
}

.category-count {
  margin-left: auto;
  font-size: 0.8em;
  background-color: #e9ecef; /* Light grey badge background */
  color: #495057;
  padding: 2px 6px;
  border-radius: 8px;
}
.sidebar-menu li.active-category a .category-count {
  background-color: rgba(255, 255, 255, 0.25); /* Semi-transparent white on purple */
}

.content-area.card-pane {
  flex: 1; /* Takes up remaining space */
  min-height: 500px; /* Ensure it has some body */
}

.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.help-entry {
  margin-bottom: 1rem;
  border: none; /* Removing individual borders for entries if summary provides separation */
}

.help-entry-details summary {
  padding: 1rem; /* Increased padding */
  cursor: pointer;
  outline: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--primary-color); /* Purple background for summary (question title) */
  color: var(--text-color); /* White text */
  border-radius: 4px; /* Rounded corners for the summary bar */
  transition: background-color 0.2s ease;
  margin-bottom: 1px; /* Slight separation if multiple summaries */
}

.help-entry-details summary:hover {
  background-color: var(--secondary-color); /* Pink hover for summary */
}

.help-entry-details[open] summary {
  background-color: var(--secondary-color); /* Pink when open */
  border-bottom-left-radius: 0; /* Flatten bottom corners when open */
  border-bottom-right-radius: 0;
}

.help-entry-title h3 {
  margin: 0;
  font-size: 1.15em; /* Slightly larger */
  font-weight: 500; /* Normal weight as background is strong */
}

.category-tag-help {
  font-size: 0.75em;
  background-color: rgba(255, 255, 255, 0.2); /* Semi-transparent white on purple/pink */
  color: var(--text-color);
  padding: 3px 7px;
  border-radius: 3px;
  margin-left: 10px;
}

.help-entry-content {
  padding: 1rem;
  line-height: 1.6;
  color: var(--color-text-dark); /* Dark text for content */
  background-color: #fdfdff; /* Very light, almost white for content background */
  border: 1px solid var(--primary-color); /* Purple border matching summary */
  border-top: none; /* No top border as summary acts as header */
  border-radius: 0 0 4px 4px; /* Rounded bottom corners */
}

.help-entry-details summary::after {
  content: '+'; /* Plus for closed */
  font-size: 1.2em;
  font-weight: bold;
  transition: transform 0.2s ease;
}
.help-entry-details[open] summary::after {
  content: '−'; /* Minus for open */
}

.no-entries {
  text-align: center;
  padding: 30px;
  color: #555;
  font-size: 1em;
}
.no-entries i {
  font-size: 2em;
  margin-bottom: 10px;
  color: #aaa;
}
.no-entries a {
  color: var(--secondary-color);
}

@media (max-width: 860px) {
  .two-column-layout {
    flex-direction: column;
  }
  .sidebar.card-pane {
    flex: 0 0 auto;
    width: 100%;
    margin-bottom: 20px;
    position: static;
  }
}
</style>