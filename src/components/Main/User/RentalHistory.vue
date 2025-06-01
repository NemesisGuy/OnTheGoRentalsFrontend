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

export default {
  name: "RentalHistory",
  components: {
    LoadingModal,
  },
  data() {
    return {
      rentals: [],
      user: {},
      loading: false,
      // showLoadingModal is removed as v-if="loading" controls the modal directly
    };
  },
  mounted() {
    this.fetchRentalHistory();
  },
  methods: {
    formatDateTime,
    fetchRentalHistory() {
      this.loading = true;

      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("RentalHistory: Token not found");
        this.loading = false;
        // Potentially redirect to login or show an error message
        return;
      }

      // First, fetch user profile
      api.get(`/api/v1/users/me/profile`)
        .then(profileResponse => {
          // Check if response.data and response.data.data exist
          if (profileResponse.data && profileResponse.data.data) {
            this.user = profileResponse.data.data;
            // console.log("RentalHistory: User profile fetched:", this.user);
          } else {
            console.warn("RentalHistory: User profile data not found or in unexpected format.", profileResponse);
            this.user = {}; // Reset user or handle error appropriately
          }
          // After profile is fetched (or attempt is made), fetch rental history
          return api.get(`/api/v1/users/me/rental-history`);
        })
        .then(rentalHistoryResponse => {
          // console.log("RentalHistory: Rental history response received:", rentalHistoryResponse);

          if (rentalHistoryResponse.status === 204) {
            console.info("RentalHistory: No rental history found (204 No Content).");
            this.rentals = [];
          } else if (rentalHistoryResponse.data && rentalHistoryResponse.data.status === "success") {
            const rawData = rentalHistoryResponse.data.data;
            if (Array.isArray(rawData) && rawData.length > 0) {
              this.rentals = rawData;
              console.info(`RentalHistory: Successfully fetched ${this.rentals.length} rentals.`);
            } else {
              console.info("RentalHistory: Rental history is empty (API success but no data).");
              this.rentals = [];
            }
          } else if (rentalHistoryResponse.data && Array.isArray(rentalHistoryResponse.data.data) && rentalHistoryResponse.data.data.length === 0) {
            // This case handles scenarios where status might not be "success" but an empty array is still provided.
            console.info("RentalHistory: Rental history is an empty array.");
            this.rentals = [];
          }
          else {
            console.warn("RentalHistory: Fetch rental history API response indicates failure or unexpected format.", rentalHistoryResponse.data);
            this.rentals = []; // Ensure rentals is empty on unexpected response
          }
        })
        .catch(error => {
          console.error("RentalHistory: Error during API call:", error.response || error.message || error);
          this.rentals = []; // Reset rentals on error
          // Optionally reset user as well if profile fetch might have failed earlier in a combined error
           if (error.config && error.config.url.includes('/api/v1/users/me/profile')) {
             this.user = {};
           }
          // You might want to display an error message to the user here
        })
        .finally(() => {
          this.loading = false;
          // console.log("RentalHistory: Fetching rental history finished. Loading state:", this.loading);
        });
    },
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