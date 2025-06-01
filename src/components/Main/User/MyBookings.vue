<template>
  <div class="card-container">
    <div class="form-container">
      <div class="my-bookings-container">
        <LoadingModal v-if="isLoading" :show="true" message="Fetching your bookings..."/>

        <div class="page-header form-header">
          <h1><i class="fas fa-calendar-alt"></i> My Bookings</h1>
          <p v-if="!isLoading && bookings.length === 0" class="no-bookings-message">
            You currently have no bookings.
            <router-link :to="{ name: 'CarList', params: { pricegroup: 'all' } }">Find a car to rent!</router-link>

          </p>
        </div>

        <div v-if="!isLoading && bookings.length > 0" class="bookings-list">
          <div v-for="booking in sortedBookings" :key="booking.uuid" class="booking-card">
            <div class="booking-card-header">
              <h3>Booking ID: {{ booking.uuid ? booking.uuid.substring(0, 8) : 'N/A' }}...</h3>
              <span :class="['status-badge', getStatusClass(booking.status)]">{{ formatStatus(booking.status) }}</span>
            </div>
            <div class="booking-card-body">
              <div class="booking-details">
                <div v-if="booking.car" class="car-details">
                  <h4><i class="fas fa-car"></i> {{ booking.car.make }} {{ booking.car.model }} ({{ booking.car.year }})
                  </h4>
                  <p><strong>License Plate:</strong> {{ booking.car.licensePlate || 'N/A' }}</p>
                  <p><strong>Price Group:</strong> {{ formatPriceGroup(booking.car.priceGroup) }}</p>
                </div>
                <div v-else class="car-details-missing">
                  <h4><i class="fas fa-car"></i> Car details unavailable</h4>
                </div>
                <hr class="details-divider">
                <p><i class="fas fa-calendar-check"></i> <strong>Collection:</strong>
                  {{ formatDisplayDateTime(booking.bookingStartDate) }}</p>
                <p><i class="fas fa-calendar-times"></i> <strong>Return:</strong>
                  {{ formatDisplayDateTime(booking.bookingEndDate) }}</p>
              </div>
              <div class="booking-actions">
                <button
                    v-if="canCancelBooking(booking.status)"
                    @click="initiateCancelBooking(booking)"
                    class="button cancel-button"
                    :disabled="isCancelling === booking.uuid"
                >
                  <i class="fas fa-times-circle"></i>
                  {{ isCancelling === booking.uuid ? 'Cancelling...' : 'Cancel Booking' }}
                </button>
                <span v-if="!canCancelBooking(booking.status) && !isTerminalStatus(booking.status)"
                      class="action-disabled-note">
                  Cancellation not available
                </span>
                <span v-if="isTerminalStatus(booking.status) && booking.status !== 'USER_CANCELLED' && booking.status !== 'ADMIN_CANCELLED'"
                      class="action-disabled-note">
                  Booking {{ formatStatus(booking.status).toLowerCase() }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <FailureModal
            key="bookingsFailureModal"
            :message="failModal.message"
            :show="failModal.show"
            @close="closeFailModal"
        />
        <SuccessModal
            key="bookingsSuccessModal"
            :message="successModal.message"
            :show="successModal.show"
            @ok="closeSuccessModalAndRefresh"
            @close="closeSuccessModalAndRefresh"
        />
        <ConfirmationModal
            key="cancelConfirmModal"
            :show="showCancelConfirmModal"
            title="Confirm Cancellation"
            @cancel="closeCancelConfirmModal"
            @confirm="confirmCancellation"
        >
          <template #default>
            <p>Are you sure you want to cancel this booking?</p>
            <div v-if="bookingToCancel && bookingToCancel.car">
              <p><strong>Car:</strong> {{ bookingToCancel.car.make }} {{ bookingToCancel.car.model }}</p>
              <p><strong>Collection:</strong> {{ formatDisplayDateTime(bookingToCancel.bookingStartDate) }}</p>
            </div>
            <p class="text-danger">This action cannot be undone easily.</p>
          </template>
        </ConfirmationModal>

      </div>
      <div class="button-container">
        <button class="back-button button" @click="goBack"><i class="fas fa-arrow-left"></i> Back</button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api';
import LoadingModal from '@/components/Main/Modals/LoadingModal.vue';
import FailureModal from '@/components/Main/Modals/FailureModal.vue';
import SuccessModal from '@/components/Main/Modals/SuccessModal.vue';
import ConfirmationModal from '@/components/Main/Modals/ConfirmationModal.vue';
import {formatDateTime} from '@/utils/dateUtils';

export default {
  name: 'MyBookings',
  components: {
    LoadingModal,
    FailureModal,
    SuccessModal,
    ConfirmationModal,
  },
  data() {
    return {
      bookings: [],
      isLoading: false,
      isCancelling: null, // Stores UUID of booking being cancelled
      failModal: {show: false, message: ''},
      successModal: {show: false, message: ''},
      showCancelConfirmModal: false,
      bookingToCancel: null,
      // Define your BookingStatus enum values as strings for comparison, matching the backend
      bookingStatuses: {
        PENDING_CONFIRMATION: 'PENDING_CONFIRMATION',
        CONFIRMED: 'CONFIRMED',
        RENTAL_INITIATED: 'RENTAL_INITIATED',
        USER_CANCELLED: 'USER_CANCELLED',
        ADMIN_CANCELLED: 'ADMIN_CANCELLED',
        REJECTED: 'REJECTED',
        NO_SHOW: 'NO_SHOW',
        FULFILLED: 'FULFILLED' // If you use this
      }
    };
  },
  computed: {
    sortedBookings() {
      return [...this.bookings].sort((a, b) => {
        const dateA = a.bookingStartDate ? new Date(a.bookingStartDate) : 0;
        const dateB = b.bookingStartDate ? new Date(b.bookingStartDate) : 0;
        return dateB - dateA;
      });
    }
  },
  async mounted() {
    await this.fetchUserBookings();
  },
  methods: {
    formatDisplayDateTime(dateTimeString) {
      if (!dateTimeString) return 'N/A';
      return formatDateTime(dateTimeString);
    },
    formatStatus(status) {
      if (!status) return 'Unknown';
      // Converts PENDING_CONFIRMATION to Pending Confirmation
      return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },
    getStatusClass(status) {
      if (!status) return 'status-unknown';
      return `status-${status.toLowerCase().replace(/_/g, '-')}`;
    },
    async fetchUserBookings() {
      this.isLoading = true;
      this.failModal.show = false;
      try {
        const response = await api.get('/api/v1/bookings/my-bookings');
        if (response.data && response.data.status === 'success') {
          this.bookings = response.data.data || [];
        } else if (response.status === 204) {
          this.bookings = [];
        }
        else {
          // Handle cases where status is not 'success' or data is not as expected
          const errorMsg = response.data?.errors?.map(e => e.message).join(', ') || 'Failed to fetch bookings: Unexpected response.';
          console.warn("Fetch bookings warning:", errorMsg, response.data);
          this.bookings = []; // Set to empty on unexpected success structure
        }
        console.log("Fetched user bookings:", this.bookings);
      } catch (error) {
        console.error("Error fetching user bookings:", error.response ? error.response.data : error.message);
        let msg = "Failed to fetch your bookings. Please try again.";
        if(error.response && error.response.data && error.response.data.errors && error.response.data.errors.length > 0){
          msg = error.response.data.errors.map(e => e.message).join(", ");
        } else if (error.response && error.response.data && error.response.data.message) {
          msg = error.response.data.message;
        } else if (error.message){
          msg = error.message;
        }
        this.failModal.message = msg;
        this.failModal.show = true;

        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          this.$router.push({name: 'Login'});
        }
      } finally {
        this.isLoading = false;
      }
    },
    canCancelBooking(status) {
      // User can cancel if booking is CONFIRMED or PENDING_CONFIRMATION
      // (assuming your backend allows cancellation of PENDING_CONFIRMATION)
      return status === this.bookingStatuses.CONFIRMED || status === this.bookingStatuses.PENDING_CONFIRMATION;
    },
    isTerminalStatus(status) {
      // Statuses after which no user actions are typically allowed
      return [
        this.bookingStatuses.RENTAL_INITIATED,
        this.bookingStatuses.USER_CANCELLED,
        this.bookingStatuses.ADMIN_CANCELLED,
        this.bookingStatuses.REJECTED,
        this.bookingStatuses.NO_SHOW,
        this.bookingStatuses.FULFILLED, // if you use this
      ].includes(status);
    },
    initiateCancelBooking(booking) {
      this.bookingToCancel = booking;
      this.showCancelConfirmModal = true;
    },
    closeCancelConfirmModal() {
      this.showCancelConfirmModal = false;
      this.bookingToCancel = null;
    },
    async confirmCancellation() {
      if (!this.bookingToCancel || !this.bookingToCancel.uuid) return;

      this.showCancelConfirmModal = false;
      this.isCancelling = this.bookingToCancel.uuid;
      this.failModal.show = false;

      try {
        await api.post(`/api/v1/bookings/${this.bookingToCancel.uuid}/cancel`);
        // No need to check response.data for DELETE-like POST action if backend returns 200/204 on success
        this.successModal.message = "Booking successfully cancelled!";
        this.successModal.show = true;
        // fetchUserBookings will be called when success modal is closed
      } catch (error) {
        console.error("Error cancelling booking:", error.response ? error.response.data : error.message);
        let msg = "Failed to cancel booking.";
        if(error.response && error.response.data && error.response.data.errors && error.response.data.errors.length > 0){
          msg = error.response.data.errors.map(e => e.message).join(", ");
        } else if (error.response && error.response.data && error.response.data.message) {
          msg = error.response.data.message;
        } else if (error.message){
          msg = error.message;
        }
        this.failModal.message = msg;
        this.failModal.show = true;
      } finally {
        this.isCancelling = null;
        this.bookingToCancel = null;
      }
    },
    closeFailModal() {
      this.failModal.show = false;
    },
    closeSuccessModalAndRefresh() {
      this.successModal.show = false;
      this.fetchUserBookings();
    },
    formatPriceGroup(priceGroup) {
      if (!priceGroup) return 'N/A';
      return priceGroup.charAt(0).toUpperCase() + priceGroup.slice(1).toLowerCase();
    },
    goBack() {
      this.$router.go(-1);
    }
  },
};
</script>

