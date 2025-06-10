<template>
  <div class="card-container card-container-admin">
    <div class="form-container">
      <div class="contact-profile">
        <div class="form-header">
          <h2><i class="fas fa-envelope-open-text"></i> Contact Us Query Details</h2> <!-- Changed icon -->
        </div>
        <hr>

        <LoadingModal v-if="loading" :show="true" message="Loading query details..."/>

        <div v-else-if="contact" class="profile-details">
          <div>
            <label>Query ID (UUID):</label> <!-- Added ID display -->
            <span>{{ contact.uuid || contact.id }}</span> <!-- Display uuid or id -->
          </div>
          <div>
            <label>Title:</label>
            <span>{{ contact.title }}</span>
          </div>
          <div>
            <label>First Name:</label>
            <span>{{ contact.firstName }}</span>
          </div>
          <div>
            <label>Last Name:</label>
            <span>{{ contact.lastName }}</span>
          </div>
          <div>
            <label>Email:</label>
            <span>{{ contact.email }}</span>
          </div>
          <div>
            <label>Subject:</label>
            <span>{{ contact.subject }}</span>
          </div>
          <div>
            <label>Message:</label>
            <!-- Use pre-wrap for message to preserve line breaks -->
            <span style="white-space: pre-wrap;">{{ contact.message }}</span>
          </div>
        </div>
        <div v-else class="error-message"> <!-- Message for not found or error -->
          <p>Contact Us query details could not be loaded or were not found.</p>
        </div>
      </div>

      <div class="button-container">
        <button class="back-button button" @click="goBack" :disabled="loading"><i class="fas fa-arrow-left"></i> Back</button>
      </div>
    </div>
  </div>
</template>

<script>
// import axios from 'axios'; // Unused
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import api from "@/api";

/**
 * @file ViewContactUs.vue
 * @description Admin component for displaying the details of a single "Contact Us" submission.
 * Fetches submission data based on a UUID from route parameters.
 * @component AdminViewContactUs
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'AdminViewContactUs', // Renamed for consistency
  components: {
    LoadingModal,
  },
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {object|null} contact - Stores the fetched contact submission object.
   * @property {boolean} loading - Flag to indicate if data is currently being fetched.
   */
  data() {
    return {
      contact: null,
      loading: false, // Initialize to false, set true during fetch
    };
  },
  /**
   * Lifecycle hook that is called after the component has been mounted.
   * Fetches the details of the contact submission.
   */
  mounted() {
    this.fetchContactDetails(); // Renamed for clarity
  },
  methods: {
    /**
     * Fetches the details of a specific contact submission from the API
     * using the UUID from the current route parameters.
     * Updates the `contact` data property and manages the `loading` state.
     * @async
     * @returns {void}
     */
    fetchContactDetails() { // Renamed for clarity
      this.loading = true;
      const uuid = this.$route.params.uuid;

      if (!uuid) {
        console.error("AdminViewContactUs: No UUID provided in route parameters.");
        this.contact = null;
        this.loading = false;
        // Optionally, show a user-facing error message here (e.g., via a prop to an error display component or a local data property)
        alert("Cannot load details: Submission ID is missing from the URL.");
        return;
      }

      api.get(`/api/v1/admin/contact-us-submissions/${uuid}`)
          .then((response) => {
            // Assuming API returns entry in response.data.data or response.data
            this.contact = response.data?.data || response.data;
            if (!this.contact) {
              console.warn("AdminViewContactUs: Contact submission not found or unexpected API response structure.", response.data);
            }
          })
          .catch((error) => {
            console.error('Error fetching contact submission details:', error.response || error.message || error);
            this.contact = null; // Clear data on error
            // Optionally, display a user-facing error message
            alert("Failed to load contact submission details. " + (error.response?.data?.message || error.message || ""));
          })
          .finally(() => {
            this.loading = false;
          });
    },
    /**
     * Navigates to the previous page in the router history.
     * @returns {void}
     */
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped> /* Changed to scoped */
/* Basic styling for demonstration */
.profile-details div {
  margin-bottom: 10px;
  display: flex; /* For aligning label and span */
  align-items: flex-start; /* Align items at the start for multi-line content */
}
.profile-details label {
  font-weight: bold;
  margin-right: 8px;
  min-width: 150px; /* Adjust as needed for alignment */
  flex-shrink: 0; /* Prevent label from shrinking */
}
.profile-details span {
  flex-grow: 1; /* Allow span to take remaining space */
  word-break: break-word; /* Break long words/emails */
}
.error-message p {
  color: red;
  text-align: center;
}
/* Add other styles from ViewCar.vue or common admin styles if applicable */
</style>
