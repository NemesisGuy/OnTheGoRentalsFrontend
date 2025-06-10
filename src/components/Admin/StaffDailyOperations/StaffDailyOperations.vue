<template>
  <div class="content-container staff-operations-dashboard">
    <div class="content-header">
      <h1><i class="fas fa-clipboard-list"></i> Daily Operations</h1>
    </div>

    <div class="tabs">
      <button :class="{ active: activeTab === 'collections' }" @click="activeTab = 'collections'">
        <i class="fas fa-car-pickup"></i> Collections Due Today ({{ collectionsDue.length }})
      </button>
      <button :class="{ active: activeTab === 'returns' }" @click="activeTab = 'returns'">
        <i class="fas fa-undo-alt"></i> Returns Due Today ({{ returnsDue.length }})
      </button>
      <button :class="{ active: activeTab === 'overdue' }" @click="activeTab = 'overdue'">
        <i class="fas fa-exclamation-triangle"></i> Overdue Rentals ({{ overdueRentals.length }})
      </button>
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
        <div v-if="collectionsDue.length === 0" class="no-data-subsection">No collections due today.</div>
        <div v-else class="cards-grid">
          <div v-for="booking in collectionsDue" :key="booking.uuid" class="operation-card collection-card">
            <div class="card-header">
              <strong>User:</strong> {{ booking.user?.firstName }} {{ booking.user?.lastName }}
            </div>
            <div class="card-body">
              <p v-if="booking.car"><strong>Car:</strong> {{ booking.car.make }} {{ booking.car.model }}</p>
              <p><strong>Booking UUID:</strong> {{ booking.uuid?.substring(0,8) }}...</p>
              <p><strong>Collection Time:</strong> {{ formatDateTime(booking.bookingStartDate) }}</p>
              <p><strong>Status:</strong> <span :class="['status-badge', getStatusClass(booking.status)]">{{ formatStatus(booking.status) }}</span></p>
            </div>
            <div class="card-actions">
              <!-- *** THE FIX IS HERE *** -->
              <!-- The button now correctly calls navigateToCreateRental -->
              <button
                  @click="navigateToCreateRental(booking.uuid)"
                  class="button process-button"
                  :disabled="booking.status !== 'CONFIRMED'"
                  title="Start Rental Process"
              >
                <i class="fas fa-play-circle"></i> Start Rental
              </button>
              <!-- *** END OF FIX *** -->
            </div>
          </div>
        </div>
      </div>

      <!-- Returns Due Today (Unchanged) -->
      <div v-if="activeTab === 'returns'" class="operation-section">
        <h2>Returns Expected Today</h2>
        <div v-if="returnsDue.length === 0" class="no-data-subsection">No returns due today.</div>
        <div v-else class="cards-grid">
          <div v-for="rental in returnsDue" :key="rental.uuid" class="operation-card return-card">
            <div class="card-header">
              <strong>User:</strong> {{ rental.user?.firstName }} {{ rental.user?.lastName }}
            </div>
            <div class="card-body">
              <p><strong>Car:</strong> {{ rental.car?.make }} {{ rental.car?.model }} ({{rental.car?.licensePlate}})</p>
              <p><strong>Rental UUID:</strong> {{ rental.uuid?.substring(0,8) }}...</p>
              <p><strong>Expected Return:</strong> {{ formatDateTime(rental.expectedReturnDate) }}</p>
              <p><strong>Status:</strong> <span :class="['status-badge', getRentalStatusClass(rental.status)]">{{ formatStatus(rental.status) }}</span></p>
            </div>
            <div class="card-actions">
              <button @click="navigateToCompleteRental(rental.uuid)" class="button process-button"><i class="fas fa-check-circle"></i> Process Return</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Overdue Rentals (Unchanged) -->
      <div v-if="activeTab === 'overdue'" class="operation-section">
        <h2>Overdue Rentals</h2>
        <div v-if="overdueRentals.length === 0" class="no-data-subsection">No overdue rentals. Well done!</div>
        <div v-else class="cards-grid">
          <div v-for="rental in overdueRentals" :key="rental.uuid" class="operation-card overdue-card">
            <div class="card-header">
              <strong>User:</strong> {{ rental.user?.firstName }} {{ rental.user?.lastName }}
            </div>
            <div class="card-body">
              <p><strong>Car:</strong> {{ rental.car?.make }} {{ rental.car?.model }} ({{rental.car?.licensePlate}})</p>
              <p><strong>Rental UUID:</strong> {{ rental.uuid?.substring(0,8) }}...</p>
              <p class="text-danger"><strong>Expected Return:</strong> {{ formatDateTime(rental.expectedReturnDate) }} (Overdue!)</p>
              <p><strong>Status:</strong> <span :class="['status-badge', getRentalStatusClass(rental.status)]">{{ formatStatus(rental.status) }}</span></p>
            </div>
            <div class="card-actions">
              <button @click="viewRentalDetails(rental.uuid)" class="button details-button"><i class="fas fa-eye"></i> View Details</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals (Unchanged) -->
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
  created() {
    const defaultTab = this.$route.query.tab;
    if (defaultTab && ['collections', 'returns', 'overdue'].includes(defaultTab)) {
      this.activeTab = defaultTab;
    }
    this.fetchAllData();
  },
  methods: {
    formatDateTime,
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
      try {
        const [collections, returns, overdues] = await Promise.allSettled([
          api.get('/api/v1/admin/bookings/collections-due-today'),
          api.get('/api/v1/admin/rentals/returns-due-today'),
          api.get('/api/v1/admin/rentals/overdue-rentals')
        ]);

        this.collectionsDue = collections.status === 'fulfilled' ? collections.value.data.data || [] : [];
        this.returnsDue = returns.status === 'fulfilled' ? returns.value.data.data || [] : [];
        this.overdueRentals = overdues.status === 'fulfilled' ? overdues.value.data.data || [] : [];

        if (collections.status === 'rejected' || returns.status === 'rejected' || overdues.status === 'rejected') {
          this.handleFetchError("Failed to load some operational data.");
        }

      } catch (error) {
        this.handleFetchError("An unexpected error occurred while loading data.");
      } finally {
        this.isLoading = false;
      }
    },
    handleFetchError(defaultMessage) {
      this.apiError = true;
      this.errorMessage = defaultMessage;
    },
    navigateToActiveRentals() {
      this.$router.push({ name: 'ActiveRentalsManagement' });
    },
    /**
     * **RESTORED**: This method correctly navigates to the pre-population form.
     * @param {string} bookingUuid - The UUID of the booking to convert into a rental.
     */
    navigateToCreateRental(bookingUuid) {
      // This is the key to your workflow.
      // It navigates to the component responsible for creating a rental from a booking.
      // It passes the bookingUuid as a parameter so the next page knows which booking to load.
      this.$router.push({ name: 'CreateRental', params: { bookingUuid: bookingUuid } });
    },
    navigateToCompleteRental(rentalUuid) {
      this.$router.push({ name: 'ProcessReturn', params: { rentalUuid: rentalUuid } });
    },
    viewRentalDetails(rentalUuid) {
      this.$router.push({ name: 'AdminRentalDetails', params: { uuid: rentalUuid } });
    },
    closeFeedbackModal() {
      this.successModal.show = false;
      this.failModal.show = false;
      this.apiError = false; // Allow user to see partial data if some loaded
    }
  }
};
</script>

