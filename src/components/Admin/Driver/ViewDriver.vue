<template>
  <div class="card-container card-container-admin">
    <div class="form-container">
      <div class="driver-profile">
        <div class="form-header">
          <h2><i class="fas fa-id-card"></i> Driver Profile</h2> <!-- Changed icon for consistency -->
          <hr>
        </div>

        <LoadingModal v-if="loading" :show="true" message="Loading driver profile..."/>

        <div v-else-if="driver" class="profile-details">
          <div>
            <label>UUID:</label>
            <span>{{ driver.uuid ? driver.uuid.substring(0,8) : 'N/A' }}...</span>
          </div>
          <div>
            <label>First Name:</label>
            <span>{{ driver.firstName }}</span>
          </div>
          <div>
            <label>Last Name:</label>
            <span>{{ driver.lastName }}</span>
          </div>
          <div>
            <label>License Code:</label>
            <span>{{ driver.licenseCode }}</span>
          </div>
          <hr>
        </div>
        <div v-else class="error-message">
          <p>Driver profile could not be loaded or was not found.</p>
        </div>
      </div>
      <div class="button-container">
        <!-- Changed to call the goBack method -->
        <button class="back-button button" @click="goBack" :disabled="loading"><i class="fas fa-arrow-left"></i> Back</button>
      </div>
    </div>
  </div>
</template>


<script>
// import axios from 'axios'; // Unused
import LoadingModal from '@/components/Main/Modals/LoadingModal.vue'; // Used for loading state
import api from "@/api";

/**
 * @file ViewDriver.vue
 * @description Admin component for displaying the detailed profile of a specific driver.
 * Fetches driver data based on a UUID from the route parameters.
 * @component AdminViewDriver
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'AdminViewDriver', // Renamed
  components: {
    LoadingModal,
  },
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {object|null} driver - Stores the fetched driver object.
   * @property {boolean} loading - Flag to indicate if driver data is currently being fetched.
   */
  data() {
    return {
      driver: null,
      loading: true, // Initialize loading to true, as fetch starts on mount
    };
  },
  /**
   * Lifecycle hook that is called after the component has been mounted.
   * Fetches the driver's profile data.
   */
  mounted() {
    this.fetchDriverProfile();
  },
  methods: {
    /**
     * Fetches the profile data for a specific driver from the API
     * using the UUID from the current route parameters.
     * Updates the `driver` data property and manages the `loading` state.
     * @async
     * @returns {void}
     */
    fetchDriverProfile() {
      this.loading = true;
      const driverUuid = this.$route.params.uuid; // Changed to uuid for consistency

      if (!driverUuid) {
        console.error("AdminViewDriver: No driver UUID provided in route parameters.");
        this.driver = null;
        this.loading = false;
        // Optionally show an error message to the user (e.g., via a global notification or local error property)
        alert("Cannot load driver profile: Driver ID is missing from the URL.");
        return;
      }

      console.log("Fetching Driver profile for UUID:" + driverUuid);
      // const token = localStorage.getItem('token'); // Redundant

      api.get(`/api/v1/admin/drivers/${driverUuid}`) // Use UUID in path
          .then((response) => {
            // Assuming API returns driver object in response.data.data or response.data
            this.driver = response.data?.data || response.data;
            if (!this.driver) {
              console.warn("AdminViewDriver: Driver not found or unexpected API response structure.", response.data);
            }
          })
          .catch((error) => {
            console.error('Error fetching driver profile:', error.response || error.message || error);
            this.driver = null; // Clear driver data on error
            // Optionally, display a user-facing error message
            alert("Failed to load driver profile: " + (error.response?.data?.message || error.message));
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

<style scoped>
/* Add component-specific styles if needed. Consider scoping generic styles if they aren't global. */
.loading-message p, .error-message p {
  text-align: center;
  padding: 20px;
  font-style: italic;
  color: #666;
}
.profile-details div {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}
.profile-details label {
  font-weight: bold;
  margin-right: 8px;
  min-width: 120px; /* For alignment */
  flex-shrink: 0;
}
.profile-details span {
  word-break: break-word;
}
</style>