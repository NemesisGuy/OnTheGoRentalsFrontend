<template>
  <div class="card-container">
    <div class="form-container">
      <div class="rental-history">
        <div class="form-header">
          <div v-if="loading">
            <h2>Loading Rental History...</h2>
            <hr>
          </div>
          <div v-else>
            <h2><i class="fas fa-history"></i> Rental History</h2>
            <hr>
          </div>
        </div>

        <!-- Loading Modal -->
        <LoadingModal v-if="loading" show> </LoadingModal>

        <div v-if="loading">
          <!-- Shimmer placeholders -->
          <div class="shimmer-card">
            <div class="shimmer-line shimmer" style="width: 100%;"></div>
            <div class="shimmer-line shimmer" style="width: 90%;"></div>
            <div class="shimmer-line shimmer" style="width: 70%;"></div>
            <div class="shimmer-line shimmer" style="width: 50%;"></div>
            <div class="shimmer-line shimmer" style="width: 30%;"></div>
            <div class="shimmer-line shimmer" style="width: 20%;"></div>
            <hr>
          </div>
          <div class="shimmer-card">
            <div class="shimmer-line shimmer" style="width: 100%;"></div>
            <div class="shimmer-line shimmer" style="width: 90%;"></div>
            <div class="shimmer-line shimmer" style="width: 70%;"></div>
            <div class="shimmer-line shimmer" style="width: 50%;"></div>
            <div class="shimmer-line shimmer" style="width: 30%;"></div>
            <div class="shimmer-line shimmer" style="width: 20%;"></div>
            <hr>
          </div>
          <div class="shimmer-card">
            <div class="shimmer-line shimmer" style="width: 100%;"></div>
            <div class="shimmer-line shimmer" style="width: 90%;"></div>
            <div class="shimmer-line shimmer" style="width: 70%;"></div>
            <div class="shimmer-line shimmer" style="width: 50%;"></div>
            <div class="shimmer-line shimmer" style="width: 30%;"></div>
            <div class="shimmer-line shimmer" style="width: 20%;"></div>
            <hr>
          </div>
        </div>

        <!-- Rental list -->
        <ol v-else-if="rentals.length">
          <li v-for="rental in rentals" :key="rental.uuid"> <!-- Assuming uuid is the unique key for rentals -->
            <p><strong>Rental ID:</strong> {{ rental.uuid }}</p>
            <p><strong>Car:</strong> {{ rental.car.make }}, {{ rental.car.model }}, {{rental.car.licensePlate}}</p>
            <p><strong>Start Date:</strong> {{ formatDateTime(rental.issuedDate) }}</p>
            <p><strong>End Date:</strong> {{ formatDateTime(rental.returnedDate) }}</p>
            <p><strong>Status:</strong> {{ rental.returnedDate ? 'Returned' : 'Active' }}</p>
            <hr>
          </li>
        </ol>

        <p v-else>No rentals found.</p>
      </div>
      <div class="button-container">
        <button class="back-button button" @click="goBack"><i class="fas fa-arrow-left"></i> Back</button>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api";
import { formatDateTime } from "@/utils/dateUtils";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";