<style scoped>
.my-bookings-container {
  max-width: 900px; /* Or use your global form-container width */
  margin: 20px auto;
  padding: 20px;
  /* font-family: Arial, sans-serif; Inherit from global styles */
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  /* color: #333; Use theme variable */
  margin-bottom: 10px;
}

.page-header h1 i {
  margin-right: 10px;
  color: var(--primary-color); /* Theme color */
}

.no-bookings-message {
  color: var(--color-text-light); /* Use theme variable */
  font-size: 1.1em;
}

.no-bookings-message a {
  color: var(--primary-color); /* Theme color */
  text-decoration: none;
}

.no-bookings-message a:hover {
  text-decoration: underline;
}

.bookings-list {
  display: grid;
  gap: 20px;
}

.booking-card {
  background-color: var(--background-color); /* White or light card background */
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05); /* Softer shadow */
  overflow: hidden;
}

.booking-card-header {
  background-color: #f8f9fa; /* Light grey header for card */
  padding: 12px 18px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.booking-card-header h3 {
  margin: 0;
  font-size: 1.15em;
  color: var(--color-text-dark);
  font-weight: 500;
}

.status-badge {
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.8em; /* Slightly smaller */
  font-weight: bold;
  color: #fff;
  text-transform: capitalize; /* Changed from uppercase */
  letter-spacing: 0.2px;
}

/* NEW BookingStatus CSS classes */
.status-pending-confirmation { background-color: #ffc107; color: #333; } /* Yellow */
.status-confirmed { background-color: #28a745; } /* Green */
.status-rental-initiated { background-color: #17a2b8; } /* Teal/Info */
.status-user-cancelled, .status-admin-cancelled { background-color: #dc3545; } /* Red */
.status-rejected { background-color: #6c757d; } /* Grey */
.status-no-show { background-color: #fd7e14; } /* Orange */
.status-fulfilled { background-color: #007bff; } /* Blue */
.status-unknown { background-color: #adb5bd; }


.booking-card-body {
  padding: 18px;
}

.booking-details .car-details h4 {
  margin-top: 0;
  margin-bottom: 8px;
  color: var(--primary-color);
  font-size: 1.1em;
}

.booking-details .car-details h4 i {
  margin-right: 6px;
}

.booking-details p {
  margin: 6px 0;
  color: var(--color-text-light);
  font-size: 0.9em;
  display: flex;
  align-items: center;
}

.booking-details p i {
  margin-right: 8px;
  color: var(--primary-color);
  width: 18px;
  text-align: center;
}

.details-divider {
  margin: 12px 0;
  border: 0;
  border-top: 1px solid #f0f0f0;
}

.booking-actions {
  margin-top: 18px;
  text-align: right;
}

.button { /* Assuming this is your global button style, or define locally */
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
  margin-left: 10px;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
  /* color: var(--text-color); */ /* Already in global */
  /* background-color: ...; */ /* Set by specific button types */
}
.button:hover {
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.details-button { /* If you add it back */
  background-color: var(--info-color); /* From your global styles */
  color: var(--text-color);
}
.details-button:hover {
  background-color: #1a88d1; /* Darker info */
}

.cancel-button {
  background-color: var(--error-color); /* From your global styles */
  color: var(--text-color);
}
.cancel-button:hover {
  background-color: #c82333; /* Darker error */
}
.cancel-button:disabled {
  background-color: #f5c6cb; /* Lighter red for disabled */
  color: #721c24;
  cursor: not-allowed;
  opacity: 0.7;
}

.action-disabled-note {
  font-size: 0.85em;
  color: #777;
  margin-left: 10px;
  font-style: italic;
}

.text-danger {
  color: var(--error-color) !important;
  font-weight: bold;
}

.back-button { /* Your global back button style */
  background-color: var(--button-back);
  color: var(--color-text-black); /* Or var(--text-color) if bg is dark */
}
.back-button:hover {
  background-color: #5a6268; /* Darker grey */
}

</style>