<template>
  <div class="rental-history">
    <h2>Your Rental History</h2>
    <ul v-if="rentals.length">
      <li v-for="rental in rentals" :key="rental.rentalId">
        <h3>Rental ID: {{ rental.rentalId }}</h3>
        <p>Car: {{ rental.car.make }} {{ rental.car.model }}</p>
        <p>Start Date: {{ rental.issuedDate }}</p>
        <p>End Date: {{ rental.returnedDate }}</p>
        <p>Status: {{ rental.returnedDate ? 'Returned' : 'Active' }}</p>
      </li>
    </ul>
    <p v-else>No rentals found.</p>
  </div>
</template>

<script>
import api from "@/api";

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
    async fetchRentalHistory() {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Fetch the user profile to get the user ID
          const profileResponse = await api.get(`/api/user/profile/read/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          this.user = profileResponse.data;

          // Fetch the rental history using the user ID
          const rentalHistoryResponse = await api.get(`/api/user/profile/${this.user.id}/rental-history`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
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
