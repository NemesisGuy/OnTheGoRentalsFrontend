<template>
  <div class="card-container card-container-admin">
    <div class="form-container">
      <div class="aboutUs-details">
        <div class="form-header">
          <h2><i class="fas fa-info-circle"></i> About Us Details</h2>

        </div>
        <hr>
        <div v-if="about" class="aboutUs-details">

          <div>
            <label>Address:</label>
            <span>{{ about.address }}</span>
          </div>
          <div>
            <label>Office Hours:</label>
            <span>{{ about.officeHours }}</span>
          </div>
          <div>
            <label>Email:</label>
            <span>{{ about.email }}</span>
          </div>
          <div>
            <label>Telephone Number:</label>
            <span>{{ about.telephone }}</span>
          </div>
          <div>
            <label>WhatsApp Number:</label>
            <span>{{ about.whatsApp }}</span>
          </div>
          <hr >
        </div>
        <div class="button-container">
          <button class="back-button button" @click="goBack"><i class="fas fa-arrow-left"></i> Back</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
// import axios from 'axios'; // Unused
import api from "@/api";

/**
 * @file ViewAboutUs.vue
 * @description Admin component to display the details of a single "About Us" entry.
 * Fetches the entry data based on a UUID from the route parameters.
 * @component ViewAboutUs
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'ViewAboutUs', // Changed to PascalCase
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {object|null} about - Stores the fetched "About Us" entry object.
   * @property {boolean} loading - Flag to indicate if data is currently being fetched.
   */
  data() {
    return {
      about: null,
      loading: false, // Added loading state
    };
  },
  /**
   * Lifecycle hook that is called after the component has been mounted.
   * Fetches the details of the "About Us" entry.
   */
  mounted() {
    this.fetchAboutUsDetails();
  },
  methods: {
    /**
     * Fetches the details of a specific "About Us" entry from the API
     * using the UUID from the current route parameters.
     * Updates the `about` data property and manages loading state.
     * @async
     * @returns {void}
     */
    fetchAboutUsDetails() {
      const uuid = this.$route.params.uuid;
      if (!uuid) {
        console.error("ViewAboutUs: No UUID provided in route parameters.");
        this.about = null; // Ensure about is null if no uuid
        // Optionally show an error message to the user
        return;
      }
      this.loading = true;
      // const token = localStorage.getItem('token'); // Redundant if api instance handles auth

      api.get(`/api/v1/admin/about-us/${uuid}`)
          .then((response) => {
            // Assuming API returns entry in response.data.data or response.data
            this.about = response.data?.data || response.data;
            if (!this.about) {
              console.warn("ViewAboutUs: 'About Us' entry not found or unexpected response structure.", response.data);
            }
          })
          .catch((error) => {
            console.error('Error fetching About Us details:', error.response || error);
            this.about = null; // Clear on error
            // Optionally show a user-facing error message
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
    // Unused modal helper methods (showSuccessModal, showFailureModal, closeModal) were removed.
  },
};
</script>
<style>
/* Styles are not scoped, consider adding 'scoped' attribute if they are component-specific */
/* Minimal styling for label/span display */
.aboutUs-details div {
  margin-bottom: 10px;
}
.aboutUs-details label {
  font-weight: bold;
  margin-right: 8px;
}
</style>