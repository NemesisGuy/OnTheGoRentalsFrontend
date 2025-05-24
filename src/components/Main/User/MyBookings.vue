<template>
  <div class="card-container">
    <div class="form-container">
      <div class="my-bookings-container">
        <LoadingModal v-if="isLoading" :show="true" message="Fetching your bookings..."/>

        <div class="page-header">
          <h1><i class="fas fa-calendar-alt"></i> My Bookings</h1>
          <p v-if="!isLoading && bookings.length === 0" class="no-bookings-message">
            You currently have no bookings.
            <router-link :to="{ name: 'CarList', params: { category: 'all', available: 'true' } }">Find a car to rent!
            </router-link>
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
                <!-- Add more details as needed, e.g., total cost if available on BookingResponseDTO -->
              </div>
              <div class="booking-actions">
                <!-- <router-link :to="{ name: 'BookingDetails', params: { bookingUuid: booking.uuid } }" class="button details-button">View Details</router-link> -->
                <button
                    v-if="canCancelBooking(booking.status)"
                    @click="initiateCancelBooking(booking)"
                    class="button cancel-button"
                    :disabled="isCancelling === booking.uuid"
                >
                  <i class="fas fa-times-circle"></i>
                  {{ isCancelling === booking.uuid ? 'Cancelling...' : 'Cancel Booking' }}
                </button>
                <span v-if="!canCancelBooking(booking.status) && booking.status !== 'CANCELLED'"
                      class="action-disabled-note">
              Cannot cancel
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
    </div>
  </div>
</template>

<script>
import api from '@/api';
import LoadingModal from '@/components/Main/Modals/LoadingModal.vue';
import FailureModal from '@/components/Main/Modals/FailureModal.vue';
import SuccessModal from '@/components/Main/Modals/SuccessModal.vue';
import ConfirmationModal from '@/components/Main/Modals/ConfirmationModal.vue';
import {formatDateTime} from '@/utils/dateUtils'; // Your existing date formatter

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
    };
  },
  computed: {
    sortedBookings() {
      // Sort bookings, e.g., by start date descending (newest first)
      return [...this.bookings].sort((a, b) => {
        const dateA = new Date(a.bookingStartDate);
        const dateB = new Date(b.bookingStartDate);
        return dateB - dateA; // For descending order
      });
    }
  },
  async mounted() {
    await this.fetchUserBookings();
  },
  methods: {
    formatDisplayDateTime(dateTimeString) { // Wrapper for template
      return formatDateTime(dateTimeString);
    },
    formatStatus(status) {
      if (!status) return 'N/A';
      return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); // PENDING_CONFIRMATION -> Pending Confirmation
    },
    getStatusClass(status) {
      if (!status) return 'status-unknown';
      return `status-${status.toLowerCase().replace(/_/g, '-')}`; // e.g., status-pending-confirmation
    },
    async fetchUserBookings() {
      this.isLoading = true;
      this.failModal.show = false;
      try {
        // The backend controller endpoint is GET /api/bookings/my-bookings
        const response = await api.get('/api/v1/bookings/my-bookings');
        this.bookings = response.data || []; // Ensure it's an array
        console.log("Fetched user bookings:", this.bookings);
      } catch (error) {
        console.error("Error fetching user bookings:", error.response ? error.response.data : error.message);
        this.failModal.message = error.response?.data?.message || "Failed to fetch your bookings. Please try again.";
        this.failModal.show = true;
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          this.$router.push({name: 'Login'}); // Redirect if not authorized
        }
      } finally {
        this.isLoading = false;
      }
    },
    canCancelBooking(status) {
      // Define which statuses allow cancellation based on your backend enum/logic
      // Example: RentalStatus enum might have PENDING_CONFIRMATION, CONFIRMED
      return status === 'PENDING_CONFIRMATION' || status === 'CONFIRMED';
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
      this.isCancelling = this.bookingToCancel.uuid; // Set loading state for this specific booking
      this.failModal.show = false;

      try {
        // Backend controller endpoint is POST /api/bookings/{bookingUuid}/cancel
        const response = await api.post(`/api/bookings/${this.bookingToCancel.uuid}/cancel`);
        console.log("Booking cancellation response:", response.data);
        this.successModal.message = "Booking successfully cancelled!";
        this.successModal.show = true;
        // The fetchUserBookings will be called when success modal closes if needed
      } catch (error) {
        console.error("Error cancelling booking:", error.response ? error.response.data : error.message);
        this.failModal.message = error.response?.data?.message || "Failed to cancel booking.";
        this.failModal.show = true;
      } finally {
        this.isCancelling = null;
        this.bookingToCancel = null; // Clear after attempt
      }
    },
    closeFailModal() {
      this.failModal.show = false;
    },
    closeSuccessModalAndRefresh() {
      this.successModal.show = false;
      this.fetchUserBookings(); // Refresh the list of bookings
    },
    formatPriceGroup(priceGroup) {
      if (!priceGroup) return 'N/A';
      // Assuming priceGroup is an enum string like 'ECONOMY'
      return priceGroup.charAt(0).toUpperCase() + priceGroup.slice(1).toLowerCase();
    }
  },
};
</script>

<style scoped>
.my-bookings-container {
  max-width: 900px;
  margin: 20px auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  color: #333;
  margin-bottom: 10px;
}

.page-header h1 i {
  margin-right: 10px;
  color: #007bff;
}

.no-bookings-message {
  color: #777;
  font-size: 1.1em;
}

.no-bookings-message a {
  color: #007bff;
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
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  overflow: hidden; /* To contain floated elements or absolutely positioned badges */
}

.booking-card-header {
  background-color: #f8f9fa;
  padding: 15px 20px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.booking-card-header h3 {
  margin: 0;
  font-size: 1.2em;
  color: #333;
}

.status-badge {
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.85em;
  font-weight: bold;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Example status colors - align with your RentalStatus enum values */
.status-pending-confirmation {
  background-color: #ffc107;
  color: #333;
}

.status-confirmed {
  background-color: #28a745;
}

.status-in-progress {
  background-color: #17a2b8;
}

.status-completed {
  background-color: #6c757d;
}

.status-cancelled {
  background-color: #dc3545;
}

.status-unknown {
  background-color: #adb5bd;
}


.booking-card-body {
  padding: 20px;
}

.booking-details .car-details h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #007bff;
}

.booking-details .car-details h4 i {
  margin-right: 8px;
}


.booking-details p {
  margin: 8px 0;
  color: #555;
  font-size: 0.95em;
  display: flex;
  align-items: center;
}

.booking-details p i {
  margin-right: 10px;
  color: #007bff;
  width: 20px; /* For icon alignment */
  text-align: center;
}

.details-divider {
  margin: 15px 0;
  border: 0;
  border-top: 1px solid #eee;
}


.booking-actions {
  margin-top: 20px;
  text-align: right;
}

.button {
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
  margin-left: 10px;
  transition: background-color 0.2s ease;
}

.button i {
  margin-right: 5px;
}

.details-button {
  background-color: #007bff;
  color: white;
}

.details-button:hover {
  background-color: #0056b3;
}

.cancel-button {
  background-color: #dc3545;
  color: white;
}

.cancel-button:hover {
  background-color: #c82333;
}

.cancel-button:disabled {
  background-color: #efa2a9;
  cursor: not-allowed;
}

.action-disabled-note {
  font-size: 0.85em;
  color: #777;
  margin-left: 10px;
}

.text-danger { /* For confirmation modal warning */
  color: #dc3545 !important;
  font-weight: bold;
}

</style>