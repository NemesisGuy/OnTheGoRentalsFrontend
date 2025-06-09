<template>
  <div class="content-container staff-operations-dashboard">
    <div class="content-header">
      <h1><i class="fas fa-clipboard-list"></i> Daily Operations</h1>
    </div>

    <div class="tabs">
      <!-- These tabs switch content within this component -->
      <button :class="{ active: activeTab === 'collections' }" @click="activeTab = 'collections'">
        <i class="fas fa-car-pickup"></i> Collections Due Today ({{ collectionsDue.length }})
      </button>
      <button :class="{ active: activeTab === 'returns' }" @click="activeTab = 'returns'">
        <i class="fas fa-undo-alt"></i> Returns Due Today ({{ returnsDue.length }})
      </button>
      <button :class="{ active: activeTab === 'overdue' }" @click="activeTab = 'overdue'">
        <i class="fas fa-exclamation-triangle"></i> Overdue Rentals ({{ overdueRentals.length }})
      </button>

      <!-- NEW: This button navigates to a different component -->
      <button @click="navigateToActiveRentals" class="navigation-tab">
        <i class="fas fa-tasks"></i> Manage Active Rentals
      </button>
    </div>

    <LoadingModal v-if="isLoading" :show="true" :message="loadingMessage" />

    <div v-if="apiError" class="api-error-message">
      <p><i class="fas fa-exclamation-circle"></i> {{ errorMessage || "Failed to load operational data." }}</p>
      <button @click="fetchAllData" class="button retry-button">Retry</button>
    </div>

    <div class="tab-content" v-if="!isLoading && !apiError">
      <!-- Collections Due Today -->
      <div v-if="activeTab === 'collections'" class="operation-section">
        <h2>Pickups Scheduled for Today</h2>
        <div v-if="collectionsDue.length === 0" class="no-data-subsection">
          No collections due today.
        </div>
        <div v-else class="cards-grid">
          <div v-for="booking in collectionsDue" :key="booking.uuid" class="operation-card collection-card">
            <div class="card-header">
              <strong>User:</strong> {{ booking.user ? `${booking.user.firstName} ${booking.user.lastName}` : 'N/A' }}
            </div>
            <div class="card-body">
              <p v-if="booking.car"><strong>Car:</strong> {{ booking.car.make }} {{ booking.car.model }}</p>
              <p><strong>Booking UUID:</strong> {{ booking.uuid ? booking.uuid.substring(0,8) : 'N/A' }}...</p>
              <p><strong>Collection Time:</strong> {{ formatDisplayDateTime(booking.bookingStartDate) }}</p>
              <p><strong>Status:</strong> <span :class="['status-badge', getStatusClass(booking.status)]">{{ formatStatus(booking.status) }}</span></p>
            </div>
            <div class="card-actions">
              <button @click="navigateToCreateRental(booking.uuid)" class="button process-button">
                <i class="fas fa-play-circle"></i> Start Rental
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Returns Due Today -->
      <div v-if="activeTab === 'returns'" class="operation-section">
        <h2>Returns Expected Today</h2>
        <div v-if="returnsDue.length === 0" class="no-data-subsection">
          No returns due today.
        </div>
        <div v-else class="cards-grid">
          <div v-for="rental in returnsDue" :key="rental.uuid" class="operation-card return-card">
            <div class="card-header">
              <strong>User:</strong> {{ rental.user ? `${rental.user.firstName} ${rental.user.lastName}` : 'N/A' }}
            </div>
            <div class="card-body">
              <p v-if="rental.car"><strong>Car:</strong> {{ rental.car.make }} {{ rental.car.model }} ({{rental.car.licensePlate}})</p>
              <p><strong>Rental UUID:</strong> {{ rental.uuid ? rental.uuid.substring(0,8) : 'N/A' }}...</p>
              <p><strong>Expected Return:</strong> {{ formatDisplayDateTime(rental.expectedReturnDate) }}</p>
              <p><strong>Status:</strong> <span :class="['status-badge', getRentalStatusClass(rental.status)]">{{ formatStatus(rental.status) }}</span></p>
            </div>
            <div class="card-actions">
              <button @click="navigateToCompleteRental(rental.uuid)" class="button process-button">
                <i class="fas fa-check-circle"></i> Process Return
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Overdue Rentals -->
      <div v-if="activeTab === 'overdue'" class="operation-section">
        <h2>Overdue Rentals</h2>
        <div v-if="overdueRentals.length === 0" class="no-data-subsection">
          No overdue rentals. Well done!
        </div>
        <div v-else class="cards-grid">
          <div v-for="rental in overdueRentals" :key="rental.uuid" class="operation-card overdue-card">
            <div class="card-header">
              <strong>User:</strong> {{ rental.user ? `${rental.user.firstName} ${rental.user.lastName}` : 'N/A' }}
            </div>
            <div class="card-body">
              <p v-if="rental.car"><strong>Car:</strong> {{ rental.car.make }} {{ rental.car.model }} ({{rental.car.licensePlate}})</p>
              <p><strong>Rental UUID:</strong> {{ rental.uuid ? rental.uuid.substring(0,8) : 'N/A' }}...</p>
              <p class="text-danger"><strong>Expected Return:</strong> {{ formatDisplayDateTime(rental.expectedReturnDate) }} (Overdue!) </p>
              <p><strong>Status:</strong> <span :class="['status-badge', getRentalStatusClass(rental.status)]">{{ formatStatus(rental.status) }}</span></p>
            </div>
            <div class="card-actions">
              <button @click="viewRentalDetails(rental.uuid)" class="button details-button">
                <i class="fas fa-eye"></i> View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <SuccessModal :show="successModal.show" :message="successModal.message" @close="closeFeedbackModal"/>
    <FailureModal :show="failModal.show" :message="failModal.message" @close="closeFeedbackModal"/>
  </div>