<style scoped>
/* All styles remain the same. The change is purely logical. */
.staff-operations-dashboard { padding: 20px; }
.tabs { margin-bottom: 20px; border-bottom: 2px solid #673AB7; }
.tabs button { padding: 10px 15px; cursor: pointer; border: none; background-color: transparent; font-size: 1.05em; margin-right: 5px; border-bottom: 3px solid transparent; color: #333; }
.tabs button.active { border-bottom-color: #E91E63; font-weight: bold; color: #673AB7; }
.tabs button i { margin-right: 8px; }
.navigation-tab { padding: 10px 15px; cursor: pointer; border: none; background-color: transparent; font-size: 1.05em; margin-right: 5px; border-bottom: 3px solid transparent; color: #333; transition: color 0.2s ease, background-color 0.2s ease; }
.navigation-tab:hover { background-color: rgba(103, 58, 183, 0.1); color: #673AB7; }
.operation-section h2 { font-size: 1.5em; color: #673AB7; margin-top: 0; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 20px; }
.operation-card { background-color: #fff; border: 1px solid #e0e0e0; border-radius: 6px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); display: flex; flex-direction: column; transition: box-shadow 0.3s ease; }
.operation-card:hover { box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
.operation-card .card-header { background-color: #f8f9fa; padding: 12px 15px; font-weight: bold; border-bottom: 1px solid #e0e0e0; }
.operation-card .card-body { padding: 15px; flex-grow: 1; font-size: 0.9em; }
.operation-card .card-body p { margin: 6px 0; color: #555; }
.operation-card .card-body strong { color: #333; }
.operation-card .card-actions { padding: 12px 15px; border-top: 1px solid #e0e0e0; text-align: right; background-color: #f8f9fa; }
.no-data-subsection { padding: 25px; text-align: center; color: #777; background-color: #f9f9f9; border-radius: 4px; border: 1px dashed #ddd; font-style: italic; }
.api-error-message { padding: 15px; background-color: #ffdddd; color: #c82333; border: 1px solid #c82333; border-radius: 5px; margin-bottom: 20px; text-align: center; }
.api-error-message i { margin-right: 8px; }
.retry-button { margin-top: 10px; background-color: #673AB7; color: white; }
.status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.8em; font-weight: bold; color: #fff; text-transform: capitalize; }
.status-booking-confirmed { background-color: #28a745; }
.status-rental-active { background-color: #17a2b8; }
.text-danger { color: #dc3545 !important; }
.button.process-button { background-color: #28a745; color: white; }
.button.process-button:hover { background-color: #218838; }
.button.details-button { background-color: #17a2b8; color: white; }
.button.details-button:hover { background-color: #138496; }
.button:disabled { opacity: 0.6; cursor: not-allowed; }
</style>