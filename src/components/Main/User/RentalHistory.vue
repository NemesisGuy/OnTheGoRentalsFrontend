<template>
  <div class="card-container">
    <div class="form-container">
      <div class="rental-history">
        <div class="form-header">
          <h2>Your Rental History</h2>
          <hr>
        </div>
        <ol v-if="rentals.length">
          <li v-for="rental in rentals" :key="rental.rentalId">
            <p><strong>Rental ID:</strong> {{ rental.id }}</p>
            <p><strong> Car:</strong> {{ rental.car.make }} {{ rental.car.model }}</p>
            <p><strong>Start Date:</strong> {{ formatDateTime(rental.issuedDate) }}</p>
            <p><strong>End Date:</strong> {{ formatDateTime(rental.returnedDate) }}</p>
            <p><strong>Status:</strong> {{ rental.returnedDate ? 'Returned' : 'Active' }}</p>
            <hr>
          </li>

        </ol>
        <p v-else>No rentals found.</p>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api";
import {formatDateTime}  from "@/utils/dateUtils";

export default {
  data() {
    return {
      rentals: [],
      user: {},
    };
  },
  mounted() {
    this.fetchRentalHistory();
  },
  methods: {
    formatDateTime,
    async fetchRentalHistory() {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          // Fetch the user profile to get the user ID
          const profileResponse = await api.get(`/api/user/profile/read/profile`);
          this.user = profileResponse.data;

          // Fetch the rental history using the user ID
          const rentalHistoryResponse = await api.get(`/api/user/profile/${this.user.id}/rental-history`);
          this.rentals = rentalHistoryResponse.data;
        } catch (error) {
          console.error("Error fetching rental history:", error);
        }
      } else {
        console.error("Token not found");
      }
    },
  },
};
</script>

<style scoped>
.rental-history {
  padding: 20px;
}
</style>