</template>

<script>
import api from '@/api';
import LoadingModal from '@/components/Main/Modals/LoadingModal.vue';
import SuccessModal from '@/components/Main/Modals/SuccessModal.vue';
import FailureModal from '@/components/Main/Modals/FailureModal.vue';
import { formatDateTime } from '@/utils/dateUtils';

export default {
  name: 'StaffDailyOperations',
  components: { LoadingModal, SuccessModal, FailureModal },
  data() {
    return {
      // The component no longer needs to track active rentals data
      activeTab: 'collections',
      collectionsDue: [],
      returnsDue: [],
      overdueRentals: [],
      isLoading: false,
      loadingMessage: 'Loading operational data...',
      apiError: false,
      errorMessage: '',
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" },
    };
  },
  async created() {
    await this.fetchAllData();
  },
  methods: {
    // ... (formatDisplayDateTime, formatStatus, getStatusClass methods are unchanged)
    formatDisplayDateTime(dateTimeString) {
      return formatDateTime(dateTimeString);
    },
    formatStatus(status) {
      if (!status) return 'N/A';
      return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },
    getStatusClass(bookingStatus) {
      if (!bookingStatus) return 'status-unknown';
      return `status-booking-${bookingStatus.toLowerCase().replace(/_/g, '-')}`;
    },
    getRentalStatusClass(rentalStatus) {
      if (!rentalStatus) return 'status-unknown';
      return `status-rental-${rentalStatus.toLowerCase().replace(/_/g, '-')}`;
    },
    async fetchAllData() {
      this.isLoading = true;
      this.apiError = false;
      this.errorMessage = '';
      this.loadingMessage = "Fetching all operational data...";
      try {
        // This component is no longer responsible for fetching active rentals
        const results = await Promise.allSettled([
          this.fetchCollectionsDueInternal(),
          this.fetchReturnsDueInternal(),
          this.fetchOverdueRentalsInternal()
        ]);
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            const endpointNames = ["Collections Due", "Returns Due", "Overdue Rentals"];
            console.error(`Error fetching ${endpointNames[index]}:`, result.reason);
          }
        });
      } catch (error) {
        console.error("Unexpected error in fetchAllData:", error);
        this.handleFetchError("An unexpected error occurred while loading data.");
      } finally {
        this.isLoading = false;
      }
    },
    async fetchCollectionsDueInternal() {
      this.loadingMessage = "Fetching collections due...";
      try {
        const response = await api.get('/api/v1/admin/bookings/collections-due-today');
        this.collectionsDue = response.data.data || [];
      } catch (error) {
        this.handleFetchError("Failed to load collections due today.");
        throw error;
      }
    },
    async fetchReturnsDueInternal() {
      this.loadingMessage = "Fetching returns due...";
      try {
        const response = await api.get('/api/v1/admin/rentals/returns-due-today');
        this.returnsDue = response.data.data || [];
      } catch (error) {
        this.handleFetchError("Failed to load rentals due for return today.");
        throw error;
      }
    },
    async fetchOverdueRentalsInternal() {
      this.loadingMessage = "Fetching overdue rentals...";
      try {
        const response = await api.get('/api/v1/admin/rentals/overdue-rentals');
        this.overdueRentals = response.data.data || [];
      } catch (error) {
        this.handleFetchError("Failed to load overdue rentals.");
        throw error;
      }
    },
    handleFetchError(defaultMessage) {
      this.apiError = true;
      if (!this.failModal.show) {
        this.errorMessage = defaultMessage;
        this.failModal.message = this.errorMessage;
        this.failModal.show = true;
      } else {
        console.warn("Additional fetch error:", defaultMessage);
      }
    },
    // NEW: Method to navigate to the dedicated active rentals component
    navigateToActiveRentals() {
      this.$router.push({ name: 'ActiveRentalsManagement' }); // Or whatever you name the route
    },
    navigateToCreateRental(bookingUuid) {
      this.$router.push({ name: 'CreateRental', params: { bookingUuid: bookingUuid } });
    },
    navigateToCompleteRental(rentalUuid) {
      this.$router.push({ name: 'ProcessReturn', params: { uuid: rentalUuid } });
    },
    viewRentalDetails(rentalUuid) {
      this.$router.push({ name: 'ViewRental', params: { uuid: rentalUuid } });
    },
    showSuccessModal(message) {
      this.successModal = { show: true, message: message };
    },
    showFailureModal(message) {
      this.failModal = { show: true, message: message };
    },
    closeFeedbackModal() {
      this.successModal.show = false;
      this.failModal.show = false;
      this.errorMessage = '';
      if (this.apiError && (this.collectionsDue.length > 0 || this.returnsDue.length > 0 || this.overdueRentals.length > 0) ) {
        this.apiError = false;
      }
    }
  }
};
</script>

