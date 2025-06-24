<template>
  <div class="content-container">
    <div class="page-header">
      <h1><i class="fas fa-history"></i> Rental History</h1>
      <p>Here you can view your past and current rentals.</p>
    </div>

    <div v-if="loading" class="rentals-list">
      <div v-for="i in 3" :key="i" class="rental-item-shimmer">
        <div class="shimmer shimmer-indicator"></div>
        <div class="shimmer-details">
          <div class="shimmer-header">
            <div class="shimmer shimmer-line" style="width: 40%; height: 20px;"></div>
            <div class="shimmer shimmer-line" style="width: 100px; height: 28px; border-radius: 50px;"></div>
          </div>
          <div class="shimmer-body">
            <div class="shimmer shimmer-line"></div>
            <div class="shimmer shimmer-line" style="width: 80%;"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="rentals.length === 0" class="no-rentals-container">
      <div class="no-rentals-card">
        <i class="fas fa-road empty-icon"></i>
        <h2>Your rental history is empty.</h2>
        <p>You haven't rented any cars with us yet. Let's find your first ride!</p>
        <router-link :to="{ name: 'CarList', params: { pricegroup: 'all' } }" class="button find-car-button">
          <i class="fas fa-search"></i> Find a Car
        </router-link>
      </div>
    </div>

    <div v-else class="rentals-list">
      <div v-for="rental in sortedRentals" :key="rental.uuid" class="rental-wrapper">
        <div class="rental-item">
          <div class="status-indicator" :class="rental.returnedDate ? 'returned' : 'active'">
            <i :class="rental.returnedDate ? 'fas fa-check' : 'fas fa-road'"></i>
          </div>
          <div class="rental-info">
            <div class="info-header">
              <h3 class="car-title">{{ rental.car.make }} {{ rental.car.model }}</h3>
              <span :class="['status-badge', rental.returnedDate ? 'status-returned' : 'status-active']">
                {{ rental.returnedDate ? 'Returned' : 'Active' }}
              </span>
            </div>
            <div class="info-body">
              <div class="detail-item">
                <strong><i class="fas fa-calendar-check"></i> PICKUP DATE</strong>
                <span>{{ formatDateTime(rental.issuedDate) }}</span>
              </div>
              <div class="detail-item">
                <strong><i class="fas fa-calendar-times"></i> RETURN DATE</strong>
                <span>{{ rental.returnedDate ? formatDateTime(rental.returnedDate) : 'Currently Rented' }}</span>
              </div>
            </div>
            <div class="info-footer">
              <span>Rental ID: {{ rental.uuid.substring(0, 8) }}...</span>
              <span>License: {{ rental.car.licensePlate }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="button-container">
      <button class="button back-button" @click="goBack"><i class="fas fa-arrow-left"></i> Back</button>
    </div>
  </div>
</template>

<script>
import api from "@/api";
import { formatDateTime } from "@/utils/dateUtils";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";

export default {
  name: "RentalHistory",
  components: { LoadingModal },
  data() {
    return {
      rentals: [],
      loading: false,
    };
  },
  computed: {
    sortedRentals() {
      return [...this.rentals].sort((a, b) => new Date(b.issuedDate) - new Date(a.issuedDate));
    }
  },
  mounted() {
    this.fetchRentalHistory();
  },
  methods: {
    formatDateTime,
    async fetchRentalHistory() {
      this.loading = true;
      try {
        const response = await api.get(`/api/v1/users/me/rental-history`);
        this.rentals = response.data.data || [];
      } catch (error) {
        console.error("RentalHistory: Error during API call:", error);
        this.rentals = [];
      } finally {
        this.loading = false;
      }
    },
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>
.content-container {
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: auto;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}
.page-header h1 {
  font-weight: 600;
  color: #343a40;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}
.page-header p {
  color: #6c757d;
  font-size: 1.1rem;
}

.no-rentals-container {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}
.no-rentals-card {
  text-align: center;
  padding: 3rem 2rem;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.08);
  max-width: 600px;
}
.empty-icon {
  font-size: 3.5rem;
  color: #007bff;
  margin-bottom: 1.5rem;
}
.no-rentals-card h2 {
  font-weight: 600;
  color: #343a40;
}
.no-rentals-card p {
  color: #6c757d;
  margin-bottom: 1.5rem;
}
.find-car-button {
  background-color: #007bff;
  color: white;
}

/* Responsive Grid */
.rentals-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .rentals-list {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 992px) {
  .rentals-list {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

.rental-wrapper {
  width: 100%;
}

/* Rental Card */
.rental-item {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  display: flex;
  align-items: stretch;
  overflow: hidden;
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 60px;
  color: white;
}
.status-indicator.active { background-color: #28a745; }
.status-indicator.returned { background-color: #6c757d; }
.status-indicator i { font-size: 1.5rem; }

.rental-info {
  padding: 1rem 1.5rem;
  flex-grow: 1;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}
.car-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #343a40;
}
.status-badge {
  padding: 5px 12px;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: bold;
}
.status-active {
  background-color: #e9f7ef;
  color: #28a745;
  border: 1px solid #a3d9b8;
}
.status-returned {
  background-color: #e9ecef;
  color: #495057;
  border: 1px solid #ced4da;
}

.info-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1rem;
}
.detail-item {
  display: flex;
  flex-direction: column;
}
.detail-item strong {
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.detail-item span {
  font-size: 1rem;
  font-weight: 500;
  color: #343a40;
}

.info-footer {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f0f2f5;
  font-size: 0.8rem;
  color: #adb5bd;
  display: flex;
  justify-content: space-between;
}

/* Buttons */
.button-container {
  text-align: center;
  margin-top: 2rem;
}
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  border: 1px solid transparent;
}
.back-button {
  background-color: #6c757d;
  color: white;
}
.back-button:hover {
  background-color: #5a6268;
}

/* Shimmer Loader */
.rental-item-shimmer {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem;
  background-color: #fff;
  border-radius: 12px;
}
.shimmer {
  background-image: linear-gradient(to right, #f0f0f0 8%, #e0e0e0 18%, #f0f0f0 33%);
  background-size: 1200px 100%;
  animation: shimmerAnimation 1.8s infinite linear;
}
.shimmer-indicator {
  width: 60px;
  height: 100px;
  border-radius: 8px;
}
.shimmer-details {
  flex-grow: 1;
}
.shimmer-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}
.shimmer-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.shimmer-line {
  height: 16px;
  border-radius: 4px;
  margin-bottom: 10px;
}
@keyframes shimmerAnimation {
  0% {
    background-position: -1200px 0;
  }
  100% {
    background-position: 1200px 0;
  }
}

@media (max-width: 576px) {
  .info-body {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}



</style>
