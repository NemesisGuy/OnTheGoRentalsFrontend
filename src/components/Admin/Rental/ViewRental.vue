<template>
  <div class="card-container card-container-admin">
    <div class="form-container">
      <!-- Use Shimmering for the entire card during load -->
      <div v-if="loading" class="rental-profile">
        <ShimmerCard/>
      </div>

      <!-- Error Display -->
      <div v-else-if="error" class="error-container">
        <p>{{ error }}</p>
        <button class="button back-button" @click="goBack">Go Back</button>
      </div>

      <!-- Main Content Display -->
      <div v-else-if="rental" class="rental-profile">
        <div class="form-header">
          <h2><i class="fas fa-file-invoice-dollar"></i> View Rental</h2>
          <p class="sub-header">Rental UUID: {{ rental.uuid }}</p>
        </div>
        <hr/>

        <div class="profile-details">
          <!-- Rental Details -->
          <div class="section">
            <h3>Rental Details</h3>
            <div class="detail-grid">
              <div class="detail-item"><label>Status:</label> <span :class="['status-badge', getStatusClass(rental.status)]">{{ formatStatus(rental.status) }}</span></div>
              <div class="detail-item"><label>Issued Date:</label> <span>{{ formatDateTime(rental.issuedDate) }}</span></div>
              <div class="detail-item"><label>Expected Return:</label> <span>{{ formatDateTime(rental.expectedReturnDate) }}</span></div>
              <div v-if="rental.returnedDate" class="detail-item"><label>Actual Return:</label> <span>{{ formatDateTime(rental.returnedDate) }}</span></div>
              <div class="detail-item"><label>Fine:</label> <span>R{{ rental.fine?.toFixed(2) || '0.00' }}</span></div>
              <div v-if="rental.issuer" class="detail-item"><label>Issued By:</label> <span>{{ rental.issuer}}</span></div>
              <div v-if="rental.receiver" class="detail-item"><label>Received By:</label> <span>{{ rental.receiver }}</span></div>
            </div>
          </div>

          <!-- Customer Details -->
          <div class="section">
            <h3>Customer Details</h3>
            <div class="detail-grid">
              <div class="detail-item"><label>Full Name:</label> <span>{{ rental.user.firstName }} {{ rental.user.lastName }}</span></div>
              <div class="detail-item"><label>Email:</label> <span>{{ rental.user.email }}</span></div>
              <div v-if="rental.driver" class="detail-item"><label>Assigned Driver:</label> <span>{{ rental.driver.firstName }} {{ rental.driver.lastName }}</span></div>
            </div>
          </div>

          <!-- Car Details -->
          <div class="section">
            <h3>Car Details</h3>
            <div class="detail-grid">
              <div class="detail-item"><label>Make & Model:</label> <span>{{ rental.car.make }} {{ rental.car.model }}</span></div>
              <div class="detail-item"><label>Year:</label> <span>{{ rental.car.year }}</span></div>
              <div class="detail-item"><label>License Plate:</label> <span>{{ rental.car.licensePlate }}</span></div>
            </div>
          </div>
        </div>

        <!-- === THE ADDITION IS HERE === -->
        <div class="button-container">
          <!-- This button will only show if the rental is ACTIVE -->
          <button
              v-if="rental.status === 'ACTIVE'"
              @click="navigateToProcessReturn(rental.uuid)"
              class="button process-button"
          >
            <i class="fas fa-check-circle"></i> Process Return
          </button>
          <button class="button back-button" @click="goBack"><i class="fas fa-arrow-left"></i> Back</button>
        </div>
        <!-- === END OF ADDITION === -->
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api";
import { formatDateTime } from '@/utils/dateUtils.js';
import ShimmerCard from "@/components/Main/Loaders/ShimmerCard.vue";

export default {
  name: 'ViewRental',
  components: { ShimmerCard },
  data() {
    return {
      rental: null, // This will hold the entire RentalResponseDTO
      loading: true,
      error: null,
    };
  },
  mounted() {
    this.fetchRentalDetails();
  },
  methods: {
    formatDateTime, // Make function available to the template

    /**
     * REFACTORED: Fetches the complete rental profile in a single API call.
     * The backend should return the RentalResponseDTO with nested User and Car DTOs.
     */
    async fetchRentalDetails() {
      this.loading = true;
      this.error = null;
      const rentalId = this.$route.params.uuid;

      try {
        const response = await api.get(`/api/v1/admin/rentals/${rentalId}`);
        if (response.data?.status === 'success' && response.data.data) {
          this.rental = response.data.data;
          // No need for separate fetchUserProfile or fetchCarProfile calls
        } else {
          this.error = "Rental data could not be loaded or was not found.";
        }
      } catch (err) {
        this.error = err.response?.data?.message || "An error occurred while fetching rental details.";
        console.error("Error fetching rental profile:", err);
      } finally {
        this.loading = false;
      }
    },

    /**
     * **NEW**: Navigates to the component for processing the return.
     * @param {string} rentalUuid - The UUID of the rental to be returned.
     */
    navigateToProcessReturn(rentalUuid) {
      this.$router.push({ name: 'ProcessReturn', params: { uuid: rentalUuid } });
    },

    formatStatus(status) {
      if (!status) return 'N/A';
      return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },

    getStatusClass(status) {
      if (!status) return 'status-unknown';
      return `status-rental-${status.toLowerCase().replace(/_/g, '-')}`;
    },

    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>
/* Using a consistent style across the admin section */

.status-badge {
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.9em;
  font-weight: bold;
  color: #fff;
  text-transform: capitalize;
}
.status-rental-active { background-color: #17a2b8; }
.status-rental-completed { background-color: #6c757d; }
.status-rental-cancelled { background-color: #dc3545; }
.status-unknown { background-color: #adb5bd; }

.process-button {
  background-color: #28a745;
  color: white;
}
.process-button:hover {
  background-color: #218838;
}
</style>