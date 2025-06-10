<template>
  <div class="card-container card-container-admin ">
    <div class="form-container">
      <div class="car-profile">
        <div class="form-header">
          <h2><i class="fas fa-car"></i> Car Profile</h2>
          <hr>
        </div>
        <div v-if="loading" class="loading-message">
          <p>Loading car profile...</p>
          <!-- Optional: Add a spinner or shimmer component here -->
        </div>
        <div v-else-if="car" class="profile-details">
          <div>
            <p><label>UUID:</label><span>{{ car.uuid }}</span></p>
            <p><label>Make:</label><span>{{ car.make }}</span></p>
            <p><label>Model:</label><span>{{ car.model }}</span></p>
            <p><label>Year:</label><span>{{ car.year }}</span></p>
            <p><label>Category:</label><span>{{ car.category }}</span></p>
            <p><label>Price Group:</label><span>{{ car.priceGroup }}</span></p>
            <p><label>License Plate:</label><span>{{ car.licensePlate }}</span></p>
            <p><label>Available:</label><span>{{ car.available ? 'Yes' : 'No' }}</span></p>
            <hr>
          </div>
        </div>
        <div v-else class="error-message">
          <p>Car details could not be loaded or the car was not found.</p>
        </div>
      </div>
      <div class="button-container">
        <button class="back-button button" @click="goBack" :disabled="loading"><i class="fas fa-arrow-left"></i> Back</button>
      </div>
    </div>
  </div>
</template>

<script>
// import axios from 'axios'; // Removed
import api from "@/api";

// Local Axios request interceptor removed.

/**
 * @file ViewCar.vue
 * @description Admin component for displaying the detailed profile of a specific car.
 * Fetches car data based on a UUID from the route parameters.
 * @component ViewCar
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'ViewCar',
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {object|null} car - Stores the fetched car object.
   * @property {boolean} loading - Flag to indicate if car data is currently being fetched.
   */
  data() {
    return {
      car: null,
      loading: true, // Initialize loading to true
    };
  },
  /**
   * Lifecycle hook that is called after the component has been mounted.
   * Fetches the car's profile data.
   */
  mounted() {
    this.fetchCarProfile();
  },
  methods: {
    /**
     * Fetches the profile data for a specific car from the API
     * using the UUID from the current route parameters.
     * Updates the `car` data property and manages the `loading` state.
     * @async
     * @returns {void}
     */
    fetchCarProfile() {
      this.loading = true;
      const uuid = this.$route.params.uuid;

      if (!uuid) {
        console.error("ViewCar: No UUID provided in route parameters.");
        this.car = null;
        this.loading = false;
        // Optionally, show a user-facing error message here (e.g., via a modal or on-page text)
        return;
      }

      console.log("Fetching Car profile for UUID:" + uuid);
      // const token = localStorage.getItem('token'); // Redundant

      api.get(`/api/v1/admin/cars/${uuid}`)
          .then((response) => {
            // Assuming API returns car object in response.data.data or response.data
            this.car = response.data?.data || response.data;
            if (!this.car) {
              console.warn("ViewCar: Car not found or unexpected API response structure.", response.data);
            }
          })
          .catch((error) => {
            console.error('Error fetching car profile:', error.response || error.message || error);
            this.car = null; // Clear car data on error
            // Optionally, display a user-facing error message
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
}
.profile-details div {
  margin-bottom: 10px;
}
.profile-details label {
  font-weight: bold;
  margin-right: 8px;
}
</style>