<style scoped>
/* ... (all previous styles remain the same) ... */

/* NEW STYLE for the navigation button to make it look like other tabs */
.navigation-tab {
  padding: 10px 15px;
  cursor: pointer;
  border: none;
  background-color: transparent;
  font-size: 1.05em;
  margin-right: 5px;
  border-bottom: 3px solid transparent;
  color: var(--bs-gray-400, #fff);
  transition: color 0.2s ease, background-color 0.2s ease;
}

.navigation-tab:hover {
  background-color: rgba(103, 58, 183, 0.1); /* A light hover effect */
  color: var(--primary-color, #673AB7);
}
.staff-operations-dashboard {
  padding: 20px;
}

.tabs {
  margin-bottom: 20px;
  border-bottom: 2px solid var(--primary-color, #673AB7);
}

.tabs button {
  padding: 10px 15px;
  cursor: pointer;
  border: none;
  background-color: transparent;
  font-size: 1.05em;
  margin-right: 5px;
  border-bottom: 3px solid transparent;
  color: var(--bs-gray-400, #fff); /* Text color for tabs */
}

.tabs button.active {
  border-bottom-color: var(--secondary-color, #E91E63);
  font-weight: bold;
  color: var(--bs-gray-100, #673AB7);
}
.tabs button i {
  margin-right: 8px;
}

.operation-section h2 {
  font-size: 1.5em;
  color: var(--primary-color, #673AB7);
  margin-top: 0;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); /* Slightly wider cards */
  gap: 20px;
}

.operation-card {
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.3s ease;
}
.operation-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.operation-card .card-header {
  background-color: #f8f9fa;
  padding: 12px 15px;
  font-weight: bold;
  border-bottom: 1px solid #e0e0e0;
  color: var(--color-text-dark);
}
.operation-card .card-body {
  padding: 15px;
  flex-grow: 1;
  font-size: 0.9em;
}
.operation-card .card-body p {
  margin: 6px 0;
  color: #555;
}
.operation-card .card-body strong {
  color: #333;
}
.operation-card .card-actions {
  padding: 12px 15px;
  border-top: 1px solid #e0e0e0;
  text-align: right;
  background-color: #f8f9fa;
}
.no-data-subsection {
  padding: 25px;
  text-align: center;
  color: #777;
  background-color: #f9f9f9;
  border-radius: 4px;
  border: 1px dashed #ddd;
  font-style: italic;
}

.api-error-message {
  padding: 15px;
  background-color: var(--color-error, #ffdddd);
  color: var(--color-error-dark, #c82333);
  border: 1px solid var(--color-error-dark, #c82333);
  border-radius: 5px;
  margin-bottom: 20px;
  text-align: center;
}
.api-error-message i {
  margin-right: 8px;
}
.retry-button {
  margin-top: 10px;
  background-color: var(--primary-color);
  color: var(--text-color); /* Assuming white text on primary */
}


/* Status badge styling (ensure these match your enums) */
.status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.8em; font-weight: bold; color: #fff; text-transform: capitalize; }
.status-booking-pending-confirmation { background-color: #ffc107; color: #212529;}
.status-booking-confirmed { background-color: #28a745; }
.status-booking-rental-initiated { background-color: #17a2b8; }
.status-booking-user-cancelled, .status-booking-admin-cancelled { background-color: #dc3545; }
.status-booking-rejected { background-color: #6c757d; }
.status-booking-no-show { background-color: #fd7e14; }
.status-booking-fulfilled { background-color: #007bff; }

.status-rental-active { background-color: #17a2b8; }
.status-rental-completed { background-color: #6c757d; }
.status-rental-cancelled { background-color: #dc3545; }
.status-unknown { background-color: #adb5bd;}

.text-danger strong { color: var(--error-color, #dc3545) !important; }

.button.process-button { background-color: var(--button-bg-color); color: var(--text-color); }
.button.process-button:hover { background-color: #3e8e41; /* Darker green */ }
.button.details-button { background-color: var(--info-color); color: var(--text-color); }
.button.details-button:hover { background-color: #1c74b0; /* Darker blue */ }
.button:disabled { opacity: 0.6; cursor: not-allowed; }
</style>