/**
 * @file RentalHistory.vue
 * @description This component displays the rental history for the currently authenticated user.
 * It fetches the user's profile and then their rental history, showing details for each rental
 * such as car information, dates, and status. Includes loading states with shimmer effects.
 * @component RentalHistory
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: "RentalHistory",
  components: {
    LoadingModal,
  },
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {Array<object>} rentals - An array to store the fetched rental history objects.
   * @property {object} user - Stores the fetched profile data of the current user.
   *                           (Note: Currently fetched but not directly displayed in the template,
   *                           might be used for authentication verification or future enhancements).
   * @property {boolean} loading - Flag to indicate if rental history data is currently being loaded.
   */
  data() {
    return {
      rentals: [],
      user: {}, // To store fetched user profile
      loading: false,
    };
  },
  /**
   * Lifecycle hook that is called after the component has been mounted.
   * Initiates fetching of the user's rental history.
   */
  mounted() {
    this.fetchRentalHistory();
  },
  methods: {
    /**
     * Exposes the `formatDateTime` utility function to the template for formatting dates.
     * @param {string} dateTimeString - The ISO date-time string to format.
     * @returns {string} Formatted date-time string.
     */
    formatDateTime, // Directly exposing the imported function
    /**
     * Fetches the rental history for the currently authenticated user.
     * It first attempts to fetch the user's profile (possibly for auth validation or future use)
     * and then fetches the rental history records. Manages loading states and errors.
     * @async
     * @returns {void}
     * @note The initial check for 'accessToken' in localStorage might be redundant if the `api`
     *       instance's interceptors correctly handle unauthorized requests (e.g., by redirecting to login).
     */
    fetchRentalHistory() {
      this.loading = true;

      // const token = localStorage.getItem("accessToken"); // This check is likely redundant if API interceptors handle 401s.
      // if (!token) {
      //   console.error("RentalHistory: Token not found. User might need to log in.");
      //   this.loading = false;
      //   this.$router.push({ name: 'Login' }); // Redirect to login if no token
      //   return;
      // }

      // Chain promises: fetch profile, then rental history.
      api.get(`/api/v1/users/me/profile`)
        .then(profileResponse => {
          if (profileResponse.data && profileResponse.data.data) {
            this.user = profileResponse.data.data;
            // console.log("RentalHistory: User profile fetched:", this.user.email);
          } else {
            console.warn("RentalHistory: User profile data not found or in unexpected format.", profileResponse);
            this.user = {}; // Reset or handle as an error state
            // Potentially throw an error here if user profile is essential for fetching history
            // throw new Error("User profile could not be fetched.");
          }
          // Proceed to fetch rental history
          return api.get(`/api/v1/users/me/rental-history`);
        })
        .then(rentalHistoryResponse => {
          if (rentalHistoryResponse.status === 204) { // No Content
            console.info("RentalHistory: No rental history found (204 No Content).");
            this.rentals = [];
          } else if (rentalHistoryResponse.data && rentalHistoryResponse.data.status === "success") {
            const rawData = rentalHistoryResponse.data.data;
            this.rentals = Array.isArray(rawData) ? rawData : [];
            console.info(`RentalHistory: Successfully fetched ${this.rentals.length} rentals.`);
          } else { // Handles other cases like non-success status or unexpected data structure
            console.warn("RentalHistory: Fetch rental history API response indicates failure or unexpected format.", rentalHistoryResponse.data);
            this.rentals = [];
          }
        })
        .catch(error => {
          console.error("RentalHistory: Error during API call chain:", error.response || error.message || error);
          this.rentals = [];
          this.user = {}; // Clear user data on error as well
          // Display a user-friendly error message via a modal or on-page text if desired
          // e.g., this.showErrorModal("Failed to load rental history.");
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
             this.$router.push({ name: 'Login' }); // Redirect if unauthorized
          }
        })
        .finally(() => {
          this.loading = false;
          // console.log("RentalHistory: Fetching rental history finished. Loading state:", this.loading);
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
.rental-history {
  padding: 20px;
}

.form-container {
  max-width: 800px; /* Or your preferred max-width */
  margin: 20px auto; /* Centers the container */
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card-container {
  padding: 10px; /* Add some padding around the form-container if needed */
}


.form-header {
  text-align: center;
  margin-bottom: 20px;
}

.form-header h2 {
  color: #333;
  margin-bottom: 5px;
}

.form-header hr {
  border: 0;
  height: 1px;
  background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0));
  margin-top: 0;
}


.loading {
  font-size: 1.2em;
  color: #666;
  text-align: center;
  margin-top: 20px;
}

ol {
  list-style-type: none;
  padding-left: 0;
}

li {
  background-color: #f9f9f9;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 5px;
  border-left: 5px solid #007bff; /* Accent color */
}

li p {
  margin: 5px 0;
  color: #555;
}

li p strong {
  color: #333;
}

li hr {
  border: 0;
  height: 1px;
  background-color: #eee;
  margin-top: 15px;
}


/* Optional shimmer placeholder */
.shimmer-card {
  background-color: #f9f9f9;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 5px;
  border-left: 5px solid #e0e0e0; /* Shimmer accent */
}

.shimmer-line {
  height: 20px; /* Or match your text line height */
  margin-bottom: 8px; /* Spacing between lines */
  background: #e0e0e0; /* Base color */
  border-radius: 4px;
}

.shimmer {
  /* The actual shimmer animation */
  background-image: linear-gradient(
    to right,
    #e0e0e0 0%,
    #f0f0f0 20%, /* Lighter shimmer color */
    #e0e0e0 40%,
    #e0e0e0 100%
  );
  background-repeat: no-repeat;
  background-size: 800px 100%; /* Width of the shimmer wave, adjust as needed */
  display: inline-block;
  position: relative;
  animation-duration: 1.4s;
  animation-fill-mode: forwards;
  animation-iteration-count: infinite;
  animation-name: shimmerAnimation;
  animation-timing-function: linear;
}


@keyframes shimmerAnimation {
  0% {
    background-position: -400px 0;
  }
  100% {
    background-position: 400px 0;
  }
}

.button-container {
  text-align: center;
  margin-top: 20px;
}

.button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
}

.back-button {
  background-color: #6c757d; /* A neutral back button color */
  color: white;
}

.back-button:hover {
  background-color: #5a6268;
}

.back-button i {
  margin-right: 5px;
}

</style>