<template>
  <div class="card-container">
    <div class="form-container">
      <div class="rental-history">
        <div class="form-header">
          <div v-if="loading">
            <h2> Loading Rental History...</h2>
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

        <!-- Optional text fallback -->
        <div v-if="loading" class="loading">Loading...</div>

        <!-- Rental list -->
        <ol v-else-if="rentals.length">
          <li v-for="rental in rentals" :key="rental.rentalId">
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
    };
  },
  mounted() {
    this.fetchRentalHistory();
  },
  methods: {
    formatDateTime,
    async fetchRentalHistory() {
      this.loading = true;
      this.showLoadingModal = true;

      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("Token not found");
        this.loading = false;
        this.showLoadingModal = false;
        return;
      }

      try {
        const profileResponse = await api.get(`/api/v1/users/me/profile`);
        this.user = profileResponse.data.data;
        // console.log(this.user);


        const rentalHistoryResponse = await api.get(`/api/v1/users/me/rental-history`);
        this.rentals = rentalHistoryResponse.data.data;
        // console.log(this.rentals);
      } catch (error) {
        console.error("Error fetching rental history:", error);
      } finally {
        this.loading = false;
        this.showLoadingModal = false;
      }
    },
  },
};
</script>

<style scoped>
.rental-history {
  padding: 20px;
}

.loading {
  font-size: 1.2em;
  color: #666;
  text-align: center;
  margin-top: 20px;
}

/* Optional shimmer placeholder */
.shimmer {
  height: 20px;
  background: linear-gradient(
      90deg,
      #f0f0f0 25%,
      #e0e0e0 37%,
      #f0f0f0 63%
  );
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
  margin-bottom: 10px;
  border-radius: 4px;
}

@keyframes shimmer {
  0% {
    background-position: -400px 0;
  }
  100% {
    background-position: 400px 0;
  }
}
</style>
